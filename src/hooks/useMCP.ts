'use client'
import { useState, useCallback, useRef, useEffect } from 'react'
import { useTunnelConnection, isDevGateConnection } from './useTunnelConnection'
import type { MCPTool, MCPToolResult, MCPPrompt, MCPPromptResult, MCPServerInfo } from '@/lib/mcp'

export interface UseMCPReturn {
  /** Active tunnel info */
  tunnel: ReturnType<typeof useTunnelConnection>['tunnel']
  /** WebSocket connection status */
  status: ReturnType<typeof useTunnelConnection>['status']
  /** Cached list of tools from the tunnel */
  tools: MCPTool[]
  /** Cached list of prompts from the tunnel */
  prompts: MCPPrompt[]
  /** Whether tools/prompts are being loaded */
  loading: boolean
  /** Last error message */
  error: string | null
  /** Call an MCP tool by name */
  callTool: (name: string, args?: Record<string, unknown>, timeoutMs?: number) => Promise<MCPToolResult>
  /** Call an MCP tool with streaming enabled — chunks arrive via onStreamChunks */
  callToolStreaming: (name: string, args?: Record<string, unknown>, timeoutMs?: number) => Promise<MCPToolResult>
  /** Get a prompt by name */
  getPrompt: (name: string, args?: Record<string, string>) => Promise<MCPPromptResult>
  /** Refresh the tools and prompts lists */
  refresh: () => Promise<void>
}

/**
 * High-level React hook for MCP operations through the active tunnel.
 *
 * Provides cached tool/prompt lists that auto-refresh on connection,
 * and callTool/getPrompt methods for invoking MCP operations.
 * Built on top of useTunnelConnection.
 */
export function useMCP(): UseMCPReturn {
  const { tunnel, status, callTool: rawCallTool, callToolStreaming: rawCallToolStreaming, listTools: rawListTools, sendRequest } = useTunnelConnection()

  const [tools, setTools] = useState<MCPTool[]>([])
  const [prompts, setPrompts] = useState<MCPPrompt[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fetchedForRef = useRef<string | null>(null)

  const refresh = useCallback(async () => {
    if (status !== 'connected') return
    setLoading(true)
    setError(null)
    try {
      const [toolsList, promptsRes] = await Promise.all([
        rawListTools(),
        sendRequest('prompts/list').then(r => {
          const result = r.result as { prompts?: MCPPrompt[] } | undefined
          return result?.prompts ?? []
        }).catch(() => [] as MCPPrompt[]),
      ])
      setTools(toolsList)
      setPrompts(promptsRes)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }, [status, rawListTools, sendRequest])

  // Auto-fetch tools/prompts when connection is established.
  // In dev-gate mode there's no tunnel ID — use 'dev-gate' as the key.
  useEffect(() => {
    const connKey = tunnel?.id ?? (isDevGateConnection() ? 'dev-gate' : null)
    if (status === 'connected' && connKey && fetchedForRef.current !== connKey) {
      fetchedForRef.current = connKey
      refresh()
    }
    if (status !== 'connected') {
      fetchedForRef.current = null
    }
  }, [status, tunnel?.id, refresh])

  const callTool = useCallback(
    async (name: string, args?: Record<string, unknown>, timeoutMs?: number): Promise<MCPToolResult> => {
      setError(null)
      try {
        return await rawCallTool(name, args, timeoutMs)
      } catch (e) {
        const msg = (e as Error).message
        setError(msg)
        throw e
      }
    },
    [rawCallTool]
  )

  const callToolStreaming = useCallback(
    async (name: string, args?: Record<string, unknown>, timeoutMs?: number): Promise<MCPToolResult> => {
      setError(null)
      try {
        return await rawCallToolStreaming(name, args, timeoutMs)
      } catch (e) {
        const msg = (e as Error).message
        setError(msg)
        throw e
      }
    },
    [rawCallToolStreaming]
  )

  const getPrompt = useCallback(
    async (name: string, args?: Record<string, string>): Promise<MCPPromptResult> => {
      setError(null)
      try {
        const response = await sendRequest('prompts/get', { name, arguments: args })
        if (response.error) {
          throw new Error(response.error.message)
        }
        return response.result as MCPPromptResult
      } catch (e) {
        const msg = (e as Error).message
        setError(msg)
        throw e
      }
    },
    [sendRequest]
  )

  return {
    tunnel,
    status,
    tools,
    prompts,
    loading,
    error,
    callTool,
    callToolStreaming,
    getPrompt,
    refresh,
  }
}
