'use client'
import Link from 'next/link'
import { useTranslations } from 'next-intl'

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

function formatPrice(price: string) {
  if (price === '0') return '$0'
  if (price === 'custom') return 'Custom'
  const n = parseFloat(price)
  return isNaN(n) ? price : `$${n}`
}

export function PricingSection({ data }: { data?: PricingData }) {
  const t = useTranslations()

  const DEFAULT_PLANS: Plan[] = [
    {
      name: t('pricing.free.name'), price: '0', period: 'forever', highlighted: false,
      cta: t('pricing.free.cta'), href: '/register',
      desc: t('pricing.free.desc'),
      features: ['All 300+ MCP tools', '4 core plugins bundled', '1 GB RAG memory', '5 projects', 'Claude Code, Cursor, VS Code', 'Community support'],
    },
    {
      name: t('pricing.pro.name'), price: '19', period: 'month', highlighted: true,
      cta: t('pricing.pro.cta'), href: '/register?plan=pro',
      desc: t('pricing.pro.desc'),
      features: ['Everything in Free', 'All 38 plugins', 'Unlimited projects', '50 GB RAG memory', 'All 24 official packs', 'Multi-model AI bridges', 'Team collaboration', 'Priority support'],
    },
    {
      name: t('pricing.enterprise.name'), price: 'custom', period: '', highlighted: false,
      cta: t('pricing.enterprise.cta'), href: '/contact',
      desc: t('pricing.enterprise.desc'),
      features: ['Everything in Pro', 'Self-hosted deployment', 'Custom plugins', 'SSO / SAML', 'SLA guarantee', 'Dedicated support', 'Audit logs'],
    },
  ]

  function formatPeriod(period: string) {
    if (!period || period === 'forever') return period === 'forever' ? t('pricing.forever') : ''
    if (period === 'month') return t('pricing.perMonth')
    return period
  }

  const plans = data?.plans?.length ? data.plans : DEFAULT_PLANS

  return (
    <section id="pricing" className="mkt-page" style={{ padding: '80px 32px', maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 56 }}>
        <h2 style={{
          fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 700,
          letterSpacing: '-0.03em', marginBottom: 14,
          color: 'var(--color-fg, #f8f8f8)',
        }}>Simple, transparent pricing</h2>
        <p style={{
          fontSize: 16, maxWidth: 460, margin: '0 auto',
          color: 'var(--color-fg-muted, rgba(255,255,255,0.45))',
        }}>Start free. Upgrade when your team needs more.</p>
      </div>
      <div className="pricing-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, alignItems: 'stretch' }}>
        {plans.map(p => (
          <div key={p.name} style={{
            padding: '32px 28px', borderRadius: 20,
            border: `1px solid ${p.highlighted ? 'rgba(169,0,255,0.4)' : 'var(--color-border, rgba(255,255,255,0.07))'}`,
            background: p.highlighted ? 'rgba(169,0,255,0.06)' : 'var(--color-bg-alt, rgba(255,255,255,0.03))',
            position: 'relative', display: 'flex', flexDirection: 'column',
          }}>
            {p.highlighted && (
              <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', padding: '3px 12px', borderRadius: 100, background: 'linear-gradient(135deg, #00e5ff, #a900ff)', fontSize: 11, fontWeight: 700, color: '#fff', whiteSpace: 'nowrap' }}>
                Most Popular
              </div>
            )}
            <div style={{ marginBottom: 24 }}>
              <div style={{
                fontSize: 14, fontWeight: 600, marginBottom: 12,
                color: 'var(--color-fg-dim, rgba(255,255,255,0.55))',
              }}>{p.name}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 10 }}>
                <span style={{
                  fontSize: 42, fontWeight: 800, letterSpacing: '-0.04em',
                  color: 'var(--color-fg, #f8f8f8)',
                }}>{formatPrice(p.price)}</span>
                {p.period && <span style={{
                  fontSize: 14,
                  color: 'var(--color-fg-dim, rgba(255,255,255,0.35))',
                }}>{formatPeriod(p.period)}</span>}
              </div>
              {p.desc && <p style={{
                fontSize: 13, lineHeight: 1.6,
                color: 'var(--color-fg-dim, rgba(255,255,255,0.35))',
              }}>{p.desc}</p>}
            </div>
            {p.features && (
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 10, flex: 1, marginBottom: 28 }}>
                {p.features.map((f, i) => (
                  <li key={i} style={{
                    display: 'flex', gap: 8, fontSize: 13,
                    color: 'var(--color-fg-muted, rgba(255,255,255,0.65))',
                  }}>
                    <span style={{ color: '#00e5ff', flexShrink: 0 }}>&#10003;</span>{f}
                  </li>
                ))}
              </ul>
            )}
            <Link href={p.href ?? (p.name === 'Enterprise' ? '/contact' : '/register')} style={{
              display: 'block', textAlign: 'center', padding: '12px', borderRadius: 10,
              fontSize: 14, fontWeight: 600, textDecoration: 'none',
              background: p.highlighted ? 'linear-gradient(135deg, #00e5ff, #a900ff)' : 'var(--color-bg-active, rgba(255,255,255,0.06))',
              color: p.highlighted ? '#fff' : 'var(--color-fg, #f8f8f8)',
              border: p.highlighted ? 'none' : '1px solid var(--color-border, rgba(255,255,255,0.1))',
            }}>
              {p.cta ?? (p.name === 'Enterprise' ? 'Contact us' : 'Get started')}
            </Link>
          </div>
        ))}
      </div>
    </section>
  )
}
