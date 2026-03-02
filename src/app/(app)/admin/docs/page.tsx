'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useThemeStore } from '@/store/theme'
import { useRoleStore } from '@/store/roles'

const DOC_SECTIONS = [
  'Getting Started',
  'Installation',
  'Configuration',
  'API Reference',
  'Plugins',
  'MCP Tools',
]

export default function AdminDocsPage() {
  const router = useRouter()
  const { can, roleLoaded } = useRoleStore()
  const { theme } = useThemeStore()
  const isDark = theme === 'dark'

  const [selected, setSelected] = useState<string | null>(null)
  const [content, setContent] = useState('')

  const textPrimary = isDark ? '#f8f8f8' : '#0f0f12'
  const textMuted = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.45)'
  const textDim = isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.3)'
  const cardBg = isDark ? 'rgba(255,255,255,0.03)' : '#ffffff'
  const cardBorder = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)'
  const pageBg = isDark ? '#0f0f12' : '#f5f5f7'
  const inputBg = isDark ? 'rgba(255,255,255,0.05)' : '#f9f9fb'
  const inputBorder = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.12)'
  const navActiveBg = isDark ? 'rgba(0,229,255,0.08)' : 'rgba(0,229,255,0.07)'
  const navHoverBg = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)'
  const rowBorder = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.05)'

  return (
    <div style={{ padding: '28px 32px', background: pageBg, minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Link href="/admin" style={{ fontSize: 13, color: textDim, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 5, marginBottom: 14 }}>
          <i className="bx bx-left-arrow-alt" /> Admin
        </Link>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: textPrimary, margin: 0, letterSpacing: '-0.02em' }}>Documentation</h1>
        <p style={{ fontSize: 13, color: textMuted, marginTop: 5 }}>Manage documentation sections and content.</p>
      </div>

      {/* Split layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 20, alignItems: 'start' }}>
        {/* Left: doc tree */}
        <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: `1px solid ${cardBorder}`, fontSize: 11, fontWeight: 600, color: textDim, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Sections
          </div>
          {DOC_SECTIONS.map((section, idx) => {
            const isActive = selected === section
            return (
              <button
                key={section}
                onClick={() => setSelected(section)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 9, width: '100%',
                  padding: '11px 16px', border: 'none', cursor: 'pointer', textAlign: 'left',
                  background: isActive ? navActiveBg : 'transparent',
                  borderBottom: idx < DOC_SECTIONS.length - 1 ? `1px solid ${rowBorder}` : 'none',
                  borderLeft: isActive ? '2px solid #00e5ff' : '2px solid transparent',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = navHoverBg }}
                onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
              >
                <i className="bx bx-file-blank" style={{ fontSize: 14, color: isActive ? '#00e5ff' : textDim, flexShrink: 0 }} />
                <span style={{ fontSize: 13, fontWeight: isActive ? 600 : 400, color: isActive ? textPrimary : textMuted }}>
                  {section}
                </span>
              </button>
            )
          })}
        </div>

        {/* Right: edit area */}
        <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: `1px solid ${cardBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: textPrimary }}>
                {selected || 'No section selected'}
              </div>
              {selected && <div style={{ fontSize: 11, color: textDim, marginTop: 2 }}>Edit content below</div>}
            </div>
            {selected && (
              <button style={{ padding: '6px 14px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, #00e5ff, #a900ff)', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                Save
              </button>
            )}
          </div>
          <div style={{ padding: 20 }}>
            {selected ? (
              <>
                <div style={{ fontSize: 11, fontWeight: 600, color: textDim, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 10 }}>
                  Edit content
                </div>
                <textarea
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder={`Write content for "${selected}"…`}
                  style={{
                    width: '100%', minHeight: 360, padding: '12px 14px', borderRadius: 10,
                    border: `1px solid ${inputBorder}`, background: inputBg, color: textPrimary,
                    fontSize: 13, lineHeight: 1.6, outline: 'none', resize: 'vertical',
                    boxSizing: 'border-box', fontFamily: 'inherit',
                  }}
                />
                <div style={{ marginTop: 10, fontSize: 11, color: textDim }}>
                  Markdown is supported. Use headers, lists, code blocks.
                </div>
              </>
            ) : (
              <div style={{ padding: '60px 40px', textAlign: 'center' }}>
                <i className="bx bx-book-open" style={{ fontSize: 40, color: textDim, display: 'block', marginBottom: 12 }} />
                <div style={{ fontSize: 14, fontWeight: 600, color: textMuted, marginBottom: 4 }}>Select a doc section</div>
                <div style={{ fontSize: 12, color: textDim }}>
                  Select a doc section from the left to edit…
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
