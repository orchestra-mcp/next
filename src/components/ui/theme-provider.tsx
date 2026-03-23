'use client'
import { useEffect, useState, useRef } from 'react'
import Image from 'next/image'
import { useThemeStore, initializeTheme } from '@/store/theme'
import { useSettingsSync } from '@/hooks/use-settings-sync'
import { THEME_GROUPS, getThemesByGroup } from '@orchestra-mcp/theme'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { colorTheme } = useThemeStore()
  const [mounted, setMounted] = useState(false)

  // Sync theme/settings from Supabase Realtime (cross-device).
  useSettingsSync()

  useEffect(() => {
    initializeTheme()
    setMounted(true)
  }, [])

  // Re-apply when colorTheme changes after mount
  useEffect(() => {
    if (mounted) {
      const state = useThemeStore.getState()
      state.setColorTheme(state.colorTheme)
    }
  }, [colorTheme, mounted])

  // Splash loader — show until client hydrates
  if (!mounted) {
    return (
      <div className="splash-screen" style={{
        position: 'fixed', inset: 0, background: 'var(--color-bg, #0f0f12)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        zIndex: 9999,
      }}>
        <div style={{ position: 'relative', marginBottom: 20 }}>
          <Image src="/logo.svg" alt="Orchestra" width={48} height={48} priority />
          <div style={{
            position: 'absolute', inset: -8, borderRadius: '50%',
            border: '2px solid var(--color-accent, rgba(0,229,255,0.3))',
            opacity: 0.3,
            animation: 'splashPulse 1.4s ease-in-out infinite',
          }} />
        </div>
        <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-fg, #f8f8f8)', letterSpacing: '-0.02em', marginBottom: 6 }}>Orchestra</div>
        <div style={{ display: 'flex', gap: 5 }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              width: 5, height: 5, borderRadius: '50%', background: 'var(--color-accent, #00e5ff)',
              animation: `splashDot 1.2s ease-in-out ${i * 0.2}s infinite`,
            }} />
          ))}
        </div>
        <style>{`
          @keyframes splashPulse {
            0%, 100% { transform: scale(1); opacity: 0.4; }
            50% { transform: scale(1.15); opacity: 0.8; }
          }
          @keyframes splashDot {
            0%, 80%, 100% { transform: scale(0.6); opacity: 0.3; }
            40% { transform: scale(1); opacity: 1; }
          }
        `}</style>
      </div>
    )
  }

  return <>{children}</>
}

export function ThemeToggle({ size = 32 }: { size?: number }) {
  const { theme, colorTheme, setColorTheme } = useThemeStore()
  const isDark = theme === 'dark'
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        title="Change theme"
        style={{
          width: size, height: size, borderRadius: size / 3, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: '1px solid var(--color-border, rgba(255,255,255,0.07))',
          background: 'var(--color-bg-active, rgba(255,255,255,0.03))',
          color: isDark ? '#facc15' : '#6366f1',
          transition: 'all 0.2s',
          flexShrink: 0,
        }}
      >
        <i className={`bx ${isDark ? 'bx-sun' : 'bx-moon'}`} style={{ fontSize: size * 0.5 }} />
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: size + 8, insetInlineEnd: 0, zIndex: 9999,
          width: 220, maxHeight: 380, overflowY: 'auto',
          borderRadius: 12, padding: 6,
          background: 'var(--color-bg, #0f0f12)',
          border: '1px solid var(--color-border, rgba(255,255,255,0.1))',
          boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
        }}>
          {THEME_GROUPS.map(group => {
            const groupThemes = getThemesByGroup(group)
            if (groupThemes.length === 0) return null
            return (
              <div key={group}>
                <div style={{
                  fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
                  letterSpacing: '0.06em', padding: '8px 10px 4px',
                  color: 'var(--color-fg-dim, rgba(255,255,255,0.3))',
                }}>{group}</div>
                {groupThemes.map(t => (
                  <button
                    key={t.id}
                    onClick={() => { setColorTheme(t.id); setOpen(false) }}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                      padding: '7px 10px', borderRadius: 8, border: 'none',
                      background: colorTheme === t.id ? 'var(--color-bg-active, rgba(0,229,255,0.08))' : 'transparent',
                      cursor: 'pointer', textAlign: 'start',
                    }}
                  >
                    <div style={{
                      width: 18, height: 18, borderRadius: 5, flexShrink: 0,
                      background: t.colors.bg,
                      border: `2px solid ${t.colors.accent}`,
                    }} />
                    <span style={{
                      fontSize: 12.5, fontWeight: colorTheme === t.id ? 600 : 400,
                      color: colorTheme === t.id ? 'var(--color-accent, #00e5ff)' : 'var(--color-fg-muted, rgba(255,255,255,0.6))',
                    }}>
                      {t.label}
                    </span>
                    {t.isLight && (
                      <i className="bx bx-sun" style={{ fontSize: 11, color: 'var(--color-fg-dim, rgba(255,255,255,0.3))', marginInlineStart: 'auto' }} />
                    )}
                  </button>
                ))}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
