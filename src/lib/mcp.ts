/**
 * MCP Client — JSON-RPC 2.0 client for communicating with Orchestra tunnels.
 *
 * This is a framework-agnostic library (no React dependency) that can be used
 * by both React hooks and standalone scripts. It handles:
 * - Request/response tracking with pending promise map
 * - Timeout handling (30s default)
 * - Error parsing (JSON-RPC error codes)
 * - Streaming response handling via callbacks
 * - Connection lifecycle (initialize handshake)
 */

// --- Types ---

export interface MCPTool {
  name: string
  description: string
  inputSchema?: Record<string, unknown>
}

export interface MCPPrompt {
  name: string
  description: string
  arguments?: MCPPromptArgument[]
}

export interface MCPPromptArgument {
  name: string
  description: string
  required: boolean
}

export interface MCPPromptMessage {
  role: string
  content: { type: string; text: string }
}

export interface MCPPromptResult {
  description: string
  messages: MCPPromptMessage[]
}

export interface MCPToolResult {
  content: Array<{ type: string; text: string }>
  isError?: boolean
}

export interface MCPServerInfo {
  protocolVersion: string
  capabilities: {
    tools?: Record<string, unknown>
    prompts?: Record<string, unknown>
  }
  serverInfo: {
    name: string
    version: string
  }
}

export interface JSONRPCRequest {
  jsonrpc: '2.0'
  id: number | string
  method: string
  params?: Record<string, unknown>
}

export interface JSONRPCResponse {
  jsonrpc: '2.0'
  id?: number | string
  result?: unknown
  error?: JSONRPCError
}

export interface JSONRPCError {
  code: number
  message: string
  data?: unknown
}

export interface StreamChunk {
  stream_id: string
  sequence: number
  data: string
}

type PendingRequest = {
  resolve: (value: JSONRPCResponse) => void
  reject: (reason: Error) => void
  timeout: ReturnType<typeof setTimeout>
}

export type MCPClientStatus = 'disconnected' | 'connecting' | 'connected' | 'error'

/** Server-push notification from web-gate (e.g. permission events). */
export interface ServerNotification {
  method: string
  params: unknown
}

export interface MCPClientOptions {
  /** Request timeout in milliseconds. Default: 30000 */
  timeout?: number
  /** Called when connection status changes */
  onStatusChange?: (status: MCPClientStatus) => void
  /** Called when a stream chunk is received (for streaming tool calls) */
  onStreamChunk?: (chunk: StreamChunk) => void
  /** Called when a server-push notification is received */
  onNotification?: (notification: ServerNotification) => void
  /** Auto-initialize the MCP session on connect. Default: true */
  autoInitialize?: boolean
}

// --- MCP Client ---

export class MCPClient {
  private ws: WebSocket | null = null
  private pending = new Map<number | string, PendingRequest>()
  private nextId = 1
  private status: MCPClientStatus = 'disconnected'
  private options: Required<MCPClientOptions>
  private serverInfo: MCPServerInfo | null = null

  constructor(options?: MCPClientOptions) {
    this.options = {
      timeout: options?.timeout ?? 30_000,
      onStatusChange: options?.onStatusChange ?? (() => {}),
      onStreamChunk: options?.onStreamChunk ?? (() => {}),
      onNotification: options?.onNotification ?? (() => {}),
      autoInitialize: options?.autoInitialize ?? true,
    }
  }

  /** Connect to a tunnel's WebSocket proxy endpoint. */
  async connect(url: string): Promise<MCPServerInfo | null> {
    // Clean up any existing connection WITHOUT firing onStatusChange('disconnected').
    // Calling this.disconnect() here would fire the callback, which makes the
    // connection manager think we disconnected and schedule a reconnect before
    // the new WebSocket even opens.
    if (this.ws) {
      this.ws.onopen = null
      this.ws.onmessage = null
      this.ws.onclose = null
      this.ws.onerror = null
      this.ws.close()
      this.ws = null
    }
    this.rejectAllPending('reconnecting')
    this.serverInfo = null
    this.setStatus('connecting')

    return new Promise((resolve, reject) => {
      const ws = new WebSocket(url)
      this.ws = ws

      ws.onopen = async () => {
        this.setStatus('connected')
        if (this.options.autoInitialize) {
          try {
            const info = await this.initialize()
            resolve(info)
          } catch (e) {
            reject(e)
          }
        } else {
          resolve(null)
        }
      }

      ws.onmessage = (event) => {
        this.handleMessage(event.data)
      }

      ws.onclose = () => {
        this.setStatus('disconnected')
        this.rejectAllPending('connection closed')
      }

      ws.onerror = () => {
        this.setStatus('error')
        reject(new Error('WebSocket connection failed'))
      }
    })
  }

  /** Disconnect from the tunnel. */
  disconnect() {
    if (this.ws) {
      this.ws.onopen = null
      this.ws.onmessage = null
      this.ws.onclose = null
      this.ws.onerror = null
      this.ws.close()
      this.ws = null
    }
    this.rejectAllPending('disconnected')
    this.setStatus('disconnected')
    this.serverInfo = null
  }

  /** Get the current connection status. */
  getStatus(): MCPClientStatus {
    return this.status
  }

  /** Get the server info from the initialize handshake. */
  getServerInfo(): MCPServerInfo | null {
    return this.serverInfo
  }

  /** Whether the WebSocket is connected and ready. */
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN
  }

  // --- MCP Protocol Methods ---

  /** Send the MCP initialize handshake. */
  async initialize(): Promise<MCPServerInfo> {
    const response = await this.request('initialize', {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: { name: 'orchestra-web', version: '1.0.0' },
    })
    this.serverInfo = response.result as MCPServerInfo
    return this.serverInfo
  }

  /** List all MCP tools available on the tunnel. */
  async listTools(): Promise<MCPTool[]> {
    const response = await this.request('tools/list')
    const result = response.result as { tools: MCPTool[] }
    return result.tools ?? []
  }

  /** Call an MCP tool by name with optional arguments. */
  async callTool(name: string, args?: Record<string, unknown>, timeoutMs?: number): Promise<MCPToolResult> {
    const response = await this.request('tools/call', {
      name,
      arguments: args,
    }, timeoutMs)
    if (response.error) {
      throw new MCPError(response.error.code, response.error.message, response.error.data)
    }
    return response.result as MCPToolResult
  }

  /** Call an MCP tool with streaming enabled. Stream chunks arrive via onStreamChunk callback. */
  async callToolStreaming(name: string, args?: Record<string, unknown>, timeoutMs?: number): Promise<MCPToolResult> {
    const response = await this.request('tools/call', {
      name,
      arguments: args,
      streaming: true,
    }, timeoutMs)
    if (response.error) {
      throw new MCPError(response.error.code, response.error.message, response.error.data)
    }
    return response.result as MCPToolResult
  }

  /** List all MCP prompts available on the tunnel. */
  async listPrompts(): Promise<MCPPrompt[]> {
    const response = await this.request('prompts/list')
    const result = response.result as { prompts: MCPPrompt[] }
    return result.prompts ?? []
  }

  /** Get a prompt by name with optional arguments. */
  async getPrompt(name: string, args?: Record<string, string>): Promise<MCPPromptResult> {
    const response = await this.request('prompts/get', {
      name,
      arguments: args,
    })
    if (response.error) {
      throw new MCPError(response.error.code, response.error.message, response.error.data)
    }
    return response.result as MCPPromptResult
  }

  /** Send a ping and wait for the response. */
  async ping(): Promise<void> {
    await this.request('ping')
  }

  // --- Low-level ---

  /** Send a raw JSON-RPC request and return the response. */
  async request(method: string, params?: Record<string, unknown>, timeoutMs?: number): Promise<JSONRPCResponse> {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('not connected')
    }

    const id = this.nextId++
    const request: JSONRPCRequest = { jsonrpc: '2.0', id, method }
    if (params) request.params = params

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pending.delete(id)
        reject(new Error(`request timeout: ${method}`))
      }, timeoutMs ?? this.options.timeout)

      this.pending.set(id, { resolve, reject, timeout })
      this.ws!.send(JSON.stringify(request))
    })
  }

  /** Send a JSON-RPC notification (no response expected). */
  notify(method: string, params?: Record<string, unknown>) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return
    const notification = { jsonrpc: '2.0', method, params }
    this.ws.send(JSON.stringify(notification))
  }

  // --- Internal ---

  private handleMessage(data: string) {
    try {
      const msg = JSON.parse(data) as JSONRPCResponse

      // Stream chunk (notification with no id but has stream_id in result).
      if (!msg.id && msg.result && typeof msg.result === 'object') {
        const result = msg.result as Record<string, unknown>
        if ('stream_id' in result && 'data' in result) {
          this.options.onStreamChunk({
            stream_id: result.stream_id as string,
            sequence: (result.sequence as number) ?? 0,
            data: result.data as string,
          })
          return
        }
        // Server-push notification (e.g. permission events from web-gate poller).
        if ('method' in result && 'params' in result) {
          this.options.onNotification({
            method: result.method as string,
            params: result.params,
          })
          return
        }
      }

      // Regular response with id.
      if (msg.id != null) {
        const pending = this.pending.get(msg.id)
        if (pending) {
          clearTimeout(pending.timeout)
          this.pending.delete(msg.id)
          pending.resolve(msg)
        }
      }
    } catch {
      // Ignore malformed messages.
    }
  }

  private setStatus(status: MCPClientStatus) {
    this.status = status
    this.options.onStatusChange(status)
  }

  private rejectAllPending(reason: string) {
    for (const [, pending] of this.pending) {
      clearTimeout(pending.timeout)
      pending.reject(new Error(reason))
    }
    this.pending.clear()
  }
}

// --- Error class ---

export class MCPError extends Error {
  code: number
  data?: unknown

  constructor(code: number, message: string, data?: unknown) {
    super(message)
    this.name = 'MCPError'
    this.code = code
    this.data = data
  }
}

// --- Helper: build WebSocket URL ---

/**
 * Get the dev gate URL. In dev mode (NEXT_PUBLIC_GATE_URL set), the frontend
 * connects directly to the orchestra web-gate's WebSocket endpoint — no tunnel
 * registration or JWT auth needed. This makes `make dev` work out of the box.
 */
export function getDevGateUrl(): string | null {
  return process.env.NEXT_PUBLIC_GATE_URL || null
}

/**
 * Build the WebSocket URL for a tunnel connection.
 *
 * Uses NEXT_PUBLIC_API_URL from .env to determine the server.
 * In dev (.env.local):  NEXT_PUBLIC_API_URL=http://localhost:8080  → ws://localhost:8080
 * In prod (.env.production): NEXT_PUBLIC_API_URL=https://orchestra-mcp.dev → wss://orchestra-mcp.dev
 * Fallback: uses current page origin.
 */
export function buildTunnelWSUrl(tunnelId: string): string | null {
  if (typeof window === 'undefined') return null

  const token = localStorage.getItem('orchestra_token')
  if (!token || token === 'dev_seed_token') return null

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || ''
  let base: string
  if (apiUrl) {
    base = apiUrl.replace(/^https:\/\//, 'wss://').replace(/^http:\/\//, 'ws://')
  } else {
    // Fallback: derive from current page origin.
    const wsProto = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    base = `${wsProto}//${window.location.host}`
  }

  return `${base}/api/tunnels/${tunnelId}/ws?token=${encodeURIComponent(token)}`
}
