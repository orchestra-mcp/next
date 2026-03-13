'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useRoleStore } from '@/store/roles'
import { useAdminStore, type AdminContact } from '@/store/admin'
import { ConfirmDialog } from '@/components/ConfirmDialog'

export default function AdminContactPage() {
  const router = useRouter()
  const { can, roleLoaded } = useRoleStore()
  const { contact, loading, error, fetchContact, deleteContact, clearError } = useAdminStore()

  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [confirmDialog, setConfirmDialog] = useState<{ message: string; onConfirm: () => void } | null>(null)

  useEffect(() => {
    if (!roleLoaded) return
    if (!can('canViewAdmin')) { router.replace('/dashboard'); return }
    fetchContact()
  }, [roleLoaded])

  const textPrimary = 'var(--color-fg)'
  const textMuted = 'var(--color-fg-muted)'
  const textDim = 'var(--color-fg-dim)'
  const cardBg = 'var(--color-bg-alt)'
  const cardBorder = 'var(--color-border)'
  const pageBg = 'var(--color-bg)'
  const rowBorder = 'var(--color-bg-alt)'
  const expandedBg = 'rgba(0,229,255,0.03)'

  function StatusBadge({ status }: { status: AdminContact['status'] }) {
    const map = {
      new: { bg: 'rgba(0,229,255,0.08)', color: '#00e5ff', border: 'rgba(0,229,255,0.2)', label: 'New' },
      read: { bg: 'var(--color-bg-active)', color: textMuted as string, border: 'var(--color-border)', label: 'Read' },
      replied: { bg: 'rgba(34,197,94,0.08)', color: '#22c55e', border: 'rgba(34,197,94,0.2)', label: 'Replied' },
    }
    const c = map[status]
    return <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 100, background: c.bg, color: c.color, border: `1px solid ${c.border}`, fontWeight: 600 }}>{c.label}</span>
  }

  function fmt(d: string) {
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  function handleDelete(msg: AdminContact) {
    setConfirmDialog({
      message: `Delete message from ${msg.name}?`,
      onConfirm: async () => {
        setConfirmDialog(null)
        try {
          await deleteContact(msg.id)
          if (expandedId === msg.id) setExpandedId(null)
        } catch {
          // error shown via store
        }
      },
    })
  }

  function toggleExpand(id: number) {
    setExpandedId(prev => prev === id ? null : id)
  }

  return (
    <div className="page-wrapper" style={{ padding: '28px 32px', background: pageBg, minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Link href="/admin" style={{ fontSize: 13, color: textDim, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 5, marginBottom: 14 }}>
          <i className="bx bx-left-arrow-alt rtl-flip" /> Admin
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: textPrimary, margin: 0, letterSpacing: '-0.02em' }}>Contact Messages</h1>
          <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 9px', borderRadius: 100, background: 'var(--color-bg-active)', color: textMuted }}>
            {contact.length}
          </span>
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
        <div className="grid-admin-users" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.5fr 1.5fr 90px 110px 40px', padding: '11px 20px', borderBottom: `1px solid ${cardBorder}`, fontSize: 11, fontWeight: 600, color: textDim, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
          <div>Name</div>
          <div className="hide-mobile">Email</div>
          <div>Subject</div>
          <div className="hide-mobile">Status</div>
          <div className="hide-mobile">Date</div>
          <div />
        </div>

        {loading && contact.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: textDim, fontSize: 13 }}>
            <i className="bx bx-loader-alt bx-spin" style={{ fontSize: 24, display: 'block', marginBottom: 10 }} />
            Loading messages…
          </div>
        ) : contact.length === 0 ? (
          <div style={{ padding: '56px 40px', textAlign: 'center' }}>
            <i className="bx bx-envelope" style={{ fontSize: 38, color: textDim, display: 'block', marginBottom: 10 }} />
            <div style={{ fontSize: 14, fontWeight: 600, color: textMuted, marginBottom: 4 }}>No messages</div>
            <div style={{ fontSize: 12, color: textDim }}>Contact form submissions will appear here.</div>
          </div>
        ) : contact.map((msg, idx) => {
          const isExpanded = expandedId === msg.id
          const isLast = idx === contact.length - 1

          return (
            <div key={msg.id}>
              {/* Main row */}
              <div
                className="grid-admin-users"
                onClick={() => toggleExpand(msg.id)}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1.2fr 1.5fr 1.5fr 90px 110px 40px',
                  padding: '13px 20px',
                  borderBottom: isExpanded ? 'none' : (!isLast ? `1px solid ${rowBorder}` : 'none'),
                  alignItems: 'center',
                  cursor: 'pointer',
                  background: isExpanded ? expandedBg : 'transparent',
                  transition: 'background 0.15s',
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 500, color: textPrimary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{msg.name}</div>
                <div className="hide-mobile" style={{ fontSize: 12, color: textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{msg.email}</div>
                <div style={{ fontSize: 12, color: textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{msg.subject}</div>
                <div className="hide-mobile"><StatusBadge status={msg.status} /></div>
                <div className="hide-mobile" style={{ fontSize: 11.5, color: textDim }}>{fmt(msg.created_at)}</div>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }} onClick={e => e.stopPropagation()}>
                  <button onClick={() => handleDelete(msg)} title="Delete" style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.05)', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <i className="bx bx-trash" style={{ fontSize: 13 }} />
                  </button>
                </div>
              </div>

              {/* Expanded message */}
              {isExpanded && (
                <div style={{
                  padding: '14px 20px 18px 20px',
                  background: expandedBg,
                  borderBottom: !isLast ? `1px solid ${rowBorder}` : 'none',
                  borderTop: '1px solid rgba(0,229,255,0.1)',
                }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: textDim, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 8 }}>Message</div>
                  <div style={{
                    fontSize: 13, color: textMuted, lineHeight: 1.7,
                    padding: '12px 16px', borderRadius: 10,
                    background: 'var(--color-bg-alt)',
                    border: `1px solid var(--color-border)`,
                    whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                  }}>
                    {msg.message}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <ConfirmDialog
        open={!!confirmDialog}
        title="Delete Message"
        message={confirmDialog?.message ?? ''}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={() => confirmDialog?.onConfirm()}
        onCancel={() => setConfirmDialog(null)}
      />
    </div>
  )
}
