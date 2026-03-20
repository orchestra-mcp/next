'use client'
import { create } from 'zustand'
import type { SyncEvent, ConnectedTunnel } from '@/types/models'

interface SyncState {
  syncStatus: 'idle' | 'syncing' | 'error'
  lastSyncAt: string | null
  connectedTunnels: ConnectedTunnel[]
  recentEvents: SyncEvent[]
  pendingChanges: number
}

interface SyncActions {
  handleSyncEvent: (event: SyncEvent) => void
  updateTunnels: (tunnels: ConnectedTunnel[]) => void
  setSyncStatus: (status: 'idle' | 'syncing' | 'error') => void
  clearEvents: () => void
}

export const useSyncStore = create<SyncState & SyncActions>(
  (set) => ({
    syncStatus: 'idle',
    lastSyncAt: null,
    connectedTunnels: [],
    recentEvents: [],
    pendingChanges: 0,

    handleSyncEvent: (event) => {
      set(state => ({
        recentEvents: [event, ...state.recentEvents].slice(0, 50),
        lastSyncAt: new Date().toISOString(),
      }))
    },

    updateTunnels: (tunnels) => set({ connectedTunnels: tunnels }),

    setSyncStatus: (status) => set({ syncStatus: status }),

    clearEvents: () => set({ recentEvents: [] }),
  })
)
