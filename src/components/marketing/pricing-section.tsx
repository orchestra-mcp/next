'use client'
import Link from 'next/link'
import { useThemeStore } from '@/store/theme'

const plans = [
  {
    name: 'Free', price: '$0', period: 'forever', cta: 'Get started', href: '/register',
    desc: 'Perfect for solo developers and open source projects.',
    features: ['All 131 MCP tools', '3 AI bridge providers', 'RAG memory (1GB)', '5 projects', 'Community support'],
    highlight: false,
  },
  {
    name: 'Pro', price: '$19', period: 'per month', cta: 'Start free trial', href: '/register?plan=pro',
    desc: 'For teams building production AI-native applications.',
    features: ['Everything in Free', 'Unlimited providers', 'RAG memory (50GB)', 'Unlimited projects', 'All 17 packs included', 'Priority support', 'Team collaboration'],
    highlight: true,
  },
  {
    name: 'Enterprise', price: 'Custom', period: '', cta: 'Contact us', href: '/contact',
    desc: 'Custom deployments, SLAs, and dedicated support.',
    features: ['Everything in Pro', 'Self-hosted option', 'Custom plugins', 'SSO / SAML', 'SLA guarantee', 'Dedicated support', 'Custom contracts'],
    highlight: false,
  },
]

export function PricingSection() {
  const { theme } = useThemeStore()
  const isDark = theme === 'dark'

  const textPrimary = isDark ? '#f8f8f8' : '#0f0f12'
  const textMuted = isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.5)'
  const textDim = isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.4)'
  const cardBg = (highlight: boolean) => highlight
    ? (isDark ? 'rgba(169,0,255,0.06)' : 'rgba(169,0,255,0.04)')
    : (isDark ? 'rgba(255,255,255,0.03)' : '#ffffff')
  const cardBorder = (highlight: boolean) => highlight
    ? 'rgba(169,0,255,0.4)'
    : (isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)')
  const planNameColor = isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.5)'
  const featureColor = isDark ? 'rgba(255,255,255,0.65)' : 'rgba(0,0,0,0.6)'
  const plainBtnBg = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'
  const plainBtnBorder = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
  const plainBtnColor = isDark ? '#fff' : '#0f0f12'

  return (
    <section id="pricing" style={{ padding: '80px 32px', maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 56 }}>
        <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 14, color: textPrimary }}>Simple, transparent pricing</h2>
        <p style={{ fontSize: 16, color: textMuted, maxWidth: 460, margin: '0 auto' }}>Start free. Upgrade when your team needs more.</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, alignItems: 'stretch' }}>
        {plans.map(p => (
          <div key={p.name} style={{
            padding: '32px 28px', borderRadius: 20,
            border: `1px solid ${cardBorder(p.highlight)}`,
            background: cardBg(p.highlight),
            position: 'relative', display: 'flex', flexDirection: 'column',
          }}>
            {p.highlight && (
              <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', padding: '3px 12px', borderRadius: 100, background: 'linear-gradient(135deg, #00e5ff, #a900ff)', fontSize: 11, fontWeight: 700, color: '#fff', whiteSpace: 'nowrap' }}>
                Most Popular
              </div>
            )}
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: planNameColor, marginBottom: 12 }}>{p.name}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 10 }}>
                <span style={{ fontSize: 42, fontWeight: 800, color: textPrimary, letterSpacing: '-0.04em' }}>{p.price}</span>
                {p.period && <span style={{ fontSize: 14, color: textDim }}>{p.period}</span>}
              </div>
              <p style={{ fontSize: 13, color: textDim, lineHeight: 1.6 }}>{p.desc}</p>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 10, flex: 1, marginBottom: 28 }}>
              {p.features.map((f, i) => (
                <li key={i} style={{ display: 'flex', gap: 8, fontSize: 13, color: featureColor }}>
                  <span style={{ color: '#00e5ff', flexShrink: 0 }}>&#10003;</span>{f}
                </li>
              ))}
            </ul>
            <Link href={p.href} style={{
              display: 'block', textAlign: 'center', padding: '12px', borderRadius: 10,
              fontSize: 14, fontWeight: 600, textDecoration: 'none',
              background: p.highlight ? 'linear-gradient(135deg, #00e5ff, #a900ff)' : plainBtnBg,
              color: p.highlight ? '#fff' : plainBtnColor,
              border: p.highlight ? 'none' : `1px solid ${plainBtnBorder}`,
            }}>
              {p.cta}
            </Link>
          </div>
        ))}
      </div>
    </section>
  )
}
