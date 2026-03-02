import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { BoxIcon } from '@orchestra-mcp/icons'
import './AgentSelectorGrid.css'

export interface AgentGridItem {
  id: string
  label: string
  description?: string
  icon?: string
  iconColor?: string
}

export interface AgentSelectorGridProps {
  items: AgentGridItem[]
  onSelect: (item: AgentGridItem) => void
  search?: string
}

const COLUMNS = 3

export function AgentSelectorGrid({ items, onSelect, search }: AgentSelectorGridProps) {
  const [activeIndex, setActiveIndex] = useState(0)

  const filtered = useMemo(() => {
    if (!search) return items
    const q = search.toLowerCase()
    return items.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        (item.description && item.description.toLowerCase().includes(q)),
    )
  }, [items, search])

  // Reset active index when list changes
  useEffect(() => {
    setActiveIndex(0)
  }, [filtered.length, search])

  // Keyboard navigation: arrow keys + Enter
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (filtered.length === 0) return
      const count = filtered.length

      switch (e.key) {
        case 'ArrowRight':
          e.preventDefault()
          setActiveIndex((prev) => (prev + 1) % count)
          break
        case 'ArrowLeft':
          e.preventDefault()
          setActiveIndex((prev) => (prev - 1 + count) % count)
          break
        case 'ArrowDown':
          e.preventDefault()
          setActiveIndex((prev) => (prev + COLUMNS < count ? prev + COLUMNS : prev))
          break
        case 'ArrowUp':
          e.preventDefault()
          setActiveIndex((prev) => (prev - COLUMNS >= 0 ? prev - COLUMNS : prev))
          break
        case 'Enter':
          e.preventDefault()
          if (filtered[activeIndex]) onSelect(filtered[activeIndex])
          break
      }
    },
    [filtered, activeIndex, onSelect],
  )

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown, true)
    return () => document.removeEventListener('keydown', handleKeyDown, true)
  }, [handleKeyDown])

  if (filtered.length === 0) {
    return <div className="agent-grid__empty">No agents available</div>
  }

  return (
    <div className="agent-grid" role="grid" data-testid="agent-selector-grid">
      {filtered.map((item, idx) => (
        <button
          key={item.id}
          type="button"
          className="agent-grid__card"
          data-active={idx === activeIndex ? 'true' : undefined}
          role="gridcell"
          onClick={() => onSelect(item)}
          onMouseEnter={() => setActiveIndex(idx)}
          data-testid={`agent-card-${item.id}`}
        >
          <span className="agent-grid__icon">
            <BoxIcon
              name={item.icon || 'bx-bot'}
              size={20}
              color={item.iconColor || 'var(--color-accent)'}
            />
          </span>
          <span className="agent-grid__label">{item.label}</span>
          {item.description && (
            <span className="agent-grid__desc">{item.description.split('\n')[0]}</span>
          )}
        </button>
      ))}
    </div>
  )
}
