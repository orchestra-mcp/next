'use client'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { useThemeStore } from '@/store/theme'
import { useRoleStore, ROLE_LABELS, ROLE_COLORS, type Role } from '@/store/roles'
import { apiFetch } from '@/lib/api'

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

function initials(name: string) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
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

  const { theme } = useThemeStore()
  const isDark = theme === 'dark'
  const { can, roleLoaded } = useRoleStore()

  const textPrimary = isDark ? '#f8f8f8' : '#0f0f12'
  const textMuted = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.45)'
  const textDim = isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.3)'
  const cardBg = isDark ? 'rgba(255,255,255,0.03)' : '#ffffff'
  const cardBorder = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)'
  const pageBg = isDark ? '#0f0f12' : '#f5f5f7'
  const rowAlt = isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.015)'
  const rowHover = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)'
  const tabActiveBg = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)'
  const tabInactiveBg = 'transparent'

  const [userDetail, setUserDetail] = useState<UserDetail | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [notes, setNotes] = useState<Note[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [issues, setIssues] = useState<Issue[]>([])
  const [tab, setTab] = useState<Tab>('overview')
  const [loading, setLoading] = useState(false)
  const [fetchedTabs, setFetchedTabs] = useState<Set<Tab>>(new Set())

  useEffect(() => {
    if (!roleLoaded) return
    if (!can('canViewAdmin')) { router.replace('/dashboard'); return }
    setLoading(true)
    apiFetch<UserDetail>(`/api/admin/users/${id}`)
      .then(setUserDetail)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [roleLoaded, id])

  useEffect(() => {
    if (tab === 'overview' || tab === 'chats') return
    if (fetchedTabs.has(tab)) return
    setFetchedTabs(prev => new Set([...prev, tab]))

    if (tab === 'projects') {
      apiFetch<Project[]>(`/api/admin/users/${id}/projects`).then(setProjects).catch(() => {})
    } else if (tab === 'notes') {
      apiFetch<Note[]>(`/api/admin/users/${id}/notes`).then(setNotes).catch(() => {})
    } else if (tab === 'teams') {
      apiFetch<Team[]>(`/api/admin/users/${id}/teams`).then(setTeams).catch(() => {})
    } else if (tab === 'issues') {
      apiFetch<Issue[]>(`/api/admin/users/${id}/issues`).then(setIssues).catch(() => {})
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

  function ActionBtn({ icon, label, danger }: { icon: string; label: string; danger?: boolean }) {
    return (
      <button style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, border: `1px solid ${danger ? 'rgba(239,68,68,0.25)' : cardBorder}`, background: danger ? 'rgba(239,68,68,0.07)' : 'transparent', color: danger ? '#ef4444' : textMuted, fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>
        <i className={`bx ${icon}`} style={{ fontSize: 14 }} />
        {label}
      </button>
    )
  }

  const thStyle: React.CSSProperties = { fontSize: 11, fontWeight: 600, color: textDim, letterSpacing: '0.04em', textTransform: 'uppercase', padding: '10px 16px', textAlign: 'left' }
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

  const tabFetching = (t: Tab) => !fetchedTabs.has(t) && t !== 'overview' && t !== 'chats'

  return (
    <div style={{ padding: '28px 32px', maxWidth: 900, margin: '0 auto', background: pageBg, minHeight: '100vh' }}>
      <Link href="/admin/users" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 13, color: textDim, textDecoration: 'none', marginBottom: 20 }}>
        <i className="bx bx-left-arrow-alt" /> Users
      </Link>

      {loading && !u && (
        <div style={{ textAlign: 'center', padding: '60px 0', fontSize: 13, color: textDim }}>Loading…</div>
      )}

      {u && (
        <>
          {/* Header card */}
          <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 14, padding: 24, marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 18, flexWrap: 'wrap' }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(0,229,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700, color: '#00e5ff', flexShrink: 0 }}>
                {initials(u.name)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 4 }}>
                  <span style={{ fontSize: 20, fontWeight: 700, color: textPrimary }}>{u.name}</span>
                  <span style={{ ...badgeSt, background: roleColors.bg, color: roleColors.color, border: `1px solid ${roleColors.border}` }}>{roleLabel}</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11 }}>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: u.status === 'active' ? '#22c55e' : '#ef4444', display: 'inline-block' }} />
                    <span style={{ color: u.status === 'active' ? '#22c55e' : '#ef4444' }}>{u.status.charAt(0).toUpperCase() + u.status.slice(1)}</span>
                  </span>
                </div>
                <div style={{ fontSize: 13, color: textMuted, marginBottom: 6 }}>{u.email}</div>
                <div style={{ fontSize: 11, color: textDim }}>Joined {fmtDate(u.created_at)}</div>
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: 8, marginTop: 20, flexWrap: 'wrap' }}>
              <ActionBtn icon="bx-lock-alt" label="Change Password" />
              <ActionBtn icon="bx-bell" label="Send Notification" />
              <ActionBtn icon="bx-user-check" label="Impersonate" />
              <ActionBtn icon={u.status === 'active' ? 'bx-block' : 'bx-check-circle'} label={u.status === 'active' ? 'Block' : 'Unblock'} danger={u.status === 'active'} />
            </div>

            {/* Stats */}
            <div style={{ display: 'flex', gap: 10, marginTop: 20, flexWrap: 'wrap' }}>
              {statCards.map(s => (
                <div key={s.label} style={{ flex: '1 1 80px', background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.025)', border: `1px solid ${cardBorder}`, borderRadius: 10, padding: '10px 14px', minWidth: 80 }}>
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
          <div style={{ display: 'flex', gap: 4, marginBottom: 16, background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.04)', border: `1px solid ${cardBorder}`, borderRadius: 12, padding: 4 }}>
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
                    <div key={s.label} style={{ background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.025)', border: `1px solid ${cardBorder}`, borderRadius: 12, padding: '16px 18px' }}>
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
                      <tr key={p.id} style={{ borderBottom: i < projects.length - 1 ? `1px solid ${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.05)'}` : 'none', background: i % 2 === 1 ? rowAlt : 'transparent' }}
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
                      <tr key={n.id} style={{ borderBottom: i < notes.length - 1 ? `1px solid ${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.05)'}` : 'none', background: i % 2 === 1 ? rowAlt : 'transparent' }}
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
              <EmptyState icon="bx-chat" label="Chat history coming soon" />
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
                      <tr key={t.id} style={{ borderBottom: i < teams.length - 1 ? `1px solid ${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.05)'}` : 'none', background: i % 2 === 1 ? rowAlt : 'transparent' }}
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
                      <tr key={iss.id} style={{ borderBottom: i < issues.length - 1 ? `1px solid ${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.05)'}` : 'none', background: i % 2 === 1 ? rowAlt : 'transparent' }}
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
    </div>
  )
}
