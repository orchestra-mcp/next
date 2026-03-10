'use client'
import { useEffect, useState, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useRoleStore, ROLE_LABELS, ROLE_COLORS, type Role } from '@/store/roles'
import { useTranslations } from 'next-intl'
import { SettingGroupShell } from '@orchestra-mcp/settings'
import type { SettingGroupType } from '@orchestra-mcp/settings'
import '../../../../packages/@orchestra-mcp/settings/src/SettingsForm/SettingsForm.css'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { apiFetch, isDevSeed } from '@/lib/api'
import Link from 'next/link'

type Tab = 'overview' | 'members' | 'settings' | 'billing' | 'danger'

function SettingsCard({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  const group: SettingGroupType = { id: title, label: title, description: desc, order: 0 }
  return <SettingGroupShell group={group}>{children}</SettingGroupShell>
}

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
  const t = useTranslations('app')
  const router = useRouter()

  const searchParams = useSearchParams()
  const tab = (searchParams.get('tab') as Tab) || 'overview'

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

  // Avatar state
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [teamAvatarPreview, setTeamAvatarPreview] = useState<string | null>(null)

  useEffect(() => {
    if (!roleLoaded) return
    if (!team) fetchTeam()
    if (members.length === 0) fetchMembers()
  }, [roleLoaded])

  useEffect(() => {
    if (team) { setTeamName(team.name); setTeamDesc(team.description ?? '') }
  }, [team])

  const textPrimary = 'var(--color-fg)'
  const textMuted = 'var(--color-fg-muted)'
  const textDim = 'var(--color-fg-dim)'
  const cardBg = 'var(--color-bg-alt)'
  const cardBorder = 'var(--color-border)'
  const divider = 'var(--color-border)'
  const inputBg = 'var(--color-bg-alt)'
  const inputBorder = 'var(--color-border)'
  const searchBg = 'var(--color-bg-alt)'
  const searchBorder = 'var(--color-border)'
  const selectBg = 'var(--color-bg-contrast)'
  const selectBorder = 'var(--color-border)'
  const labelColor = 'var(--color-fg-muted)'

  const planColors: Record<string, string> = {
    free: 'var(--color-fg-muted)',
    pro: '#00e5ff',
    enterprise: '#a900ff',
  }

  const inputSt: React.CSSProperties = {
    width: '100%', padding: '9px 12px', borderRadius: 9, border: `1px solid ${inputBorder}`,
    background: inputBg, color: textPrimary, fontSize: 13, outline: 'none', boxSizing: 'border-box',
  }
  const labelSt: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: labelColor, marginBottom: 6, display: 'block', letterSpacing: '0.02em' }
  const saveBtnSt: React.CSSProperties = { padding: '8px 20px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, #00e5ff, #a900ff)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }

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

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    // Show preview immediately
    const reader = new FileReader()
    reader.onload = () => setTeamAvatarPreview(reader.result as string)
    reader.readAsDataURL(file)
    // Upload
    setAvatarUploading(true)
    try {
      const formData = new FormData()
      formData.append('avatar', file)
      const avatarUrl = team?.id ? `/api/team/avatar?team_id=${team.id}` : '/api/team/avatar'
      const res = await apiFetch<{ ok: boolean; avatar_url: string }>(avatarUrl, { method: 'POST', body: formData })
      if (res.avatar_url) {
        setTeamAvatarPreview(res.avatar_url)
        fetchTeam()
      }
    } catch {}
    finally { setAvatarUploading(false) }
  }

  const teamInitial = (team?.name || 'T')[0].toUpperCase()

  return (
    <div className="settings-content page-wrapper" style={{ padding: '32px 48px' }}>

      {error && (
        <div style={{ marginBottom: 16, padding: '10px 14px', borderRadius: 8, fontSize: 13, background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>
          {error}
          <button onClick={clearError} style={{ marginInlineStart: 8, background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 12 }}>✕</button>
        </div>
      )}

      {/* ── OVERVIEW TAB ── */}
      {tab === 'overview' && (
        <>
          <SettingsCard title={t('team')} desc={t('manageTeamDesc')}>
            {team ? (
              <>
                {/* Team info row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                  <div style={{ position: 'relative' }}>
                    <Avatar style={{ width: 64, height: 64, opacity: avatarUploading ? 0.5 : 1, transition: 'opacity 0.2s' }}>
                      {(teamAvatarPreview || team.avatar_url) ? (
                        <AvatarImage src={teamAvatarPreview || team.avatar_url!} alt={teamInitial} />
                      ) : null}
                      <AvatarFallback style={{ fontSize: 24, fontWeight: 800, background: 'rgba(169,0,255,0.1)', color: '#a900ff', border: '1px solid rgba(169,0,255,0.2)' }}>
                        {teamInitial}
                      </AvatarFallback>
                    </Avatar>
                    <input ref={avatarInputRef} type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: 'none' }} />
                    <div onClick={() => avatarInputRef.current?.click()} style={{ position: 'absolute', bottom: 0, right: 0, width: 22, height: 22, borderRadius: '50%', background: 'var(--color-bg-alt)', border: `2px solid ${cardBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                      <i className="bx bx-camera" style={{ fontSize: 11, color: textMuted }} />
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 17, fontWeight: 700, color: textPrimary, letterSpacing: '-0.01em', display: 'flex', alignItems: 'center', gap: 10 }}>
                      {team.name}
                      <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 100, background: `${planColors[team.plan]}15`, color: planColors[team.plan], border: `1px solid ${planColors[team.plan]}40`, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                        {team.plan}
                      </span>
                    </div>
                    {team.description && <div style={{ fontSize: 13, color: textMuted, marginTop: 3 }}>{team.description}</div>}
                    <div style={{ fontSize: 11, color: textDim, marginTop: 4, fontFamily: 'monospace' }}>{team.slug}</div>
                  </div>
                </div>

                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0, paddingTop: 18, borderTop: `1px solid ${divider}` }}>
                  {[
                    { label: t('members'), value: team.member_count },
                    { label: t('active'), value: statusCounts['active'] ?? 0 },
                    { label: t('invited'), value: statusCounts['invited'] ?? 0 },
                    { label: t('yourRole'), value: ROLE_LABELS[currentRole] },
                  ].map((stat, i) => (
                    <div key={i} style={{ paddingInlineStart: i > 0 ? 20 : 0, borderInlineStart: i > 0 ? `1px solid ${divider}` : 'none' }}>
                      <div style={{ fontSize: 20, fontWeight: 700, color: textPrimary, letterSpacing: '-0.02em' }}>{stat.value}</div>
                      <div style={{ fontSize: 11, color: textMuted, marginTop: 2 }}>{stat.label}</div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div style={{ padding: '24px', textAlign: 'center' }}>
                <i className="bx bx-group" style={{ fontSize: 36, color: textDim, display: 'block', marginBottom: 12 }} />
                <div style={{ fontSize: 14, color: textMuted }}>
                  {loading ? t('loadingTeam') : t('noTeamFound')}
                </div>
              </div>
            )}
          </SettingsCard>

          {/* Recent members */}
          {members.length > 0 && (
            <SettingsCard title={t('recentMembers')}>
              {members.slice(0, 5).map((m, idx) => {
                const c = ROLE_COLORS[m.role]
                return (
                  <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 0', borderBottom: idx < Math.min(members.length, 5) - 1 ? `1px solid var(--color-bg-alt)` : 'none' }}>
                    {m.avatar_url ? (
                      <img src={m.avatar_url} alt={m.name} style={{ width: 30, height: 30, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                    ) : (
                      <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(0,229,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#00e5ff', flexShrink: 0 }}>
                        {m.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                    )}
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
              <div style={{ paddingTop: 12 }}>
                <Link href="/team?tab=members" style={{ fontSize: 12, color: '#00e5ff', textDecoration: 'none' }}>{t('viewAll')} →</Link>
              </div>
            </SettingsCard>
          )}
        </>
      )}

      {/* ── MEMBERS TAB ── */}
      {tab === 'members' && (
        <>
          <SettingsCard title={t('members')} desc={`${members.length} ${t('members').toLowerCase()}`}>
            {/* Invite button */}
            {can('canInviteMembers') && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
                <button
                  onClick={() => setShowInvite(v => !v)}
                  style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 16px', borderRadius: 9, border: 'none', background: 'linear-gradient(135deg, #00e5ff, #a900ff)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                >
                  <i className="bx bx-plus" style={{ fontSize: 16 }} /> {t('inviteMember')}
                </button>
              </div>
            )}

            {/* Invite panel */}
            {showInvite && (
              <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 12, padding: '18px 20px', marginBottom: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: textPrimary, marginBottom: 14 }}>{t('inviteNewMember')}</div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <input
                    value={inviteEmail} onChange={e => setInviteEmail(e.target.value)}
                    placeholder={t('emailAddress')} type="email"
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
                    {inviteLoading ? t('sending') : t('sendInvite')}
                  </button>
                </div>
                {inviteSent && (
                  <div style={{ marginTop: 10, fontSize: 12, color: '#22c55e', display: 'flex', alignItems: 'center', gap: 5 }}>
                    <i className="bx bx-check-circle" /> {t('invitationSent')}
                  </div>
                )}
              </div>
            )}

            {/* Search */}
            <div style={{ position: 'relative', maxWidth: 340, marginBottom: 16 }}>
              <i className="bx bx-search" style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', fontSize: 14, color: textDim, pointerEvents: 'none' }} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t('searchMembers')}
                style={{ width: '100%', padding: '8px 12px 8px 32px', borderRadius: 9, border: `1px solid ${searchBorder}`, background: searchBg, color: textPrimary, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
            </div>

            {/* Members table */}
            <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 14, overflow: 'hidden' }}>
              <div className="grid-admin-users" style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr 100px', padding: '11px 20px', borderBottom: `1px solid ${cardBorder}`, fontSize: 11, fontWeight: 600, color: textDim, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                <div>{t('member')}</div><div className="hide-mobile">{t('email')}</div><div>{t('role')}</div><div className="hide-mobile">{t('status')}</div>
                <div style={{ textAlign: 'end' }}>{t('actions')}</div>
              </div>
              {loading && members.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', color: textDim, fontSize: 13 }}>{t('loadingMembers')}</div>
              ) : filteredMembers.length === 0 ? (
                <div style={{ padding: '48px 40px', textAlign: 'center' }}>
                  <i className="bx bx-group" style={{ fontSize: 36, color: textDim, display: 'block', marginBottom: 10 }} />
                  <div style={{ fontSize: 14, color: textMuted }}>{t('noMembersFound')}</div>
                </div>
              ) : filteredMembers.map((m, idx) => (
                <div key={m.id} className="grid-admin-users" style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr 100px', padding: '13px 20px', borderBottom: idx < filteredMembers.length - 1 ? `1px solid var(--color-bg-alt)` : 'none', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {m.avatar_url ? (
                      <img src={m.avatar_url} alt={m.name} style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                    ) : (
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(0,229,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#00e5ff', flexShrink: 0 }}>
                        {m.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div style={{ fontSize: 13, fontWeight: 500, color: textPrimary }}>{m.name}</div>
                  </div>
                  <div className="hide-mobile" style={{ fontSize: 12, color: textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.email}</div>
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
                  <div className="hide-mobile"><StatusDot status={m.status} /></div>
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
          </SettingsCard>
        </>
      )}

      {/* ── SETTINGS TAB ── */}
      {tab === 'settings' && can('canManageTeam') && (
        <>
          <SettingsCard title={t('general')} desc={t('manageTeamDesc')}>
            {/* Team avatar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
              <div style={{ position: 'relative' }}>
                <Avatar style={{ width: 64, height: 64, opacity: avatarUploading ? 0.5 : 1, transition: 'opacity 0.2s' }}>
                  {(teamAvatarPreview || team?.avatar_url) ? (
                    <AvatarImage src={teamAvatarPreview || team!.avatar_url!} alt={teamInitial} />
                  ) : null}
                  <AvatarFallback style={{ fontSize: 24, fontWeight: 800, background: 'rgba(169,0,255,0.1)', color: '#a900ff', border: '1px solid rgba(169,0,255,0.2)' }}>
                    {teamInitial}
                  </AvatarFallback>
                </Avatar>
                <input ref={avatarInputRef} type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: 'none' }} />
                <div onClick={() => avatarInputRef.current?.click()} style={{ position: 'absolute', bottom: 0, right: 0, width: 22, height: 22, borderRadius: '50%', background: 'var(--color-bg-alt)', border: `2px solid ${cardBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <i className="bx bx-camera" style={{ fontSize: 11, color: textMuted }} />
                </div>
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, color: textPrimary }}>{team?.name ?? t('team')}</div>
                <div style={{ fontSize: 13, color: textMuted, marginTop: 2 }}>{t('uploadHint')}</div>
              </div>
            </div>

            {/* Team name */}
            <div style={{ marginBottom: 16 }}>
              <label style={labelSt}>{t('teamName')}</label>
              <input style={inputSt} value={teamName} onChange={e => setTeamName(e.target.value)} placeholder={t('teamNamePlaceholder')} />
            </div>

            {/* Description */}
            <div style={{ marginBottom: 16 }}>
              <label style={labelSt}>{t('teamDescription')}</label>
              <textarea style={{ ...inputSt, minHeight: 80, resize: 'vertical' as const, fontFamily: 'inherit', lineHeight: 1.5 }}
                value={teamDesc} onChange={e => setTeamDesc(e.target.value)} placeholder={t('teamDescPlaceholder')} />
            </div>

            {/* Slug (read-only) */}
            {team && (
              <div style={{ marginBottom: 16 }}>
                <label style={labelSt}>{t('slug')}</label>
                <input style={{ ...inputSt, opacity: 0.6, cursor: 'not-allowed', fontFamily: 'monospace', letterSpacing: '0.03em' }} value={team.slug} readOnly />
                <div style={{ fontSize: 11, color: textDim, marginTop: 5 }}>{t('slugCannotChange')}</div>
              </div>
            )}

            {/* Save */}
            <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
              <button onClick={handleSaveSettings} disabled={loading} style={{ ...saveBtnSt, opacity: loading ? 0.6 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}>
                {loading ? t('loading') : t('save')}
              </button>
              {saved && (
                <span style={{ fontSize: 12, color: '#22c55e', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <i className="bx bx-check-circle" /> {t('save')}
                </span>
              )}
            </div>
          </SettingsCard>
        </>
      )}

      {/* ── BILLING TAB ── */}
      {tab === 'billing' && can('canManageTeam') && team && (
        <SettingsCard title={t('planBilling')} desc={`${team.member_count} member${team.member_count !== 1 ? 's' : ''}`}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: textPrimary, marginBottom: 3, display: 'flex', alignItems: 'center', gap: 8 }}>
                {t('currentPlan')}
                <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 100, background: `${planColors[team.plan]}15`, color: planColors[team.plan], border: `1px solid ${planColors[team.plan]}30`, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' as const }}>
                  {team.plan}
                </span>
              </div>
              <div style={{ fontSize: 12, color: textDim }}>{team.member_count} member{team.member_count !== 1 ? 's' : ''} · Team ID: {team.id.slice(0, 8)}</div>
            </div>
            {can('canManageBilling') && (
              <Link href="/billing" style={{ padding: '7px 14px', borderRadius: 8, border: `1px solid ${cardBorder}`, background: 'transparent', color: textPrimary, fontSize: 13, fontWeight: 500, cursor: 'pointer', textDecoration: 'none' }}>
                {t('manageBilling')}
              </Link>
            )}
          </div>
        </SettingsCard>
      )}

      {/* ── DANGER TAB ── */}
      {tab === 'danger' && can('canDeleteTeam') && (
        <SettingsCard title={t('dangerZone')}>
          {!showDeleteConfirm ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color: textPrimary, marginBottom: 3 }}>{t('deleteTeam')}</div>
                <div style={{ fontSize: 12, color: textDim }}>{t('deleteTeamDesc')}</div>
              </div>
              <button onClick={() => setShowDeleteConfirm(true)} style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.08)', color: '#ef4444', fontSize: 13, fontWeight: 500, cursor: 'pointer', flexShrink: 0 }}>
                {t('deleteTeamBtn')}
              </button>
            </div>
          ) : (
            <div>
              <div style={{ fontSize: 13, color: '#ef4444', fontWeight: 500, marginBottom: 8 }}>
                {t('deleteTeamWarning')}
              </div>
              <div style={{ fontSize: 12, color: textMuted, marginBottom: 12 }}>
                {t('typeToConfirm', { name: team?.name ?? '' })}
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
                  {deleting ? t('deleting') : t('permanentlyDelete')}
                </button>
                <button
                  onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmText('') }}
                  style={{ padding: '8px 14px', borderRadius: 8, border: `1px solid ${cardBorder}`, background: 'transparent', color: textMuted, fontSize: 13, cursor: 'pointer' }}
                >
                  {t('cancel')}
                </button>
              </div>
            </div>
          )}
        </SettingsCard>
      )}
    </div>
  )
}
