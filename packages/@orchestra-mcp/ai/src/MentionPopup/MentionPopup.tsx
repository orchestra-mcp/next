import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { BoxIcon } from '@orchestra-mcp/icons'
import './MentionPopup.css'

/* ── Types ── */

export type MentionGroup = 'files' | 'tasks' | 'sessions' | 'epics'

export interface MentionItem {
  id: string
  label: string
  /** Secondary text (file path, task ID, etc.) */
  description?: string
  /** BoxIcon name */
  icon?: string
  /** Icon color */
  iconColor?: string
  /** Group this item belongs to */
  group: MentionGroup
}

export interface MentionPopupProps {
  /** All available mention items (already fetched by the parent) */
  items: MentionItem[]
  /** Current filter text (characters typed after @) */
  query: string
  /** Whether popup is visible */
  open: boolean
  /** Pixel position for the popup (bottom-left anchor relative to viewport) */
  position: { x: number; y: number }
  /** Called when user selects an item (Enter or click) */
  onSelect: (item: MentionItem) => void
  /** Called when user dismisses (Escape or click outside) */
  onDismiss: () => void
  /** Whether a backend search is currently in-flight */
  loading?: boolean
}

/* ── Group metadata ── */

const GROUP_ORDER: MentionGroup[] = ['files', 'tasks', 'epics', 'sessions']

const GROUP_META: Record<MentionGroup, { icon: string; color: string; label: string }> = {
  files:    { icon: 'bx-file',    color: '#6366f1', label: 'Files' },
  tasks:    { icon: 'bx-task',    color: '#22c55e', label: 'Tasks' },
  epics:    { icon: 'bx-rocket',  color: '#f59e0b', label: 'Epics' },
  sessions: { icon: 'bx-chat',    color: '#3b82f6', label: 'Sessions' },
}

/* ── Component ── */

export function MentionPopup({
  items,
  query,
  open,
  position,
  onSelect,
  onDismiss,
  loading = false,
}: MentionPopupProps) {
  const popupRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)

  // Filter items by query (case-insensitive includes on label + description)
  const filtered = useMemo(() => {
    if (!query) return items
    const q = query.toLowerCase()
    return items.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        (item.description && item.description.toLowerCase().includes(q)),
    )
  }, [items, query])

  // Group filtered items in display order, producing a flat render list
  const { groups, flatItems } = useMemo(() => {
    const grouped: Record<string, MentionItem[]> = {}
    for (const item of filtered) {
      if (!grouped[item.group]) grouped[item.group] = []
      grouped[item.group].push(item)
    }

    const orderedGroups: { group: MentionGroup; items: MentionItem[] }[] = []
    const flat: MentionItem[] = []
    for (const g of GROUP_ORDER) {
      if (grouped[g] && grouped[g].length > 0) {
        orderedGroups.push({ group: g, items: grouped[g] })
        flat.push(...grouped[g])
      }
    }
    return { groups: orderedGroups, flatItems: flat }
  }, [filtered])

  // Reset active index when filtered list changes
  useEffect(() => {
    setActiveIndex(0)
  }, [flatItems.length, query])

  // Scroll active item into view
  useEffect(() => {
    if (!open) return
    const popup = popupRef.current
    if (!popup) return
    const activeEl = popup.querySelector('[data-active="true"]') as HTMLElement | null
    if (activeEl) {
      activeEl.scrollIntoView({ block: 'nearest' })
    }
  }, [activeIndex, open])

  // Keyboard navigation (capture phase to intercept before textarea handlers)
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!open) return

      // Handle Escape even when list is empty
      if (e.key === 'Escape') {
        e.preventDefault()
        e.stopPropagation()
        onDismiss()
        return
      }

      if (flatItems.length === 0) return

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          e.stopPropagation()
          setActiveIndex((prev) => (prev + 1) % flatItems.length)
          break
        case 'ArrowUp':
          e.preventDefault()
          e.stopPropagation()
          setActiveIndex((prev) => (prev - 1 + flatItems.length) % flatItems.length)
          break
        case 'Enter':
        case 'Tab':
          e.preventDefault()
          e.stopPropagation()
          if (flatItems[activeIndex]) onSelect(flatItems[activeIndex])
          break
      }
    },
    [open, flatItems, activeIndex, onSelect, onDismiss],
  )

  useEffect(() => {
    if (!open) return
    document.addEventListener('keydown', handleKeyDown, true)
    return () => document.removeEventListener('keydown', handleKeyDown, true)
  }, [open, handleKeyDown])

  // Click outside to dismiss
  useEffect(() => {
    if (!open) return
    const handleClick = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        onDismiss()
      }
    }
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClick)
    }, 0)
    return () => {
      clearTimeout(timer)
      document.removeEventListener('mousedown', handleClick)
    }
  }, [open, onDismiss])

  if (!open) return null

  // Position the popup: anchor at bottom-left, popup grows upward
  const style: React.CSSProperties = {
    position: 'fixed',
    left: position.x,
    bottom: window.innerHeight - position.y,
  }

  let flatIndex = 0

  return (
    <div
      ref={popupRef}
      className="mention-popup"
      style={style}
      role="listbox"
      data-testid="mention-popup"
    >
      {flatItems.length === 0 ? (
        loading ? (
          <div className="mention-popup__loading">Searching...</div>
        ) : (
          <div className="mention-popup__empty">No results</div>
        )
      ) : (
        groups.map(({ group, items: groupItems }) => {
          const meta = GROUP_META[group]
          return (
            <div key={group} className="mention-popup__group" role="group" aria-label={meta.label}>
              <div className="mention-popup__group-header">
                <BoxIcon name={meta.icon} size={14} color={meta.color} />
                <span>{meta.label}</span>
                <span className="mention-popup__group-badge">{groupItems.length}</span>
              </div>
              {groupItems.map((item) => {
                const idx = flatIndex++
                const isActive = idx === activeIndex
                return (
                  <button
                    key={item.id}
                    type="button"
                    className="mention-popup__item"
                    data-active={isActive ? 'true' : undefined}
                    role="option"
                    aria-selected={isActive}
                    onClick={() => onSelect(item)}
                    onMouseEnter={() => setActiveIndex(idx)}
                    data-testid={`mention-item-${item.id}`}
                  >
                    <span className="mention-popup__item-icon">
                      <BoxIcon
                        name={item.icon || meta.icon}
                        size={16}
                        color={item.iconColor || meta.color}
                      />
                    </span>
                    <span className="mention-popup__item-label">{item.label}</span>
                    {item.description && (
                      <span className="mention-popup__item-desc">{item.description}</span>
                    )}
                  </button>
                )
              })}
            </div>
          )
        })
      )}
    </div>
  )
}
