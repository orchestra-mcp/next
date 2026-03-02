'use client'
import Link from 'next/link'
import { useThemeStore } from '@/store/theme'

interface Plan {
  name: string
  price: string
  period: string
  highlighted: boolean
  cta?: string
  href?: string
  desc?: string
  features?: string[]
}

interface PricingData {
  plans?: Plan[]
}

const DEFAULT_PLANS: Plan[] = [
  {
    name: 'Free', price: '0', period: 'forever', highlighted: false,
    cta: 'Get started', href: '/register',
    desc: 'Perfect for solo developers and open source projects.',
    features: ['All 290 MCP tools', '4 core plugins bundled', '1 GB RAG memory', '5 projects', 'Claude Code, Cursor, VS Code', 'Community support'],
  },
  {
    name: 'Pro', price: '19', period: 'month', highlighted: true,
    cta: 'Start free trial', href: '/register?plan=pro',
    desc: 'For teams building production AI-native applications.',
    features: ['Everything in Free', 'All 36 plugins', 'Unlimited projects', '50 GB RAG memory', 'All 17 official packs', 'Multi-model AI bridges', 'Team collaboration', 'Priority support'],
  },
  {
    name: 'Enterprise', price: 'custom', period: '', highlighted: false,
    cta: 'Contact us', href: '/contact',
    desc: 'Custom deployments, SLAs, and dedicated support.',
    features: ['Everything in Pro', 'Self-hosted deployment', 'Custom plugins', 'SSO / SAML', 'SLA guarantee', 'Dedicated support', 'Audit logs'],
  },
]

function formatPrice(price: string) {
  if (price === '0') return '$0'
  if (price === 'custom') return 'Custom'
  const n = parseFloat(price)
  return isNaN(n) ? price : `$${n}`
}

function formatPeriod(period: string) {
  if (!period || period === 'forever') return period === 'forever' ? 'forever' : ''
  if (period === 'month') return 'per month'
  return period
}

export function PricingSection({ data }: { data?: PricingData }) {
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

  const plans = data?.plans?.length ? data.plans : DEFAULT_PLANS

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
            border: `1px solid ${cardBorder(p.highlighted)}`,
            background: cardBg(p.highlighted),
            position: 'relative', display: 'flex', flexDirection: 'column',
          }}>
            {p.highlighted && (
              <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', padding: '3px 12px', borderRadius: 100, background: 'linear-gradient(135deg, #00e5ff, #a900ff)', fontSize: 11, fontWeight: 700, color: '#fff', whiteSpace: 'nowrap' }}>
                Most Popular
              </div>
            )}
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: planNameColor, marginBottom: 12 }}>{p.name}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 10 }}>
                <span style={{ fontSize: 42, fontWeight: 800, color: textPrimary, letterSpacing: '-0.04em' }}>{formatPrice(p.price)}</span>
                {p.period && <span style={{ fontSize: 14, color: textDim }}>{formatPeriod(p.period)}</span>}
              </div>
              {p.desc && <p style={{ fontSize: 13, color: textDim, lineHeight: 1.6 }}>{p.desc}</p>}
            </div>
            {p.features && (
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 10, flex: 1, marginBottom: 28 }}>
                {p.features.map((f, i) => (
                  <li key={i} style={{ display: 'flex', gap: 8, fontSize: 13, color: featureColor }}>
                    <span style={{ color: '#00e5ff', flexShrink: 0 }}>&#10003;</span>{f}
                  </li>
                ))}
              </ul>
            )}
            <Link href={p.href ?? (p.name === 'Enterprise' ? '/contact' : '/register')} style={{
              display: 'block', textAlign: 'center', padding: '12px', borderRadius: 10,
              fontSize: 14, fontWeight: 600, textDecoration: 'none',
              background: p.highlighted ? 'linear-gradient(135deg, #00e5ff, #a900ff)' : plainBtnBg,
              color: p.highlighted ? '#fff' : plainBtnColor,
              border: p.highlighted ? 'none' : `1px solid ${plainBtnBorder}`,
            }}>
              {p.cta ?? (p.name === 'Enterprise' ? 'Contact us' : 'Get started')}
            </Link>
          </div>
        ))}
      </div>
    </section>
  )
}
