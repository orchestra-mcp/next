'use client'
import { useEffect, useState, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useAuthStore } from '@/store/auth'
import { useRoleStore, ROLE_LABELS, type Team } from '@/store/roles'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { ThemeToggle } from '@/components/ui/theme-provider'
import { useThemeStore } from '@/store/theme'
import { useRealtimeSync } from '@/hooks/useRealtimeSync'
import { usePreferencesStore } from '@/store/preferences'

// Simple MD5 for Gravatar URLs (no external dep)
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

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: 'bx-home-alt-2' },
  { href: '/projects', label: 'Projects', icon: 'bx-folder' },
  { href: '/notes', label: 'Notes', icon: 'bx-note' },
]

const adminItems = [
  { href: '/admin', label: 'Overview', icon: 'bx-shield-alt-2', exact: true },
  { href: '/admin/users', label: 'Users', icon: 'bx-group' },
  { href: '/admin/roles', label: 'Roles & Perms', icon: 'bx-key' },
  { href: '/admin/teams', label: 'Teams', icon: 'bx-buildings' },
  { href: '/admin/pages', label: 'Pages', icon: 'bx-file' },
  { href: '/admin/posts', label: 'Posts', icon: 'bx-news' },
  { href: '/admin/marketplace', label: 'Marketplace', icon: 'bx-store' },
  { href: '/admin/docs', label: 'Docs', icon: 'bx-book-open' },
  { href: '/admin/categories', label: 'Categories', icon: 'bx-tag' },
  { href: '/admin/contact', label: 'Contact', icon: 'bx-envelope' },
  { href: '/admin/issues', label: 'Issues', icon: 'bx-bug' },
  { href: '/admin/notifications', label: 'Notifications', icon: 'bx-bell' },
]

function getPageTitle(pathname: string): string {
  if (pathname === '/dashboard') return 'Dashboard'
  if (pathname.startsWith('/projects/') && pathname !== '/projects') return 'Project Detail'
  if (pathname === '/projects') return 'Projects'
  if (pathname === '/notes') return 'Notes'
  if (pathname === '/settings') return 'Settings'
  if (pathname === '/subscription') return 'Subscription'
  if (pathname === '/notifications') return 'Notifications'
  if (pathname.startsWith('/admin')) return 'Admin'
  if (pathname.startsWith('/team')) return 'Team'
  return 'Orchestra'
}

// Workspace switcher: Personal + Teams with team nav links (Linear style)
function WorkspaceSwitcher({
  user, team, teams, isDark, textPrimary, textMuted, borderColor, onSwitchTeam,
}: {
  user: { name: string; email: string } | null
  team: Team | null
  teams: Team[]
  isDark: boolean
  textPrimary: string
  textMuted: string
  borderColor: string
  onSwitchTeam: (teamId: string) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Active label: show team name if on a team page, else user name
  const activeLabel = team ? team.name : (user?.name ?? 'Personal')

  const dropBg = isDark ? '#1a1520' : '#ffffff'
  const dropBorder = isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.1)'
  const hoverBg = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'
  const sectionLabel = isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.3)'

  return (
    <div ref={ref}>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          display: 'flex', alignItems: 'center', gap: 8, width: '100%',
          padding: '10px 14px', borderBottom: `1px solid ${borderColor}`,
          background: 'transparent', border: 'none', borderTop: 'none', borderLeft: 'none', borderRight: 'none',
          cursor: 'pointer',
        }}
      >
        <div style={{
          width: 26, height: 26, borderRadius: 7, flexShrink: 0,
          background: team ? 'rgba(169,0,255,0.12)' : 'linear-gradient(135deg, #00e5ff22, #a900ff22)',
          border: team ? '1px solid rgba(169,0,255,0.25)' : '1px solid rgba(169,0,255,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 12, fontWeight: 800, color: '#a900ff',
        }}>
          {team ? (team.name?.[0]?.toUpperCase() ?? '?') : <Image src="/logo.svg" alt="Orchestra" width={16} height={16} />}
        </div>
        <div style={{ flex: 1, textAlign: 'left', overflow: 'hidden' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: textPrimary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{activeLabel}</div>
          <div style={{ fontSize: 10, color: textMuted, marginTop: 1 }}>Orchestra</div>
        </div>
        <div style={{ padding: '2px 6px', borderRadius: 4, background: 'rgba(0,229,255,0.08)', border: '1px solid rgba(0,229,255,0.15)', fontSize: 9, fontWeight: 700, color: '#00e5ff', letterSpacing: '0.05em', flexShrink: 0 }}>BETA</div>
        <i className="bx bx-chevron-down" style={{ fontSize: 14, color: textMuted, flexShrink: 0, marginLeft: 2, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
      </button>

      {/* Workspace picker dropdown */}
      {open && (
        <div style={{
          position: 'absolute', top: 58, left: 8, right: 8, zIndex: 9999,
          background: dropBg, border: `1px solid ${dropBorder}`, borderRadius: 10,
          boxShadow: isDark ? '0 12px 32px rgba(0,0,0,0.5)' : '0 8px 24px rgba(0,0,0,0.14)',
          padding: '6px 0', marginTop: 4,
        }}>
          {/* Personal workspace */}
          <div style={{ padding: '6px 10px 4px', fontSize: 10, fontWeight: 600, color: sectionLabel, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Workspaces</div>
          <button
            onClick={() => { onSwitchTeam('personal'); setOpen(false) }}
            style={{ display: 'flex', alignItems: 'center', gap: 8, width: 'calc(100% - 8px)', padding: '7px 10px', background: 'transparent', border: 'none', cursor: 'pointer', borderRadius: 6, margin: '0 4px' }}
            onMouseEnter={e => (e.currentTarget.style.background = hoverBg)}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <div style={{ width: 20, height: 20, borderRadius: 5, background: 'rgba(0,229,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <i className="bx bx-user" style={{ fontSize: 11, color: '#00e5ff' }} />
            </div>
            <span style={{ fontSize: 13, color: textPrimary, flex: 1, textAlign: 'left' }}>{user?.name ?? 'Personal'}</span>
            {!team && <i className="bx bx-check" style={{ fontSize: 14, color: '#00e5ff' }} />}
          </button>

          {/* Teams */}
          {teams.length > 0 && (
            <>
              <div style={{ height: 1, background: dropBorder, margin: '6px 0' }} />
              <div style={{ padding: '4px 10px 4px', fontSize: 10, fontWeight: 600, color: sectionLabel, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Teams</div>
              {teams.filter(t => t?.id).map((t, i) => (
                <button
                  key={t.id ?? i}
                  onClick={() => { onSwitchTeam(t.id); setOpen(false) }}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, width: 'calc(100% - 8px)', padding: '7px 10px', background: 'transparent', border: 'none', cursor: 'pointer', borderRadius: 6, margin: '0 4px' }}
                  onMouseEnter={e => (e.currentTarget.style.background = hoverBg)}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <div style={{ width: 20, height: 20, borderRadius: 5, background: 'rgba(169,0,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: '#a900ff', flexShrink: 0 }}>
                    {t.name?.[0]?.toUpperCase() ?? '?'}
                  </div>
                  <div style={{ flex: 1, textAlign: 'left' }}>
                    <div style={{ fontSize: 13, color: textPrimary }}>{t.name}</div>
                    <div style={{ fontSize: 10, color: textMuted }}>{t.plan} · {t.member_count} member{t.member_count !== 1 ? 's' : ''}</div>
                  </div>
                  {team?.id === t.id && <i className="bx bx-check" style={{ fontSize: 14, color: '#a900ff' }} />}
                </button>
              ))}
            </>
          )}

          {/* Team settings — shown when a team is active */}
          {team && (
            <>
              <div style={{ height: 1, background: dropBorder, margin: '6px 0' }} />
              <button
                onClick={() => { setOpen(false); router.push('/team') }}
                style={{ display: 'flex', alignItems: 'center', gap: 8, width: 'calc(100% - 8px)', padding: '7px 10px', background: 'transparent', border: 'none', cursor: 'pointer', borderRadius: 6, margin: '0 4px' }}
                onMouseEnter={e => (e.currentTarget.style.background = hoverBg)}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <div style={{ width: 20, height: 20, borderRadius: 5, background: 'rgba(169,0,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <i className="bx bx-cog" style={{ fontSize: 12, color: '#a900ff' }} />
                </div>
                <span style={{ fontSize: 13, color: textPrimary }}>Team Settings</span>
              </button>
            </>
          )}

          {/* Create team */}
          <div style={{ height: 1, background: dropBorder, margin: '6px 0' }} />
          <button
            onClick={() => { setOpen(false); router.push('/team/new') }}
            style={{ display: 'flex', alignItems: 'center', gap: 8, width: 'calc(100% - 8px)', padding: '7px 10px', background: 'transparent', border: 'none', cursor: 'pointer', borderRadius: 6, margin: '0 4px' }}
            onMouseEnter={e => (e.currentTarget.style.background = hoverBg)}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <div style={{ width: 20, height: 20, borderRadius: 5, background: 'rgba(128,128,128,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <i className="bx bx-plus" style={{ fontSize: 13, color: textMuted }} />
            </div>
            <span style={{ fontSize: 13, color: textMuted }}>Create Team</span>
          </button>
        </div>
      )}
    </div>
  )
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { token, user, logout, fetchMe, impersonating, exitImpersonation } = useAuthStore()
  const { can, currentRole, fetchMyRole, team, teams, fetchTeam, fetchAllTeams, switchTeam } = useRoleStore()
  const [notifOpen, setNotifOpen] = useState(false)
  const { theme } = useThemeStore()
  const { fetchPreferences, preferences, updatePreference } = usePreferencesStore()
  const sidebarCollapsed = preferences.sidebar_collapsed

  useEffect(() => {
    if (!token) { router.push('/login'); return }
    if (!user) fetchMe()
    fetchMyRole()
    fetchTeam()
    fetchAllTeams()
    fetchPreferences()
    // Redirect new users to onboarding (only once, after first registration)
    if (typeof window !== 'undefined' && pathname !== '/onboarding') {
      const done = localStorage.getItem('orchestra_onboarding_done')
      const isNew = localStorage.getItem('orchestra_is_new_user')
      if (!done && isNew === '1') {
        router.push('/onboarding')
      }
    }
  }, [token, user, router, fetchMe])

  const { status: wsStatus } = useRealtimeSync()

  if (!token) return null

  // Onboarding has its own full-page layout — skip the sidebar shell
  if (pathname === '/onboarding') return <>{children}</>

  const initials = user?.name?.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase() ?? 'U'

  const isDark = theme === 'dark'
  const textPrimary = isDark ? '#f8f8f8' : '#0f0f12'
  const textMuted = isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)'
  const textDim = isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.3)'
  const pageBg = isDark ? '#0f0f12' : '#f5f5f7'
  const sidebarBg = isDark ? '#131118' : '#ffffff'
  const borderColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)'
  const navActiveBg = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)'
  const navInactiveColor = isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)'
  const notifBg = isDark ? '#1a1520' : '#ffffff'
  const notifBorder = isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.1)'
  const notifItemBorder = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.05)'
  const notifDescColor = isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.45)'
  const notifTimeColor = isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.3)'
  const btnBellBg = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.04)'
  const btnBellColor = isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)'
  const dividerColor = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)'
  const notifCloseColor = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)'
  const dropdownUserBorder = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.07)'
  const userEmailColor = isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.4)'
  const unreadDotBorder = isDark ? '#0f0f12' : '#f5f5f7'
  const allTeams = teams.length > 0 ? teams : (team ? [team] : [])

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: pageBg, flexDirection: 'column' }}>
      {/* Impersonation banner */}
      {impersonating && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999,
          background: 'linear-gradient(90deg, #f59e0b, #d97706)',
          padding: '8px 20px', display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <i className="bx bx-user-check" style={{ fontSize: 15, color: '#fff' }} />
          <span style={{ fontSize: 13, fontWeight: 500, color: '#fff', flex: 1 }}>
            Impersonating <strong>{impersonating.name}</strong> ({impersonating.email})
          </span>
          <button
            onClick={() => exitImpersonation()}
            style={{ background: 'rgba(255,255,255,0.25)', border: '1px solid rgba(255,255,255,0.4)', borderRadius: 6, padding: '3px 10px', fontSize: 12, fontWeight: 600, color: '#fff', cursor: 'pointer' }}
          >
            Exit Impersonation
          </button>
        </div>
      )}

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', marginTop: impersonating ? 37 : 0 }}>
        {/* Sidebar */}
        <aside style={{
          width: sidebarCollapsed ? 56 : 240, flexShrink: 0, display: 'flex', flexDirection: 'column',
          background: sidebarBg, borderRight: `1px solid ${borderColor}`,
          position: 'fixed', top: impersonating ? 37 : 0, left: 0, bottom: 0, zIndex: 20,
          overflowY: 'auto', transition: 'width 0.2s ease',
        }}>
          {/* Workspace switcher (replaces static logo) */}
          {sidebarCollapsed ? (
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '12px 0', borderBottom: `1px solid ${borderColor}`,
            }}>
              <Image src="/logo.svg" alt="Orchestra" width={22} height={22} />
            </div>
          ) : (
            <WorkspaceSwitcher
              user={user}
              team={team}
              teams={allTeams}
              isDark={isDark}
              textPrimary={textPrimary}
              textMuted={textMuted}
              borderColor={borderColor}
              onSwitchTeam={(id) => {
                if (id === 'personal') switchTeam('')
                else switchTeam(id)
              }}
            />
          )}

          {/* Nav */}
          <nav style={{ flex: 1, padding: sidebarCollapsed ? '10px 6px' : '10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
            {!sidebarCollapsed && <div style={{ fontSize: 10, fontWeight: 600, color: textDim, letterSpacing: '0.07em', textTransform: 'uppercase', padding: '8px 8px 4px' }}>Workspace</div>}
            {navItems.map((item) => {
              const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href + '/'))
              return (
                <Link key={item.href} href={item.href} title={sidebarCollapsed ? item.label : undefined} style={{
                  display: 'flex', alignItems: 'center', gap: 9,
                  padding: sidebarCollapsed ? '7px 0' : '7px 10px',
                  justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                  borderRadius: 7, textDecoration: 'none',
                  fontSize: 13.5, fontWeight: active ? 500 : 400,
                  color: active ? textPrimary : navInactiveColor,
                  background: active ? navActiveBg : 'transparent',
                }}>
                  <i className={`bx ${item.icon}`} style={{ fontSize: sidebarCollapsed ? 18 : 16, width: 18, textAlign: 'center', opacity: active ? 1 : 0.5 }} />
                  {!sidebarCollapsed && item.label}
                </Link>
              )
            })}
            {/* Admin section — admin only (13 items) */}
            {can('canViewAdmin') && (
              <>
                {!sidebarCollapsed && <div style={{ fontSize: 10, fontWeight: 600, color: textDim, letterSpacing: '0.07em', textTransform: 'uppercase', padding: '16px 8px 4px' }}>Administration</div>}
                {sidebarCollapsed && <div style={{ height: 1, background: borderColor, margin: '8px 4px' }} />}
                {adminItems.map(item => {
                  const active = item.exact ? pathname === item.href : (pathname === item.href || pathname.startsWith(item.href + '/'))
                  return (
                    <Link key={item.href} href={item.href} title={sidebarCollapsed ? item.label : undefined} style={{
                      display: 'flex', alignItems: 'center', gap: 9,
                      padding: sidebarCollapsed ? '7px 0' : '7px 10px',
                      justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                      borderRadius: 7, textDecoration: 'none',
                      fontSize: 13.5, fontWeight: active ? 500 : 400,
                      color: active ? textPrimary : navInactiveColor,
                      background: active ? navActiveBg : 'transparent',
                    }}>
                      <i className={`bx ${item.icon}`} style={{ fontSize: sidebarCollapsed ? 18 : 16, width: 18, textAlign: 'center', opacity: active ? 1 : 0.5 }} />
                      {!sidebarCollapsed && item.label}
                    </Link>
                  )
                })}
              </>
            )}

            {!sidebarCollapsed && <div style={{ fontSize: 10, fontWeight: 600, color: textDim, letterSpacing: '0.07em', textTransform: 'uppercase', padding: '16px 8px 4px' }}>Quick Links</div>}
            {sidebarCollapsed && <div style={{ height: 1, background: borderColor, margin: '8px 4px' }} />}
            {[
              { href: '/docs', label: 'Documentation', icon: 'bx-book-open' },
              { href: 'https://github.com/orchestra-mcp', label: 'GitHub', icon: 'bxl-github', external: true },
            ].map(item => (
              <a key={item.href} href={item.href} target={item.external ? '_blank' : undefined} rel={item.external ? 'noopener' : undefined} title={sidebarCollapsed ? item.label : undefined} style={{
                display: 'flex', alignItems: 'center', gap: 9,
                padding: sidebarCollapsed ? '7px 0' : '7px 10px',
                justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                borderRadius: 7, textDecoration: 'none',
                fontSize: 13.5, color: textDim,
              }}>
                <i className={`bx ${item.icon}`} style={{ fontSize: sidebarCollapsed ? 18 : 16, width: 18, textAlign: 'center', opacity: 0.5 }} />
                {!sidebarCollapsed && item.label}
              </a>
            ))}
          </nav>

          {/* Sidebar collapse toggle */}
          <button
            onClick={() => updatePreference('sidebar_collapsed', !sidebarCollapsed)}
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
              gap: 9, padding: sidebarCollapsed ? '10px 0' : '10px 14px',
              margin: sidebarCollapsed ? '0 6px 8px' : '0 10px 8px',
              borderRadius: 7, border: 'none', background: 'transparent',
              cursor: 'pointer', color: textMuted, fontSize: 13,
              borderTop: `1px solid ${borderColor}`,
            }}
          >
            <i className={`bx ${sidebarCollapsed ? 'bx-chevrons-right' : 'bx-chevrons-left'}`} style={{ fontSize: 16, width: 18, textAlign: 'center' }} />
            {!sidebarCollapsed && <span>Collapse</span>}
          </button>
        </aside>

        {/* Right side */}
        <div style={{ marginLeft: sidebarCollapsed ? 56 : 240, flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', transition: 'margin-left 0.2s ease' }}>
          {/* Top header */}
          <header style={{
            height: 52, flexShrink: 0, display: 'flex', alignItems: 'center',
            padding: '0 20px 0 24px', borderBottom: `1px solid ${borderColor}`,
            background: pageBg, gap: 8,
          }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: textPrimary }}>{getPageTitle(pathname)}</span>
            {wsStatus !== 'disconnected' && (
              <span
                title={wsStatus === 'connected' ? 'Realtime connected' : 'Connecting...'}
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: wsStatus === 'connected' ? '#22c55e' : '#f59e0b',
                  opacity: 0.6,
                  flexShrink: 0,
                }}
              />
            )}
            <div style={{ flex: 1 }} />

            {/* Notification bell */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setNotifOpen(v => !v)}
                style={{ width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: btnBellColor, border: `1px solid ${borderColor}`, background: btnBellBg, cursor: 'pointer', position: 'relative' }}
              >
                <i className="bx bx-bell" style={{ fontSize: 16 }} />
                <span style={{ position: 'absolute', top: 6, right: 6, width: 6, height: 6, borderRadius: '50%', background: '#00e5ff', border: `1.5px solid ${unreadDotBorder}` }} />
              </button>
              {notifOpen && (
                <div style={{
                  position: 'absolute', top: 40, right: 0, width: 300,
                  background: notifBg, border: `1px solid ${notifBorder}`, borderRadius: 12,
                  boxShadow: isDark ? '0 12px 32px rgba(0,0,0,0.4)' : '0 8px 24px rgba(0,0,0,0.12)', zIndex: 100, overflow: 'hidden',
                }}>
                  <div style={{ padding: '12px 16px', borderBottom: `1px solid ${notifBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: textPrimary }}>Notifications</span>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <Link href="/notifications" onClick={() => setNotifOpen(false)} style={{ fontSize: 11, color: '#00e5ff', textDecoration: 'none' }}>View all</Link>
                      <button onClick={() => setNotifOpen(false)} style={{ background: 'none', border: 'none', color: notifCloseColor, cursor: 'pointer', fontSize: 16, display: 'flex' }}>
                        <i className="bx bx-x" />
                      </button>
                    </div>
                  </div>
                  {[
                    { icon: 'bx-git-branch', color: '#00e5ff', title: 'New feature advanced', desc: 'FEAT-EUM moved to in-review', time: '2m ago' },
                    { icon: 'bx-bolt', color: '#a900ff', title: 'Tool executed', desc: 'run_agent completed in 4.1s', time: '8m ago' },
                    { icon: 'bx-package', color: '#22c55e', title: 'Pack installed', desc: 'orchestra-go-backend installed', time: '1h ago' },
                  ].map((n, i) => (
                    <div key={i} style={{ padding: '12px 16px', borderBottom: `1px solid ${notifItemBorder}`, display: 'flex', gap: 10 }}>
                      <div style={{ width: 30, height: 30, borderRadius: 8, background: `${n.color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                        <i className={`bx ${n.icon}`} style={{ fontSize: 14, color: n.color }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12.5, fontWeight: 500, color: textPrimary, marginBottom: 2 }}>{n.title}</div>
                        <div style={{ fontSize: 11.5, color: notifDescColor }}>{n.desc}</div>
                      </div>
                      <span style={{ fontSize: 10.5, color: notifTimeColor, flexShrink: 0 }}>{n.time}</span>
                    </div>
                  ))}
                  <div style={{ padding: '10px 16px', textAlign: 'center' }}>
                    <button style={{ fontSize: 12, color: '#00e5ff', background: 'none', border: 'none', cursor: 'pointer' }}>Mark all as read</button>
                  </div>
                </div>
              )}
            </div>

            {/* Theme toggle */}
            <ThemeToggle size={32} />

            <div style={{ width: 1, height: 20, background: dividerColor, margin: '0 2px' }} />

            {/* User dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button style={{ display: 'flex', alignItems: 'center', padding: '3px', borderRadius: 50, border: '2px solid rgba(169,0,255,0.25)', background: 'transparent', cursor: 'pointer' }}>
                  <Avatar style={{ width: 26, height: 26 }}>
                    {user?.email && <AvatarImage src={gravatarUrl(user.email, 52)} alt={initials} />}
                    <AvatarFallback style={{ fontSize: 10, fontWeight: 700 }}>{initials}</AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" style={{
                width: 220,
                background: notifBg,
                border: `1px solid ${notifBorder}`,
                boxShadow: isDark ? '0 12px 40px rgba(0,0,0,0.5)' : '0 8px 24px rgba(0,0,0,0.12)',
              }}>
                <div style={{ padding: '10px 12px 8px', borderBottom: `1px solid ${dropdownUserBorder}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Avatar style={{ width: 36, height: 36, flexShrink: 0 }}>
                      {user?.email && <AvatarImage src={gravatarUrl(user.email, 72)} alt={initials} />}
                      <AvatarFallback style={{ fontSize: 13, fontWeight: 700 }}>{initials}</AvatarFallback>
                    </Avatar>
                    <div style={{ overflow: 'hidden' }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: textPrimary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name ?? 'User'}</div>
                      <div style={{ fontSize: 11, color: userEmailColor, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email ?? ''}</div>
                      <div style={{ fontSize: 10, marginTop: 3, padding: '1px 6px', borderRadius: 4, background: 'rgba(169,0,255,0.1)', color: '#a900ff', border: '1px solid rgba(169,0,255,0.2)', display: 'inline-block', fontWeight: 600, letterSpacing: '0.02em' }}>
                        {ROLE_LABELS[currentRole]}
                      </div>
                    </div>
                  </div>
                </div>
                <DropdownMenuItem onClick={() => router.push('/settings')} style={{ color: textPrimary }}>
                  <i className="bx bx-cog" style={{ marginRight: 8 }} /> Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/subscription')} style={{ color: textPrimary }}>
                  <i className="bx bx-credit-card" style={{ marginRight: 8 }} /> Subscription
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/notifications')} style={{ color: textPrimary }}>
                  <i className="bx bx-bell" style={{ marginRight: 8 }} /> Notifications
                </DropdownMenuItem>
                {team && (
                  <DropdownMenuItem onClick={() => router.push('/team')} style={{ color: textPrimary }}>
                    <i className="bx bx-group" style={{ marginRight: 8 }} /> Team
                  </DropdownMenuItem>
                )}
                {can('canViewAdmin') && (
                  <DropdownMenuItem onClick={() => router.push('/admin')} style={{ color: textPrimary }}>
                    <i className="bx bx-shield-alt-2" style={{ marginRight: 8 }} /> Admin Panel
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => { logout(); router.push('/login') }} style={{ color: '#ff6b6b' }}>
                  <i className="bx bx-log-out" style={{ marginRight: 8 }} /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </header>

          {/* Page content */}
          <main style={{ flex: 1, overflowY: 'auto' }}>
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
