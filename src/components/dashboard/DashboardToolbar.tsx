'use client'

import { useState, useRef, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import type { WidgetLayout } from '@/types/dashboard'
import { WIDGET_REGISTRY } from '@/types/dashboard'

interface DashboardToolbarProps {
  editMode: boolean
  onToggleEdit: () => void
  onReset: () => void
  widgets: WidgetLayout[]
  onToggleWidget: (id: string) => void
}

export function DashboardToolbar({ editMode, onToggleEdit, onReset, widgets, onToggleWidget }: DashboardToolbarProps) {
  const t = useTranslations('dashboard')
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!showMenu) return
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showMenu])

  const btnBase: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '6px 14px',
    borderRadius: 8,
    border: '1px solid var(--color-border)',
    background: 'var(--color-bg-alt)',
    fontSize: 13,
    fontWeight: 500,
    color: 'var(--color-fg)',
    cursor: 'pointer',
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      {editMode && (
        <>
          {/* Widget visibility menu */}
          <div ref={menuRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              style={btnBase}
            >
              <i className="bx bx-grid-alt" style={{ fontSize: 15 }} />
              {t('widgets')}
            </button>
            {showMenu && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: 6,
                  background: 'var(--color-bg)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 10,
                  padding: 8,
                  minWidth: 200,
                  zIndex: 50,
                  boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                }}
              >
                {widgets.map(w => {
                  const def = WIDGET_REGISTRY[w.type]
                  return (
                    <button
                      key={w.id}
                      onClick={() => onToggleWidget(w.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        width: '100%',
                        padding: '8px 10px',
                        borderRadius: 6,
                        border: 'none',
                        background: 'transparent',
                        cursor: 'pointer',
                        fontSize: 13,
                        color: w.hidden ? 'var(--color-fg-dim)' : 'var(--color-fg)',
                        textAlign: 'left',
                      }}
                    >
                      <div
                        style={{
                          width: 18,
                          height: 18,
                          borderRadius: 4,
                          border: '1px solid var(--color-border)',
                          background: w.hidden ? 'transparent' : 'var(--color-accent, #00e5ff)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        {!w.hidden && <i className="bx bx-check" style={{ fontSize: 14, color: '#000' }} />}
                      </div>
                      <i className={`bx ${def.icon}`} style={{ fontSize: 14, color: 'var(--color-fg-muted)' }} />
                      <span>{t(def.label)}</span>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Reset button */}
          <button onClick={onReset} style={btnBase}>
            <i className="bx bx-reset" style={{ fontSize: 15 }} />
            {t('resetLayout')}
          </button>
        </>
      )}

      {/* Edit/Done toggle */}
      <button
        onClick={onToggleEdit}
        style={{
          ...btnBase,
          background: editMode ? 'var(--color-accent, #00e5ff)' : 'var(--color-bg-alt)',
          color: editMode ? '#000' : 'var(--color-fg)',
          fontWeight: editMode ? 600 : 500,
        }}
      >
        <i className={`bx ${editMode ? 'bx-check' : 'bx-customize'}`} style={{ fontSize: 15 }} />
        {editMode ? t('doneEditing') : t('editDashboard')}
      </button>
    </div>
  )
}
