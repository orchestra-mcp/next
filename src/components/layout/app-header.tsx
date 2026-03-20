'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { LanguageSwitcher } from '@/components/ui/language-switcher'
import { ThemeToggle } from '@/components/ui/theme-provider'

// ── Types ────────────────────────────────────────────────────

interface Notification {
  id: string
  title: string
  message: string
  type: string
  read: boolean
  created_at: string
}

interface AppHeaderProps {
  user: { name: string; email: string; avatar_url?: string | null; username?: string } | null
  team?: { name: string } | null
  notifications: Notification[]
  onSearch?: () => void
  onNotificationRead: (id: string) => void
  onMarkAllRead: () => void
  onLogout: () => void
  tunnelStatus?: 'connected' | 'connecting' | 'disconnected' | 'error'
  tunnelStatusColor?: string
  workspaces?: { id: string; name: string }[]
  activeWorkspaceId?: string | null
  onWorkspaceSwitch?: (id: string) => void
}

// ── Notification type metadata ───────────────────────────────

const NOTIF_TYPE_META: Record<string, { icon: string; color: string }> = {
  info:    { icon: 'bx-info-circle',  color: '#00e5ff' },
  success: { icon: 'bx-check-circle', color: '#22c55e' },
  warning: { icon: 'bx-error',        color: '#f97316' },
  error:   { icon: 'bx-x-circle',     color: '#ef4444' },
}

// ── Time-ago helper ──────────────────────────────────────────

function notifTimeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60_000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

// ── Simple MD5 for Gravatar URLs (no external dep) ───────────

function md5(str: string): string {
  function safeAdd(x: number, y: number) { const lsw = (x & 0xffff) + (y & 0xffff); return ((((x >> 16) + (y >> 16) + (lsw >> 16)) << 16) | (lsw & 0xffff)) >>> 0 }
  function bitRotateLeft(num: number, cnt: number) { return (num << cnt) | (num >>> (32 - cnt)) }
  function md5cmn(q: number, a: number, b: number, x: number, s: number, t: number) { return safeAdd(bitRotateLeft(safeAdd(safeAdd(a, q), safeAdd(x, t)), s), b) }
  function md5ff(a: number, b: number, c: number, d: number, x: number, s: number, t: number) { return md5cmn((b & c) | (~b & d), a, b, x, s, t) }
  function md5gg(a: number, b: number, c: number, d: number, x: number, s: number, t: number) { return md5cmn((b & d) | (c & ~d), a, b, x, s, t) }
  function md5hh(a: number, b: number, c: number, d: number, x: number, s: number, t: number) { return md5cmn(b ^ c ^ d, a, b, x, s, t) }
  function md5ii(a: number, b: number, c: number, d: number, x: number, s: number, t: number) { return md5cmn(c ^ (b | ~d), a, b, x, s, t) }
  function md5blks(s: string) {
    const nblk = ((s.length + 8) >> 6) + 1; const blks = new Array(nblk * 16).fill(0)
    for (let i = 0; i < s.length; i++) blks[i >> 2] |= s.charCodeAt(i) << (i % 4 * 8)
    blks[s.length >> 2] |= 0x80 << (s.length % 4 * 8); blks[nblk * 16 - 2] = s.length * 8; return blks
  }
  const x = md5blks(str); let [a, b, c, d] = [1732584193, -271733879, -1732584194, 271733878]
  for (let i = 0; i < x.length; i += 16) {
    const [oa, ob, oc, od] = [a, b, c, d]
    a = md5ff(a,b,c,d,x[i+0],7,-680876936);d=md5ff(d,a,b,c,x[i+1],12,-389564586);c=md5ff(c,d,a,b,x[i+2],17,606105819);b=md5ff(b,c,d,a,x[i+3],22,-1044525330)
    a = md5ff(a,b,c,d,x[i+4],7,-176418897);d=md5ff(d,a,b,c,x[i+5],12,1200080426);c=md5ff(c,d,a,b,x[i+6],17,-1473231341);b=md5ff(b,c,d,a,x[i+7],22,-45705983)
    a = md5ff(a,b,c,d,x[i+8],7,1770035416);d=md5ff(d,a,b,c,x[i+9],12,-1958414417);c=md5ff(c,d,a,b,x[i+10],17,-42063);b=md5ff(b,c,d,a,x[i+11],22,-1990404162)
    a = md5ff(a,b,c,d,x[i+12],7,1804603682);d=md5ff(d,a,b,c,x[i+13],12,-40341101);c=md5ff(c,d,a,b,x[i+14],17,-1502002290);b=md5ff(b,c,d,a,x[i+15],22,1236535329)
    a = md5gg(a,b,c,d,x[i+1],5,-165796510);d=md5gg(d,a,b,c,x[i+6],9,-1069501632);c=md5gg(c,d,a,b,x[i+11],14,643717713);b=md5gg(b,c,d,a,x[i+0],20,-373897302)
    a = md5gg(a,b,c,d,x[i+5],5,-701558691);d=md5gg(d,a,b,c,x[i+10],9,38016083);c=md5gg(c,d,a,b,x[i+15],14,-660478335);b=md5gg(b,c,d,a,x[i+4],20,-405537848)
    a = md5gg(a,b,c,d,x[i+9],5,568446438);d=md5gg(d,a,b,c,x[i+14],9,-1019803690);c=md5gg(c,d,a,b,x[i+3],14,-187363961);b=md5gg(b,c,d,a,x[i+8],20,1163531501)
    a = md5gg(a,b,c,d,x[i+13],5,-1444681467);d=md5gg(d,a,b,c,x[i+2],9,-51403784);c=md5gg(c,d,a,b,x[i+7],14,1735328473);b=md5gg(b,c,d,a,x[i+12],20,-1926607734)
    a = md5hh(a,b,c,d,x[i+5],4,-378558);d=md5hh(d,a,b,c,x[i+8],11,-2022574463);c=md5hh(c,d,a,b,x[i+11],16,1839030562);b=md5hh(b,c,d,a,x[i+14],23,-35309556)
    a = md5hh(a,b,c,d,x[i+1],4,-1530992060);d=md5hh(d,a,b,c,x[i+4],11,1272893353);c=md5hh(c,d,a,b,x[i+7],16,-155497632);b=md5hh(b,c,d,a,x[i+10],23,-1094730640)
    a = md5hh(a,b,c,d,x[i+13],4,681279174);d=md5hh(d,a,b,c,x[i+0],11,-358537222);c=md5hh(c,d,a,b,x[i+3],16,-722521979);b=md5hh(b,c,d,a,x[i+6],23,76029189)
    a = md5hh(a,b,c,d,x[i+9],4,-640364487);d=md5hh(d,a,b,c,x[i+12],11,-421815835);c=md5hh(c,d,a,b,x[i+15],16,530742520);b=md5hh(b,c,d,a,x[i+2],23,-995338651)
    a = md5ii(a,b,c,d,x[i+0],6,-198630844);d=md5ii(d,a,b,c,x[i+7],10,1126891415);c=md5ii(c,d,a,b,x[i+14],15,-1416354905);b=md5ii(b,c,d,a,x[i+5],21,-57434055)
    a = md5ii(a,b,c,d,x[i+12],6,1700485571);d=md5ii(d,a,b,c,x[i+3],10,-1894986606);c=md5ii(c,d,a,b,x[i+10],15,-1051523);b=md5ii(b,c,d,a,x[i+1],21,-2054922799)
    a = md5ii(a,b,c,d,x[i+8],6,1873313359);d=md5ii(d,a,b,c,x[i+15],10,-30611744);c=md5ii(c,d,a,b,x[i+6],15,-1560198380);b=md5ii(b,c,d,a,x[i+13],21,1309151649)
    a = md5ii(a,b,c,d,x[i+4],6,-145523070);d=md5ii(d,a,b,c,x[i+11],10,-1120210379);c=md5ii(c,d,a,b,x[i+2],15,718787259);b=md5ii(b,c,d,a,x[i+9],21,-343485551)
    a=safeAdd(a,oa);b=safeAdd(b,ob);c=safeAdd(c,oc);d=safeAdd(d,od)
  }
  return [a,b,c,d].map(n => { const h = (n >>> 0).toString(16); return ('00000000' + h).slice(-8).match(/../g)!.map(b => b[1]+b[0]).join('') }).join('')
}

function gravatarUrl(email: string, size = 40): string {
  const hash = md5(email.trim().toLowerCase())
  return `https://www.gravatar.com/avatar/${hash}?s=${size}&d=identicon`
}

// ── Theme color variables ────────────────────────────────────

const textPrimary = 'var(--color-fg)'
const textMuted = 'var(--color-fg-muted)'
const textDim = 'var(--color-fg-dim)'
const borderColor = 'var(--color-border)'
const pageBg = 'var(--color-bg)'
const btnBg = 'var(--color-bg-alt)'
const btnColor = 'var(--color-fg-muted)'
const notifBg = 'var(--color-bg-contrast)'
const notifBorder = 'var(--color-border)'
const dropdownUserBorder = 'var(--color-border)'
const userEmailColor = 'var(--color-fg-dim)'
const unreadDotBorder = 'var(--color-bg)'

// ── Component ────────────────────────────────────────────────

export function AppHeader({
  user,
  team,
  notifications,
  onSearch,
  onNotificationRead,
  onMarkAllRead,
  onLogout,
  tunnelStatus,
  tunnelStatusColor,
  workspaces = [],
  activeWorkspaceId,
  onWorkspaceSwitch,
}: AppHeaderProps) {
  const [notifOpen, setNotifOpen] = useState(false)
  const [wsOpen, setWsOpen] = useState(false)
  const notifRef = useRef<HTMLDivElement>(null)
  const wsRef = useRef<HTMLDivElement>(null)

  // Close workspace dropdown on outside click
  useEffect(() => {
    if (!wsOpen) return
    const handler = (e: MouseEvent) => {
      if (wsRef.current && !wsRef.current.contains(e.target as Node)) setWsOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [wsOpen])

  const activeWorkspace = workspaces.find(w => w.id === activeWorkspaceId)

  // Derive user initials
  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : '?'

  // Unread count
  const unreadCount = notifications.filter(n => !n.read).length

  // Detect platform for shortcut display
  const [isMac, setIsMac] = useState(true)
  useEffect(() => {
    setIsMac(typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform))
  }, [])

  // Close notification dropdown on outside click
  useEffect(() => {
    if (!notifOpen) return
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [notifOpen])

  // Register CMD+K keyboard shortcut
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        onSearch()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onSearch])

  // Avatar image source
  const avatarSrc = user?.avatar_url || (user?.email ? gravatarUrl(user.email, 56) : undefined)
  const avatarLargeSrc = user?.avatar_url || (user?.email ? gravatarUrl(user.email, 72) : undefined)

  // Admin check based on team name convention (consumer checks canViewAdmin)
  const isAdmin = team?.name?.toLowerCase() === 'admin'

  return (
    <header style={{
      height: 56,
      flexShrink: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 20px',
      borderBottom: `1px solid ${borderColor}`,
      background: pageBg,
      position: 'sticky',
      top: 0,
      zIndex: 20,
    }}>
      {/* Left: workspace switcher */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
        {onWorkspaceSwitch && (
          <div ref={wsRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setWsOpen(v => !v)}
              type="button"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '5px 10px',
                borderRadius: 7,
                border: `1px solid ${borderColor}`,
                background: btnBg,
                cursor: 'pointer',
                fontSize: 12,
                color: textMuted,
                maxWidth: 180,
                transition: 'border-color 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--color-fg-dim)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = borderColor)}
            >
              <i className="bx bx-layers" style={{ fontSize: 13, flexShrink: 0 }} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                {activeWorkspace?.name ?? 'Default Workspace'}
              </span>
              <i className="bx bx-chevron-down" style={{
                fontSize: 13, flexShrink: 0,
                transition: 'transform 0.15s',
                transform: wsOpen ? 'rotate(180deg)' : 'none',
              }} />
            </button>

            {wsOpen && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                minWidth: 180,
                zIndex: 100,
                marginTop: 4,
                background: 'var(--color-bg-alt)',
                border: `1px solid ${borderColor}`,
                borderRadius: 9,
                padding: 4,
                boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
              }}>
                {workspaces.length === 0 ? (
                  <div style={{
                    padding: '6px 8px', fontSize: 12,
                    color: textDim, display: 'flex', alignItems: 'center', gap: 7,
                  }}>
                    <i className="bx bx-check" style={{ fontSize: 13, color: '#00e5ff', flexShrink: 0 }} />
                    Default Workspace
                  </div>
                ) : workspaces.map(w => (
                  <button
                    key={w.id}
                    onClick={() => { onWorkspaceSwitch(w.id); setWsOpen(false) }}
                    type="button"
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: 7,
                      padding: '6px 8px', border: 'none', borderRadius: 6,
                      background: w.id === activeWorkspaceId ? 'var(--color-bg-active)' : 'transparent',
                      color: textPrimary,
                      fontSize: 12, cursor: 'pointer', textAlign: 'left',
                      transition: 'background 0.1s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-bg-hover, rgba(255,255,255,0.06))')}
                    onMouseLeave={e => (e.currentTarget.style.background = w.id === activeWorkspaceId ? 'var(--color-bg-active)' : 'transparent')}
                  >
                    <i className="bx bx-layers" style={{ fontSize: 13, color: textDim, flexShrink: 0 }} />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                      {w.name}
                    </span>
                    {w.id === activeWorkspaceId && (
                      <i className="bx bx-check" style={{ fontSize: 13, color: '#00e5ff', marginLeft: 'auto', flexShrink: 0 }} />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Center: search trigger */}
      <button
        onClick={onSearch}
        title={`Search (${isMac ? '\u2318' : 'Ctrl'}+K)`}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '6px 14px',
          borderRadius: 8,
          border: `1px solid ${borderColor}`,
          background: btnBg,
          cursor: 'pointer',
          color: textMuted,
          fontSize: 13,
          minWidth: 220,
          transition: 'border-color 0.15s',
        }}
        onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--color-fg-dim)')}
        onMouseLeave={e => (e.currentTarget.style.borderColor = borderColor)}
      >
        <i className="bx bx-search" style={{ fontSize: 15, flexShrink: 0 }} />
        <span style={{ flex: 1, textAlign: 'start', opacity: 0.6, fontWeight: 400 }}>Search...</span>
        <kbd style={{
          fontSize: 10,
          fontWeight: 600,
          padding: '2px 6px',
          borderRadius: 4,
          border: `1px solid ${borderColor}`,
          background: pageBg,
          color: textDim,
          fontFamily: 'inherit',
          lineHeight: 1.3,
        }}>
          {isMac ? '\u2318K' : 'Ctrl+K'}
        </kbd>
      </button>

      {/* Right: tunnel dot, notifications, language, theme, profile */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>

        {/* Tunnel status dot */}
        <div
          title={`Tunnel: ${tunnelStatus}`}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '4px 10px',
            borderRadius: 6,
            border: `1px solid ${borderColor}`,
            background: btnBg,
            fontSize: 11,
            color: textMuted,
            cursor: 'default',
          }}
        >
          <span style={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            background: tunnelStatusColor,
            flexShrink: 0,
          }} />
          <span style={{ textTransform: 'capitalize' }}>{tunnelStatus}</span>
        </div>

        {/* Notification bell */}
        <div ref={notifRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setNotifOpen(v => !v)}
            title="Notifications"
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: btnColor,
              border: `1px solid ${borderColor}`,
              background: btnBg,
              cursor: 'pointer',
              position: 'relative',
            }}
          >
            <i className="bx bx-bell" style={{ fontSize: 16 }} />
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute',
                top: 4,
                right: 4,
                minWidth: 14,
                height: 14,
                borderRadius: 7,
                background: '#00e5ff',
                border: `1.5px solid ${unreadDotBorder}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 8,
                fontWeight: 700,
                color: '#000',
                padding: '0 3px',
                lineHeight: 1,
              }}>
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notification dropdown */}
          {notifOpen && (
            <div style={{
              position: 'absolute',
              top: 40,
              right: 0,
              width: 340,
              background: notifBg,
              border: `1px solid ${notifBorder}`,
              borderRadius: 12,
              boxShadow: 'var(--color-shadow-md)',
              zIndex: 100,
              overflow: 'hidden',
            }}>
              {/* Header */}
              <div style={{
                padding: '12px 16px',
                borderBottom: `1px solid ${notifBorder}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: textPrimary }}>
                  Notifications
                  {unreadCount > 0 && (
                    <span style={{
                      marginInlineStart: 8,
                      fontSize: 10,
                      padding: '1px 6px',
                      borderRadius: 100,
                      background: 'rgba(0,229,255,0.15)',
                      color: '#00e5ff',
                      fontWeight: 700,
                    }}>
                      {unreadCount}
                    </span>
                  )}
                </span>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <Link
                    href="/notifications"
                    onClick={() => setNotifOpen(false)}
                    style={{ fontSize: 11, color: '#00e5ff', textDecoration: 'none' }}
                  >
                    View all
                  </Link>
                  <button
                    onClick={() => setNotifOpen(false)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: textMuted,
                      cursor: 'pointer',
                      fontSize: 16,
                      display: 'flex',
                    }}
                  >
                    <i className="bx bx-x" />
                  </button>
                </div>
              </div>

              {/* Notification list */}
              {notifications.length === 0 ? (
                <div style={{ padding: '24px 16px', textAlign: 'center', fontSize: 12.5, color: textDim }}>
                  No notifications yet
                </div>
              ) : (
                notifications.slice(0, 5).map(n => {
                  const meta = NOTIF_TYPE_META[n.type] ?? NOTIF_TYPE_META['info']
                  return (
                    <div
                      key={n.id}
                      onClick={() => { if (!n.read) onNotificationRead(n.id) }}
                      style={{
                        padding: '12px 16px',
                        borderBottom: `1px solid ${notifBorder}`,
                        display: 'flex',
                        gap: 10,
                        cursor: !n.read ? 'pointer' : 'default',
                        background: !n.read ? 'rgba(0,229,255,0.03)' : 'transparent',
                      }}
                    >
                      <div style={{
                        width: 30,
                        height: 30,
                        borderRadius: 8,
                        background: `${meta.color}14`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        marginTop: 1,
                      }}>
                        <i className={`bx ${meta.icon}`} style={{ fontSize: 14, color: meta.color }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontSize: 12.5,
                          fontWeight: !n.read ? 600 : 500,
                          color: textPrimary,
                          marginBottom: 2,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}>
                          {n.title}
                        </div>
                        <div style={{
                          fontSize: 11.5,
                          color: textDim,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}>
                          {n.message}
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
                        <span style={{ fontSize: 10.5, color: textDim }}>{notifTimeAgo(n.created_at)}</span>
                        {!n.read && <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#00e5ff' }} />}
                      </div>
                    </div>
                  )
                })
              )}

              {/* Mark all as read */}
              {unreadCount > 0 && (
                <div style={{ padding: '10px 16px', textAlign: 'center' }}>
                  <button
                    onClick={onMarkAllRead}
                    style={{
                      fontSize: 12,
                      color: '#00e5ff',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    Mark all as read
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Language switcher */}
        <LanguageSwitcher size={32} urlBased={false} />

        {/* Theme toggle */}
        <ThemeToggle size={32} />

        {/* Profile dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button style={{
              display: 'flex',
              alignItems: 'center',
              padding: '2px',
              borderRadius: 50,
              border: '2px solid rgba(169,0,255,0.25)',
              background: 'transparent',
              cursor: 'pointer',
            }}>
              <Avatar style={{ width: 28, height: 28 }}>
                <AvatarImage src={avatarSrc} alt={initials} />
                <AvatarFallback style={{ fontSize: 10, fontWeight: 700 }}>{initials}</AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" sideOffset={8} style={{
            width: 220,
            background: notifBg,
            border: `1px solid ${notifBorder}`,
            boxShadow: 'var(--color-shadow-lg)',
          }}>
            {/* User info section */}
            <div style={{
              padding: '10px 12px 8px',
              borderBottom: `1px solid ${dropdownUserBorder}`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Avatar style={{ width: 36, height: 36, flexShrink: 0 }}>
                  <AvatarImage src={avatarLargeSrc} alt={initials} />
                  <AvatarFallback style={{ fontSize: 13, fontWeight: 700 }}>{initials}</AvatarFallback>
                </Avatar>
                <div style={{ overflow: 'hidden' }}>
                  <div style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: textPrimary,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                    {user?.name ?? 'User'}
                  </div>
                  <div style={{
                    fontSize: 11,
                    color: userEmailColor,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                    {user?.email ?? ''}
                  </div>
                  {team && (
                    <div style={{
                      fontSize: 10,
                      marginTop: 3,
                      padding: '1px 6px',
                      borderRadius: 4,
                      background: 'rgba(169,0,255,0.1)',
                      color: '#a900ff',
                      border: '1px solid rgba(169,0,255,0.2)',
                      display: 'inline-block',
                      fontWeight: 600,
                      letterSpacing: '0.02em',
                    }}>
                      {team.name}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Menu items */}
            <DropdownMenuItem
              onClick={() => {
                const handle = user?.username || (user?.settings?.handle as string)
                window.location.href = handle ? `/@${handle}` : '/dashboard'
              }}
              style={{ color: textPrimary }}
            >
              <i className="bx bx-user" style={{ fontSize: 15 }} />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                const handle = user?.username || (user?.settings?.handle as string)
                window.location.href = handle ? `/@${handle}/settings` : '/settings'
              }}
              style={{ color: textPrimary }}
            >
              <i className="bx bx-cog" style={{ fontSize: 15 }} />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onLogout} style={{ color: '#ff6b6b' }}>
              <i className="bx bx-log-out" style={{ fontSize: 15 }} />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
