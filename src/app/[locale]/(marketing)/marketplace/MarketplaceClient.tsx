'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useScrollReveal, revealStyle } from '@/hooks/useScrollReveal'

/* ─── Data Types ────────────────────────────────────── */

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

interface Plugin {
  name: string
  display_name: string
  desc: string
  tools: number
  language: string
  repo: string
  color: string
}

interface SharedItem {
  slug: string
  name: string
  desc: string
  author: string
  author_handle: string
  type: 'skill' | 'agent' | 'workflow'
  stacks: string[]
  downloads: number
}

interface MarketplaceData {
  total_packs?: number
  framework_version?: string
  last_updated?: string
  packs?: Pack[]
}

/* ─── Static Data ───────────────────────────────────── */

const ALL_PLUGINS: Plugin[] = [
  { name: 'tools-features', display_name: 'Feature Workflow', desc: 'Gated feature lifecycle, plans, requests, git tools.', tools: 70, language: 'Go', repo: 'orchestra-mcp/plugin-tools-features', color: '#00e5ff' },
  { name: 'tools-marketplace', display_name: 'Marketplace', desc: 'Pack management, stack detection, content queries.', tools: 15, language: 'Go', repo: 'orchestra-mcp/plugin-tools-marketplace', color: '#a900ff' },
  { name: 'engine-rag', display_name: 'RAG Engine', desc: 'Tree-sitter parsing, Tantivy search, SQLite memory.', tools: 22, language: 'Rust', repo: 'orchestra-mcp/plugin-engine-rag', color: '#dea584' },
  { name: 'bridge-claude', display_name: 'Claude Bridge', desc: 'Anthropic Claude integration with streaming support.', tools: 5, language: 'Go', repo: 'orchestra-mcp/plugin-bridge-claude', color: '#d97757' },
  { name: 'bridge-openai', display_name: 'OpenAI Bridge', desc: 'GPT-4o + OpenAI-compatible providers (DeepSeek, Grok, etc).', tools: 5, language: 'Go', repo: 'orchestra-mcp/plugin-bridge-openai', color: '#10a37f' },
  { name: 'bridge-gemini', display_name: 'Gemini Bridge', desc: 'Google Gemini Pro and Flash models.', tools: 5, language: 'Go', repo: 'orchestra-mcp/plugin-bridge-gemini', color: '#4285f4' },
  { name: 'bridge-ollama', display_name: 'Ollama Bridge', desc: 'Local models — Llama, Mistral, CodeLlama, Phi.', tools: 5, language: 'Go', repo: 'orchestra-mcp/plugin-bridge-ollama', color: '#f8f8f8' },
  { name: 'bridge-firecrawl', display_name: 'Firecrawl Bridge', desc: 'Web scraping and structured data extraction.', tools: 5, language: 'Go', repo: 'orchestra-mcp/plugin-bridge-firecrawl', color: '#ff6b35' },
  { name: 'agent-orchestrator', display_name: 'Agent Orchestrator', desc: 'Multi-agent workflows, testing, provider comparison.', tools: 20, language: 'Go', repo: 'orchestra-mcp/plugin-agent-orchestrator', color: '#22c55e' },
  { name: 'tools-agentops', display_name: 'AgentOps', desc: 'AI provider accounts, budgets, and usage tracking.', tools: 8, language: 'Go', repo: 'orchestra-mcp/plugin-tools-agentops', color: '#f59e0b' },
  { name: 'tools-sessions', display_name: 'Sessions', desc: 'AI chat sessions with cross-provider dispatch.', tools: 6, language: 'Go', repo: 'orchestra-mcp/plugin-tools-sessions', color: '#8b5cf6' },
  { name: 'tools-workspace', display_name: 'Workspace', desc: 'Multi-workspace management with folder switching.', tools: 8, language: 'Go', repo: 'orchestra-mcp/plugin-tools-workspace', color: '#06b6d4' },
  { name: 'storage-markdown', display_name: 'Markdown Storage', desc: 'YAML frontmatter + markdown persistence layer.', tools: 0, language: 'Go', repo: 'orchestra-mcp/plugin-storage-markdown', color: '#64748b' },
  { name: 'transport-stdio', display_name: 'stdio Transport', desc: 'MCP stdio server for IDE communication.', tools: 0, language: 'Go', repo: 'orchestra-mcp/plugin-transport-stdio', color: '#64748b' },
]

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

const SAMPLE_COMMUNITY: SharedItem[] = [
  { slug: 'commit-reviewer', name: 'Commit Reviewer', desc: 'AI-powered code review for every commit with inline annotations.', author: 'Sarah Chen', author_handle: 'sarachen', type: 'skill', stacks: ['go', 'typescript'], downloads: 1240 },
  { slug: 'api-scaffolder', name: 'API Scaffolder', desc: 'Generate REST API boilerplate from an OpenAPI spec.', author: 'Marco Rossi', author_handle: 'mrossi', type: 'skill', stacks: ['go', 'rust'], downloads: 890 },
  { slug: 'security-auditor', name: 'Security Auditor', desc: 'Scan for OWASP Top 10, dependency vulns, and secret leaks.', author: 'Aisha Patel', author_handle: 'aishap', type: 'agent', stacks: ['*'], downloads: 2100 },
  { slug: 'db-migration-writer', name: 'DB Migration Writer', desc: 'Generate migration files from schema diffs with rollback support.', author: 'Lars Eriksson', author_handle: 'larse', type: 'agent', stacks: ['go', 'php'], downloads: 760 },
  { slug: 'pr-pipeline', name: 'PR Review Pipeline', desc: 'Multi-step workflow: lint → test → review → changelog.', author: 'Yuki Tanaka', author_handle: 'yukit', type: 'workflow', stacks: ['*'], downloads: 1560 },
  { slug: 'deploy-staging', name: 'Deploy to Staging', desc: 'Build → test → Docker push → deploy to staging with rollback.', author: 'Omar Hassan', author_handle: 'omarh', type: 'workflow', stacks: ['docker', 'go'], downloads: 920 },
]

const STACK_COLORS: Record<string, string> = {
  '*': '#00e5ff', go: '#00acd7', rust: '#dea584', react: '#61dafb', typescript: '#3178c6',
  'react-native': '#22c55e', swift: '#ff6723', kotlin: '#7f52ff', csharp: '#512bd4',
  c: '#fbbf24', docker: '#2496ed', php: '#777bb4', java: '#b07219', flutter: '#02569b',
}

const LANG_COLORS: Record<string, string> = {
  Go: '#00acd7', Rust: '#dea584', Swift: '#ff6723', Kotlin: '#7f52ff', 'C#': '#512bd4',
}

const TYPE_ICONS: Record<string, string> = {
  skill: 'bx-terminal', agent: 'bx-bot', workflow: 'bx-git-branch',
}

const TYPE_COLORS: Record<string, string> = {
  skill: '#00e5ff', agent: '#a900ff', workflow: '#22c55e',
}

/* ─── Tabs ──────────────────────────────────────────── */

type TabKey = 'plugins' | 'packs' | 'skills' | 'agents' | 'workflows'

const TABS: { key: TabKey; label: string; icon: string }[] = [
  { key: 'plugins', label: 'Plugins', icon: 'bx-plug' },
  { key: 'packs', label: 'Packs', icon: 'bx-package' },
  { key: 'skills', label: 'Skills', icon: 'bx-terminal' },
  { key: 'agents', label: 'Agents', icon: 'bx-bot' },
  { key: 'workflows', label: 'Workflows', icon: 'bx-git-branch' },
]

/* ─── Deep Link Helper ──────────────────────────────── */

function deepLink(type: string, slug: string): string {
  return `orchestra://install/${type}/${slug}`
}

/* ─── Component ─────────────────────────────────────── */

export default function MarketplaceClient({ data }: { data: MarketplaceData }) {
  const [tab, setTab] = useState<TabKey>('plugins')
  const [filter, setFilter] = useState<string>('all')
  const [visibleCards, setVisibleCards] = useState<Set<number>>(new Set())
  const gridRef = useRef<HTMLDivElement>(null)

  const packs: Pack[] = data.packs?.length ? data.packs : ALL_PACKS
  const totalPacks = data.total_packs ?? packs.length
  const frameworkVersion = data.framework_version ?? 'v1.0.4'

  const allStacks = [...new Set(packs.flatMap(p => (p.stacks || []).filter(s => s !== '*')))]
  const filterTabs = ['all', ...allStacks.slice(0, 8)]

  const filteredPacks = filter === 'all'
    ? packs
    : packs.filter(p => p.stacks?.includes(filter) || p.stacks?.includes('*'))

  const communityItems = SAMPLE_COMMUNITY.filter(i => {
    if (tab === 'skills') return i.type === 'skill'
    if (tab === 'agents') return i.type === 'agent'
    if (tab === 'workflows') return i.type === 'workflow'
    return false
  })

  const headerReveal = useScrollReveal({ threshold: 0.2 })
  const ctaReveal = useScrollReveal({ threshold: 0.15 })

  useEffect(() => {
    setVisibleCards(new Set())
    const t = setTimeout(() => {
      const observer = new IntersectionObserver(
        entries => entries.forEach(entry => {
          if (entry.isIntersecting) {
            const idx = Number(entry.target.getAttribute('data-idx'))
            setVisibleCards(prev => new Set(prev).add(idx))
          }
        }),
        { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
      )
      const cards = gridRef.current?.querySelectorAll('[data-idx]')
      cards?.forEach(card => observer.observe(card))
      return () => observer.disconnect()
    }, 50)
    return () => clearTimeout(t)
  }, [tab, filter])

  return (
    <div className="mkt-page" style={{ maxWidth: 1100, margin: '0 auto', padding: '72px 32px' }}>
      <style>{`
        .pack-card { transition: border-color 0.2s, box-shadow 0.2s; }
        .pack-card:hover { border-color: rgba(0,229,255,0.25) !important; box-shadow: 0 0 24px rgba(0,229,255,0.06); }
        .mkt-tab { transition: all 0.2s; }
        .mkt-tab:hover { background: var(--color-bg-active, rgba(255,255,255,0.04)) !important; }
        @media (max-width: 640px) {
          .mkt-grid-2 { grid-template-columns: 1fr !important; }
          .mkt-grid-3 { grid-template-columns: 1fr !important; }
          .mkt-filters { flex-wrap: wrap !important; }
          .mkt-tabs { gap: 4px !important; }
          .mkt-tab { padding: 8px 12px !important; font-size: 12px !important; }
        }
      `}</style>

      {/* Header */}
      <div ref={headerReveal.ref} style={{ marginBottom: 40, textAlign: 'center', ...revealStyle(headerReveal.isVisible) }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 100,
          border: '1px solid rgba(0,229,255,0.25)', background: 'rgba(0,229,255,0.06)',
          marginBottom: 20, fontSize: 12, fontWeight: 600, color: '#00e5ff',
          letterSpacing: '0.04em', textTransform: 'uppercase',
        }}>
          {ALL_PLUGINS.length} Plugins &middot; {totalPacks} Packs
        </div>
        <h1 style={{
          fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 800, letterSpacing: '-0.04em',
          color: 'var(--color-fg, #f8f8f8)', marginBottom: 14,
        }}>Marketplace</h1>
        <p style={{
          fontSize: 17, maxWidth: 560, margin: '0 auto 24px',
          color: 'var(--color-fg-muted, rgba(255,255,255,0.45))',
        }}>
          Plugins, packs, skills, agents, and workflows — install or share with one click.
        </p>

        {/* Version badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 16, padding: '10px 20px', borderRadius: 10,
          background: 'rgba(0,229,255,0.06)', border: '1px solid rgba(0,229,255,0.15)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <i className="bx bx-package" style={{ fontSize: 16, color: '#00e5ff' }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-fg, #f8f8f8)' }}>
              Framework {frameworkVersion}
            </span>
          </div>
          <div style={{ width: 1, height: 16, background: 'var(--color-border, rgba(255,255,255,0.1))' }} />
          <div style={{ fontSize: 12, color: 'var(--color-fg-muted, rgba(255,255,255,0.45))' }}>
            {ALL_PLUGINS.reduce((a, p) => a + p.tools, 0)} tools across {ALL_PLUGINS.length} plugins
          </div>
        </div>
      </div>

      {/* Top-level tabs */}
      <div className="mkt-tabs" style={{
        display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 32,
        borderBottom: '1px solid var(--color-border, rgba(255,255,255,0.06))', paddingBottom: 12,
      }}>
        {TABS.map(t => (
          <button
            key={t.key}
            className="mkt-tab"
            onClick={() => { setTab(t.key); setFilter('all') }}
            style={{
              padding: '10px 20px', borderRadius: 10, fontSize: 14, fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer',
              background: tab === t.key ? 'rgba(0,229,255,0.08)' : 'transparent',
              border: tab === t.key ? '1px solid rgba(0,229,255,0.3)' : '1px solid transparent',
              color: tab === t.key ? '#00e5ff' : 'var(--color-fg-muted, rgba(255,255,255,0.45))',
            }}
          >
            <i className={`bx ${t.icon}`} style={{ fontSize: 16 }} />
            {t.label}
          </button>
        ))}
      </div>

      {/* ─── Plugins Tab ─────────────────────── */}
      {tab === 'plugins' && (
        <>
          <div ref={gridRef} className="mkt-grid-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
            {ALL_PLUGINS.map((plugin, idx) => (
              <Link
                key={plugin.name}
                href={`/marketplace/plugins/${plugin.name}`}
                data-idx={idx}
                className="pack-card"
                style={{
                  padding: '24px', borderRadius: 16, textDecoration: 'none',
                  border: '1px solid var(--color-border, rgba(255,255,255,0.07))',
                  background: 'var(--color-bg-alt, rgba(255,255,255,0.02))',
                  display: 'flex', flexDirection: 'column', gap: 12,
                  opacity: visibleCards.has(idx) ? 1 : 0,
                  transform: visibleCards.has(idx) ? 'translateY(0)' : 'translateY(16px)',
                  transition: `opacity 0.4s ${idx * 0.03}s ease-out, transform 0.4s ${idx * 0.03}s ease-out`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-fg, #f8f8f8)' }}>{plugin.display_name}</span>
                      <span style={{
                        fontSize: 10, fontWeight: 600, padding: '2px 6px', borderRadius: 4,
                        background: `${LANG_COLORS[plugin.language] ?? '#888'}18`,
                        color: LANG_COLORS[plugin.language] ?? '#888',
                      }}>{plugin.language}</span>
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--color-fg-muted, rgba(255,255,255,0.45))', lineHeight: 1.6, margin: 0 }}>{plugin.desc}</p>
                  </div>
                  <div style={{
                    width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                    background: `${plugin.color}18`, border: `1px solid ${plugin.color}30`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <i className="bx bx-plug" style={{ fontSize: 20, color: plugin.color }} />
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 12, color: 'var(--color-fg-dim, rgba(255,255,255,0.35))' }}>
                    {plugin.tools > 0 ? `${plugin.tools} tools` : 'Transport'}
                  </span>
                  <span style={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace', color: 'var(--color-fg-dim, rgba(255,255,255,0.25))' }}>
                    orchestra plugin install {plugin.name}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}

      {/* ─── Packs Tab ───────────────────────── */}
      {tab === 'packs' && (
        <>
          {/* Stack filters */}
          <div className="mkt-filters" style={{ display: 'flex', gap: 6, marginBottom: 24, overflowX: 'auto', paddingBottom: 4 }}>
            {filterTabs.map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                  background: filter === f ? 'rgba(0,229,255,0.12)' : 'var(--color-bg-alt, rgba(255,255,255,0.04))',
                  border: `1px solid ${filter === f ? 'rgba(0,229,255,0.3)' : 'var(--color-border, rgba(255,255,255,0.08))'}`,
                  color: filter === f ? '#00e5ff' : 'var(--color-fg-muted, rgba(255,255,255,0.45))',
                  cursor: 'pointer', whiteSpace: 'nowrap', textTransform: 'capitalize',
                }}
              >
                {f === 'all' ? `All (${packs.length})` : f}
              </button>
            ))}
          </div>

          <div ref={gridRef} className="mkt-grid-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
            {filteredPacks.map((pack, idx) => (
              <Link
                key={pack.name}
                href={`/marketplace/packs/${pack.name}`}
                data-idx={idx}
                className="pack-card"
                style={{
                  padding: '24px', borderRadius: 16, textDecoration: 'none',
                  border: '1px solid var(--color-border, rgba(255,255,255,0.07))',
                  background: 'var(--color-bg-alt, rgba(255,255,255,0.02))',
                  display: 'flex', flexDirection: 'column', gap: 14,
                  opacity: visibleCards.has(idx) ? 1 : 0,
                  transform: visibleCards.has(idx) ? 'translateY(0)' : 'translateY(16px)',
                  transition: `opacity 0.4s ${idx * 0.04}s ease-out, transform 0.4s ${idx * 0.04}s ease-out`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-fg, #f8f8f8)' }}>{pack.display_name}</span>
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--color-fg-muted, rgba(255,255,255,0.45))', lineHeight: 1.6, margin: 0 }}>{pack.desc}</p>
                  </div>
                  <div style={{
                    width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                    background: `${pack.color}18`, border: `1px solid ${pack.color}30`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <i className="bx bx-package" style={{ fontSize: 20, color: pack.color }} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {(pack.stacks || []).map(s => (
                    <span key={s} style={{
                      fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 4,
                      background: `${STACK_COLORS[s] ?? '#888'}12`,
                      color: STACK_COLORS[s] ?? '#888',
                      border: `1px solid ${STACK_COLORS[s] ?? '#888'}25`,
                    }}>{s === '*' ? 'universal' : s}</span>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 16 }}>
                  {[
                    { label: 'skills', value: pack.skills },
                    { label: 'agents', value: pack.agents },
                    { label: 'hooks', value: pack.hooks },
                  ].filter(s => s.value > 0).map(s => (
                    <div key={s.label} style={{ fontSize: 12, color: 'var(--color-fg-dim, rgba(255,255,255,0.35))' }}>
                      <span style={{ fontWeight: 600, color: 'var(--color-fg, #f8f8f8)' }}>{s.value}</span> {s.label}
                    </div>
                  ))}
                </div>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 8,
                  background: 'var(--color-bg-alt, rgba(255,255,255,0.03))',
                  border: '1px solid var(--color-border, rgba(255,255,255,0.06))',
                  fontFamily: 'JetBrains Mono, monospace', fontSize: 12, marginTop: 'auto',
                }}>
                  <span style={{ color: 'var(--color-fg-dim, rgba(255,255,255,0.35))' }}>$</span>
                  <span style={{ color: 'var(--color-fg, #f8f8f8)', opacity: 0.7 }}>orchestra pack install {pack.name}</span>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}

      {/* ─── Skills / Agents / Workflows Tab ── */}
      {(tab === 'skills' || tab === 'agents' || tab === 'workflows') && (
        <>
          <div style={{
            padding: '20px 24px', borderRadius: 14, marginBottom: 24,
            border: '1px solid rgba(0,229,255,0.15)', background: 'rgba(0,229,255,0.04)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
          }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-fg, #f8f8f8)', marginBottom: 4 }}>
                Share your {tab}
              </div>
              <div style={{ fontSize: 13, color: 'var(--color-fg-muted, rgba(255,255,255,0.45))' }}>
                Publish your {tab === 'skills' ? 'slash commands' : tab} to the marketplace for others to install.
              </div>
            </div>
            <Link href={`/marketplace/publish?type=${tab.replace(/s$/, '')}`} style={{
              padding: '10px 20px', borderRadius: 9, fontSize: 13, fontWeight: 600,
              background: 'linear-gradient(135deg, #00e5ff, #a900ff)', color: '#fff',
              textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6,
            }}>
              <i className="bx bx-upload" /> Publish
            </Link>
          </div>

          <div ref={gridRef} className="mkt-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {communityItems.map((item, idx) => (
              <Link
                key={item.slug}
                href={`/marketplace/${item.type}s/${item.slug}`}
                data-idx={idx}
                className="pack-card"
                style={{
                  padding: '20px', borderRadius: 14, textDecoration: 'none',
                  border: '1px solid var(--color-border, rgba(255,255,255,0.07))',
                  background: 'var(--color-bg-alt, rgba(255,255,255,0.02))',
                  display: 'flex', flexDirection: 'column', gap: 10,
                  opacity: visibleCards.has(idx) ? 1 : 0,
                  transform: visibleCards.has(idx) ? 'translateY(0)' : 'translateY(16px)',
                  transition: `opacity 0.4s ${idx * 0.05}s ease-out, transform 0.4s ${idx * 0.05}s ease-out`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <i className={`bx ${TYPE_ICONS[item.type]}`} style={{ fontSize: 18, color: TYPE_COLORS[item.type] }} />
                  <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-fg, #f8f8f8)' }}>{item.name}</span>
                </div>
                <p style={{ fontSize: 13, color: 'var(--color-fg-muted, rgba(255,255,255,0.45))', lineHeight: 1.5, margin: 0, flex: 1 }}>
                  {item.desc}
                </p>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {item.stacks.map(s => (
                    <span key={s} style={{
                      fontSize: 9, fontWeight: 600, padding: '2px 6px', borderRadius: 4,
                      background: `${STACK_COLORS[s] ?? '#888'}12`,
                      color: STACK_COLORS[s] ?? '#888',
                    }}>{s === '*' ? 'universal' : s}</span>
                  ))}
                </div>
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  paddingTop: 8, borderTop: '1px solid var(--color-border, rgba(255,255,255,0.06))',
                }}>
                  <Link href={`/member/${item.author_handle}`} onClick={e => e.stopPropagation()} style={{
                    fontSize: 12, color: 'var(--color-fg-dim, rgba(255,255,255,0.35))', textDecoration: 'none',
                  }}>
                    by <span style={{ color: 'var(--color-fg-muted, rgba(255,255,255,0.55))' }}>{item.author}</span>
                  </Link>
                  <span style={{ fontSize: 11, color: 'var(--color-fg-dim, rgba(255,255,255,0.25))' }}>
                    {item.downloads.toLocaleString()} installs
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {communityItems.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <i className={`bx ${TYPE_ICONS[tab.replace(/s$/, '') as string] ?? 'bx-package'}`} style={{ fontSize: 48, color: 'var(--color-fg-dim, rgba(255,255,255,0.15))', marginBottom: 12, display: 'block' }} />
              <p style={{ fontSize: 15, color: 'var(--color-fg-muted, rgba(255,255,255,0.4))' }}>
                No community {tab} yet. Be the first to publish!
              </p>
            </div>
          )}
        </>
      )}

      {/* Stats summary */}
      <div style={{
        marginTop: 48, display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)',
        gap: 12, textAlign: 'center',
      }}>
        {[
          { value: ALL_PLUGINS.length, label: 'Plugins', color: '#00e5ff' },
          { value: totalPacks, label: 'Packs', color: '#a900ff' },
          { value: packs.reduce((a, p) => a + p.skills, 0), label: 'Skills', color: '#22c55e' },
          { value: packs.reduce((a, p) => a + p.agents, 0), label: 'Agents', color: '#f59e0b' },
          { value: allStacks.length, label: 'Stacks', color: '#fbbf24' },
        ].map(s => (
          <div key={s.label} style={{
            padding: '16px', borderRadius: 12,
            border: '1px solid var(--color-border, rgba(255,255,255,0.07))',
            background: 'var(--color-bg-alt, rgba(255,255,255,0.02))',
          }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: s.color, marginBottom: 2 }}>{s.value}</div>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-fg-muted, rgba(255,255,255,0.4))', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Bottom CTA */}
      <div ref={ctaReveal.ref} style={{
        marginTop: 48, textAlign: 'center', padding: '48px', borderRadius: 20,
        border: '1px solid var(--color-border, rgba(255,255,255,0.07))',
        background: 'var(--color-bg-alt, rgba(255,255,255,0.02))',
        ...revealStyle(ctaReveal.isVisible),
      }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-fg, #f8f8f8)', marginBottom: 10 }}>Build your own</h2>
        <p style={{ fontSize: 15, color: 'var(--color-fg-muted, rgba(255,255,255,0.45))', marginBottom: 24, maxWidth: 440, margin: '0 auto 24px' }}>
          Create plugins in Go or Rust, or share your skills, agents, and workflows with the community.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="https://github.com/orchestra-mcp" target="_blank" rel="noopener" style={{
            padding: '11px 24px', borderRadius: 9, fontSize: 14, fontWeight: 600,
            background: 'var(--color-bg-active, rgba(255,255,255,0.06))',
            color: 'var(--color-fg, #f8f8f8)', textDecoration: 'none',
            border: '1px solid var(--color-border, rgba(255,255,255,0.1))',
            display: 'inline-flex', alignItems: 'center', gap: 8,
          }}>
            <i className="bx bxl-github" style={{ fontSize: 18 }} /> View on GitHub
          </a>
          <Link href="/docs/sdk/architecture" style={{
            padding: '11px 24px', borderRadius: 9, fontSize: 14, fontWeight: 600,
            background: 'linear-gradient(135deg, #00e5ff, #a900ff)',
            color: '#fff', textDecoration: 'none',
            display: 'inline-flex', alignItems: 'center', gap: 8,
          }}>
            Plugin SDK Docs <i className="bx bx-right-arrow-alt rtl-flip" />
          </Link>
        </div>
      </div>
    </div>
  )
}
