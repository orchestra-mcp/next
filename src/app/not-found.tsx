'use client'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { useThemeStore } from '@/store/theme'

export default function NotFound() {
  const { theme } = useThemeStore()
  const isDark = theme === 'dark'
  const t = useTranslations('notFound')

  const textPrimary = isDark ? '#f8f8f8' : '#0f0f12'
  const textMuted = isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.5)'

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: isDark ? '#0f0f12' : '#f5f5f7', padding: 24 }}>
      <div style={{ textAlign: 'center', maxWidth: 440 }}>
        <div style={{ fontSize: 72, fontWeight: 800, background: 'linear-gradient(135deg, #00e5ff, #a900ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginBottom: 12 }}>
          404
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: textPrimary, marginBottom: 8 }}>
          {t('title')}
        </h1>
        <p style={{ fontSize: 14, color: textMuted, marginBottom: 28, lineHeight: 1.6 }}>
          {t('description')}
        </p>
        <Link
          href="/"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 22px', borderRadius: 10, background: 'linear-gradient(135deg, #00e5ff, #a900ff)', color: '#fff', fontWeight: 600, fontSize: 14, textDecoration: 'none' }}
        >
          <i className="bx bx-home" style={{ fontSize: 16 }} />
          {t('goHome')}
        </Link>
      </div>
    </div>
  )
}
