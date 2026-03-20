'use client'
import { useEffect, useCallback, useSyncExternalStore } from 'react'
import { useTunnelStore, useActiveTunnel } from '@/store/tunnels'
import type { ConnectionStatus } from '@/store/tunnels'
import { MCPClient, buildTunnelWSUrl, getDevGateUrl } from '@/lib/mcp'
import type { MCPTool, MCPToolResult, JSONRPCResponse, StreamChunk, ServerNotification } from '@/lib/mcp'

// ============================================================
// Module-level connection manager — completely outside React.
// React only reads from it; never drives connection lifecycle.
// ============================================================

const MAX_BACKOFF_MS = 30_000
const HEARTBEAT_INTERVAL_MS = 30_000
const HEARTBEAT_TIMEOUT_MS = 10_000

// Dev-gate mode: when NEXT_PUBLIC_GATE_URL is set, we connect directly to
// the orchestra web-gate's WebSocket — no tunnel, no JWT, no proxy.
const DEV_GATE_URL = getDevGateUrl()

let _client: MCPClient | null = null
let _tunnelId: string | null = null
let _status: ConnectionStatus = 'disconnected'
let _reconnectTimer: ReturnType<typeof setTimeout> | null = null
let _heartbeatTimer: ReturnType<typeof setInterval> | null = null
let _backoff = 1000
let _reconnectCount = 0
let _wasConnected = false
let _usingDevGate = false
let _activeRequests = 0 // Track in-flight requests to pause heartbeat

// External subscribers (for useSyncExternalStore).
const _listeners = new Set<() => void>()

// Stream chunk subscribers.
type StreamChunkHandler = (chunk: StreamChunk) => void
const _streamListeners = new Set<StreamChunkHandler>()

/** Subscribe to all stream chunks. Returns unsubscribe function. */
export function onStreamChunks(handler: StreamChunkHandler): () => void {
  _streamListeners.add(handler)
  return () => { _streamListeners.delete(handler) }
}

function _handleStreamChunk(chunk: StreamChunk) {
  _streamListeners.forEach(fn => fn(chunk))
}

// Server-push notification subscribers.
type NotificationHandler = (notification: ServerNotification) => void
const _notificationListeners = new Set<NotificationHandler>()

/** Subscribe to server-push notifications (e.g. permission events). Returns unsubscribe function. */
export function onServerNotification(handler: NotificationHandler): () => void {
  _notificationListeners.add(handler)
  return () => { _notificationListeners.delete(handler) }
}

function _handleNotification(notification: ServerNotification) {
  _notificationListeners.forEach(fn => fn(notification))
}
function _notify() { _listeners.forEach(fn => fn()) }

// Toast notification subscribers.
type ToastType = 'disconnect' | 'reconnect' | 'error'
const _toastListeners = new Set<(type: ToastType, message: string) => void>()
function _emitToast(type: ToastType, message: string) {
  _toastListeners.forEach(fn => fn(type, message))
}

/** Subscribe to tunnel toast notifications. Returns unsubscribe function. */
export function onTunnelToast(cb: (type: ToastType, message: string) => void): () => void {
  _toastListeners.add(cb)
  return () => { _toastListeners.delete(cb) }
}

/** Get the current reconnect attempt count. */
export function getReconnectCount(): number { return _reconnectCount }

/** Whether the connection is a direct dev-gate (no tunnel). */
export function isDevGateConnection(): boolean { return _usingDevGate }

function _setStatus(s: ConnectionStatus) {
  if (_status === s) return
  const prev = _status
  _status = s

  if (s === 'disconnected' && _wasConnected) {
    _emitToast('disconnect', 'Disconnected. Reconnecting…')
  }
  if (s === 'connected' && prev !== 'connected') {
    if (_reconnectCount > 0) {
      _emitToast('reconnect', 'Reconnected.')
    }
    _wasConnected = true
    _reconnectCount = 0
    _startHeartbeat()
  }
  if (s === 'disconnected' || s === 'error') {
    _stopHeartbeat()
  }

  _notify()
}

function _clearReconnect() {
  if (_reconnectTimer) { clearTimeout(_reconnectTimer); _reconnectTimer = null }
}

function _startHeartbeat() {
  _stopHeartbeat()
  _heartbeatTimer = setInterval(async () => {
    if (!_client || _status !== 'connected') return
    // Skip heartbeat when there are active requests — the server is busy
    // processing a long-running tool call (e.g. send_message can take 70s+).
    if (_activeRequests > 0) return
    try {
      const pingPromise = _client.ping()
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('heartbeat timeout')), HEARTBEAT_TIMEOUT_MS)
      )
      await Promise.race([pingPromise, timeoutPromise])
    } catch {
      console.warn('[mcp] heartbeat failed, connection may be dead')
      if (_client) {
        const old = _client
        _client = null
        old.disconnect()
      }
    }
  }, HEARTBEAT_INTERVAL_MS)
}

function _stopHeartbeat() {
  if (_heartbeatTimer) { clearInterval(_heartbeatTimer); _heartbeatTimer = null }
}

function _disconnect() {
  _clearReconnect()
  _stopHeartbeat()
  if (_client) {
    const old = _client
    _client = null
    old.disconnect()
  }
  _setStatus('disconnected')
}

function _scheduleReconnect() {
  if (_reconnectTimer) return
  // Must have either dev gate or tunnel to reconnect to.
  if (!_usingDevGate && !_tunnelId) return
  _reconnectCount++
  const delay = _backoff
  _backoff = Math.min(_backoff * 2, MAX_BACKOFF_MS)
  console.log(`[mcp] reconnect #${_reconnectCount} in ${delay}ms`)
  _reconnectTimer = setTimeout(() => {
    _reconnectTimer = null
    _doConnect()
  }, delay)
}

function _doConnect() {
  // Determine URL: dev-gate takes priority over tunnel proxy.
  let url: string | null = null
  if (_usingDevGate && DEV_GATE_URL) {
    url = DEV_GATE_URL
  } else if (_tunnelId) {
    url = buildTunnelWSUrl(_tunnelId)
  }
  if (!url) { _setStatus('disconnected'); return }

  _clearReconnect()
  _stopHeartbeat()
  if (_client) { const old = _client; _client = null; old.disconnect() }

  _setStatus('connecting')

  const client = new MCPClient({
    timeout: 120_000,
    autoInitialize: false,
    onStreamChunk: _handleStreamChunk,
    onNotification: _handleNotification,
    onStatusChange: (status) => {
      if (client !== _client) return
      if (status === 'disconnected' || status === 'error') {
        _client = null
        _setStatus('disconnected')
        _scheduleReconnect()
      }
    },
  })
  _client = client

  client.connect(url)
    .then(async () => {
      if (client !== _client) return
      try {
        await client.initialize()
        if (client !== _client) return
        _backoff = 1000
        _setStatus('connected')
        if (_usingDevGate) {
          console.log('[mcp] connected to dev gate:', url)
        }
      } catch (e) {
        console.error('[mcp] initialize failed:', e)
        if (client === _client) { _client = null; client.disconnect() }
        _scheduleReconnect()
      }
    })
    .catch((e) => {
      console.error('[mcp] connect failed:', e)
      _scheduleReconnect()
    })
}

// ============================================================
// Auto-connect to dev gate on module load (before React renders).
// ============================================================
if (typeof window !== 'undefined' && DEV_GATE_URL) {
  _usingDevGate = true
  // Connect immediately — don't wait for React.
  setTimeout(_doConnect, 100)
}

// ============================================================
// React hook — thin wrapper that syncs tunnel ID and reads status.
// ============================================================

export function useTunnelConnection() {
  const activeTunnel = useActiveTunnel()
  const setConnectionStatus = useTunnelStore(s => s.setConnectionStatus)

  const status = useSyncExternalStore(
    (cb) => { _listeners.add(cb); return () => { _listeners.delete(cb) } },
    () => _status,
    () => 'disconnected' as ConnectionStatus,
  )

  // Sync tunnel ID — but in dev-gate mode, ignore tunnel selection entirely.
  const tunnelId = activeTunnel?.id ?? null
  useEffect(() => {
    if (_usingDevGate) return // dev-gate mode: don't switch to tunnel proxy
    _tunnelId = tunnelId
    _backoff = 1000
    _reconnectCount = 0
    _wasConnected = false
    _disconnect()
    if (tunnelId) _doConnect()
  }, [tunnelId])

  // Mirror status to Zustand so other components can read it.
  useEffect(() => {
    if (tunnelId) setConnectionStatus(tunnelId, status)
  }, [tunnelId, status, setConnectionStatus])

  const sendRequest = useCallback(
    async (method: string, params?: Record<string, unknown>): Promise<JSONRPCResponse> => {
      if (!_client || _status !== 'connected') return Promise.reject(new Error('not connected'))
      _activeRequests++
      try {
        return await _client.request(method, params)
      } finally {
        _activeRequests--
      }
    }, []
  )

  const callTool = useCallback(
    async (name: string, args?: Record<string, unknown>, timeoutMs?: number): Promise<MCPToolResult> => {
      if (!_client || _status !== 'connected') throw new Error('not connected')
      _activeRequests++
      try {
        return await _client.callTool(name, args, timeoutMs)
      } finally {
        _activeRequests--
      }
    }, []
  )

  const callToolStreaming = useCallback(
    async (name: string, args?: Record<string, unknown>, timeoutMs?: number): Promise<MCPToolResult> => {
      if (!_client || _status !== 'connected') throw new Error('not connected')
      _activeRequests++
      try {
        return await _client.callToolStreaming(name, args, timeoutMs)
      } finally {
        _activeRequests--
      }
    }, []
  )

  const listTools = useCallback(async (): Promise<MCPTool[]> => {
    if (!_client || _status !== 'connected') throw new Error('not connected')
    return _client.listTools()
  }, [])

  return { tunnel: activeTunnel, status, sendRequest, callTool, callToolStreaming, listTools }
}
