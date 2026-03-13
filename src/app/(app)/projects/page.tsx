'use client'
import { useEffect, useState, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useMCP } from '@/hooks/useMCP'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { useSidebarMetaStore } from '@/store/sidebar-meta'
import { useRoleStore } from '@/store/roles'
import { apiFetch } from '@/lib/api'

// ── Tooltip wrapper for stacked avatars ──
function AvatarTooltip({ label, children }: { label: string; children: React.ReactNode }) {
  const [show, setShow] = useState(false)
  const [pos, setPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const ref = useRef<HTMLDivElement>(null)

  return (
    <div
      ref={ref}
      onMouseEnter={() => {
        if (ref.current) {
          const r = ref.current.getBoundingClientRect()
          setPos({ x: r.left + r.width / 2, y: r.top - 4 })
        }
        setShow(true)
      }}
      onMouseLeave={() => setShow(false)}
      style={{ display: 'inline-flex', position: 'relative' }}
    >
      {children}
      {show && createPortal(
        <div style={{
          position: 'fixed', left: pos.x, top: pos.y, transform: 'translate(-50%, -100%)',
          zIndex: 10010, pointerEvents: 'none',
          padding: '4px 8px', borderRadius: 6,
          background: 'var(--color-bg-contrast)', border: '1px solid var(--color-border)',
          boxShadow: 'var(--color-shadow-sm)',
          fontSize: 11, fontWeight: 600, color: 'var(--color-fg)',
          whiteSpace: 'nowrap',
        }}>
          {label}
        </div>,
        document.body
      )}
    </div>
  )
}

interface Project {
  id: string
  slug: string
  name: string
  description?: string
  created_at: string
  updated_at: string
}

interface ProjectStatus {
  project_id: string
  total: number
  done: number
  in_progress: number
  backlog: number
  todo: number
}

// ── Color & icon options (same as sidebar) ──
const COLOR_OPTIONS = [
  { label: 'Default', value: '' },
  { label: 'Red', value: '#ef4444' },
  { label: 'Orange', value: '#f59e0b' },
  { label: 'Green', value: '#22c55e' },
  { label: 'Blue', value: '#3b82f6' },
  { label: 'Purple', value: '#a900ff' },
  { label: 'Cyan', value: '#00e5ff' },
  { label: 'Pink', value: '#ec4899' },
]

const ICON_OPTIONS = [
  { label: 'Default', value: '' },
  { label: 'Folder', value: 'bx-folder' },
  { label: 'Star', value: 'bxs-star' },
  { label: 'Heart', value: 'bxs-heart' },
  { label: 'Flag', value: 'bx-flag' },
  { label: 'Bookmark', value: 'bx-bookmark' },
  { label: 'Lightning', value: 'bx-bolt-circle' },
  { label: 'Code', value: 'bx-code-alt' },
  { label: 'Bug', value: 'bx-bug' },
  { label: 'Rocket', value: 'bx-rocket' },
  { label: 'Globe', value: 'bx-globe' },
  { label: 'Music', value: 'bx-music' },
]

// ── Context menu ──
function ProjectContextMenu({
  x, y, projectId, isPinned, activeTeamIds,
  onClose, onPin, onDelete, onRename, onSetColor, onSetIcon,
  teams, onToggleTeam, onOpenAssignModal,
}: {
  x: number; y: number
  projectId: string; isPinned?: boolean; activeTeamIds: string[]
  onClose: () => void
  onPin: () => void
  onDelete: () => void
  onRename: () => void
  onSetColor: (color: string) => void
  onSetIcon: (icon: string) => void
  teams: { id: string; name: string }[]
  onToggleTeam: (teamId: string) => void
  onOpenAssignModal: () => void
}) {
  const t = useTranslations('sidebar')
  const menuRef = useRef<HTMLDivElement>(null)
  const [colorSub, setColorSub] = useState(false)
  const [iconSub, setIconSub] = useState(false)
  const [teamSub, setTeamSub] = useState(false)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [onClose])

  const itemStyle: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: 8, width: '100%',
    padding: '6px 12px', background: 'transparent', border: 'none',
    cursor: 'pointer', fontSize: 12, color: 'var(--color-fg-muted)',
    textAlign: 'start', position: 'relative',
  }
  const ctxHoverBg = 'var(--color-bg-active)'
  const dropBg = 'var(--color-bg-contrast)'
  const dropBorder = 'var(--color-border)'

  const adjustedY = typeof window !== 'undefined' ? Math.min(y, window.innerHeight - 340) : y
  const adjustedX = typeof window !== 'undefined' ? Math.min(x, window.innerWidth - 200) : x

  function closeSubs() { setColorSub(false); setIconSub(false); setTeamSub(false) }

  return createPortal(
    <div ref={menuRef} style={{
      position: 'fixed', top: adjustedY, left: adjustedX, zIndex: 10001,
      background: dropBg, border: `1px solid ${dropBorder}`, borderRadius: 10,
      boxShadow: 'var(--color-shadow-md)',
      padding: '4px 0', minWidth: 170,
      backdropFilter: 'blur(12px)',
    }}>
      {/* Pin */}
      <button
        style={itemStyle}
        onClick={() => { onPin(); onClose() }}
        onMouseEnter={e => (e.currentTarget.style.background = ctxHoverBg)}
        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
      >
        <i className={`bx ${isPinned ? 'bx-pin' : 'bxs-pin'}`} style={{ fontSize: 14, width: 16, textAlign: 'center' }} />
        {isPinned ? t('unpin') : t('pin')}
      </button>

      {/* Rename */}
      <button
        style={itemStyle}
        onClick={() => { onRename(); onClose() }}
        onMouseEnter={e => (e.currentTarget.style.background = ctxHoverBg)}
        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
      >
        <i className="bx bx-edit-alt" style={{ fontSize: 14, width: 16, textAlign: 'center' }} />
        {t('rename')}
      </button>

      {/* Color submenu */}
      <div style={{ position: 'relative' }}>
        <button
          style={itemStyle}
          onClick={() => { closeSubs(); setColorSub(v => !v) }}
          onMouseEnter={e => (e.currentTarget.style.background = ctxHoverBg)}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          <i className="bx bx-palette" style={{ fontSize: 14, width: 16, textAlign: 'center' }} />
          {t('setColor')}
          <i className="bx bx-chevron-right" style={{ fontSize: 12, marginInlineStart: 'auto' }} />
        </button>
        {colorSub && (
          <div style={{
            position: 'absolute', top: 0, left: '100%', marginLeft: 4,
            background: dropBg, border: `1px solid ${dropBorder}`, borderRadius: 8,
            padding: '4px 0', minWidth: 130, boxShadow: 'var(--color-shadow-md)',
          }}>
            {COLOR_OPTIONS.map(c => (
              <button
                key={c.value || 'default'}
                style={{ ...itemStyle, gap: 8 }}
                onClick={() => { onSetColor(c.value); onClose() }}
                onMouseEnter={e => (e.currentTarget.style.background = ctxHoverBg)}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <span style={{
                  width: 12, height: 12, borderRadius: '50%', flexShrink: 0,
                  background: c.value || 'var(--color-fg-dim)',
                  border: c.value ? 'none' : '1px dashed var(--color-fg-dim)',
                }} />
                {c.value ? c.label : t('default')}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Icon submenu */}
      <div style={{ position: 'relative' }}>
        <button
          style={itemStyle}
          onClick={() => { closeSubs(); setIconSub(v => !v) }}
          onMouseEnter={e => (e.currentTarget.style.background = ctxHoverBg)}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          <i className="bx bx-shape-square" style={{ fontSize: 14, width: 16, textAlign: 'center' }} />
          {t('setIcon')}
          <i className="bx bx-chevron-right" style={{ fontSize: 12, marginInlineStart: 'auto' }} />
        </button>
        {iconSub && (
          <div style={{
            position: 'absolute', top: 0, left: '100%', marginLeft: 4,
            background: dropBg, border: `1px solid ${dropBorder}`, borderRadius: 8,
            padding: '4px 0', minWidth: 140, maxHeight: 240, overflowY: 'auto',
            boxShadow: 'var(--color-shadow-md)',
          }}>
            {ICON_OPTIONS.map(ic => (
              <button
                key={ic.value || 'default'}
                style={{ ...itemStyle, gap: 8 }}
                onClick={() => { onSetIcon(ic.value); onClose() }}
                onMouseEnter={e => (e.currentTarget.style.background = ctxHoverBg)}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                {ic.value ? <i className={`bx ${ic.value}`} style={{ fontSize: 14, width: 16, textAlign: 'center' }} /> : <span style={{ width: 16, textAlign: 'center', fontSize: 10 }}>--</span>}
                {ic.value ? ic.label : t('default')}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Add to Teams submenu (multi-select with checkmarks) */}
      {teams.length > 0 && (
        <div style={{ position: 'relative' }}>
          <button
            style={itemStyle}
            onClick={() => { closeSubs(); setTeamSub(v => !v) }}
            onMouseEnter={e => (e.currentTarget.style.background = ctxHoverBg)}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <i className="bx bx-group" style={{ fontSize: 14, width: 16, textAlign: 'center' }} />
            Teams
            {activeTeamIds.length > 0 && <span style={{ fontSize: 10, color: '#a900ff', fontWeight: 700, marginInlineStart: 4 }}>({activeTeamIds.length})</span>}
            <i className="bx bx-chevron-right" style={{ fontSize: 12, marginInlineStart: 'auto' }} />
          </button>
          {teamSub && (
            <div style={{
              position: 'absolute', top: 0, left: '100%', marginLeft: 4,
              background: dropBg, border: `1px solid ${dropBorder}`, borderRadius: 8,
              padding: '4px 0', minWidth: 170, maxHeight: 240, overflowY: 'auto',
              boxShadow: 'var(--color-shadow-md)',
            }}>
              {teams.map(tm => {
                const isActive = activeTeamIds.includes(tm.id)
                return (
                  <button
                    key={tm.id}
                    style={{ ...itemStyle, gap: 8 }}
                    onClick={() => onToggleTeam(tm.id)}
                    onMouseEnter={e => (e.currentTarget.style.background = ctxHoverBg)}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <i className={`bx ${isActive ? 'bx-check-square' : 'bx-square'}`} style={{ fontSize: 14, width: 16, textAlign: 'center', color: isActive ? '#a900ff' : 'var(--color-fg-dim)' }} />
                    <span style={{ color: isActive ? '#a900ff' : undefined, fontWeight: isActive ? 600 : undefined }}>{tm.name}</span>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Assign Member */}
      <button
        style={itemStyle}
        onClick={() => { onOpenAssignModal(); onClose() }}
        onMouseEnter={e => (e.currentTarget.style.background = ctxHoverBg)}
        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
      >
        <i className="bx bx-user-plus" style={{ fontSize: 14, width: 16, textAlign: 'center' }} />
        {t('assignMember')}
      </button>

      <div style={{ height: 1, background: dropBorder, margin: '4px 0' }} />

      {/* Delete */}
      <button
        style={{ ...itemStyle, color: '#ef4444' }}
        onClick={() => { onDelete(); onClose() }}
        onMouseEnter={e => (e.currentTarget.style.background = ctxHoverBg)}
        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
      >
        <i className="bx bx-trash" style={{ fontSize: 14, width: 16, textAlign: 'center' }} />
        {t('delete')}
      </button>
    </div>,
    document.body
  )
}

// ── Assign member modal (multi-select) ──
function AssignMemberModal({
  members, assignedIds, onToggle, onClose,
}: {
  members: { id: number; name: string; email: string; avatar_url?: string | null }[]
  assignedIds: string[]
  onToggle: (memberId: number) => void
  onClose: () => void
}) {
  const t = useTranslations('sidebar')
  const [search, setSearch] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { inputRef.current?.focus() }, [])
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const q = search.toLowerCase()
  const filtered = members.filter(m =>
    m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q)
  )

  return createPortal(
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 10002,
        background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--color-bg-contrast)', border: '1px solid var(--color-border)',
          borderRadius: 12, width: 340, maxHeight: 420, display: 'flex', flexDirection: 'column',
          boxShadow: 'var(--color-shadow-lg)', overflow: 'hidden',
        }}
      >
        <div style={{ padding: '14px 16px 10px', borderBottom: '1px solid var(--color-border)' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-fg)', marginBottom: 8 }}>
            {t('assignMember')}
          </div>
          <div style={{ position: 'relative' }}>
            <i className="bx bx-search" style={{
              position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)',
              fontSize: 14, color: 'var(--color-fg-dim)',
            }} />
            <input
              ref={inputRef}
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={t('searchMemberPlaceholder')}
              style={{
                width: '100%', padding: '7px 10px 7px 32px', fontSize: 12,
                background: 'var(--color-bg-active)', border: '1px solid var(--color-border)',
                borderRadius: 8, color: 'var(--color-fg)', outline: 'none',
              }}
            />
          </div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '4px 0' }}>
          {filtered.length === 0 && search && (
            <div style={{ padding: '16px', textAlign: 'center', fontSize: 12, color: 'var(--color-fg-dim)' }}>
              {t('noMembersFound')}
            </div>
          )}
          {filtered.map(m => {
            const isAssigned = assignedIds.includes(String(m.id))
            return (
              <button
                key={m.id}
                onClick={() => onToggle(m.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                  padding: '8px 16px', background: 'transparent', border: 'none',
                  cursor: 'pointer', fontSize: 12, color: isAssigned ? '#00e5ff' : 'var(--color-fg-muted)', textAlign: 'start',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-bg-active)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <i className={`bx ${isAssigned ? 'bx-check-square' : 'bx-square'}`} style={{ fontSize: 16, flexShrink: 0, color: isAssigned ? '#00e5ff' : 'var(--color-fg-dim)' }} />
                {m.avatar_url ? (
                  <img src={m.avatar_url} alt="" style={{ width: 24, height: 24, borderRadius: '50%', flexShrink: 0 }} />
                ) : (
                  <div style={{
                    width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                    background: isAssigned ? 'rgba(0,229,255,0.1)' : 'var(--color-bg-active)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 600, color: isAssigned ? '#00e5ff' : 'var(--color-fg-dim)',
                  }}>
                    {m.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: isAssigned ? 600 : 500, color: isAssigned ? '#00e5ff' : 'var(--color-fg)', fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--color-fg-dim)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.email}</div>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>,
    document.body
  )
}

// ── Rename inline input ──
function RenameInput({ value, onSave, onCancel }: { value: string; onSave: (v: string) => void; onCancel: () => void }) {
  const [val, setVal] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { inputRef.current?.focus(); inputRef.current?.select() }, [])

  return (
    <input
      ref={inputRef}
      value={val}
      onChange={e => setVal(e.target.value)}
      onKeyDown={e => {
        if (e.key === 'Enter') onSave(val.trim())
        if (e.key === 'Escape') onCancel()
      }}
      onBlur={() => onSave(val.trim())}
      onClick={e => { e.preventDefault(); e.stopPropagation() }}
      style={{
        fontSize: 14, fontWeight: 600, color: 'var(--color-fg)', letterSpacing: '-0.01em',
        background: 'var(--color-bg-alt)', border: '1px solid var(--color-border)',
        borderRadius: 6, padding: '2px 6px', outline: 'none', width: '100%',
      }}
    />
  )
}

export default function ProjectsPage() {
  const { callTool, status: connStatus, tunnel } = useMCP()
  const [projects, setProjects] = useState<Project[]>([])
  const [statuses, setStatuses] = useState<Record<string, ProjectStatus>>({})
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const t = useTranslations('app')
  const tNav = useTranslations('nav')

  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Context menu state
  const [ctxMenu, setCtxMenu] = useState<{ x: number; y: number; id: string; name: string } | null>(null)

  // Rename state
  const [renamingId, setRenamingId] = useState<string | null>(null)

  // Assign member modal
  const [assignTarget, setAssignTarget] = useState<string | null>(null)

  // Sidebar meta store (shared with sidebar for pin/color/icon/rename)
  const metaStore = useSidebarMetaStore()

  // Team & members from role store
  const { teams: roleTeams, members: roleMembers } = useRoleStore()

  const fetchProjects = useCallback(async () => {
    if (connStatus !== 'connected') return
    try {
      const result = await callTool('list_projects')
      const text = result.content?.[0]?.text ?? ''
      const parsed = parseMCPProjects(text)
      setProjects(parsed)
      setLoading(false)

      const statusMap: Record<string, ProjectStatus> = {}
      for (const p of parsed) {
        try {
          const statusResult = await callTool('get_project_status', { project_id: p.id })
          const statusText = statusResult.content?.[0]?.text ?? ''
          const ps = parseMCPProjectStatus(statusText, p.id)
          if (ps) statusMap[p.id] = ps
        } catch {
          // skip status errors
        }
      }
      setStatuses(statusMap)
    } catch (e) {
      console.error('[projects] fetch error:', e)
      setLoading(false)
    }
  }, [connStatus, callTool])

  useEffect(() => {
    if (connStatus === 'connected') {
      fetchProjects()
    }
  }, [connStatus, fetchProjects])

  const filtered = projects.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.description ?? '').toLowerCase().includes(search.toLowerCase())
  )

  async function handleDelete(projectId: string) {
    setDeletingId(projectId)
    try {
      await callTool('delete_project', { project_id: projectId })
      metaStore.removeMeta('projects', projectId)
      await fetchProjects()
    } catch (e) {
      console.error('[projects] delete error:', e)
    } finally {
      setDeletingId(null)
    }
  }

  function handleContextMenu(e: React.MouseEvent, id: string, name: string) {
    e.preventDefault()
    e.stopPropagation()
    setCtxMenu({ x: e.clientX, y: e.clientY, id, name })
  }

  function handleToggleTeam(projectId: string, teamId: string) {
    useSidebarMetaStore.getState().toggleTeam('projects', projectId, teamId)
  }

  async function handleToggleAssignee(projectId: string, memberId: number) {
    useSidebarMetaStore.getState().toggleAssignee('projects', projectId, String(memberId))
    // Send notification if member was just added (not removed)
    const currentIds = useSidebarMetaStore.getState().getAssigneeIds('projects', projectId)
    if (currentIds.includes(String(memberId))) {
      try {
        await apiFetch('/api/admin/notifications/send', {
          method: 'POST',
          body: JSON.stringify({
            user_ids: [memberId],
            title: 'New Assignment',
            message: `You have been assigned to project: ${projectId}`,
            type: 'info',
          }),
        })
      } catch {
        // Non-fatal
      }
    }
  }

  // Aggregate stats from all project statuses
  const totalProjects = projects.length
  const totalFeatures = Object.values(statuses).reduce((sum, s) => sum + s.total, 0)
  const totalInProgress = Object.values(statuses).reduce((sum, s) => sum + s.in_progress, 0)
  const totalDone = Object.values(statuses).reduce((sum, s) => sum + s.done, 0)
  const totalTodo = Object.values(statuses).reduce((sum, s) => sum + s.todo, 0)
  const totalBacklog = Object.values(statuses).reduce((sum, s) => sum + s.backlog, 0)

  const textPrimary = 'var(--color-fg)'
  const textMuted = 'var(--color-fg-dim)'
  const textDim = 'var(--color-fg-dim)'
  const cardBg = 'var(--color-bg-alt)'
  const cardBorder = 'var(--color-border)'
  const searchBg = 'var(--color-bg-alt)'
  const searchBorder = 'var(--color-border)'
  const searchColor = 'var(--color-fg)'
  const searchIconColor = 'var(--color-fg-dim)'
  const idBg = 'var(--color-bg-alt)'
  const idBorder = 'var(--color-border)'
  const idColor = 'var(--color-fg-dim)'
  const cardFooterBorder = 'var(--color-border)'
  const dateColor = 'var(--color-fg-dim)'
  const calIconColor = 'var(--color-fg-dim)'
  const skeletonHi = 'var(--color-bg-active)'
  const skeletonMid = 'var(--color-bg-alt)'
  const skeletonLo = 'var(--color-bg-alt)'
  const emptyIconColor = 'var(--color-fg-dim)'
  const emptyTitleColor = 'var(--color-fg-muted)'
  const descColor = 'var(--color-fg-dim)'
  const progressBg = 'var(--color-bg-active)'
  const statsColor = 'var(--color-fg-dim)'
  const warnColor = '#f59e0b'

  const card: React.CSSProperties = {
    background: cardBg,
    border: `1px solid ${cardBorder}`,
    borderRadius: 14,
  }

  // Not connected — show connection prompt
  if (connStatus !== 'connected' && connStatus !== 'connecting') {
    return (
      <div className="page-wrapper" style={{ padding: '28px 32px' }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: textPrimary, margin: '0 0 24px', letterSpacing: '-0.02em' }}>{tNav('projects')}</h1>
        <div style={{ ...card, padding: '60px 40px', textAlign: 'center' }}>
          <i className="bx bx-transfer-alt" style={{ fontSize: 40, color: warnColor, display: 'block', marginBottom: 14 }} />
          <div style={{ fontSize: 15, fontWeight: 600, color: emptyTitleColor, marginBottom: 6 }}>{t('noTunnelConnected')}</div>
          <div style={{ fontSize: 13, color: textDim, marginBottom: 20 }}>
            {t('connectTunnelProjects')}
          </div>
          <Link href="/tunnels" style={{ padding: '9px 20px', borderRadius: 9, border: 'none', background: 'linear-gradient(135deg, #00e5ff, #a900ff)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', textDecoration: 'none', display: 'inline-block' }}>
            {t('goToTunnels')}
          </Link>
        </div>
      </div>
    )
  }

  // Connecting — show connecting state
  if (connStatus === 'connecting') {
    return (
      <div className="page-wrapper" style={{ padding: '28px 32px' }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: textPrimary, margin: '0 0 24px', letterSpacing: '-0.02em' }}>{tNav('projects')}</h1>
        <div style={{ ...card, padding: '60px 40px', textAlign: 'center' }}>
          <i className="bx bx-loader-alt bx-spin" style={{ fontSize: 36, color: '#00e5ff', display: 'block', marginBottom: 14 }} />
          <div style={{ fontSize: 14, fontWeight: 600, color: emptyTitleColor, marginBottom: 6 }}>{t('connectingToWorkspace')}</div>
          {tunnel && <div style={{ fontSize: 12, color: textDim }}>{tunnel.name} ({tunnel.hostname})</div>}
        </div>
      </div>
    )
  }

  return (
    <div className="page-wrapper" style={{ padding: '28px 32px' }}>
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: textPrimary, margin: 0, letterSpacing: '-0.02em' }}>{tNav('projects')}</h1>
          <p style={{ fontSize: 13, color: textMuted, marginTop: 5 }}>
            {loading ? t('loadingFromWorkspace') : `${projects.length} project${projects.length !== 1 ? 's' : ''}`}
            {tunnel && (
              <span style={{ marginInlineStart: 8, fontSize: 11, color: textDim }}>
                <i className="bx bx-link" style={{ marginInlineEnd: 3, fontSize: 12 }} />
                {tunnel.name}
              </span>
            )}
          </p>
        </div>
      </div>

      {/* ── Dashboard Stats Row ── */}
      {!loading && projects.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
          <div style={{ ...card, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 40, height: 40, borderRadius: 11, background: 'rgba(0,229,255,0.08)', border: '1px solid rgba(0,229,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <i className="bx bx-folder" style={{ fontSize: 19, color: '#00e5ff' }} />
            </div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 800, color: textPrimary, lineHeight: 1.1 }}>{totalProjects}</div>
              <div style={{ fontSize: 11, color: textMuted, marginTop: 2 }}>Projects</div>
            </div>
          </div>

          <div style={{ ...card, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 40, height: 40, borderRadius: 11, background: 'rgba(169,0,255,0.08)', border: '1px solid rgba(169,0,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <i className="bx bx-git-branch" style={{ fontSize: 19, color: '#a900ff' }} />
            </div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 800, color: textPrimary, lineHeight: 1.1 }}>{totalInProgress}</div>
              <div style={{ fontSize: 11, color: textMuted, marginTop: 2 }}>In Progress</div>
            </div>
          </div>

          <div style={{ ...card, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 40, height: 40, borderRadius: 11, background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <i className="bx bx-check-circle" style={{ fontSize: 19, color: '#22c55e' }} />
            </div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 800, color: textPrimary, lineHeight: 1.1 }}>{totalDone}</div>
              <div style={{ fontSize: 11, color: textMuted, marginTop: 2 }}>Done</div>
            </div>
          </div>

          <div style={{ ...card, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 40, height: 40, borderRadius: 11, background: 'rgba(0,229,255,0.08)', border: '1px solid rgba(0,229,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <i className="bx bx-transfer-alt" style={{ fontSize: 19, color: '#00e5ff' }} />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#22c55e', lineHeight: 1.3 }}>Connected</div>
              <div style={{ fontSize: 11, color: textMuted, marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 120 }}>{tunnel?.name ?? 'MCP'}</div>
            </div>
          </div>
        </div>
      )}

      {/* Feature status breakdown mini-bar (aggregate) */}
      {!loading && totalFeatures > 0 && (
        <div style={{ ...card, padding: '14px 18px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: textPrimary, whiteSpace: 'nowrap' }}>
            {totalFeatures} Features
          </div>
          <div style={{ flex: 1, height: 6, borderRadius: 3, background: progressBg, overflow: 'hidden', display: 'flex' }}>
            {totalDone > 0 && <div style={{ width: `${(totalDone / totalFeatures) * 100}%`, height: '100%', background: '#22c55e', transition: 'width 0.3s ease' }} />}
            {totalInProgress > 0 && <div style={{ width: `${(totalInProgress / totalFeatures) * 100}%`, height: '100%', background: '#a900ff', transition: 'width 0.3s ease' }} />}
            {totalTodo > 0 && <div style={{ width: `${(totalTodo / totalFeatures) * 100}%`, height: '100%', background: '#00e5ff', transition: 'width 0.3s ease' }} />}
            {totalBacklog > 0 && <div style={{ width: `${(totalBacklog / totalFeatures) * 100}%`, height: '100%', background: 'var(--color-border)', transition: 'width 0.3s ease' }} />}
          </div>
          <div style={{ display: 'flex', gap: 12, fontSize: 11, color: textMuted, whiteSpace: 'nowrap' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />{totalDone} done</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 7, height: 7, borderRadius: '50%', background: '#a900ff', display: 'inline-block' }} />{totalInProgress} active</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 7, height: 7, borderRadius: '50%', background: '#00e5ff', display: 'inline-block' }} />{totalTodo} todo</span>
            {totalBacklog > 0 && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--color-border)', display: 'inline-block' }} />{totalBacklog} backlog</span>
            )}
          </div>
        </div>
      )}

      {/* Search */}
      <div className="search-wrapper" style={{ position: 'relative', marginBottom: 24, maxWidth: 380 }}>
        <i className="bx bx-search" style={{ position: 'absolute', insetInlineStart: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 15, color: searchIconColor, pointerEvents: 'none' }} />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={t('searchProjects')}
          style={{ width: '100%', padding: '9px 12px 9px 36px', borderRadius: 9, border: `1px solid ${searchBorder}`, background: searchBg, color: searchColor, fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
        />
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[1,2,3].map(i => (
            <div key={i} style={{ ...card, padding: '20px 24px', height: 90 }}>
              <div style={{ height: 14, borderRadius: 6, background: skeletonHi, marginBottom: 10, width: '30%' }} />
              <div style={{ height: 10, borderRadius: 5, background: skeletonMid, width: '70%', marginBottom: 6 }} />
              <div style={{ height: 10, borderRadius: 5, background: skeletonLo, width: '50%' }} />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ ...card, padding: '60px 40px', textAlign: 'center' }}>
          <i className="bx bx-folder" style={{ fontSize: 40, color: emptyIconColor, display: 'block', marginBottom: 14 }} />
          <div style={{ fontSize: 15, fontWeight: 600, color: emptyTitleColor, marginBottom: 6 }}>
            {search ? t('noMatchingProjects') : t('noProjectsYet')}
          </div>
          <div style={{ fontSize: 13, color: textDim }}>
            {search ? t('tryDifferentSearch') : t('createFirstProject')}
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map((p) => {
            const ps = statuses[p.id]
            const total = ps?.total ?? 0
            const done = ps?.done ?? 0
            const inProg = ps?.in_progress ?? 0
            const todo = ps?.todo ?? 0
            const backlog = ps?.backlog ?? 0
            const progress = total > 0 ? Math.round((done / total) * 100) : 0
            const meta = metaStore.getMeta('projects', p.id)
            const displayIcon = meta.icon || 'bx-folder'
            const displayColor = meta.color || '#00e5ff'
            const displayName = meta.customName || p.name
            const projectTeamIds = metaStore.getTeamIds('projects', p.id)
            const projectAssigneeIds = metaStore.getAssigneeIds('projects', p.id)
            const projectTeams = projectTeamIds.map(tid => roleTeams.find(t => t.id === tid)).filter(Boolean) as typeof roleTeams
            const projectMembers = projectAssigneeIds.map(mid => roleMembers.find(m => m.id === Number(mid))).filter(Boolean) as typeof roleMembers
            return (
              <Link
                key={p.id}
                href={`/projects/${p.id}`}
                onContextMenu={e => handleContextMenu(e, p.id, displayName)}
                style={{ ...card, padding: '18px 24px', textDecoration: 'none', display: 'block' }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                  {/* Icon */}
                  <div style={{ width: 40, height: 40, borderRadius: 11, background: `${displayColor}14`, border: `1px solid ${displayColor}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                    <i className={`bx ${displayIcon}`} style={{ fontSize: 19, color: displayColor }} />
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      {renamingId === p.id ? (
                        <RenameInput
                          value={displayName}
                          onSave={v => { if (v) metaStore.setCustomName('projects', p.id, v); setRenamingId(null) }}
                          onCancel={() => setRenamingId(null)}
                        />
                      ) : (
                        <span style={{ fontSize: 15, fontWeight: 600, color: textPrimary, letterSpacing: '-0.01em' }}>{displayName}</span>
                      )}
                      {meta.pinned && <i className="bx bxs-pin" style={{ fontSize: 12, color: textDim }} />}
                      <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 100, background: idBg, border: `1px solid ${idBorder}`, color: idColor, fontFamily: 'monospace', letterSpacing: '0.02em' }}>
                        {p.id}
                      </span>
                    </div>

                    {p.description && (
                      <div style={{ fontSize: 12.5, color: descColor, lineHeight: 1.6, marginBottom: 10 }}>
                        {p.description}
                      </div>
                    )}

                    {/* Progress bar */}
                    {total > 0 && (
                      <div style={{ maxWidth: 240 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                          <span style={{ fontSize: 10, color: statsColor }}>{t('featuresDone', { done, total })}</span>
                          <span style={{ fontSize: 10, color: progress === 100 ? '#22c55e' : statsColor }}>{progress}%</span>
                        </div>
                        <div style={{ height: 4, borderRadius: 2, background: progressBg, overflow: 'hidden', display: 'flex' }}>
                          {done > 0 && <div style={{ width: `${(done / total) * 100}%`, height: '100%', background: '#22c55e' }} />}
                          {inProg > 0 && <div style={{ width: `${(inProg / total) * 100}%`, height: '100%', background: '#a900ff' }} />}
                          {todo > 0 && <div style={{ width: `${(todo / total) * 100}%`, height: '100%', background: '#00e5ff' }} />}
                          {backlog > 0 && <div style={{ width: `${(backlog / total) * 100}%`, height: '100%', background: 'var(--color-border)' }} />}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right side — date, teams, members */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
                    {/* Date */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <i className="bx bx-calendar" style={{ fontSize: 12, color: calIconColor }} />
                      <span style={{ fontSize: 11, color: dateColor }}>{new Date(p.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    {/* Team stacked avatars */}
                    {projectTeams.length > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        {projectTeams.slice(0, 5).map((tm, idx) => (
                          <AvatarTooltip key={tm.id} label={tm.name}>
                            <div style={{
                              width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                              border: '2px solid var(--color-bg-alt)',
                              marginInlineStart: idx === 0 ? 0 : -8,
                              zIndex: projectTeams.length - idx,
                              position: 'relative',
                              overflow: 'hidden',
                              background: 'rgba(169,0,255,0.12)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              cursor: 'default',
                            }}>
                              {tm.avatar_url ? (
                                <img src={tm.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              ) : (
                                <span style={{ fontSize: 10, fontWeight: 700, color: '#a900ff', lineHeight: 1 }}>
                                  {tm.name.charAt(0).toUpperCase()}
                                </span>
                              )}
                            </div>
                          </AvatarTooltip>
                        ))}
                        {projectTeams.length > 5 && (
                          <AvatarTooltip label={projectTeams.slice(5).map(t => t.name).join(', ')}>
                            <div style={{
                              width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                              border: '2px solid var(--color-bg-alt)',
                              marginInlineStart: -8, zIndex: 0, position: 'relative',
                              background: 'rgba(169,0,255,0.08)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: 9, fontWeight: 700, color: '#a900ff', cursor: 'default',
                            }}>
                              +{projectTeams.length - 5}
                            </div>
                          </AvatarTooltip>
                        )}
                      </div>
                    )}
                    {/* Member stacked avatars */}
                    {projectMembers.length > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        {projectMembers.slice(0, 6).map((m, idx) => (
                          <AvatarTooltip key={m.id} label={m.name}>
                            <div style={{
                              width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                              border: '2px solid var(--color-bg-alt)',
                              marginInlineStart: idx === 0 ? 0 : -8,
                              zIndex: projectMembers.length - idx,
                              position: 'relative',
                              overflow: 'hidden',
                              background: 'var(--color-bg-active)',
                              cursor: 'default',
                            }}>
                              {m.avatar_url ? (
                                <img src={m.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              ) : (
                                <div style={{
                                  width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  fontSize: 10, fontWeight: 700, color: '#00e5ff',
                                  background: 'rgba(0,229,255,0.1)',
                                }}>
                                  {m.name.charAt(0).toUpperCase()}
                                </div>
                              )}
                            </div>
                          </AvatarTooltip>
                        ))}
                        {projectMembers.length > 6 && (
                          <AvatarTooltip label={projectMembers.slice(6).map(m => m.name).join(', ')}>
                            <div style={{
                              width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                              border: '2px solid var(--color-bg-alt)',
                              marginInlineStart: -8, zIndex: 0, position: 'relative',
                              background: 'rgba(0,229,255,0.08)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: 9, fontWeight: 700, color: '#00e5ff', cursor: 'default',
                            }}>
                              +{projectMembers.length - 6}
                            </div>
                          </AvatarTooltip>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Delete button */}
                  <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDelete(p.id) }}
                    disabled={deletingId === p.id}
                    title="Delete project"
                    style={{ padding: '4px 6px', borderRadius: 6, border: 'none', background: 'transparent', color: '#ef4444', fontSize: 14, cursor: 'pointer', opacity: deletingId === p.id ? 0.4 : 0.5, flexShrink: 0, marginTop: 2 }}
                  >
                    <i className={`bx ${deletingId === p.id ? 'bx-loader-alt bx-spin' : 'bx-trash'}`} />
                  </button>
                </div>
              </Link>
            )
          })}
        </div>
      )}

      {/* Context menu (portal) */}
      {ctxMenu && (
        <ProjectContextMenu
          x={ctxMenu.x}
          y={ctxMenu.y}
          projectId={ctxMenu.id}
          isPinned={metaStore.getMeta('projects', ctxMenu.id).pinned}
          activeTeamIds={metaStore.getTeamIds('projects', ctxMenu.id)}
          onClose={() => setCtxMenu(null)}
          onPin={() => metaStore.togglePin('projects', ctxMenu.id)}
          onDelete={() => handleDelete(ctxMenu.id)}
          onRename={() => setRenamingId(ctxMenu.id)}
          onSetColor={color => metaStore.setColor('projects', ctxMenu.id, color)}
          onSetIcon={icon => metaStore.setIcon('projects', ctxMenu.id, icon)}
          teams={roleTeams.map(t => ({ id: t.id, name: t.name }))}
          onToggleTeam={teamId => handleToggleTeam(ctxMenu.id, teamId)}
          onOpenAssignModal={() => setAssignTarget(ctxMenu.id)}
        />
      )}

      {/* Assign member modal */}
      {assignTarget && (
        <AssignMemberModal
          members={roleMembers.filter(m => m.status === 'active')}
          assignedIds={metaStore.getAssigneeIds('projects', assignTarget)}
          onToggle={memberId => handleToggleAssignee(assignTarget, memberId)}
          onClose={() => setAssignTarget(null)}
        />
      )}
    </div>
  )
}

// ============================================================
// MCP response parsers
// ============================================================

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'project'
}

function parseMCPProjects(text: string): Project[] {
  const projects: Project[] = []
  const lines = text.split('\n')

  for (const line of lines) {
    const matchWithSlug = line.match(/^-\s+\*\*(.+?)\*\*\s+\(`([^)]+)`\)(?:\s*[—–-]\s*(.+))?$/)
    const matchLegacy = line.match(/^-\s+\*\*(.+?)\*\*(?:\s*[—–-]\s*(.+))?$/)

    if (matchWithSlug) {
      const name = matchWithSlug[1].trim()
      const slug = matchWithSlug[2].trim()
      const description = matchWithSlug[3]?.trim() || undefined
      projects.push({ id: slug, slug, name, description, created_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    } else if (matchLegacy) {
      const name = matchLegacy[1].trim()
      const description = matchLegacy[2]?.trim() || undefined
      const slug = slugify(name)
      projects.push({ id: slug, slug, name, description, created_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    }
  }

  return projects
}

function parseMCPProjectStatus(text: string, projectId: string): ProjectStatus | null {
  const status: ProjectStatus = { project_id: projectId, total: 0, done: 0, in_progress: 0, backlog: 0, todo: 0 }

  const lines = text.split('\n')
  for (const line of lines) {
    if (!line.startsWith('|') || line.includes('---') || line.toLowerCase().includes('| status')) continue
    const cells = line.split('|').map(c => c.trim()).filter(Boolean)
    if (cells.length >= 2) {
      const key = cells[0].toLowerCase().replace(/\s+/g, '_').replace(/-/g, '_')
      const count = parseInt(cells[1], 10)
      if (!isNaN(count)) {
        status.total += count
        if (key === 'done') status.done = count
        else if (key === 'in_progress') status.in_progress = count
        else if (key === 'backlog') status.backlog = count
        else if (key === 'todo') status.todo = count
      }
    }
  }

  const totalMatch = text.match(/total[:\s]+(\d+)/i)
  if (totalMatch) status.total = parseInt(totalMatch[1], 10)

  const doneMatch = text.match(/done[:\s]+(\d+)/i)
  if (doneMatch) status.done = parseInt(doneMatch[1], 10)

  return status.total > 0 ? status : null
}
