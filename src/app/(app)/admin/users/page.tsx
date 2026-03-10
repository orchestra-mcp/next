'use client'
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useRoleStore, type Role, ROLE_LABELS, ROLE_COLORS } from '@/store/roles'
import { useAuthStore } from '@/store/auth'
import { useAdminStore } from '@/store/admin'
import { apiFetch } from '@/lib/api'

function RoleBadge({ role }: { role: Role }) {
  const c = ROLE_COLORS[role]
  return <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 100, background: c.bg, color: c.color, border: `1px solid ${c.border}`, fontWeight: 600, letterSpacing: '0.02em', whiteSpace: 'nowrap' }}>{ROLE_LABELS[role]}</span>
}

function StatusDot({ status }: { status: string }) {
  const color = status === 'active' ? '#22c55e' : status === 'invited' ? '#f97316' : '#ef4444'
  return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, color }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: color, display: 'inline-block' }} />{status.charAt(0).toUpperCase() + status.slice(1)}</span>
}

type ModalType = 'password' | 'subscription' | 'otp' | 'teams' | 'notify' | 'impersonate' | 'role' | null

interface TargetUser { id: number; name: string; email: string; role: Role; status: string }

export default function AdminUsersPage() {
  const router = useRouter()
  const { can, roleLoaded, allUsers, fetchAllUsers, updateMemberRole, suspendUser, unsuspendUser, loading, error, clearError } = useRoleStore()
  const { startImpersonation } = useAuthStore()
  const { impersonateUser } = useAdminStore()
  const [search, setSearch] = useState('')
  const [filterRole, setFilterRole] = useState<Role | 'all'>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [modal, setModal] = useState<ModalType>(null)
  const [target, setTarget] = useState<TargetUser | null>(null)

  // Modal form states
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [subPlan, setSubPlan] = useState('free')
  const [subNotes, setSubNotes] = useState('')
  const [notifTitle, setNotifTitle] = useState('')
  const [notifMessage, setNotifMessage] = useState('')
  const [notifType, setNotifType] = useState('info')
  const [lastOtp, setLastOtp] = useState<{ code: string; expires_at: string } | null>(null)
  const [modalLoading, setModalLoading] = useState(false)
  const [modalMsg, setModalMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [editRole, setEditRole] = useState<Role>('user')

  useEffect(() => {
    if (!roleLoaded) return
    if (!can('canViewAdmin')) { router.replace('/dashboard'); return }
    if (allUsers.length === 0) fetchAllUsers()
  }, [roleLoaded])

  const textPrimary = 'var(--color-fg)'
  const textMuted = 'var(--color-fg-muted)'
  const textDim = 'var(--color-fg-dim)'
  const cardBg = 'var(--color-bg-alt)'
  const cardBorder = 'var(--color-border)'
  const searchBg = 'var(--color-bg-alt)'
  const searchBorder = 'var(--color-border)'
  const filterActiveBg = 'var(--color-border)'
  const filterInactiveBg = 'var(--color-bg-alt)'
  const selectBg = 'var(--color-bg-contrast)'
  const selectBorder = 'var(--color-border)'
  const overlayBg = 'rgba(0,0,0,0.5)'
  const modalBg = 'var(--color-bg-contrast)'
  const inputBg = 'var(--color-bg-alt)'
  const inputBorder = 'var(--color-border)'
  const labelColor = 'var(--color-fg-muted)'
  const inputSt: React.CSSProperties = { width: '100%', padding: '9px 12px', borderRadius: 9, border: `1px solid ${inputBorder}`, background: inputBg, color: textPrimary, fontSize: 13, outline: 'none', boxSizing: 'border-box' }
  const labelSt: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: labelColor, marginBottom: 6, display: 'block' }

  const filtered = allUsers.filter(u => {
    const q = search.toLowerCase()
    const matchSearch = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    const matchRole = filterRole === 'all' || u.role === filterRole
    const matchStatus = filterStatus === 'all' || u.status === filterStatus
    return matchSearch && matchRole && matchStatus
  })

  function openModal(type: ModalType, u: TargetUser) {
    setTarget(u); setModal(type); setModalMsg(null)
    if (type === 'role') setEditRole(u.role)
    if (type === 'otp') {
      setLastOtp(null)
      apiFetch<{ code: string; expires_at: string }>(`/api/admin/users/${u.id}/otp`).then(r => setLastOtp(r)).catch(() => setLastOtp(null))
    }
  }

  function closeModal() { setModal(null); setTarget(null); setModalMsg(null); setModalLoading(false); setNewPassword(''); setConfirmPassword(''); setNotifTitle(''); setNotifMessage(''); setLastOtp(null) }

  async function handleChangePassword() {
    if (newPassword !== confirmPassword) { setModalMsg({ ok: false, text: 'Passwords do not match' }); return }
    setModalLoading(true)
    try {
      await apiFetch(`/api/admin/users/${target!.id}/password`, { method: 'POST', body: JSON.stringify({ password: newPassword }) })
      setModalMsg({ ok: true, text: 'Password changed successfully' })
    } catch (e) { setModalMsg({ ok: false, text: (e as Error).message }) } finally { setModalLoading(false) }
  }

  async function handleSubscription() {
    setModalLoading(true)
    try {
      await apiFetch(`/api/admin/users/${target!.id}/subscription`, { method: 'POST', body: JSON.stringify({ plan: subPlan, notes: subNotes }) })
      setModalMsg({ ok: true, text: 'Subscription updated' })
    } catch (e) { setModalMsg({ ok: false, text: (e as Error).message }) } finally { setModalLoading(false) }
  }

  async function handleSendNotif() {
    setModalLoading(true)
    try {
      await apiFetch(`/api/admin/users/${target!.id}/notify`, { method: 'POST', body: JSON.stringify({ title: notifTitle, message: notifMessage, type: notifType }) })
      setModalMsg({ ok: true, text: 'Notification sent' })
    } catch (e) { setModalMsg({ ok: false, text: (e as Error).message }) } finally { setModalLoading(false) }
  }

  async function handleImpersonate() {
    setModalLoading(true)
    try {
      const token = await impersonateUser(target!.id)
      startImpersonation({ id: target!.id, name: target!.name, email: target!.email }, token)
      closeModal()
      router.push('/dashboard')
    } catch (e) { setModalMsg({ ok: false, text: (e as Error).message }) } finally { setModalLoading(false) }
  }

  async function handleRoleChange() {
    setModalLoading(true)
    try {
      await updateMemberRole(target!.id, editRole)
      setModalMsg({ ok: true, text: 'Role updated' })
    } catch (e) { setModalMsg({ ok: false, text: (e as Error).message }) } finally { setModalLoading(false) }
  }

  async function handleBlock(u: TargetUser) {
    if (u.status === 'suspended') await unsuspendUser(u.id)
    else await suspendUser(u.id)
  }

  // Actions dropdown per user
  function ActionsDropdown({ u }: { u: TargetUser }) {
    const [open, setOpen] = useState(false)
    const ref = useRef<HTMLDivElement>(null)
    useEffect(() => {
      function h(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
      document.addEventListener('mousedown', h)
      return () => document.removeEventListener('mousedown', h)
    }, [])
    const itemStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '7px 12px', background: 'transparent', border: 'none', cursor: 'pointer', color: textPrimary, fontSize: 12.5, textAlign: 'start' }
    const hBg = 'var(--color-bg-alt)'
    return (
      <div ref={ref} style={{ position: 'relative' }}>
        <button onClick={() => setOpen(v => !v)} style={{ width: 28, height: 28, borderRadius: 6, border: `1px solid ${cardBorder}`, background: 'transparent', color: textMuted, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <i className="bx bx-dots-vertical-rounded" />
        </button>
        {open && (
          <div style={{ position: 'absolute', right: 0, top: 32, zIndex: 9999, background: 'var(--color-bg-contrast)', border: `1px solid var(--color-border)`, borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.2)', minWidth: 190, padding: '4px 0', overflow: 'hidden' }}>
            <button style={itemStyle} onClick={() => { router.push(`/admin/users/${u.id}`); setOpen(false) }} onMouseEnter={e => (e.currentTarget.style.background = hBg)} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
              <i className="bx bx-user-circle" style={{ color: '#00e5ff' }} /> View Profile
            </button>
            <button style={itemStyle} onClick={() => { openModal('role', u); setOpen(false) }} onMouseEnter={e => (e.currentTarget.style.background = hBg)} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
              <i className="bx bx-shield" style={{ color: '#a900ff' }} /> Change Role
            </button>
            <button style={itemStyle} onClick={() => { openModal('subscription', u); setOpen(false) }} onMouseEnter={e => (e.currentTarget.style.background = hBg)} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
              <i className="bx bx-credit-card" style={{ color: '#22c55e' }} /> Subscription
            </button>
            <button style={itemStyle} onClick={() => { openModal('password', u); setOpen(false) }} onMouseEnter={e => (e.currentTarget.style.background = hBg)} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
              <i className="bx bx-lock-alt" style={{ color: '#f97316' }} /> Change Password
            </button>
            <button style={itemStyle} onClick={() => { openModal('otp', u); setOpen(false) }} onMouseEnter={e => (e.currentTarget.style.background = hBg)} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
              <i className="bx bx-code-alt" style={{ color: textMuted }} /> Last OTP
            </button>
            <button style={itemStyle} onClick={() => { openModal('notify', u); setOpen(false) }} onMouseEnter={e => (e.currentTarget.style.background = hBg)} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
              <i className="bx bx-bell" style={{ color: '#00e5ff' }} /> Send Notification
            </button>
            <button style={itemStyle} onClick={() => { openModal('impersonate', u); setOpen(false) }} onMouseEnter={e => (e.currentTarget.style.background = hBg)} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
              <i className="bx bx-user-check" style={{ color: '#a900ff' }} /> Impersonate
            </button>
            <div style={{ height: 1, background: 'var(--color-border)', margin: '4px 0' }} />
            <button style={{ ...itemStyle, color: u.status === 'suspended' ? '#22c55e' : '#ef4444' }} onClick={() => { handleBlock(u); setOpen(false) }} onMouseEnter={e => (e.currentTarget.style.background = hBg)} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
              <i className={`bx ${u.status === 'suspended' ? 'bx-check-circle' : 'bx-block'}`} />
              {u.status === 'suspended' ? ' Unblock' : ' Block'}
            </button>
          </div>
        )}
      </div>
    )
  }

  const BtnPrimary = ({ onClick, loading: l, children }: { onClick: () => void; loading?: boolean; children: React.ReactNode }) => (
    <button onClick={onClick} disabled={l} style={{ padding: '8px 20px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, #00e5ff, #a900ff)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
      {l ? 'Loading…' : children}
    </button>
  )

  return (
    <div className="page-wrapper" style={{ padding: '28px 32px' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Link href="/admin" style={{ fontSize: 13, color: textDim, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 5, marginBottom: 14 }}>
          <i className="bx bx-left-arrow-alt rtl-flip" /> Admin
        </Link>
        <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: textPrimary, margin: 0, letterSpacing: '-0.02em' }}>Users</h1>
            <p style={{ fontSize: 13, color: textMuted, marginTop: 5 }}>{allUsers.length} total users</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <div className="search-wrapper" style={{ position: 'relative', flex: '1 1 260px', maxWidth: 340 }}>
          <i className="bx bx-search" style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', fontSize: 14, color: textDim, pointerEvents: 'none' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name or email…" style={{ width: '100%', padding: '8px 12px 8px 32px', borderRadius: 9, border: `1px solid ${searchBorder}`, background: searchBg, color: textPrimary, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
        </div>
        <div className="admin-filters" style={{ display: 'flex', gap: 6 }}>
          {(['all', 'admin', 'team_owner', 'team_manager', 'user'] as const).map(r => (
            <button key={r} onClick={() => setFilterRole(r)} style={{ padding: '6px 12px', borderRadius: 7, fontSize: 12, fontWeight: 500, border: 'none', cursor: 'pointer', background: filterRole === r ? filterActiveBg : filterInactiveBg, color: filterRole === r ? textPrimary : textMuted }}>
              {r === 'all' ? 'All roles' : ROLE_LABELS[r]}
            </button>
          ))}
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ padding: '7px 12px', borderRadius: 8, border: `1px solid ${selectBorder}`, background: selectBg, color: textPrimary, fontSize: 12, outline: 'none', cursor: 'pointer' }}>
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="invited">Invited</option>
          <option value="suspended">Blocked</option>
        </select>
      </div>

      {error && (
        <div style={{ marginBottom: 16, padding: '10px 14px', borderRadius: 8, fontSize: 13, background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>
          {error}<button onClick={clearError} style={{ marginInlineStart: 8, background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>✕</button>
        </div>
      )}

      {/* Table */}
      <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 14, overflow: 'hidden' }}>
        <div className="grid-admin-users" style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr 44px', gap: 0, padding: '11px 20px', borderBottom: `1px solid ${cardBorder}`, fontSize: 11, fontWeight: 600, color: textDim, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
          <div>User</div><div className="hide-mobile">Email</div><div>Role</div><div className="hide-mobile">Status</div><div />
        </div>
        {loading && allUsers.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: textDim, fontSize: 13 }}>Loading users…</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '48px 40px', textAlign: 'center' }}>
            <i className="bx bx-group" style={{ fontSize: 36, color: textDim, display: 'block', marginBottom: 10 }} />
            <div style={{ fontSize: 14, color: textMuted }}>No users found</div>
          </div>
        ) : filtered.map((u, idx) => (
          <div key={u.id} className="grid-admin-users" style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr 44px', gap: 0, padding: '13px 20px', borderBottom: idx < filtered.length - 1 ? `1px solid var(--color-bg-alt)` : 'none', alignItems: 'center', background: u.status === 'suspended' ? 'rgba(239,68,68,0.03)' : 'transparent' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(0,229,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#00e5ff', flexShrink: 0 }}>
                {u.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div style={{ fontSize: 13, fontWeight: 500, color: u.status === 'suspended' ? textDim : textPrimary }}>{u.name}</div>
            </div>
            <div className="hide-mobile" style={{ fontSize: 12, color: textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email}</div>
            <div><RoleBadge role={u.role} /></div>
            <div className="hide-mobile"><StatusDot status={u.status} /></div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <ActionsDropdown u={u as TargetUser} />
            </div>
          </div>
        ))}
      </div>

      {/* ── Modals ── */}
      {modal && target && (
        <div onClick={closeModal} style={{ position: 'fixed', inset: 0, background: overlayBg, zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ background: modalBg, border: `1px solid var(--color-border)`, borderRadius: 16, padding: 28, width: '100%', maxWidth: 440, boxShadow: '0 24px 64px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: textPrimary }}>
                  {modal === 'password' && 'Change Password'}
                  {modal === 'subscription' && 'Manage Subscription'}
                  {modal === 'otp' && 'Last OTP Code'}
                  {modal === 'notify' && 'Send Notification'}
                  {modal === 'impersonate' && 'Impersonate User'}
                  {modal === 'role' && 'Change Role'}
                </div>
                <div style={{ fontSize: 12, color: textMuted, marginTop: 3 }}>{target.name} · {target.email}</div>
              </div>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', color: textMuted, cursor: 'pointer', fontSize: 20 }}>✕</button>
            </div>

            {/* Change Password */}
            {modal === 'password' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div><label style={labelSt}>New Password</label><input style={inputSt} type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="••••••••" /></div>
                <div><label style={labelSt}>Confirm Password</label><input style={inputSt} type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="••••••••" /></div>
                {modalMsg && <div style={{ fontSize: 12, color: modalMsg.ok ? '#22c55e' : '#ef4444' }}>{modalMsg.text}</div>}
                <BtnPrimary onClick={handleChangePassword} loading={modalLoading}>Change Password</BtnPrimary>
              </div>
            )}

            {/* Subscription */}
            {modal === 'subscription' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={labelSt}>Plan</label>
                  <select style={{ ...inputSt }} value={subPlan} onChange={e => setSubPlan(e.target.value)}>
                    <option value="free">Free</option>
                    <option value="pro">Pro ($19/mo)</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                </div>
                <div><label style={labelSt}>Internal Notes</label><textarea style={{ ...inputSt, height: 72, resize: 'vertical' }} value={subNotes} onChange={e => setSubNotes(e.target.value)} placeholder="Reason for change…" /></div>
                {modalMsg && <div style={{ fontSize: 12, color: modalMsg.ok ? '#22c55e' : '#ef4444' }}>{modalMsg.text}</div>}
                <BtnPrimary onClick={handleSubscription} loading={modalLoading}>Update Subscription</BtnPrimary>
              </div>
            )}

            {/* OTP */}
            {modal === 'otp' && (
              <div>
                {lastOtp ? (
                  <div style={{ padding: '20px', borderRadius: 10, background: 'var(--color-bg-alt)', border: `1px solid var(--color-border)`, textAlign: 'center' }}>
                    <div style={{ fontSize: 32, fontWeight: 700, fontFamily: 'monospace', color: textPrimary, letterSpacing: '0.15em' }}>{lastOtp.code}</div>
                    <div style={{ fontSize: 11, color: textMuted, marginTop: 8 }}>Expires: {lastOtp.expires_at}</div>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '24px 0', color: textDim }}>No recent OTP found</div>
                )}
              </div>
            )}

            {/* Send Notification */}
            {modal === 'notify' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div><label style={labelSt}>Title</label><input style={inputSt} value={notifTitle} onChange={e => setNotifTitle(e.target.value)} placeholder="Notification title" /></div>
                <div><label style={labelSt}>Message</label><textarea style={{ ...inputSt, height: 80, resize: 'vertical' }} value={notifMessage} onChange={e => setNotifMessage(e.target.value)} placeholder="Write your message…" /></div>
                <div>
                  <label style={labelSt}>Type</label>
                  <select style={{ ...inputSt }} value={notifType} onChange={e => setNotifType(e.target.value)}>
                    <option value="info">Info</option>
                    <option value="success">Success</option>
                    <option value="warning">Warning</option>
                    <option value="error">Error</option>
                  </select>
                </div>
                {modalMsg && <div style={{ fontSize: 12, color: modalMsg.ok ? '#22c55e' : '#ef4444' }}>{modalMsg.text}</div>}
                <BtnPrimary onClick={handleSendNotif} loading={modalLoading}>Send Notification</BtnPrimary>
              </div>
            )}

            {/* Impersonate */}
            {modal === 'impersonate' && (
              <div>
                <div style={{ padding: '16px', borderRadius: 10, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', marginBottom: 20 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#f59e0b', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <i className="bx bx-error" /> You are about to impersonate this user
                  </div>
                  <div style={{ fontSize: 12, color: textMuted }}>
                    You will be logged in as <strong>{target.name}</strong> with full access to their account. A yellow banner will be shown — click &quot;Exit Impersonation&quot; to return to your admin session.
                  </div>
                </div>
                {modalMsg && <div style={{ fontSize: 12, color: '#ef4444', marginBottom: 12 }}>{modalMsg.text}</div>}
                <div style={{ display: 'flex', gap: 10 }}>
                  <BtnPrimary onClick={handleImpersonate} loading={modalLoading}>Impersonate {target.name}</BtnPrimary>
                  <button onClick={closeModal} style={{ padding: '8px 16px', borderRadius: 8, border: `1px solid var(--color-border)`, background: 'transparent', color: textMuted, fontSize: 13, cursor: 'pointer' }}>Cancel</button>
                </div>
              </div>
            )}

            {/* Change Role */}
            {modal === 'role' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={labelSt}>New Role</label>
                  <select style={{ ...inputSt }} value={editRole} onChange={e => setEditRole(e.target.value as Role)}>
                    {(['user', 'team_manager', 'team_owner', 'admin'] as Role[]).map(r => (
                      <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                    ))}
                  </select>
                </div>
                {modalMsg && <div style={{ fontSize: 12, color: modalMsg.ok ? '#22c55e' : '#ef4444' }}>{modalMsg.text}</div>}
                <BtnPrimary onClick={handleRoleChange} loading={modalLoading}>Update Role</BtnPrimary>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
