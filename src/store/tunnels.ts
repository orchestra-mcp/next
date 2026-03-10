'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { apiFetch } from '@/lib/api'

export interface Tunnel {
  id: string
  user_id: number
  team_id?: string
  name: string
  hostname: string
  os: string
  architecture: string
  gate_address: string
  status: 'online' | 'offline' | 'connecting'
  last_seen_at?: string
  labels: string[]
  meta: Record<string, unknown>
  version: string
  tool_count: number
  local_ip?: string
  created_at: string
  updated_at: string
}

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error'

interface TunnelState {
  tunnels: Tunnel[]
  activeTunnelId: string | null
  connectionStatus: Record<string, ConnectionStatus>
  loading: boolean
  error: string | null
}

interface TunnelActions {
  fetchTunnels: () => Promise<void>
  registerTunnel: (token: string, name?: string) => Promise<Tunnel>
  removeTunnel: (id: string) => Promise<void>
  selectTunnel: (id: string | null) => void
  updateTunnel: (id: string, data: { name?: string; labels?: string[] }) => Promise<void>
  getTunnelStatus: (id: string) => Promise<void>
  setConnectionStatus: (id: string, status: ConnectionStatus) => void
  clearError: () => void
}

export const useTunnelStore = create<TunnelState & TunnelActions>()(
  persist(
    (set, get) => ({
      tunnels: [],
      activeTunnelId: null,
      connectionStatus: {},
      loading: false,
      error: null,

      fetchTunnels: async () => {
        set({ loading: true, error: null })
        try {
          const tunnels = await apiFetch<Tunnel[]>('/api/tunnels')
          const connectionStatus = { ...get().connectionStatus }
          for (const t of tunnels) {
            if (!connectionStatus[t.id]) {
              connectionStatus[t.id] = 'disconnected'
            }
          }
          set({ tunnels, connectionStatus, loading: false })

          // If active tunnel was removed or doesn't exist, clear it.
          const { activeTunnelId } = get()
          if (activeTunnelId && !tunnels.find(t => t.id === activeTunnelId)) {
            set({ activeTunnelId: tunnels.length > 0 ? tunnels[0].id : null })
          }
        } catch (e) {
          set({ error: (e as Error).message, loading: false })
        }
      },

      registerTunnel: async (token: string, name?: string) => {
        set({ loading: true, error: null })
        try {
          const res = await apiFetch<{ tunnel: Tunnel; connection_token: string }>(
            '/api/tunnels/register',
            {
              method: 'POST',
              body: JSON.stringify({ token, name }),
            }
          )
          const tunnel = res.tunnel
          set(state => ({
            tunnels: [tunnel, ...state.tunnels],
            activeTunnelId: state.activeTunnelId ?? tunnel.id,
            connectionStatus: { ...state.connectionStatus, [tunnel.id]: 'disconnected' },
            loading: false,
          }))
          return tunnel
        } catch (e) {
          set({ error: (e as Error).message, loading: false })
          throw e
        }
      },

      removeTunnel: async (id: string) => {
        try {
          await apiFetch(`/api/tunnels/${id}`, { method: 'DELETE' })
          set(state => {
            const tunnels = state.tunnels.filter(t => t.id !== id)
            const connectionStatus = { ...state.connectionStatus }
            delete connectionStatus[id]
            const activeTunnelId = state.activeTunnelId === id
              ? (tunnels.length > 0 ? tunnels[0].id : null)
              : state.activeTunnelId
            return { tunnels, connectionStatus, activeTunnelId }
          })
        } catch (e) {
          set({ error: (e as Error).message })
        }
      },

      selectTunnel: (id: string | null) => {
        set({ activeTunnelId: id })
      },

      updateTunnel: async (id: string, data: { name?: string; labels?: string[] }) => {
        try {
          const updated = await apiFetch<Tunnel>(`/api/tunnels/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
          })
          set(state => ({
            tunnels: state.tunnels.map(t => t.id === id ? updated : t),
          }))
        } catch (e) {
          set({ error: (e as Error).message })
        }
      },

      getTunnelStatus: async (id: string) => {
        try {
          const res = await apiFetch<{
            tunnel_id: string
            status: Tunnel['status']
            healthy: boolean
            health: Record<string, unknown>
          }>(`/api/tunnels/${id}/status`)
          set(state => ({
            tunnels: state.tunnels.map(t =>
              t.id === id ? { ...t, status: res.status } : t
            ),
          }))
        } catch (e) {
          set({ error: (e as Error).message })
        }
      },

      setConnectionStatus: (id: string, status: ConnectionStatus) => {
        set(state => ({
          connectionStatus: { ...state.connectionStatus, [id]: status },
        }))
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'orchestra-tunnels',
      partialize: (state) => ({
        activeTunnelId: state.activeTunnelId,
      }),
    }
  )
)

// Selector for the active tunnel object.
export const useActiveTunnel = () =>
  useTunnelStore(state =>
    state.tunnels.find(t => t.id === state.activeTunnelId) ?? null
  )
