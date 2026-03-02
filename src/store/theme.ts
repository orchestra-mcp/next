'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Theme = 'dark' | 'light'

interface ThemeState {
  theme: Theme
  toggle: () => void
  set: (theme: Theme) => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'dark',
      toggle: () => {
        const next = get().theme === 'dark' ? 'light' : 'dark'
        set({ theme: next })
        applyTheme(next)
      },
      set: (theme) => {
        set({ theme })
        applyTheme(theme)
      },
    }),
    { name: 'orchestra-theme', partialize: (s) => ({ theme: s.theme }) }
  )
)

export function applyTheme(theme: Theme) {
  const root = document.documentElement
  if (theme === 'light') {
    root.setAttribute('data-theme', 'light')
    // CSS variables used by dashboard/nav components via var(--xxx)
    root.style.setProperty('--bg', '#f5f5f7')
    root.style.setProperty('--bg-card', '#ffffff')
    root.style.setProperty('--bg-sidebar', '#ffffff')
    root.style.setProperty('--bg-hover', 'rgba(0,0,0,0.05)')
    root.style.setProperty('--bg-input', 'rgba(0,0,0,0.05)')
    root.style.setProperty('--text', '#0f0f12')
    root.style.setProperty('--text-muted', 'rgba(0,0,0,0.45)')
    root.style.setProperty('--border', 'rgba(0,0,0,0.08)')
    // Only set body bg for app/auth routes — landing keeps its dark sections
    // We use data-theme CSS selectors to target specific components
  } else {
    root.setAttribute('data-theme', 'dark')
    root.style.setProperty('--bg', '#0f0f12')
    root.style.setProperty('--bg-card', 'rgba(255,255,255,0.025)')
    root.style.setProperty('--bg-sidebar', '#131118')
    root.style.setProperty('--bg-hover', 'rgba(255,255,255,0.07)')
    root.style.setProperty('--bg-input', 'rgba(255,255,255,0.06)')
    root.style.setProperty('--text', '#f8f8f8')
    root.style.setProperty('--text-muted', 'rgba(255,255,255,0.4)')
    root.style.setProperty('--border', 'rgba(255,255,255,0.07)')
  }
}
