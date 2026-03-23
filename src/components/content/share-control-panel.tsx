'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface ShareControlPanelProps {
  shareId: number
  visibility: string
  handle: string
  entityType: string
  slug: string
  onVisibilityChange?: (visibility: string) => void
}

const VISIBILITY_OPTIONS = [
  { value: 'public', label: 'Public', icon: 'bx-globe', description: 'Anyone can view' },
  { value: 'unlisted', label: 'Unlisted', icon: 'bx-link', description: 'Only people with the link' },
  { value: 'private', label: 'Private', icon: 'bx-lock-alt', description: 'Only you can view' },
]

const ENTITY_TYPE_PATHS: Record<string, string> = {
  doc: 'docs',
  api_collection: 'apis',
  presentation: 'slides',
  note: '',
  skill: '',
  agent: '',
  workflow: '',
  prompt: '',
}

export function ShareControlPanel({
  shareId,
  visibility: initialVisibility,
  handle,
  entityType,
  slug,
  onVisibilityChange,
}: ShareControlPanelProps) {
  const [visibility, setVisibility] = useState(initialVisibility)
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showEmbed, setShowEmbed] = useState(false)

  const typePath = ENTITY_TYPE_PATHS[entityType] || entityType
  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/@${handle}/${typePath}/${slug}`
    : `/@${handle}/${typePath}/${slug}`

  async function updateVisibility(newVisibility: string) {
    if (newVisibility === visibility) return
    setSaving(true)
    try {
      const sb = createClient()
      const { error } = await sb.from('shared_contents').update({ visibility: newVisibility }).eq('id', shareId)
      if (error) throw error
      setVisibility(newVisibility)
      onVisibilityChange?.(newVisibility)
    } catch {
      // Revert on error
    }
    setSaving(false)
  }

  function copyLink() {
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const embedCode = `<iframe src="${shareUrl}?embed=true" width="100%" height="600" frameborder="0" style="border: 1px solid #e5e7eb; border-radius: 8px;"></iframe>`

  return (
    <div style={panelStyle}>
      <h3 style={headingStyle}>Share Settings</h3>

      {/* Visibility */}
      <div style={{ marginBottom: 16 }}>
        <span style={labelStyle}>Visibility</span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 6 }}>
          {VISIBILITY_OPTIONS.map((opt) => {
            const isActive = visibility === opt.value
            return (
              <button
                key={opt.value}
                onClick={() => updateVisibility(opt.value)}
                disabled={saving}
                style={{
                  ...visibilityBtnStyle,
                  background: isActive ? 'var(--color-bg-active)' : 'transparent',
                  borderColor: isActive ? '#00e5ff' : 'var(--color-border)',
                }}
              >
                <i
                  className={`bx ${opt.icon}`}
                  style={{ fontSize: 16, color: isActive ? '#00e5ff' : 'var(--color-fg-dim)' }}
                />
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-fg)', display: 'block' }}>
                    {opt.label}
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--color-fg-dim)' }}>
                    {opt.description}
                  </span>
                </div>
                {isActive && (
                  <i className="bx bx-check" style={{ fontSize: 18, color: '#00e5ff' }} />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Copy Link */}
      <div style={{ marginBottom: 16 }}>
        <span style={labelStyle}>Share Link</span>
        <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
          <input
            type="text"
            value={shareUrl}
            readOnly
            style={urlInputStyle}
            onClick={(e) => (e.target as HTMLInputElement).select()}
          />
          <button onClick={copyLink} style={copyBtnStyle}>
            <i className={`bx ${copied ? 'bx-check' : 'bx-copy'}`} style={{ fontSize: 16 }} />
          </button>
        </div>
        {copied && (
          <span style={{ fontSize: 11, color: '#22c55e', marginTop: 4, display: 'block' }}>
            Copied to clipboard
          </span>
        )}
      </div>

      {/* Embed Code */}
      <div>
        <button
          onClick={() => setShowEmbed(!showEmbed)}
          style={embedToggleStyle}
        >
          <i className="bx bx-code-alt" style={{ fontSize: 14 }} />
          <span>{showEmbed ? 'Hide' : 'Show'} Embed Code</span>
          <i className={`bx bx-chevron-${showEmbed ? 'up' : 'down'}`} style={{ fontSize: 14, marginLeft: 'auto' }} />
        </button>
        {showEmbed && (
          <div style={{ marginTop: 8 }}>
            <textarea
              value={embedCode}
              readOnly
              rows={3}
              style={embedTextareaStyle}
              onClick={(e) => (e.target as HTMLTextAreaElement).select()}
            />
          </div>
        )}
      </div>
    </div>
  )
}

const panelStyle: React.CSSProperties = {
  borderRadius: 12,
  border: '1px solid var(--color-border)',
  background: 'var(--color-bg)',
  padding: 18,
}

const headingStyle: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 600,
  color: 'var(--color-fg)',
  margin: '0 0 14px',
}

const labelStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  color: 'var(--color-fg-dim)',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
}

const visibilityBtnStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  padding: '8px 12px',
  borderRadius: 8,
  border: '1px solid',
  cursor: 'pointer',
  transition: 'all 0.15s ease',
}

const urlInputStyle: React.CSSProperties = {
  flex: 1,
  fontSize: 11,
  fontFamily: 'monospace',
  color: 'var(--color-fg-dim)',
  background: 'var(--color-bg-alt)',
  border: '1px solid var(--color-border)',
  borderRadius: 6,
  padding: '6px 10px',
  outline: 'none',
}

const copyBtnStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'var(--color-bg-alt)',
  border: '1px solid var(--color-border)',
  borderRadius: 6,
  cursor: 'pointer',
  color: 'var(--color-fg-dim)',
  width: 34,
  height: 34,
}

const embedToggleStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  fontSize: 12,
  fontWeight: 500,
  color: 'var(--color-fg-dim)',
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  padding: 0,
  width: '100%',
}

const embedTextareaStyle: React.CSSProperties = {
  width: '100%',
  fontSize: 11,
  fontFamily: 'monospace',
  color: 'var(--color-fg-dim)',
  background: 'var(--color-bg-alt)',
  border: '1px solid var(--color-border)',
  borderRadius: 6,
  padding: 10,
  resize: 'none',
  outline: 'none',
}
