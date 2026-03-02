import { useCallback, useEffect, useRef, useState } from 'react'
import { BoxIcon } from '@orchestra-mcp/icons'
import './NoteItem.css'

const NOTE_ICONS = [
  'bx-notepad', 'bx-file', 'bx-code-alt', 'bx-bug', 'bx-bulb',
  'bx-bookmark', 'bx-star', 'bx-heart', 'bx-flag', 'bx-target-lock',
  'bx-rocket', 'bx-terminal', 'bx-git-branch', 'bx-link', 'bx-world',
]

const NOTE_COLORS = [
  '#6366f1', '#8b5cf6', '#a855f7', '#ec4899', '#ef4444',
  '#f59e0b', '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6',
]

export interface NoteItemProps {
  id: string
  title: string
  preview: string
  date: string
  active?: boolean
  pinned?: boolean
  icon?: string
  color?: string
  /** Whether this item is currently selected in multi-select mode */
  selected?: boolean
  /** Whether multi-select mode is active (any item is selected) */
  selectionMode?: boolean
  onSelect: (id: string) => void
  onDelete: (id: string) => void
  onPin: (id: string) => void
  onExport: (id: string, format: 'md' | 'pdf' | 'doc') => void
  onIconChange: (id: string, icon: string) => void
  onColorChange: (id: string, color: string) => void
  onSendToNotion?: (id: string) => void
  onSendToAppleNotes?: (id: string) => void
  onToggleStartupPrompt?: (id: string) => void
  startupPrompt?: boolean
  onToggleQuickAction?: (id: string) => void
  quickAction?: boolean
  /** Toggle selection of this item (enters/manages multi-select) */
  onToggleSelect?: (id: string) => void
}

function formatRelativeTime(isoDate: string): string {
  const now = Date.now()
  const then = new Date(isoDate).getTime()
  if (Number.isNaN(then)) return ''
  const seconds = Math.floor((now - then) / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  if (seconds < 60) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days === 1) return 'Yesterday'
  const d = new Date(isoDate)
  if (days < 7) return d.toLocaleDateString(undefined, { weekday: 'short' })
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

const SWIPE_THRESHOLD = 70
const HOLD_DELAY = 200
const LONG_PRESS_DELAY = 500

export function NoteItem({
  id, title, preview, date, active = false, pinned = false,
  icon, color, selected = false, selectionMode = false,
  onSelect, onDelete, onPin, onExport, onIconChange, onColorChange,
  onSendToNotion, onSendToAppleNotes, onToggleStartupPrompt, startupPrompt,
  onToggleQuickAction, quickAction,
  onToggleSelect,
}: NoteItemProps) {
  // ── Swipe ─────────────────────────────────────────────
  const [offsetX, setOffsetX] = useState(0)
  const swipingRef = useRef(false)
  const startX = useRef(0)
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const longPressFired = useRef(false)

  const cleanup = useCallback(() => {
    if (holdTimer.current) { clearTimeout(holdTimer.current); holdTimer.current = null }
    if (longPressTimer.current) { clearTimeout(longPressTimer.current); longPressTimer.current = null }
    document.removeEventListener('pointermove', handleDocMove)
    document.removeEventListener('pointerup', handleDocUp)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleDocMove = useCallback((e: PointerEvent) => {
    const dx = e.clientX - startX.current
    swipingRef.current = true
    // Cancel long-press if user is swiping
    if (longPressTimer.current && Math.abs(dx) > 8) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
    const max = SWIPE_THRESHOLD + 20
    const clamped = Math.max(-max, Math.min(max, dx))
    setOffsetX(clamped)
  }, [])

  const handleDocUp = useCallback(() => {
    cleanup()
    setOffsetX((prev) => {
      if (prev >= SWIPE_THRESHOLD) onPin(id)
      else if (prev <= -SWIPE_THRESHOLD) onDelete(id)
      return 0
    })
    setTimeout(() => { swipingRef.current = false }, 50)
  }, [id, onPin, onDelete, cleanup])

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    // Ignore right-click — let context menu handle it without triggering swipe
    if (e.button !== 0) return
    startX.current = e.clientX
    longPressFired.current = false
    cleanup()

    // Long-press to enter selection mode
    if (onToggleSelect) {
      longPressTimer.current = setTimeout(() => {
        longPressFired.current = true
        onToggleSelect(id)
      }, LONG_PRESS_DELAY)
    }

    holdTimer.current = setTimeout(() => {
      document.addEventListener('pointermove', handleDocMove)
      document.addEventListener('pointerup', handleDocUp, { once: true })
    }, HOLD_DELAY)
  }, [cleanup, handleDocMove, handleDocUp, onToggleSelect, id])

  const onPointerUp = useCallback(() => {
    if (holdTimer.current) { clearTimeout(holdTimer.current); holdTimer.current = null }
    if (longPressTimer.current) { clearTimeout(longPressTimer.current); longPressTimer.current = null }
  }, [])

  const handleClick = useCallback(() => {
    if (swipingRef.current || longPressFired.current) return
    // In selection mode, click toggles selection instead of navigating
    if (selectionMode && onToggleSelect) {
      onToggleSelect(id)
      return
    }
    onSelect(id)
  }, [id, onSelect, selectionMode, onToggleSelect])

  // ── Context menu ──────────────────────────────────────
  const [menuPos, setMenuPos] = useState<{ x: number; y: number } | null>(null)
  const [hoveredSub, setHoveredSub] = useState<'icon' | 'color' | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setMenuPos({ x: e.clientX, y: e.clientY })
    setHoveredSub(null)
  }, [])

  const closeMenu = useCallback(() => { setMenuPos(null); setHoveredSub(null) }, [])

  useEffect(() => {
    if (!menuPos) return
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) closeMenu()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [menuPos, closeMenu])

  const showPin = offsetX > 10
  const showDelete = offsetX < -10

  return (
    <div className={`note-item__wrapper${active ? ' note-item__wrapper--active' : ''}${selected ? ' note-item__wrapper--selected' : ''}`}>
      {/* Swipe action panels */}
      <div className={`note-item__action note-item__action--pin${showPin ? ' note-item__action--visible' : ''}`}>
        <BoxIcon name={pinned ? 'bxs-pin' : 'bx-pin'} size={18} />
        <span>{pinned ? 'Unpin' : 'Pin'}</span>
      </div>
      <div className={`note-item__action note-item__action--delete${showDelete ? ' note-item__action--visible' : ''}`}>
        <BoxIcon name="bx-trash" size={18} />
        <span>Delete</span>
      </div>

      {/* Swipeable card */}
      <button
        className={`note-item__card${active ? ' note-item__card--active' : ''}${selected ? ' note-item__card--selected' : ''}`}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        type="button"
        style={{
          transform: offsetX ? `translateX(${offsetX}px)` : undefined,
          transition: offsetX ? 'none' : 'transform 0.25s ease',
        }}
      >
        {/* Selection checkbox */}
        {selectionMode && (
          <span className={`note-item__checkbox${selected ? ' note-item__checkbox--checked' : ''}`}>
            {selected && <BoxIcon name="bx-check" size={14} />}
          </span>
        )}

        <span className="note-item__icon" style={color ? { color } : undefined}>
          <BoxIcon name={icon || 'bx-notepad'} size={18} />
        </span>
        <div className="note-item__body">
          <span className="note-item__title">{title}</span>
          {preview && <span className="note-item__preview">{preview}</span>}
        </div>
        <div className="note-item__meta">
          <span className="note-item__date">{formatRelativeTime(date)}</span>
          {pinned && (
            <span className="note-item__pin-badge"><BoxIcon name="bxs-pin" size={12} /></span>
          )}
        </div>
      </button>

      {/* Context menu */}
      {menuPos && (
        <div ref={menuRef} className="note-item__menu" style={{ top: menuPos.y, left: menuPos.x }}>
          {selectionMode ? (
            /* Selection-mode menu: only Pin + Delete */
            <>
              <button className="note-item__menu-item" onClick={() => { closeMenu(); onPin(id) }} type="button">
                <BoxIcon name={pinned ? 'bxs-pin' : 'bx-pin'} size={15} /> {pinned ? 'Unpin' : 'Pin'}
              </button>
              <button className="note-item__menu-item note-item__menu-item--danger" onClick={() => { closeMenu(); onDelete(id) }} type="button">
                <BoxIcon name="bx-trash" size={15} /> Delete
              </button>
            </>
          ) : (
            /* Normal menu */
            <>
              {onToggleSelect && (
                <button className="note-item__menu-item" onClick={() => { closeMenu(); onToggleSelect(id) }} type="button">
                  <BoxIcon name="bx-select-multiple" size={15} /> Select
                </button>
              )}
              <button className="note-item__menu-item" onClick={() => { closeMenu(); onPin(id) }} type="button">
                <BoxIcon name={pinned ? 'bxs-pin' : 'bx-pin'} size={15} /> {pinned ? 'Unpin' : 'Pin'}
              </button>
              {onToggleStartupPrompt && (
                <button className="note-item__menu-item" onClick={() => { closeMenu(); onToggleStartupPrompt(id) }} type="button">
                  <BoxIcon name="bx-rocket" size={15} /> {startupPrompt ? 'Remove Startup Prompt' : 'Use as Startup Prompt'}
                </button>
              )}
              {onToggleQuickAction && (
                <button className="note-item__menu-item" onClick={() => { closeMenu(); onToggleQuickAction(id) }} type="button">
                  <BoxIcon name="bx-bolt-circle" size={15} /> {quickAction ? 'Remove Quick Action' : 'Create Quick Action'}
                </button>
              )}
              <div
                className="note-item__menu-parent"
                onMouseEnter={() => setHoveredSub('icon')}
                onMouseLeave={() => setHoveredSub(null)}
              >
                <button className="note-item__menu-item" type="button">
                  <BoxIcon name="bx-palette" size={15} /> Set Icon
                  <span className="note-item__menu-chevron"><BoxIcon name="bx-chevron-right" size={14} /></span>
                </button>
                {hoveredSub === 'icon' && (
                  <div className="note-item__submenu">
                    <div className="note-item__icon-grid">
                      {NOTE_ICONS.map((ic) => (
                        <button
                          key={ic}
                          className={`note-item__icon-pick${ic === icon ? ' note-item__icon-pick--active' : ''}`}
                          onClick={() => { onIconChange(id, ic); closeMenu() }}
                          type="button"
                          title={ic.replace('bx-', '')}
                        >
                          <BoxIcon name={ic} size={16} />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div
                className="note-item__menu-parent"
                onMouseEnter={() => setHoveredSub('color')}
                onMouseLeave={() => setHoveredSub(null)}
              >
                <button className="note-item__menu-item" type="button">
                  <BoxIcon name="bx-color" size={15} /> Set Color
                  <span className="note-item__menu-chevron"><BoxIcon name="bx-chevron-right" size={14} /></span>
                </button>
                {hoveredSub === 'color' && (
                  <div className="note-item__submenu">
                    <div className="note-item__color-grid">
                      {NOTE_COLORS.map((c) => (
                        <button
                          key={c}
                          className={`note-item__color-pick${c === color ? ' note-item__color-pick--active' : ''}`}
                          style={{ background: c }}
                          onClick={() => { onColorChange(id, c); closeMenu() }}
                          type="button"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <button className="note-item__menu-item" onClick={() => { closeMenu(); onExport(id, 'md') }} type="button">
                <BoxIcon name="bx-download" size={15} /> Export Markdown
              </button>
              <button className="note-item__menu-item" onClick={() => { closeMenu(); onExport(id, 'doc') }} type="button">
                <BoxIcon name="bxs-file-doc" size={15} /> Export Google Docs
              </button>
              <button className="note-item__menu-item" onClick={() => { closeMenu(); onExport(id, 'pdf') }} type="button">
                <BoxIcon name="bx-globe" size={15} /> Export HTML / PDF
              </button>
              {onSendToNotion && (
                <button className="note-item__menu-item" onClick={() => { closeMenu(); onSendToNotion(id) }} type="button">
                  <BoxIcon name="bx-transfer" size={15} /> Send to Notion
                </button>
              )}
              {onSendToAppleNotes && (
                <button className="note-item__menu-item" onClick={() => { closeMenu(); onSendToAppleNotes(id) }} type="button">
                  <BoxIcon name="bx-note" size={15} /> Send to Apple Notes
                </button>
              )}
              <button className="note-item__menu-item note-item__menu-item--danger" onClick={() => { closeMenu(); onDelete(id) }} type="button">
                <BoxIcon name="bx-trash" size={15} /> Delete
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
