'use client'
import { useState, useEffect, useCallback } from 'react'
import { onNotifToast, type NotifToast } from '@/hooks/useRealtimeSync'

interface ToastItem extends NotifToast {
  id: number
}

const TYPE_COLORS: Record<string, string> = {
  info: '#00e5ff',
  success: '#22c55e',
  warning: '#f97316',
  error: '#ef4444',
}

const TYPE_ICONS: Record<string, string> = {
  info: 'bx-info-circle',
  success: 'bx-check-circle',
  warning: 'bx-error',
  error: 'bx-x-circle',
}

let nextId = 0

export function NotificationToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const addToast = useCallback((toast: NotifToast) => {
    const id = ++nextId
    setToasts(prev => [...prev, { ...toast, id }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 5000)
  }, [])

  useEffect(() => {
    return onNotifToast(addToast)
  }, [addToast])

  const dismiss = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  if (toasts.length === 0) return null

  return (
    <div style={{
      position: 'fixed', top: 16, right: 16, zIndex: 10000,
      display: 'flex', flexDirection: 'column', gap: 8,
      pointerEvents: 'none',
    }}>
      {toasts.map(t => {
        const color = TYPE_COLORS[t.ntype] ?? TYPE_COLORS.info
        const icon = TYPE_ICONS[t.ntype] ?? TYPE_ICONS.info
        return (
          <div
            key={t.id}
            style={{
              pointerEvents: 'auto',
              minWidth: 300, maxWidth: 400,
              padding: '12px 16px',
              borderRadius: 10,
              background: 'var(--color-bg-alt, #1a1a1a)',
              border: `1px solid ${color}33`,
              boxShadow: `0 4px 24px rgba(0,0,0,0.4), 0 0 0 1px ${color}22`,
              display: 'flex', gap: 10, alignItems: 'flex-start',
              animation: 'slideInRight 0.3s ease-out',
            }}
          >
            <i className={`bx ${icon}`} style={{ fontSize: 18, color, marginTop: 1, flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              {t.title && (
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-fg, #f8f8f8)', marginBottom: 2 }}>
                  {t.title}
                </div>
              )}
              {t.message && (
                <div style={{ fontSize: 12, color: 'var(--color-fg-muted, rgba(255,255,255,0.55))', lineHeight: 1.4 }}>
                  {t.message}
                </div>
              )}
            </div>
            <button
              onClick={() => dismiss(t.id)}
              style={{
                background: 'transparent', border: 'none', cursor: 'pointer',
                color: 'var(--color-fg-dim, rgba(255,255,255,0.3))', fontSize: 16,
                padding: 0, lineHeight: 1, flexShrink: 0,
              }}
            >
              <i className="bx bx-x" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
