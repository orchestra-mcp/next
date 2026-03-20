'use client'

import { useState, useCallback } from 'react'
import { useWebSocket } from '@/hooks/useWebSocket'
import type { WSEvent } from '@/hooks/useWebSocket'

export interface FileChangeEvent extends WSEvent {
  file_path: string
  tunnel_id: string
  workspace: string
}

/**
 * Subscribes to real-time file change events from the WebSocket hub.
 * Returns the latest file changes with an optional limit on buffer size.
 */
export function useFileEvents(opts?: { maxEvents?: number; enabled?: boolean }) {
  const maxEvents = opts?.maxEvents ?? 100
  const [events, setEvents] = useState<FileChangeEvent[]>([])

  const handleEvent = useCallback((event: WSEvent) => {
    if (event.type !== 'file_change') return

    const fileEvent = event as unknown as FileChangeEvent
    setEvents(prev => {
      const next = [fileEvent, ...prev]
      return next.length > maxEvents ? next.slice(0, maxEvents) : next
    })
  }, [maxEvents])

  useWebSocket({ onEvent: handleEvent, enabled: opts?.enabled ?? true })

  const clearEvents = useCallback(() => {
    setEvents([])
  }, [])

  return { events, clearEvents }
}
