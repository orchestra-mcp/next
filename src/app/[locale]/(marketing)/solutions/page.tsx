'use client'
import Link from 'next/link'
import { useThemeStore } from '@/store/theme'
import { useTranslations } from 'next-intl'

export default function SolutionsPage() {
  const t = useTranslations()
  const { theme } = useThemeStore()
  const isDark = theme === 'dark'
  const textPrimary = isDark ? '#f8f8f8' : '#0f0f12'
  const textMuted = isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.5)'
  const textBody = isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.55)'
  const ctaSecBorder = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.12)'
  const ctaSecColor = isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)'

  const solutions = [
    {
      icon: 'bx-brain',
      title: t('solutions.aiEngineers.title'),
      subtitle: t('solutions.aiEngineers.subtitle'),
      color: '#00e5ff',
      useCases: [
        { title: t('solutions.aiEngineers.uc1Title'), desc: t('solutions.aiEngineers.uc1Desc') },
        { title: t('solutions.aiEngineers.uc2Title'), desc: t('solutions.aiEngineers.uc2Desc') },
        { title: t('solutions.aiEngineers.uc3Title'), desc: t('solutions.aiEngineers.uc3Desc') },
      ],
      cta: t('solutions.aiEngineers.cta'),
      href: '/docs/ai-tools',
    },
    {
      icon: 'bx-group',
      title: t('solutions.devTeams.title'),
      subtitle: t('solutions.devTeams.subtitle'),
      color: '#a900ff',
      useCases: [
        { title: t('solutions.devTeams.uc1Title'), desc: t('solutions.devTeams.uc1Desc') },
        { title: t('solutions.devTeams.uc2Title'), desc: t('solutions.devTeams.uc2Desc') },
        { title: t('solutions.devTeams.uc3Title'), desc: t('solutions.devTeams.uc3Desc') },
      ],
      cta: t('solutions.devTeams.cta'),
      href: '/docs/features',
    },
    {
      icon: 'bx-buildings',
      title: t('solutions.enterprise.title'),
      subtitle: t('solutions.enterprise.subtitle'),
      color: '#22c55e',
      useCases: [
        { title: t('solutions.enterprise.uc1Title'), desc: t('solutions.enterprise.uc1Desc') },
        { title: t('solutions.enterprise.uc2Title'), desc: t('solutions.enterprise.uc2Desc') },
        { title: t('solutions.enterprise.uc3Title'), desc: t('solutions.enterprise.uc3Desc') },
      ],
      cta: t('solutions.enterprise.cta'),
      href: '/contact',
    },
  ]

  return (
    <div className="mkt-page" style={{ maxWidth: 1100, margin: '0 auto', padding: '72px 32px' }}>
      <div style={{ marginBottom: 72, textAlign: 'center' }}>
        <h1 style={{ fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 800, letterSpacing: '-0.04em', color: textPrimary, marginBottom: 14 }}>{t('solutions.title')}</h1>
        <p style={{ fontSize: 17, color: textMuted, maxWidth: 520, margin: '0 auto' }}>{t('solutions.subtitle')}</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
        {solutions.map((sol, idx) => (
          <div key={sol.title} style={{ padding: '40px', borderRadius: 20, border: `1px solid ${sol.color}20`, background: `${sol.color}05`, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -40, right: idx % 2 === 0 ? -40 : 'auto', left: idx % 2 !== 0 ? -40 : 'auto', width: 300, height: 300, borderRadius: '50%', background: `radial-gradient(ellipse, ${sol.color}12 0%, transparent 70%)`, filter: 'blur(40px)', pointerEvents: 'none' }} />
            <div className="mkt-solution-grid" style={{ position: 'relative', display: 'grid', gridTemplateColumns: '280px 1fr', gap: 48, alignItems: 'start' }}>
              <div>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: `${sol.color}15`, border: `1px solid ${sol.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                  <i className={`bx ${sol.icon}`} style={{ fontSize: 26, color: sol.color }} />
                </div>
                <h2 style={{ fontSize: 26, fontWeight: 800, color: textPrimary, letterSpacing: '-0.03em', marginBottom: 8 }}>{sol.title}</h2>
                <p style={{ fontSize: 15, color: textBody, lineHeight: 1.6, marginBottom: 24 }}>{sol.subtitle}</p>
                <Link href={sol.href} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 20px', borderRadius: 9, fontSize: 14, fontWeight: 600, background: `${sol.color}15`, color: sol.color, border: `1px solid ${sol.color}30`, textDecoration: 'none' }}>
                  {sol.cta} <i className="bx bx-right-arrow-alt rtl-flip" />
                </Link>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {sol.useCases.map(uc => (
                  <div key={uc.title} style={{ display: 'flex', gap: 14 }}>
                    <div style={{ width: 20, height: 20, borderRadius: '50%', background: `${sol.color}20`, border: `1px solid ${sol.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                      <span style={{ color: sol.color, fontSize: 11 }}>&#10003;</span>
                    </div>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 600, color: textPrimary, marginBottom: 4 }}>{uc.title}</div>
                      <div style={{ fontSize: 13, color: textBody, lineHeight: 1.65 }}>{uc.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 80, textAlign: 'center' }}>
        <h2 style={{ fontSize: 28, fontWeight: 700, color: textPrimary, marginBottom: 12 }}>{t('solutions.notSure')}</h2>
        <p style={{ fontSize: 16, color: textMuted, marginBottom: 28 }}>{t('solutions.notSureSubtitle')}</p>
        <div className="mkt-cta-row" style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <Link href="/register" style={{ padding: '12px 28px', borderRadius: 10, fontSize: 15, fontWeight: 600, background: 'linear-gradient(135deg, #00e5ff, #a900ff)', color: '#fff', textDecoration: 'none' }}>{t('common.getStartedFree')}</Link>
          <Link href="/contact" style={{ padding: '12px 24px', borderRadius: 10, fontSize: 15, fontWeight: 500, border: `1px solid ${ctaSecBorder}`, color: ctaSecColor, textDecoration: 'none' }}>{t('solutions.talkToSales')}</Link>
        </div>
      </div>
    </div>
  )
}
