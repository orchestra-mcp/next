import { createClient } from './client'
import type { RealtimeChannel } from '@supabase/supabase-js'

/**
 * Supabase Realtime subscriptions for live data updates.
 * Replaces the PowerSync offline-first sync layer with
 * server-push Postgres changes via Supabase Realtime.
 */

let channels: RealtimeChannel[] = []

/** Tables that should broadcast changes in realtime. */
const REALTIME_TABLES = [
  'projects',
  'features',
  'workspaces',
  'delegations',
  'notifications',
  'notes',
  'agents',
  'skills',
  'workflows',
  'teams',
  'memberships',
  'community_posts',
  'shares',
  'sessions',
  'badges',
  'user_settings',
] as const

type RealtimeHandler = (payload: {
  table: string
  eventType: 'INSERT' | 'UPDATE' | 'DELETE'
  new: Record<string, unknown>
  old: Record<string, unknown>
}) => void

let handler: RealtimeHandler | null = null

/** Register a handler for all realtime changes (called from store/sync.ts). */
export function onRealtimeChange(fn: RealtimeHandler) {
  handler = fn
}

/** Subscribe to all realtime table changes. Call after auth. */
export function connectRealtime(): void {
  if (channels.length > 0) return // already connected

  const sb = createClient()

  for (const table of REALTIME_TABLES) {
    const channel = sb
      .channel(`public:${table}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table },
        (payload) => {
          handler?.({
            table,
            eventType: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
            new: (payload.new ?? {}) as Record<string, unknown>,
            old: (payload.old ?? {}) as Record<string, unknown>,
          })
        }
      )
      .subscribe()

    channels.push(channel)
  }
}

/** Unsubscribe from all realtime channels. Call on logout. */
export function disconnectRealtime(): void {
  const sb = createClient()
  for (const ch of channels) {
    sb.removeChannel(ch)
  }
  channels = []
}
