'use client'
import { create } from 'zustand'
import { apiFetch, apiList, apiResource } from '@/lib/api'
import type { Project } from '@/types/models'

interface ProjectsState {
  projects: Project[]
  loading: boolean
  error: string | null
}

interface ProjectsActions {
  fetchProjects: (params?: { teamId?: string; workspaceId?: string }) => Promise<void>
  createProject: (workspaceId: string, data: { name: string; description?: string }) => Promise<Project>
  updateProject: (id: string, data: Partial<Pick<Project, 'name' | 'description'>>) => Promise<void>
  deleteProject: (id: string) => Promise<void>
  handleRemoteUpdate: (id: string, payload: Record<string, unknown>) => void
  clearError: () => void
}

export const useProjectStore = create<ProjectsState & ProjectsActions>()(
  (set, get) => ({
    projects: [],
    loading: false,
    error: null,

    fetchProjects: async (params) => {
      set({ loading: true, error: null })
      try {
        const url = params?.workspaceId
          ? `/api/workspaces/${params.workspaceId}/projects`
          : params?.teamId
            ? `/api/teams/${params.teamId}/projects`
            : '/api/projects'
        const { items } = await apiList<Project>(url)
        set({ projects: items, loading: false })
      } catch (e) {
        set({ error: (e as Error).message, loading: false })
      }
    },

    createProject: async (workspaceId, data) => {
      set({ loading: true, error: null })
      try {
        const project = await apiResource<Project>(`/api/workspaces/${workspaceId}/projects`, {
          method: 'POST',
          body: JSON.stringify(data),
        })
        set(state => ({
          projects: [...state.projects, project],
          loading: false,
        }))
        return project
      } catch (e) {
        set({ error: (e as Error).message, loading: false })
        throw e
      }
    },

    updateProject: async (id, data) => {
      set({ loading: true, error: null })
      try {
        const project = await apiResource<Project>(`/api/projects/${id}`, {
          method: 'PATCH',
          body: JSON.stringify(data),
        })
        set(state => ({
          projects: state.projects.map(p => p.id === id ? project : p),
          loading: false,
        }))
      } catch (e) {
        set({ error: (e as Error).message, loading: false })
        throw e
      }
    },

    deleteProject: async (id) => {
      set({ loading: true, error: null })
      try {
        await apiFetch(`/api/projects/${id}`, { method: 'DELETE' })
        set(state => ({
          projects: state.projects.filter(p => p.id !== id),
          loading: false,
        }))
      } catch (e) {
        set({ error: (e as Error).message, loading: false })
        throw e
      }
    },

    handleRemoteUpdate: (id, payload) => {
      set(state => ({
        projects: state.projects.map(p =>
          p.id === id ? { ...p, ...payload } : p
        ),
      }))
    },

    clearError: () => set({ error: null }),
  })
)
