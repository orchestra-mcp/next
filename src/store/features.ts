'use client'
import { create } from 'zustand'
import * as db from '@/lib/supabase/queries'
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
        const items = await db.fetchFeatures(projectId, {
          status: filters?.status,
          priority: filters?.priority,
          kind: filters?.kind,
          assignee: filters?.assignee,
          search: filters?.search,
          labels: filters?.labels,
        })
        set({ features: items as Feature[], loading: false })
      } catch (e) {
        set({ error: (e as Error).message, loading: false })
      }
    },

    updateStatus: async (id, status) => {
      set({ loading: true, error: null })
      try {
        const feature = await db.updateFeature(id, { status }) as Feature
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
        const feature = await db.updateFeature(id, { assignee_id: userId }) as Feature
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
        const feature = await db.updateFeature(id, data) as Feature
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
