'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

export interface SearchableSelectOption {
  value: string
  label: string
  disabled?: boolean
}

export interface SearchableSelectProps {
  options: SearchableSelectOption[]
  value?: string
  placeholder?: string
  disabled?: boolean
  onChange?: (value: string) => void
  className?: string
  style?: React.CSSProperties
}

export function SearchableSelect({
  options,
  value,
  placeholder = 'Select...',
  disabled = false,
  onChange,
  className,
  style,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const selectedOption = options.find(o => o.value === value)

  const filtered = search
    ? options.filter(o =>
        o.label.toLowerCase().includes(search.toLowerCase()) ||
        o.value.toLowerCase().includes(search.toLowerCase())
      )
    : options

  const handleSelect = useCallback((val: string) => {
    onChange?.(val)
    setOpen(false)
    setSearch('')
  }, [onChange])

  // Close on click outside
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
        setSearch('')
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  // Focus input when opening
  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus()
    }
  }, [open])

  // Keyboard nav
  const [highlightIdx, setHighlightIdx] = useState(0)
  useEffect(() => { setHighlightIdx(0) }, [search, open])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!open) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault()
        setOpen(true)
      }
      return
    }
    if (e.key === 'Escape') {
      setOpen(false)
      setSearch('')
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlightIdx(i => Math.min(i + 1, filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightIdx(i => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (filtered[highlightIdx] && !filtered[highlightIdx].disabled) {
        handleSelect(filtered[highlightIdx].value)
      }
    }
  }, [open, filtered, highlightIdx, handleSelect])

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ position: 'relative', ...style }}
      onKeyDown={handleKeyDown}
    >
      {/* Trigger button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => { if (!disabled) setOpen(!open) }}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
          padding: '8px 12px',
          borderRadius: 9,
          border: '1px solid var(--color-border, rgba(255,255,255,0.08))',
          background: 'var(--color-bg-alt, rgba(255,255,255,0.04))',
          color: selectedOption ? 'var(--color-fg, #f8f8f8)' : 'var(--color-fg-dim, #6b7280)',
          fontSize: 13,
          fontFamily: 'inherit',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.5 : 1,
          textAlign: 'left',
          outline: 'none',
          transition: 'border-color 0.15s',
        }}
      >
        <span style={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          flex: 1,
        }}>
          {selectedOption?.label || placeholder}
        </span>
        <svg
          width="12" height="12" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          style={{
            flexShrink: 0,
            opacity: 0.5,
            transition: 'transform 0.15s',
            transform: open ? 'rotate(180deg)' : 'none',
          }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          marginTop: 4,
          background: 'var(--color-bg, #0f0f12)',
          border: '1px solid var(--color-border, rgba(255,255,255,0.08))',
          borderRadius: 10,
          boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
          zIndex: 50,
          overflow: 'hidden',
        }}>
          {/* Search input */}
          {options.length > 5 && (
            <div style={{ padding: '8px 8px 4px' }}>
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search..."
                style={{
                  width: '100%',
                  padding: '7px 10px',
                  borderRadius: 7,
                  border: '1px solid var(--color-border, rgba(255,255,255,0.08))',
                  background: 'var(--color-bg-alt, rgba(255,255,255,0.04))',
                  color: 'var(--color-fg, #f8f8f8)',
                  fontSize: 12,
                  fontFamily: 'inherit',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          )}

          {/* Options list */}
          <div style={{
            maxHeight: 220,
            overflowY: 'auto',
            padding: '4px',
          }}>
            {filtered.length === 0 ? (
              <div style={{
                padding: '12px 10px',
                fontSize: 12,
                color: 'var(--color-fg-dim, #6b7280)',
                textAlign: 'center',
              }}>
                No results
              </div>
            ) : (
              filtered.map((opt, idx) => {
                const isSelected = opt.value === value
                const isHighlighted = idx === highlightIdx
                return (
                  <button
                    key={opt.value}
                    type="button"
                    disabled={opt.disabled}
                    onClick={() => handleSelect(opt.value)}
                    onMouseEnter={() => setHighlightIdx(idx)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '7px 10px',
                      borderRadius: 6,
                      border: 'none',
                      background: isHighlighted
                        ? 'var(--color-bg-active, rgba(255,255,255,0.06))'
                        : 'transparent',
                      color: isSelected
                        ? '#a900ff'
                        : opt.disabled
                        ? 'var(--color-fg-dim, #6b7280)'
                        : 'var(--color-fg, #f8f8f8)',
                      fontSize: 13,
                      fontWeight: isSelected ? 600 : 400,
                      fontFamily: 'inherit',
                      cursor: opt.disabled ? 'not-allowed' : 'pointer',
                      textAlign: 'left',
                      opacity: opt.disabled ? 0.5 : 1,
                    }}
                  >
                    <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {opt.label}
                    </span>
                    {isSelected && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </button>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
