'use client'

import { useThemeStore } from '@/store/theme'

export interface ProfileColors {
  textPrimary: string
  textSecondary: string
  textMuted: string
  textBody: string
  cardBg: string
  cardBorder: string
  inputBg: string
  inputBorder: string
  inputFocusBorder: string
  hoverBg: string
  accent: string
  accentPurple: string
  danger: string
  success: string
}

/**
 * Profile theme hook — uses CSS variables from @orchestra-mcp/theme.
 * Colors adapt automatically when theme changes via the theme provider.
 * isDark is kept for modal overlays and special cases that need opacity-based backgrounds.
 */
export function useProfileTheme() {
  const { theme } = useThemeStore()
  const isDark = theme === 'dark'

  const colors: ProfileColors = {
    textPrimary: 'var(--color-fg, #f8f8f8)',
    textSecondary: 'var(--color-fg-muted, rgba(255,255,255,0.7))',
    textMuted: 'var(--color-fg-dim, rgba(255,255,255,0.45))',
    textBody: 'var(--color-fg-muted, rgba(255,255,255,0.75))',
    cardBg: 'var(--color-bg-alt, rgba(255,255,255,0.04))',
    cardBorder: 'var(--color-border, rgba(255,255,255,0.08))',
    inputBg: 'var(--color-bg-alt, rgba(255,255,255,0.04))',
    inputBorder: 'var(--color-border, rgba(255,255,255,0.1))',
    inputFocusBorder: 'var(--color-accent, #00e5ff)',
    hoverBg: 'var(--color-bg-active, rgba(255,255,255,0.05))',
    accent: 'var(--color-accent, #00e5ff)',
    accentPurple: '#a900ff',
    danger: '#ef4444',
    success: '#22c55e',
  }

  return { isDark, colors }
}
