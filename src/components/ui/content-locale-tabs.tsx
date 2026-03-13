'use client'
import { locales } from '@/i18n/config'

const LOCALE_FLAGS: Record<string, string> = {
  en: '\uD83C\uDDFA\uD83C\uDDF8',
  ar: '\uD83C\uDDF8\uD83C\uDDE6',
}

const LOCALE_LABELS: Record<string, string> = {
  en: 'English',
  ar: '\u0627\u0644\u0639\u0631\u0628\u064a\u0629',
}

interface ContentLocaleTabsProps {
  activeLocale: string
  onChange: (locale: string) => void
}

export function ContentLocaleTabs({ activeLocale, onChange }: ContentLocaleTabsProps) {
  return (
    <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
      {locales.map(l => {
        const isActive = l === activeLocale
        return (
          <button
            key={l}
            onClick={() => onChange(l)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '6px 14px', borderRadius: 8,
              border: `1px solid ${isActive ? 'rgba(0,229,255,0.3)' : 'var(--color-border)'}`,
              background: isActive ? 'rgba(0,229,255,0.08)' : 'transparent',
              color: isActive ? '#00e5ff' : 'var(--color-fg-muted)',
              fontSize: 12, fontWeight: isActive ? 600 : 500,
              cursor: 'pointer', fontFamily: 'inherit',
              transition: 'all 0.15s',
            }}
          >
            <span style={{ fontSize: 14, lineHeight: 1 }}>{LOCALE_FLAGS[l] || ''}</span>
            {LOCALE_LABELS[l] || l.toUpperCase()}
          </button>
        )
      })}
    </div>
  )
}
