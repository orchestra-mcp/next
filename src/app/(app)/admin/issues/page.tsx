'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useThemeStore } from '@/store/theme'
import { useRoleStore } from '@/store/roles'
import { useAdminStore, type AdminIssue } from '@/store/admin'

type StatusFilter = 'all' | 'open' | 'in-review' | 'closed'
type PriorityFilter = 'all' | 'low' | 'medium' | 'high'

export default function AdminIssuesPage() {
  const router = useRouter()
  const { can, roleLoaded } = useRoleStore()
  const { theme } = useThemeStore()
  const isDark = theme === 'dark'
  const { issues, loading, error, fetchIssues, updateIssue, clearError } = useAdminStore()

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('all')
  const [updatingId, setUpdatingId] = useState<number | null>(null)

  useEffect(() => {
    if (!roleLoaded) return
    if (!can('canViewAdmin')) { router.replace('/dashboard'); return }
    fetchIssues()
  }, [roleLoaded])

  const textPrimary = isDark ? '#f8f8f8' : '#0f0f12'
  const textMuted = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.45)'
  const textDim = isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.3)'
  const cardBg = isDark ? 'rgba(255,255,255,0.03)' : '#ffffff'
  const cardBorder = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)'
  const pageBg = isDark ? '#0f0f12' : '#f5f5f7'
  const inputBg = isDark ? 'rgba(255,255,255,0.05)' : '#f9f9fb'
  const inputBorder = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.12)'
  const rowBorder = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.05)'
  const pillActiveBg = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'
  const pillInactiveBg = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)'

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
      closed: { bg: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)', color: textMuted as string, border: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)', label: 'Closed' },
    }
    const c = map[status]
    return <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 100, background: c.bg, color: c.color, border: `1px solid ${c.border}`, fontWeight: 600 }}>{c.label}</span>
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

  function fmt(d: string) {
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <div style={{ padding: '28px 32px', background: pageBg, minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Link href="/admin" style={{ fontSize: 13, color: textDim, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 5, marginBottom: 14 }}>
          <i className="bx bx-left-arrow-alt" /> Admin
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: textPrimary, margin: 0, letterSpacing: '-0.02em' }}>Issues</h1>
          <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 9px', borderRadius: 100, background: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)', color: textMuted }}>
            {issues.length}
          </span>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: textDim, marginRight: 3 }}>Status:</span>
          {statusPills.map(p => (
            <button key={p.value} onClick={() => setStatusFilter(p.value)} style={{ padding: '5px 11px', borderRadius: 100, fontSize: 12, fontWeight: 500, border: 'none', cursor: 'pointer', background: statusFilter === p.value ? pillActiveBg : pillInactiveBg, color: statusFilter === p.value ? textPrimary : textMuted, transition: 'background 0.15s' }}>
              {p.label}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: textDim, marginRight: 3 }}>Priority:</span>
          {priorityPills.map(p => (
            <button key={p.value} onClick={() => setPriorityFilter(p.value)} style={{ padding: '5px 11px', borderRadius: 100, fontSize: 12, fontWeight: 500, border: 'none', cursor: 'pointer', background: priorityFilter === p.value ? pillActiveBg : pillInactiveBg, color: priorityFilter === p.value ? textPrimary : textMuted, transition: 'background 0.15s' }}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div style={{ marginBottom: 16, padding: '10px 14px', borderRadius: 8, fontSize: 13, background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {error}
          <button onClick={clearError} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 16, lineHeight: 1 }}>✕</button>
        </div>
      )}

      {/* Table */}
      <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 14, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '60px 2fr 90px 100px 110px 130px', padding: '11px 20px', borderBottom: `1px solid ${cardBorder}`, fontSize: 11, fontWeight: 600, color: textDim, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
          <div>#</div>
          <div>Title</div>
          <div>Priority</div>
          <div>Status</div>
          <div>Created</div>
          <div>Change Status</div>
        </div>

        {loading && issues.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: textDim, fontSize: 13 }}>
            <i className="bx bx-loader-alt bx-spin" style={{ fontSize: 24, display: 'block', marginBottom: 10 }} />
            Loading issues…
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '56px 40px', textAlign: 'center' }}>
            <i className="bx bx-bug" style={{ fontSize: 38, color: textDim, display: 'block', marginBottom: 10 }} />
            <div style={{ fontSize: 14, fontWeight: 600, color: textMuted, marginBottom: 4 }}>No issues found</div>
            <div style={{ fontSize: 12, color: textDim }}>Try adjusting your filters.</div>
          </div>
        ) : filtered.map((issue, idx) => (
          <div key={issue.id} style={{ display: 'grid', gridTemplateColumns: '60px 2fr 90px 100px 110px 130px', padding: '13px 20px', borderBottom: idx < filtered.length - 1 ? `1px solid ${rowBorder}` : 'none', alignItems: 'center' }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: textDim, fontFamily: 'monospace' }}>#{issue.id}</div>
            <div style={{ fontSize: 13, fontWeight: 500, color: textPrimary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: 12 }}>{issue.title}</div>
            <div><PriorityBadge priority={issue.priority} /></div>
            <div><StatusBadge status={issue.status} /></div>
            <div style={{ fontSize: 11.5, color: textDim }}>{fmt(issue.created_at)}</div>
            <div>
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
