'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { SidebarItem } from './sidebar-item'
import { useTunnelStore } from '@/store/tunnels'
import { useRoleStore } from '@/store/roles'
import { useSidebarMetaStore } from '@/store/sidebar-meta'

// ── Sidebar data types ───────────────────────────────────────
export interface SidebarProject { id: string; name: string; description?: string }
export interface SidebarNote { id: string; title: string; pinned: boolean; tags: string[]; icon?: string; color?: string }
export interface SidebarPlan { id: string; title: string; status: string; featureCount: number; project_id?: string }
export interface SidebarSession {
  id: string
  name: string
  account: string
  status: string
  messages: number
}
export interface SidebarDocFile { name: string; path: string; folder: string; pinned?: boolean; icon?: string; color?: string }
export interface SidebarDevPlugin { key: string; label: string; icon: string; color: string; toolCount: number }

// ── Skeleton shimmer line for loading states ──────────────────
function SkeletonLine({ width }: { width: string }) {
  return (
    <div className="skeleton-shimmer" style={{
      height: 48, borderRadius: 7, marginBottom: 4,
      background: 'var(--color-bg-alt)',
      width,
      animation: 'pulse 1.5s ease-in-out infinite',
    }} />
  )
}

// ── Color and icon picker options ────────────────────────────
const colorOptions = [
  { label: 'Default', value: '' },
  { label: 'Red', value: '#ef4444' },
  { label: 'Orange', value: '#f59e0b' },
  { label: 'Green', value: '#22c55e' },
  { label: 'Blue', value: '#3b82f6' },
  { label: 'Purple', value: '#a900ff' },
  { label: 'Cyan', value: '#00e5ff' },
  { label: 'Pink', value: '#ec4899' },
]

const iconOptions = [
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

// ── Delete confirmation dialog ───────────────────────────────
function DeleteConfirmDialog({
  itemName, onCancel, onConfirm,
}: {
  itemName: string
  onCancel: () => void
  onConfirm: () => void
}) {
  const t = useTranslations('sidebar')
  const overlayRef = useRef<HTMLDivElement>(null)

  return createPortal(
    <div
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) onCancel() }}
      style={{
        position: 'fixed', inset: 0, zIndex: 10000,
        background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <div style={{
        width: 300, padding: 20, borderRadius: 12,
        background: 'var(--color-bg-contrast)',
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--color-shadow-lg)',
      }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-fg)', marginBottom: 6 }}>
          {t('deleteConfirm', { name: itemName })}
        </div>
        <div style={{ fontSize: 12, color: 'var(--color-fg-muted)', marginBottom: 16 }}>
          {t('deleteConfirmMessage')}
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button
            onClick={onCancel}
            style={{
              padding: '6px 14px', borderRadius: 6, fontSize: 12, fontWeight: 500, cursor: 'pointer',
              background: 'transparent', color: 'var(--color-fg-muted)',
              border: '1px solid var(--color-border)',
            }}
          >
            {t('cancel')}
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: '6px 14px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer',
              background: '#ef4444', color: '#fff', border: '1px solid rgba(239,68,68,0.4)',
            }}
          >
            {t('delete')}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}

// ── Context menu (right-click) ───────────────────────────────
function SidebarContextMenu({
  x, y, section, isPinned,
  onClose, onPin, onDelete, onRename, onSetColor, onSetIcon,
}: {
  x: number; y: number
  section: string; isPinned?: boolean
  onClose: () => void
  onPin?: () => void
  onDelete: () => void
  onRename?: () => void
  onSetColor?: (color: string) => void
  onSetIcon?: (icon: string) => void
}) {
  const t = useTranslations('sidebar')
  const menuRef = useRef<HTMLDivElement>(null)
  const [colorSub, setColorSub] = useState(false)
  const [iconSub, setIconSub] = useState(false)

  const crudSections = ['projects', 'notes', 'plans', 'tunnels', 'chat', 'wiki']
  const hasPinAction = crudSections.includes(section)
  const hasRenameAction = crudSections.includes(section)
  const hasColorAction = crudSections.includes(section)
  const hasIconAction = crudSections.includes(section)

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

  const adjustedY = typeof window !== 'undefined' ? Math.min(y, window.innerHeight - 260) : y
  const adjustedX = typeof window !== 'undefined' ? Math.min(x, window.innerWidth - 200) : x

  return createPortal(
    <div ref={menuRef} style={{
      position: 'fixed', top: adjustedY, left: adjustedX, zIndex: 10001,
      background: dropBg, border: `1px solid ${dropBorder}`, borderRadius: 10,
      boxShadow: 'var(--color-shadow-md)',
      padding: '4px 0', minWidth: 170,
      backdropFilter: 'blur(12px)',
    }}>
      {hasPinAction && onPin && (
        <button
          style={itemStyle}
          onClick={() => { onPin(); onClose() }}
          onMouseEnter={e => (e.currentTarget.style.background = ctxHoverBg)}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          <i className={`bx ${isPinned ? 'bx-pin' : 'bxs-pin'}`} style={{ fontSize: 14, width: 16, textAlign: 'center' }} />
          {isPinned ? t('unpin') : t('pin')}
        </button>
      )}
      {hasRenameAction && onRename && (
        <button
          style={itemStyle}
          onClick={() => { onRename(); onClose() }}
          onMouseEnter={e => (e.currentTarget.style.background = ctxHoverBg)}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          <i className="bx bx-edit-alt" style={{ fontSize: 14, width: 16, textAlign: 'center' }} />
          {t('rename')}
        </button>
      )}
      {hasColorAction && onSetColor && (
        <div style={{ position: 'relative' }}>
          <button
            style={itemStyle}
            onClick={() => { setColorSub(v => !v); setIconSub(false) }}
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
              {colorOptions.map(c => (
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
      )}
      {hasIconAction && onSetIcon && (
        <div style={{ position: 'relative' }}>
          <button
            style={itemStyle}
            onClick={() => { setIconSub(v => !v); setColorSub(false) }}
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
              {iconOptions.map(ic => (
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
      )}
      <div style={{ height: 1, background: dropBorder, margin: '4px 0' }} />
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

// ── Plus button context menu dropdown ────────────────────────
function PlusContextMenu({
  options, anchorRect, onClose,
}: {
  options: Array<{ label: string; icon?: string; action: () => void }>
  anchorRect: DOMRect
  onClose: () => void
}) {
  const menuRef = useRef<HTMLDivElement>(null)
  const dropBg = 'var(--color-bg-contrast)'
  const dropBorder = 'var(--color-border)'
  const plusHoverBg = 'var(--color-bg-active)'

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [onClose])

  return createPortal(
    <div ref={menuRef} style={{
      position: 'fixed', top: anchorRect.bottom + 4, left: anchorRect.left, zIndex: 10001,
      background: dropBg, border: `1px solid ${dropBorder}`, borderRadius: 8,
      boxShadow: 'var(--color-shadow-md)',
      padding: '4px 0', minWidth: 200,
      backdropFilter: 'blur(12px)',
    }}>
      {options.map((opt, i) => (
        <button
          key={i}
          style={{
            display: 'flex', alignItems: 'center', gap: 8, width: '100%',
            padding: '7px 12px', background: 'transparent', border: 'none',
            cursor: 'pointer', fontSize: 12, color: 'var(--color-fg-muted)',
            textAlign: 'start',
          }}
          onClick={() => { opt.action(); onClose() }}
          onMouseEnter={e => (e.currentTarget.style.background = plusHoverBg)}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          {opt.icon && <i className={`bx ${opt.icon}`} style={{ fontSize: 14, width: 16, textAlign: 'center' }} />}
          {opt.label}
        </button>
      ))}
    </div>,
    document.body
  )
}

// ── Sidebar CRUD list panel ──────────────────────────────────
export function SidebarListPanel({
  section, activePath, textPrimary, textMuted, textDim, borderColor, navActiveBg, navInactiveColor,
  sidebarProjects, sidebarNotes, sidebarPlans, sessions, sidebarDocs, sidebarDevPlugins, sidebarLoading,
  sidebarSearch, setSidebarSearch,
  onPinItem, onDeleteItem, onRenameItem, onColorItem, onIconItem, onCreateItem,
}: {
  section: 'projects' | 'notes' | 'plans' | 'tunnels' | 'chat' | 'wiki' | 'devtools' | 'settings' | 'team'
  /** Effective pathname for active item highlighting (may differ from browser pathname when restoring last section) */
  activePath: string
  textPrimary: string
  textMuted: string
  textDim: string
  borderColor: string
  navActiveBg: string
  navInactiveColor: string
  sidebarProjects: SidebarProject[]
  sidebarNotes: SidebarNote[]
  sidebarPlans: SidebarPlan[]
  sessions: SidebarSession[]
  sidebarDocs: SidebarDocFile[]
  sidebarDevPlugins: SidebarDevPlugin[]
  sidebarLoading: boolean
  sidebarSearch: string
  setSidebarSearch: (v: string) => void
  onPinItem?: (section: string, id: string) => void
  onDeleteItem?: (section: string, id: string) => void
  onRenameItem?: (section: string, id: string, newName: string) => void
  onColorItem?: (section: string, id: string, color: string) => void
  onIconItem?: (section: string, id: string, icon: string) => void
  onCreateItem?: (section: string, kind: string, data: Record<string, string>) => void
}) {
  const router = useRouter()
  const { tunnels, connectionStatus: tunnelConnectionStatus } = useTunnelStore()
  const { can } = useRoleStore()
  const sidebarMeta = useSidebarMetaStore()
  const t = useTranslations('sidebar')
  const hoverBg = 'var(--color-bg-active)'

  // Infinite scroll state
  const [visibleCount, setVisibleCount] = useState(20)
  const sentinelRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Reset visible count when section or search changes
  useEffect(() => {
    setVisibleCount(20)
  }, [section, sidebarSearch])

  // IntersectionObserver for infinite scroll
  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisibleCount(prev => prev + 20)
        }
      },
      { rootMargin: '100px' }
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [sidebarLoading, section])

  // Delete confirmation state
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null)

  // Context menu state
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; id: string; name: string; isPinned?: boolean } | null>(null)

  // Plus context menu state
  const [plusMenuRect, setPlusMenuRect] = useState<DOMRect | null>(null)
  const plusBtnRef = useRef<HTMLButtonElement>(null)

  // Inline rename state
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const renameInputRef = useRef<HTMLInputElement>(null)

  // Focus rename input when it appears
  useEffect(() => {
    if (renamingId && renameInputRef.current) {
      renameInputRef.current.focus()
      renameInputRef.current.select()
    }
  }, [renamingId])

  // Swipe gesture state
  const swipeRef = useRef<{
    startX: number; startY: number; currentX: number; id: string; decided: boolean; direction: 'none' | 'horizontal' | 'vertical'
  } | null>(null)
  const [swipeState, setSwipeState] = useState<{ id: string; offsetX: number } | null>(null)

  // Selection mode state
  const [selectionMode, setSelectionMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  // Long-press state
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const longPressTriggeredRef = useRef(false)
  const swipeTriggeredRef = useRef(false)

  // Exit selection mode on section change
  useEffect(() => {
    setSelectionMode(false)
    setSelectedIds(new Set())
  }, [section])

  const handleTouchStart = useCallback((id: string, e: React.TouchEvent) => {
    const touch = e.touches[0]
    if (!touch) return
    swipeRef.current = { startX: touch.clientX, startY: touch.clientY, currentX: touch.clientX, id, decided: false, direction: 'none' }
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!swipeRef.current) return
    const touch = e.touches[0]
    if (!touch) return
    const dx = touch.clientX - swipeRef.current.startX
    const dy = touch.clientY - swipeRef.current.startY

    if (!swipeRef.current.decided) {
      if (Math.abs(dx) > 10 || Math.abs(dy) > 10) {
        swipeRef.current.decided = true
        swipeRef.current.direction = Math.abs(dx) > Math.abs(dy) ? 'horizontal' : 'vertical'
      }
      return
    }

    if (swipeRef.current.direction === 'vertical') return

    swipeRef.current.currentX = touch.clientX
    setSwipeState({ id: swipeRef.current.id, offsetX: dx })
  }, [])

  const handleTouchEnd = useCallback((itemId: string, itemName: string) => {
    if (!swipeRef.current || swipeRef.current.direction !== 'horizontal') {
      swipeRef.current = null
      setSwipeState(null)
      return
    }
    swipeTriggeredRef.current = true
    const dx = swipeRef.current.currentX - swipeRef.current.startX
    if (dx > 60) {
      onPinItem?.(section, itemId)
    } else if (dx < -60) {
      setDeleteTarget({ id: itemId, name: itemName })
    }
    swipeRef.current = null
    setSwipeState(null)
  }, [section, onPinItem])

  // ── Mouse-based swipe (desktop) ─────────────────────────────
  const handleMouseDown = useCallback((id: string, e: React.MouseEvent) => {
    // Ignore right-click
    if (e.button !== 0) return
    // Ignore if in selection mode (clicks toggle selection instead)
    if (selectionMode) return
    swipeRef.current = { startX: e.clientX, startY: e.clientY, currentX: e.clientX, id, decided: false, direction: 'none' }
    longPressTriggeredRef.current = false

    const handleMouseMove = (ev: MouseEvent) => {
      if (!swipeRef.current) return
      const dx = ev.clientX - swipeRef.current.startX
      const dy = ev.clientY - swipeRef.current.startY

      // Cancel long-press on any movement (even small)
      if ((Math.abs(dx) > 3 || Math.abs(dy) > 3) && longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current)
        longPressTimerRef.current = null
      }

      if (!swipeRef.current.decided) {
        if (Math.abs(dx) > 10 || Math.abs(dy) > 10) {
          swipeRef.current.decided = true
          swipeRef.current.direction = Math.abs(dx) > Math.abs(dy) ? 'horizontal' : 'vertical'
        }
        return
      }

      if (swipeRef.current.direction === 'vertical') return
      swipeRef.current.currentX = ev.clientX
      setSwipeState({ id: swipeRef.current.id, offsetX: dx })
    }

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      // Cancel long-press timer
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current)
        longPressTimerRef.current = null
      }

      if (!swipeRef.current || swipeRef.current.direction !== 'horizontal') {
        swipeRef.current = null
        setSwipeState(null)
        return
      }
      swipeTriggeredRef.current = true
      const dx = swipeRef.current.currentX - swipeRef.current.startX
      if (dx > 60) {
        onPinItem?.(section, swipeRef.current.id)
      } else if (dx < -60) {
        setDeleteTarget({ id: swipeRef.current.id, name: '' })
      }
      swipeRef.current = null
      setSwipeState(null)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }, [section, onPinItem, selectionMode])

  // ── Long-press to enter selection mode ──────────────────────
  const handleLongPressStart = useCallback((id: string) => {
    longPressTriggeredRef.current = false
    longPressTimerRef.current = setTimeout(() => {
      longPressTriggeredRef.current = true
      setSelectionMode(true)
      setSelectedIds(new Set([id]))
    }, 700)
  }, [])

  const handleLongPressEnd = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = null
    }
  }, [])

  const handleLongPressCancel = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = null
    }
  }, [])

  // ── Selection mode toggle ───────────────────────────────────
  const toggleSelection = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      // Exit selection mode if nothing selected
      if (next.size === 0) setSelectionMode(false)
      return next
    })
  }, [])

  const exitSelectionMode = useCallback(() => {
    setSelectionMode(false)
    setSelectedIds(new Set())
  }, [])

  // Get all visible IDs for the current section (for select-all)
  const getAllVisibleIds = useCallback((): string[] => {
    switch (section) {
      case 'projects': return sidebarProjects.filter(p => p.name.toLowerCase().includes(sidebarSearch.toLowerCase()) || p.id.toLowerCase().includes(sidebarSearch.toLowerCase())).map(p => p.id)
      case 'notes': return sidebarNotes.filter(n => n.title.toLowerCase().includes(sidebarSearch.toLowerCase()) || n.tags.some(tag => tag.toLowerCase().includes(sidebarSearch.toLowerCase()))).map(n => n.id)
      case 'plans': return sidebarPlans.filter(p => p.title.toLowerCase().includes(sidebarSearch.toLowerCase()) || p.id.toLowerCase().includes(sidebarSearch.toLowerCase())).map(p => p.id)
      case 'chat': return sessions.filter(s => s.name.toLowerCase().includes(sidebarSearch.toLowerCase()) || s.id.toLowerCase().includes(sidebarSearch.toLowerCase())).map(s => s.id)
      default: return []
    }
  }, [section, sidebarProjects, sidebarNotes, sidebarPlans, sessions, sidebarSearch])

  const selectAll = useCallback(() => {
    const ids = getAllVisibleIds()
    if (ids.length > 0) {
      setSelectionMode(true)
      setSelectedIds(new Set(ids))
    }
  }, [getAllVisibleIds])

  // CMD+A / Ctrl+A to select all when in selection mode
  useEffect(() => {
    if (!selectionMode) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'a') {
        e.preventDefault()
        selectAll()
      }
      if (e.key === 'Escape') {
        exitSelectionMode()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [selectionMode, selectAll, exitSelectionMode])

  // ── Bulk actions ────────────────────────────────────────────
  const handleBulkPin = useCallback(() => {
    selectedIds.forEach(id => onPinItem?.(section, id))
    exitSelectionMode()
  }, [selectedIds, section, onPinItem, exitSelectionMode])

  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false)

  const handleBulkDelete = useCallback(() => {
    selectedIds.forEach(id => onDeleteItem?.(section, id))
    exitSelectionMode()
    setBulkDeleteConfirm(false)
  }, [selectedIds, section, onDeleteItem, exitSelectionMode])

  const getSwipeOffset = (id: string) => {
    if (swipeState && swipeState.id === id) return swipeState.offsetX
    return 0
  }

  const handleContextMenu = useCallback((e: React.MouseEvent, id: string, name: string, isPinned?: boolean) => {
    if (section === 'settings' || section === 'team') return
    e.preventDefault()
    setContextMenu({ x: e.clientX, y: e.clientY, id, name, isPinned })
  }, [section])

  const handleRenameSubmit = useCallback((id: string) => {
    if (renameValue.trim() && renameValue.trim() !== '') {
      onRenameItem?.(section, id, renameValue.trim())
    }
    setRenamingId(null)
  }, [section, renameValue, onRenameItem])

  const handleDeleteConfirm = useCallback(() => {
    if (deleteTarget) {
      onDeleteItem?.(section, deleteTarget.id)
      setDeleteTarget(null)
    }
  }, [section, deleteTarget, onDeleteItem])

  const sectionLabels: Record<string, string> = {
    projects: t('nav.projects'),
    notes: t('nav.notes'),
    plans: t('nav.plans'),
    tunnels: t('nav.tunnels'),
    chat: t('nav.chat'),
    wiki: t('nav.wiki'),
    devtools: t('nav.devtools'),
    settings: t('nav.settings'),
    team: t('nav.team'),
  }

  const sectionIcons: Record<string, string> = {
    projects: 'bx-folder',
    notes: 'bx-note',
    plans: 'bx-map',
    tunnels: 'bx-transfer-alt',
    chat: 'bx-message-rounded-dots',
    wiki: 'bx-book-open',
    devtools: 'bx-wrench',
    settings: 'bx-cog',
    team: 'bx-group',
  }

  const newRoutes: Record<string, string> = {
    projects: '/projects',
    notes: '/notes',
    plans: '/plans',
    tunnels: '/tunnels',
    chat: '/chat',
    wiki: '/wiki',
    devtools: '/devtools',
    settings: '/settings',
    team: '/team',
  }

  // Detect project scope from active path
  const isInProjectScope = activePath.startsWith('/projects/') && activePath !== '/projects'
  const projectSlug = isInProjectScope ? activePath.split('/')[2] : null

  const plusMenuSections: Record<string, Array<{ label: string; icon?: string; action: () => void }>> = {
    projects: isInProjectScope && projectSlug
      ? [
          { label: t('newPlan'), icon: 'bx-map', action: () => onCreateItem?.('projects', 'plan', { project_id: projectSlug }) },
          { label: t('newFeature'), icon: 'bx-task', action: () => onCreateItem?.('projects', 'feature', { project_id: projectSlug }) },
        ]
      : [
          { label: t('newProject'), icon: 'bx-folder-plus', action: () => onCreateItem?.('projects', 'project', {}) },
        ],
    notes: [
      { label: t('newNote'), icon: 'bx-note', action: () => router.push('/notes') },
      { label: t('newPinnedNote'), icon: 'bx-pin', action: () => { router.push('/notes'); console.log('[sidebar] new pinned note') } },
    ],
    chat: [
      { label: t('newChat'), icon: 'bx-message-add', action: () => router.push('/chat') },
      { label: t('newChatPrompt'), icon: 'bx-message-square-edit', action: () => { router.push('/chat'); console.log('[sidebar] new chat with system prompt') } },
    ],
    plans: [
      { label: t('newPlan'), icon: 'bx-map', action: () => router.push('/plans') },
    ],
  }

  const handlePlusClick = () => {
    if (section === 'settings' || section === 'team') return
    const menuOptions = plusMenuSections[section]
    if (menuOptions && plusBtnRef.current) {
      const rect = plusBtnRef.current.getBoundingClientRect()
      setPlusMenuRect(rect)
    } else {
      router.push(newRoutes[section])
    }
  }

  // Filter items by search
  const filteredProjects = sidebarProjects.filter(p =>
    p.name.toLowerCase().includes(sidebarSearch.toLowerCase()) ||
    p.id.toLowerCase().includes(sidebarSearch.toLowerCase())
  )
  const filteredNotes = sidebarNotes.filter(n =>
    n.title.toLowerCase().includes(sidebarSearch.toLowerCase()) ||
    n.tags.some(tag => tag.toLowerCase().includes(sidebarSearch.toLowerCase()))
  )
  const filteredPlans = sidebarPlans.filter(p =>
    p.title.toLowerCase().includes(sidebarSearch.toLowerCase()) ||
    p.id.toLowerCase().includes(sidebarSearch.toLowerCase())
  )
  const filteredTunnels = tunnels.filter(tun =>
    tun.name.toLowerCase().includes(sidebarSearch.toLowerCase()) ||
    tun.os.toLowerCase().includes(sidebarSearch.toLowerCase())
  )
  const filteredSessions = sessions.filter(s =>
    s.name.toLowerCase().includes(sidebarSearch.toLowerCase()) ||
    s.id.toLowerCase().includes(sidebarSearch.toLowerCase())
  )
  const filteredDocs = sidebarDocs.filter(d =>
    d.name.toLowerCase().includes(sidebarSearch.toLowerCase()) ||
    d.folder.toLowerCase().includes(sidebarSearch.toLowerCase())
  )
  const filteredDevPlugins = sidebarDevPlugins.filter(p =>
    p.label.toLowerCase().includes(sidebarSearch.toLowerCase()) ||
    p.key.toLowerCase().includes(sidebarSearch.toLowerCase())
  )

  // Plan status color helper
  const planStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return '#22c55e'
      case 'in-progress': return '#f59e0b'
      case 'completed': return '#a900ff'
      default: return textMuted
    }
  }

  // Render inline rename input or label text
  const renderLabel = (id: string, label: string, style: React.CSSProperties) => {
    if (renamingId === id) {
      return (
        <input
          ref={renameInputRef}
          value={renameValue}
          onChange={e => setRenameValue(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') handleRenameSubmit(id)
            if (e.key === 'Escape') setRenamingId(null)
          }}
          onBlur={() => handleRenameSubmit(id)}
          style={{
            ...style,
            background: 'var(--color-bg-active)',
            border: '1px solid rgba(169,0,255,0.25)',
            borderRadius: 4, padding: '1px 4px', outline: 'none', width: '100%',
          }}
          onClick={e => e.stopPropagation()}
        />
      )
    }
    return <div style={style}>{label}</div>
  }

  // Swipe indicator backgrounds
  const renderSwipeBackground = (offsetX: number) => {
    if (offsetX === 0) return null
    const isRight = offsetX > 0
    return (
      <div style={{
        position: 'absolute', inset: 0, borderRadius: 7, display: 'flex', alignItems: 'center',
        justifyContent: isRight ? 'flex-start' : 'flex-end',
        padding: '0 14px',
        background: isRight ? 'rgba(0,229,255,0.12)' : 'rgba(239,68,68,0.12)',
      }}>
        <i
          className={`bx ${isRight ? 'bxs-pin' : 'bx-trash'}`}
          style={{ fontSize: 16, color: isRight ? '#00e5ff' : '#ef4444' }}
        />
      </div>
    )
  }

  const getTotalItems = () => {
    switch (section) {
      case 'projects': return filteredProjects.length
      case 'notes': return filteredNotes.length
      case 'plans': return filteredPlans.length
      case 'tunnels': return filteredTunnels.length
      case 'chat': return filteredSessions.length
      case 'wiki': return filteredDocs.length
      case 'devtools': return filteredDevPlugins.length
      default: return 0
    }
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Delete confirmation dialog */}
      {deleteTarget && (
        <DeleteConfirmDialog
          itemName={deleteTarget.name}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleDeleteConfirm}
        />
      )}

      {/* Context menu */}
      {contextMenu && (
        <SidebarContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          section={section}
          isPinned={contextMenu.isPinned}
          onClose={() => setContextMenu(null)}
          onPin={() => onPinItem?.(section, contextMenu.id)}
          onDelete={() => setDeleteTarget({ id: contextMenu.id, name: contextMenu.name })}
          onRename={() => { setRenamingId(contextMenu.id); setRenameValue(contextMenu.name) }}
          onSetColor={(color) => onColorItem?.(section, contextMenu.id, color)}
          onSetIcon={(icon) => onIconItem?.(section, contextMenu.id, icon)}
        />
      )}

      {/* Plus button context menu */}
      {plusMenuRect && plusMenuSections[section] && (
        <PlusContextMenu
          options={plusMenuSections[section]}
          anchorRect={plusMenuRect}
          onClose={() => setPlusMenuRect(null)}
        />
      )}

      {/* Section header with + button */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 14px 6px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <i className={`bx ${sectionIcons[section]}`} style={{ fontSize: 13, color: textMuted }} />
          <span style={{
            fontSize: 11, fontWeight: 600, color: textDim,
            letterSpacing: '0.07em', textTransform: 'uppercase',
          }}>
            {sectionLabels[section]}
          </span>
        </div>
        {section !== 'settings' && section !== 'team' && (
          <button
            ref={plusBtnRef}
            onClick={handlePlusClick}
            title={`New ${section.slice(0, -1)}`}
            style={{
              width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: 5, border: `1px solid ${borderColor}`,
              background: 'transparent', cursor: 'pointer', color: textMuted, fontSize: 14,
            }}
            onMouseEnter={e => (e.currentTarget.style.background = hoverBg)}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <i className="bx bx-plus" />
          </button>
        )}
      </div>

      {/* Search input -- shown for all sections except settings */}
      {section !== 'settings' && section !== 'team' && (
        <div style={{ padding: '0 10px 6px' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '5px 8px', borderRadius: 6,
            background: 'var(--color-bg-alt)',
            border: `1px solid ${borderColor}`,
          }}>
            <i className="bx bx-search" style={{ fontSize: 13, color: textMuted, flexShrink: 0 }} />
            <input
              type="text"
              value={sidebarSearch}
              onChange={e => setSidebarSearch(e.target.value)}
              placeholder={t('search')}
              style={{
                flex: 1, fontSize: 12, background: 'transparent', border: 'none',
                outline: 'none', color: textPrimary,
              }}
            />
            {sidebarSearch && (
              <button
                onClick={() => setSidebarSearch('')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: textMuted, fontSize: 12, display: 'flex', padding: 0 }}
              >
                <i className="bx bx-x" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* List items */}
      <div ref={scrollContainerRef} style={{ flex: 1, overflowY: 'auto', padding: '0 6px' }}>
        {sidebarLoading ? (
          /* Loading skeleton */
          <div style={{ padding: '4px 4px' }}>
            <SkeletonLine width="100%" />
            <SkeletonLine width="90%" />
            <SkeletonLine width="95%" />
            <SkeletonLine width="85%" />
          </div>
        ) : section === 'projects' ? (
          filteredProjects.length === 0 ? (
            <div style={{ padding: '20px 10px', textAlign: 'center', fontSize: 12, color: textMuted }}>
              {sidebarSearch ? t('noResults') : t('noItems')}
            </div>
          ) : (
            [...filteredProjects].sort((a, b) => {
              const aPinned = sidebarMeta.getMeta('projects', a.id).pinned ? 1 : 0
              const bPinned = sidebarMeta.getMeta('projects', b.id).pinned ? 1 : 0
              return bPinned - aPinned
            }).slice(0, visibleCount).map(p => {
              const meta = sidebarMeta.getMeta('projects', p.id)
              const displayName = meta.customName || p.name
              const active = activePath === `/projects/${p.id}` || activePath.startsWith(`/projects/${p.id}/`)
              const offset = getSwipeOffset(p.id)
              const isSelected = selectedIds.has(p.id)
              return (
                <div
                  key={p.id}
                  style={{
                    position: 'relative', marginBottom: 2, overflow: 'hidden',
                    borderRadius: 8,
                    background: isSelected ? 'var(--color-accent-active)' : undefined,
                  }}
                  onContextMenu={(e) => handleContextMenu(e, p.id, displayName, meta.pinned)}
                  onTouchStart={(e) => { handleTouchStart(p.id, e); handleLongPressStart(p.id) }}
                  onTouchMove={(e) => { handleTouchMove(e); handleLongPressCancel() }}
                  onTouchEnd={() => { handleTouchEnd(p.id, displayName); handleLongPressEnd() }}
                  onMouseDown={(e) => { handleMouseDown(p.id, e); handleLongPressStart(p.id) }}
                  onMouseUp={handleLongPressEnd}
                  onMouseLeave={handleLongPressCancel}
                  onClick={(e) => {
                    if (longPressTriggeredRef.current) { longPressTriggeredRef.current = false; return }
                    if (swipeTriggeredRef.current) { swipeTriggeredRef.current = false; return }
                    if (selectionMode) { e.preventDefault(); e.stopPropagation(); toggleSelection(p.id); return }
                    router.push(`/projects/${p.id}`)
                  }}
                >
                  {renderSwipeBackground(offset)}
                  <div style={{
                    position: 'relative', borderRadius: 8,
                    transform: offset ? `translateX(${offset}px)` : undefined,
                    transition: offset ? 'none' : 'transform 0.2s ease',
                  }}>
                  {renamingId === p.id ? (
                    <div style={{ padding: '7px 10px', display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 26, height: 26, borderRadius: 7, flexShrink: 0,
                        background: meta.color ? `${meta.color}15` : 'rgba(169,0,255,0.08)',
                        border: `1px solid ${meta.color ? `${meta.color}25` : 'rgba(169,0,255,0.15)'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 10, fontWeight: 700, color: meta.color || '#a900ff',
                      }}>
                        {meta.icon ? <i className={`bx ${meta.icon}`} style={{ fontSize: 13 }} /> : displayName[0]?.toUpperCase() ?? '?'}
                      </div>
                      <input
                        ref={renameInputRef}
                        value={renameValue}
                        onChange={e => setRenameValue(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') handleRenameSubmit(p.id)
                          if (e.key === 'Escape') setRenamingId(null)
                        }}
                        onBlur={() => handleRenameSubmit(p.id)}
                        style={{
                          flex: 1, fontSize: 13, background: 'var(--color-bg-active)',
                          border: `1px solid ${meta.color ? `${meta.color}40` : 'rgba(169,0,255,0.25)'}`,
                          borderRadius: 4, padding: '2px 6px', outline: 'none', color: 'var(--color-fg)',
                        }}
                        onClick={e => e.stopPropagation()}
                      />
                    </div>
                  ) : (
                    <div style={{ pointerEvents: selectionMode ? 'none' : undefined, display: 'flex', alignItems: 'center' }}>
                      {selectionMode && (
                        <div style={{
                          width: 16, height: 16, borderRadius: 4, flexShrink: 0, marginLeft: 8,
                          border: `2px solid ${isSelected ? '#a900ff' : 'var(--color-fg-dim)'}`,
                          background: isSelected ? '#a900ff' : 'transparent',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none',
                        }}>
                          {isSelected && <i className="bx bx-check" style={{ fontSize: 12, color: '#fff' }} />}
                        </div>
                      )}
                      <SidebarItem
                        id={p.id}
                        href={`/projects/${p.id}`}
                        label={displayName}
                        description={p.description}
                        letterBadge={meta.icon ? undefined : displayName[0]?.toUpperCase() ?? '?'}
                        icon={meta.icon || undefined}
                        iconColor={meta.color || undefined}
                        iconBg={meta.color ? `${meta.color}15` : undefined}
                        active={active}
                        pinned={meta.pinned}
                      />
                    </div>
                  )}
                  </div>
                </div>
              )
            })
          )
        ) : section === 'notes' ? (
          filteredNotes.length === 0 ? (
            <div style={{ padding: '20px 10px', textAlign: 'center', fontSize: 12, color: textMuted }}>
              {sidebarSearch ? t('noResults') : t('noItems')}
            </div>
          ) : (
            /* Sort pinned first */
            [...filteredNotes].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0)).slice(0, visibleCount).map(n => {
              const offset = getSwipeOffset(n.id)
              const isSelected = selectedIds.has(n.id)
              return (
                <div
                  key={n.id}
                  style={{
                    position: 'relative', marginBottom: 2, overflow: 'hidden',
                    borderRadius: 8,
                    background: isSelected ? 'var(--color-accent-active)' : undefined,
                  }}
                  onContextMenu={(e) => handleContextMenu(e, n.id, n.title, n.pinned)}
                  onTouchStart={(e) => { handleTouchStart(n.id, e); handleLongPressStart(n.id) }}
                  onTouchMove={(e) => { handleTouchMove(e); handleLongPressCancel() }}
                  onTouchEnd={() => { handleTouchEnd(n.id, n.title); handleLongPressEnd() }}
                  onMouseDown={(e) => { handleMouseDown(n.id, e); handleLongPressStart(n.id) }}
                  onMouseUp={handleLongPressEnd}
                  onMouseLeave={handleLongPressCancel}
                  onClick={(e) => {
                    if (longPressTriggeredRef.current) { longPressTriggeredRef.current = false; return }
                    if (swipeTriggeredRef.current) { swipeTriggeredRef.current = false; return }
                    if (selectionMode) { e.preventDefault(); e.stopPropagation(); toggleSelection(n.id); return }
                    router.push(`/notes?id=${n.id}`)
                  }}
                >
                  {renderSwipeBackground(offset)}
                  <div style={{
                    position: 'relative', borderRadius: 8,
                    transform: offset ? `translateX(${offset}px)` : undefined,
                    transition: offset ? 'none' : 'transform 0.2s ease',
                  }}>
                  {renamingId === n.id ? (
                    <div style={{ padding: '7px 10px', display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 26, height: 26, borderRadius: 7, flexShrink: 0,
                        background: n.color ? `${n.color}15` : 'var(--color-bg-alt)',
                        border: `1px solid ${n.color ? `${n.color}25` : 'var(--color-border)'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <i className={`bx ${n.icon || 'bx-note'}`} style={{ fontSize: 13, color: n.color || 'var(--color-fg-muted)' }} />
                      </div>
                      <input
                        ref={renameInputRef}
                        value={renameValue}
                        onChange={e => setRenameValue(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') handleRenameSubmit(n.id)
                          if (e.key === 'Escape') setRenamingId(null)
                        }}
                        onBlur={() => handleRenameSubmit(n.id)}
                        style={{
                          flex: 1, fontSize: 13, background: 'var(--color-bg-active)',
                          border: '1px solid rgba(169,0,255,0.25)',
                          borderRadius: 4, padding: '2px 6px', outline: 'none', color: 'var(--color-fg)',
                        }}
                        onClick={e => e.stopPropagation()}
                      />
                    </div>
                  ) : (
                    <div style={{ pointerEvents: selectionMode ? 'none' : undefined, display: 'flex', alignItems: 'center' }}>
                      {selectionMode && (
                        <div style={{
                          width: 16, height: 16, borderRadius: 4, flexShrink: 0, marginLeft: 8,
                          border: `2px solid ${isSelected ? '#a900ff' : 'var(--color-fg-dim)'}`,
                          background: isSelected ? '#a900ff' : 'transparent',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none',
                        }}>
                          {isSelected && <i className="bx bx-check" style={{ fontSize: 12, color: '#fff' }} />}
                        </div>
                      )}
                      <SidebarItem
                        id={n.id}
                        href={`/notes?id=${n.id}`}
                        label={n.title}
                        description={n.tags.length > 0 ? n.tags.join(', ') : undefined}
                        icon={n.icon || 'bx-note'}
                        iconColor={n.color || undefined}
                        iconBg={n.color ? `${n.color}15` : undefined}
                        active={activePath === `/notes?id=${n.id}`}
                        pinned={n.pinned}
                      />
                    </div>
                  )}
                  </div>
                </div>
              )
            })
          )
        ) : section === 'plans' ? (
          filteredPlans.length === 0 ? (
            <div style={{ padding: '20px 10px', textAlign: 'center', fontSize: 12, color: textMuted }}>
              {sidebarSearch ? t('noResults') : t('noItems')}
            </div>
          ) : (
            [...filteredPlans].sort((a, b) => {
              const aPinned = sidebarMeta.getMeta('plans', a.id).pinned ? 1 : 0
              const bPinned = sidebarMeta.getMeta('plans', b.id).pinned ? 1 : 0
              return bPinned - aPinned
            }).slice(0, visibleCount).map(p => {
              const meta = sidebarMeta.getMeta('plans', p.id)
              const displayName = meta.customName || p.title
              const offset = getSwipeOffset(p.id)
              const isSelected = selectedIds.has(p.id)
              return (
                <div
                  key={p.id}
                  style={{
                    position: 'relative', marginBottom: 2, overflow: 'hidden',
                    borderRadius: 8,
                    background: isSelected ? 'var(--color-accent-active)' : undefined,
                  }}
                  onContextMenu={(e) => handleContextMenu(e, p.id, displayName, meta.pinned)}
                  onTouchStart={(e) => { handleTouchStart(p.id, e); handleLongPressStart(p.id) }}
                  onTouchMove={(e) => { handleTouchMove(e); handleLongPressCancel() }}
                  onTouchEnd={() => { handleTouchEnd(p.id, displayName); handleLongPressEnd() }}
                  onMouseDown={(e) => { handleMouseDown(p.id, e); handleLongPressStart(p.id) }}
                  onMouseUp={handleLongPressEnd}
                  onMouseLeave={handleLongPressCancel}
                  onClick={(e) => {
                    if (longPressTriggeredRef.current) { longPressTriggeredRef.current = false; return }
                    if (swipeTriggeredRef.current) { swipeTriggeredRef.current = false; return }
                    if (selectionMode) { e.preventDefault(); e.stopPropagation(); toggleSelection(p.id); return }
                    router.push(`/plans/${p.id}${p.project_id ? `?project=${p.project_id}` : ''}`)
                  }}
                >
                  {renderSwipeBackground(offset)}
                  <div style={{
                    position: 'relative', borderRadius: 8,
                    transform: offset ? `translateX(${offset}px)` : undefined,
                    transition: offset ? 'none' : 'transform 0.2s ease',
                  }}>
                  {renamingId === p.id ? (
                    <div style={{ padding: '7px 10px', display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{
                        width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                        background: meta.color || planStatusColor(p.status),
                      }} />
                      <input
                        ref={renameInputRef}
                        value={renameValue}
                        onChange={e => setRenameValue(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') handleRenameSubmit(p.id)
                          if (e.key === 'Escape') setRenamingId(null)
                        }}
                        onBlur={() => handleRenameSubmit(p.id)}
                        style={{
                          flex: 1, fontSize: 13, background: 'var(--color-bg-active)',
                          border: '1px solid rgba(169,0,255,0.25)',
                          borderRadius: 4, padding: '2px 6px', outline: 'none', color: 'var(--color-fg)',
                        }}
                        onClick={e => e.stopPropagation()}
                      />
                    </div>
                  ) : (
                    <div style={{ pointerEvents: selectionMode ? 'none' : undefined, display: 'flex', alignItems: 'center' }}>
                      {selectionMode && (
                        <div style={{
                          width: 16, height: 16, borderRadius: 4, flexShrink: 0, marginLeft: 8,
                          border: `2px solid ${isSelected ? '#a900ff' : 'var(--color-fg-dim)'}`,
                          background: isSelected ? '#a900ff' : 'transparent',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none',
                        }}>
                          {isSelected && <i className="bx bx-check" style={{ fontSize: 12, color: '#fff' }} />}
                        </div>
                      )}
                      <SidebarItem
                        id={p.id}
                        href={`/plans/${p.id}${p.project_id ? `?project=${p.project_id}` : ''}`}
                        label={displayName}
                        description={`${p.status} · ${p.featureCount} feat${p.featureCount !== 1 ? 's' : ''}`}
                        icon={meta.icon || 'bx-map-alt'}
                        iconColor={meta.color || planStatusColor(p.status)}
                        iconBg={`${meta.color || planStatusColor(p.status)}15`}
                        active={activePath?.startsWith(`/plans/${p.id}`) ?? false}
                        pinned={meta.pinned}
                      />
                    </div>
                  )}
                  </div>
                </div>
              )
            })
          )
        ) : section === 'tunnels' ? (
          filteredTunnels.length === 0 ? (
            <div style={{ padding: '20px 10px', textAlign: 'center', fontSize: 12, color: textMuted }}>
              {t('noItems')}
            </div>
          ) : (
            [...filteredTunnels].sort((a, b) => {
              const aPinned = sidebarMeta.getMeta('tunnels', a.id).pinned ? 1 : 0
              const bPinned = sidebarMeta.getMeta('tunnels', b.id).pinned ? 1 : 0
              return bPinned - aPinned
            }).slice(0, visibleCount).map(tun => {
              const meta = sidebarMeta.getMeta('tunnels', tun.id)
              const displayName = meta.customName || tun.name
              const status = tunnelConnectionStatus[tun.id] ?? 'disconnected'
              const dotColor = meta.color || (status === 'connected' ? '#22c55e' : status === 'connecting' ? '#f59e0b' : status === 'error' ? '#ef4444' : '#6b7280')
              const offset = getSwipeOffset(tun.id)
              const isSelected = selectedIds.has(tun.id)
              return (
                <div
                  key={tun.id}
                  style={{
                    position: 'relative', marginBottom: 2, overflow: 'hidden',
                    borderRadius: 8,
                    background: isSelected ? 'var(--color-accent-active)' : undefined,
                  }}
                  onContextMenu={(e) => handleContextMenu(e, tun.id, displayName, meta.pinned)}
                  onTouchStart={(e) => { handleTouchStart(tun.id, e); handleLongPressStart(tun.id) }}
                  onTouchMove={(e) => { handleTouchMove(e); handleLongPressCancel() }}
                  onTouchEnd={() => { handleTouchEnd(tun.id, displayName); handleLongPressEnd() }}
                  onMouseDown={(e) => { handleMouseDown(tun.id, e); handleLongPressStart(tun.id) }}
                  onMouseUp={handleLongPressEnd}
                  onMouseLeave={handleLongPressCancel}
                  onClick={(e) => {
                    if (longPressTriggeredRef.current) { longPressTriggeredRef.current = false; return }
                    if (swipeTriggeredRef.current) { swipeTriggeredRef.current = false; return }
                    if (selectionMode) { e.preventDefault(); e.stopPropagation(); toggleSelection(tun.id); return }
                    router.push('/tunnels')
                  }}
                >
                  {renderSwipeBackground(offset)}
                  <div style={{
                    position: 'relative', borderRadius: 8,
                    transform: offset ? `translateX(${offset}px)` : undefined,
                    transition: offset ? 'none' : 'transform 0.2s ease',
                  }}>
                  {renamingId === tun.id ? (
                    <div style={{ padding: '7px 10px', display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{
                        width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                        background: dotColor,
                      }} />
                      <input
                        ref={renameInputRef}
                        value={renameValue}
                        onChange={e => setRenameValue(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') handleRenameSubmit(tun.id)
                          if (e.key === 'Escape') setRenamingId(null)
                        }}
                        onBlur={() => handleRenameSubmit(tun.id)}
                        style={{
                          flex: 1, fontSize: 13, background: 'var(--color-bg-active)',
                          border: '1px solid rgba(169,0,255,0.25)',
                          borderRadius: 4, padding: '2px 6px', outline: 'none', color: 'var(--color-fg)',
                        }}
                        onClick={e => e.stopPropagation()}
                      />
                    </div>
                  ) : (
                    <div style={{ pointerEvents: selectionMode ? 'none' : undefined, display: 'flex', alignItems: 'center' }}>
                      {selectionMode && (
                        <div style={{
                          width: 16, height: 16, borderRadius: 4, flexShrink: 0, marginLeft: 8,
                          border: `2px solid ${isSelected ? '#a900ff' : 'var(--color-fg-dim)'}`,
                          background: isSelected ? '#a900ff' : 'transparent',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none',
                        }}>
                          {isSelected && <i className="bx bx-check" style={{ fontSize: 12, color: '#fff' }} />}
                        </div>
                      )}
                      <SidebarItem
                        id={tun.id}
                        href="/tunnels"
                        label={displayName}
                        description={tun.os + (tun.status === 'online' ? ` · ${tun.tool_count} tools` : ' · offline')}
                        dot={dotColor}
                        pinned={meta.pinned}
                      />
                    </div>
                  )}
                  </div>
                </div>
              )
            })
          )
        ) : section === 'chat' ? (
          filteredSessions.length === 0 ? (
            <div style={{ padding: '24px 12px', textAlign: 'center', fontSize: 12, color: textDim }}>
              {sidebarSearch ? t('noResults') : t('noItems')}
            </div>
          ) : (
            [...filteredSessions].sort((a, b) => {
              const aPinned = sidebarMeta.getMeta('chat', a.id).pinned ? 1 : 0
              const bPinned = sidebarMeta.getMeta('chat', b.id).pinned ? 1 : 0
              return bPinned - aPinned
            }).slice(0, visibleCount).map(session => {
              const meta = sidebarMeta.getMeta('chat', session.id)
              const displayName = meta.customName || session.name || session.id
              const offset = getSwipeOffset(session.id)
              const isSelected = selectedIds.has(session.id)
              const sessionDotColor = meta.color || (session.status === 'active' ? '#22c55e' : session.status === 'paused' ? '#f59e0b' : '#6b7280')
              return (
                <div
                  key={session.id}
                  style={{
                    position: 'relative', marginBottom: 2, overflow: 'hidden',
                    borderRadius: 8,
                    background: isSelected ? 'var(--color-accent-active)' : undefined,
                  }}
                  onContextMenu={(e) => handleContextMenu(e, session.id, displayName, meta.pinned)}
                  onTouchStart={(e) => { handleTouchStart(session.id, e); handleLongPressStart(session.id) }}
                  onTouchMove={(e) => { handleTouchMove(e); handleLongPressCancel() }}
                  onTouchEnd={() => { handleTouchEnd(session.id, displayName); handleLongPressEnd() }}
                  onMouseDown={(e) => { handleMouseDown(session.id, e); handleLongPressStart(session.id) }}
                  onMouseUp={handleLongPressEnd}
                  onMouseLeave={handleLongPressCancel}
                  onClick={(e) => {
                    if (longPressTriggeredRef.current) { longPressTriggeredRef.current = false; return }
                    if (swipeTriggeredRef.current) { swipeTriggeredRef.current = false; return }
                    if (selectionMode) { e.preventDefault(); e.stopPropagation(); toggleSelection(session.id); return }
                    router.push(`/chat?session=${session.id}`)
                  }}
                >
                  {renderSwipeBackground(offset)}
                  <div style={{
                    position: 'relative', borderRadius: 8,
                    transform: offset ? `translateX(${offset}px)` : undefined,
                    transition: offset ? 'none' : 'transform 0.2s ease',
                  }}>
                  {renamingId === session.id ? (
                    <div style={{ padding: '7px 10px', display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{
                        width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                        background: sessionDotColor,
                      }} />
                      <input
                        ref={renameInputRef}
                        value={renameValue}
                        onChange={e => setRenameValue(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') handleRenameSubmit(session.id)
                          if (e.key === 'Escape') setRenamingId(null)
                        }}
                        onBlur={() => handleRenameSubmit(session.id)}
                        style={{
                          flex: 1, fontSize: 13, background: 'var(--color-bg-active)',
                          border: '1px solid rgba(169,0,255,0.25)',
                          borderRadius: 4, padding: '2px 6px', outline: 'none', color: 'var(--color-fg)',
                        }}
                        onClick={e => e.stopPropagation()}
                      />
                    </div>
                  ) : (
                    <div style={{ pointerEvents: selectionMode ? 'none' : undefined, display: 'flex', alignItems: 'center' }}>
                      {selectionMode && (
                        <div style={{
                          width: 16, height: 16, borderRadius: 4, flexShrink: 0, marginLeft: 8,
                          border: `2px solid ${isSelected ? '#a900ff' : 'var(--color-fg-dim)'}`,
                          background: isSelected ? '#a900ff' : 'transparent',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none',
                        }}>
                          {isSelected && <i className="bx bx-check" style={{ fontSize: 12, color: '#fff' }} />}
                        </div>
                      )}
                      <SidebarItem
                        id={session.id}
                        href={`/chat?session=${session.id}`}
                        label={displayName}
                        description={`${session.account} · ${session.messages} msgs`}
                        dot={sessionDotColor}
                        active={activePath === `/chat?session=${session.id}`}
                        pinned={meta.pinned}
                      />
                    </div>
                  )}
                  </div>
                </div>
              )
            })
          )
        ) : section === 'wiki' ? (
          /* ── Wiki docs flat list (pinned first) ── */
          filteredDocs.length === 0 ? (
            <div style={{ padding: '24px 12px', textAlign: 'center', fontSize: 12, color: textDim }}>
              {sidebarSearch ? t('noResults') : t('noItems')}
            </div>
          ) : (
            [...filteredDocs]
              .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0))
              .slice(0, visibleCount)
              .map(doc => {
                const title = doc.name.replace(/\.md$/, '').replace(/^\d+-/, '').replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
                const wikiProject = sidebarProjects[0]?.id || ''
                const isActive = activePath === `/wiki?file=${encodeURIComponent(doc.path)}&project=${encodeURIComponent(wikiProject)}`
                const offset = getSwipeOffset(doc.path)
                const isSelected = selectedIds.has(doc.path)
                return (
                  <div
                    key={doc.path}
                    style={{
                      position: 'relative', marginBottom: 2, overflow: 'hidden',
                      borderRadius: 8,
                      background: isSelected ? 'var(--color-accent-active)' : undefined,
                    }}
                    onContextMenu={(e) => handleContextMenu(e, doc.path, title)}
                    onTouchStart={(e) => { handleTouchStart(doc.path, e); handleLongPressStart(doc.path) }}
                    onTouchMove={(e) => { handleTouchMove(e); handleLongPressCancel() }}
                    onTouchEnd={() => { handleTouchEnd(doc.path, title); handleLongPressEnd() }}
                    onMouseDown={(e) => { handleMouseDown(doc.path, e); handleLongPressStart(doc.path) }}
                    onMouseUp={handleLongPressEnd}
                    onMouseLeave={handleLongPressCancel}
                    onClick={(e) => {
                      if (longPressTriggeredRef.current) { longPressTriggeredRef.current = false; return }
                      if (swipeTriggeredRef.current) { swipeTriggeredRef.current = false; return }
                      if (selectionMode) { e.preventDefault(); e.stopPropagation(); toggleSelection(doc.path); return }
                      router.push(`/wiki?file=${encodeURIComponent(doc.path)}&project=${encodeURIComponent(wikiProject)}`)
                    }}
                  >
                    {renderSwipeBackground(offset)}
                    <div style={{
                      position: 'relative', borderRadius: 8,
                      transform: offset ? `translateX(${offset}px)` : undefined,
                      transition: offset ? 'none' : 'transform 0.2s ease',
                    }}>
                    {renamingId === doc.path ? (
                      <div style={{ padding: '7px 10px', display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 26, height: 26, borderRadius: 7, flexShrink: 0,
                          background: 'var(--color-bg-alt)', border: '1px solid var(--color-border)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <i className={`bx ${doc.icon || 'bx-file-blank'}`} style={{ fontSize: 13, color: doc.color || 'var(--color-fg-muted)' }} />
                        </div>
                        <input
                          ref={renameInputRef}
                          value={renameValue}
                          onChange={e => setRenameValue(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') handleRenameSubmit(doc.path)
                            if (e.key === 'Escape') setRenamingId(null)
                          }}
                          onBlur={() => handleRenameSubmit(doc.path)}
                          style={{
                            flex: 1, fontSize: 13, background: 'var(--color-bg-active)',
                            border: '1px solid rgba(169,0,255,0.25)',
                            borderRadius: 4, padding: '2px 6px', outline: 'none', color: 'var(--color-fg)',
                          }}
                          onClick={e => e.stopPropagation()}
                        />
                      </div>
                    ) : (
                      <div style={{ pointerEvents: selectionMode ? 'none' : undefined, display: 'flex', alignItems: 'center' }}>
                        {selectionMode && (
                          <div style={{
                            width: 16, height: 16, borderRadius: 4, flexShrink: 0, marginLeft: 8,
                            border: `2px solid ${isSelected ? '#a900ff' : 'var(--color-fg-dim)'}`,
                            background: isSelected ? '#a900ff' : 'transparent',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none',
                          }}>
                            {isSelected && <i className="bx bx-check" style={{ fontSize: 12, color: '#fff' }} />}
                          </div>
                        )}
                        <SidebarItem
                          id={doc.path}
                          href={`/wiki?file=${encodeURIComponent(doc.path)}&project=${encodeURIComponent(wikiProject)}`}
                          label={title}
                          description={doc.folder || undefined}
                          icon={doc.icon || 'bx-file-blank'}
                          iconColor={doc.color || undefined}
                          iconBg={doc.color ? `${doc.color}15` : undefined}
                          active={isActive}
                          pinned={doc.pinned}
                        />
                      </div>
                    )}
                    </div>
                  </div>
                )
              })
          )
        ) : section === 'devtools' ? (
          /* ── DevTools plugin list ── */
          filteredDevPlugins.length === 0 ? (
            <div style={{ padding: '24px 12px', textAlign: 'center', fontSize: 12, color: textDim }}>
              {sidebarSearch ? t('noResults') : t('noItems')}
            </div>
          ) : (
            filteredDevPlugins.map(plugin => {
              const isActive = activePath === `/devtools?plugin=${plugin.key}`
              return (
                <SidebarItem
                  key={plugin.key}
                  id={plugin.key}
                  href={`/devtools?plugin=${plugin.key}`}
                  label={plugin.label}
                  description={`${plugin.toolCount} tool${plugin.toolCount !== 1 ? 's' : ''}`}
                  icon={plugin.icon}
                  iconColor={plugin.color}
                  iconBg={`${plugin.color}15`}
                  active={isActive}
                />
              )
            })
          )
        ) : section === 'settings' ? (
          <>
            <nav style={{ padding: '4px 8px', display: 'flex', flexDirection: 'column', gap: 1 }}>
              {/* Account group */}
              <div style={{ fontSize: 10, fontWeight: 600, color: textDim, letterSpacing: '0.06em', textTransform: 'uppercase', padding: '8px 10px 4px' }}>{t('settingsAccount')}</div>
              {[
                { id: 'profile', label: t('settingsProfile'), icon: 'bx-user' },
                { id: 'password', label: t('settingsPassword'), icon: 'bx-lock-alt' },
                { id: 'appearance', label: t('settingsAppearance'), icon: 'bx-palette' },
              ].map(item => {
                const isActive = activePath === `/settings?tab=${item.id}`
                return (
                  <Link key={item.id} href={`/settings?tab=${item.id}`} className="sidebar-item" style={{
                    display: 'flex', alignItems: 'center', gap: 9,
                    padding: '7px 10px', borderRadius: 7, textDecoration: 'none',
                    fontSize: 13, fontWeight: isActive ? 500 : 400,
                    color: isActive ? textPrimary : navInactiveColor,
                    background: isActive ? navActiveBg : 'transparent',
                  }}>
                    <i className={`bx ${item.icon}`} style={{ fontSize: 15, width: 18, textAlign: 'center', opacity: isActive ? 1 : 0.5 }} />
                    {item.label}
                  </Link>
                )
              })}
              {/* Security group */}
              <div style={{ fontSize: 10, fontWeight: 600, color: textDim, letterSpacing: '0.06em', textTransform: 'uppercase', padding: '8px 10px 4px' }}>{t('settingsSecurity')}</div>
              {[
                { id: '2fa', label: t('settings2fa'), icon: 'bx-shield-quarter' },
                { id: 'passkeys', label: t('settingsPasskeys'), icon: 'bx-key' },
                { id: 'social', label: t('settingsConnectedAccounts'), icon: 'bx-link' },
                { id: 'sessions', label: t('settingsSessions'), icon: 'bx-devices' },
                { id: 'apitokens', label: t('settingsApiTokens'), icon: 'bx-code-block' },
              ].map(item => {
                const isActive = activePath === `/settings?tab=${item.id}`
                return (
                  <Link key={item.id} href={`/settings?tab=${item.id}`} className="sidebar-item" style={{
                    display: 'flex', alignItems: 'center', gap: 9,
                    padding: '7px 10px', borderRadius: 7, textDecoration: 'none',
                    fontSize: 13, fontWeight: isActive ? 500 : 400,
                    color: isActive ? textPrimary : navInactiveColor,
                    background: isActive ? navActiveBg : 'transparent',
                  }}>
                    <i className={`bx ${item.icon}`} style={{ fontSize: 15, width: 18, textAlign: 'center', opacity: isActive ? 1 : 0.5 }} />
                    {item.label}
                  </Link>
                )
              })}
              {/* Notifications group */}
              <div style={{ fontSize: 10, fontWeight: 600, color: textDim, letterSpacing: '0.06em', textTransform: 'uppercase', padding: '8px 10px 4px' }}>{t('settingsNotifications')}</div>
              {[
                { id: 'push', label: t('settingsPush'), icon: 'bx-bell' },
              ].map(item => {
                const isActive = activePath === `/settings?tab=${item.id}`
                return (
                  <Link key={item.id} href={`/settings?tab=${item.id}`} className="sidebar-item" style={{
                    display: 'flex', alignItems: 'center', gap: 9,
                    padding: '7px 10px', borderRadius: 7, textDecoration: 'none',
                    fontSize: 13, fontWeight: isActive ? 500 : 400,
                    color: isActive ? textPrimary : navInactiveColor,
                    background: isActive ? navActiveBg : 'transparent',
                  }}>
                    <i className={`bx ${item.icon}`} style={{ fontSize: 15, width: 18, textAlign: 'center', opacity: isActive ? 1 : 0.5 }} />
                    {item.label}
                  </Link>
                )
              })}
              {/* Admin settings group */}
              {can('canViewAdmin') && (
                <>
                  <div style={{ height: 1, background: borderColor, margin: '8px 10px' }} />
                  <div style={{ fontSize: 10, fontWeight: 600, color: '#a900ff', letterSpacing: '0.06em', textTransform: 'uppercase', padding: '8px 10px 4px', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <i className="bx bx-shield-alt-2" style={{ fontSize: 12 }} />
                    {t('settingsAdminSection')}
                  </div>
                  {[
                    { id: 'admin-general', label: t('settingsAdminGeneral'), icon: 'bx-cog' },
                    { id: 'admin-features', label: t('settingsAdminFeatures'), icon: 'bx-toggle-right' },
                    { id: 'admin-homepage', label: t('settingsAdminHomepage'), icon: 'bx-home-alt' },
                    { id: 'admin-agents', label: t('settingsAdminAgents'), icon: 'bx-bot' },
                    { id: 'admin-contact', label: t('settingsAdminContact'), icon: 'bx-envelope' },
                    { id: 'admin-pricing', label: t('settingsAdminPricing'), icon: 'bx-dollar-circle' },
                    { id: 'admin-download', label: t('settingsAdminDownload'), icon: 'bx-download' },
                    { id: 'admin-integrations', label: t('settingsAdminIntegrations'), icon: 'bx-plug' },
                    { id: 'admin-email', label: t('settingsAdminEmail'), icon: 'bx-mail-send' },
                    { id: 'admin-aimodels', label: t('settingsAdminAI'), icon: 'bx-brain' },
                    { id: 'admin-seo', label: t('settingsAdminSEO'), icon: 'bx-search-alt' },
                    { id: 'admin-discord', label: 'Discord Bot', icon: 'bxl-discord-alt' },
                    { id: 'admin-slack', label: 'Slack Bot', icon: 'bxl-slack' },
                  ].map(item => {
                    const isActive = activePath === `/settings?tab=${item.id}`
                    return (
                      <Link key={item.id} href={`/settings?tab=${item.id}`} className="sidebar-item" style={{
                        display: 'flex', alignItems: 'center', gap: 9,
                        padding: '7px 10px', borderRadius: 7, textDecoration: 'none',
                        fontSize: 13, fontWeight: isActive ? 500 : 400,
                        color: isActive ? textPrimary : navInactiveColor,
                        background: isActive ? navActiveBg : 'transparent',
                      }}>
                        <i className={`bx ${item.icon}`} style={{ fontSize: 15, width: 18, textAlign: 'center', opacity: isActive ? 1 : 0.5 }} />
                        {item.label}
                      </Link>
                    )
                  })}
                </>
              )}
            </nav>
          </>
        ) : section === 'team' ? (
          <>
            <nav style={{ padding: '4px 8px', display: 'flex', flexDirection: 'column', gap: 1 }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: textDim, letterSpacing: '0.06em', textTransform: 'uppercase', padding: '8px 10px 4px' }}>{t('teamGeneral')}</div>
              {[
                { id: 'overview', label: t('teamOverview'), icon: 'bx-home-alt-2' },
                { id: 'members', label: t('teamMembers'), icon: 'bx-group' },
              ].map(item => (
                <Link key={item.id} href={`/team?tab=${item.id}`} className="sidebar-item" style={{
                  display: 'flex', alignItems: 'center', gap: 9,
                  padding: '7px 10px', borderRadius: 7, textDecoration: 'none',
                  fontSize: 13, fontWeight: 400, color: navInactiveColor, background: 'transparent',
                }}>
                  <i className={`bx ${item.icon}`} style={{ fontSize: 15, width: 18, textAlign: 'center', opacity: 0.5 }} />
                  {item.label}
                </Link>
              ))}
              {can('canManageTeam') && (
                <>
                  <div style={{ fontSize: 10, fontWeight: 600, color: textDim, letterSpacing: '0.06em', textTransform: 'uppercase', padding: '8px 10px 4px' }}>{t('teamManagement')}</div>
                  {[
                    { id: 'settings', label: t('teamSettings'), icon: 'bx-cog' },
                    { id: 'billing', label: t('teamBilling'), icon: 'bx-credit-card' },
                  ].map(item => (
                    <Link key={item.id} href={`/team?tab=${item.id}`} className="sidebar-item" style={{
                      display: 'flex', alignItems: 'center', gap: 9,
                      padding: '7px 10px', borderRadius: 7, textDecoration: 'none',
                      fontSize: 13, fontWeight: 400, color: navInactiveColor, background: 'transparent',
                    }}>
                      <i className={`bx ${item.icon}`} style={{ fontSize: 15, width: 18, textAlign: 'center', opacity: 0.5 }} />
                      {item.label}
                    </Link>
                  ))}
                </>
              )}
              {can('canDeleteTeam') && (
                <>
                  <div style={{ height: 1, background: borderColor, margin: '8px 10px' }} />
                  <div style={{ fontSize: 10, fontWeight: 600, color: '#ef4444', letterSpacing: '0.06em', textTransform: 'uppercase', padding: '8px 10px 4px' }}>{t('teamDanger')}</div>
                  <Link href="/team?tab=danger" className="sidebar-item" style={{
                    display: 'flex', alignItems: 'center', gap: 9,
                    padding: '7px 10px', borderRadius: 7, textDecoration: 'none',
                    fontSize: 13, fontWeight: 400, color: '#ef4444', background: 'transparent',
                  }}>
                    <i className="bx bx-trash" style={{ fontSize: 15, width: 18, textAlign: 'center', opacity: 0.7 }} />
                    {t('teamDeleteTeam')}
                  </Link>
                </>
              )}
            </nav>
          </>
        ) : null}

        {/* Infinite scroll sentinel */}
        {section !== 'settings' && section !== 'team' && !sidebarLoading && getTotalItems() > visibleCount && (
          <>
            <div ref={sentinelRef} style={{ height: 1 }} />
            <div style={{ padding: '8px 12px', textAlign: 'center', fontSize: 11, color: textMuted }}>
              {t('loadingMore')}
            </div>
          </>
        )}
      </div>

      {/* Bulk action floating toolbar */}
      {selectionMode && selectedIds.size > 0 && (
        <div style={{
          padding: '8px 10px', borderTop: `1px solid ${borderColor}`,
          background: 'var(--color-accent-active)',
          display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0,
        }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-fg-muted)', flex: 1 }}>
            {t('selected', { count: selectedIds.size })}
          </span>
          <button
            onClick={handleBulkPin}
            title={t('bulkPin')}
            style={{
              padding: '4px 8px', borderRadius: 5, fontSize: 11, fontWeight: 500, cursor: 'pointer',
              background: 'rgba(0,229,255,0.1)', color: '#00e5ff', border: '1px solid rgba(0,229,255,0.2)',
              display: 'flex', alignItems: 'center', gap: 4,
            }}
          >
            <i className="bx bxs-pin" style={{ fontSize: 12 }} />
            {t('bulkPin')}
          </button>
          <button
            onClick={() => setBulkDeleteConfirm(true)}
            title={t('bulkDelete')}
            style={{
              padding: '4px 8px', borderRadius: 5, fontSize: 11, fontWeight: 500, cursor: 'pointer',
              background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)',
              display: 'flex', alignItems: 'center', gap: 4,
            }}
          >
            <i className="bx bx-trash" style={{ fontSize: 12 }} />
            {t('bulkDelete')}
          </button>
          <button
            onClick={exitSelectionMode}
            title={t('deselectAll')}
            style={{
              padding: '4px 6px', borderRadius: 5, fontSize: 14, cursor: 'pointer',
              background: 'transparent', color: 'var(--color-fg-muted)',
              border: 'none', display: 'flex', alignItems: 'center',
            }}
          >
            <i className="bx bx-x" />
          </button>
        </div>
      )}

      {/* Bulk delete confirmation dialog */}
      {bulkDeleteConfirm && (
        <DeleteConfirmDialog
          itemName={t('bulkDeleteConfirm', { count: selectedIds.size })}
          onCancel={() => setBulkDeleteConfirm(false)}
          onConfirm={handleBulkDelete}
        />
      )}
    </div>
  )
}
