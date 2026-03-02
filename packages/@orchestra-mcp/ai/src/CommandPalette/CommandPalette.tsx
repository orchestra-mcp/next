import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { BoxIcon } from '@orchestra-mcp/icons'
import './CommandPalette.css'

/* ── Types ── */

export type CommandGroup = 'agents' | 'skills' | 'commands' | 'quick-actions' | 'prompts'

export interface CommandItem {
  id: string
  label: string
  /** Short description shown beside the label */
  description?: string
  /** BoxIcon name */
  icon?: string
  /** Icon color */
  iconColor?: string
  /** Keyboard shortcut hint (e.g. Cmd+K) */
  shortcut?: string
  /** Group this item belongs to */
  group: CommandGroup
}

export interface CommandPaletteProps {
  /** All available command items (already fetched by the parent) */
  items: CommandItem[]
  /** Current filter text (characters typed after /) */
  query: string
  /** Whether popup is visible */
  open: boolean
  /** Pixel position for the popup (bottom-left anchor relative to viewport) */
  position: { x: number; y: number }
  /** Called when user selects an item (Enter or click) */
  onSelect: (item: CommandItem) => void
  /** Called when user dismisses (Escape or click outside) */
  onDismiss: () => void
}

/* ── Group metadata ── */

const GROUP_ORDER: CommandGroup[] = ['agents', 'skills', 'commands', 'quick-actions', 'prompts']

const GROUP_META: Record<CommandGroup, { icon: string; color: string; label: string }> = {
  agents:          { icon: 'bx-bot',      color: '#ec4899', label: 'Agents' },
  skills:          { icon: 'bx-command',  color: '#8b5cf6', label: 'Skills' },
  commands:        { icon: 'bx-terminal', color: '#22c55e', label: 'Commands' },
  'quick-actions': { icon: 'bx-bolt-circle', color: '#f59e0b', label: 'Quick Actions' },
  prompts:         { icon: 'bx-grid-alt',    color: '#06b6d4', label: 'Prompts' },
}

/* ── Component ── */

export function CommandPalette({
  items,
  query,
  open,
  position,
  onSelect,
  onDismiss,
}: CommandPaletteProps) {
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
    const grouped: Record<string, CommandItem[]> = {}
    for (const item of filtered) {
      if (!grouped[item.group]) grouped[item.group] = []
      grouped[item.group].push(item)
    }

    const orderedGroups: { group: CommandGroup; items: CommandItem[] }[] = []
    const flat: CommandItem[] = []
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
      className="command-palette"
      style={style}
      role="listbox"
      data-testid="command-palette"
    >
      {flatItems.length === 0 ? (
        <div className="command-palette__empty">No commands found</div>
      ) : (
        groups.map(({ group, items: groupItems }) => {
          const meta = GROUP_META[group]
          return (
            <div key={group} className="command-palette__group" role="group" aria-label={meta.label}>
              <div className="command-palette__group-header">
                <BoxIcon name={meta.icon} size={14} color={meta.color} />
                <span>{meta.label}</span>
                <span className="command-palette__group-badge">{groupItems.length}</span>
              </div>
              {groupItems.map((item) => {
                const idx = flatIndex++
                const isActive = idx === activeIndex
                return (
                  <button
                    key={item.id}
                    type="button"
                    className="command-palette__item"
                    data-active={isActive ? 'true' : undefined}
                    role="option"
                    aria-selected={isActive}
                    onClick={() => onSelect(item)}
                    onMouseEnter={() => setActiveIndex(idx)}
                    data-testid={`command-item-${item.id}`}
                  >
                    <span className="command-palette__item-icon">
                      <BoxIcon
                        name={item.icon || meta.icon}
                        size={16}
                        color={item.iconColor || meta.color}
                      />
                    </span>
                    <span className="command-palette__item-label">{item.label}</span>
                    {item.description && (
                      <span className="command-palette__item-desc">{item.description}</span>
                    )}
                    {item.shortcut && (
                      <span className="command-palette__item-shortcut">{item.shortcut}</span>
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
