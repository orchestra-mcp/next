'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useThemeStore, applyTheme } from '@/store/theme'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useThemeStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    applyTheme(theme)
    setMounted(true)
  }, [theme])

  // Splash loader — show until client hydrates
  if (!mounted) {
    return (
      <div className="splash-screen" style={{
        position: 'fixed', inset: 0, background: '#0f0f12',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        zIndex: 9999,
      }}>
        <div style={{ position: 'relative', marginBottom: 20 }}>
          <Image src="/logo.svg" alt="Orchestra" width={52} height={52} priority />
          {/* Pulsing ring */}
          <div style={{
            position: 'absolute', inset: -8, borderRadius: '50%',
            border: '2px solid rgba(0,229,255,0.3)',
            animation: 'splashPulse 1.4s ease-in-out infinite',
          }} />
        </div>
        <div style={{ fontSize: 17, fontWeight: 700, color: '#f8f8f8', letterSpacing: '-0.02em', marginBottom: 6 }}>Orchestra</div>
        <div style={{ display: 'flex', gap: 5 }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              width: 5, height: 5, borderRadius: '50%', background: '#00e5ff',
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
  const { theme, toggle } = useThemeStore()
  const isDark = theme === 'dark'

  return (
    <button
      onClick={toggle}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      style={{
        width: size, height: size, borderRadius: size / 3, cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: `1px solid var(--border, rgba(255,255,255,0.07))`,
        background: `var(--bg-hover, rgba(255,255,255,0.03))`,
        color: isDark ? '#facc15' : '#6366f1',
        transition: 'all 0.2s',
        flexShrink: 0,
      }}
    >
      <i className={`bx ${isDark ? 'bx-sun' : 'bx-moon'}`} style={{ fontSize: size * 0.5 }} />
    </button>
  )
}
