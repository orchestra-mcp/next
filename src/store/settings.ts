'use client'
import { create } from 'zustand'
import * as db from '@/lib/supabase/queries'

export interface Session {
  id: string
  device: string
  device_type: 'desktop' | 'mobile' | 'tablet' | 'unknown'
  ip: string
  location: string
  last_seen: string
  is_current: boolean
}

export interface ApiKey {
  id: string
  name: string
  prefix: string
  created_at: string
  last_used: string | null
  key?: string  // only returned once on creation
}

export interface ConnectedAccount {
  provider: string
  email: string
  name: string
  avatar: string
}

export interface Notification {
  id: number
  title: string
  message: string
  type: 'info' | 'warning' | 'success' | 'error'
  read_at: string | null
  created_at: string
}

interface SettingsState {
  sessions: Session[]
  apiKeys: ApiKey[]
  connectedAccounts: ConnectedAccount[]
  notifications: Notification[]
  loading: boolean
  error: string | null
}

interface SettingsActions {
  fetchSessions: () => Promise<void>
  revokeSession: (id: string) => Promise<void>
  fetchApiKeys: () => Promise<void>
  createApiKey: (name: string) => Promise<ApiKey>
  revokeApiKey: (id: string) => Promise<void>
  fetchConnectedAccounts: () => Promise<void>
  unlinkAccount: (provider: string) => Promise<void>
  fetchNotifications: () => Promise<void>
  markNotificationRead: (id: number) => Promise<void>
  markAllRead: () => Promise<void>
  pushRealtimeNotification: (n: Notification) => void
  clearError: () => void
}

export const useSettingsStore = create<SettingsState & SettingsActions>()((set, get) => ({
  sessions: [],
  apiKeys: [],
  connectedAccounts: [],
  notifications: [],
  loading: false,
  error: null,

  // Sessions — via Supabase PostgREST
  fetchSessions: async () => {
    set({ loading: true, error: null })
    try {
      const items = await db.fetchSessions()
      set({ sessions: items as Session[], loading: false })
    } catch (e) {
      set({ error: (e as Error).message, loading: false })
    }
  },

  revokeSession: async (id) => {
    try {
      await db.deleteSession(id)
      set(s => ({ sessions: s.sessions.filter(x => x.id !== id) }))
    } catch (e) {
      set({ error: (e as Error).message })
      throw e
    }
  },

  // API Keys — via Supabase PostgREST
  fetchApiKeys: async () => {
    set({ loading: true, error: null })
    try {
      const items = await db.fetchApiKeys()
      set({ apiKeys: (items as ApiKey[]).filter(Boolean), loading: false })
    } catch (e) {
      set({ error: (e as Error).message, loading: false })
    }
  },

  createApiKey: async (name) => {
    try {
      const created = await db.createApiKey(name) as ApiKey
      set(s => ({ apiKeys: [created, ...s.apiKeys] }))
      return created
    } catch (e) {
      set({ error: (e as Error).message })
      throw e
    }
  },

  revokeApiKey: async (id) => {
    try {
      await db.deleteApiKey(id)
      set(s => ({ apiKeys: s.apiKeys.filter(k => k.id !== id) }))
    } catch (e) {
      set({ error: (e as Error).message })
      throw e
    }
  },

  // Connected Accounts — via Supabase PostgREST
  fetchConnectedAccounts: async () => {
    set({ loading: true, error: null })
    try {
      const items = await db.fetchConnectedAccounts()
      set({ connectedAccounts: items as ConnectedAccount[], loading: false })
    } catch (e) {
      set({ error: (e as Error).message, loading: false })
    }
  },

  unlinkAccount: async (provider) => {
    try {
      await db.deleteConnectedAccount(provider)
      set(s => ({ connectedAccounts: s.connectedAccounts.filter(a => a.provider !== provider) }))
    } catch (e) {
      set({ error: (e as Error).message })
      throw e
    }
  },

  // Notifications — via Supabase PostgREST
  fetchNotifications: async () => {
    set({ loading: true, error: null })
    try {
      const items = await db.fetchNotifications()
      set({ notifications: items as Notification[], loading: false })
    } catch (e) {
      set({ error: (e as Error).message, loading: false })
    }
  },

  markNotificationRead: async (id) => {
    try {
      await db.markNotificationRead(id)
      set(s => ({
        notifications: s.notifications.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n),
      }))
    } catch (e) {
      set({ error: (e as Error).message })
    }
  },

  markAllRead: async () => {
    const unread = get().notifications.filter(n => !n.read_at)
    await Promise.all(unread.map(n => get().markNotificationRead(n.id)))
  },

  pushRealtimeNotification: (n) => {
    set(s => {
      if (s.notifications.some(x => x.id === n.id)) return s
      return { notifications: [n, ...s.notifications] }
    })
  },

  clearError: () => set({ error: null }),
}))
