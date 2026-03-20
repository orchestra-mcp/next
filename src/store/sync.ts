'use client'
import { create } from 'zustand'
import type { SyncEvent, ConnectedTunnel } from '@/types/models'

export interface SyncConflict {
  id: string
  entity_type: string
  entity_id: string
  local_version: number
  remote_version: number
  resolution: 'local_wins' | 'remote_wins' | 'merged' | 'pending'
  timestamp: number
  detail?: string
}

interface SyncState {
  syncStatus: 'idle' | 'syncing' | 'error'
  powerSyncState: 'connected' | 'connecting' | 'disconnected' | 'uploading' | 'downloading'
  lastSyncAt: string | null
  connectedTunnels: ConnectedTunnel[]
  recentEvents: SyncEvent[]
  pendingChanges: number
  pendingWrites: number
  conflicts: SyncConflict[]
  autoRefresh: boolean
  autoRefreshInterval: number
}

interface SyncActions {
  handleSyncEvent: (event: SyncEvent) => void
  updateTunnels: (tunnels: ConnectedTunnel[]) => void
  setSyncStatus: (status: 'idle' | 'syncing' | 'error') => void
  setPowerSyncState: (state: SyncState['powerSyncState']) => void
  setPendingWrites: (count: number) => void
  addConflict: (conflict: SyncConflict) => void
  resolveConflict: (id: string, resolution: SyncConflict['resolution']) => void
  clearConflicts: () => void
  setAutoRefresh: (enabled: boolean) => void
  clearEvents: () => void
}

export const useSyncStore = create<SyncState & SyncActions>(
  (set) => ({
    syncStatus: 'idle',
    powerSyncState: 'disconnected',
    lastSyncAt: null,
    connectedTunnels: [],
    recentEvents: [],
    pendingChanges: 0,
    pendingWrites: 0,
    conflicts: [],
    autoRefresh: true,
    autoRefreshInterval: 30,

    handleSyncEvent: (event) => {
      set(state => ({
        recentEvents: [event, ...state.recentEvents].slice(0, 50),
        lastSyncAt: new Date().toISOString(),
      }))
    },

    updateTunnels: (tunnels) => set({ connectedTunnels: tunnels }),

    setSyncStatus: (status) => set({ syncStatus: status }),

    setPowerSyncState: (powerSyncState) => set({ powerSyncState }),

    setPendingWrites: (pendingWrites) => set({ pendingWrites }),

    addConflict: (conflict) => {
      set(state => ({
        conflicts: [conflict, ...state.conflicts].slice(0, 50),
      }))
    },

    resolveConflict: (id, resolution) => {
      set(state => ({
        conflicts: state.conflicts.map(c =>
          c.id === id ? { ...c, resolution } : c
        ),
      }))
    },

    clearConflicts: () => set({ conflicts: [] }),

    setAutoRefresh: (autoRefresh) => set({ autoRefresh }),

    clearEvents: () => set({ recentEvents: [] }),
  })
)
