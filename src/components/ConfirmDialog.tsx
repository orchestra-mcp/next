'use client'

import { useEffect, useRef } from 'react'

interface ConfirmDialogProps {
  open: boolean
  title?: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'warning' | 'default'
  loading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

const variantColors = {
  danger: { bg: '#ef4444', hover: '#dc2626' },
  warning: { bg: '#f97316', hover: '#ea580c' },
  default: { bg: '#00e5ff', hover: '#00b8d4' },
}

export function ConfirmDialog({
  open,
  title = 'Confirm',
  message,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  variant = 'danger',
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const confirmRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loading) onCancel()
    }
    document.addEventListener('keydown', handler)
    // Focus the cancel button on open for safety
    setTimeout(() => confirmRef.current?.focus(), 50)
    return () => document.removeEventListener('keydown', handler)
  }, [open, loading, onCancel])

  if (!open) return null

  const colors = variantColors[variant]
  const isDanger = variant === 'danger'
  const confirmTextColor = variant === 'default' ? '#000' : '#fff'

  return (
    <>
      <div
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, animation: 'fadeIn 0.15s ease' }}
        onClick={() => !loading && onCancel()}
      />
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'var(--color-bg)',
          border: '1px solid var(--color-border)',
          borderRadius: 14,
          padding: 24,
          width: 400,
          maxWidth: '90vw',
          zIndex: 201,
          boxShadow: '0 16px 48px rgba(0,0,0,0.4)',
          animation: 'scaleIn 0.15s ease',
        }}
      >
        {/* Icon */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: isDanger ? 'rgba(239,68,68,0.1)' : variant === 'warning' ? 'rgba(249,115,22,0.1)' : 'rgba(0,229,255,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <i className={`bx ${isDanger ? 'bx-trash' : variant === 'warning' ? 'bx-error' : 'bx-info-circle'}`} style={{
              fontSize: 20,
              color: isDanger ? '#ef4444' : variant === 'warning' ? '#f97316' : '#00e5ff',
            }} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-fg)' }}>{title}</div>
          </div>
        </div>

        {/* Message */}
        <div style={{ fontSize: 13, color: 'var(--color-fg-muted)', lineHeight: 1.5, marginBottom: 20 }}>
          {message}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button
            onClick={onCancel}
            disabled={loading}
            style={{
              padding: '8px 16px', borderRadius: 8,
              border: '1px solid var(--color-border)',
              background: 'transparent', color: 'var(--color-fg-muted)',
              fontSize: 13, cursor: 'pointer',
            }}
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmRef}
            onClick={onConfirm}
            disabled={loading}
            style={{
              padding: '8px 16px', borderRadius: 8, border: 'none',
              background: colors.bg, color: confirmTextColor,
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
              opacity: loading ? 0.6 : 1,
              display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            {loading && (
              <span style={{
                width: 14, height: 14, border: `2px solid ${confirmTextColor}44`,
                borderTopColor: confirmTextColor, borderRadius: '50%',
                animation: 'spin 0.6s linear infinite', display: 'inline-block',
              }} />
            )}
            {loading ? 'Please wait...' : confirmLabel}
          </button>
        </div>

        <style>{`
          @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
          @keyframes scaleIn { from { opacity: 0; transform: translate(-50%, -50%) scale(0.95) } to { opacity: 1; transform: translate(-50%, -50%) scale(1) } }
          @keyframes spin { to { transform: rotate(360deg) } }
        `}</style>
      </div>
    </>
  )
}
