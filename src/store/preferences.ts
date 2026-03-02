'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { apiFetch } from '@/lib/api'

export interface UserPreferences {
  theme: 'dark' | 'light'
  language: string
  sidebar_collapsed: boolean
  notifications_email: boolean
  notifications_push: boolean
  notifications_sound: boolean
  editor_font_size: number
  editor_tab_size: number
  editor_word_wrap: boolean
  compact_mode: boolean
}

const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'dark',
  language: 'en',
  sidebar_collapsed: false,
  notifications_email: true,
  notifications_push: true,
  notifications_sound: false,
  editor_font_size: 14,
  editor_tab_size: 2,
  editor_word_wrap: true,
  compact_mode: false,
}

interface PreferencesState {
  preferences: UserPreferences
  loaded: boolean
  loading: boolean
}

interface PreferencesActions {
  fetchPreferences: () => Promise<void>
  updatePreference: <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => Promise<void>
  updatePreferences: (partial: Partial<UserPreferences>) => Promise<void>
}

export const usePreferencesStore = create<PreferencesState & PreferencesActions>()(
  persist(
    (set, get) => ({
      preferences: { ...DEFAULT_PREFERENCES },
      loaded: false,
      loading: false,

      fetchPreferences: async () => {
        set({ loading: true })
        try {
          const res = await apiFetch<{ preferences: Partial<UserPreferences> }>('/api/settings/preferences')
          const merged = { ...DEFAULT_PREFERENCES, ...(res.preferences ?? {}) }
          set({ preferences: merged, loaded: true, loading: false })
        } catch (e) {
          if ((e as any).devSeed) { set({ loaded: true, loading: false }); return }
          set({ loaded: true, loading: false })
        }
      },

      updatePreference: async (key, value) => {
        // Optimistic update
        set(s => ({ preferences: { ...s.preferences, [key]: value } }))
        try {
          await apiFetch('/api/settings/preferences', {
            method: 'PATCH',
            body: JSON.stringify({ [key]: value }),
          })
        } catch (e) {
          if ((e as any).devSeed) return
          // Revert on error — refetch
          get().fetchPreferences()
        }
      },

      updatePreferences: async (partial) => {
        set(s => ({ preferences: { ...s.preferences, ...partial } }))
        try {
          await apiFetch('/api/settings/preferences', {
            method: 'PATCH',
            body: JSON.stringify(partial),
          })
        } catch (e) {
          if ((e as any).devSeed) return
          get().fetchPreferences()
        }
      },
    }),
    {
      name: 'orchestra-preferences',
      partialize: (s) => ({ preferences: s.preferences }),
    }
  )
)
