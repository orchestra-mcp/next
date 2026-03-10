'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useRoleStore, ROLE_LABELS, ROLE_COLORS, type Role } from '@/store/roles'
import { useTranslations } from 'next-intl'

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

export default function TeamMembersPage() {
  const router = useRouter()
  const { can, roleLoaded, team, members, fetchMembers, inviteMember, updateMemberRole, removeMember, loading, error, clearError } = useRoleStore()
  const t = useTranslations('app')

  const [search, setSearch] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editRole, setEditRole] = useState<Role>('user')
  const [confirmRemove, setConfirmRemove] = useState<number | null>(null)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<Role>('user')
  const [inviteLoading, setInviteLoading] = useState(false)
  const [inviteSent, setInviteSent] = useState(false)
  const [showInvite, setShowInvite] = useState(false)

  useEffect(() => {
    if (!roleLoaded) return
    if (!team && !can('canInviteMembers') && !can('canManageTeam')) { router.replace('/dashboard'); return }
    if (members.length === 0) fetchMembers()
  }, [roleLoaded])

  const textPrimary = 'var(--color-fg)'
  const textMuted = 'var(--color-fg-muted)'
  const textDim = 'var(--color-fg-dim)'
  const cardBg = 'var(--color-bg-alt)'
  const cardBorder = 'var(--color-border)'
  const searchBg = 'var(--color-bg-alt)'
  const searchBorder = 'var(--color-border)'
  const selectBg = 'var(--color-bg-contrast)'
  const selectBorder = 'var(--color-border)'
  const inputBg = 'var(--color-bg-alt)'

  const filtered = members.filter(m => {
    const q = search.toLowerCase()
    return !q || m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q)
  })

  const handleRoleUpdate = async (id: number) => {
    try {
      await updateMemberRole(id, editRole)
      setEditingId(null)
    } catch {}
  }

  const handleRemove = async (id: number) => {
    try {
      await removeMember(id)
      setConfirmRemove(null)
    } catch {}
  }

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return
    setInviteLoading(true)
    try {
      await inviteMember(inviteEmail.trim(), inviteRole)
      setInviteSent(true)
      setInviteEmail('')
      setTimeout(() => { setInviteSent(false); setShowInvite(false) }, 2500)
    } catch {} finally {
      setInviteLoading(false)
    }
  }

  return (
    <div className="page-wrapper" style={{ padding: '28px 32px' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Link href="/team" style={{ fontSize: 13, color: textDim, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 5, marginBottom: 14 }}>
          <i className="bx bx-left-arrow-alt rtl-flip" /> {t('team')}
        </Link>
        <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: textPrimary, margin: 0, letterSpacing: '-0.02em' }}>{t('members')}</h1>
            <p style={{ fontSize: 13, color: textMuted, marginTop: 5 }}>{members.length} team members</p>
          </div>
          {can('canInviteMembers') && (
            <button onClick={() => setShowInvite(v => !v)}
              style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 16px', borderRadius: 9, border: 'none', background: 'linear-gradient(135deg, #00e5ff, #a900ff)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              <i className="bx bx-plus" style={{ fontSize: 16 }} /> {t('inviteMember')}
            </button>
          )}
        </div>
      </div>

      {/* Invite panel */}
      {showInvite && (
        <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 12, padding: '18px 20px', marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: textPrimary, marginBottom: 14 }}>{t('inviteNewMember')}</div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <input
              value={inviteEmail} onChange={e => setInviteEmail(e.target.value)}
              placeholder={t('emailAddress')}
              type="email"
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
      <div className="search-wrapper" style={{ position: 'relative', maxWidth: 340, marginBottom: 20 }}>
        <i className="bx bx-search" style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', fontSize: 14, color: textDim, pointerEvents: 'none' }} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t('searchMembers')}
          style={{ width: '100%', padding: '8px 12px 8px 32px', borderRadius: 9, border: `1px solid ${searchBorder}`, background: searchBg, color: textPrimary, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
      </div>

      {error && (
        <div style={{ marginBottom: 16, padding: '10px 14px', borderRadius: 8, fontSize: 13, background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>
          {error}
          <button onClick={clearError} style={{ marginInlineStart: 8, background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 12 }}>✕</button>
        </div>
      )}

      {/* Table */}
      <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 14, overflow: 'hidden' }}>
        <div className="grid-admin-users" style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr 100px', padding: '11px 20px', borderBottom: `1px solid ${cardBorder}`, fontSize: 11, fontWeight: 600, color: textDim, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
          <div>{t('member')}</div>
          <div className="hide-mobile">{t('email')}</div>
          <div>{t('role')}</div>
          <div className="hide-mobile">{t('status')}</div>
          <div style={{ textAlign: 'end' }}>{t('actions')}</div>
        </div>

        {loading && members.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: textDim, fontSize: 13 }}>{t('loadingMembers')}</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '48px 40px', textAlign: 'center' }}>
            <i className="bx bx-group" style={{ fontSize: 36, color: textDim, display: 'block', marginBottom: 10 }} />
            <div style={{ fontSize: 14, color: textMuted }}>{t('noMembersFound')}</div>
          </div>
        ) : (
          filtered.map((m, idx) => (
            <div key={m.id}>
              <div className="grid-admin-users" style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr 100px', padding: '13px 20px', borderBottom: idx < filtered.length - 1 ? `1px solid var(--color-bg-alt)` : 'none', alignItems: 'center' }}>
                {/* Name */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(0,229,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#00e5ff', flexShrink: 0 }}>
                    {m.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: textPrimary }}>{m.name}</div>
                </div>
                {/* Email */}
                <div className="hide-mobile" style={{ fontSize: 12, color: textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.email}</div>
                {/* Role */}
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
                  ) : (
                    <RoleBadge role={m.role} />
                  )}
                </div>
                {/* Status */}
                <div className="hide-mobile"><StatusDot status={m.status} /></div>
                {/* Actions */}
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
            </div>
          ))
        )}
      </div>
    </div>
  )
}
