'use client'
import { create } from 'zustand'
import { apiFetch, apiList, apiResource } from '@/lib/api'
import type { Feature, FeatureStatus } from '@/types/models'
import type { FilterState } from '@/store/filter-presets'

interface FeaturesState {
  features: Feature[]
  loading: boolean
  error: string | null
}

interface FeaturesActions {
  fetchFeatures: (projectId: string, filters?: FilterState) => Promise<void>
  updateStatus: (id: string, status: FeatureStatus) => Promise<void>
  assignFeature: (id: string, userId: number) => Promise<void>
  updateFeature: (id: string, data: Partial<Feature>) => Promise<void>
  handleRemoteUpdate: (id: string, payload: Record<string, unknown>) => void
  clearError: () => void
}

export const useFeaturesStore = create<FeaturesState & FeaturesActions>(
  (set) => ({
    features: [],
    loading: false,
    error: null,

    fetchFeatures: async (projectId, filters) => {
      set({ loading: true, error: null })
      try {
        const params = new URLSearchParams()
        if (filters?.status) params.set('status', filters.status)
        if (filters?.priority) params.set('priority', filters.priority)
        if (filters?.kind) params.set('kind', filters.kind)
        if (filters?.assignee) params.set('assignee_id', filters.assignee)
        if (filters?.search) params.set('search', filters.search)
        if (filters?.labels && filters.labels.length > 0) params.set('labels', filters.labels.join(','))
        const qs = params.toString()
        const url = `/api/projects/${projectId}/features${qs ? `?${qs}` : ''}`
        const { items } = await apiList<Feature>(url)
        set({ features: items, loading: false })
      } catch (e) {
        set({ error: (e as Error).message, loading: false })
      }
    },

    updateStatus: async (id, status) => {
      set({ loading: true, error: null })
      try {
        const feature = await apiResource<Feature>(`/api/features/${id}`, {
          method: 'PATCH',
          body: JSON.stringify({ status }),
        })
        set(state => ({
          features: state.features.map(f => f.id === id ? feature : f),
          loading: false,
        }))
      } catch (e) {
        set({ error: (e as Error).message, loading: false })
      }
    },

    assignFeature: async (id, userId) => {
      set({ loading: true, error: null })
      try {
        const feature = await apiResource<Feature>(`/api/features/${id}`, {
          method: 'PATCH',
          body: JSON.stringify({ assignee_id: userId }),
        })
        set(state => ({
          features: state.features.map(f => f.id === id ? feature : f),
          loading: false,
        }))
      } catch (e) {
        set({ error: (e as Error).message, loading: false })
      }
    },

    updateFeature: async (id, data) => {
      set({ loading: true, error: null })
      try {
        const feature = await apiResource<Feature>(`/api/features/${id}`, {
          method: 'PATCH',
          body: JSON.stringify(data),
        })
        set(state => ({
          features: state.features.map(f => f.id === id ? feature : f),
          loading: false,
        }))
      } catch (e) {
        set({ error: (e as Error).message, loading: false })
      }
    },

    handleRemoteUpdate: (id, payload) => {
      set(state => ({
        features: state.features.map(f =>
          f.id === id ? { ...f, ...payload } : f
        ),
      }))
    },

    clearError: () => set({ error: null }),
  })
)
