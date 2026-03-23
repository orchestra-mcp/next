'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import * as db from '@/lib/supabase/queries'
import { isRTL, getDirection } from '@/i18n/config'
import type { Locale } from '@/i18n/config'

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
          const val = await db.fetchPreferences()
          const merged = { ...DEFAULT_PREFERENCES, ...(val as Partial<UserPreferences>) }
          set({ preferences: merged, loaded: true, loading: false })
        } catch {
          set({ loaded: true, loading: false })
        }
      },

      updatePreference: async (key, value) => {
        // Optimistic update
        set(s => ({ preferences: { ...s.preferences, [key]: value } }))

        // Side-effect: when language changes, update document lang/dir and set cookie for next-intl
        if (key === 'language' && typeof window !== 'undefined') {
          const locale = value as Locale
          document.documentElement.lang = locale
          document.documentElement.dir = getDirection(locale)
          document.cookie = `NEXT_LOCALE=${locale};path=/;max-age=31536000;SameSite=Lax`
        }

        try {
          await db.updatePreferences({ [key]: value })
        } catch (e) {
          // Revert on error — refetch
          get().fetchPreferences()
        }
      },

      updatePreferences: async (partial) => {
        set(s => ({ preferences: { ...s.preferences, ...partial } }))
        try {
          await db.updatePreferences(partial as Record<string, unknown>)
        } catch (e) {
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
