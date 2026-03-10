'use client'
import { useTranslations } from 'next-intl'

interface Plan {
  name: string
  price: string
  period: string
  features: string[]
  cta: string
  highlighted: boolean
  ctaStyle: 'gradient' | 'outline' | 'disabled'
}

const PLANS: Plan[] = [
  {
    name: 'Free',
    price: '$0',
    period: '/mo',
    features: ['Up to 3 projects', '5 team members', '1 GB storage', 'Community support'],
    cta: 'Current Plan',
    highlighted: false,
    ctaStyle: 'disabled',
  },
  {
    name: 'Pro',
    price: '$19',
    period: '/mo',
    features: ['Unlimited projects', '25 team members', '50 GB storage', 'Priority support', 'Advanced analytics', 'API access'],
    cta: 'Upgrade to Pro',
    highlighted: true,
    ctaStyle: 'gradient',
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    features: ['Unlimited everything', 'SSO & SAML', 'Custom integrations', '99.9% SLA', 'Dedicated support'],
    cta: 'Contact Sales',
    highlighted: false,
    ctaStyle: 'outline',
  },
]

const BILLING_HISTORY = [
  { date: 'Jan 1, 2025',  amount: '$0.00', status: 'paid'    as const },
  { date: 'Dec 1, 2024',  amount: '$0.00', status: 'paid'    as const },
]

type BillingStatus = 'paid' | 'pending'

const STATUS_COLORS: Record<BillingStatus, { bg: string; color: string; border: string }> = {
  paid:    { bg: 'rgba(34,197,94,0.1)',   color: '#22c55e',  border: 'rgba(34,197,94,0.25)'  },
  pending: { bg: 'rgba(249,115,22,0.1)',  color: '#f97316',  border: 'rgba(249,115,22,0.25)' },
}

export default function SubscriptionPage() {
  const t = useTranslations('app')

  const textPrimary = 'var(--color-fg)'
  const textMuted   = 'var(--color-fg-muted)'
  const textDim     = 'var(--color-fg-dim)'
  const cardBg      = 'var(--color-bg-alt)'
  const cardBorder  = 'var(--color-border)'
  const divider     = 'var(--color-border)'
  const usageTrack  = 'var(--color-bg-active)'

  const card: React.CSSProperties = { background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 14, padding: '22px 24px' }

  function PlanCta({ plan }: { plan: Plan }) {
    if (plan.ctaStyle === 'gradient') {
      return (
        <button style={{ width: '100%', padding: '10px 0', borderRadius: 9, border: 'none', background: 'linear-gradient(135deg, #00e5ff, #a900ff)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          {plan.cta}
        </button>
      )
    }
    if (plan.ctaStyle === 'outline') {
      return (
        <button style={{ width: '100%', padding: '10px 0', borderRadius: 9, border: `1px solid ${cardBorder}`, background: 'transparent', color: textPrimary, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          {plan.cta}
        </button>
      )
    }
    // disabled
    return (
      <button disabled style={{ width: '100%', padding: '10px 0', borderRadius: 9, border: `1px solid ${cardBorder}`, background: 'transparent', color: textDim, fontSize: 13, fontWeight: 600, cursor: 'not-allowed' }}>
        {plan.cta}
      </button>
    )
  }

  return (
    <div className="page-wrapper" style={{ maxWidth: 800, padding: '28px 32px' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: textPrimary, margin: 0, letterSpacing: '-0.02em' }}>Subscription</h1>
        <p style={{ fontSize: 13, color: textMuted, marginTop: 5 }}>Manage your plan and billing.</p>
      </div>

      {/* Current plan card */}
      <div style={{ ...card, marginBottom: 24 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: textPrimary, marginBottom: 18, paddingBottom: 14, borderBottom: `1px solid ${divider}` }}>{t('currentPlan')}</div>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(0,229,255,0.08)', border: '1px solid rgba(0,229,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className="bx bx-trophy" style={{ fontSize: 18, color: '#00e5ff' }} />
              </div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 700, color: textPrimary, letterSpacing: '-0.02em' }}>Free</div>
                <div style={{ fontSize: 11, color: textDim, marginTop: 1 }}>Next billing date: —</div>
              </div>
            </div>
            <div style={{ fontSize: 12, color: textMuted }}>Renewal: —</div>
          </div>
          <div style={{ minWidth: 200, flex: 1, maxWidth: 320 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
              <span style={{ fontSize: 12, color: textMuted }}>Storage usage</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: textPrimary }}>512 MB / 1 GB</span>
            </div>
            <div style={{ height: 6, borderRadius: 100, background: usageTrack, overflow: 'hidden' }}>
              <div style={{ height: '100%', borderRadius: 100, background: 'linear-gradient(90deg, #00e5ff, #a900ff)', width: '50%' }} />
            </div>
            <div style={{ fontSize: 11, color: textDim, marginTop: 6 }}>50% of storage used</div>
          </div>
        </div>
      </div>

      {/* Plan comparison */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: textDim, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 14 }}>Plans</div>
        <div className="plan-cards" style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {PLANS.map(plan => (
            <div
              key={plan.name}
              style={{
                flex: '1 1 200px',
                minWidth: 200,
                background: cardBg,
                border: plan.highlighted ? '1.5px solid transparent' : `1px solid ${cardBorder}`,
                borderRadius: 14,
                padding: '22px 20px',
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
                position: 'relative',
                ...(plan.highlighted ? { backgroundImage: `linear-gradient(${cardBg}, ${cardBg}), linear-gradient(135deg, #00e5ff, #a900ff)`, backgroundOrigin: 'border-box', backgroundClip: 'padding-box, border-box' } : {}),
              }}
            >
              {/* Most Popular badge */}
              {plan.highlighted && (
                <div style={{ position: 'absolute', top: -11, left: '50%', transform: 'translateX(-50%)', padding: '3px 12px', borderRadius: 100, background: 'linear-gradient(135deg, #00e5ff, #a900ff)', fontSize: 10, fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', letterSpacing: '0.03em' }}>
                  Most Popular
                </div>
              )}

              {/* Plan name & price */}
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: textPrimary, marginBottom: 8 }}>{plan.name}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
                  <span style={{ fontSize: 28, fontWeight: 800, color: textPrimary, letterSpacing: '-0.03em' }}>{plan.price}</span>
                  {plan.period && <span style={{ fontSize: 13, color: textMuted }}>{plan.period}</span>}
                </div>
              </div>

              {/* Features */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
                {plan.features.map(f => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <i className="bx bx-check" style={{ fontSize: 15, color: '#00e5ff', flexShrink: 0 }} />
                    <span style={{ fontSize: 12.5, color: textMuted }}>{f}</span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <PlanCta plan={plan} />
            </div>
          ))}
        </div>
      </div>

      {/* Billing history */}
      <div style={card}>
        <div style={{ fontSize: 13, fontWeight: 600, color: textPrimary, marginBottom: 18, paddingBottom: 14, borderBottom: `1px solid ${divider}` }}>Billing History</div>
        {BILLING_HISTORY.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '28px 0', color: textDim, fontSize: 13 }}>No billing history</div>
        ) : (
          <div>
            {/* Table header */}
            <div className="grid-admin-users" style={{ display: 'grid', gridTemplateColumns: '1fr 120px 100px 44px', padding: '7px 0', marginBottom: 4, fontSize: 10, fontWeight: 600, color: textDim, letterSpacing: '0.05em', textTransform: 'uppercase' as const, borderBottom: `1px solid ${divider}` }}>
              <div>Date</div>
              <div>Amount</div>
              <div className="hide-mobile">Status</div>
              <div />
            </div>
            {BILLING_HISTORY.map((row, idx) => {
              const sc = STATUS_COLORS[row.status]
              return (
                <div key={idx} className="grid-admin-users" style={{ display: 'grid', gridTemplateColumns: '1fr 120px 100px 44px', padding: '12px 0', borderBottom: idx < BILLING_HISTORY.length - 1 ? `1px solid ${divider}` : 'none', alignItems: 'center' }}>
                  <div style={{ fontSize: 13, color: textPrimary }}>{row.date}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: textPrimary }}>{row.amount}</div>
                  <div className="hide-mobile">
                    <span style={{ fontSize: 11, padding: '3px 9px', borderRadius: 100, background: sc.bg, color: sc.color, border: `1px solid ${sc.border}`, fontWeight: 600, textTransform: 'capitalize' as const }}>
                      {row.status}
                    </span>
                  </div>
                  <div>
                    <button style={{ width: 30, height: 30, borderRadius: 8, border: `1px solid ${cardBorder}`, background: 'transparent', color: textMuted, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <i className="bx bx-download" style={{ fontSize: 15 }} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
