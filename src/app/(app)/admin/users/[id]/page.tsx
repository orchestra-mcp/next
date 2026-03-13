'use client'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { useRoleStore, ROLE_LABELS, ROLE_COLORS, type Role } from '@/store/roles'
import { apiFetch } from '@/lib/api'
import { ConfirmDialog } from '@/components/ConfirmDialog'

interface UserDetail {
  id: number
  name: string
  email: string
  role: string
  status: string
  created_at: string
  project_count: number
  note_count: number
  session_count: number
  team_count: number
  issue_count: number
}

interface Project { id: string; name: string; status: string; created_at: string }
interface Note { id: string; title: string; created_at: string }
interface AiSession { id: string; name: string; model: string; message_count: number; created_at: string }
interface Team { id: string; name: string; plan: string; member_count: number; role: string }
interface Issue { id: number; title: string; priority: string; status: string; created_at: string }

type Tab = 'overview' | 'projects' | 'notes' | 'chats' | 'teams' | 'issues'

const TABS: { key: Tab; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'projects', label: 'Projects' },
  { key: 'notes', label: 'Notes' },
  { key: 'chats', label: 'Chats' },
  { key: 'teams', label: 'Teams' },
  { key: 'issues', label: 'Issues' },
]

function fmtDate(s: string) {
  return new Date(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function initials(name?: string | null) {
  if (!name) return '?'
  return name.split(' ').map(w => w[0]).filter(Boolean).join('').slice(0, 2).toUpperCase()
}

function priorityStyle(p: string): React.CSSProperties {
  if (p === 'high') return { background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }
  if (p === 'medium') return { background: 'rgba(249,115,22,0.1)', color: '#f97316', border: '1px solid rgba(249,115,22,0.2)' }
  return { background: 'rgba(34,197,94,0.1)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.2)' }
}

function issueStatusStyle(s: string): React.CSSProperties {
  if (s === 'open') return { background: 'rgba(59,130,246,0.1)', color: '#3b82f6', border: '1px solid rgba(59,130,246,0.2)' }
  if (s === 'in-review') return { background: 'rgba(234,179,8,0.1)', color: '#ca8a04', border: '1px solid rgba(234,179,8,0.2)' }
  return { background: 'rgba(107,114,128,0.1)', color: '#6b7280', border: '1px solid rgba(107,114,128,0.2)' }
}

function projectStatusStyle(s: string): React.CSSProperties {
  if (s === 'active') return { background: 'rgba(34,197,94,0.1)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.2)' }
  if (s === 'archived') return { background: 'rgba(107,114,128,0.1)', color: '#6b7280', border: '1px solid rgba(107,114,128,0.2)' }
  if (s === 'paused') return { background: 'rgba(234,179,8,0.1)', color: '#ca8a04', border: '1px solid rgba(234,179,8,0.2)' }
  return { background: 'rgba(0,229,255,0.1)', color: '#00e5ff', border: '1px solid rgba(0,229,255,0.2)' }
}

function planStyle(p: string): React.CSSProperties {
  if (p === 'enterprise') return { background: 'rgba(169,0,255,0.1)', color: '#a900ff', border: '1px solid rgba(169,0,255,0.2)' }
  if (p === 'pro') return { background: 'rgba(0,229,255,0.1)', color: '#00e5ff', border: '1px solid rgba(0,229,255,0.2)' }
  return { background: 'rgba(107,114,128,0.1)', color: '#6b7280', border: '1px solid rgba(107,114,128,0.2)' }
}

const badgeSt: React.CSSProperties = { fontSize: 10, padding: '2px 8px', borderRadius: 100, fontWeight: 600, letterSpacing: '0.02em', whiteSpace: 'nowrap', display: 'inline-block' }

export default function AdminUserDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const { can, roleLoaded } = useRoleStore()

  const textPrimary = 'var(--color-fg)'
  const textMuted = 'var(--color-fg-muted)'
  const textDim = 'var(--color-fg-dim)'
  const cardBg = 'var(--color-bg-alt)'
  const cardBorder = 'var(--color-border)'
  const pageBg = 'var(--color-bg)'
  const rowAlt = 'var(--color-bg-alt)'
  const rowHover = 'var(--color-bg-alt)'
  const tabActiveBg = 'var(--color-border)'
  const tabInactiveBg = 'transparent'

  const [userDetail, setUserDetail] = useState<UserDetail | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [notes, setNotes] = useState<Note[]>([])
  const [sessions, setSessions] = useState<AiSession[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [issues, setIssues] = useState<Issue[]>([])
  const [tab, setTab] = useState<Tab>('overview')
  const [loading, setLoading] = useState(false)
  const [fetchedTabs, setFetchedTabs] = useState<Set<Tab>>(new Set())
  const [menuOpen, setMenuOpen] = useState(false)
  const [modal, setModal] = useState<'password' | 'notify' | 'role' | 'teams' | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [pwValue, setPwValue] = useState('')
  const [notifTitle, setNotifTitle] = useState('')
  const [notifMsg, setNotifMsg] = useState('')
  const [roleValue, setRoleValue] = useState('')
  const [userMemberships, setUserMemberships] = useState<{ membership_id: string; team_id: string; team_name: string; team_plan: string; role: string }[]>([])
  const [allTeamsList, setAllTeamsList] = useState<{ id: string; name: string; plan: string }[]>([])
  const [addTeamId, setAddTeamId] = useState('')
  const [addTeamRole, setAddTeamRole] = useState('member')
  const [confirmDialog, setConfirmDialog] = useState<{ title: string; message: string; confirmLabel: string; variant: 'danger' | 'warning' | 'default'; onConfirm: () => void } | null>(null)

  useEffect(() => {
    if (!roleLoaded) return
    if (!can('canViewAdmin')) { router.replace('/dashboard'); return }
    setLoading(true)
    apiFetch<{ user: UserDetail; project_count: number; note_count: number; session_count: number; team_count: number }>(`/api/admin/users/${id}`)
      .then(r => {
        if (r && r.user) {
          setUserDetail({ ...r.user, project_count: r.project_count ?? 0, note_count: r.note_count ?? 0, session_count: r.session_count ?? 0, team_count: r.team_count ?? 0, issue_count: 0 })
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [roleLoaded, id])

  useEffect(() => {
    if (tab === 'overview') return
    if (fetchedTabs.has(tab)) return
    setFetchedTabs(prev => new Set([...prev, tab]))

    if (tab === 'projects') {
      apiFetch<{ projects: Project[] }>(`/api/admin/users/${id}/projects`).then(r => setProjects(Array.isArray(r?.projects) ? r.projects : [])).catch(() => {})
    } else if (tab === 'notes') {
      apiFetch<{ notes: Note[] }>(`/api/admin/users/${id}/notes`).then(r => setNotes(Array.isArray(r?.notes) ? r.notes : [])).catch(() => {})
    } else if (tab === 'chats') {
      apiFetch<{ sessions: AiSession[] }>(`/api/admin/users/${id}/sessions`).then(r => setSessions(Array.isArray(r?.sessions) ? r.sessions : [])).catch(() => {})
    } else if (tab === 'teams') {
      apiFetch<{ teams: Team[] }>(`/api/admin/users/${id}/teams`).then(r => setTeams(Array.isArray(r?.teams) ? r.teams : [])).catch(() => {})
    } else if (tab === 'issues') {
      apiFetch<{ issues: Issue[] }>(`/api/admin/users/${id}/issues`).then(r => setIssues(Array.isArray(r?.issues) ? r.issues : [])).catch(() => {})
    }
  }, [tab, id])

  const u = userDetail
  const roleKey = (u?.role ?? 'user') as Role
  const roleColors = ROLE_COLORS[roleKey] ?? ROLE_COLORS.user
  const roleLabel = ROLE_LABELS[roleKey] ?? u?.role ?? ''

  const statCards = u ? [
    { label: 'Projects', value: u.project_count, icon: 'bx-folder' },
    { label: 'Notes', value: u.note_count, icon: 'bx-note' },
    { label: 'Sessions', value: u.session_count, icon: 'bx-chat' },
    { label: 'Teams', value: u.team_count, icon: 'bx-group' },
    { label: 'Issues', value: u.issue_count, icon: 'bx-bug' },
  ] : []

  const menuRef = { current: null as HTMLDivElement | null }

  async function handleAction(action: string) {
    if (!u) return
    setMenuOpen(false)
    if (action === 'password') { setPwValue(''); setModal('password'); return }
    if (action === 'notify') { setNotifTitle(''); setNotifMsg(''); setModal('notify'); return }
    if (action === 'role') { setRoleValue(u.role); setModal('role'); return }
    if (action === 'teams') {
      setAddTeamId(''); setAddTeamRole('member')
      Promise.all([
        apiFetch<{ memberships: typeof userMemberships }>(`/api/admin/users/${id}/memberships`).then(r => setUserMemberships(r?.memberships ?? [])).catch(() => setUserMemberships([])),
        apiFetch<{ teams: { id: string; name: string; slug: string; plan: string }[] }>('/api/admin/teams').then(r => setAllTeamsList((r?.teams ?? []).map(t => ({ id: t.id, name: t.name, plan: t.plan })))).catch(() => setAllTeamsList([])),
      ])
      setModal('teams')
      return
    }
    if (action === 'impersonate') {
      setConfirmDialog({
        title: 'Impersonate User',
        message: `Impersonate ${u.name}? You will be logged in as this user.`,
        confirmLabel: 'Impersonate',
        variant: 'warning',
        onConfirm: async () => {
          setConfirmDialog(null)
          setActionLoading(true)
          try {
            const r = await apiFetch<{ token: string; user: UserDetail }>(`/api/admin/users/${id}/impersonate`, { method: 'POST' })
            if (r?.token) {
              localStorage.setItem('token', r.token)
              window.location.href = '/dashboard'
            }
          } catch { /* handled silently */ }
          setActionLoading(false)
        },
      })
      return
    }
    if (action === 'toggle_status') {
      const endpoint = u.status === 'active' ? 'suspend' : 'unsuspend'
      const label = u.status === 'active' ? 'block' : 'unblock'
      setConfirmDialog({
        title: `${label.charAt(0).toUpperCase() + label.slice(1)} User`,
        message: `Are you sure you want to ${label} ${u.name}?`,
        confirmLabel: label.charAt(0).toUpperCase() + label.slice(1),
        variant: u.status === 'active' ? 'danger' : 'warning',
        onConfirm: async () => {
          setConfirmDialog(null)
          setActionLoading(true)
          try {
            await apiFetch(`/api/admin/users/${id}/${endpoint}`, { method: 'PATCH' })
            setUserDetail({ ...u, status: u.status === 'active' ? 'suspended' : 'active' })
          } catch { /* handled silently */ }
          setActionLoading(false)
        },
      })
    }
  }

  const [modalError, setModalError] = useState<string | null>(null)

  async function submitPassword() {
    if (!pwValue.trim() || pwValue.length < 8) { setModalError('Password must be at least 8 characters'); return }
    setModalError(null)
    setActionLoading(true)
    try {
      await apiFetch(`/api/admin/users/${id}/password`, { method: 'POST', body: JSON.stringify({ password: pwValue }) })
      setModal(null)
    } catch { setModalError('Failed to update password') }
    setActionLoading(false)
  }

  async function submitNotify() {
    if (!notifTitle.trim() || !notifMsg.trim()) { setModalError('Title and message are required'); return }
    setModalError(null)
    setActionLoading(true)
    try {
      await apiFetch(`/api/admin/users/${id}/notify`, { method: 'POST', body: JSON.stringify({ title: notifTitle, message: notifMsg, type: 'info' }) })
      setModal(null)
    } catch { setModalError('Failed to send notification') }
    setActionLoading(false)
  }

  async function submitRole() {
    if (!roleValue) return
    setModalError(null)
    setActionLoading(true)
    try {
      await apiFetch(`/api/admin/users/${id}/role`, { method: 'PATCH', body: JSON.stringify({ role: roleValue }) })
      setUserDetail(prev => prev ? { ...prev, role: roleValue } : prev)
      setModal(null)
    } catch { setModalError('Failed to update role') }
    setActionLoading(false)
  }

  const thStyle: React.CSSProperties = { fontSize: 11, fontWeight: 600, color: textDim, letterSpacing: '0.04em', textTransform: 'uppercase', padding: '10px 16px', textAlign: 'start' }
  const tdStyle: React.CSSProperties = { padding: '11px 16px', fontSize: 13, color: textPrimary, verticalAlign: 'middle' }

  function EmptyState({ icon, label }: { icon: string; label: string }) {
    return (
      <div style={{ padding: '52px 0', textAlign: 'center' }}>
        <i className={`bx ${icon}`} style={{ fontSize: 36, color: textDim, display: 'block', marginBottom: 10 }} />
        <div style={{ fontSize: 13, color: textMuted }}>{label}</div>
      </div>
    )
  }

  function TabLoading() {
    return <div style={{ padding: '40px 0', textAlign: 'center', fontSize: 13, color: textDim }}>Loading…</div>
  }

  const tabFetching = (t: Tab) => !fetchedTabs.has(t) && t !== 'overview'

  return (
    <div style={{ padding: '28px 32px', maxWidth: 900, margin: '0 auto', background: pageBg, minHeight: '100vh' }}>
      <Link href="/admin/users" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 13, color: textDim, textDecoration: 'none', marginBottom: 20 }}>
        <i className="bx bx-left-arrow-alt rtl-flip" /> Users
      </Link>

      {loading && !u && (
        <div style={{ textAlign: 'center', padding: '60px 0', fontSize: 13, color: textDim }}>Loading…</div>
      )}

      {u && (
        <>
          {/* Header card */}
          <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 14, padding: 24, marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 18 }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(0,229,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700, color: '#00e5ff', flexShrink: 0 }}>
                {initials(u.name)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 4 }}>
                  <span style={{ fontSize: 20, fontWeight: 700, color: textPrimary }}>{u.name}</span>
                  <span style={{ ...badgeSt, background: roleColors.bg, color: roleColors.color, border: `1px solid ${roleColors.border}` }}>{roleLabel}</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11 }}>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: u.status === 'active' ? '#22c55e' : '#ef4444', display: 'inline-block' }} />
                    <span style={{ color: u.status === 'active' ? '#22c55e' : '#ef4444' }}>{(u.status || 'unknown').charAt(0).toUpperCase() + (u.status || 'unknown').slice(1)}</span>
                  </span>
                </div>
                <div style={{ fontSize: 13, color: textMuted, marginBottom: 6 }}>{u.email}</div>
                <div style={{ fontSize: 11, color: textDim }}>Joined {fmtDate(u.created_at)}</div>
              </div>

              {/* Actions dropdown */}
              <div style={{ position: 'relative', flexShrink: 0 }} ref={el => { menuRef.current = el }}>
                <button onClick={() => setMenuOpen(v => !v)} disabled={actionLoading} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, border: `1px solid ${cardBorder}`, background: 'transparent', color: textMuted, fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>
                  <i className="bx bx-dots-vertical-rounded" style={{ fontSize: 16 }} />
                  Actions
                  <i className="bx bx-chevron-down" style={{ fontSize: 14 }} />
                </button>
                {menuOpen && (
                  <>
                    <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setMenuOpen(false)} />
                    <div style={{ position: 'absolute', right: 0, top: '100%', marginTop: 6, minWidth: 200, background: 'var(--color-bg)', border: `1px solid ${cardBorder}`, borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.3)', zIndex: 50, overflow: 'hidden', padding: 4 }}>
                      {[
                        { key: 'password', icon: 'bx-lock-alt', label: 'Change Password' },
                        { key: 'notify', icon: 'bx-bell', label: 'Send Notification' },
                        { key: 'role', icon: 'bx-shield', label: 'Change Role' },
                        { key: 'teams', icon: 'bx-group', label: 'Manage Teams' },
                        { key: 'impersonate', icon: 'bx-user-check', label: 'Impersonate' },
                      ].map(a => (
                        <button key={a.key} onClick={() => handleAction(a.key)} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 12px', border: 'none', borderRadius: 6, background: 'transparent', color: textPrimary, fontSize: 13, cursor: 'pointer', textAlign: 'start' }} onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-bg-alt)')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                          <i className={`bx ${a.icon}`} style={{ fontSize: 15, color: textMuted }} /> {a.label}
                        </button>
                      ))}
                      <div style={{ height: 1, background: cardBorder, margin: '4px 0' }} />
                      <button onClick={() => handleAction('toggle_status')} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 12px', border: 'none', borderRadius: 6, background: 'transparent', color: u.status === 'active' ? '#ef4444' : '#22c55e', fontSize: 13, cursor: 'pointer', textAlign: 'start' }} onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-bg-alt)')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                        <i className={`bx ${u.status === 'active' ? 'bx-block' : 'bx-check-circle'}`} style={{ fontSize: 15 }} />
                        {u.status === 'active' ? 'Block User' : 'Unblock User'}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Stats */}
            <div style={{ display: 'flex', gap: 10, marginTop: 20, flexWrap: 'wrap' }}>
              {statCards.map(s => (
                <div key={s.label} style={{ flex: '1 1 80px', background: 'var(--color-bg-alt)', border: `1px solid ${cardBorder}`, borderRadius: 10, padding: '10px 14px', minWidth: 80 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <i className={`bx ${s.icon}`} style={{ fontSize: 13, color: textDim }} />
                    <span style={{ fontSize: 10, color: textDim, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{s.label}</span>
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: textPrimary }}>{s.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Tab bar */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 16, background: 'var(--color-bg-alt)', border: `1px solid ${cardBorder}`, borderRadius: 12, padding: 4 }}>
            {TABS.map(t => (
              <button key={t.key} onClick={() => setTab(t.key)} style={{ flex: 1, padding: '7px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: tab === t.key ? 600 : 400, color: tab === t.key ? textPrimary : textMuted, background: tab === t.key ? tabActiveBg : tabInactiveBg, transition: 'background 0.15s' }}>
                {t.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 14, overflow: 'hidden' }}>

            {/* Overview */}
            {tab === 'overview' && (
              <div style={{ padding: 24 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12, marginBottom: 24 }}>
                  {statCards.map(s => (
                    <div key={s.label} style={{ background: 'var(--color-bg-alt)', border: `1px solid ${cardBorder}`, borderRadius: 12, padding: '16px 18px' }}>
                      <i className={`bx ${s.icon}`} style={{ fontSize: 20, color: '#00e5ff', display: 'block', marginBottom: 8 }} />
                      <div style={{ fontSize: 24, fontWeight: 700, color: textPrimary }}>{s.value}</div>
                      <div style={{ fontSize: 12, color: textMuted, marginTop: 2 }}>{s.label}</div>
                    </div>
                  ))}
                </div>
                <div style={{ padding: '24px 0', textAlign: 'center', color: textDim, fontSize: 13 }}>No additional overview data</div>
              </div>
            )}

            {/* Projects */}
            {tab === 'projects' && (
              tabFetching('projects') ? <TabLoading /> : projects.length === 0 ? <EmptyState icon="bx-folder-open" label="No projects found" /> : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${cardBorder}` }}>
                      <th style={thStyle}>Name</th>
                      <th style={thStyle}>Status</th>
                      <th style={thStyle}>Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projects.map((p, i) => (
                      <tr key={p.id} style={{ borderBottom: i < projects.length - 1 ? `1px solid var(--color-bg-alt)` : 'none', background: i % 2 === 1 ? rowAlt : 'transparent' }}
                        onMouseEnter={e => (e.currentTarget.style.background = rowHover)}
                        onMouseLeave={e => (e.currentTarget.style.background = i % 2 === 1 ? rowAlt : 'transparent')}>
                        <td style={{ ...tdStyle, fontWeight: 500 }}>{p.name}</td>
                        <td style={tdStyle}><span style={{ ...badgeSt, ...projectStatusStyle(p.status) }}>{p.status}</span></td>
                        <td style={{ ...tdStyle, color: textMuted }}>{fmtDate(p.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )
            )}

            {/* Notes */}
            {tab === 'notes' && (
              tabFetching('notes') ? <TabLoading /> : notes.length === 0 ? <EmptyState icon="bx-note" label="No notes found" /> : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${cardBorder}` }}>
                      <th style={thStyle}>Title</th>
                      <th style={thStyle}>Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {notes.map((n, i) => (
                      <tr key={n.id} style={{ borderBottom: i < notes.length - 1 ? `1px solid var(--color-bg-alt)` : 'none', background: i % 2 === 1 ? rowAlt : 'transparent' }}
                        onMouseEnter={e => (e.currentTarget.style.background = rowHover)}
                        onMouseLeave={e => (e.currentTarget.style.background = i % 2 === 1 ? rowAlt : 'transparent')}>
                        <td style={{ ...tdStyle, fontWeight: 500 }}>{n.title}</td>
                        <td style={{ ...tdStyle, color: textMuted }}>{fmtDate(n.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )
            )}

            {/* Chats */}
            {tab === 'chats' && (
              tabFetching('chats') ? <TabLoading /> : sessions.length === 0 ? <EmptyState icon="bx-chat" label="No chat sessions found" /> : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${cardBorder}` }}>
                      <th style={thStyle}>Name</th>
                      <th style={thStyle}>Model</th>
                      <th style={thStyle}>Messages</th>
                      <th style={thStyle}>Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessions.map((s, i) => (
                      <tr key={s.id} style={{ borderBottom: i < sessions.length - 1 ? `1px solid var(--color-bg-alt)` : 'none', background: i % 2 === 1 ? rowAlt : 'transparent' }}
                        onMouseEnter={e => (e.currentTarget.style.background = rowHover)}
                        onMouseLeave={e => (e.currentTarget.style.background = i % 2 === 1 ? rowAlt : 'transparent')}>
                        <td style={{ ...tdStyle, fontWeight: 500 }}>{s.name || 'Untitled'}</td>
                        <td style={tdStyle}><span style={{ ...badgeSt, background: 'rgba(0,229,255,0.1)', color: '#00e5ff', border: '1px solid rgba(0,229,255,0.2)' }}>{s.model || 'unknown'}</span></td>
                        <td style={{ ...tdStyle, color: textMuted }}>{s.message_count ?? 0}</td>
                        <td style={{ ...tdStyle, color: textMuted }}>{fmtDate(s.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )
            )}

            {/* Teams */}
            {tab === 'teams' && (
              tabFetching('teams') ? <TabLoading /> : teams.length === 0 ? <EmptyState icon="bx-group" label="No teams found" /> : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${cardBorder}` }}>
                      <th style={thStyle}>Name</th>
                      <th style={thStyle}>Plan</th>
                      <th style={thStyle}>Members</th>
                      <th style={thStyle}>Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teams.map((t, i) => (
                      <tr key={t.id} style={{ borderBottom: i < teams.length - 1 ? `1px solid var(--color-bg-alt)` : 'none', background: i % 2 === 1 ? rowAlt : 'transparent' }}
                        onMouseEnter={e => (e.currentTarget.style.background = rowHover)}
                        onMouseLeave={e => (e.currentTarget.style.background = i % 2 === 1 ? rowAlt : 'transparent')}>
                        <td style={{ ...tdStyle, fontWeight: 500 }}>{t.name}</td>
                        <td style={tdStyle}><span style={{ ...badgeSt, ...planStyle(t.plan) }}>{t.plan}</span></td>
                        <td style={{ ...tdStyle, color: textMuted }}>{t.member_count}</td>
                        <td style={tdStyle}><span style={{ ...badgeSt, ...roleColors }}>{t.role}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )
            )}

            {/* Issues */}
            {tab === 'issues' && (
              tabFetching('issues') ? <TabLoading /> : issues.length === 0 ? <EmptyState icon="bx-bug" label="No issues found" /> : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${cardBorder}` }}>
                      <th style={thStyle}>ID</th>
                      <th style={thStyle}>Title</th>
                      <th style={thStyle}>Priority</th>
                      <th style={thStyle}>Status</th>
                      <th style={thStyle}>Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {issues.map((iss, i) => (
                      <tr key={iss.id} style={{ borderBottom: i < issues.length - 1 ? `1px solid var(--color-bg-alt)` : 'none', background: i % 2 === 1 ? rowAlt : 'transparent' }}
                        onMouseEnter={e => (e.currentTarget.style.background = rowHover)}
                        onMouseLeave={e => (e.currentTarget.style.background = i % 2 === 1 ? rowAlt : 'transparent')}>
                        <td style={{ ...tdStyle, color: textDim, fontSize: 12, fontFamily: 'monospace' }}>#{iss.id}</td>
                        <td style={{ ...tdStyle, fontWeight: 500 }}>{iss.title}</td>
                        <td style={tdStyle}><span style={{ ...badgeSt, ...priorityStyle(iss.priority) }}>{iss.priority}</span></td>
                        <td style={tdStyle}><span style={{ ...badgeSt, ...issueStatusStyle(iss.status) }}>{iss.status}</span></td>
                        <td style={{ ...tdStyle, color: textMuted }}>{fmtDate(iss.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )
            )}
          </div>
        </>
      )}

      {/* Modals */}
      {modal && (
        <>
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100 }} onClick={() => { if (!actionLoading) { setModal(null); setModalError(null) } }} />
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'var(--color-bg)', border: `1px solid ${cardBorder}`, borderRadius: 14, padding: 24, width: modal === 'teams' ? 520 : 400, maxWidth: '90vw', zIndex: 101, boxShadow: '0 16px 48px rgba(0,0,0,0.4)' }}>

            {modalError && (
              <div style={{ marginBottom: 12, padding: '8px 12px', borderRadius: 8, fontSize: 12, background: 'rgba(239,68,68,0.08)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>
                {modalError}
              </div>
            )}

            {modal === 'password' && (
              <>
                <div style={{ fontSize: 16, fontWeight: 700, color: textPrimary, marginBottom: 16 }}>Change Password</div>
                <label style={{ fontSize: 12, color: textMuted, display: 'block', marginBottom: 6 }}>New Password</label>
                <input type="password" value={pwValue} onChange={e => setPwValue(e.target.value)} placeholder="Min 8 characters" style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: `1px solid ${cardBorder}`, background: 'var(--color-bg-alt)', color: textPrimary, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 20 }}>
                  <button onClick={() => setModal(null)} disabled={actionLoading} style={{ padding: '8px 16px', borderRadius: 8, border: `1px solid ${cardBorder}`, background: 'transparent', color: textMuted, fontSize: 13, cursor: 'pointer' }}>Cancel</button>
                  <button onClick={submitPassword} disabled={actionLoading} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: '#00e5ff', color: '#000', fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: actionLoading ? 0.5 : 1 }}>{actionLoading ? 'Saving...' : 'Update Password'}</button>
                </div>
              </>
            )}

            {modal === 'notify' && (
              <>
                <div style={{ fontSize: 16, fontWeight: 700, color: textPrimary, marginBottom: 16 }}>Send Notification</div>
                <label style={{ fontSize: 12, color: textMuted, display: 'block', marginBottom: 6 }}>Title</label>
                <input value={notifTitle} onChange={e => setNotifTitle(e.target.value)} placeholder="Notification title" style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: `1px solid ${cardBorder}`, background: 'var(--color-bg-alt)', color: textPrimary, fontSize: 13, outline: 'none', marginBottom: 12, boxSizing: 'border-box' }} />
                <label style={{ fontSize: 12, color: textMuted, display: 'block', marginBottom: 6 }}>Message</label>
                <textarea value={notifMsg} onChange={e => setNotifMsg(e.target.value)} placeholder="Notification message" rows={3} style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: `1px solid ${cardBorder}`, background: 'var(--color-bg-alt)', color: textPrimary, fontSize: 13, outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 20 }}>
                  <button onClick={() => setModal(null)} disabled={actionLoading} style={{ padding: '8px 16px', borderRadius: 8, border: `1px solid ${cardBorder}`, background: 'transparent', color: textMuted, fontSize: 13, cursor: 'pointer' }}>Cancel</button>
                  <button onClick={submitNotify} disabled={actionLoading} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: '#00e5ff', color: '#000', fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: actionLoading ? 0.5 : 1 }}>{actionLoading ? 'Sending...' : 'Send'}</button>
                </div>
              </>
            )}

            {modal === 'role' && (
              <>
                <div style={{ fontSize: 16, fontWeight: 700, color: textPrimary, marginBottom: 16 }}>Change Role</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {(['admin', 'team_owner', 'team_manager', 'user'] as const).map(r => (
                    <label key={r} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 8, border: `1px solid ${roleValue === r ? '#00e5ff' : cardBorder}`, background: roleValue === r ? 'rgba(0,229,255,0.07)' : 'transparent', cursor: 'pointer' }}>
                      <input type="radio" name="role" checked={roleValue === r} onChange={() => setRoleValue(r)} style={{ accentColor: '#00e5ff' }} />
                      <span style={{ fontSize: 13, color: textPrimary, fontWeight: roleValue === r ? 600 : 400 }}>{ROLE_LABELS[r] || r}</span>
                    </label>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 20 }}>
                  <button onClick={() => setModal(null)} disabled={actionLoading} style={{ padding: '8px 16px', borderRadius: 8, border: `1px solid ${cardBorder}`, background: 'transparent', color: textMuted, fontSize: 13, cursor: 'pointer' }}>Cancel</button>
                  <button onClick={submitRole} disabled={actionLoading} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: '#00e5ff', color: '#000', fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: actionLoading ? 0.5 : 1 }}>{actionLoading ? 'Saving...' : 'Update Role'}</button>
                </div>
              </>
            )}

            {modal === 'teams' && (
              <>
                <div style={{ fontSize: 16, fontWeight: 700, color: textPrimary, marginBottom: 4 }}>Manage Teams</div>
                <div style={{ fontSize: 13, color: textMuted, marginBottom: 16 }}>Add or remove {u?.name || 'this user'} from teams</div>

                {/* Current memberships */}
                {userMemberships.length > 0 ? (
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: textDim, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Current Teams</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {userMemberships.map(m => (
                        <div key={m.team_id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderRadius: 8, border: `1px solid ${cardBorder}`, background: 'var(--color-bg-alt)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: 13, fontWeight: 500, color: textPrimary }}>{m.team_name}</span>
                            <span style={{ ...badgeSt, ...planStyle(m.team_plan) }}>{m.team_plan}</span>
                            <span style={{ fontSize: 11, color: textMuted }}>({m.role})</span>
                          </div>
                          <button onClick={() => {
                            setConfirmDialog({
                              title: 'Remove from Team',
                              message: `Remove from "${m.team_name}"?`,
                              confirmLabel: 'Remove',
                              variant: 'danger',
                              onConfirm: async () => {
                                setConfirmDialog(null)
                                try {
                                  await apiFetch(`/api/admin/users/${id}/memberships/${m.team_id}`, { method: 'DELETE' })
                                  setUserMemberships(prev => prev.filter(x => x.team_id !== m.team_id))
                                  setUserDetail(prev => prev ? { ...prev, team_count: Math.max(0, prev.team_count - 1) } : prev)
                                } catch { /* handled silently */ }
                              },
                            })
                          }} style={{ width: 26, height: 26, borderRadius: 6, border: '1px solid rgba(239,68,68,0.25)', background: 'rgba(239,68,68,0.06)', color: '#ef4444', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Remove from team">
                            <i className="bx bx-x" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div style={{ padding: '16px 0', textAlign: 'center', fontSize: 13, color: textDim, marginBottom: 16 }}>Not a member of any team</div>
                )}

                {/* Add to team */}
                <div style={{ fontSize: 12, fontWeight: 600, color: textDim, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Add to Team</div>
                <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                  <select value={addTeamId} onChange={e => setAddTeamId(e.target.value)} style={{ flex: 2, padding: '8px 12px', borderRadius: 8, border: `1px solid ${cardBorder}`, background: 'var(--color-bg-alt)', color: textPrimary, fontSize: 13, outline: 'none' }}>
                    <option value="">Select a team...</option>
                    {allTeamsList.filter(t => !userMemberships.some(m => m.team_id === t.id)).map(t => (
                      <option key={t.id} value={t.id}>{t.name} ({t.plan})</option>
                    ))}
                  </select>
                  <select value={addTeamRole} onChange={e => setAddTeamRole(e.target.value)} style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: `1px solid ${cardBorder}`, background: 'var(--color-bg-alt)', color: textPrimary, fontSize: 13, outline: 'none' }}>
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                    <option value="owner">Owner</option>
                    <option value="viewer">Viewer</option>
                  </select>
                </div>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                  <button onClick={() => setModal(null)} style={{ padding: '8px 16px', borderRadius: 8, border: `1px solid ${cardBorder}`, background: 'transparent', color: textMuted, fontSize: 13, cursor: 'pointer' }}>Close</button>
                  <button onClick={async () => {
                    if (!addTeamId) { setModalError('Select a team'); return }
                    setModalError(null)
                    setActionLoading(true)
                    try {
                      await apiFetch(`/api/admin/teams/${addTeamId}/members`, { method: 'POST', body: JSON.stringify({ user_id: Number(id), role: addTeamRole }) })
                      const team = allTeamsList.find(t => t.id === addTeamId)
                      setUserMemberships(prev => [...prev, { membership_id: '', team_id: addTeamId, team_name: team?.name || '', team_plan: team?.plan || 'free', role: addTeamRole }])
                      setUserDetail(prev => prev ? { ...prev, team_count: prev.team_count + 1 } : prev)
                      setAddTeamId('')
                    } catch (e: any) {
                      setModalError(e?.message || 'Failed to add to team')
                    }
                    setActionLoading(false)
                  }} disabled={actionLoading || !addTeamId} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: '#00e5ff', color: '#000', fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: actionLoading || !addTeamId ? 0.4 : 1 }}>
                    {actionLoading ? 'Adding...' : 'Add to Team'}
                  </button>
                </div>
              </>
            )}
          </div>
        </>
      )}

      <ConfirmDialog
        open={!!confirmDialog}
        title={confirmDialog?.title}
        message={confirmDialog?.message ?? ''}
        confirmLabel={confirmDialog?.confirmLabel}
        variant={confirmDialog?.variant}
        onConfirm={() => confirmDialog?.onConfirm()}
        onCancel={() => setConfirmDialog(null)}
      />
    </div>
  )
}
