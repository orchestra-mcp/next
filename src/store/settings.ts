'use client'
import { create } from 'zustand'
import { apiFetch } from '@/lib/api'

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

  fetchSessions: async () => {
    set({ loading: true, error: null })
    try {
      const res = await apiFetch<{ sessions: Session[] }>('/api/settings/sessions')
      set({ sessions: res.sessions, loading: false })
    } catch (e) {
      if ((e as any).devSeed) { set({ loading: false }); return }
      set({ error: (e as Error).message, loading: false })
    }
  },

  revokeSession: async (id) => {
    try {
      await apiFetch(`/api/settings/sessions/${id}`, { method: 'DELETE' })
      set(s => ({ sessions: s.sessions.filter(x => x.id !== id) }))
    } catch (e) {
      if ((e as any).devSeed) return
      set({ error: (e as Error).message })
      throw e
    }
  },

  fetchApiKeys: async () => {
    set({ loading: true, error: null })
    try {
      const res = await apiFetch<{ api_keys: ApiKey[] }>('/api/settings/api-keys')
      set({ apiKeys: (res.api_keys ?? []).filter(Boolean), loading: false })
    } catch (e) {
      if ((e as any).devSeed) { set({ loading: false }); return }
      set({ error: (e as Error).message, loading: false })
    }
  },

  createApiKey: async (name) => {
    try {
      const res = await apiFetch<{ ok: boolean; token: string; key: ApiKey }>('/api/settings/api-keys', {
        method: 'POST',
        body: JSON.stringify({ name }),
      })
      const created: ApiKey = { ...res.key, key: res.token }
      set(s => ({ apiKeys: [created, ...s.apiKeys] }))
      return created
    } catch (e) {
      if ((e as any).devSeed) throw e
      set({ error: (e as Error).message })
      throw e
    }
  },

  revokeApiKey: async (id) => {
    try {
      await apiFetch(`/api/settings/api-keys/${id}`, { method: 'DELETE' })
      set(s => ({ apiKeys: s.apiKeys.filter(k => k.id !== id) }))
    } catch (e) {
      if ((e as any).devSeed) return
      set({ error: (e as Error).message })
      throw e
    }
  },

  fetchConnectedAccounts: async () => {
    set({ loading: true, error: null })
    try {
      const res = await apiFetch<{ accounts: ConnectedAccount[] }>('/api/settings/connected-accounts')
      set({ connectedAccounts: res.accounts, loading: false })
    } catch (e) {
      if ((e as any).devSeed) { set({ loading: false }); return }
      set({ error: (e as Error).message, loading: false })
    }
  },

  unlinkAccount: async (provider) => {
    try {
      await apiFetch(`/api/settings/connected-accounts/${provider}`, { method: 'DELETE' })
      set(s => ({ connectedAccounts: s.connectedAccounts.filter(a => a.provider !== provider) }))
    } catch (e) {
      if ((e as any).devSeed) return
      set({ error: (e as Error).message })
      throw e
    }
  },

  fetchNotifications: async () => {
    set({ loading: true, error: null })
    try {
      const res = await apiFetch<{ notifications: Notification[] }>('/api/notifications')
      set({ notifications: res.notifications, loading: false })
    } catch (e) {
      if ((e as any).devSeed) { set({ loading: false }); return }
      set({ error: (e as Error).message, loading: false })
    }
  },

  markNotificationRead: async (id) => {
    try {
      await apiFetch(`/api/notifications/${id}/read`, { method: 'PATCH' })
      set(s => ({
        notifications: s.notifications.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n),
      }))
    } catch (e) {
      if ((e as any).devSeed) return
      set({ error: (e as Error).message })
    }
  },

  markAllRead: async () => {
    const unread = get().notifications.filter(n => !n.read_at)
    await Promise.all(unread.map(n => get().markNotificationRead(n.id)))
  },

  pushRealtimeNotification: (n) => {
    set(s => {
      // Avoid duplicates (in case fetch already picked it up)
      if (s.notifications.some(x => x.id === n.id)) return s
      return { notifications: [n, ...s.notifications] }
    })
  },

  clearError: () => set({ error: null }),
}))
