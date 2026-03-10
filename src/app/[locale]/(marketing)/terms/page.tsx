'use client'
import { useThemeStore } from '@/store/theme'
import { useTranslations } from 'next-intl'

export default function TermsPage() {
  const t = useTranslations()
  const { theme } = useThemeStore()
  const isDark = theme === 'dark'
  const textPrimary = isDark ? '#f8f8f8' : '#0f0f12'
  const textMuted = isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.4)'
  const textBody = isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.6)'
  const introBg = isDark ? 'rgba(255,255,255,0.03)' : '#ffffff'
  const introBorder = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)'
  const dividerColor = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)'

  const sections = [
    { title: t('terms.s1Title'), body: t('terms.s1Body') },
    { title: t('terms.s2Title'), body: t('terms.s2Body') },
    { title: t('terms.s3Title'), body: t('terms.s3Body') },
    { title: t('terms.s4Title'), body: t('terms.s4Body') },
    { title: t('terms.s5Title'), body: t('terms.s5Body') },
    { title: t('terms.s6Title'), body: t('terms.s6Body') },
    { title: t('terms.s7Title'), body: t('terms.s7Body') },
    { title: t('terms.s8Title'), body: t('terms.s8Body') },
    { title: t('terms.s9Title'), body: t('terms.s9Body') },
    { title: t('terms.s10Title'), body: t('terms.s10Body') },
  ]

  return (
    <div className="mkt-page" style={{ maxWidth: 720, margin: '0 auto', padding: '72px 32px' }}>
      <div style={{ marginBottom: 48 }}>
        <h1 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, letterSpacing: '-0.04em', color: textPrimary, marginBottom: 12 }}>{t('terms.title')}</h1>
        <p style={{ fontSize: 14, color: textMuted }}>{t('terms.lastUpdated')}</p>
      </div>

      <div style={{ fontSize: 15, color: textBody, lineHeight: 1.75, marginBottom: 40, padding: '20px', borderRadius: 10, background: introBg, border: `1px solid ${introBorder}` }}>
        {t('terms.intro')}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>
        {sections.map(s => (
          <div key={s.title}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: textPrimary, marginBottom: 12, letterSpacing: '-0.02em' }}>{s.title}</h2>
            <p style={{ fontSize: 15, color: textBody, lineHeight: 1.75, margin: 0 }}>{s.body}</p>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 56, paddingTop: 32, borderTop: `1px solid ${dividerColor}`, fontSize: 14, color: textMuted }}>
        {t('terms.questionsAboutTerms')} <a href="mailto:legal@orchestra-mcp.dev" style={{ color: '#00e5ff', textDecoration: 'none' }}>legal@orchestra-mcp.dev</a>
      </div>
    </div>
  )
}
