'use client'
import { create } from 'zustand'
import { apiFetch } from '@/lib/api'

interface FeatureFlags {
  projects: boolean
  notes: boolean
  plans: boolean
  wiki: boolean
  devtools: boolean
  sponsors: boolean
  community: boolean
  issues: boolean
  [key: string]: boolean
}

const DEFAULT_FLAGS: FeatureFlags = {
  projects: true,
  notes: true,
  plans: true,
  wiki: true,
  devtools: true,
  sponsors: true,
  community: true,
  issues: true,
}

interface FeatureFlagsState {
  flags: FeatureFlags
  loaded: boolean
  fetchFlags: () => Promise<void>
  isEnabled: (key: string) => boolean
}

export const useFeatureFlagsStore = create<FeatureFlagsState>()((set, get) => ({
  flags: { ...DEFAULT_FLAGS },
  loaded: false,

  fetchFlags: async () => {
    try {
      const res = await apiFetch<{ key: string; value: Record<string, unknown> }>('/api/public/settings/features')
      const val = res.value ?? {}
      const flags: FeatureFlags = { ...DEFAULT_FLAGS }
      for (const k of Object.keys(DEFAULT_FLAGS)) {
        if (typeof val[k] === 'boolean') {
          flags[k] = val[k] as boolean
        }
      }
      set({ flags, loaded: true })
    } catch {
      // On error (dev seed, network), keep defaults (all enabled)
      set({ loaded: true })
    }
  },

  isEnabled: (key: string) => {
    const { flags } = get()
    return flags[key] !== false
  },
}))
