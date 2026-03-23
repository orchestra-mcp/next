'use client'
import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useThemeStore } from '@/store/theme'
import { useFeatureFlagsStore } from '@/store/feature-flags'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import { SearchableSelect } from '@/components/ui/searchable-select'

interface GitHubIssue {
  id: number
  github_id: number
  repo: string
  title: string
  body: string
  state: 'open' | 'closed' | 'merged' | 'draft'
  type: 'issue' | 'pr'
  author: string
  author_avatar: string
  labels: string[]
  created_at: string
  updated_at: string
}

const DEV_SEED_ISSUES: GitHubIssue[] = [
  { id: 1, github_id: 42, repo: 'orchestra-mcp/framework', title: 'Add hot-reload for plugin development', body: 'Currently plugins require a full restart.', state: 'open', type: 'issue', author: 'fadymondy', author_avatar: '', labels: ['enhancement'], created_at: '2026-01-15T10:00:00Z', updated_at: '2026-01-15T10:00:00Z' },
  { id: 2, github_id: 43, repo: 'orchestra-mcp/framework', title: 'Fix QUIC reconnection on network change', body: 'Connection drops when switching WiFi networks.', state: 'closed', type: 'issue', author: 'alice', author_avatar: '', labels: ['bug'], created_at: '2026-01-10T08:00:00Z', updated_at: '2026-01-12T14:00:00Z' },
  { id: 3, github_id: 44, repo: 'orchestra-mcp/framework', title: 'feat: Add vector search to memory engine', body: 'LanceDB integration for improved RAG.', state: 'merged', type: 'pr', author: 'bobm', author_avatar: '', labels: ['feature'], created_at: '2026-01-08T12:00:00Z', updated_at: '2026-01-09T16:00:00Z' },
  { id: 4, github_id: 45, repo: 'orchestra-mcp/framework', title: 'Update proto definitions for v2 API', body: 'Breaking changes to the gRPC contract.', state: 'open', type: 'pr', author: 'fadymondy', author_avatar: '', labels: ['breaking-change'], created_at: '2026-02-01T09:00:00Z', updated_at: '2026-02-01T09:00:00Z' },
  { id: 5, github_id: 46, repo: 'orchestra-mcp/framework', title: 'Improve Tree-sitter grammar for Go', body: 'Better support for generics syntax.', state: 'closed', type: 'issue', author: 'sarak', author_avatar: '', labels: ['enhancement'], created_at: '2025-12-20T11:00:00Z', updated_at: '2026-01-05T10:00:00Z' },
  { id: 6, github_id: 47, repo: 'orchestra-mcp/framework', title: 'docs: Plugin development guide', body: 'Comprehensive guide for building Orchestra plugins.', state: 'merged', type: 'pr', author: 'fadymondy', author_avatar: '', labels: ['documentation'], created_at: '2025-12-15T14:00:00Z', updated_at: '2025-12-18T09:00:00Z' },
  { id: 7, github_id: 48, repo: 'orchestra-mcp/framework', title: 'Add rate limiting to bridge plugins', body: 'Prevent API quota exhaustion.', state: 'open', type: 'issue', author: 'alice', author_avatar: '', labels: ['enhancement'], created_at: '2026-02-10T10:00:00Z', updated_at: '2026-02-10T10:00:00Z' },
  { id: 8, github_id: 49, repo: 'orchestra-mcp/framework', title: 'WIP: Widget system refactor', body: 'Unifying widget data contract across platforms.', state: 'draft', type: 'pr', author: 'bobm', author_avatar: '', labels: ['refactor'], created_at: '2026-02-20T15:00:00Z', updated_at: '2026-02-20T15:00:00Z' },
]

const STATE_COLORS: Record<string, string> = {
  open: '#22c55e',
  closed: '#8a8a8a',
  merged: '#a900ff',
  draft: '#f97316',
}

const STATE_LABELS: Record<string, string> = {
  open: 'Open',
  closed: 'Closed',
  merged: 'Merged',
  draft: 'Draft',
}

const PER_PAGE = 20

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 30) return `${diffDays}d ago`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`
  return `${Math.floor(diffDays / 365)}y ago`
}

export default function IssuesPage() {
  const t = useTranslations()
  const router = useRouter()
  const { theme } = useThemeStore()
  const { isEnabled, fetchFlags, loaded } = useFeatureFlagsStore()
  const isDark = theme === 'dark'

  const textPrimary = isDark ? '#f8f8f8' : '#0f0f12'
  const textMuted = isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.55)'
  const textBody = isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.55)'
  const cardBg = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'
  const cardBorder = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'
  const pillBg = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'
  const pillActiveBg = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)'

  const [issues, setIssues] = useState<GitHubIssue[]>([])
  const [loading, setLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState<'all' | 'issue' | 'pr'>('all')
  const [stateFilter, setStateFilter] = useState<'all' | 'open' | 'closed' | 'merged' | 'draft'>('all')
  const [repoFilter, setRepoFilter] = useState<string>('all')
  const [page, setPage] = useState(1)

  useEffect(() => {
    if (!loaded) fetchFlags()
  }, [loaded, fetchFlags])

  useEffect(() => {
    if (loaded && !isEnabled('issues')) {
      router.replace('/')
    }
  }, [loaded, isEnabled, router])

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const sb = createClient()
        const { data, error } = await sb.from('github_issues').select('*').order('created_at', { ascending: false })
        if (error) throw error
        if (!cancelled) {
          setIssues((data || []) as GitHubIssue[])
          setLoading(false)
        }
      } catch {
        if (!cancelled) {
          setIssues(DEV_SEED_ISSUES)
          setLoading(false)
        }
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  // Derived data
  const repos = useMemo(() => {
    const set = new Set<string>()
    for (const i of issues) set.add(i.repo)
    return Array.from(set).sort()
  }, [issues])

  const filtered = useMemo(() => {
    return issues.filter(i => {
      if (typeFilter !== 'all' && i.type !== typeFilter) return false
      if (stateFilter !== 'all' && i.state !== stateFilter) return false
      if (repoFilter !== 'all' && i.repo !== repoFilter) return false
      return true
    })
  }, [issues, typeFilter, stateFilter, repoFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  // Stats
  const stats = useMemo(() => {
    return {
      total: issues.length,
      openIssues: issues.filter(i => i.type === 'issue' && i.state === 'open').length,
      openPrs: issues.filter(i => i.type === 'pr' && (i.state === 'open' || i.state === 'draft')).length,
      mergedPrs: issues.filter(i => i.type === 'pr' && i.state === 'merged').length,
    }
  }, [issues])

  // Reset page on filter change
  useEffect(() => { setPage(1) }, [typeFilter, stateFilter, repoFilter])

  if (!loaded || (loaded && !isEnabled('issues'))) return null

  const statCards = [
    { label: 'Total', value: stats.total, icon: 'bx-list-ul', accent: '#00e5ff' },
    { label: 'Open Issues', value: stats.openIssues, icon: 'bx-error-circle', accent: '#22c55e' },
    { label: 'Open PRs', value: stats.openPrs, icon: 'bx-git-pull-request', accent: '#a900ff' },
    { label: 'Merged PRs', value: stats.mergedPrs, icon: 'bx-git-merge', accent: '#00e5ff' },
  ]

  const typePills: { label: string; value: 'all' | 'issue' | 'pr' }[] = [
    { label: 'All Types', value: 'all' },
    { label: 'Issues Only', value: 'issue' },
    { label: 'PRs Only', value: 'pr' },
  ]

  const statePills: { label: string; value: 'all' | 'open' | 'closed' | 'merged' | 'draft' }[] = [
    { label: 'All States', value: 'all' },
    { label: 'Open', value: 'open' },
    { label: 'Closed', value: 'closed' },
    { label: 'Merged', value: 'merged' },
    { label: 'Draft', value: 'draft' },
  ]

  return (
    <div className="mkt-page" style={{ maxWidth: 1100, margin: '0 auto', padding: '72px 32px' }}>
      {/* Hero */}
      <div style={{ marginBottom: 48, textAlign: 'center' }}>
        <h1 style={{
          fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 800, letterSpacing: '-0.04em',
          background: 'linear-gradient(135deg, #00e5ff, #a900ff)', WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent', marginBottom: 14,
        }}>
          GitHub Issues
        </h1>
        <p style={{ fontSize: 17, color: textMuted, maxWidth: 520, margin: '0 auto' }}>
          Track issues and pull requests across Orchestra repositories.
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: textMuted }}>
          <i className="bx bx-loader-alt bx-spin" style={{ fontSize: 28, marginBottom: 12, display: 'block' }} />
          Loading issues...
        </div>
      ) : (
        <>
          {/* Stat cards */}
          <div className="mkt-grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 32 }}>
            {statCards.map(sc => (
              <div key={sc.label} style={{
                padding: '20px', borderRadius: 14,
                background: cardBg, border: `1px solid ${cardBorder}`,
                display: 'flex', alignItems: 'center', gap: 14,
              }}>
                <div style={{
                  width: 42, height: 42, borderRadius: 10,
                  background: `${sc.accent}12`, border: `1px solid ${sc.accent}25`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <i className={`bx ${sc.icon}`} style={{ fontSize: 20, color: sc.accent }} />
                </div>
                <div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: textPrimary, lineHeight: 1 }}>{sc.value}</div>
                  <div style={{ fontSize: 12, color: textMuted, marginTop: 2 }}>{sc.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Filter bar */}
          <div className="mkt-filter-bar" style={{
            display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12, marginBottom: 24,
            padding: '16px 20px', borderRadius: 14,
            background: cardBg, border: `1px solid ${cardBorder}`,
          }}>
            {/* Type pills */}
            <div style={{ display: 'flex', gap: 4 }}>
              {typePills.map(p => (
                <button
                  key={p.value}
                  onClick={() => setTypeFilter(p.value)}
                  style={{
                    padding: '6px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
                    fontSize: 13, fontWeight: 600, fontFamily: 'inherit',
                    background: typeFilter === p.value ? pillActiveBg : 'transparent',
                    color: typeFilter === p.value ? textPrimary : textMuted,
                    transition: 'background 0.15s, color 0.15s',
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <div style={{ width: 1, height: 20, background: cardBorder }} />

            {/* State pills */}
            <div style={{ display: 'flex', gap: 4 }}>
              {statePills.map(p => (
                <button
                  key={p.value}
                  onClick={() => setStateFilter(p.value)}
                  style={{
                    padding: '6px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
                    fontSize: 13, fontWeight: 600, fontFamily: 'inherit',
                    background: stateFilter === p.value ? pillActiveBg : 'transparent',
                    color: stateFilter === p.value ? textPrimary : textMuted,
                    transition: 'background 0.15s, color 0.15s',
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {repos.length > 1 && (
              <>
                <div style={{ width: 1, height: 20, background: cardBorder }} />

                {/* Repo dropdown */}
                <SearchableSelect
                  value={repoFilter}
                  onChange={setRepoFilter}
                  options={[
                    { value: 'all', label: 'All Repos' },
                    ...repos.map(r => ({ value: r, label: r })),
                  ]}
                  placeholder="All Repos"
                  style={{
                    padding: '6px 12px', borderRadius: 8,
                    border: `1px solid ${cardBorder}`, background: pillBg,
                    color: textPrimary, fontSize: 13, fontFamily: 'inherit',
                    cursor: 'pointer', outline: 'none',
                  }}
                />
              </>
            )}
          </div>

          {/* Issue list */}
          {paginated.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <i className="bx bx-search-alt" style={{ fontSize: 44, color: textMuted, display: 'block', marginBottom: 14 }} />
              <h2 style={{ fontSize: 20, fontWeight: 700, color: textPrimary, marginBottom: 6 }}>No issues found</h2>
              <p style={{ fontSize: 14, color: textMuted }}>Try adjusting your filters.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {paginated.map(issue => {
                const stateColor = STATE_COLORS[issue.state] || '#8a8a8a'
                const ghUrl = `https://github.com/${issue.repo}/${issue.type === 'pr' ? 'pull' : 'issues'}/${issue.github_id}`

                return (
                  <div key={issue.id} style={{
                    padding: '18px 22px', borderRadius: 14,
                    background: cardBg, border: `1px solid ${cardBorder}`,
                    display: 'flex', alignItems: 'center', gap: 14,
                    flexWrap: 'wrap',
                  }}>
                    {/* State dot + label */}
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      padding: '3px 10px', borderRadius: 100,
                      background: `${stateColor}12`, border: `1px solid ${stateColor}25`,
                      fontSize: 11, fontWeight: 600, color: stateColor,
                      flexShrink: 0,
                    }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: stateColor }} />
                      {STATE_LABELS[issue.state]}
                    </div>

                    {/* Title */}
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <span style={{ fontSize: 15, fontWeight: 700, color: textPrimary }}>
                        {issue.title}
                      </span>
                    </div>

                    {/* Type badge */}
                    <span style={{
                      fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 6,
                      background: issue.type === 'pr' ? 'rgba(169,0,255,0.1)' : 'rgba(0,229,255,0.1)',
                      color: issue.type === 'pr' ? '#a900ff' : '#00e5ff',
                      border: `1px solid ${issue.type === 'pr' ? 'rgba(169,0,255,0.2)' : 'rgba(0,229,255,0.2)'}`,
                      flexShrink: 0,
                    }}>
                      {issue.type === 'pr' ? 'PR' : 'Issue'}
                    </span>

                    {/* Repo */}
                    <span style={{ fontSize: 12, color: textMuted, flexShrink: 0 }}>
                      {issue.repo}
                    </span>

                    {/* Author */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                      {issue.author_avatar ? (
                        <img src={issue.author_avatar} alt={issue.author} style={{ width: 20, height: 20, borderRadius: '50%' }} />
                      ) : (
                        <div style={{
                          width: 20, height: 20, borderRadius: '50%',
                          background: pillBg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 10, fontWeight: 700, color: textMuted,
                        }}>
                          {issue.author.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span style={{ fontSize: 12, color: textBody }}>{issue.author}</span>
                    </div>

                    {/* Labels */}
                    {issue.labels.length > 0 && (
                      <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                        {issue.labels.map(label => (
                          <span key={label} style={{
                            fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 5,
                            background: pillBg, color: textMuted,
                          }}>
                            {label}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Date */}
                    <span style={{ fontSize: 12, color: textMuted, flexShrink: 0 }}>
                      {formatRelativeDate(issue.created_at)}
                    </span>

                    {/* External link */}
                    <a
                      href={ghUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Open on GitHub"
                      style={{ color: textMuted, fontSize: 16, lineHeight: 1, flexShrink: 0 }}
                    >
                      <i className="bx bx-link-external" />
                    </a>
                  </div>
                )
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6, marginTop: 32 }}>
              <button
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                style={{
                  padding: '8px 14px', borderRadius: 8, border: `1px solid ${cardBorder}`,
                  background: cardBg, color: page === 1 ? textMuted : textPrimary,
                  fontSize: 13, fontWeight: 600, cursor: page === 1 ? 'default' : 'pointer',
                  opacity: page === 1 ? 0.4 : 1, fontFamily: 'inherit',
                }}
              >
                <i className="bx bx-chevron-left" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  style={{
                    width: 36, height: 36, borderRadius: 8,
                    border: page === n ? '1px solid rgba(0,229,255,0.3)' : `1px solid ${cardBorder}`,
                    background: page === n ? 'rgba(0,229,255,0.1)' : cardBg,
                    color: page === n ? '#00e5ff' : textMuted,
                    fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                  }}
                >
                  {n}
                </button>
              ))}

              <button
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
                style={{
                  padding: '8px 14px', borderRadius: 8, border: `1px solid ${cardBorder}`,
                  background: cardBg, color: page === totalPages ? textMuted : textPrimary,
                  fontSize: 13, fontWeight: 600, cursor: page === totalPages ? 'default' : 'pointer',
                  opacity: page === totalPages ? 0.4 : 1, fontFamily: 'inherit',
                }}
              >
                <i className="bx bx-chevron-right" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
