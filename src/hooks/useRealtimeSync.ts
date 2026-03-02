'use client'
import { useCallback } from 'react'
import { useWebSocket } from './useWebSocket'
import type { WSEvent } from './useWebSocket'

/**
 * Custom DOM event name used to broadcast sync events to individual pages.
 * Pages can listen with: window.addEventListener('orchestra:sync', handler)
 */
export const SYNC_EVENT_NAME = 'orchestra:sync'

type WSStatus = 'connecting' | 'connected' | 'disconnected'

/**
 * Higher-level hook that connects to the Orchestra WebSocket and dispatches
 * sync events as custom DOM events so individual pages can react to changes
 * without tight coupling.
 *
 * Usage in layout: const { status } = useRealtimeSync()
 * Usage in pages:  window.addEventListener('orchestra:sync', (e) => { ... })
 */
export function useRealtimeSync(): { status: WSStatus } {
  const handleEvent = useCallback((event: WSEvent) => {
    if (event.type !== 'sync') return

    // Dispatch a custom DOM event so any page can listen for relevant changes
    const customEvent = new CustomEvent(SYNC_EVENT_NAME, {
      detail: {
        entity_type: event.entity_type,
        entity_id: event.entity_id,
        action: event.action,
        user_id: event.user_id,
        timestamp: event.timestamp,
      },
    })
    window.dispatchEvent(customEvent)
  }, [])

  const { status } = useWebSocket({ onEvent: handleEvent })

  return { status }
}
