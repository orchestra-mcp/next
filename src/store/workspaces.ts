'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { apiFetch } from '@/lib/api'
import type { Workspace } from '@/types/models'

interface WorkspacesState {
  workspaces: Workspace[]
  activeWorkspaceId: string | null
  loading: boolean
  error: string | null
}

interface WorkspacesActions {
  fetchWorkspaces: (teamId?: string) => Promise<void>
  createWorkspace: (teamId: string, data: { name: string; description?: string }) => Promise<Workspace>
  updateWorkspace: (id: string, data: Partial<Pick<Workspace, 'name' | 'description'>>) => Promise<void>
  deleteWorkspace: (id: string) => Promise<void>
  selectWorkspace: (id: string | null) => void
  clearError: () => void
}

export const useWorkspaceStore = create<WorkspacesState & WorkspacesActions>()(
  persist(
    (set, get) => ({
      workspaces: [],
      activeWorkspaceId: null,
      loading: false,
      error: null,

      fetchWorkspaces: async (teamId) => {
        set({ loading: true, error: null })
        try {
          if (teamId) {
            const res = await apiFetch<{ workspaces: Workspace[] }>(`/api/teams/${teamId}/workspaces`)
            set({ workspaces: res.workspaces, loading: false })
          } else {
            // Fetch all user workspaces (personal + team-linked)
            const res = await apiFetch<Workspace[]>('/api/workspaces')
            const workspaces = Array.isArray(res) ? res : []
            set({ workspaces, loading: false })
          }
        } catch (e) {
          set({ error: (e as Error).message, loading: false })
        }
      },

      createWorkspace: async (teamId, data) => {
        set({ loading: true, error: null })
        try {
          const res = await apiFetch<{ workspace: Workspace }>(`/api/teams/${teamId}/workspaces`, {
            method: 'POST',
            body: JSON.stringify(data),
          })
          set(state => ({
            workspaces: [...state.workspaces, res.workspace],
            loading: false,
          }))
          return res.workspace
        } catch (e) {
          set({ error: (e as Error).message, loading: false })
          throw e
        }
      },

      updateWorkspace: async (id, data) => {
        set({ loading: true, error: null })
        try {
          const res = await apiFetch<{ workspace: Workspace }>(`/api/workspaces/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
          })
          set(state => ({
            workspaces: state.workspaces.map(w => w.id === id ? res.workspace : w),
            loading: false,
          }))
        } catch (e) {
          set({ error: (e as Error).message, loading: false })
          throw e
        }
      },

      deleteWorkspace: async (id) => {
        set({ loading: true, error: null })
        try {
          await apiFetch(`/api/workspaces/${id}`, { method: 'DELETE' })
          set(state => ({
            workspaces: state.workspaces.filter(w => w.id !== id),
            activeWorkspaceId: state.activeWorkspaceId === id ? null : state.activeWorkspaceId,
            loading: false,
          }))
        } catch (e) {
          set({ error: (e as Error).message, loading: false })
          throw e
        }
      },

      selectWorkspace: (id) => set({ activeWorkspaceId: id }),

      clearError: () => set({ error: null }),
    }),
    {
      name: 'orchestra-workspaces',
      partialize: (state) => ({ activeWorkspaceId: state.activeWorkspaceId }),
    }
  )
)
