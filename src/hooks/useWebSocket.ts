'use client'
import { useEffect, useRef, useState } from 'react'

/**
 * WebSocket hook for tunnel-specific events from the Go gateway.
 *
 * Data events (notifications, feature_update, project_update) are now
 * handled by Supabase Realtime subscriptions (see lib/supabase/realtime.ts).
 * This hook is only needed for tunnel_activity and other gateway-specific events.
 */

export interface WSEvent {
  type: string
  entity_type: string
  entity_id: string
  action: string
  user_id: number
  timestamp: number
}

type WSStatus = 'connecting' | 'connected' | 'disconnected'

interface UseWebSocketOptions {
  onEvent?: (event: WSEvent) => void
  enabled?: boolean
}

function getWSUrl(): string | null {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || ''

  if (apiUrl) {
    const wsUrl = apiUrl
      .replace(/^https:\/\//, 'wss://')
      .replace(/^http:\/\//, 'ws://')
    return `${wsUrl}/api/ws`
  }

  if (typeof window === 'undefined') return null
  const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  return `${proto}//${window.location.host}/api/ws`
}

const MAX_BACKOFF_MS = 30_000
const PING_INTERVAL_MS = 30_000

export function useWebSocket(options?: UseWebSocketOptions): { status: WSStatus } {
  const { onEvent, enabled = true } = options ?? {}
  const [status, setStatus] = useState<WSStatus>('disconnected')

  const onEventRef = useRef(onEvent)
  onEventRef.current = onEvent

  const enabledRef = useRef(enabled)
  enabledRef.current = enabled

  useEffect(() => {
    let ws: WebSocket | null = null
    let reconnectTimeout: ReturnType<typeof setTimeout> | null = null
    let pingInterval: ReturnType<typeof setInterval> | null = null
    let backoff = 1000
    let stopped = false

    function cleanup() {
      stopped = true
      if (reconnectTimeout) { clearTimeout(reconnectTimeout); reconnectTimeout = null }
      if (pingInterval) { clearInterval(pingInterval); pingInterval = null }
      if (ws) {
        ws.onopen = null
        ws.onclose = null
        ws.onerror = null
        ws.onmessage = null
        // Only close if already open — closing a CONNECTING socket triggers the
        // "WebSocket is closed before the connection is established" warning.
        if (ws.readyState !== WebSocket.CONNECTING) {
          ws.close()
        }
        ws = null
      }
    }

    function connect() {
      if (stopped) return

      let token: string | null = null
      if (typeof window !== 'undefined') {
        try { const s = JSON.parse(localStorage.getItem('orchestra-auth') ?? '{}'); token = s?.state?.mcpToken ?? null } catch {}
      }

      if (!token || token === 'dev_seed_token' || !enabledRef.current) {
        setStatus('disconnected')
        return
      }

      const baseUrl = getWSUrl()
      if (!baseUrl) return

      setStatus('connecting')
      ws = new WebSocket(`${baseUrl}?token=${encodeURIComponent(token)}`)

      ws.onopen = () => {
        if (stopped) return
        setStatus('connected')
        backoff = 1000

        pingInterval = setInterval(() => {
          if (ws?.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'ping' }))
          }
        }, PING_INTERVAL_MS)
      }

      ws.onmessage = (event) => {
        if (stopped) return
        try {
          const data = JSON.parse(event.data) as WSEvent
          if (data.type === 'pong') return
          onEventRef.current?.(data)
        } catch {
          // Ignore malformed messages
        }
      }

      ws.onclose = () => {
        if (stopped) return
        setStatus('disconnected')

        if (pingInterval) { clearInterval(pingInterval); pingInterval = null }

        const delay = backoff
        backoff = Math.min(backoff * 2, MAX_BACKOFF_MS)
        reconnectTimeout = setTimeout(connect, delay)
      }

      ws.onerror = () => {
        // onclose fires after onerror — reconnection handled there
      }
    }

    connect()
    return cleanup
    // Single effect — no deps that change. Token/enabled changes require a page reload.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { status }
}
