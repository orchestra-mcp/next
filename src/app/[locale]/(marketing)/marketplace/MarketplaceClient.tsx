'use client'
import { useState, useEffect, useRef } from 'react'
import { useThemeStore } from '@/store/theme'
import { useTranslations } from 'next-intl'
import { useScrollReveal, revealStyle } from '@/hooks/useScrollReveal'

interface Pack {
  name: string
  display_name: string
  desc: string
  skills: number
  agents: number
  hooks: number
  color: string
  tags: string[]
  stacks: string[]
}

interface MarketplaceData {
  total_packs?: number
  framework_version?: string
  last_updated?: string
  packs?: Pack[]
}

const ALL_PACKS: Pack[] = [
  { name: 'essentials', display_name: 'Essentials', desc: 'Core project management, QA testing, docs, and plugin scaffolding.', skills: 4, agents: 3, hooks: 1, color: '#00e5ff', tags: ['core'], stacks: ['*'] },
  { name: 'go-backend', display_name: 'Go Backend', desc: 'Fiber v3, GORM, JWT, asynq, and Go API development patterns.', skills: 1, agents: 2, hooks: 0, color: '#00acd7', tags: ['go'], stacks: ['go'] },
  { name: 'rust-engine', display_name: 'Rust Engine', desc: 'Tonic gRPC, Tree-sitter, Tantivy, and rusqlite patterns.', skills: 1, agents: 2, hooks: 0, color: '#dea584', tags: ['rust'], stacks: ['rust'] },
  { name: 'react-frontend', display_name: 'React Frontend', desc: 'React, Zustand, shadcn/ui, Tailwind CSS v4, and TypeScript.', skills: 3, agents: 3, hooks: 0, color: '#61dafb', tags: ['react'], stacks: ['react', 'typescript'] },
  { name: 'ai', display_name: 'AI & Agentic', desc: 'LLM integration, RAG pipelines, embeddings, and vector search.', skills: 1, agents: 2, hooks: 0, color: '#a900ff', tags: ['ai'], stacks: ['*'] },
  { name: 'database', display_name: 'Database', desc: 'PostgreSQL, SQLite, Redis sync and data layer patterns.', skills: 1, agents: 4, hooks: 0, color: '#336791', tags: ['database'], stacks: ['*'] },
  { name: 'desktop', display_name: 'Desktop', desc: 'Wails v3, macOS integration, and native widget patterns.', skills: 3, agents: 2, hooks: 0, color: '#f97316', tags: ['desktop'], stacks: ['go'] },
  { name: 'mobile', display_name: 'Mobile', desc: 'React Native, WatermelonDB, and offline sync patterns.', skills: 1, agents: 1, hooks: 0, color: '#22c55e', tags: ['mobile'], stacks: ['react-native'] },
  { name: 'extensions', display_name: 'Extensions', desc: 'Native extension API, Raycast compat, VS Code compat, and marketplace.', skills: 4, agents: 1, hooks: 0, color: '#8b5cf6', tags: ['extensions'], stacks: ['*'] },
  { name: 'chrome', display_name: 'Chrome Extension', desc: 'Chrome Manifest V3, service worker, and content scripts.', skills: 1, agents: 0, hooks: 0, color: '#4285f4', tags: ['chrome'], stacks: ['typescript'] },
  { name: 'infra', display_name: 'Infrastructure', desc: 'Docker, GCP, CI/CD, and deployment patterns.', skills: 1, agents: 1, hooks: 0, color: '#ef4444', tags: ['devops'], stacks: ['docker'] },
  { name: 'proto', display_name: 'Proto & gRPC', desc: 'Protobuf, Buf, tonic-build, and Go-Rust code generation.', skills: 1, agents: 1, hooks: 0, color: '#16a34a', tags: ['proto'], stacks: ['go', 'rust'] },
  { name: 'native-swift', display_name: 'Swift / Apple', desc: 'macOS, iOS, SwiftUI, WidgetKit, and Apple platform plugins.', skills: 0, agents: 1, hooks: 0, color: '#ff6723', tags: ['swift'], stacks: ['swift'] },
  { name: 'native-kotlin', display_name: 'Kotlin / Android', desc: 'Jetpack Compose, Android plugins, and Kotlin patterns.', skills: 0, agents: 1, hooks: 0, color: '#7f52ff', tags: ['kotlin'], stacks: ['kotlin', 'java'] },
  { name: 'native-csharp', display_name: 'C# / Windows', desc: 'WinUI 3, .NET plugins, and Windows platform integration.', skills: 0, agents: 1, hooks: 0, color: '#512bd4', tags: ['csharp'], stacks: ['csharp'] },
  { name: 'native-gtk', display_name: 'GTK / Linux', desc: 'GTK4, libadwaita, GNOME desktop integration, and Flatpak.', skills: 0, agents: 1, hooks: 0, color: '#fbbf24', tags: ['gtk'], stacks: ['c'] },
  { name: 'analytics', display_name: 'Analytics', desc: 'ClickHouse OLAP, metrics, time-series, and materialized views.', skills: 0, agents: 1, hooks: 0, color: '#facc15', tags: ['analytics'], stacks: ['*'] },
  { name: 'laravel', display_name: 'Laravel', desc: 'Eloquent, Blade, Artisan, queues, events, and PHP testing.', skills: 1, agents: 2, hooks: 0, color: '#ff2d20', tags: ['php'], stacks: ['php'] },
  { name: 'inertia', display_name: 'Inertia.js', desc: 'Server-driven SPAs with Laravel + React/Vue/Svelte.', skills: 1, agents: 1, hooks: 0, color: '#9553e9', tags: ['inertia'], stacks: ['php', 'react', 'typescript'] },
  { name: 'tailwind', display_name: 'Tailwind CSS', desc: 'Tailwind v4, utility-first styling, responsive, and dark mode.', skills: 1, agents: 1, hooks: 0, color: '#06b6d4', tags: ['css'], stacks: ['react', 'typescript', 'php'] },
  { name: 'powersync', display_name: 'PowerSync', desc: 'Offline-first sync — Postgres/MongoDB to SQLite in real-time.', skills: 1, agents: 1, hooks: 0, color: '#3b82f6', tags: ['sync'], stacks: ['react', 'react-native', 'typescript', 'flutter'] },
  { name: 'gcp', display_name: 'Google Cloud', desc: 'Cloud Run, Cloud SQL, Cloud Build, CDN, and Pub/Sub.', skills: 1, agents: 1, hooks: 0, color: '#4285f4', tags: ['gcp'], stacks: ['docker', 'go', 'typescript'] },
  { name: 'docker', display_name: 'Docker', desc: 'Dockerfile, Compose, multi-stage builds, and registries.', skills: 1, agents: 1, hooks: 0, color: '#2496ed', tags: ['docker'], stacks: ['docker'] },
  { name: 'go-adk', display_name: 'Go ADK', desc: 'Google Agent Development Kit — AI agents, tools, and Gemini.', skills: 1, agents: 1, hooks: 0, color: '#00897b', tags: ['ai'], stacks: ['go'] },
]

const STACK_COLORS: Record<string, string> = {
  '*': '#00e5ff', go: '#00acd7', rust: '#dea584', react: '#61dafb', typescript: '#3178c6',
  'react-native': '#22c55e', swift: '#ff6723', kotlin: '#7f52ff', csharp: '#512bd4',
  c: '#fbbf24', docker: '#2496ed', php: '#777bb4', java: '#b07219', flutter: '#02569b',
}

export default function MarketplaceClient({ data }: { data: MarketplaceData }) {
  const t = useTranslations()
  const { theme } = useThemeStore()
  const isDark = theme === 'dark'
  const [filter, setFilter] = useState<string>('all')
  const [visibleCards, setVisibleCards] = useState<Set<number>>(new Set())
  const gridRef = useRef<HTMLDivElement>(null)

  const textPrimary = isDark ? '#f8f8f8' : '#0f0f12'
  const textMuted = isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.5)'
  const textDim = isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.35)'
  const cardBg = isDark ? 'rgba(255,255,255,0.02)' : '#ffffff'
  const cardBorder = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)'
  const cmdBg = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)'
  const cmdBorder = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.07)'
  const cmdPromptColor = isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.3)'
  const cmdTextColor = isDark ? '#f8f8f8' : '#0f0f12'
  const statLabelColor = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)'
  const ctaBg = isDark ? 'rgba(255,255,255,0.02)' : '#ffffff'
  const ctaBorder = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)'
  const ghBtnBg = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'
  const ghBtnBorder = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
  const installBg = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'
  const installBorder = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'
  const filterBg = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'
  const filterActiveBg = isDark ? 'rgba(0,229,255,0.12)' : 'rgba(0,229,255,0.1)'
  const filterBorder = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'
  const versionBadgeBg = isDark ? 'rgba(0,229,255,0.08)' : 'rgba(0,229,255,0.06)'

  const packs: Pack[] = data.packs?.length ? data.packs : ALL_PACKS
  const totalPacks = data.total_packs ?? packs.length
  const frameworkVersion = data.framework_version ?? 'v1.0.2'
  const lastUpdated = data.last_updated ?? 'March 11, 2026'

  // Stack filter tabs
  const allStacks = [...new Set(packs.flatMap(p => (p.stacks || []).filter(s => s !== '*')))]
  const filterTabs = ['all', ...allStacks.slice(0, 8)]

  const filteredPacks = filter === 'all'
    ? packs
    : packs.filter(p => p.stacks?.includes(filter) || p.stacks?.includes('*'))

  const headerReveal = useScrollReveal({ threshold: 0.2 })
  const statsReveal = useScrollReveal({ threshold: 0.15 })
  const ctaReveal = useScrollReveal({ threshold: 0.15 })

  // Intersection observer for scroll animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const idx = Number(entry.target.getAttribute('data-idx'))
            setVisibleCards(prev => new Set(prev).add(idx))
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    )
    const cards = gridRef.current?.querySelectorAll('[data-idx]')
    cards?.forEach(card => observer.observe(card))
    return () => observer.disconnect()
  }, [filteredPacks])

  return (
    <div className="mkt-page" style={{ maxWidth: 1100, margin: '0 auto', padding: '72px 32px' }}>
      <style>{`
        @keyframes packCardIn {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .pack-card { transition: border-color 0.2s ease, box-shadow 0.2s ease; }
        .pack-card:hover { border-color: rgba(0,229,255,0.25) !important; box-shadow: 0 0 24px rgba(0,229,255,0.06); }
        @media (max-width: 640px) { .mkt-grid-2 { grid-template-columns: 1fr !important; } .mkt-filters { flex-wrap: wrap !important; } }
      `}</style>

      {/* Header */}
      <div ref={headerReveal.ref} style={{ marginBottom: 48, textAlign: 'center', ...revealStyle(headerReveal.isVisible) }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 100, border: '1px solid rgba(0,229,255,0.25)', background: 'rgba(0,229,255,0.06)', marginBottom: 20, fontSize: 12, fontWeight: 600, color: '#00e5ff', letterSpacing: '0.04em', textTransform: 'uppercase' as const }}>
          {totalPacks} Official Packs
        </div>
        <h1 style={{ fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 800, letterSpacing: '-0.04em', color: textPrimary, marginBottom: 14 }}>{t('marketplace.title')}</h1>
        <p style={{ fontSize: 17, color: textMuted, maxWidth: 500, margin: '0 auto 24px' }}>{t('marketplace.subtitle')}</p>

        {/* Version badge */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 16, padding: '10px 20px', borderRadius: 10, background: versionBadgeBg, border: '1px solid rgba(0,229,255,0.15)', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <i className="bx bx-package" style={{ fontSize: 16, color: '#00e5ff' }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: textPrimary }}>Framework {frameworkVersion}</span>
          </div>
          <div style={{ width: 1, height: 16, background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }} />
          <div style={{ fontSize: 12, color: textMuted }}>
            Last updated {lastUpdated}
          </div>
        </div>

        {/* Install snippet */}
        <div style={{ display: 'block' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, padding: '12px 20px', borderRadius: 10, background: installBg, border: `1px solid ${installBorder}`, fontFamily: 'JetBrains Mono, monospace', fontSize: 13 }}>
            <span style={{ color: cmdPromptColor }}>$</span>
            <span style={{ color: textPrimary }}>orchestra pack install <span style={{ color: '#00e5ff' }}>go-backend</span></span>
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="mkt-filters" style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 24, overflowX: 'auto', paddingBottom: 4 }}>
        {filterTabs.map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            style={{
              padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600,
              background: filter === tab ? filterActiveBg : filterBg,
              border: `1px solid ${filter === tab ? 'rgba(0,229,255,0.3)' : filterBorder}`,
              color: filter === tab ? '#00e5ff' : textMuted,
              cursor: 'pointer', whiteSpace: 'nowrap',
              textTransform: 'capitalize',
              transition: 'all 0.2s ease',
            }}
          >
            {tab === 'all' ? `All (${packs.length})` : tab}
          </button>
        ))}
      </div>

      {/* Packs grid */}
      <div ref={gridRef} className="mkt-grid-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
        {filteredPacks.map((pack, idx) => (
          <div
            key={pack.name}
            data-idx={idx}
            className="pack-card"
            style={{
              padding: '24px', borderRadius: 16,
              border: `1px solid ${cardBorder}`, background: cardBg,
              display: 'flex', flexDirection: 'column', gap: 14,
              opacity: visibleCards.has(idx) ? 1 : 0,
              transform: visibleCards.has(idx) ? 'translateY(0)' : 'translateY(16px)',
              transition: `opacity 0.4s ${idx * 0.04}s ease-out, transform 0.4s ${idx * 0.04}s ease-out`,
            }}
          >
            {/* Top row */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 16, fontWeight: 700, color: textPrimary }}>{pack.display_name}</span>
                  <span style={{ fontSize: 10, fontWeight: 600, color: textDim, padding: '2px 6px', borderRadius: 4, background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)' }}>v0.1.0</span>
                </div>
                <p style={{ fontSize: 13, color: textMuted, lineHeight: 1.6, margin: 0 }}>{pack.desc}</p>
              </div>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: `${pack.color}18`, border: `1px solid ${pack.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <i className="bx bx-package" style={{ fontSize: 20, color: pack.color }} />
              </div>
            </div>

            {/* Stacks */}
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {(pack.stacks || []).map(s => (
                <span key={s} style={{
                  fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 4,
                  background: `${STACK_COLORS[s] ?? '#888'}12`,
                  color: STACK_COLORS[s] ?? '#888',
                  border: `1px solid ${STACK_COLORS[s] ?? '#888'}25`,
                }}>
                  {s === '*' ? 'universal' : s}
                </span>
              ))}
            </div>

            {/* Stats */}
            <div style={{ display: 'flex', gap: 16 }}>
              {[
                { label: 'skills', value: pack.skills },
                { label: 'agents', value: pack.agents },
                { label: 'hooks', value: pack.hooks },
              ].filter(s => s.value > 0).map(s => (
                <div key={s.label} style={{ fontSize: 12, color: statLabelColor }}>
                  <span style={{ fontWeight: 600, color: textPrimary }}>{s.value}</span> {s.label}
                </div>
              ))}
            </div>

            {/* Install command */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 8, background: cmdBg, border: `1px solid ${cmdBorder}`, fontFamily: 'JetBrains Mono, monospace', fontSize: 12, marginTop: 'auto' }}>
              <span style={{ color: cmdPromptColor }}>$</span>
              <span style={{ color: cmdTextColor, opacity: 0.7 }}>orchestra pack install {pack.name}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Stats summary */}
      <div ref={statsReveal.ref} style={{ marginTop: 48, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, textAlign: 'center', ...revealStyle(statsReveal.isVisible) }}>
        {[
          { value: totalPacks, label: 'Packs', color: '#00e5ff' },
          { value: packs.reduce((a, p) => a + p.skills, 0), label: 'Skills', color: '#a900ff' },
          { value: packs.reduce((a, p) => a + p.agents, 0), label: 'Agents', color: '#22c55e' },
          { value: allStacks.length, label: 'Stacks', color: '#fbbf24' },
        ].map(s => (
          <div key={s.label} style={{ padding: '20px', borderRadius: 12, border: `1px solid ${cardBorder}`, background: cardBg }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: s.color, marginBottom: 4 }}>{s.value}</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: textMuted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Bottom CTA */}
      <div ref={ctaReveal.ref} style={{ marginTop: 48, textAlign: 'center', padding: '48px', borderRadius: 20, border: `1px solid ${ctaBorder}`, background: ctaBg, ...revealStyle(ctaReveal.isVisible) }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: textPrimary, marginBottom: 10 }}>{t('marketplace.buildYourOwn')}</h2>
        <p style={{ fontSize: 15, color: textMuted, marginBottom: 24, maxWidth: 440, margin: '0 auto 24px' }}>{t('marketplace.buildYourOwnDesc')}</p>
        <a href="https://github.com/orchestra-mcp" target="_blank" rel="noopener" style={{ padding: '11px 24px', borderRadius: 9, fontSize: 14, fontWeight: 600, background: ghBtnBg, color: textPrimary, textDecoration: 'none', border: `1px solid ${ghBtnBorder}`, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <i className="bx bxl-github" style={{ fontSize: 18 }} /> {t('marketplace.viewOnGithub')}
        </a>
      </div>
    </div>
  )
}
