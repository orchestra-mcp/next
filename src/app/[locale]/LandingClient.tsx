'use client'
import { HeroSection } from '@/components/marketing/hero-section'
import { IdeGrid } from '@/components/marketing/ide-grid'
import { ToolsShowcase } from '@/components/marketing/tools-showcase'
import { PlatformGrid } from '@/components/marketing/platform-grid'
import { MarketplacePreview } from '@/components/marketing/marketplace-preview'
import { PricingSection } from '@/components/marketing/pricing-section'
import { MarketingNav } from '@/components/layout/marketing-nav'
import { MarketingFooter } from '@/components/layout/marketing-footer'
import Link from 'next/link'
import { useTranslations } from 'next-intl'

interface LandingData {
  homepage: Record<string, unknown>
  pricing: Record<string, unknown>
  blog: Record<string, unknown>
}

export default function LandingClient({ data }: { data: LandingData }) {
  const t = useTranslations()

  const homepage = data.homepage as {
    total_tools?: string
    hero_subtext?: string
    stats?: Array<{ label: string; value: string }>
  }

  const stats = homepage.stats ?? [
    { value: '300+', label: 'MCP Tools' },
    { value: '38',   label: 'Plugins' },
    { value: '6',    label: 'Platforms' },
    { value: '24',   label: 'Content Packs' },
  ]

  return (
    <div style={{ background: 'var(--color-bg, #0f0f12)', color: 'var(--color-fg, #f8f8f8)' }}>
      <style>{`
        @media (max-width: 640px) {
          .landing-section-pad { padding-left: 20px !important; padding-right: 20px !important; }
          .stats-bar-grid { grid-template-columns: repeat(2,1fr) !important; }
          .stat-value { font-size: 32px !important; }
          .cta-banner { padding: 48px 24px !important; }
          .cta-banner-btns { flex-direction: column !important; align-items: stretch !important; }
          .cta-banner-btns a { text-align: center; justify-content: center !important; }
        }
      `}</style>
      <MarketingNav />

      <main>
        {/* 1. Hero */}
        <HeroSection data={homepage} />

        {/* 2. IDE Support Row */}
        <IdeGrid />

        {/* 3. Stats bar */}
        <section className="landing-section-pad" style={{ padding: '48px 32px', borderBottom: '1px solid var(--color-border, rgba(255,255,255,0.05))' }}>
          <div className="stats-bar-grid" style={{ maxWidth: 800, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2 }}>
            {stats.map(s => (
              <div key={s.label} style={{ textAlign: 'center', padding: '20px' }}>
                <div className="stat-value" style={{
                  fontSize: 42, fontWeight: 800, letterSpacing: '-0.04em',
                  background: 'linear-gradient(135deg, #00e5ff, #a900ff)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text', lineHeight: 1,
                }}>{s.value}</div>
                <div style={{ fontSize: 13, color: 'var(--color-fg-muted, rgba(255,255,255,0.4))', marginTop: 6 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* 4. MCP Tools Showcase */}
        <ToolsShowcase />

        {/* 5. Platform Grid */}
        <PlatformGrid />

        {/* 6. Plugin Marketplace Preview */}
        <MarketplacePreview />

        {/* 7. Pricing */}
        <PricingSection data={data.pricing as { plans?: Array<{ name: string; price: string; period: string; highlighted: boolean; cta?: string; href?: string; desc?: string; features?: string[] }> }} />

        {/* 8. CTA Banner */}
        <section className="landing-section-pad" style={{ padding: '0 32px 100px' }}>
          <div className="cta-banner" style={{
            maxWidth: 720, margin: '0 auto', textAlign: 'center',
            padding: '72px 48px', borderRadius: 24,
            border: '1px solid var(--color-border, rgba(255,255,255,0.07))',
            background: 'var(--color-bg-alt, rgba(255,255,255,0.03))',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 0%, rgba(169,0,255,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
            <div style={{ position: 'relative' }}>
              <h2 style={{
                fontSize: 'clamp(26px, 4vw, 42px)', fontWeight: 700,
                letterSpacing: '-0.03em', marginBottom: 14,
                color: 'var(--color-fg, #f8f8f8)',
              }}>Ready to build with Orchestra?</h2>
              <p style={{
                fontSize: 16, marginBottom: 12,
                color: 'var(--color-fg-muted, rgba(255,255,255,0.4))',
              }}>Get started in seconds with a single command.</p>
              <div style={{
                display: 'inline-block', padding: '8px 16px', borderRadius: 8,
                background: 'rgba(0,0,0,0.3)', marginBottom: 32,
                fontFamily: 'JetBrains Mono, monospace', fontSize: 13,
                color: 'var(--color-fg-dim, rgba(255,255,255,0.5))',
              }}>
                $ curl -fsSL https://orchestra-mcp.dev/install.sh | sh
              </div>
              <div className="cta-banner-btns" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                <Link href="/register" style={{
                  padding: '13px 32px', borderRadius: 10, fontSize: 15, fontWeight: 600,
                  background: 'linear-gradient(135deg, #00e5ff, #a900ff)',
                  color: '#fff', textDecoration: 'none',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  Get Started Free &rarr;
                </Link>
                <Link href="/docs" style={{
                  padding: '13px 24px', borderRadius: 10, fontSize: 15, fontWeight: 500,
                  border: '1px solid var(--color-border, rgba(255,255,255,0.1))',
                  color: 'var(--color-fg-muted, rgba(255,255,255,0.7))',
                  textDecoration: 'none',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  Read the Docs
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  )
}
