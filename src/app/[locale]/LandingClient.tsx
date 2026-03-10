'use client'
import { HeroSection } from '@/components/marketing/hero-section'
import { FeaturesCarousel } from '@/components/marketing/features-carousel'
import { FeatureSection } from '@/components/marketing/feature-section'
import { PricingSection } from '@/components/marketing/pricing-section'
import { BlogPreview } from '@/components/marketing/blog-preview'
import { MarketingNav } from '@/components/layout/marketing-nav'
import { MarketingFooter } from '@/components/layout/marketing-footer'
import { useThemeStore } from '@/store/theme'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { useTranslations } from 'next-intl'

interface LandingData {
  homepage: Record<string, unknown>
  pricing: Record<string, unknown>
  blog: Record<string, unknown>
}

function TerminalBlock({ lines }: { lines: { dim?: boolean; cyan?: boolean; purple?: boolean; text: string }[] }) {
  return (
    <div style={{ borderRadius: 14, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', background: '#16121c', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
      <div style={{ padding: '10px 16px', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: 6 }}>
        {['#ff5f57', '#febc2e', '#28c840'].map(c => (
          <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />
        ))}
      </div>
      <div style={{ padding: '18px 20px', fontFamily: 'JetBrains Mono, monospace', fontSize: 12.5, lineHeight: 1.8, color: '#ccc' }}>
        {lines.map((l, i) => (
          <div key={i} style={{ color: l.cyan ? '#00e5ff' : l.purple ? '#c040ff' : l.dim ? 'rgba(255,255,255,0.3)' : '#d0d0d0' }}>{l.text}</div>
        ))}
      </div>
    </div>
  )
}

function PluginDiagram(): ReactNode {
  const rows = [
    { l: 'Claude ──────────────────────────', c: '#f8f8f8' },
    { l: '         ↓  MCP / stdio', c: 'rgba(255,255,255,0.4)' },
    { l: 'transport.stdio', c: '#00e5ff' },
    { l: '         ↓  in-process router', c: 'rgba(255,255,255,0.4)' },
    { l: 'orchestrator :9100', c: '#a900ff' },
    { l: '    ↙    ↓    ↓    ↘', c: 'rgba(255,255,255,0.3)' },
    { l: 'tools  bridge  engine  storage', c: '#00e5ff' },
    { l: '.features .claude  .rag  .markdown', c: 'rgba(255,255,255,0.35)' },
  ]
  return (
    <div style={{ padding: '24px', borderRadius: 14, border: '1px solid rgba(169,0,255,0.2)', background: 'rgba(169,0,255,0.04)', fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>
      {rows.map((r, i) => (
        <div key={i} style={{ color: r.c, lineHeight: 1.9 }}>{r.l}</div>
      ))}
    </div>
  )
}

export default function LandingClient({ data }: { data: LandingData }) {
  const t = useTranslations()
  const { theme } = useThemeStore()
  const isDark = theme === 'dark'

  const pageBg = isDark ? '#0f0f12' : '#f5f5f7'
  const textPrimary = isDark ? '#f8f8f8' : '#0f0f12'
  const textMuted = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.45)'
  const textDim = isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.25)'
  const borderColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.07)'
  const cardBg = isDark ? 'rgba(255,255,255,0.03)' : '#ffffff'
  const cardBorder = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)'
  const ctaSecBorder = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.12)'
  const ctaSecColor = isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)'

  const homepage = data.homepage as {
    total_tools?: string
    terminal_lines?: Array<{ name: string; note: string; color: string }>
    hero_subtext?: string
    stats?: Array<{ label: string; value: string }>
  }

  const stats: Array<{ value: string; label: string }> = homepage.stats?.map(s => ({ value: s.value, label: s.label })) ?? [
    { value: '290', label: t('landing.mcpTools') },
    { value: '36',  label: t('landing.plugins') },
    { value: '5',   label: t('landing.platformsTag') },
    { value: '17',  label: t('landing.officialPacks') },
  ]

  const totalTools = homepage.total_tools ?? '290'

  return (
    <div style={{ background: pageBg, color: textPrimary }}>
      <style>{`
        @media (max-width: 640px) {
          .landing-section-pad { padding-left: 20px !important; padding-right: 20px !important; }
          .trusted-gap { gap: 16px !important; }
          .trusted-item { font-size: 13px !important; }
          .stats-bar-grid { grid-template-columns: repeat(2,1fr) !important; }
          .stat-value { font-size: 32px !important; }
          .platform-grid { grid-template-columns: repeat(3,1fr) !important; gap: 10px !important; }
          .cta-banner { padding: 48px 24px !important; }
          .cta-banner-btns { flex-direction: column !important; align-items: stretch !important; }
          .cta-banner-btns a { text-align: center; justify-content: center !important; }
        }
      `}</style>
      <MarketingNav />

      <main>
        {/* 1. Hero */}
        <HeroSection data={homepage} />

        {/* 2. Trusted by */}
        <section className="landing-section-pad" style={{ padding: '0 32px 60px', borderBottom: `1px solid ${borderColor}` }}>
          <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: textDim, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 24 }}>{t('landing.worksWithTooling')}</p>
            <div className="trusted-gap" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 32, flexWrap: 'wrap' }}>
              {['Claude', 'Cursor', 'VS Code', 'GPT-4o', 'Gemini', 'Ollama', 'Windsurf', 'Continue.dev'].map(t => (
                <span key={t} className="trusted-item" style={{ fontSize: 15, fontWeight: 600, color: textDim, letterSpacing: '-0.01em' }}>{t}</span>
              ))}
            </div>
          </div>
        </section>

        {/* 3. Stats bar */}
        <section className="landing-section-pad" style={{ padding: '48px 32px', borderBottom: `1px solid ${borderColor}` }}>
          <div className="stats-bar-grid" style={{ maxWidth: 800, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2 }}>
            {stats.map(s => (
              <div key={s.label} style={{ textAlign: 'center', padding: '20px' }}>
                <div className="stat-value" style={{ fontSize: 42, fontWeight: 800, letterSpacing: '-0.04em', background: 'linear-gradient(135deg, #00e5ff, #a900ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: 13, color: textMuted, marginTop: 6 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* 4. Features carousel */}
        <FeaturesCarousel />

        {/* 5. Feature: AI Tools */}
        <FeatureSection
          tag={t('landing.toolsTag', { totalTools })}
          title={t('landing.toolsTitle')}
          description={t('landing.toolsDesc')}
          bullets={[t('landing.toolsBullet1'), t('landing.toolsBullet2'), t('landing.toolsBullet3'), t('landing.toolsBullet4'), t('landing.toolsBullet5')]}
          accentColor="#00e5ff"
          visual={<TerminalBlock lines={[
            { cyan: true, text: '$ mcp tools list | head -10' },
            { text: 'create_project       Create a new project workspace' },
            { text: 'list_features        List features by status and filter' },
            { text: 'advance_feature      Advance feature through lifecycle' },
            { text: 'save_memory          Store embedding + text to RAG' },
            { text: 'search_memory        Cosine similarity search' },
            { text: 'run_agent            Execute an AI agent with prompt' },
            { text: 'compare_providers    Run prompt across all providers' },
            { dim: true, text: t('landing.moreTools', { count: parseInt(totalTools) - 8 }) },
          ]} />}
        />

        {/* 6. Feature: Plugin Backbone */}
        <FeatureSection
          tag={t('landing.pluginTag')}
          title={t('landing.pluginTitle')}
          description={t('landing.pluginDesc')}
          bullets={[t('landing.pluginBullet1'), t('landing.pluginBullet2'), t('landing.pluginBullet3'), t('landing.pluginBullet4')]}
          accentColor="#a900ff"
          reverse
          visual={<PluginDiagram />}
        />

        {/* 7. Feature: RAG Memory */}
        <FeatureSection
          tag={t('landing.ragTag')}
          title={t('landing.ragTitle')}
          description={t('landing.ragDesc')}
          bullets={[t('landing.ragBullet1'), t('landing.ragBullet2'), t('landing.ragBullet3'), t('landing.ragBullet4')]}
          accentColor="#00e5ff"
          visual={<TerminalBlock lines={[
            { cyan: true, text: '# Index entire codebase' },
            { text: 'index_directory({ path: ".", recursive: true })' },
            { dim: true, text: '→ Indexed 2,847 files in 3.2s' },
            { text: '' },
            { cyan: true, text: '# Search with context' },
            { text: 'search_memory({ query: "QUIC transport" })' },
            { purple: true, text: '→ [0.94] libs/transport-quic-bridge/...' },
            { purple: true, text: '→ [0.91] libs/sdk-go/plugin/client.go' },
            { purple: true, text: '→ [0.88] docs/architecture.md' },
          ]} />}
        />

        {/* 8. Feature: Multi-Agent */}
        <FeatureSection
          tag={t('landing.multiAgentTag')}
          title={t('landing.multiAgentTitle')}
          description={t('landing.multiAgentDesc')}
          bullets={[t('landing.multiAgentBullet1'), t('landing.multiAgentBullet2'), t('landing.multiAgentBullet3'), t('landing.multiAgentBullet4')]}
          accentColor="#a900ff"
          reverse
          visual={<TerminalBlock lines={[
            { cyan: true, text: 'define_agent({' },
            { text: '  name: "code-reviewer",' },
            { text: '  provider: "claude",' },
            { text: '  instruction: "Review PRs for bugs..."' },
            { text: '})' },
            { text: '' },
            { cyan: true, text: 'run_workflow({ id: "review-pipeline" })' },
            { purple: true, text: '→ Step 1/3: code-reviewer    ✓ 1.2s' },
            { purple: true, text: '→ Step 2/3: security-scan    ✓ 0.8s' },
            { purple: true, text: '→ Step 3/3: doc-generator    ✓ 2.1s' },
            { dim: true, text: '  Workflow completed in 4.1s' },
          ]} />}
        />

        {/* 9. Feature: 5 Platforms */}
        <section className="landing-section-pad" style={{ padding: '80px 32px', maxWidth: 1200, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 100, border: '1px solid rgba(0,229,255,0.25)', background: 'rgba(0,229,255,0.06)', marginBottom: 20, fontSize: 12, fontWeight: 600, color: '#00e5ff', letterSpacing: '0.04em', textTransform: 'uppercase' as const }}>{t('landing.platformsTag')}</div>
          <h2 style={{ fontSize: 'clamp(24px, 3.5vw, 38px)', fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 16, color: textPrimary }}>{t('landing.platformsTitle')}</h2>
          <p style={{ fontSize: 16, color: textMuted, maxWidth: 500, margin: '0 auto 48px' }}>{t('landing.platformsSubtitle')}</p>
          <div className="platform-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16, maxWidth: 900, margin: '0 auto' }}>
            {[
              { icon: 'bxl-apple', label: 'macOS', sub: 'Swift + WidgetKit' },
              { icon: 'bxl-windows', label: 'Windows', sub: 'C# + WinUI 3' },
              { icon: 'bxl-tux', label: 'Linux', sub: 'Vala + GTK4' },
              { icon: 'bxl-chrome', label: 'Extension', sub: 'Manifest V3' },
              { icon: 'bx-mobile', label: 'Mobile', sub: 'iOS + Android' },
            ].map(p => (
              <div key={p.label} style={{ padding: '24px 16px', borderRadius: 14, border: `1px solid ${cardBorder}`, background: cardBg, textAlign: 'center' }}>
                <i className={`bx ${p.icon}`} style={{ fontSize: 32, color: '#00e5ff', marginBottom: 10, display: 'block' }} />
                <div style={{ fontSize: 14, fontWeight: 600, color: textPrimary, marginBottom: 4 }}>{p.label}</div>
                <div style={{ fontSize: 11, color: textMuted }}>{p.sub}</div>
              </div>
            ))}
          </div>
        </section>

        {/* 10. Blog preview */}
        <BlogPreview data={data.blog as Record<string, unknown>} />

        {/* 11. Pricing */}
        <PricingSection data={data.pricing as { plans?: Array<{ name: string; price: string; period: string; highlighted: boolean; cta?: string; href?: string; desc?: string; features?: string[] }> }} />

        {/* 12. CTA banner */}
        <section className="landing-section-pad" style={{ padding: '0 32px 100px' }}>
          <div className="cta-banner" style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center', padding: '72px 48px', borderRadius: 24, border: `1px solid ${cardBorder}`, background: cardBg, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 0%, rgba(169,0,255,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
            <div style={{ position: 'relative' }}>
              <h2 style={{ fontSize: 'clamp(26px, 4vw, 42px)', fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 14, color: textPrimary }}>{t('landing.ctaTitle')}</h2>
              <p style={{ fontSize: 16, color: textMuted, marginBottom: 36 }}>{t('landing.ctaSubtitle')}</p>
              <div className="cta-banner-btns" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                <Link href="/register" style={{ padding: '13px 32px', borderRadius: 10, fontSize: 15, fontWeight: 600, background: 'linear-gradient(135deg, #00e5ff, #a900ff)', color: '#fff', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                  {t('common.getStartedFree')} &rarr;
                </Link>
                <Link href="/docs" style={{ padding: '13px 24px', borderRadius: 10, fontSize: 15, fontWeight: 500, border: `1px solid ${ctaSecBorder}`, color: ctaSecColor, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                  {t('common.readTheDocs')}
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
