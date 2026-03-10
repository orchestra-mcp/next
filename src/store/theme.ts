'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  setColorTheme as applyColorTheme,
  setComponentVariant as applyComponentVariant,
  initTheme,
  getThemeById,
  type ComponentVariant,
} from '@orchestra-mcp/theme'

type Theme = 'dark' | 'light'

interface ThemeState {
  /** Legacy dark/light toggle — kept for backward compat */
  theme: Theme
  /** Active color theme ID from @orchestra-mcp/theme (25 themes) */
  colorTheme: string
  /** Active component variant: default | compact | modern */
  variant: ComponentVariant
  /** Toggle dark/light (switches between orchestra + github-light) */
  toggle: () => void
  /** Set dark/light directly */
  set: (theme: Theme) => void
  /** Set color theme by ID (e.g. 'dracula', 'github-dark') */
  setColorTheme: (themeId: string) => void
  /** Set component variant */
  setVariant: (variant: ComponentVariant) => void
}

/**
 * Bridge old legacy CSS vars (--bg, --text, --border, etc.) to the new
 * @orchestra-mcp/theme CSS vars. This keeps existing inline styles working
 * until they are migrated to var(--color-*).
 */
function bridgeLegacyCssVars(themeId: string) {
  if (typeof document === 'undefined') return

  const theme = getThemeById(themeId)
  if (!theme) return

  const root = document.documentElement
  const c = theme.colors

  // Legacy vars consumed by existing dashboard inline styles
  root.style.setProperty('--bg', c.bg)
  root.style.setProperty('--bg-card', c.bgAlt)
  root.style.setProperty('--bg-sidebar', c.bgAlt)
  root.style.setProperty('--bg-hover', c.bgActive)
  root.style.setProperty('--bg-input', c.bgAlt)
  root.style.setProperty('--text', c.fg)
  root.style.setProperty('--text-muted', c.fgMuted)
  root.style.setProperty('--border', c.border)

  // Set data-theme for existing CSS selectors ([data-theme="light"])
  root.setAttribute('data-theme', theme.isLight ? 'light' : 'dark')

  // Update body bg/color for the active theme
  document.body.style.backgroundColor = c.bg
  document.body.style.color = c.fg
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'dark',
      colorTheme: 'orchestra',
      variant: 'default' as ComponentVariant,

      toggle: () => {
        const current = get().colorTheme
        const currentTheme = getThemeById(current)
        // If currently on a light theme, switch to orchestra (dark); otherwise switch to github-light
        const nextId = currentTheme?.isLight ? 'orchestra' : 'github-light'
        const nextTheme = getThemeById(nextId)
        const nextDarkLight: Theme = nextTheme?.isLight ? 'light' : 'dark'

        set({ theme: nextDarkLight, colorTheme: nextId })
        applyColorTheme(nextId)
        bridgeLegacyCssVars(nextId)
      },

      set: (theme) => {
        const nextId = theme === 'light' ? 'github-light' : 'orchestra'
        set({ theme, colorTheme: nextId })
        applyColorTheme(nextId)
        bridgeLegacyCssVars(nextId)
      },

      setColorTheme: (themeId) => {
        const theme = getThemeById(themeId)
        if (!theme) return
        const darkLight: Theme = theme.isLight ? 'light' : 'dark'
        set({ colorTheme: themeId, theme: darkLight })
        applyColorTheme(themeId)
        bridgeLegacyCssVars(themeId)
      },

      setVariant: (variant) => {
        set({ variant })
        applyComponentVariant(variant)
      },
    }),
    {
      name: 'orchestra-theme',
      partialize: (s) => ({
        theme: s.theme,
        colorTheme: s.colorTheme,
        variant: s.variant,
      }),
    }
  )
)

/** Initialize theme on app load — restores from localStorage */
export function initializeTheme() {
  if (typeof document === 'undefined') return

  // Let @orchestra-mcp/theme restore from its own localStorage keys
  initTheme()

  // Also apply our Zustand-persisted state
  const state = useThemeStore.getState()
  applyColorTheme(state.colorTheme)
  applyComponentVariant(state.variant)
  bridgeLegacyCssVars(state.colorTheme)
}

// Re-export for backward compat — old code imports applyTheme
export function applyTheme(theme: Theme) {
  useThemeStore.getState().set(theme)
}
