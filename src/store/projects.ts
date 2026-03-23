'use client'
import { create } from 'zustand'
import * as db from '@/lib/supabase/queries'
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
  (set) => ({
    projects: [],
    loading: false,
    error: null,

    fetchProjects: async (params) => {
      set({ loading: true, error: null })
      try {
        const items = await db.fetchProjects({
          workspaceId: params?.workspaceId,
          teamId: params?.teamId,
        })
        set({ projects: items as Project[], loading: false })
      } catch (e) {
        set({ error: (e as Error).message, loading: false })
      }
    },

    createProject: async (workspaceId, data) => {
      set({ loading: true, error: null })
      try {
        const project = await db.createProject({ ...data, workspace_id: workspaceId }) as Project
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
        const project = await db.updateProject(id, data) as Project
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
        await db.deleteProject(id)
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
