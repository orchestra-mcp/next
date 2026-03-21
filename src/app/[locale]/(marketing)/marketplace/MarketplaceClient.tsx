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
  plugins?: Plugin[]
  total_plugins?: number
  total_tools?: number
  community_items?: SharedItem[]
}

/* ─── Color Maps ────────────────────────────────────── */

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

/* ─── Component ─────────────────────────────────────── */

export default function MarketplaceClient({ data }: { data: MarketplaceData }) {
  const [tab, setTab] = useState<TabKey>('plugins')
  const [filter, setFilter] = useState<string>('all')
  const [visibleCards, setVisibleCards] = useState<Set<number>>(new Set())
  const gridRef = useRef<HTMLDivElement>(null)

  const plugins: Plugin[] = data.plugins ?? []
  const packs: Pack[] = data.packs ?? []
  const communityItems: SharedItem[] = (data.community_items ?? []).filter(i => {
    if (tab === 'skills') return i.type === 'skill'
    if (tab === 'agents') return i.type === 'agent'
    if (tab === 'workflows') return i.type === 'workflow'
    return false
  })

  const totalPacks = data.total_packs ?? packs.length
  const totalPlugins = data.total_plugins ?? plugins.length
  const totalTools = data.total_tools ?? plugins.reduce((a, p) => a + (p.tools ?? 0), 0)
  const frameworkVersion = data.framework_version ?? ''

  const allStacks = [...new Set(packs.flatMap(p => (p.stacks || []).filter(s => s !== '*')))]
  const filterTabs = ['all', ...allStacks.slice(0, 8)]

  const filteredPacks = filter === 'all'
    ? packs
    : packs.filter(p => p.stacks?.includes(filter) || p.stacks?.includes('*'))

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
          {totalPlugins} Plugins &middot; {totalPacks} Packs
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
        {(frameworkVersion || totalTools > 0) && (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 16, padding: '10px 20px', borderRadius: 10,
            background: 'rgba(0,229,255,0.06)', border: '1px solid rgba(0,229,255,0.15)',
          }}>
            {frameworkVersion && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <i className="bx bx-package" style={{ fontSize: 16, color: '#00e5ff' }} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-fg, #f8f8f8)' }}>
                    Framework {frameworkVersion}
                  </span>
                </div>
                {totalTools > 0 && <div style={{ width: 1, height: 16, background: 'var(--color-border, rgba(255,255,255,0.1))' }} />}
              </>
            )}
            {totalTools > 0 && (
              <div style={{ fontSize: 12, color: 'var(--color-fg-muted, rgba(255,255,255,0.45))' }}>
                {totalTools} tools across {totalPlugins} plugins
              </div>
            )}
          </div>
        )}
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
          {plugins.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <i className="bx bx-plug" style={{ fontSize: 48, color: 'var(--color-fg-dim, rgba(255,255,255,0.15))', marginBottom: 12, display: 'block' }} />
              <p style={{ fontSize: 15, color: 'var(--color-fg-muted, rgba(255,255,255,0.4))' }}>No plugins available yet.</p>
            </div>
          ) : (
            <div ref={gridRef} className="mkt-grid-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
              {plugins.map((plugin, idx) => (
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
                        {plugin.language && (
                          <span style={{
                            fontSize: 10, fontWeight: 600, padding: '2px 6px', borderRadius: 4,
                            background: `${LANG_COLORS[plugin.language] ?? '#888'}18`,
                            color: LANG_COLORS[plugin.language] ?? '#888',
                          }}>{plugin.language}</span>
                        )}
                      </div>
                      <p style={{ fontSize: 13, color: 'var(--color-fg-muted, rgba(255,255,255,0.45))', lineHeight: 1.6, margin: 0 }}>{plugin.desc}</p>
                    </div>
                    <div style={{
                      width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                      background: `${plugin.color ?? '#888'}18`, border: `1px solid ${plugin.color ?? '#888'}30`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <i className="bx bx-plug" style={{ fontSize: 20, color: plugin.color ?? '#888' }} />
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
          )}
        </>
      )}

      {/* ─── Packs Tab ───────────────────────── */}
      {tab === 'packs' && (
        <>
          {/* Stack filters */}
          {allStacks.length > 0 && (
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
          )}

          {filteredPacks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <i className="bx bx-package" style={{ fontSize: 48, color: 'var(--color-fg-dim, rgba(255,255,255,0.15))', marginBottom: 12, display: 'block' }} />
              <p style={{ fontSize: 15, color: 'var(--color-fg-muted, rgba(255,255,255,0.4))' }}>No packs available yet.</p>
            </div>
          ) : (
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
                      background: `${pack.color ?? '#888'}18`, border: `1px solid ${pack.color ?? '#888'}30`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <i className="bx bx-package" style={{ fontSize: 20, color: pack.color ?? '#888' }} />
                    </div>
                  </div>
                  {(pack.stacks ?? []).length > 0 && (
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {(pack.stacks ?? []).map(s => (
                        <span key={s} style={{
                          fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 4,
                          background: `${STACK_COLORS[s] ?? '#888'}12`,
                          color: STACK_COLORS[s] ?? '#888',
                          border: `1px solid ${STACK_COLORS[s] ?? '#888'}25`,
                        }}>{s === '*' ? 'universal' : s}</span>
                      ))}
                    </div>
                  )}
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
          )}
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

          {communityItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <i className={`bx ${TYPE_ICONS[tab.replace(/s$/, '')] ?? 'bx-package'}`} style={{ fontSize: 48, color: 'var(--color-fg-dim, rgba(255,255,255,0.15))', marginBottom: 12, display: 'block' }} />
              <p style={{ fontSize: 15, color: 'var(--color-fg-muted, rgba(255,255,255,0.4))' }}>
                No community {tab} yet. Be the first to publish!
              </p>
            </div>
          ) : (
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
                  {(item.stacks ?? []).length > 0 && (
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {(item.stacks ?? []).map(s => (
                        <span key={s} style={{
                          fontSize: 9, fontWeight: 600, padding: '2px 6px', borderRadius: 4,
                          background: `${STACK_COLORS[s] ?? '#888'}12`,
                          color: STACK_COLORS[s] ?? '#888',
                        }}>{s === '*' ? 'universal' : s}</span>
                      ))}
                    </div>
                  )}
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
                      {(item.downloads ?? 0).toLocaleString()} installs
                    </span>
                  </div>
                </Link>
              ))}
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
          { value: totalPlugins, label: 'Plugins', color: '#00e5ff' },
          { value: totalPacks, label: 'Packs', color: '#a900ff' },
          { value: packs.reduce((a, p) => a + (p.skills ?? 0), 0), label: 'Skills', color: '#22c55e' },
          { value: packs.reduce((a, p) => a + (p.agents ?? 0), 0), label: 'Agents', color: '#f59e0b' },
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
