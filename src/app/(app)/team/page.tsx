'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useRoleStore, ROLE_LABELS, ROLE_COLORS, type Role } from '@/store/roles'
import { useThemeStore } from '@/store/theme'

type Tab = 'overview' | 'members' | 'settings'

function RoleBadge({ role }: { role: Role }) {
  const c = ROLE_COLORS[role]
  return (
    <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 100, background: c.bg, color: c.color, border: `1px solid ${c.border}`, fontWeight: 600, letterSpacing: '0.02em', whiteSpace: 'nowrap' }}>
      {ROLE_LABELS[role]}
    </span>
  )
}

function StatusDot({ status }: { status: string }) {
  const color = status === 'active' ? '#22c55e' : status === 'invited' ? '#f97316' : '#ef4444'
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, color }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: color, display: 'inline-block' }} />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}

export default function TeamPage() {
  const {
    can, roleLoaded, team, members, currentRole,
    fetchTeam, fetchMembers, inviteMember, updateMemberRole, removeMember, updateTeam, deleteTeam,
    loading, error, clearError,
  } = useRoleStore()
  const { theme } = useThemeStore()
  const isDark = theme === 'dark'

  const [tab, setTab] = useState<Tab>('overview')

  // Members state
  const [search, setSearch] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editRole, setEditRole] = useState<Role>('user')
  const [confirmRemove, setConfirmRemove] = useState<number | null>(null)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<Role>('user')
  const [inviteLoading, setInviteLoading] = useState(false)
  const [inviteSent, setInviteSent] = useState(false)
  const [showInvite, setShowInvite] = useState(false)

  // Settings state
  const [teamName, setTeamName] = useState('')
  const [teamDesc, setTeamDesc] = useState('')
  const [saved, setSaved] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!roleLoaded) return
    if (!team) fetchTeam()
    if (members.length === 0) fetchMembers()
  }, [roleLoaded])

  useEffect(() => {
    if (team) { setTeamName(team.name); setTeamDesc(team.description ?? '') }
  }, [team])

  const textPrimary = isDark ? '#f8f8f8' : '#0f0f12'
  const textMuted = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.45)'
  const textDim = isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.3)'
  const cardBg = isDark ? 'rgba(255,255,255,0.03)' : '#ffffff'
  const cardBorder = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)'
  const divider = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.07)'
  const inputBg = isDark ? 'rgba(255,255,255,0.04)' : '#fafafa'
  const inputBorder = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.12)'
  const searchBg = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)'
  const searchBorder = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)'
  const selectBg = isDark ? '#1a1520' : '#ffffff'
  const selectBorder = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.12)'
  const tabActiveBg = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)'
  const planBadgeBg = isDark ? 'rgba(0,229,255,0.1)' : 'rgba(0,229,255,0.08)'
  const labelColor = isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.5)'

  const planColors: Record<string, string> = {
    free: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)',
    pro: '#00e5ff',
    enterprise: '#a900ff',
  }

  const inputSt: React.CSSProperties = {
    width: '100%', padding: '9px 12px', borderRadius: 9, border: `1px solid ${inputBorder}`,
    background: inputBg, color: textPrimary, fontSize: 13, outline: 'none', boxSizing: 'border-box',
  }

  const statusCounts = members.reduce<Record<string, number>>((acc, m) => {
    acc[m.status] = (acc[m.status] ?? 0) + 1
    return acc
  }, {})

  const filteredMembers = members.filter(m => {
    const q = search.toLowerCase()
    return !q || m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q)
  })

  const handleRoleUpdate = async (id: number) => {
    try { await updateMemberRole(id, editRole); setEditingId(null) } catch {}
  }
  const handleRemove = async (id: number) => {
    try { await removeMember(id); setConfirmRemove(null) } catch {}
  }
  const handleInvite = async () => {
    if (!inviteEmail.trim()) return
    setInviteLoading(true)
    try {
      await inviteMember(inviteEmail.trim(), inviteRole)
      setInviteSent(true); setInviteEmail('')
      setTimeout(() => { setInviteSent(false); setShowInvite(false) }, 2500)
    } catch {} finally { setInviteLoading(false) }
  }
  const router = useRouter()
  const handleSaveSettings = async () => {
    try {
      await updateTeam({ name: teamName.trim() || team?.name, description: teamDesc.trim() })
      setSaved(true); setTimeout(() => setSaved(false), 2500)
    } catch {}
  }
  const handleDeleteTeam = async () => {
    setDeleting(true)
    try {
      await deleteTeam()
      router.push('/dashboard')
    } catch {} finally { setDeleting(false) }
  }

  const tabs: { key: Tab; label: string; icon: string; hide?: boolean }[] = [
    { key: 'overview', label: 'Overview', icon: 'bx-home-alt-2' },
    { key: 'members', label: 'Members', icon: 'bx-group' },
    { key: 'settings', label: 'Settings', icon: 'bx-cog', hide: !can('canManageTeam') },
  ].filter(t => !t.hide) as { key: Tab; label: string; icon: string }[]

  return (
    <div style={{ padding: '28px 32px' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: textPrimary, margin: 0, letterSpacing: '-0.02em' }}>
          {team?.name ?? 'Team'}
        </h1>
        <p style={{ fontSize: 13, color: textMuted, marginTop: 5 }}>
          {team?.description ?? 'Manage your team, members, and settings'}
        </p>
      </div>

      {error && (
        <div style={{ marginBottom: 16, padding: '10px 14px', borderRadius: 8, fontSize: 13, background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>
          {error}
          <button onClick={clearError} style={{ marginLeft: 8, background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 12 }}>✕</button>
        </div>
      )}

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, padding: '4px', background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)', borderRadius: 10, width: 'fit-content' }}>
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '7px 16px', borderRadius: 7, border: 'none',
              background: tab === t.key ? tabActiveBg : 'transparent',
              color: tab === t.key ? textPrimary : textMuted,
              fontSize: 13, fontWeight: tab === t.key ? 600 : 400,
              cursor: 'pointer', transition: 'all 0.12s',
              boxShadow: tab === t.key ? (isDark ? '0 1px 4px rgba(0,0,0,0.3)' : '0 1px 3px rgba(0,0,0,0.1)') : 'none',
            }}
          >
            <i className={`bx ${t.icon}`} style={{ fontSize: 15, opacity: tab === t.key ? 1 : 0.6 }} />
            {t.label}
            {t.key === 'members' && members.length > 0 && (
              <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 100, background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)', color: textMuted }}>
                {members.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW TAB ── */}
      {tab === 'overview' && (
        <div style={{ maxWidth: 680 }}>
          {/* Team info card */}
          {team ? (
            <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 14, padding: '22px 24px', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(169,0,255,0.1)', border: '1px solid rgba(169,0,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 800, color: '#a900ff', flexShrink: 0 }}>
                    {(team.name || 'T')[0].toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontSize: 17, fontWeight: 700, color: textPrimary, letterSpacing: '-0.01em' }}>{team.name}</div>
                    {team.description && <div style={{ fontSize: 13, color: textMuted, marginTop: 3 }}>{team.description}</div>}
                    <div style={{ fontSize: 11, color: textDim, marginTop: 4, fontFamily: 'monospace' }}>{team.slug}</div>
                  </div>
                </div>
                <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 100, background: planBadgeBg, color: planColors[team.plan], border: `1px solid ${planColors[team.plan]}40`, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', flexShrink: 0 }}>
                  {team.plan}
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0, paddingTop: 18, borderTop: `1px solid ${divider}` }}>
                {[
                  { label: 'Members', value: team.member_count },
                  { label: 'Active', value: statusCounts['active'] ?? 0 },
                  { label: 'Invited', value: statusCounts['invited'] ?? 0 },
                  { label: 'Your role', value: ROLE_LABELS[currentRole] },
                ].map((stat, i) => (
                  <div key={i} style={{ paddingLeft: i > 0 ? 20 : 0, borderLeft: i > 0 ? `1px solid ${divider}` : 'none' }}>
                    <div style={{ fontSize: 20, fontWeight: 700, color: textPrimary, letterSpacing: '-0.02em' }}>{stat.value}</div>
                    <div style={{ fontSize: 11, color: textMuted, marginTop: 2 }}>{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 14, padding: '40px', textAlign: 'center' }}>
              <i className="bx bx-group" style={{ fontSize: 36, color: textDim, display: 'block', marginBottom: 12 }} />
              <div style={{ fontSize: 14, color: textMuted }}>
                {loading ? 'Loading team…' : 'No team found.'}
              </div>
            </div>
          )}

          {/* Recent members preview */}
          {members.length > 0 && (
            <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 14, overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: `1px solid ${cardBorder}` }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: textPrimary }}>Recent Members</div>
                <button onClick={() => setTab('members')} style={{ fontSize: 12, color: '#00e5ff', background: 'none', border: 'none', cursor: 'pointer' }}>View all</button>
              </div>
              {members.slice(0, 5).map((m, idx) => {
                const c = ROLE_COLORS[m.role]
                return (
                  <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 20px', borderBottom: idx < Math.min(members.length, 5) - 1 ? `1px solid ${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.05)'}` : 'none' }}>
                    <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(0,229,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#00e5ff', flexShrink: 0 }}>
                      {m.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: textPrimary }}>{m.name}</div>
                      <div style={{ fontSize: 11, color: textMuted }}>{m.email}</div>
                    </div>
                    <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 100, background: c.bg, color: c.color, border: `1px solid ${c.border}`, fontWeight: 600 }}>
                      {ROLE_LABELS[m.role]}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* ── MEMBERS TAB ── */}
      {tab === 'members' && (
        <div>
          {/* Invite toggle */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ fontSize: 13, color: textMuted }}>{members.length} member{members.length !== 1 ? 's' : ''}</div>
            {can('canInviteMembers') && (
              <button
                onClick={() => setShowInvite(v => !v)}
                style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 16px', borderRadius: 9, border: 'none', background: 'linear-gradient(135deg, #00e5ff, #a900ff)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
              >
                <i className="bx bx-plus" style={{ fontSize: 16 }} /> Invite member
              </button>
            )}
          </div>

          {/* Invite panel */}
          {showInvite && (
            <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 12, padding: '18px 20px', marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: textPrimary, marginBottom: 14 }}>Invite a new member</div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <input
                  value={inviteEmail} onChange={e => setInviteEmail(e.target.value)}
                  placeholder="Email address" type="email"
                  onKeyDown={e => e.key === 'Enter' && handleInvite()}
                  style={{ flex: '1 1 260px', padding: '8px 12px', borderRadius: 9, border: `1px solid ${searchBorder}`, background: inputBg, color: textPrimary, fontSize: 13, outline: 'none' }}
                />
                <select value={inviteRole} onChange={e => setInviteRole(e.target.value as Role)}
                  style={{ padding: '8px 12px', borderRadius: 8, border: `1px solid ${selectBorder}`, background: selectBg, color: textPrimary, fontSize: 12, outline: 'none', cursor: 'pointer' }}>
                  {(['user', 'team_manager', 'team_owner'] as Role[]).map(r => (
                    <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                  ))}
                </select>
                <button onClick={handleInvite} disabled={inviteLoading || !inviteEmail.trim()}
                  style={{ padding: '8px 18px', borderRadius: 9, border: 'none', background: '#00e5ff', color: '#000', fontSize: 13, fontWeight: 600, cursor: inviteEmail.trim() ? 'pointer' : 'not-allowed', opacity: inviteEmail.trim() ? 1 : 0.5 }}>
                  {inviteLoading ? 'Sending…' : 'Send invite'}
                </button>
              </div>
              {inviteSent && (
                <div style={{ marginTop: 10, fontSize: 12, color: '#22c55e', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <i className="bx bx-check-circle" /> Invitation sent!
                </div>
              )}
            </div>
          )}

          {/* Search */}
          <div style={{ position: 'relative', maxWidth: 340, marginBottom: 16 }}>
            <i className="bx bx-search" style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', fontSize: 14, color: textDim, pointerEvents: 'none' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search members…"
              style={{ width: '100%', padding: '8px 12px 8px 32px', borderRadius: 9, border: `1px solid ${searchBorder}`, background: searchBg, color: textPrimary, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
          </div>

          {/* Members table */}
          <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 14, overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr 100px', padding: '11px 20px', borderBottom: `1px solid ${cardBorder}`, fontSize: 11, fontWeight: 600, color: textDim, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              <div>Member</div><div>Email</div><div>Role</div><div>Status</div>
              <div style={{ textAlign: 'right' }}>Actions</div>
            </div>
            {loading && members.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: textDim, fontSize: 13 }}>Loading members…</div>
            ) : filteredMembers.length === 0 ? (
              <div style={{ padding: '48px 40px', textAlign: 'center' }}>
                <i className="bx bx-group" style={{ fontSize: 36, color: textDim, display: 'block', marginBottom: 10 }} />
                <div style={{ fontSize: 14, color: textMuted }}>No members found</div>
              </div>
            ) : filteredMembers.map((m, idx) => (
              <div key={m.id} style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr 100px', padding: '13px 20px', borderBottom: idx < filteredMembers.length - 1 ? `1px solid ${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.05)'}` : 'none', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(0,229,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#00e5ff', flexShrink: 0 }}>
                    {m.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: textPrimary }}>{m.name}</div>
                </div>
                <div style={{ fontSize: 12, color: textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.email}</div>
                <div>
                  {editingId === m.id && can('canChangeRoles') ? (
                    <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                      <select value={editRole} onChange={e => setEditRole(e.target.value as Role)}
                        style={{ padding: '4px 8px', borderRadius: 6, border: `1px solid ${selectBorder}`, background: selectBg, color: textPrimary, fontSize: 11, outline: 'none', cursor: 'pointer' }}>
                        {(['user', 'team_manager', 'team_owner'] as Role[]).map(r => (
                          <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                        ))}
                      </select>
                      <button onClick={() => handleRoleUpdate(m.id)} style={{ padding: '3px 8px', borderRadius: 5, border: 'none', background: '#22c55e', color: '#fff', fontSize: 11, cursor: 'pointer' }}>✓</button>
                      <button onClick={() => setEditingId(null)} style={{ padding: '3px 6px', borderRadius: 5, border: 'none', background: 'transparent', color: textMuted, fontSize: 14, cursor: 'pointer' }}>✕</button>
                    </div>
                  ) : <RoleBadge role={m.role} />}
                </div>
                <div><StatusDot status={m.status} /></div>
                <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                  {can('canChangeRoles') && editingId !== m.id && (
                    <button onClick={() => { setEditingId(m.id); setEditRole(m.role) }} title="Change role"
                      style={{ width: 28, height: 28, borderRadius: 6, border: `1px solid ${cardBorder}`, background: 'transparent', color: textMuted, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <i className="bx bx-edit-alt" />
                    </button>
                  )}
                  {can('canRemoveMembers') && (
                    confirmRemove === m.id ? (
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button onClick={() => handleRemove(m.id)} style={{ padding: '3px 8px', borderRadius: 5, border: 'none', background: '#ef4444', color: '#fff', fontSize: 11, cursor: 'pointer' }}>Remove</button>
                        <button onClick={() => setConfirmRemove(null)} style={{ padding: '3px 6px', borderRadius: 5, border: 'none', background: 'transparent', color: textMuted, fontSize: 14, cursor: 'pointer' }}>✕</button>
                      </div>
                    ) : (
                      <button onClick={() => setConfirmRemove(m.id)} title="Remove member"
                        style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.08)', color: '#ef4444', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <i className="bx bx-user-minus" />
                      </button>
                    )
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── SETTINGS TAB ── */}
      {tab === 'settings' && can('canManageTeam') && (
        <div style={{ maxWidth: 580 }}>
          {/* General */}
          <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 14, padding: '22px 24px', marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: textPrimary, marginBottom: 18, paddingBottom: 14, borderBottom: `1px solid ${divider}` }}>General</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: labelColor, marginBottom: 6, display: 'block', letterSpacing: '0.02em' }}>Team Name</label>
                <input style={inputSt} value={teamName} onChange={e => setTeamName(e.target.value)} placeholder="Your team name" />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: labelColor, marginBottom: 6, display: 'block', letterSpacing: '0.02em' }}>Description</label>
                <textarea style={{ ...inputSt, minHeight: 80, resize: 'vertical' as const, fontFamily: 'inherit', lineHeight: 1.5 }}
                  value={teamDesc} onChange={e => setTeamDesc(e.target.value)} placeholder="What does your team work on?" />
              </div>
              {team && (
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: labelColor, marginBottom: 6, display: 'block', letterSpacing: '0.02em' }}>Slug</label>
                  <input style={{ ...inputSt, opacity: 0.6, cursor: 'not-allowed', fontFamily: 'monospace', letterSpacing: '0.03em' }} value={team.slug} readOnly />
                  <div style={{ fontSize: 11, color: textDim, marginTop: 5 }}>Slugs cannot be changed after creation</div>
                </div>
              )}
            </div>
            <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
              <button onClick={handleSaveSettings} disabled={loading}
                style={{ padding: '8px 20px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, #00e5ff, #a900ff)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1 }}>
                {loading ? 'Saving…' : 'Save changes'}
              </button>
              {saved && (
                <span style={{ fontSize: 12, color: '#22c55e', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <i className="bx bx-check-circle" /> Saved
                </span>
              )}
            </div>
          </div>

          {/* Plan info */}
          {team && (
            <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 14, padding: '22px 24px', marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: textPrimary, marginBottom: 16, paddingBottom: 14, borderBottom: `1px solid ${divider}` }}>Plan & Billing</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: textPrimary, marginBottom: 3, display: 'flex', alignItems: 'center', gap: 8 }}>
                    Current plan
                    <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 100, background: `${planColors[team.plan]}15`, color: planColors[team.plan], border: `1px solid ${planColors[team.plan]}30`, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' as const }}>
                      {team.plan}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: textDim }}>{team.member_count} member{team.member_count !== 1 ? 's' : ''} · ID: {team.id.slice(0, 8)}</div>
                </div>
              </div>
            </div>
          )}

          {/* Danger zone */}
          {can('canDeleteTeam') && (
            <div style={{ background: cardBg, border: '1px solid rgba(239,68,68,0.2)', borderRadius: 14, padding: '22px 24px' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#ef4444', marginBottom: 16, paddingBottom: 14, borderBottom: '1px solid rgba(239,68,68,0.12)' }}>Danger Zone</div>
              {!showDeleteConfirm ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: textPrimary, marginBottom: 3 }}>Delete Team</div>
                    <div style={{ fontSize: 12, color: textDim }}>Permanently delete this team and all its data.</div>
                  </div>
                  <button onClick={() => setShowDeleteConfirm(true)} style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.08)', color: '#ef4444', fontSize: 13, fontWeight: 500, cursor: 'pointer', flexShrink: 0 }}>
                    Delete team
                  </button>
                </div>
              ) : (
                <div>
                  <div style={{ fontSize: 13, color: '#ef4444', fontWeight: 500, marginBottom: 8 }}>
                    This action cannot be undone. All team data and memberships will be permanently deleted.
                  </div>
                  <div style={{ fontSize: 12, color: textMuted, marginBottom: 12 }}>
                    Type <strong style={{ color: textPrimary, fontFamily: 'monospace' }}>{team?.name}</strong> to confirm:
                  </div>
                  <input
                    value={deleteConfirmText}
                    onChange={e => setDeleteConfirmText(e.target.value)}
                    placeholder={team?.name ?? 'team name'}
                    style={{ ...inputSt, borderColor: 'rgba(239,68,68,0.3)', marginBottom: 14, maxWidth: 340 }}
                  />
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button
                      onClick={handleDeleteTeam}
                      disabled={deleteConfirmText !== team?.name || deleting}
                      style={{
                        padding: '8px 18px', borderRadius: 8, border: 'none',
                        background: deleteConfirmText === team?.name ? '#ef4444' : 'rgba(239,68,68,0.2)',
                        color: '#fff', fontSize: 13, fontWeight: 600,
                        cursor: deleteConfirmText === team?.name && !deleting ? 'pointer' : 'not-allowed',
                        opacity: deleteConfirmText === team?.name ? 1 : 0.5,
                      }}
                    >
                      {deleting ? 'Deleting...' : 'Permanently delete team'}
                    </button>
                    <button
                      onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmText('') }}
                      style={{ padding: '8px 14px', borderRadius: 8, border: `1px solid ${cardBorder}`, background: 'transparent', color: textMuted, fontSize: 13, cursor: 'pointer' }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
