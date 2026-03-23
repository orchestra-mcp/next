'use client'
import { create } from 'zustand'
import * as db from '@/lib/supabase/queries'

interface FeatureFlags {
  // Public pages
  community: boolean
  marketplace: boolean
  blog: boolean
  docs: boolean
  download: boolean
  solutions: boolean
  contact: boolean
  sponsors: boolean
  issues: boolean
  badges: boolean
  // App features
  projects: boolean
  notes: boolean
  plans: boolean
  wiki: boolean
  devtools: boolean
  notifications: boolean
  push_notifications: boolean
  // AI
  ai_chat: boolean
  rag_memory: boolean
  multi_agent: boolean
  voice: boolean
  // Desktop / Mobile
  extensions: boolean
  terminal: boolean
  tunnels: boolean
  health: boolean
  sync: boolean
  // Profile
  wallet: boolean
  activity: boolean
  [key: string]: boolean
}

const DEFAULT_FLAGS: FeatureFlags = {
  community: true,
  marketplace: true,
  blog: true,
  docs: true,
  download: true,
  solutions: true,
  contact: true,
  sponsors: true,
  issues: true,
  badges: true,
  projects: true,
  notes: true,
  plans: true,
  wiki: true,
  devtools: true,
  notifications: true,
  push_notifications: true,
  ai_chat: true,
  rag_memory: true,
  multi_agent: true,
  voice: true,
  extensions: true,
  terminal: true,
  tunnels: true,
  health: true,
  sync: true,
  wallet: true,
  activity: true,
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
      const val = await db.fetchFeatureFlagsSetting()
      const flags: FeatureFlags = { ...DEFAULT_FLAGS }
      for (const k of Object.keys(DEFAULT_FLAGS)) {
        if (typeof val[k] === 'boolean') {
          flags[k] = val[k] as boolean
        }
        // Also check enable_ prefixed keys for backward compatibility
        const enableKey = `enable_${k}`
        if (typeof val[enableKey] === 'boolean') {
          flags[k] = val[enableKey] as boolean
        }
      }
      set({ flags, loaded: true })
    } catch {
      set({ loaded: true })
    }
  },

  isEnabled: (key: string) => {
    const { flags, loaded, fetchFlags } = get()
    // Auto-fetch on first access
    if (!loaded) {
      fetchFlags()
    }
    return flags[key] !== false
  },
}))
