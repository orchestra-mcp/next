'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useRoleStore } from '@/store/roles'
import { useAdminStore, type AdminNotificationSent } from '@/store/admin'

type RecipientType = 'all' | 'user'
type NotifType = 'info' | 'success' | 'warning' | 'error'

const EMPTY_FORM = {
  recipient: 'all' as RecipientType,
  user_id: '',
  title: '',
  message: '',
  type: 'info' as NotifType,
}

export default function AdminNotificationsPage() {
  const router = useRouter()
  const { can, roleLoaded } = useRoleStore()
  const { notifications, loading, error, fetchNotificationsSent, sendNotification, seedNotifications, clearError } = useAdminStore()

  const [form, setForm] = useState(EMPTY_FORM)
  const [sending, setSending] = useState(false)
  const [seeding, setSeeding] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)
  const [sendSuccess, setSendSuccess] = useState(false)

  useEffect(() => {
    if (!roleLoaded) return
    if (!can('canViewAdmin')) { router.replace('/dashboard'); return }
    fetchNotificationsSent()
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
  const labelColor = 'var(--color-fg-muted)'

  const inputSt: React.CSSProperties = {
    width: '100%', padding: '9px 12px', borderRadius: 9,
    border: `1px solid ${inputBorder}`, background: inputBg,
    color: textPrimary, fontSize: 13, outline: 'none', boxSizing: 'border-box',
  }
  const labelSt: React.CSSProperties = {
    fontSize: 12, fontWeight: 600, color: labelColor, marginBottom: 6, display: 'block',
  }

  async function handleSend() {
    if (!form.title.trim()) { setSendError('Title is required'); return }
    if (!form.message.trim()) { setSendError('Message is required'); return }
    if (form.recipient === 'user' && !form.user_id.trim()) { setSendError('User ID is required for specific user'); return }
    setSending(true)
    setSendError(null)
    setSendSuccess(false)
    try {
      await sendNotification({
        title: form.title,
        message: form.message,
        type: form.type,
        ...(form.recipient === 'user' ? { user_id: Number(form.user_id) } : {}),
      })
      setForm(EMPTY_FORM)
      setSendSuccess(true)
      setTimeout(() => setSendSuccess(false), 3000)
    } catch (e) {
      setSendError((e as Error).message)
    } finally {
      setSending(false)
    }
  }

  function TypeBadge({ type }: { type: string }) {
    const map: Record<string, { bg: string; color: string; border: string; icon: string }> = {
      info: { bg: 'rgba(0,229,255,0.08)', color: '#00e5ff', border: 'rgba(0,229,255,0.2)', icon: 'bx-info-circle' },
      success: { bg: 'rgba(34,197,94,0.08)', color: '#22c55e', border: 'rgba(34,197,94,0.2)', icon: 'bx-check-circle' },
      warning: { bg: 'rgba(245,158,11,0.08)', color: '#f59e0b', border: 'rgba(245,158,11,0.2)', icon: 'bx-error' },
      error: { bg: 'rgba(239,68,68,0.08)', color: '#ef4444', border: 'rgba(239,68,68,0.2)', icon: 'bx-x-circle' },
    }
    const c = map[type] ?? map.info
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10, padding: '2px 8px', borderRadius: 100, background: c.bg, color: c.color, border: `1px solid ${c.border}`, fontWeight: 600, textTransform: 'capitalize' }}>
        <i className={`bx ${c.icon}`} style={{ fontSize: 11 }} />
        {type}
      </span>
    )
  }

  function fmt(d: string) {
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <div className="page-wrapper" style={{ padding: '28px 32px', background: pageBg, minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Link href="/admin" style={{ fontSize: 13, color: textDim, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 5, marginBottom: 14 }}>
          <i className="bx bx-left-arrow-alt rtl-flip" /> Admin
        </Link>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: textPrimary, margin: 0, letterSpacing: '-0.02em' }}>Notifications</h1>
        <p style={{ fontSize: 13, color: textMuted, marginTop: 5 }}>Send notifications and view history.</p>
      </div>

      {/* Send form card */}
      <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 14, padding: '20px 24px', marginBottom: 24 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: textDim, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 18 }}>Send Notification</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Recipients */}
          <div>
            <label style={labelSt}>Recipients</label>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
              <select style={{ ...inputSt, width: 'auto', flex: '0 0 auto' }} value={form.recipient} onChange={e => setForm(f => ({ ...f, recipient: e.target.value as RecipientType, user_id: '' }))}>
                <option value="all">All Users</option>
                <option value="user">Specific User</option>
              </select>
              {form.recipient === 'user' && (
                <input
                  style={{ ...inputSt, flex: 1 }}
                  value={form.user_id}
                  onChange={e => setForm(f => ({ ...f, user_id: e.target.value }))}
                  placeholder="User ID…"
                  type="number"
                />
              )}
            </div>
          </div>

          {/* Title + Type row */}
          <div className="form-grid-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 160px', gap: 14 }}>
            <div>
              <label style={labelSt}>Title</label>
              <input style={inputSt} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Notification title…" />
            </div>
            <div>
              <label style={labelSt}>Type</label>
              <select style={inputSt} value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as NotifType }))}>
                <option value="info">Info</option>
                <option value="success">Success</option>
                <option value="warning">Warning</option>
                <option value="error">Error</option>
              </select>
            </div>
          </div>

          {/* Message */}
          <div>
            <label style={labelSt}>Message</label>
            <textarea style={{ ...inputSt, height: 88, resize: 'vertical' }} value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} placeholder="Notification message…" />
          </div>

          {/* Feedback */}
          {sendError && <div style={{ fontSize: 12, color: '#ef4444', padding: '8px 12px', borderRadius: 7, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>{sendError}</div>}
          {sendSuccess && <div style={{ fontSize: 12, color: '#22c55e', padding: '8px 12px', borderRadius: 7, background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', display: 'flex', alignItems: 'center', gap: 6 }}><i className="bx bx-check-circle" /> Notification sent successfully.</div>}

          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button
              onClick={handleSend}
              disabled={sending}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 20px', borderRadius: 9, border: 'none', background: 'linear-gradient(135deg, #00e5ff, #a900ff)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: sending ? 0.7 : 1 }}
            >
              <i className="bx bx-send" />
              {sending ? 'Sending…' : 'Send Notification'}
            </button>
            <button
              onClick={async () => { setSeeding(true); try { await seedNotifications() } finally { setSeeding(false) } }}
              disabled={seeding}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 20px', borderRadius: 9, border: `1px solid ${cardBorder}`, background: 'transparent', color: textMuted, fontSize: 13, fontWeight: 500, cursor: 'pointer', opacity: seeding ? 0.7 : 1 }}
            >
              <i className="bx bx-test-tube" />
              {seeding ? 'Seeding…' : 'Seed Test Notifications'}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div style={{ marginBottom: 16, padding: '10px 14px', borderRadius: 8, fontSize: 13, background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {error}
          <button onClick={clearError} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 16, lineHeight: 1 }}>✕</button>
        </div>
      )}

      {/* Sent history table */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: textDim, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Sent History</div>
      </div>

      <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 14, overflow: 'hidden' }}>
        <div className="grid-admin-users" style={{ display: 'grid', gridTemplateColumns: '2fr 110px 1fr 120px', padding: '11px 20px', borderBottom: `1px solid ${cardBorder}`, fontSize: 11, fontWeight: 600, color: textDim, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
          <div>Title</div>
          <div>Type</div>
          <div className="hide-mobile">Target</div>
          <div className="hide-mobile">Sent</div>
        </div>

        {loading && notifications.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: textDim, fontSize: 13 }}>
            <i className="bx bx-loader-alt bx-spin" style={{ fontSize: 24, display: 'block', marginBottom: 10 }} />
            Loading history…
          </div>
        ) : notifications.length === 0 ? (
          <div style={{ padding: '56px 40px', textAlign: 'center' }}>
            <i className="bx bx-bell-off" style={{ fontSize: 38, color: textDim, display: 'block', marginBottom: 10 }} />
            <div style={{ fontSize: 14, fontWeight: 600, color: textMuted, marginBottom: 4 }}>No notifications sent yet</div>
            <div style={{ fontSize: 12, color: textDim }}>Use the form above to send your first notification.</div>
          </div>
        ) : notifications.map((n, idx) => (
          <div key={n.id} className="grid-admin-users" style={{ display: 'grid', gridTemplateColumns: '2fr 110px 1fr 120px', padding: '13px 20px', borderBottom: idx < notifications.length - 1 ? `1px solid ${rowBorder}` : 'none', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color: textPrimary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.title}</div>
              <div style={{ fontSize: 11, color: textDim, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.message}</div>
            </div>
            <div><TypeBadge type={n.type} /></div>
            <div className="hide-mobile" style={{ fontSize: 12, color: textMuted }}>
              {n.target === 'all' ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <i className="bx bx-group" style={{ fontSize: 13 }} /> All Users
                </span>
              ) : (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <i className="bx bx-user" style={{ fontSize: 13 }} /> User #{n.target_user_id}
                </span>
              )}
            </div>
            <div className="hide-mobile" style={{ fontSize: 11.5, color: textDim }}>{fmt(n.created_at)}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
