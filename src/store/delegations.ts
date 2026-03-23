'use client'
import { create } from 'zustand'
import * as db from '@/lib/supabase/queries'
import { createClient } from '@/lib/supabase/client'
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
        const items = await db.fetchDelegations()
        const delegations = (items ?? []) as Delegation[]
        const pendingCount = delegations.filter(d => d.status === 'pending').length
        set({ delegations, pendingCount, loading: false })
      } catch (e) {
        set({ error: (e as Error).message, loading: false })
      }
    },

    respondToDelegation: async (id, response) => {
      set({ error: null })
      try {
        const sb = createClient()
        const { data, error } = await sb.from('delegations')
          .update({ status: 'answered', response, updated_at: new Date().toISOString() })
          .eq('id', id)
          .select()
          .single()
        if (error) throw new Error(error.message)
        set(state => {
          const delegations = state.delegations.map(d =>
            d.id === id ? { ...d, ...data, status: 'answered' as const, response } : d
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
