'use client'

import { useState, useRef, useEffect } from 'react'
import type { ReactNode } from 'react'
import { useTranslations } from 'next-intl'
import type { WidgetLayout, WidgetDefinition } from '@/types/dashboard'

export interface WidgetShellProps {
  widget: WidgetLayout
  definition: WidgetDefinition
  editMode: boolean
  onResize: (colSpan: number) => void
  onToggle: () => void
  onLock: () => void
  loading?: boolean
  children: ReactNode
}

export function WidgetShell({
  widget,
  definition,
  editMode,
  onResize,
  onToggle,
  onLock,
  loading = false,
  children,
}: WidgetShellProps) {
  const t = useTranslations('dashboard')
  const [showResize, setShowResize] = useState(false)
  const resizeRef = useRef<HTMLDivElement>(null)

  // Close resize dropdown on outside click
  useEffect(() => {
    if (!showResize) return
    const handler = (e: MouseEvent) => {
      if (resizeRef.current && !resizeRef.current.contains(e.target as Node)) {
        setShowResize(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showResize])

  const isHidden = widget.hidden
  const isLocked = widget.locked

  // Hidden widgets not visible in normal mode
  if (isHidden && !editMode) return null

  return (
    <div
      style={{
        opacity: isHidden && editMode ? 0.35 : 1,
        transition: 'opacity 0.2s ease',
        height: '100%',
      }}
    >
      <div
        style={{
          background: 'var(--color-bg-alt)',
          border: '1px solid var(--color-border)',
          borderRadius: 14,
          overflow: 'hidden',
          position: 'relative',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
            borderBottom: '1px solid var(--color-border)',
            cursor: editMode && !isLocked ? 'grab' : 'default',
            userSelect: 'none',
          }}
          data-drag-handle={editMode && !isLocked ? true : undefined}
        >
          {/* Left: icon + label */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <i className={`bx ${definition.icon}`} style={{ fontSize: 16, color: 'var(--color-fg-muted)' }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-fg)' }}>
              {t(definition.label)}
            </span>
            {isLocked && (
              <i className="bx bx-lock-alt" style={{ fontSize: 13, color: 'var(--color-fg-dim)', marginLeft: 2 }} />
            )}
          </div>

          {/* Right: action buttons (edit mode) */}
          {editMode && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              {/* Resize dropdown */}
              <div ref={resizeRef} style={{ position: 'relative' }}>
                <button
                  onClick={(e) => { e.stopPropagation(); setShowResize(!showResize) }}
                  title="Resize"
                  style={{
                    background: 'none',
                    border: '1px solid var(--color-border)',
                    borderRadius: 6,
                    padding: '3px 8px',
                    cursor: 'pointer',
                    fontSize: 11,
                    color: 'var(--color-fg-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <i className="bx bx-expand-horizontal" style={{ fontSize: 13 }} />
                  {widget.colSpan}
                </button>
                {showResize && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '100%',
                      right: 0,
                      marginTop: 4,
                      background: 'var(--color-bg)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 8,
                      padding: 6,
                      zIndex: 50,
                      display: 'grid',
                      gridTemplateColumns: 'repeat(4, 1fr)',
                      gap: 3,
                      minWidth: 140,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    }}
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1)
                      .filter(n => n >= definition.minColSpan && n <= definition.maxColSpan)
                      .map(n => (
                        <button
                          key={n}
                          onClick={(e) => {
                            e.stopPropagation()
                            onResize(n)
                            setShowResize(false)
                          }}
                          style={{
                            background: n === widget.colSpan ? 'var(--color-accent, #00e5ff)' : 'var(--color-bg-alt)',
                            color: n === widget.colSpan ? '#000' : 'var(--color-fg-muted)',
                            border: '1px solid var(--color-border)',
                            borderRadius: 4,
                            padding: '4px 0',
                            cursor: 'pointer',
                            fontSize: 11,
                            fontWeight: n === widget.colSpan ? 700 : 400,
                          }}
                        >
                          {n}
                        </button>
                      ))}
                  </div>
                )}
              </div>

              {/* Lock toggle */}
              <button
                onClick={(e) => { e.stopPropagation(); onLock() }}
                title={isLocked ? 'Unlock' : 'Lock'}
                style={{
                  background: isLocked ? 'var(--color-bg-active)' : 'none',
                  border: '1px solid var(--color-border)',
                  borderRadius: 6,
                  padding: '3px 6px',
                  cursor: 'pointer',
                  color: 'var(--color-fg-muted)',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <i className={`bx ${isLocked ? 'bx-lock-alt' : 'bx-lock-open-alt'}`} style={{ fontSize: 14 }} />
              </button>

              {/* Hide/Show toggle */}
              <button
                onClick={(e) => { e.stopPropagation(); onToggle() }}
                title={isHidden ? 'Show' : 'Hide'}
                style={{
                  background: isHidden ? 'var(--color-bg-active)' : 'none',
                  border: '1px solid var(--color-border)',
                  borderRadius: 6,
                  padding: '3px 6px',
                  cursor: 'pointer',
                  color: 'var(--color-fg-muted)',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <i className={`bx ${isHidden ? 'bx-show' : 'bx-hide'}`} style={{ fontSize: 14 }} />
              </button>
            </div>
          )}
        </div>

        {/* Body */}
        <div style={{ padding: '16px 20px', position: 'relative', flex: 1 }}>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[1, 2, 3].map(i => (
                <div
                  key={i}
                  style={{
                    height: 14,
                    borderRadius: 6,
                    background: 'var(--color-bg-active)',
                    width: `${100 - i * 20}%`,
                    animation: 'shimmer 1.5s ease-in-out infinite alternate',
                  }}
                />
              ))}
              <style>{`@keyframes shimmer { from { opacity: 0.4; } to { opacity: 1; } }`}</style>
            </div>
          ) : (
            children
          )}
        </div>
      </div>
    </div>
  )
}
