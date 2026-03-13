'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useRoleStore } from '@/store/roles'
import { useAdminStore, type AdminIssue, type AdminGitHubIssue, type AdminGitHubRepo } from '@/store/admin'

type StatusFilter = 'all' | 'open' | 'in-review' | 'closed'
type PriorityFilter = 'all' | 'low' | 'medium' | 'high'

type GHTypeFilter = 'all' | 'issue' | 'pr'
type GHStateFilter = 'all' | 'open' | 'closed' | 'merged' | 'draft'

const GH_PER_PAGE = 20

export default function AdminIssuesPage() {
  const router = useRouter()
  const { can, roleLoaded } = useRoleStore()
  const {
    issues, loading, error,
    fetchIssues, updateIssue, clearError,
    githubIssues, githubRepos,
    fetchGitHubIssues, syncGitHubIssues, fetchGitHubRepos,
  } = useAdminStore()

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('all')
  const [updatingId, setUpdatingId] = useState<number | null>(null)

  // GitHub state
  const [selectedRepo, setSelectedRepo] = useState<string>('')
  const [ghTypeFilter, setGhTypeFilter] = useState<GHTypeFilter>('all')
  const [ghStateFilter, setGhStateFilter] = useState<GHStateFilter>('all')
  const [ghPage, setGhPage] = useState(1)
  const [lastSynced, setLastSynced] = useState<string | null>(null)
  const [syncing, setSyncing] = useState(false)

  useEffect(() => {
    if (!roleLoaded) return
    if (!can('canViewAdmin')) { router.replace('/dashboard'); return }
    fetchIssues()
    fetchGitHubRepos()
    fetchGitHubIssues()
  }, [roleLoaded])

  const textPrimary = 'var(--color-fg)'
  const textMuted = 'var(--color-fg-muted)'
  const textDim = 'var(--color-fg-dim)'
  const cardBg = 'var(--color-bg-alt)'
  const cardBorder = 'var(--color-border)'
  const pageBg = 'var(--color-bg)'
  const inputBg = 'var(--color-bg-alt)'
  const inputBorder = 'var(--color-border)'
  const rowBorder = 'var(--color-bg-alt)'
  const pillActiveBg = 'var(--color-border)'
  const pillInactiveBg = 'var(--color-bg-alt)'

  // ── Internal issue filters ──

  const filtered = issues.filter(i => {
    const matchStatus = statusFilter === 'all' || i.status === statusFilter
    const matchPriority = priorityFilter === 'all' || i.priority === priorityFilter
    return matchStatus && matchPriority
  })

  const statusPills: { label: string; value: StatusFilter }[] = [
    { label: 'All', value: 'all' },
    { label: 'Open', value: 'open' },
    { label: 'In Review', value: 'in-review' },
    { label: 'Closed', value: 'closed' },
  ]

  const priorityPills: { label: string; value: PriorityFilter }[] = [
    { label: 'All', value: 'all' },
    { label: 'Low', value: 'low' },
    { label: 'Medium', value: 'medium' },
    { label: 'High', value: 'high' },
  ]

  // ── GitHub issue filters ──

  const ghFiltered = githubIssues.filter(gi => {
    const matchType = ghTypeFilter === 'all' || gi.type === ghTypeFilter
    const matchState = ghStateFilter === 'all' || gi.state === ghStateFilter
    const matchRepo = !selectedRepo || gi.repo === selectedRepo
    return matchType && matchState && matchRepo
  })

  const ghTotalPages = Math.max(1, Math.ceil(ghFiltered.length / GH_PER_PAGE))
  const ghPageClamped = Math.min(ghPage, ghTotalPages)
  const ghPaged = ghFiltered.slice((ghPageClamped - 1) * GH_PER_PAGE, ghPageClamped * GH_PER_PAGE)

  const ghTypePills: { label: string; value: GHTypeFilter }[] = [
    { label: 'All Types', value: 'all' },
    { label: 'Issues Only', value: 'issue' },
    { label: 'PRs Only', value: 'pr' },
  ]

  const ghStatePills: { label: string; value: GHStateFilter }[] = [
    { label: 'All States', value: 'all' },
    { label: 'Open', value: 'open' },
    { label: 'Closed', value: 'closed' },
    { label: 'Merged', value: 'merged' },
    { label: 'Draft', value: 'draft' },
  ]

  // ── Handlers ──

  async function handleSync() {
    setSyncing(true)
    try {
      await syncGitHubIssues(selectedRepo || undefined)
      setLastSynced(new Date().toISOString())
    } catch {
      // error surfaced via store
    } finally {
      setSyncing(false)
    }
  }

  async function handleRepoChange(repo: string) {
    setSelectedRepo(repo)
    setGhPage(1)
    await fetchGitHubIssues(repo || undefined)
  }

  async function handleStatusChange(issue: AdminIssue, newStatus: AdminIssue['status']) {
    if (newStatus === issue.status) return
    setUpdatingId(issue.id)
    try {
      await updateIssue(issue.id, { status: newStatus })
    } catch {
      // error shown via store
    } finally {
      setUpdatingId(null)
    }
  }

  // ── Formatters ──

  function fmt(d: string) {
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  function fmtTime(d: string) {
    return new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
  }

  // ── Badges ──

  function PriorityBadge({ priority }: { priority: AdminIssue['priority'] }) {
    const map = {
      low: { bg: 'rgba(34,197,94,0.08)', color: '#22c55e', border: 'rgba(34,197,94,0.2)' },
      medium: { bg: 'rgba(249,115,22,0.08)', color: '#f97316', border: 'rgba(249,115,22,0.2)' },
      high: { bg: 'rgba(239,68,68,0.08)', color: '#ef4444', border: 'rgba(239,68,68,0.2)' },
    }
    const c = map[priority]
    return <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 100, background: c.bg, color: c.color, border: `1px solid ${c.border}`, fontWeight: 600, textTransform: 'capitalize' }}>{priority}</span>
  }

  function StatusBadge({ status }: { status: AdminIssue['status'] }) {
    const map = {
      open: { bg: 'rgba(0,229,255,0.08)', color: '#00e5ff', border: 'rgba(0,229,255,0.2)', label: 'Open' },
      'in-review': { bg: 'rgba(245,158,11,0.08)', color: '#f59e0b', border: 'rgba(245,158,11,0.2)', label: 'In Review' },
      closed: { bg: 'var(--color-bg-active)', color: textMuted as string, border: 'var(--color-border)', label: 'Closed' },
    }
    const c = map[status]
    return <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 100, background: c.bg, color: c.color, border: `1px solid ${c.border}`, fontWeight: 600 }}>{c.label}</span>
  }

  function GHStateBadge({ state }: { state: AdminGitHubIssue['state'] }) {
    const map: Record<AdminGitHubIssue['state'], { bg: string; color: string; border: string; label: string }> = {
      open: { bg: 'rgba(34,197,94,0.08)', color: '#22c55e', border: 'rgba(34,197,94,0.2)', label: 'Open' },
      closed: { bg: 'rgba(138,138,138,0.08)', color: '#8a8a8a', border: 'rgba(138,138,138,0.2)', label: 'Closed' },
      merged: { bg: 'rgba(169,0,255,0.08)', color: '#a900ff', border: 'rgba(169,0,255,0.2)', label: 'Merged' },
      draft: { bg: 'rgba(249,115,22,0.08)', color: '#f97316', border: 'rgba(249,115,22,0.2)', label: 'Draft' },
    }
    const c = map[state]
    return <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 100, background: c.bg, color: c.color, border: `1px solid ${c.border}`, fontWeight: 600 }}>{c.label}</span>
  }

  function GHTypeBadge({ type }: { type: AdminGitHubIssue['type'] }) {
    const map: Record<AdminGitHubIssue['type'], { bg: string; color: string; border: string; label: string }> = {
      issue: { bg: 'rgba(0,229,255,0.08)', color: '#00e5ff', border: 'rgba(0,229,255,0.2)', label: 'Issue' },
      pr: { bg: 'rgba(169,0,255,0.08)', color: '#a900ff', border: 'rgba(169,0,255,0.2)', label: 'PR' },
    }
    const c = map[type]
    return <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 100, background: c.bg, color: c.color, border: `1px solid ${c.border}`, fontWeight: 600 }}>{c.label}</span>
  }

  // ── Shared pill button style ──

  function pillStyle(active: boolean): React.CSSProperties {
    return {
      padding: '5px 11px',
      borderRadius: 100,
      fontSize: 12,
      fontWeight: 500,
      border: 'none',
      cursor: 'pointer',
      background: active ? pillActiveBg : pillInactiveBg,
      color: active ? textPrimary : textMuted,
      transition: 'background 0.15s',
    }
  }

  return (
    <div className="page-wrapper" style={{ padding: '28px 32px', background: pageBg, minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Link href="/admin" style={{ fontSize: 13, color: textDim, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 5, marginBottom: 14 }}>
          <i className="bx bx-left-arrow-alt rtl-flip" /> Admin
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: textPrimary, margin: 0, letterSpacing: '-0.02em' }}>Issues</h1>
          <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 9px', borderRadius: 100, background: 'var(--color-bg-active)', color: textMuted }}>
            {issues.length}
          </span>
        </div>
      </div>

      {error && (
        <div style={{ marginBottom: 16, padding: '10px 14px', borderRadius: 8, fontSize: 13, background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {error}
          <button onClick={clearError} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 16, lineHeight: 1 }}>&#x2715;</button>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          GitHub Sync Section
         ════════════════════════════════════════════════════════════════════ */}
      <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 14, padding: '20px 24px', marginBottom: 24 }}>
        {/* GitHub header row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <i className="bx bxl-github" style={{ fontSize: 22, color: textPrimary }} />
            <h2 style={{ fontSize: 16, fontWeight: 700, color: textPrimary, margin: 0, letterSpacing: '-0.01em' }}>GitHub Issues</h2>
            <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 9px', borderRadius: 100, background: 'var(--color-bg-active)', color: textMuted }}>
              {ghFiltered.length}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            {/* Repository selector */}
            <select
              value={selectedRepo}
              onChange={e => handleRepoChange(e.target.value)}
              style={{
                padding: '7px 12px',
                borderRadius: 8,
                border: `1px solid ${inputBorder}`,
                background: inputBg,
                color: textPrimary,
                fontSize: 12,
                outline: 'none',
                cursor: 'pointer',
                minWidth: 180,
              }}
            >
              <option value="">All repositories</option>
              {githubRepos.map((r: AdminGitHubRepo) => (
                <option key={r.full_name} value={r.full_name}>{r.full_name}</option>
              ))}
            </select>

            {/* Sync button */}
            <button
              onClick={handleSync}
              disabled={syncing}
              style={{
                padding: '7px 16px',
                borderRadius: 8,
                border: 'none',
                cursor: syncing ? 'not-allowed' : 'pointer',
                background: 'linear-gradient(135deg, #00e5ff 0%, #a900ff 100%)',
                color: '#fff',
                fontSize: 12,
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                opacity: syncing ? 0.6 : 1,
                transition: 'opacity 0.15s',
              }}
            >
              <i className={`bx bx-refresh ${syncing ? 'bx-spin' : ''}`} style={{ fontSize: 15 }} />
              {syncing ? 'Syncing...' : 'Sync from GitHub'}
            </button>

            {/* Last synced */}
            {lastSynced && (
              <span style={{ fontSize: 11, color: textDim }}>
                Last synced {fmtTime(lastSynced)}
              </span>
            )}
          </div>
        </div>

        {/* GitHub filter pills */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: textDim, marginInlineEnd: 3 }}>Type:</span>
            {ghTypePills.map(p => (
              <button key={p.value} onClick={() => { setGhTypeFilter(p.value); setGhPage(1) }} style={pillStyle(ghTypeFilter === p.value)}>
                {p.label}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: textDim, marginInlineEnd: 3 }}>State:</span>
            {ghStatePills.map(p => (
              <button key={p.value} onClick={() => { setGhStateFilter(p.value); setGhPage(1) }} style={pillStyle(ghStateFilter === p.value)}>
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* GitHub issues table */}
        <div style={{ border: `1px solid ${cardBorder}`, borderRadius: 10, overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '72px 2fr 1fr 70px 90px 1fr 110px 40px', padding: '11px 16px', borderBottom: `1px solid ${cardBorder}`, fontSize: 11, fontWeight: 600, color: textDim, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            <div>State</div>
            <div>Title</div>
            <div className="hide-mobile">Repo</div>
            <div>Type</div>
            <div className="hide-mobile">Author</div>
            <div className="hide-mobile">Labels</div>
            <div className="hide-mobile">Date</div>
            <div></div>
          </div>

          {loading && githubIssues.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: textDim, fontSize: 13 }}>
              <i className="bx bx-loader-alt bx-spin" style={{ fontSize: 24, display: 'block', marginBottom: 10 }} />
              Loading GitHub issues...
            </div>
          ) : ghPaged.length === 0 ? (
            <div style={{ padding: '48px 40px', textAlign: 'center' }}>
              <i className="bx bxl-github" style={{ fontSize: 34, color: textDim, display: 'block', marginBottom: 10 }} />
              <div style={{ fontSize: 14, fontWeight: 600, color: textMuted, marginBottom: 4 }}>No GitHub issues found</div>
              <div style={{ fontSize: 12, color: textDim }}>Try syncing from GitHub or adjusting filters.</div>
            </div>
          ) : ghPaged.map((gi: AdminGitHubIssue, idx: number) => (
            <div key={gi.id} style={{ display: 'grid', gridTemplateColumns: '72px 2fr 1fr 70px 90px 1fr 110px 40px', padding: '12px 16px', borderBottom: idx < ghPaged.length - 1 ? `1px solid ${rowBorder}` : 'none', alignItems: 'center' }}>
              <div><GHStateBadge state={gi.state} /></div>
              <div style={{ fontSize: 13, fontWeight: 500, color: textPrimary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingInlineEnd: 12 }}>{gi.title}</div>
              <div className="hide-mobile" style={{ fontSize: 11, color: textDim, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{gi.repo}</div>
              <div><GHTypeBadge type={gi.type} /></div>
              <div className="hide-mobile" style={{ fontSize: 12, color: textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{gi.author}</div>
              <div className="hide-mobile" style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {gi.labels.slice(0, 3).map(label => (
                  <span key={label} style={{ fontSize: 10, padding: '1px 7px', borderRadius: 100, background: 'var(--color-bg-active)', color: textMuted, border: `1px solid ${cardBorder}`, fontWeight: 500, whiteSpace: 'nowrap' }}>{label}</span>
                ))}
                {gi.labels.length > 3 && (
                  <span style={{ fontSize: 10, color: textDim }}>+{gi.labels.length - 3}</span>
                )}
              </div>
              <div className="hide-mobile" style={{ fontSize: 11.5, color: textDim }}>{fmt(gi.created_at)}</div>
              <div>
                <a
                  href={`https://github.com/${gi.repo}/${gi.type === 'pr' ? 'pull' : 'issues'}/${gi.github_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: textDim, display: 'inline-flex', alignItems: 'center', fontSize: 16 }}
                  title="Open on GitHub"
                >
                  <i className="bx bx-link-external" />
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {ghTotalPages > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 14 }}>
            <button
              onClick={() => setGhPage(p => Math.max(1, p - 1))}
              disabled={ghPageClamped <= 1}
              style={{
                padding: '5px 12px',
                borderRadius: 7,
                border: `1px solid ${inputBorder}`,
                background: inputBg,
                color: ghPageClamped <= 1 ? textDim : textPrimary,
                fontSize: 12,
                cursor: ghPageClamped <= 1 ? 'not-allowed' : 'pointer',
                opacity: ghPageClamped <= 1 ? 0.5 : 1,
              }}
            >
              Previous
            </button>
            <span style={{ fontSize: 12, color: textMuted }}>
              Page {ghPageClamped} of {ghTotalPages}
            </span>
            <button
              onClick={() => setGhPage(p => Math.min(ghTotalPages, p + 1))}
              disabled={ghPageClamped >= ghTotalPages}
              style={{
                padding: '5px 12px',
                borderRadius: 7,
                border: `1px solid ${inputBorder}`,
                background: inputBg,
                color: ghPageClamped >= ghTotalPages ? textDim : textPrimary,
                fontSize: 12,
                cursor: ghPageClamped >= ghTotalPages ? 'not-allowed' : 'pointer',
                opacity: ghPageClamped >= ghTotalPages ? 0.5 : 1,
              }}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          Divider between GitHub and Internal Issues
         ════════════════════════════════════════════════════════════════════ */}
      <div style={{ borderTop: `1px solid ${cardBorder}`, margin: '8px 0 24px' }} />

      {/* ════════════════════════════════════════════════════════════════════
          Internal Issues (existing)
         ════════════════════════════════════════════════════════════════════ */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <i className="bx bx-bug" style={{ fontSize: 18, color: textPrimary }} />
        <h2 style={{ fontSize: 16, fontWeight: 700, color: textPrimary, margin: 0, letterSpacing: '-0.01em' }}>Internal Issues</h2>
        <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 9px', borderRadius: 100, background: 'var(--color-bg-active)', color: textMuted }}>
          {issues.length}
        </span>
      </div>

      {/* Filters */}
      <div className="admin-filters" style={{ display: 'flex', gap: 16, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: textDim, marginInlineEnd: 3 }}>Status:</span>
          {statusPills.map(p => (
            <button key={p.value} onClick={() => setStatusFilter(p.value)} style={pillStyle(statusFilter === p.value)}>
              {p.label}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: textDim, marginInlineEnd: 3 }}>Priority:</span>
          {priorityPills.map(p => (
            <button key={p.value} onClick={() => setPriorityFilter(p.value)} style={pillStyle(priorityFilter === p.value)}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Internal Issues Table */}
      <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 14, overflow: 'hidden' }}>
        <div className="grid-admin-users" style={{ display: 'grid', gridTemplateColumns: '60px 2fr 90px 100px 110px 130px', padding: '11px 20px', borderBottom: `1px solid ${cardBorder}`, fontSize: 11, fontWeight: 600, color: textDim, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
          <div>#</div>
          <div>Title</div>
          <div>Priority</div>
          <div className="hide-mobile">Status</div>
          <div className="hide-mobile">Created</div>
          <div className="hide-mobile">Change Status</div>
        </div>

        {loading && issues.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: textDim, fontSize: 13 }}>
            <i className="bx bx-loader-alt bx-spin" style={{ fontSize: 24, display: 'block', marginBottom: 10 }} />
            Loading issues...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '56px 40px', textAlign: 'center' }}>
            <i className="bx bx-bug" style={{ fontSize: 38, color: textDim, display: 'block', marginBottom: 10 }} />
            <div style={{ fontSize: 14, fontWeight: 600, color: textMuted, marginBottom: 4 }}>No issues found</div>
            <div style={{ fontSize: 12, color: textDim }}>Try adjusting your filters.</div>
          </div>
        ) : filtered.map((issue, idx) => (
          <div key={issue.id} className="grid-admin-users" style={{ display: 'grid', gridTemplateColumns: '60px 2fr 90px 100px 110px 130px', padding: '13px 20px', borderBottom: idx < filtered.length - 1 ? `1px solid ${rowBorder}` : 'none', alignItems: 'center' }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: textDim, fontFamily: 'monospace' }}>#{issue.id}</div>
            <div style={{ fontSize: 13, fontWeight: 500, color: textPrimary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingInlineEnd: 12 }}>{issue.title}</div>
            <div><PriorityBadge priority={issue.priority} /></div>
            <div className="hide-mobile"><StatusBadge status={issue.status} /></div>
            <div className="hide-mobile" style={{ fontSize: 11.5, color: textDim }}>{fmt(issue.created_at)}</div>
            <div className="hide-mobile">
              <select
                value={issue.status}
                disabled={updatingId === issue.id}
                onChange={e => handleStatusChange(issue, e.target.value as AdminIssue['status'])}
                style={{ padding: '5px 10px', borderRadius: 7, border: `1px solid ${inputBorder}`, background: inputBg, color: textPrimary, fontSize: 12, outline: 'none', cursor: 'pointer', opacity: updatingId === issue.id ? 0.5 : 1 }}
              >
                <option value="open">Open</option>
                <option value="in-review">In Review</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
