'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { useRoleStore } from '@/store/roles'

const DOC_SECTION_KEYS = [
  'gettingStarted',
  'installation',
  'configuration',
  'apiReference',
  'plugins',
  'mcpTools',
] as const

export default function AdminDocsPage() {
  const router = useRouter()
  const t = useTranslations('admin')
  const { can, roleLoaded } = useRoleStore()
  const [selected, setSelected] = useState<string | null>(null)
  const [content, setContent] = useState('')

  const textPrimary = 'var(--color-fg)'
  const textMuted = 'var(--color-fg-muted)'
  const textDim = 'var(--color-fg-dim)'
  const cardBg = 'var(--color-bg-alt)'
  const cardBorder = 'var(--color-border)'
  const pageBg = 'var(--color-bg)'
  const inputBg = 'var(--color-bg-alt)'
  const inputBorder = 'var(--color-border)'
  const navActiveBg = 'rgba(0,229,255,0.08)'
  const navHoverBg = 'var(--color-bg-alt)'
  const rowBorder = 'var(--color-bg-alt)'

  return (
    <div className="page-wrapper" style={{ padding: '28px 32px', background: pageBg, minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Link href="/admin" style={{ fontSize: 13, color: textDim, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 5, marginBottom: 14 }}>
          <i className="bx bx-left-arrow-alt rtl-flip" /> {t('backToAdmin')}
        </Link>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: textPrimary, margin: 0, letterSpacing: '-0.02em' }}>{t('documentation')}</h1>
        <p style={{ fontSize: 13, color: textMuted, marginTop: 5 }}>{t('documentationDesc')}</p>
      </div>

      {/* Split layout */}
      <div className="grid-sidebar" style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 20, alignItems: 'start' }}>
        {/* Left: doc tree */}
        <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: `1px solid ${cardBorder}`, fontSize: 11, fontWeight: 600, color: textDim, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            {t('sections')}
          </div>
          {DOC_SECTION_KEYS.map((sectionKey, idx) => {
            const isActive = selected === sectionKey
            const section = t(sectionKey)
            return (
              <button
                key={sectionKey}
                onClick={() => setSelected(sectionKey)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 9, width: '100%',
                  padding: '11px 16px', border: 'none', cursor: 'pointer', textAlign: 'start',
                  background: isActive ? navActiveBg : 'transparent',
                  borderBottom: idx < DOC_SECTION_KEYS.length - 1 ? `1px solid ${rowBorder}` : 'none',
                  /* no left border */
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
                {selected ? t(selected as any) : t('noSectionSelected')}
              </div>
              {selected && <div style={{ fontSize: 11, color: textDim, marginTop: 2 }}>{t('editContentBelow')}</div>}
            </div>
            {selected && (
              <button style={{ padding: '6px 14px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, #00e5ff, #a900ff)', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                {t('save')}
              </button>
            )}
          </div>
          <div style={{ padding: 20 }}>
            {selected ? (
              <>
                <div style={{ fontSize: 11, fontWeight: 600, color: textDim, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 10 }}>
                  {t('editContent')}
                </div>
                <textarea
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder={t('writeContentPlaceholder', { section: t(selected as any) })}
                  style={{
                    width: '100%', minHeight: 360, padding: '12px 14px', borderRadius: 10,
                    border: `1px solid ${inputBorder}`, background: inputBg, color: textPrimary,
                    fontSize: 13, lineHeight: 1.6, outline: 'none', resize: 'vertical',
                    boxSizing: 'border-box', fontFamily: 'inherit',
                  }}
                />
                <div style={{ marginTop: 10, fontSize: 11, color: textDim }}>
                  {t('markdownSupported')}
                </div>
              </>
            ) : (
              <div style={{ padding: '60px 40px', textAlign: 'center' }}>
                <i className="bx bx-book-open" style={{ fontSize: 40, color: textDim, display: 'block', marginBottom: 12 }} />
                <div style={{ fontSize: 14, fontWeight: 600, color: textMuted, marginBottom: 4 }}>{t('selectDocSection')}</div>
                <div style={{ fontSize: 12, color: textDim }}>
                  {t('selectDocSectionDesc')}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
