'use client'
import { create } from 'zustand'
import { apiFetch } from '@/lib/api'
import type { Delegation } from '@/types/models'

interface DelegationsState {
  delegations: Delegation[]
  loading: boolean
  error: string | null
  pendingCount: number
}

interface DelegationsActions {
  fetchMyDelegations: () => Promise<void>
  respondToDelegation: (id: string, response: string) => Promise<void>
  clearError: () => void
}

export const useDelegationsStore = create<DelegationsState & DelegationsActions>(
  (set) => ({
    delegations: [],
    loading: false,
    error: null,
    pendingCount: 0,

    fetchMyDelegations: async () => {
      set({ loading: true, error: null })
      try {
        const res = await apiFetch<{ delegations: Delegation[] }>('/api/delegations')
        const delegations = res.delegations ?? []
        const pendingCount = delegations.filter(d => d.status === 'pending').length
        set({ delegations, pendingCount, loading: false })
      } catch (e) {
        set({ error: (e as Error).message, loading: false })
      }
    },

    respondToDelegation: async (id, response) => {
      set({ error: null })
      try {
        const updated = await apiFetch<Delegation>(`/api/delegations/${id}/respond`, {
          method: 'POST',
          body: JSON.stringify({ response }),
        })
        set(state => {
          const delegations = state.delegations.map(d =>
            d.id === id ? { ...d, ...updated, status: 'answered' as const, response } : d
          )
          const pendingCount = delegations.filter(d => d.status === 'pending').length
          return { delegations, pendingCount }
        })
      } catch (e) {
        set({ error: (e as Error).message })
      }
    },

    clearError: () => set({ error: null }),
  })
)
