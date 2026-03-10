'use client'
import { useEffect, useState, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useAuthStore } from '@/store/auth'
import { useRoleStore, ROLE_LABELS, type Team } from '@/store/roles'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { ThemeToggle } from '@/components/ui/theme-provider'
import { useThemeStore } from '@/store/theme'
import { useRealtimeSync, onNotifToast } from '@/hooks/useRealtimeSync'
import { usePreferencesStore } from '@/store/preferences'
import { useTunnelConnection, onTunnelToast } from '@/hooks/useTunnelConnection'
import { useTunnelStore } from '@/store/tunnels'
import { useMCP } from '@/hooks/useMCP'
import { Tooltip } from '@orchestra-mcp/ui'
import { SearchSpotlight } from '@orchestra-mcp/search'
import type { SearchResult } from '@orchestra-mcp/search'
import { useTranslations } from 'next-intl'
import { apiFetch, isDevSeed } from '@/lib/api'
import { SidebarListPanel } from '@/components/layout/sidebar-list-panel'
import type { SidebarProject, SidebarNote, SidebarPlan, SidebarDocFile, SidebarDevPlugin } from '@/components/layout/sidebar-list-panel'
import { useSidebarMetaStore } from '@/store/sidebar-meta'
import { CreateItemModal } from '@/components/layout/create-item-modal'
import type { CreateItemKind } from '@/components/layout/create-item-modal'
import { CopilotBubble } from '@/components/copilot/CopilotBubble'
import { useSettingsStore } from '@/store/settings'

const NOTIF_TYPE_META: Record<string, { icon: string; color: string }> = {
  info:    { icon: 'bx-info-circle',  color: '#00e5ff' },
  success: { icon: 'bx-check-circle', color: '#22c55e' },
  warning: { icon: 'bx-error',        color: '#f97316' },
  error:   { icon: 'bx-x-circle',     color: '#ef4444' },
}

function notifTimeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60_000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

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

function getPageTitle(pathname: string, t: (key: string) => string): string {
  if (pathname === '/dashboard') return t('pageTitle.dashboard')
  if (pathname === '/tunnels') return t('pageTitle.tunnels')
  if (pathname.startsWith('/projects/') && pathname !== '/projects') return t('pageTitle.projectDetail')
  if (pathname === '/projects') return t('pageTitle.projects')
  if (pathname === '/notes') return t('pageTitle.notes')
  if (pathname === '/plans') return t('pageTitle.plans')
  // Chat page removed — copilot bubble handles all AI chat
  if (pathname === '/wiki') return t('pageTitle.wiki')
  if (pathname === '/devtools') return t('pageTitle.devtools')
  if (pathname === '/settings') return t('pageTitle.settings')
  if (pathname === '/subscription') return t('pageTitle.subscription')
  if (pathname === '/notifications') return t('pageTitle.notifications')
  if (pathname.startsWith('/admin')) return t('pageTitle.admin')
  if (pathname.startsWith('/team')) return t('pageTitle.team')
  return 'Orchestra'
}

// ── MCP response parsers ─────────────────────────────────────
function parseMCPProjects(text: string): SidebarProject[] {
  const items: SidebarProject[] = []
  for (const line of text.split('\n')) {
    const m = line.match(/^-\s+\*\*(.+?)\*\*\s+\(`([^)]+)`\)(?:\s*[---]\s*(.+))?$/)
    if (m) items.push({ id: m[2].trim(), name: m[1].trim(), description: m[3]?.trim() })
  }
  return items
}

function parseMCPNotes(text: string): SidebarNote[] {
  const notes: SidebarNote[] = []
  const lines = text.split('\n')
  let headerCols: string[] = []
  for (const line of lines) {
    if (!line.startsWith('|') || line.includes('---')) continue
    const cells = line.split('|').map(c => c.trim()).filter(Boolean)
    if (cells.length < 2) continue
    if (cells[0].toLowerCase() === 'id') { headerCols = cells.map(c => c.toLowerCase()); continue }
    const row: Record<string, string> = {}
    cells.forEach((cell, i) => { row[headerCols[i] || `col${i}`] = cell })
    const id = row['id'] || cells[0], title = row['title'] || cells[1]
    if (!id || !title) continue
    const pinnedStr = row['pinned'] || ''
    const tagsStr = row['tags'] || ''
    const tags = tagsStr && tagsStr !== '\u2014' ? tagsStr.split(',').map(t => t.trim()).filter(Boolean) : []
    notes.push({ id, title, pinned: pinnedStr.toLowerCase() === 'true' || pinnedStr === 'yes', tags })
  }
  return notes
}

/** Extract just the body from a get_note MCP response (everything after the --- separator) */
function extractNoteBody(result: unknown): string {
  // MCPToolResult is { content: [{ type, text }] }
  const raw = result && typeof result === 'object' && 'content' in result
    ? ((result as { content: Array<{ text: string }> }).content?.[0]?.text ?? '')
    : typeof result === 'string' ? result : ''
  const idx = raw.indexOf('\n---\n')
  if (idx >= 0) {
    const body = raw.slice(idx + 5).trim()
    return body || ' '
  }
  return ' '
}

function parseMCPPlans(text: string): SidebarPlan[] {
  const plans: SidebarPlan[] = []
  const lines = text.split('\n')
  let headerCols: string[] = []
  for (const line of lines) {
    if (!line.startsWith('|') || line.includes('---')) continue
    const cells = line.split('|').map(c => c.trim()).filter(Boolean)
    if (cells.length < 2) continue
    if (cells[0].toLowerCase() === 'id') { headerCols = cells.map(c => c.toLowerCase()); continue }
    const row: Record<string, string> = {}
    cells.forEach((cell, i) => { row[headerCols[i] || `col${i}`] = cell })
    const id = row['id'] || cells[0], title = row['title'] || cells[1]
    const status = (row['status'] || cells[2] || 'draft').toLowerCase()
    const featureCount = parseInt(row['features'] || cells[3] || '0', 10) || 0
    if (!id) continue
    plans.push({ id, title, status, featureCount })
  }
  return plans
}

// Workspace switcher: Personal + Teams with team nav links (Linear style)
function WorkspaceSwitcher({
  user, team, teams, textPrimary, textMuted, borderColor, onSwitchTeam,
}: {
  user: { name: string; email: string } | null
  team: Team | null
  teams: Team[]
  textPrimary: string
  textMuted: string
  borderColor: string
  onSwitchTeam: (teamId: string) => void
}) {
  const t = useTranslations('sidebar')
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [dropPos, setDropPos] = useState<{ top: number; left: number; width: number }>({ top: 0, left: 0, width: 0 })
  const router = useRouter()

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node) && dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Calculate dropdown position from trigger button
  useEffect(() => {
    if (open && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      setDropPos({ top: rect.bottom + 4, left: rect.left, width: rect.width })
    }
  }, [open])

  // Active label: show team name if on a team page, else user name
  const activeLabel = team ? team.name : (user?.name ?? t('workspaces'))

  const dropBg = 'var(--color-bg-contrast)'
  const dropBorder = 'var(--color-border)'
  const hoverBg = 'var(--color-bg-active)'
  const sectionLabel = 'var(--color-fg-dim)'

  return (
    <div ref={ref}>
      {/* Trigger button */}
      <button
        ref={triggerRef}
        onClick={() => setOpen(v => !v)}
        style={{
          display: 'flex', alignItems: 'center', gap: 8, width: '100%',
          height: 52, padding: '0 14px', borderBottom: `1px solid ${borderColor}`,
          background: 'transparent', border: 'none', borderTop: 'none', borderInlineStart: 'none', borderInlineEnd: 'none',
          cursor: 'pointer',
        }}
      >
        <div style={{
          width: 26, height: 26, borderRadius: 7, flexShrink: 0,
          background: team?.avatar_url ? 'transparent' : (team ? 'rgba(169,0,255,0.12)' : 'linear-gradient(135deg, #00e5ff22, #a900ff22)'),
          border: team?.avatar_url ? 'none' : (team ? '1px solid rgba(169,0,255,0.25)' : '1px solid rgba(169,0,255,0.2)'),
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 12, fontWeight: 800, color: '#a900ff', overflow: 'hidden',
        }}>
          {team?.avatar_url ? (
            <img src={team.avatar_url} alt={team.name} style={{ width: 26, height: 26, borderRadius: 7, objectFit: 'cover' }} />
          ) : team ? (team.name?.[0]?.toUpperCase() ?? '?') : <Image src="/logo.svg" alt="Orchestra" width={16} height={16} />}
        </div>
        <div style={{ flex: 1, textAlign: 'start', overflow: 'hidden' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: textPrimary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{activeLabel}</div>
          <div style={{ fontSize: 10, color: textMuted, marginTop: 1 }}>Orchestra</div>
        </div>
        <div style={{ padding: '2px 6px', borderRadius: 4, background: 'rgba(0,229,255,0.08)', border: '1px solid rgba(0,229,255,0.15)', fontSize: 9, fontWeight: 700, color: '#00e5ff', letterSpacing: '0.05em', flexShrink: 0 }}>BETA</div>

        <i className="bx bx-chevron-down" style={{ fontSize: 14, color: textMuted, flexShrink: 0, marginInlineStart: 2, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
      </button>

      {/* Workspace picker dropdown -- portal to escape sidebar transform/overflow */}
      {open && typeof document !== 'undefined' && createPortal(
        <div ref={dropdownRef} style={{
          position: 'fixed', top: dropPos.top, left: dropPos.left, width: dropPos.width || 240, zIndex: 9999,
          background: dropBg, border: `1px solid ${dropBorder}`, borderRadius: 10,
          boxShadow: 'var(--color-shadow-md)',
          padding: '6px 0',
        }}>
          {/* Personal workspace */}
          <div style={{ padding: '6px 10px 4px', fontSize: 10, fontWeight: 600, color: sectionLabel, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{t('workspaces')}</div>
          <button
            onClick={() => { onSwitchTeam('personal'); setOpen(false) }}
            style={{ display: 'flex', alignItems: 'center', gap: 8, width: 'calc(100% - 8px)', padding: '7px 10px', background: 'transparent', border: 'none', cursor: 'pointer', borderRadius: 6, margin: '0 4px' }}
            onMouseEnter={e => (e.currentTarget.style.background = hoverBg)}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <div style={{ width: 20, height: 20, borderRadius: 5, background: 'rgba(0,229,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <i className="bx bx-user" style={{ fontSize: 11, color: '#00e5ff' }} />
            </div>
            <span style={{ fontSize: 13, color: textPrimary, flex: 1, textAlign: 'start' }}>{user?.name ?? t('workspaces')}</span>
            {!team && <i className="bx bx-check" style={{ fontSize: 14, color: '#00e5ff' }} />}
          </button>

          {/* Teams */}
          {teams.length > 0 && (
            <>
              <div style={{ height: 1, background: dropBorder, margin: '6px 0' }} />
              <div style={{ padding: '4px 10px 4px', fontSize: 10, fontWeight: 600, color: sectionLabel, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{t('teams')}</div>
              {teams.filter(tm => tm?.id).map((tm, i) => (
                <button
                  key={tm.id ?? i}
                  onClick={() => { onSwitchTeam(tm.id); setOpen(false) }}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, width: 'calc(100% - 8px)', padding: '7px 10px', background: 'transparent', border: 'none', cursor: 'pointer', borderRadius: 6, margin: '0 4px' }}
                  onMouseEnter={e => (e.currentTarget.style.background = hoverBg)}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <div style={{ width: 20, height: 20, borderRadius: 5, background: tm.avatar_url ? 'transparent' : 'rgba(169,0,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: '#a900ff', flexShrink: 0, overflow: 'hidden' }}>
                    {tm.avatar_url ? (
                      <img src={tm.avatar_url} alt={tm.name} style={{ width: 20, height: 20, borderRadius: 5, objectFit: 'cover' }} />
                    ) : (tm.name?.[0]?.toUpperCase() ?? '?')}
                  </div>
                  <div style={{ flex: 1, textAlign: 'start' }}>
                    <div style={{ fontSize: 13, color: textPrimary }}>{tm.name}</div>
                    <div style={{ fontSize: 10, color: textMuted }}>{tm.plan} · {tm.member_count} {tm.member_count !== 1 ? t('members') : t('member')}</div>
                  </div>
                  {team?.id === tm.id && <i className="bx bx-check" style={{ fontSize: 14, color: '#a900ff' }} />}
                </button>
              ))}
            </>
          )}

          {/* Team settings -- shown when a team is active */}
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
                <span style={{ fontSize: 13, color: textPrimary }}>{t('teamSettings')}</span>
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
            <span style={{ fontSize: 13, color: textMuted }}>{t('createTeam')}</span>
          </button>
        </div>,
        document.body
      )}
    </div>
  )
}

// ── Tunnel toast notifications ────────────────────────────────
function TunnelToastOverlay() {
  const [toasts, setToasts] = useState<Array<{ id: number; type: string; message: string }>>([])
  const nextId = useRef(0)

  useEffect(() => {
    return onTunnelToast((type, message) => {
      const id = nextId.current++
      setToasts(prev => [...prev, { id, type, message }])
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id))
      }, 4000)
    })
  }, [])

  if (toasts.length === 0) return null

  return createPortal(
    <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8 }}>
      {toasts.map(t => {
        const isReconnect = t.type === 'reconnect'
        const bg = isReconnect ? 'rgba(34,197,94,0.10)' : 'rgba(239,68,68,0.10)'
        const border = isReconnect ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'
        const color = isReconnect ? '#22c55e' : '#ef4444'
        const icon = isReconnect ? 'bx-check-circle' : 'bx-error-circle'
        return (
          <div key={t.id} style={{
            padding: '10px 16px', borderRadius: 10,
            background: bg, border: `1px solid ${border}`,
            display: 'flex', alignItems: 'center', gap: 8,
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            animation: 'slideIn 0.2s ease-out',
          }}>
            <i className={`bx ${icon}`} style={{ fontSize: 16, color }} />
            <span style={{ fontSize: 13, fontWeight: 500, color }}>{t.message}</span>
          </div>
        )
      })}
    </div>,
    document.body
  )
}

// ── Notification toast overlay (realtime in-app toasts) ───────
const NOTIF_TOAST_COLORS: Record<string, { bg: string; border: string; color: string; icon: string }> = {
  info:    { bg: 'rgba(0,229,255,0.10)',   border: 'rgba(0,229,255,0.3)',   color: '#00e5ff', icon: 'bx-info-circle' },
  success: { bg: 'rgba(34,197,94,0.10)',   border: 'rgba(34,197,94,0.3)',   color: '#22c55e', icon: 'bx-check-circle' },
  warning: { bg: 'rgba(245,158,11,0.10)',  border: 'rgba(245,158,11,0.3)',  color: '#f59e0b', icon: 'bx-error' },
  error:   { bg: 'rgba(239,68,68,0.10)',   border: 'rgba(239,68,68,0.3)',   color: '#ef4444', icon: 'bx-x-circle' },
}

function NotificationToastOverlay() {
  const [toasts, setToasts] = useState<Array<{ id: number; title: string; message: string; ntype: string }>>([])
  const nextId = useRef(0)

  useEffect(() => {
    return onNotifToast(({ title, message, ntype }) => {
      const id = nextId.current++
      setToasts(prev => [...prev, { id, title, message, ntype }])
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id))
      }, 5000)
    })
  }, [])

  if (toasts.length === 0) return null

  return createPortal(
    <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 360 }}>
      {toasts.map(t => {
        const c = NOTIF_TOAST_COLORS[t.ntype] ?? NOTIF_TOAST_COLORS.info
        return (
          <div key={t.id} style={{
            padding: '12px 16px', borderRadius: 12,
            background: c.bg, border: `1px solid ${c.border}`,
            backdropFilter: 'blur(12px)',
            boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
            animation: 'slideIn 0.25s ease-out',
            display: 'flex', alignItems: 'flex-start', gap: 10,
          }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: `${c.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
              <i className={`bx ${c.icon}`} style={{ fontSize: 15, color: c.color }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: c.color, marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.title}</div>
              <div style={{ fontSize: 11.5, color: 'var(--color-fg-muted)', lineHeight: 1.4 }}>{t.message}</div>
            </div>
            <button
              onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))}
              style={{ background: 'none', border: 'none', color: 'var(--color-fg-dim)', cursor: 'pointer', fontSize: 14, padding: 0, lineHeight: 1, flexShrink: 0 }}
            >
              <i className="bx bx-x" />
            </button>
          </div>
        )
      })}
    </div>,
    document.body
  )
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { token, user, logout, fetchMe, impersonating, exitImpersonation } = useAuthStore()
  const { can, currentRole, fetchMyRole, team, teams, fetchTeam, fetchAllTeams, switchTeam } = useRoleStore()
  const { notifications, fetchNotifications, markNotificationRead, markAllRead } = useSettingsStore()
  const [notifOpen, setNotifOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchAiMode, setSearchAiMode] = useState(false)
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const { theme } = useThemeStore()
  const { fetchPreferences, preferences, updatePreference } = usePreferencesStore()
  const sidebarCollapsed = preferences.sidebar_collapsed
  const t = useTranslations('sidebar')

  // MCP hook for sidebar data fetching
  const { callTool, status: connStatus } = useMCP()

  // Keep tunnel WebSocket connection alive at the layout level.
  useTunnelConnection()

  // Tunnel connection indicator data — use MCP connStatus as source of truth
  // (covers both tunnel-proxy and dev-gate modes).
  const { tunnels, activeTunnelId, connectionStatus: tunnelConnectionStatus } = useTunnelStore()
  const activeTunnel = tunnels.find(t2 => t2.id === activeTunnelId)
  const tunnelStatus = connStatus === 'connected' ? 'connected'
    : activeTunnelId ? (tunnelConnectionStatus[activeTunnelId] ?? 'disconnected')
    : 'disconnected'
  const tunnelStatusColor = tunnelStatus === 'connected' ? '#22c55e' : tunnelStatus === 'connecting' ? '#f59e0b' : tunnelStatus === 'error' ? '#ef4444' : '#6b7280'

  // ── Global search (CMD+K) ──────────────────────────────────
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(v => !v)
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  // ── Sidebar CRUD data (declared early so search can use it) ──
  const [sidebarProjects, setSidebarProjects] = useState<SidebarProject[]>([])
  const [sidebarNotes, setSidebarNotes] = useState<SidebarNote[]>([])
  const [sidebarPlans, setSidebarPlans] = useState<SidebarPlan[]>([])
  const [sidebarDocs, setSidebarDocs] = useState<SidebarDocFile[]>([])
  const [sidebarDevPlugins, setSidebarDevPlugins] = useState<SidebarDevPlugin[]>([])
  const [sidebarLoading, setSidebarLoading] = useState(false)
  const [sidebarSearch, setSidebarSearch] = useState('')
  const [plansProjectId, setPlansProjectId] = useState<string | null>(null)
  const [createModal, setCreateModal] = useState<{ kind: CreateItemKind; projectId?: string } | null>(null)

  const searchUrlMapRef = useRef<Record<string, string>>({})
  const [searchSuggestions, setSearchSuggestions] = useState<SearchResult[]>([])
  // Dedicated search data (loaded independently of sidebar section)
  const searchProjectsRef = useRef<SidebarProject[]>([])
  const searchNotesRef = useRef<SidebarNote[]>([])
  const searchPlansRef = useRef<SidebarPlan[]>([])
  const searchDocsRef = useRef<SidebarDocFile[]>([])
  const searchDataLoadedRef = useRef(false)

  // Load search data when spotlight opens (fetches all types, not just active section)
  useEffect(() => {
    if (!searchOpen) return
    if (searchDataLoadedRef.current) return

    const load = async () => {
      const urlMap: Record<string, string> = {}
      const suggestions: SearchResult[] = []

      // Use sidebar data if already loaded (from section visits)
      let projects = sidebarProjects
      let notes = sidebarNotes
      let plans = sidebarPlans
      let docs = sidebarDocs

      // If MCP connected, fetch fresh data for search (covers all types)
      if (connStatus === 'connected' && callTool) {
        try {
          const fetches: Promise<any>[] = [
            callTool('list_projects').catch(() => null),
            callTool('list_notes').catch(() => null),
          ]
          // Plans require a project_id — fetch only if one is selected
          const planProjectId = plansProjectId || projects[0]?.id || ''
          if (planProjectId) fetches.push(callTool('list_plans', { project_id: planProjectId }).catch(() => null))

          const [projRes, noteRes, planRes] = await Promise.all(fetches)
          if (projRes) {
            const text = projRes.content?.[0]?.text ?? ''
            const parsed = parseMCPProjects(text)
            if (parsed.length > 0) projects = parsed
          }
          if (noteRes) {
            const text = noteRes.content?.[0]?.text ?? ''
            const parsed = parseMCPNotes(text)
            if (parsed.length > 0) notes = parsed
          }
          if (planRes) {
            const text = planRes.content?.[0]?.text ?? ''
            const parsed = parseMCPPlans(text)
            if (parsed.length > 0) plans = parsed
          }
        } catch {}
      }

      // Wiki docs: fetch from cloud API (works without tunnel)
      try {
        const fetchedDocs = await apiFetch<Array<{ doc_id: string; title: string; category: string }>>('/api/docs', { skipAuth: true })
        if (Array.isArray(fetchedDocs) && fetchedDocs.length > 0) docs = fetchedDocs.map(d => ({ name: d.title || d.doc_id, path: d.doc_id, folder: d.category || '' }))
      } catch {}

      searchProjectsRef.current = projects
      searchNotesRef.current = notes
      searchPlansRef.current = plans
      searchDocsRef.current = docs
      searchDataLoadedRef.current = true

      for (const p of projects.slice(0, 5)) {
        urlMap[p.id] = `/projects/${p.id}`
        suggestions.push({ id: p.id, title: p.name, category: 'project', icon: <i className="bx bx-folder" style={{ fontSize: 14, color: '#00e5ff' }} /> })
      }
      for (const n of notes.slice(0, 5)) {
        urlMap[n.id] = `/notes/${n.id}`
        suggestions.push({ id: n.id, title: n.title, category: 'note', icon: <i className="bx bx-note" style={{ fontSize: 14, color: '#22c55e' }} /> })
      }
      for (const pl of plans.slice(0, 3)) {
        urlMap[pl.id] = `/plans?id=${pl.id}`
        suggestions.push({ id: pl.id, title: pl.title, category: 'plan', icon: <i className="bx bx-map" style={{ fontSize: 14, color: '#8b5cf6' }} /> })
      }
      for (const d of docs.slice(0, 3)) {
        urlMap[d.path] = `/wiki?file=${d.path}`
        suggestions.push({ id: d.path, title: d.name, category: 'doc', icon: <i className="bx bx-book-open" style={{ fontSize: 14, color: '#f97316' }} /> })
      }
      searchUrlMapRef.current = { ...searchUrlMapRef.current, ...urlMap }
      setSearchSuggestions(suggestions)
    }

    load()
  }, [searchOpen, connStatus, callTool, sidebarProjects, sidebarNotes, sidebarPlans, sidebarDocs, plansProjectId])

  // Reset search data when spotlight closes so it reloads fresh next time
  useEffect(() => {
    if (!searchOpen) searchDataLoadedRef.current = false
  }, [searchOpen])

  // Local client-side search across loaded search data
  const localSearch = useCallback((query: string): SearchResult[] => {
    const q = query.toLowerCase()
    const items: SearchResult[] = []
    const urlMap: Record<string, string> = {}
    const projects = searchProjectsRef.current.length > 0 ? searchProjectsRef.current : sidebarProjects
    const notes = searchNotesRef.current.length > 0 ? searchNotesRef.current : sidebarNotes
    const plans = searchPlansRef.current.length > 0 ? searchPlansRef.current : sidebarPlans
    const docs = searchDocsRef.current.length > 0 ? searchDocsRef.current : sidebarDocs
    for (const p of projects) {
      if (p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q)) {
        urlMap[p.id] = `/projects/${p.id}`
        items.push({ id: p.id, title: p.name, category: 'project', icon: <i className="bx bx-folder" style={{ fontSize: 14, color: '#00e5ff' }} /> })
      }
    }
    for (const n of notes) {
      if (n.title.toLowerCase().includes(q) || n.id.toLowerCase().includes(q)) {
        urlMap[n.id] = `/notes/${n.id}`
        items.push({ id: n.id, title: n.title, category: 'note', icon: <i className="bx bx-note" style={{ fontSize: 14, color: '#22c55e' }} /> })
      }
    }
    for (const pl of plans) {
      if (pl.title.toLowerCase().includes(q) || pl.id.toLowerCase().includes(q)) {
        urlMap[pl.id] = `/plans?id=${pl.id}`
        items.push({ id: pl.id, title: pl.title, category: 'plan', icon: <i className="bx bx-map" style={{ fontSize: 14, color: '#8b5cf6' }} /> })
      }
    }
    for (const d of docs) {
      if (d.name.toLowerCase().includes(q) || d.folder.toLowerCase().includes(q)) {
        urlMap[d.path] = `/wiki?file=${d.path}`
        items.push({ id: d.path, title: d.name, description: d.folder, category: 'doc', icon: <i className="bx bx-book-open" style={{ fontSize: 14, color: '#f97316' }} /> })
      }
    }
    searchUrlMapRef.current = { ...searchUrlMapRef.current, ...urlMap }
    return items
  }, [sidebarProjects, sidebarNotes, sidebarPlans, sidebarDocs])

  // Map API search results to SearchResult format
  const mapSearchResults = useCallback((data: { results: Array<{ id: string; type: string; title: string; description: string; url: string; category: string }> }) => {
    const urlMap: Record<string, string> = {}
    const mapped = data.results.map(r => {
      urlMap[r.id] = r.url
      return {
        id: r.id,
        title: r.title,
        description: r.description,
        category: r.category,
        icon: r.type === 'project' ? <i className="bx bx-folder" style={{ fontSize: 14, color: '#00e5ff' }} /> :
              r.type === 'feature' ? <i className="bx bx-git-branch" style={{ fontSize: 14, color: '#a900ff' }} /> :
              r.type === 'note' ? <i className="bx bx-note" style={{ fontSize: 14, color: '#22c55e' }} /> :
              r.type === 'plan' ? <i className="bx bx-map" style={{ fontSize: 14, color: '#8b5cf6' }} /> :
              r.type === 'doc' ? <i className="bx bx-book-open" style={{ fontSize: 14, color: '#f97316' }} /> :
              <i className="bx bx-bot" style={{ fontSize: 14, color: '#f59e0b' }} />,
      }
    })
    searchUrlMapRef.current = { ...searchUrlMapRef.current, ...urlMap }
    return mapped
  }, [])

  const handleSearch = useCallback((query: string) => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current)
    if (!query.trim()) {
      setSearchResults([])
      setSearchLoading(false)
      return
    }

    // AI search mode: prefix with "?" for natural language
    const isAiSearch = query.startsWith('?')
    const cleanQuery = isAiSearch ? query.slice(1).trim() : query

    if (!cleanQuery) {
      setSearchResults([])
      setSearchLoading(false)
      return
    }

    // Immediate local results from sidebar data (always works)
    if (!isAiSearch) {
      const local = localSearch(cleanQuery)
      if (local.length > 0) setSearchResults(local)
    }

    setSearchLoading(true)
    searchTimerRef.current = setTimeout(async () => {
      try {
        if (isAiSearch && connStatus === 'connected' && callTool) {
          // AI-powered search via MCP
          const result = await callTool('send_message', {
            session_id: 'search',
            message: `Search my workspace for: ${cleanQuery}. Return results as a JSON array with fields: id, type (project/feature/note/plan/doc), title, description, url.`,
          })
          const text = typeof result === 'string' ? result : result?.content?.[0]?.text ?? ''
          const jsonMatch = text.match(/\[[\s\S]*\]/)
          if (jsonMatch) {
            try {
              const items = JSON.parse(jsonMatch[0]) as Array<{ id: string; type: string; title: string; description: string; url: string }>
              const urlMap: Record<string, string> = {}
              const mapped = items.map(r => {
                urlMap[r.id] = r.url
                return {
                  id: r.id,
                  title: r.title,
                  description: r.description,
                  category: r.type,
                  icon: r.type === 'project' ? <i className="bx bx-folder" style={{ fontSize: 14, color: '#00e5ff' }} /> :
                        r.type === 'feature' ? <i className="bx bx-git-branch" style={{ fontSize: 14, color: '#a900ff' }} /> :
                        r.type === 'note' ? <i className="bx bx-note" style={{ fontSize: 14, color: '#22c55e' }} /> :
                        r.type === 'plan' ? <i className="bx bx-map" style={{ fontSize: 14, color: '#8b5cf6' }} /> :
                        r.type === 'doc' ? <i className="bx bx-book-open" style={{ fontSize: 14, color: '#f97316' }} /> :
                        <i className="bx bx-note" style={{ fontSize: 14, color: '#22c55e' }} />,
                }
              })
              searchUrlMapRef.current = { ...searchUrlMapRef.current, ...urlMap }
              setSearchResults(mapped)
            } catch {
              setSearchResults([{ id: 'ai-answer', title: 'AI Answer', description: text.slice(0, 200) }])
            }
          } else {
            setSearchResults([{ id: 'ai-answer', title: 'AI Answer', description: text.slice(0, 200) }])
          }
        } else if (connStatus === 'connected' && callTool) {
          // Use MCP search_features + merge with local results
          try {
            const result = await callTool('search_features', { query: cleanQuery })
            const text = typeof result === 'string' ? result : result?.content?.[0]?.text ?? ''
            const rows = text.split('\n').filter((l: string) => l.startsWith('| FEAT-') || l.startsWith('| feat-'))
            const mcpResults: SearchResult[] = rows.map((row: string) => {
              const cols = row.split('|').map((c: string) => c.trim()).filter(Boolean)
              return {
                id: cols[0] || '',
                title: `${cols[0]} — ${cols[1] || ''}`,
                description: cols[2] || '',
                category: 'feature',
                icon: <i className="bx bx-git-branch" style={{ fontSize: 14, color: '#a900ff' }} />,
              }
            })
            // Merge: local results + MCP results (deduplicated by id)
            const local = localSearch(cleanQuery)
            const seen = new Set(local.map(r => r.id))
            const merged = [...local, ...mcpResults.filter(r => !seen.has(r.id))]
            setSearchResults(merged)
          } catch {
            // MCP failed, keep local results
            setSearchResults(localSearch(cleanQuery))
          }
        } else if (!isDevSeed()) {
          // REST API search (requires real auth) — merge with local
          try {
            const data = await apiFetch<{ results: Array<{ id: string; type: string; title: string; description: string; url: string; category: string }> }>(`/api/search?q=${encodeURIComponent(cleanQuery)}&limit=20`)
            const apiResults = mapSearchResults(data)
            const local = localSearch(cleanQuery)
            const seen = new Set(local.map(r => r.id))
            setSearchResults([...local, ...apiResults.filter(r => !seen.has(r.id))])
          } catch {
            setSearchResults(localSearch(cleanQuery))
          }
        } else {
          // Dev seed mode, no MCP — use local results only
          setSearchResults(localSearch(cleanQuery))
        }
      } catch {
        setSearchResults(localSearch(cleanQuery))
      } finally {
        setSearchLoading(false)
      }
    }, isAiSearch ? 500 : 250)
  }, [connStatus, callTool, mapSearchResults, localSearch])

  const handleSearchSelect = useCallback((result: SearchResult) => {
    setSearchOpen(false)
    const url = searchUrlMapRef.current[result.id]
    if (url) router.push(url)
  }, [router])

  // Show suggestions when no search query, otherwise show search results
  const displayedSearchResults = searchResults.length > 0 ? searchResults : (searchSuggestions.length > 0 ? searchSuggestions : [])

  // ── Sidebar section detection ─────────────────────────────
  const sectionFromPath: 'admin' | 'projects' | 'notes' | 'plans' | 'wiki' | 'devtools' | 'settings' | 'team' | null =
    pathname.startsWith('/admin') ? 'admin'
    : pathname.startsWith('/projects') ? 'projects'
    : pathname.startsWith('/notes') ? 'notes'
    : pathname.startsWith('/plans') ? 'plans'
    : pathname.startsWith('/wiki') ? 'wiki'
    : pathname.startsWith('/devtools') ? 'devtools'
    : pathname.startsWith('/settings') ? 'settings'
    : pathname.startsWith('/team') ? 'team'
    : null

  // Persist last active section and path for restore
  const lastSection = useSidebarMetaStore(s => s.lastSection) as typeof sectionFromPath
  const lastPathMap = useSidebarMetaStore(s => s.lastPath)
  const activeSection = sectionFromPath ?? lastSection
  // Use stored path for active highlighting when on section root (e.g. /projects but not /projects/abc123)
  const sectionRoots = ['/projects', '/notes', '/plans', '/wiki', '/devtools', '/settings', '/team']
  const isOnSectionRoot = sectionRoots.includes(pathname)
  // Include query params so notes (?id=) can highlight active items
  const qs = searchParams.toString()
  const fullPath = qs ? `${pathname}?${qs}` : pathname
  const hasQueryDetail = qs && (searchParams.has('id') || searchParams.has('session') || searchParams.has('file') || searchParams.has('plugin') || searchParams.has('tab'))
  const effectivePathname = hasQueryDetail
    ? fullPath
    : (isOnSectionRoot || !sectionFromPath) && activeSection && lastPathMap[activeSection]
      ? lastPathMap[activeSection]
      : pathname

  // Sidebar visible only when the current URL maps to a section with a list panel
  const hasSidebar = !!sectionFromPath

  useEffect(() => {
    if (sectionFromPath && sectionFromPath !== 'admin') {
      const state = useSidebarMetaStore.getState()
      state.setLastSection(sectionFromPath)
      // Save item path (with query params for notes) when NOT on a bare section root
      const hasDetail = !isOnSectionRoot || (qs && (searchParams.has('id') || searchParams.has('session') || searchParams.has('file') || searchParams.has('plugin')))
      if (hasDetail) {
        state.setLastPath(sectionFromPath, fullPath)
      }
    }
  }, [sectionFromPath, fullPath, isOnSectionRoot, qs, searchParams])

  // (sidebar state declared earlier, before search logic)

  // Reset search when section changes
  useEffect(() => {
    setSidebarSearch('')
  }, [activeSection])

  // Fetch sidebar data when section or connection changes
  const fetchSidebarData = useCallback(async () => {
    if (!activeSection || activeSection === 'admin' || activeSection === 'settings' || activeSection === 'team') return
    // Wiki uses cloud API (no tunnel needed); other sections need tunnel connection
    if (activeSection !== 'wiki' && connStatus !== 'connected') return

    setSidebarLoading(true)
    try {
      if (activeSection === 'projects') {
        const result = await callTool('list_projects')
        const text = result.content?.[0]?.text ?? ''
        const parsed = parseMCPProjects(text)
        setSidebarProjects(parsed)
        // Store first project for plans if needed
        if (parsed.length > 0 && !plansProjectId) {
          setPlansProjectId(parsed[0].id)
        }
      } else if (activeSection === 'notes') {
        const result = await callTool('list_notes')
        const text = result.content?.[0]?.text ?? ''
        const notes = parseMCPNotes(text)
        setSidebarNotes(notes)
        // Enrich notes with icon/color from individual get_note calls
        const enriched = await Promise.all(notes.map(async (n) => {
          try {
            const detail = await callTool('get_note', { note_id: n.id })
            const detailText = detail.content?.[0]?.text ?? ''
            const iconMatch = detailText.match(/\*\*Icon:\*\*\s*(.+)/i)
            const colorMatch = detailText.match(/\*\*Color:\*\*\s*(.+)/i)
            const icon = iconMatch?.[1]?.trim()
            const color = colorMatch?.[1]?.trim()
            return { ...n, icon: icon && icon !== '\u2014' ? icon : undefined, color: color && color !== '\u2014' ? color : undefined }
          } catch { return n }
        }))
        setSidebarNotes(enriched)
      } else if (activeSection === 'plans') {
        // Fetch plans from ALL projects and aggregate
        let projs = sidebarProjects
        if (projs.length === 0) {
          const projResult = await callTool('list_projects')
          const projText = projResult.content?.[0]?.text ?? ''
          projs = parseMCPProjects(projText)
          if (projs.length > 0 && !plansProjectId) {
            setPlansProjectId(projs[0].id)
          }
        }
        const allPlans: SidebarPlan[] = []
        const seen = new Set<string>()
        await Promise.all(projs.map(async (proj) => {
          try {
            const result = await callTool('list_plans', { project_id: proj.id })
            const text = result.content?.[0]?.text ?? ''
            for (const p of parseMCPPlans(text)) {
              if (!seen.has(p.id)) { seen.add(p.id); allPlans.push({ ...p, project_id: proj.id }) }
            }
          } catch { /* skip projects without plans */ }
        }))
        setSidebarPlans(allPlans)
      } else if (activeSection === 'wiki') {
        try {
          const docs = await apiFetch<Array<{ doc_id: string; title: string; category: string; pinned: boolean; icon: string; color: string }>>('/api/docs')
          setSidebarDocs(docs.map(d => ({ name: d.title || d.doc_id, path: d.doc_id, folder: d.category || '', pinned: d.pinned || false, icon: d.icon || '', color: d.color || '' })))
        } catch { setSidebarDocs([]) }
      } else if (activeSection === 'devtools') {
        // Build plugin list from available tools
        const DEVTOOL_PLUGINS = [
          { key: 'components', label: 'Components', icon: 'bx-cube', color: '#a900ff', match: (n: string) => n.startsWith('component_') },
          { key: 'database', label: 'Database', icon: 'bx-data', color: '#00e5ff', match: (n: string) => n.startsWith('db_') },
          { key: 'debugger', label: 'Debugger', icon: 'bx-bug', color: '#ef4444', match: (n: string) => n.startsWith('debug_') },
          { key: 'devops', label: 'DevOps', icon: 'bx-rocket', color: '#f59e0b', match: (n: string) => n.startsWith('devops_') },
          { key: 'docker', label: 'Docker', icon: 'bx-box', color: '#2563eb', match: (n: string) => n.startsWith('docker_') },
          { key: 'file-explorer', label: 'File Explorer', icon: 'bx-file', color: '#10b981', match: (n: string) => ['list_directory','read_file','write_file','delete_file','move_file','file_info','file_search','code_symbols','code_goto_definition','code_find_references','code_hover','code_complete','code_diagnostics','code_actions','code_workspace_symbols','code_namespace','code_imports'].includes(n) },
          { key: 'git', label: 'Git', icon: 'bx-git-branch', color: '#f97316', match: (n: string) => n.startsWith('git_') || n.startsWith('gh_') },
          { key: 'log-viewer', label: 'Log Viewer', icon: 'bx-list-ul', color: '#8b5cf6', match: (n: string) => n.startsWith('log_') },
          { key: 'services', label: 'Services', icon: 'bx-server', color: '#06b6d4', match: (n: string) => n.endsWith('_service') || n.endsWith('_services') || ['list_services','restart_service','service_info','service_logs','start_service','stop_service'].includes(n) },
          { key: 'ssh', label: 'SSH', icon: 'bx-terminal', color: '#64748b', match: (n: string) => n.startsWith('ssh_') },
          { key: 'terminal', label: 'Terminal', icon: 'bx-command', color: '#22c55e', match: (n: string) => n.includes('terminal') },
          { key: 'test-runner', label: 'Test Runner', icon: 'bx-check-circle', color: '#14b8a6', match: (n: string) => n.startsWith('test_') },
        ]
        try {
          const result = await callTool('tools/list', {})
          const text = result.content?.[0]?.text ?? ''
          // Count tools per plugin from available tools list
          const toolNames = text.split('\n').map((l: string) => l.trim()).filter(Boolean)
          const plugins: SidebarDevPlugin[] = []
          for (const def of DEVTOOL_PLUGINS) {
            const count = toolNames.filter((n: string) => def.match(n)).length
            if (count > 0) {
              plugins.push({ key: def.key, label: def.label, icon: def.icon, color: def.color, toolCount: count })
            }
          }
          setSidebarDevPlugins(plugins)
        } catch {
          // Fallback: just list all plugins without tool counts
          setSidebarDevPlugins(DEVTOOL_PLUGINS.map(d => ({ key: d.key, label: d.label, icon: d.icon, color: d.color, toolCount: 0 })))
        }
      }
    } catch (e) {
      console.error('[sidebar] fetch error:', e)
    } finally {
      setSidebarLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connStatus, activeSection, callTool, plansProjectId])

  useEffect(() => {
    fetchSidebarData()
  }, [fetchSidebarData])

  // ── MCP sidebar action handlers ─────────────────────────────
  const handleSidebarPin = useCallback(async (sec: string, id: string) => {
    try {
      if (sec === 'notes') {
        const note = sidebarNotes.find(n => n.id === id)
        const pinned = note ? !note.pinned : true
        await callTool('pin_note', { note_id: id, pinned })
        fetchSidebarData()
      } else if (sec === 'wiki') {
        await apiFetch(`/api/docs/${encodeURIComponent(id)}/pin`, { method: 'PATCH' })
        fetchSidebarData()
      } else {
        useSidebarMetaStore.getState().togglePin(sec, id)
      }
    } catch (e) {
      console.error('[sidebar] pin error:', e)
    }
  }, [callTool, sidebarNotes, fetchSidebarData])

  const handleSidebarDelete = useCallback(async (sec: string, id: string) => {
    try {
      if (sec === 'notes') {
        await callTool('delete_note', { note_id: id })
      } else if (sec === 'projects') {
        await callTool('delete_project', { project_id: id })
      } else if (sec === 'plans') {
        if (plansProjectId) {
          await callTool('delete_plan', { project_id: plansProjectId, plan_id: id })
        }
      } else if (sec === 'wiki') {
        await apiFetch(`/api/docs/${encodeURIComponent(id)}`, { method: 'DELETE' })
      }
      useSidebarMetaStore.getState().removeMeta(sec, id)
      fetchSidebarData()
    } catch (e) {
      console.error('[sidebar] delete error:', e)
    }
  }, [callTool, plansProjectId, fetchSidebarData])

  const handleSidebarRename = useCallback(async (sec: string, id: string, newName: string) => {
    try {
      if (sec === 'notes') {
        const noteResult = await callTool('get_note', { note_id: id })
        const noteBody = extractNoteBody(noteResult)
        await callTool('update_note', { note_id: id, title: newName, body: noteBody })
        fetchSidebarData()
        window.dispatchEvent(new CustomEvent('orchestra:note-updated', { detail: { noteId: id } }))
      } else if (sec === 'wiki') {
        await apiFetch(`/api/docs/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify({ title: newName }) })
        fetchSidebarData()
      } else if (sec === 'plans') {
        if (plansProjectId) {
          await callTool('update_plan', { project_id: plansProjectId, plan_id: id, title: newName })
          fetchSidebarData()
        }
      } else {
        useSidebarMetaStore.getState().setCustomName(sec, id, newName)
      }
    } catch (e) {
      console.error('[sidebar] rename error:', e)
    }
  }, [callTool, plansProjectId, fetchSidebarData])

  const handleSidebarColor = useCallback(async (sec: string, id: string, color: string) => {
    try {
      if (sec === 'notes') {
        const noteResult = await callTool('get_note', { note_id: id })
        const noteBody = extractNoteBody(noteResult)
        await callTool('update_note', { note_id: id, body: noteBody, color })
        setSidebarNotes(prev => prev.map(n => n.id === id ? { ...n, color } : n))
        window.dispatchEvent(new CustomEvent('orchestra:note-updated', { detail: { noteId: id } }))
      } else if (sec === 'wiki') {
        await apiFetch(`/api/docs/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify({ color }) })
        fetchSidebarData()
      } else {
        useSidebarMetaStore.getState().setColor(sec, id, color)
      }
    } catch (e) {
      console.error('[sidebar] color error:', e)
    }
  }, [callTool, fetchSidebarData])

  const handleSidebarIcon = useCallback(async (sec: string, id: string, icon: string) => {
    try {
      if (sec === 'notes') {
        const noteResult = await callTool('get_note', { note_id: id })
        const noteBody = extractNoteBody(noteResult)
        await callTool('update_note', { note_id: id, body: noteBody, icon })
        setSidebarNotes(prev => prev.map(n => n.id === id ? { ...n, icon } : n))
        window.dispatchEvent(new CustomEvent('orchestra:note-updated', { detail: { noteId: id } }))
      } else if (sec === 'wiki') {
        await apiFetch(`/api/docs/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify({ icon }) })
        fetchSidebarData()
      } else {
        useSidebarMetaStore.getState().setIcon(sec, id, icon)
      }
    } catch (e) {
      console.error('[sidebar] icon error:', e)
    }
  }, [callTool, fetchSidebarData])

  const handleSidebarCreate = useCallback((sec: string, kind: string, data: Record<string, string>) => {
    setCreateModal({
      kind: kind as CreateItemKind,
      projectId: data.project_id,
    })
  }, [])

  useEffect(() => {
    if (!token) { router.push('/login'); return }
    if (!user) fetchMe()
    fetchMyRole()
    fetchTeam()
    fetchAllTeams()
    fetchPreferences()
    fetchNotifications()
    // Redirect new users to onboarding (only once, after first registration)
    if (typeof window !== 'undefined' && pathname !== '/onboarding') {
      const done = localStorage.getItem('orchestra_onboarding_done')
      const isNew = localStorage.getItem('orchestra_is_new_user')
      if (!done && isNew === '1') {
        router.push('/onboarding')
      }
    }
  }, [token, user, router, fetchMe])

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  // Close mobile menu on window resize past breakpoint
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) setMobileMenuOpen(false)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])


  const { status: wsStatus } = useRealtimeSync()

  if (!token) return null

  // Onboarding has its own full-page layout -- skip the sidebar shell
  if (pathname === '/onboarding') return <>{children}</>

  const initials = user?.name?.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase() ?? 'U'

  const textPrimary = 'var(--color-fg)'
  const textMuted = 'var(--color-fg-muted)'
  const textDim = 'var(--color-fg-dim)'
  const pageBg = 'var(--color-bg)'
  const sidebarBg = 'var(--color-bg-alt)'
  const borderColor = 'var(--color-border)'
  const navActiveBg = 'var(--color-bg-active)'
  const navInactiveColor = 'var(--color-fg-muted)'
  const notifBg = 'var(--color-bg-contrast)'
  const notifBorder = 'var(--color-border)'
  const notifItemBorder = 'var(--color-border)'
  const notifDescColor = 'var(--color-fg-dim)'
  const notifTimeColor = 'var(--color-fg-dim)'
  const btnBellBg = 'var(--color-bg-alt)'
  const btnBellColor = 'var(--color-fg-muted)'
  const notifCloseColor = 'var(--color-fg-muted)'
  const dropdownUserBorder = 'var(--color-border)'
  const userEmailColor = 'var(--color-fg-dim)'
  const unreadDotBorder = 'var(--color-bg)'
  const allTeams = teams.length > 0 ? teams : (team ? [team] : [])

  // Show sidebar panel when: not collapsed AND the current route has a sidebar
  const showSidebarPanel = !sidebarCollapsed && hasSidebar

  // Total sidebar width: icon rail (56) + panel (260) = 316, or just icon rail (56) when collapsed or no sidebar
  const totalSidebarWidth = sidebarCollapsed ? 56 : 316

  const navItems = [
    { href: '/dashboard', label: t('nav.dashboard'), icon: 'bx-grid-alt' },
    { href: '/projects', label: t('nav.projects'), icon: 'bx-folder' },
    { href: '/notes', label: t('nav.notes'), icon: 'bx-note' },
    { href: '/plans', label: t('nav.plans'), icon: 'bx-map' },
    { href: '/wiki', label: t('nav.wiki'), icon: 'bx-book-open' },
    { href: '/devtools', label: t('nav.devtools'), icon: 'bx-wrench' },
  ]

  const adminItems = [
    { href: '/admin', label: t('overview'), icon: 'bx-bar-chart-alt-2', exact: true },
    { href: '/admin/users', label: t('users'), icon: 'bx-user' },
    { href: '/admin/roles', label: t('rolesPerms'), icon: 'bx-shield-alt-2' },
    { href: '/admin/teams', label: t('teams'), icon: 'bx-group' },
    { href: '/admin/pages', label: t('pages'), icon: 'bx-file' },
    { href: '/admin/posts', label: t('posts'), icon: 'bx-edit' },
    { href: '/admin/categories', label: t('categories'), icon: 'bx-category' },
    { href: '/admin/marketplace', label: t('nav.marketplace'), icon: 'bx-store' },
    { href: '/admin/docs', label: t('documentation'), icon: 'bx-book-open' },
    { href: '/admin/contact', label: t('contact'), icon: 'bx-envelope' },
    { href: '/admin/issues', label: t('issues'), icon: 'bx-bug' },
    { href: '/admin/notifications', label: t('notifications'), icon: 'bx-bell' },
  ]

  // For pages without a sidebar, the main content margin is just 56 (icon rail only)
  const mainMargin = hasSidebar ? totalSidebarWidth : 56

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: pageBg, flexDirection: 'column' }}>
      <TunnelToastOverlay />
      <NotificationToastOverlay />
      {/* Impersonation banner */}
      {impersonating && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999,
          background: 'linear-gradient(90deg, #f59e0b, #d97706)',
          padding: '8px 20px', display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <i className="bx bx-user-check" style={{ fontSize: 15, color: '#fff' }} />
          <span style={{ fontSize: 13, fontWeight: 500, color: '#fff', flex: 1 }}>
            {t('impersonating')} <strong>{impersonating.name}</strong> ({impersonating.email})
          </span>
          <button
            onClick={() => exitImpersonation()}
            style={{ background: 'rgba(255,255,255,0.25)', border: '1px solid rgba(255,255,255,0.4)', borderRadius: 6, padding: '3px 10px', fontSize: 12, fontWeight: 600, color: '#fff', cursor: 'pointer' }}
          >
            {t('exitImpersonation')}
          </button>
        </div>
      )}

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', marginTop: impersonating ? 37 : 0 }}>
        {/* Mobile sidebar overlay */}
        <div
          className={`app-sidebar-overlay${mobileMenuOpen ? ' visible' : ''}`}
          onClick={() => setMobileMenuOpen(false)}
        />

        {/* -- Icon Rail (56px fixed) ----------------------------- */}
        <aside
          className={`app-icon-rail${mobileMenuOpen ? ' open' : ''}`}
          style={{
            width: 56, flexShrink: 0, display: 'flex', flexDirection: 'column',
            alignItems: 'center',
            background: 'var(--color-bg)',
            borderInlineEnd: `1px solid ${borderColor}`,
            position: 'fixed', top: impersonating ? 37 : 0, insetInlineStart: 0, bottom: 0, zIndex: 31,
            transition: 'transform 0.25s ease',
          }}
        >
          {/* Logo */}
          <div style={{
            width: 56, height: 52, display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderBottom: `1px solid ${borderColor}`, flexShrink: 0,
          }}>
            <Image src="/logo.svg" alt="Orchestra" width={22} height={22} />
          </div>

          {/* Nav icons */}
          <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, padding: '8px 0', width: '100%' }}>
            {navItems.map((item) => {
              const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href + '/'))
              const itemHasSidebar = item.href !== '/dashboard'
              return (
                <Tooltip key={item.href} content={item.label} placement="right" delay={400}>
                  <button
                    className="icon-rail-btn"
                    onClick={() => {
                      if (active && itemHasSidebar) {
                        updatePreference('sidebar_collapsed', !sidebarCollapsed)
                      } else {
                        if (itemHasSidebar && sidebarCollapsed) {
                          updatePreference('sidebar_collapsed', false)
                        }
                        // Navigate to last-visited path in this section (e.g. /projects/orchestra-web) if available
                        const sectionKey = item.href.replace('/', '') // '/projects' → 'projects'
                        const storedPath = useSidebarMetaStore.getState().lastPath[sectionKey]
                        router.push(storedPath || item.href)
                      }
                    }}
                    style={{
                      width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      borderRadius: 10, border: 'none', cursor: 'pointer', position: 'relative',
                      color: active ? '#a900ff' : navInactiveColor,
                      background: active ? 'var(--color-accent-active)' : 'transparent',
                    }}
                  >
                    <i className={`bx ${item.icon}`} style={{ fontSize: 20 }} />
                    {active && (
                      <span style={{
                        position: 'absolute', insetInlineStart: -8, top: 8, bottom: 8,
                        width: 3, borderRadius: '0 3px 3px 0', background: '#a900ff',
                      }} />
                    )}
                  </button>
                </Tooltip>
              )
            })}

            {/* Admin divider + icon */}
            {can('canViewAdmin') && (
              <>
                <div style={{ height: 1, background: borderColor, margin: '6px 10px', width: 'calc(100% - 20px)' }} />
                <Tooltip content={t('adminPanel')} placement="right" delay={400}>
                  <button
                    className="icon-rail-btn"
                    onClick={() => {
                      if (pathname.startsWith('/admin')) {
                        updatePreference('sidebar_collapsed', !sidebarCollapsed)
                      } else {
                        if (sidebarCollapsed) updatePreference('sidebar_collapsed', false)
                        router.push('/admin')
                      }
                    }}
                    style={{
                      width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      borderRadius: 10, border: 'none', cursor: 'pointer', position: 'relative',
                      color: pathname.startsWith('/admin') ? '#a900ff' : navInactiveColor,
                      background: pathname.startsWith('/admin') ? 'var(--color-accent-active)' : 'transparent',
                    }}
                  >
                    <i className="bx bx-shield-alt-2" style={{ fontSize: 20 }} />
                    {pathname.startsWith('/admin') && (
                      <span style={{
                        position: 'absolute', insetInlineStart: -8, top: 8, bottom: 8,
                        width: 3, borderRadius: '0 3px 3px 0', background: '#a900ff',
                      }} />
                    )}
                  </button>
                </Tooltip>
              </>
            )}
          </nav>

          {/* Bottom spacer (user menu moved to header) */}
          <div style={{ paddingBottom: 10 }} />
        </aside>

        {/* -- Sidebar Panel (260px, collapsible) ------------------- */}
        <aside
          className={`app-sidebar-panel${mobileMenuOpen ? ' open' : ''}${sidebarCollapsed ? ' collapsed' : ''}`}
          style={{
            width: 260, flexShrink: 0, display: sidebarCollapsed || !hasSidebar ? 'none' : 'flex', flexDirection: 'column',
            background: sidebarBg, borderInlineEnd: `1px solid ${borderColor}`,
            position: 'fixed', top: impersonating ? 37 : 0, insetInlineStart: 56, bottom: 0, zIndex: 30,
            overflowY: 'auto', transition: 'transform 0.2s ease',
          }}
        >
            {/* Panel header: workspace switcher or section title */}
            {pathname.startsWith('/admin') ? (
              <div style={{
                height: 52, display: 'flex', alignItems: 'center', gap: 8,
                padding: '0 16px', borderBottom: `1px solid ${borderColor}`, flexShrink: 0,
              }}>
                <i className="bx bx-shield-alt-2" style={{ fontSize: 16, color: '#a900ff' }} />
                <span style={{ fontSize: 14, fontWeight: 600, color: textPrimary }}>{t('administration')}</span>
              </div>
            ) : (
              <WorkspaceSwitcher
                user={user}
                team={team}
                teams={allTeams}
                textPrimary={textPrimary}
                textMuted={textMuted}
                borderColor={borderColor}
                onSwitchTeam={(id) => {
                  if (id === 'personal') switchTeam('')
                  else switchTeam(id)
                }}
              />
            )}

            {/* Panel content based on active section */}
            <nav style={{ flex: 1, padding: '0', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              {pathname.startsWith('/admin') ? (
                /* Admin sub-navigation */
                <div style={{ padding: '8px 8px', display: 'flex', flexDirection: 'column', gap: 1, flex: 1 }}>
                  {adminItems.map(item => {
                    const active = item.exact ? pathname === item.href : (pathname === item.href || pathname.startsWith(item.href + '/'))
                    return (
                      <Link key={item.href} href={item.href} style={{
                        display: 'flex', alignItems: 'center', gap: 9,
                        padding: '7px 10px', borderRadius: 7, textDecoration: 'none',
                        fontSize: 13, fontWeight: active ? 500 : 400,
                        color: active ? textPrimary : navInactiveColor,
                        background: active ? navActiveBg : 'transparent',
                      }}>
                        <i className={`bx ${item.icon}`} style={{ fontSize: 15, width: 18, textAlign: 'center', opacity: active ? 1 : 0.5 }} />
                        {item.label}
                      </Link>
                    )
                  })}
                </div>
              ) : activeSection && activeSection !== 'admin' ? (
                /* CRUD list for the active section */
                <SidebarListPanel
                  section={activeSection}
                  activePath={effectivePathname}
                  textPrimary={textPrimary}
                  textMuted={textMuted}
                  textDim={textDim}
                  borderColor={borderColor}
                  navActiveBg={navActiveBg}
                  navInactiveColor={navInactiveColor}
                  sidebarProjects={sidebarProjects}
                  sidebarNotes={sidebarNotes}
                  sidebarPlans={sidebarPlans}
                  sessions={[]}
                  sidebarDocs={sidebarDocs}
                  sidebarDevPlugins={sidebarDevPlugins}
                  sidebarLoading={sidebarLoading}
                  sidebarSearch={sidebarSearch}
                  setSidebarSearch={setSidebarSearch}
                  onPinItem={handleSidebarPin}
                  onDeleteItem={handleSidebarDelete}
                  onRenameItem={handleSidebarRename}
                  onColorItem={handleSidebarColor}
                  onIconItem={handleSidebarIcon}
                  onCreateItem={handleSidebarCreate}
                />
              ) : (
                /* Fallback workspace nav (should not happen with hasSidebar guard) */
                <div style={{ padding: '8px 8px', display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <div style={{ fontSize: 10, fontWeight: 600, color: textDim, letterSpacing: '0.07em', textTransform: 'uppercase', padding: '4px 10px 6px' }}>{t('workspace')}</div>
                  {navItems.map((item) => {
                    const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href + '/'))
                    return (
                      <Link key={item.href} href={item.href} style={{
                        display: 'flex', alignItems: 'center', gap: 9,
                        padding: '7px 10px', borderRadius: 7, textDecoration: 'none',
                        fontSize: 13, fontWeight: active ? 500 : 400,
                        color: active ? textPrimary : navInactiveColor,
                        background: active ? navActiveBg : 'transparent',
                      }}>
                        <i className={`bx ${item.icon}`} style={{ fontSize: 15, width: 18, textAlign: 'center', opacity: active ? 1 : 0.5 }} />
                        {item.label}
                      </Link>
                    )
                  })}
                </div>
              )}
            </nav>

            {/* Tunnel status at bottom of panel */}
            <div style={{ padding: '8px 8px 10px', borderTop: `1px solid ${borderColor}` }}>
              <Link
                href="/tunnels"
                title={activeTunnel ? `${activeTunnel.name} — ${tunnelStatus}` : t('nav.tunnels')}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '6px 10px', borderRadius: 7,
                  background: 'var(--color-bg-alt)',
                  textDecoration: 'none', fontSize: 12, color: textMuted,
                }}
              >
                <span style={{
                  width: 7, height: 7, borderRadius: '50%',
                  background: tunnelStatusColor, flexShrink: 0,
                }} />
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {activeTunnel ? activeTunnel.name : t('nav.tunnels')}
                </span>
                <span style={{ fontSize: 10, color: tunnelStatusColor, fontWeight: 500 }}>
                  {tunnelStatus === 'connected' ? 'WS' : tunnelStatus === 'connecting' ? '...' : ''}
                </span>
              </Link>
            </div>
          </aside>

        {/* -- Main content area ----------------------------------- */}
        <div className="app-main" style={{ marginInlineStart: hasSidebar ? totalSidebarWidth : (sidebarCollapsed ? 56 : 56), flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', transition: 'margin-inline-start 0.2s ease' }}>
          {/* Top header */}
          <header className="app-header" style={{
            height: 52, flexShrink: 0, display: 'flex', alignItems: 'center',
            padding: '0 20px 0 20px', borderBottom: `1px solid ${borderColor}`,
            background: pageBg, gap: 8,
          }}>
            {/* Mobile hamburger */}
            <button
              className="app-hamburger"
              onClick={() => setMobileMenuOpen(v => !v)}
              style={{ color: textPrimary }}
              aria-label="Toggle menu"
            >
              <i className={`bx ${mobileMenuOpen ? 'bx-x' : 'bx-menu'}`} style={{ fontSize: 20 }} />
            </button>
            <span style={{ fontSize: 14, fontWeight: 600, color: textPrimary }}>{getPageTitle(pathname, t)}</span>
            {wsStatus !== 'disconnected' && (
              <span
                title={wsStatus === 'connected' ? t('realtimeConnected') : t('connecting')}
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

            {/* Search button */}
            <button
              onClick={() => setSearchOpen(true)}
              title={`${t('search')} (${navigator?.platform?.includes('Mac') ? '⌘' : 'Ctrl'}+K)`}
              style={{ width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: btnBellColor, border: `1px solid ${borderColor}`, background: btnBellBg, cursor: 'pointer' }}
            >
              <i className="bx bx-search" style={{ fontSize: 16 }} />
            </button>

            {/* Search spotlight (CMD+K) — toggle AI mode via bot icon */}
            <SearchSpotlight
              open={searchOpen}
              onClose={() => { setSearchOpen(false); setSearchResults([]); setSearchAiMode(false) }}
              onSearch={handleSearch}
              results={displayedSearchResults}
              onSelect={handleSearchSelect}
              placeholder={t('search')}
              loading={searchLoading}
              aiMode={searchAiMode}
              onAiToggle={setSearchAiMode}
              categories={[
                { id: 'project', label: 'Projects' },
                { id: 'feature', label: 'Features' },
                { id: 'note', label: 'Notes' },
                { id: 'plan', label: 'Plans' },
                { id: 'doc', label: 'Wiki' },
              ]}
            />

            {/* Notification bell */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setNotifOpen(v => !v)}
                style={{ width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: btnBellColor, border: `1px solid ${borderColor}`, background: btnBellBg, cursor: 'pointer', position: 'relative' }}
              >
                <i className="bx bx-bell" style={{ fontSize: 16 }} />
                {notifications.some(n => !n.read_at) && (
                  <span style={{ position: 'absolute', top: 6, right: 6, width: 6, height: 6, borderRadius: '50%', background: '#00e5ff', border: `1.5px solid ${unreadDotBorder}` }} />
                )}
              </button>
              {notifOpen && (
                <div className="app-notif-dropdown" style={{
                  position: 'absolute', top: 40, right: 0, width: 340,
                  background: notifBg, border: `1px solid ${notifBorder}`, borderRadius: 12,
                  boxShadow: 'var(--color-shadow-md)', zIndex: 100, overflow: 'hidden',
                }}>
                  <div style={{ padding: '12px 16px', borderBottom: `1px solid ${notifBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: textPrimary }}>
                      {t('notifications')}
                      {notifications.filter(n => !n.read_at).length > 0 && (
                        <span style={{ marginInlineStart: 8, fontSize: 10, padding: '1px 6px', borderRadius: 100, background: 'rgba(0,229,255,0.15)', color: '#00e5ff', fontWeight: 700 }}>
                          {notifications.filter(n => !n.read_at).length}
                        </span>
                      )}
                    </span>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <Link href="/notifications" onClick={() => setNotifOpen(false)} style={{ fontSize: 11, color: '#00e5ff', textDecoration: 'none' }}>{t('viewAll')}</Link>
                      <button onClick={() => setNotifOpen(false)} style={{ background: 'none', border: 'none', color: notifCloseColor, cursor: 'pointer', fontSize: 16, display: 'flex' }}>
                        <i className="bx bx-x" />
                      </button>
                    </div>
                  </div>
                  {notifications.length === 0 ? (
                    <div style={{ padding: '24px 16px', textAlign: 'center', fontSize: 12.5, color: notifDescColor }}>
                      No notifications yet
                    </div>
                  ) : (
                    notifications.slice(0, 5).map(n => {
                      const meta = NOTIF_TYPE_META[n.type] ?? NOTIF_TYPE_META['info']
                      return (
                        <div
                          key={n.id}
                          onClick={() => { if (!n.read_at) markNotificationRead(n.id) }}
                          style={{ padding: '12px 16px', borderBottom: `1px solid ${notifItemBorder}`, display: 'flex', gap: 10, cursor: !n.read_at ? 'pointer' : 'default', background: !n.read_at ? 'rgba(0,229,255,0.03)' : 'transparent' }}
                        >
                          <div style={{ width: 30, height: 30, borderRadius: 8, background: `${meta.color}14`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                            <i className={`bx ${meta.icon}`} style={{ fontSize: 14, color: meta.color }} />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 12.5, fontWeight: !n.read_at ? 600 : 500, color: textPrimary, marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{n.title}</div>
                            <div style={{ fontSize: 11.5, color: notifDescColor, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{n.message}</div>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
                            <span style={{ fontSize: 10.5, color: notifTimeColor }}>{notifTimeAgo(n.created_at)}</span>
                            {!n.read_at && <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#00e5ff' }} />}
                          </div>
                        </div>
                      )
                    })
                  )}
                  {notifications.some(n => !n.read_at) && (
                    <div style={{ padding: '10px 16px', textAlign: 'center' }}>
                      <button onClick={() => markAllRead()} style={{ fontSize: 12, color: '#00e5ff', background: 'none', border: 'none', cursor: 'pointer' }}>{t('markAllAsRead')}</button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Theme toggle */}
            <ThemeToggle size={32} />

            {/* User menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button style={{ display: 'flex', alignItems: 'center', padding: '2px', borderRadius: 50, border: '2px solid rgba(169,0,255,0.25)', background: 'transparent', cursor: 'pointer' }}>
                  <Avatar style={{ width: 28, height: 28 }}>
                    <AvatarImage src={user?.avatar_url || (user?.email ? gravatarUrl(user.email, 56) : undefined)} alt={initials} />
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
                <div style={{ padding: '10px 12px 8px', borderBottom: `1px solid ${dropdownUserBorder}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Avatar style={{ width: 36, height: 36, flexShrink: 0 }}>
                      <AvatarImage src={user?.avatar_url || (user?.email ? gravatarUrl(user.email, 72) : undefined)} alt={initials} />
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
                  <i className="bx bx-cog" style={{ marginInlineEnd: 8 }} /> {t('nav.settings')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/subscription')} style={{ color: textPrimary }}>
                  <i className="bx bx-credit-card" style={{ marginInlineEnd: 8 }} /> {t('nav.subscription')}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => { logout(); router.push('/login') }} style={{ color: '#ff6b6b' }}>
                  <i className="bx bx-log-out" style={{ marginInlineEnd: 8 }} /> {t('nav.signOut')}
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

      {/* Create item modal (triggered from sidebar + button) */}
      {createModal && (
        <CreateItemModal
          kind={createModal.kind}
          projectId={createModal.projectId}
          onClose={() => setCreateModal(null)}
          onSuccess={fetchSidebarData}
        />
      )}

      {/* Copilot bubble — always visible on every page */}
      <CopilotBubble />
    </div>
  )
}
