'use client'
import { useCallback } from 'react'
import { useWebSocket } from './useWebSocket'
import type { WSEvent } from './useWebSocket'
import { useSettingsStore } from '@/store/settings'
import { useFeaturesStore } from '@/store/features'
import { useProjectStore } from '@/store/projects'
import { useSyncStore } from '@/store/sync'

/**
 * Custom DOM event name used to broadcast sync events to individual pages.
 * Pages can listen with: window.addEventListener('orchestra:sync', handler)
 */
export const SYNC_EVENT_NAME = 'orchestra:sync'

type WSStatus = 'connecting' | 'connected' | 'disconnected'

// ── Notification toast emitter (module-level, outside React) ──
export interface NotifToast {
  title: string
  message: string
  ntype: string // info | success | warning | error
}

const _notifToastListeners = new Set<(toast: NotifToast) => void>()

function emitNotifToast(toast: NotifToast) {
  _notifToastListeners.forEach(fn => fn(toast))
}

/** Subscribe to realtime notification toasts. Returns unsubscribe function. */
export function onNotifToast(cb: (toast: NotifToast) => void): () => void {
  _notifToastListeners.add(cb)
  return () => { _notifToastListeners.delete(cb) }
}

/**
 * Higher-level hook that connects to the Orchestra WebSocket and dispatches
 * sync events as custom DOM events so individual pages can react to changes
 * without tight coupling.
 *
 * Usage in layout: const { status } = useRealtimeSync()
 * Usage in pages:  window.addEventListener('orchestra:sync', (e) => { ... })
 */
export function useRealtimeSync(): { status: WSStatus } {
  const pushRealtimeNotification = useSettingsStore(s => s.pushRealtimeNotification)

  const handleEvent = useCallback((event: WSEvent) => {
    // Push all events to the sync store for the activity feed
    useSyncStore.getState().handleSyncEvent(event as any)

    // Handle realtime notification events
    if (event.type === 'notification' && event.entity_type === 'notification') {
      const title = (event as any).title ?? ''
      const message = (event as any).message ?? ''
      const ntype = (event as any).ntype ?? 'info'

      pushRealtimeNotification({
        id: parseInt(event.entity_id, 10),
        title,
        message,
        type: ntype,
        read_at: null,
        created_at: new Date(event.timestamp).toISOString(),
      })

      // Fire in-app toast
      emitNotifToast({ title, message, ntype })

      // Fire browser push notification if permission granted
      if (typeof window !== 'undefined' && 'Notification' in window && window.Notification.permission === 'granted') {
        new window.Notification(title || 'New notification', {
          body: message,
          icon: '/favicon.png',
        })
      }
      return
    }

    // Handle feature update events
    if (event.type === 'feature_update') {
      useFeaturesStore.getState().handleRemoteUpdate(event.entity_id, (event as any).payload ?? {})
      return
    }

    // Handle project update events
    if (event.type === 'project_update') {
      useProjectStore.getState().handleRemoteUpdate(event.entity_id, (event as any).payload ?? {})
      return
    }

    // Handle tunnel activity events
    if (event.type === 'tunnel_activity') {
      useSyncStore.getState().handleSyncEvent(event as any)
      return
    }

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
  }, [pushRealtimeNotification])

  const { status } = useWebSocket({ onEvent: handleEvent })

  return { status }
}
