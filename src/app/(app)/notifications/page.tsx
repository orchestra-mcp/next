'use client'
import { useState, useEffect } from 'react'
import { useSettingsStore, type Notification } from '@/store/settings'
import { useTranslations } from 'next-intl'

type Filter = 'all' | 'unread' | 'system' | 'team'

// Map notification type to icon class and color
const TYPE_META: Record<string, { icon: string; color: string }> = {
  info:    { icon: 'bx-info-circle',  color: '#00e5ff' },
  success: { icon: 'bx-check-circle', color: '#22c55e' },
  warning: { icon: 'bx-error',        color: '#f97316' },
  error:   { icon: 'bx-x-circle',     color: '#ef4444' },
}

function getTypeMeta(type: string) {
  return TYPE_META[type] ?? TYPE_META['info']
}

function formatTimestamp(iso: string): string {
  const date = new Date(iso)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60_000)
  const diffHr = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHr / 24)

  if (diffMin < 1)  return 'just now'
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffHr < 24)  return `${diffHr}h ago`
  if (diffDay < 7)  return `${diffDay}d ago`

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// Extracted outside the component to avoid React key warnings from
// re-creating the component function on every render.
function NotificationRow({ n, onMarkRead, isLast }: { n: Notification; onMarkRead: (id: number) => void; isLast: boolean }) {
  const meta = getTypeMeta(n.type)
  const isUnread = !n.read_at

  const textPrimary = 'var(--color-fg)'
  const textMuted   = 'var(--color-fg-muted)'
  const textDim     = 'var(--color-fg-dim)'
  const cardBorder  = 'var(--color-border)'
  const cardHover   = 'var(--color-bg-active)'

  return (
    <div
      onClick={() => { if (isUnread) onMarkRead(n.id) }}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 14,
        padding: '14px 18px',
        borderBottom: isLast ? 'none' : `1px solid ${cardBorder}`,
        cursor: isUnread ? 'pointer' : 'default',
        background: isUnread ? 'rgba(0,229,255,0.03)' : 'transparent',
        transition: 'background 0.15s',
      }}
      onMouseEnter={e => { if (isUnread) (e.currentTarget as HTMLDivElement).style.background = cardHover }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = isUnread ? 'rgba(0,229,255,0.03)' : 'transparent' }}
    >
      {/* Icon */}
      <div style={{ width: 36, height: 36, borderRadius: 10, background: `${meta.color}14`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
        <i className={`bx ${meta.icon}`} style={{ fontSize: 17, color: meta.color }} />
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: isUnread ? 600 : 500, color: textPrimary, marginBottom: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {n.title}
        </div>
        <div style={{ fontSize: 12, color: textMuted, lineHeight: 1.5 }}>{n.message}</div>
      </div>

      {/* Right side: timestamp + unread dot */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
        <span style={{ fontSize: 11, color: textDim, whiteSpace: 'nowrap' }}>{formatTimestamp(n.created_at)}</span>
        {isUnread && (
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00e5ff', display: 'block' }} />
        )}
      </div>
    </div>
  )
}

export default function NotificationsPage() {
  const { notifications, loading, error, fetchNotifications, markNotificationRead, markAllRead } = useSettingsStore()
  const t = useTranslations('app')

  const [filter, setFilter] = useState<Filter>('all')
  const [markingAll, setMarkingAll] = useState(false)

  const FILTERS: { id: Filter; label: string }[] = [
    { id: 'all', label: t('filterAll') },
    { id: 'unread', label: t('filterUnread') },
    { id: 'system', label: t('filterSystem') },
    { id: 'team', label: t('filterTeam') },
  ]

  useEffect(() => {
    fetchNotifications()
  }, [])

  const textPrimary = 'var(--color-fg)'
  const textMuted   = 'var(--color-fg-muted)'
  const textDim     = 'var(--color-fg-dim)'
  const cardBg      = 'var(--color-bg-alt)'
  const cardBorder  = 'var(--color-border)'
  const pillBg      = 'var(--color-bg-active)'
  const pillActive  = 'var(--color-border)'
  const pillActiveColor = 'var(--color-fg)'
  const pillColor   = 'var(--color-fg-muted)'

  // Filter notifications
  const filtered = notifications.filter(n => {
    if (filter === 'all')    return true
    if (filter === 'unread') return !n.read_at
    if (filter === 'system') return n.type === 'info' || n.type === 'warning' || n.type === 'error'
    if (filter === 'team')   return n.type === 'success'
    return true
  })

  const unreadCount = notifications.filter(n => !n.read_at).length

  async function handleMarkAll() {
    setMarkingAll(true)
    try { await markAllRead() } finally { setMarkingAll(false) }
  }

  return (
    <div className="page-wrapper" style={{ padding: '28px 32px' }}>
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: textPrimary, margin: 0, letterSpacing: '-0.02em' }}>
            Notifications
            {unreadCount > 0 && (
              <span style={{ marginInlineStart: 10, fontSize: 12, padding: '2px 8px', borderRadius: 100, background: 'rgba(0,229,255,0.1)', color: '#00e5ff', fontWeight: 700, verticalAlign: 'middle' }}>
                {unreadCount}
              </span>
            )}
          </h1>
          <p style={{ fontSize: 13, color: textMuted, marginTop: 5 }}>Stay up to date with activity and alerts.</p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAll}
            disabled={markingAll}
            style={{ padding: '7px 14px', borderRadius: 8, border: `1px solid ${cardBorder}`, background: 'transparent', color: textMuted, fontSize: 12.5, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, opacity: markingAll ? 0.6 : 1 }}
          >
            <i className="bx bx-check-double" style={{ fontSize: 15 }} />
            {markingAll ? 'Marking…' : 'Mark all read'}
          </button>
        )}
      </div>

      {/* Filter pills */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
        {FILTERS.map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            style={{
              padding: '6px 14px',
              borderRadius: 100,
              border: 'none',
              cursor: 'pointer',
              fontSize: 12.5,
              fontWeight: 500,
              background: filter === f.id ? pillActive : pillBg,
              color: filter === f.id ? pillActiveColor : pillColor,
              transition: 'background 0.15s',
            }}
          >
            {f.label}
            {f.id === 'unread' && unreadCount > 0 && (
              <span style={{ marginInlineStart: 6, fontSize: 10, padding: '1px 5px', borderRadius: 100, background: '#00e5ff', color: '#000', fontWeight: 700 }}>{unreadCount}</span>
            )}
          </button>
        ))}
      </div>

      {/* Notification list */}
      <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 14, overflow: 'hidden' }}>
        {loading && filtered.length === 0 ? (
          // Loading skeleton
          <div style={{ padding: '8px 0' }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: '14px 18px', borderBottom: i < 3 ? `1px solid ${cardBorder}` : 'none' }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--color-bg-alt)', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ height: 13, width: '60%', borderRadius: 6, background: 'var(--color-bg-alt)', marginBottom: 8 }} />
                  <div style={{ height: 11, width: '80%', borderRadius: 6, background: 'var(--color-bg-alt)' }} />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div style={{ padding: '32px 20px', textAlign: 'center' }}>
            <i className="bx bx-error-circle" style={{ fontSize: 28, color: '#ef4444', display: 'block', marginBottom: 10 }} />
            <div style={{ fontSize: 13, color: '#ef4444', marginBottom: 6 }}>Failed to load notifications</div>
            <div style={{ fontSize: 12, color: textDim, marginBottom: 14 }}>{error}</div>
            <button onClick={fetchNotifications} style={{ padding: '7px 16px', borderRadius: 8, border: `1px solid ${cardBorder}`, background: 'transparent', color: textMuted, fontSize: 12, cursor: 'pointer' }}>
              Try again
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '48px 20px', textAlign: 'center' }}>
            <i className="bx bx-bell-off" style={{ fontSize: 32, color: textDim, display: 'block', marginBottom: 12 }} />
            <div style={{ fontSize: 14, fontWeight: 600, color: textPrimary, marginBottom: 5 }}>
              {filter === 'unread' ? 'All caught up' : 'No notifications'}
            </div>
            <div style={{ fontSize: 12, color: textDim }}>
              {filter === 'unread' ? "You've read all your notifications." : 'Nothing here yet.'}
            </div>
          </div>
        ) : (
          <div>
            {filtered.map((n, idx) => (
              <NotificationRow key={n.id} n={n} onMarkRead={markNotificationRead} isLast={idx === filtered.length - 1} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
