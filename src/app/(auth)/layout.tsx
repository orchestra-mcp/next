'use client'
import { useThemeStore } from '@/store/theme'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { theme } = useThemeStore()
  const isDark = theme === 'dark'

  const bg = isDark ? '#070c1a' : '#f0f2f5'
  const dotColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'
  const glowColor = isDark ? 'rgba(169,0,255,0.12)' : 'rgba(169,0,255,0.06)'

  return (
    <div style={{
      minHeight: '100vh',
      background: bg,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Grid pattern */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `radial-gradient(${dotColor} 1px, transparent 1px)`,
        backgroundSize: '32px 32px',
        pointerEvents: 'none',
      }} />
      {/* Glow */}
      <div style={{
        position: 'absolute', top: '30%', left: '50%', transform: 'translate(-50%, -50%)',
        width: 600, height: 400, borderRadius: '50%',
        background: `radial-gradient(ellipse, ${glowColor} 0%, transparent 70%)`,
        filter: 'blur(60px)', pointerEvents: 'none',
      }} />
      <div style={{ position: 'relative', width: '100%', padding: '40px 16px' }}>
        {children}
      </div>
    </div>
  )
}
