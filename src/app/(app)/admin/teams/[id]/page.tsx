'use client'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { useRoleStore, ROLE_LABELS } from '@/store/roles'
import { apiFetch } from '@/lib/api'
import { ConfirmDialog } from '@/components/ConfirmDialog'

interface TeamDetail {
  id: string; name: string; slug: string; plan: string; avatar_url?: string; created_at: string
}
interface Member {
  id: string; user_id: number; name: string; email: string; avatar_url?: string; role: string; joined_at: string
}

type Tab = 'details' | 'members'

const ROLE_OPTIONS = ['owner', 'admin', 'member', 'viewer'] as const
const PLAN_OPTIONS = ['free', 'pro', 'enterprise'] as const

function fmtDate(s: string) {
  return new Date(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function initials(name?: string | null) {
  if (!name) return '?'
  return name.split(' ').map(w => w[0]).filter(Boolean).join('').slice(0, 2).toUpperCase()
}

const planColors: Record<string, string> = { free: '#6b7280', pro: '#00e5ff', enterprise: '#a900ff' }
const roleColors: Record<string, string> = { owner: '#ef4444', admin: '#f97316', member: '#22c55e', viewer: '#6b7280' }

const badgeSt: React.CSSProperties = { fontSize: 10, padding: '2px 8px', borderRadius: 100, fontWeight: 600, letterSpacing: '0.02em', whiteSpace: 'nowrap', display: 'inline-block' }

export default function AdminTeamDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const { can, roleLoaded } = useRoleStore()

  const textPrimary = 'var(--color-fg)'
  const textMuted = 'var(--color-fg-muted)'
  const textDim = 'var(--color-fg-dim)'
  const cardBg = 'var(--color-bg-alt)'
  const cardBorder = 'var(--color-border)'

  const [team, setTeam] = useState<TeamDetail | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [memberCount, setMemberCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('details')
  const [editName, setEditName] = useState('')
  const [editPlan, setEditPlan] = useState('')
  const [saving, setSaving] = useState(false)
  const [roleModal, setRoleModal] = useState<{ userId: number; name: string; role: string } | null>(null)
  const [newRole, setNewRole] = useState('')
  const [confirmDialog, setConfirmDialog] = useState<{ title: string; message: string; confirmLabel: string; variant: 'danger' | 'warning' | 'default'; onConfirm: () => void } | null>(null)

  useEffect(() => {
    if (!roleLoaded) return
    if (!can('canViewAdmin')) { router.replace('/dashboard'); return }
    setLoading(true)
    apiFetch<{ team: TeamDetail; members: Member[]; member_count: number }>(`/api/admin/teams/${id}`)
      .then(r => {
        if (r?.team) {
          setTeam(r.team)
          setEditName(r.team.name)
          setEditPlan(r.team.plan)
        }
        setMembers(Array.isArray(r?.members) ? r.members : [])
        setMemberCount(r?.member_count ?? 0)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [roleLoaded, id])

  async function saveTeam() {
    if (!editName.trim()) return
    setSaving(true)
    try {
      await apiFetch(`/api/admin/teams/${id}`, { method: 'PATCH', body: JSON.stringify({ name: editName, plan: editPlan }) })
      setTeam(prev => prev ? { ...prev, name: editName, plan: editPlan } : prev)
    } catch { /* handled silently */ }
    setSaving(false)
  }

  function deleteTeam() {
    if (!team) return
    setConfirmDialog({
      title: 'Delete Team',
      message: `Delete "${team.name}"? This will remove all members and cannot be undone.`,
      confirmLabel: 'Delete',
      variant: 'danger',
      onConfirm: async () => {
        setConfirmDialog(null)
        setSaving(true)
        try {
          await apiFetch(`/api/admin/teams/${id}`, { method: 'DELETE' })
          router.replace('/admin/teams')
        } catch { /* handled silently */ }
        setSaving(false)
      },
    })
  }

  function removeMember(userId: number, name: string) {
    setConfirmDialog({
      title: 'Remove Member',
      message: `Remove ${name} from this team?`,
      confirmLabel: 'Remove',
      variant: 'danger',
      onConfirm: async () => {
        setConfirmDialog(null)
        try {
          await apiFetch(`/api/admin/teams/${id}/members/${userId}`, { method: 'DELETE' })
          setMembers(prev => prev.filter(m => m.user_id !== userId))
          setMemberCount(prev => prev - 1)
        } catch { /* handled silently */ }
      },
    })
  }

  async function updateMemberRole() {
    if (!roleModal || !newRole) return
    setSaving(true)
    try {
      await apiFetch(`/api/admin/teams/${id}/members/${roleModal.userId}`, { method: 'PATCH', body: JSON.stringify({ role: newRole }) })
      setMembers(prev => prev.map(m => m.user_id === roleModal.userId ? { ...m, role: newRole } : m))
      setRoleModal(null)
    } catch { /* handled silently */ }
    setSaving(false)
  }

  const pc = planColors[team?.plan ?? 'free'] ?? '#6b7280'

  return (
    <div style={{ padding: '28px 32px', maxWidth: 900, margin: '0 auto', minHeight: '100vh' }}>
      <Link href="/admin/teams" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 13, color: textDim, textDecoration: 'none', marginBottom: 20 }}>
        <i className="bx bx-left-arrow-alt rtl-flip" /> Teams
      </Link>

      {loading && (
        <div style={{ textAlign: 'center', padding: '60px 0', fontSize: 13, color: textDim }}>Loading...</div>
      )}

      {!loading && team && (
        <>
          {/* Header */}
          <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 14, padding: 24, marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              {team.avatar_url ? (
                <img src={team.avatar_url} alt={team.name} style={{ width: 56, height: 56, borderRadius: 12, objectFit: 'cover' }} />
              ) : (
                <div style={{ width: 56, height: 56, borderRadius: 12, background: `${pc}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 800, color: pc }}>
                  {(team.name || 'T')[0].toUpperCase()}
                </div>
              )}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                  <span style={{ fontSize: 20, fontWeight: 700, color: textPrimary }}>{team.name}</span>
                  <span style={{ ...badgeSt, background: `${pc}18`, color: pc, border: `1px solid ${pc}30` }}>{team.plan}</span>
                </div>
                <div style={{ fontSize: 12, color: textMuted, fontFamily: 'monospace' }}>{team.slug}</div>
                <div style={{ fontSize: 11, color: textDim, marginTop: 4 }}>Created {fmtDate(team.created_at)} &middot; {memberCount} member{memberCount !== 1 ? 's' : ''}</div>
              </div>
              <button onClick={deleteTeam} disabled={saving} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.08)', color: '#ef4444', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }} title="Delete team">
                <i className="bx bx-trash" /> Delete
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 16, background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 12, padding: 4 }}>
            {(['details', 'members'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)} style={{ flex: 1, padding: '7px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: tab === t ? 600 : 400, color: tab === t ? textPrimary : textMuted, background: tab === t ? 'var(--color-border)' : 'transparent', transition: 'background 0.15s', textTransform: 'capitalize' }}>
                {t === 'details' ? 'Details' : `Members (${memberCount})`}
              </button>
            ))}
          </div>

          {/* Content */}
          <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 14, overflow: 'hidden' }}>

            {tab === 'details' && (
              <div style={{ padding: 24 }}>
                <div style={{ marginBottom: 20 }}>
                  <label style={{ fontSize: 12, color: textMuted, display: 'block', marginBottom: 6 }}>Team Name</label>
                  <input value={editName} onChange={e => setEditName(e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: `1px solid ${cardBorder}`, background: 'var(--color-bg)', color: textPrimary, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div style={{ marginBottom: 20 }}>
                  <label style={{ fontSize: 12, color: textMuted, display: 'block', marginBottom: 6 }}>Slug</label>
                  <input value={team.slug} disabled style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: `1px solid ${cardBorder}`, background: 'var(--color-bg-alt)', color: textDim, fontSize: 13, outline: 'none', boxSizing: 'border-box', cursor: 'not-allowed' }} />
                </div>
                <div style={{ marginBottom: 24 }}>
                  <label style={{ fontSize: 12, color: textMuted, display: 'block', marginBottom: 6 }}>Plan</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {PLAN_OPTIONS.map(p => {
                      const c = planColors[p]
                      return (
                        <button key={p} onClick={() => setEditPlan(p)} style={{ padding: '8px 16px', borderRadius: 8, border: `1px solid ${editPlan === p ? c : cardBorder}`, background: editPlan === p ? `${c}12` : 'transparent', color: editPlan === p ? c : textMuted, fontSize: 13, fontWeight: editPlan === p ? 600 : 400, cursor: 'pointer', textTransform: 'capitalize' }}>
                          {p}
                        </button>
                      )
                    })}
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button onClick={saveTeam} disabled={saving || (!editName.trim()) || (editName === team.name && editPlan === team.plan)} style={{ padding: '8px 20px', borderRadius: 8, border: 'none', background: '#00e5ff', color: '#000', fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: saving || (editName === team.name && editPlan === team.plan) ? 0.4 : 1 }}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            )}

            {tab === 'members' && (
              <>
                {members.length === 0 ? (
                  <div style={{ padding: '52px 0', textAlign: 'center' }}>
                    <i className="bx bx-group" style={{ fontSize: 36, color: textDim, display: 'block', marginBottom: 10 }} />
                    <div style={{ fontSize: 13, color: textMuted }}>No members</div>
                  </div>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: `1px solid ${cardBorder}` }}>
                        <th style={{ fontSize: 11, fontWeight: 600, color: textDim, letterSpacing: '0.04em', textTransform: 'uppercase', padding: '10px 16px', textAlign: 'start' }}>Member</th>
                        <th style={{ fontSize: 11, fontWeight: 600, color: textDim, letterSpacing: '0.04em', textTransform: 'uppercase', padding: '10px 16px', textAlign: 'start' }}>Email</th>
                        <th style={{ fontSize: 11, fontWeight: 600, color: textDim, letterSpacing: '0.04em', textTransform: 'uppercase', padding: '10px 16px', textAlign: 'start' }}>Role</th>
                        <th style={{ fontSize: 11, fontWeight: 600, color: textDim, letterSpacing: '0.04em', textTransform: 'uppercase', padding: '10px 16px', textAlign: 'start' }}>Joined</th>
                        <th style={{ fontSize: 11, fontWeight: 600, color: textDim, letterSpacing: '0.04em', textTransform: 'uppercase', padding: '10px 16px', textAlign: 'end' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {members.map((m, i) => {
                        const rc = roleColors[m.role] ?? '#6b7280'
                        return (
                          <tr key={m.user_id} style={{ borderBottom: i < members.length - 1 ? `1px solid var(--color-bg-alt)` : 'none' }}
                            onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-bg-alt)')}
                            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                            <td style={{ padding: '11px 16px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                {m.avatar_url ? (
                                  <img src={m.avatar_url} alt={m.name} style={{ width: 30, height: 30, borderRadius: '50%', objectFit: 'cover' }} />
                                ) : (
                                  <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(0,229,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#00e5ff' }}>{initials(m.name)}</div>
                                )}
                                <Link href={`/admin/users/${m.user_id}`} style={{ fontSize: 13, fontWeight: 500, color: textPrimary, textDecoration: 'none' }}>{m.name || 'Unnamed'}</Link>
                              </div>
                            </td>
                            <td style={{ padding: '11px 16px', fontSize: 12, color: textMuted }}>{m.email}</td>
                            <td style={{ padding: '11px 16px' }}>
                              <span style={{ ...badgeSt, background: `${rc}18`, color: rc, border: `1px solid ${rc}30` }}>{m.role}</span>
                            </td>
                            <td style={{ padding: '11px 16px', fontSize: 12, color: textMuted }}>{fmtDate(m.joined_at)}</td>
                            <td style={{ padding: '11px 16px', textAlign: 'end' }}>
                              <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                                <button onClick={() => { setRoleModal({ userId: m.user_id, name: m.name, role: m.role }); setNewRole(m.role) }} style={{ width: 28, height: 28, borderRadius: 6, border: `1px solid ${cardBorder}`, background: 'transparent', color: textMuted, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Change role">
                                  <i className="bx bx-shield" />
                                </button>
                                <button onClick={() => removeMember(m.user_id, m.name)} style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid rgba(239,68,68,0.25)', background: 'rgba(239,68,68,0.06)', color: '#ef4444', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Remove member">
                                  <i className="bx bx-user-minus" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                )}
              </>
            )}
          </div>
        </>
      )}

      {/* Role change modal */}
      {roleModal && (
        <>
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100 }} onClick={() => !saving && setRoleModal(null)} />
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'var(--color-bg)', border: `1px solid ${cardBorder}`, borderRadius: 14, padding: 24, width: 380, maxWidth: '90vw', zIndex: 101, boxShadow: '0 16px 48px rgba(0,0,0,0.4)' }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: textPrimary, marginBottom: 4 }}>Change Role</div>
            <div style={{ fontSize: 13, color: textMuted, marginBottom: 16 }}>Update role for <strong>{roleModal.name}</strong></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {ROLE_OPTIONS.map(r => {
                const c = roleColors[r]
                return (
                  <label key={r} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 8, border: `1px solid ${newRole === r ? c : cardBorder}`, background: newRole === r ? `${c}12` : 'transparent', cursor: 'pointer' }}>
                    <input type="radio" name="member_role" checked={newRole === r} onChange={() => setNewRole(r)} style={{ accentColor: c }} />
                    <span style={{ fontSize: 13, color: textPrimary, fontWeight: newRole === r ? 600 : 400, textTransform: 'capitalize' }}>{r}</span>
                  </label>
                )
              })}
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 20 }}>
              <button onClick={() => setRoleModal(null)} disabled={saving} style={{ padding: '8px 16px', borderRadius: 8, border: `1px solid ${cardBorder}`, background: 'transparent', color: textMuted, fontSize: 13, cursor: 'pointer' }}>Cancel</button>
              <button onClick={updateMemberRole} disabled={saving || newRole === roleModal.role} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: '#00e5ff', color: '#000', fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: saving || newRole === roleModal.role ? 0.4 : 1 }}>{saving ? 'Saving...' : 'Update'}</button>
            </div>
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
