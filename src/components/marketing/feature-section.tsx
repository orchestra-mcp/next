'use client'
import type { ReactNode } from 'react'
import { useThemeStore } from '@/store/theme'

interface FeatureSectionProps {
  tag: string
  title: string
  description: string
  bullets: string[]
  visual: ReactNode
  reverse?: boolean
  accentColor?: string
}

export function FeatureSection({ tag, title, description, bullets, visual, reverse = false, accentColor = '#00e5ff' }: FeatureSectionProps) {
  const { theme } = useThemeStore()
  const isDark = theme === 'dark'

  const textPrimary = isDark ? '#f8f8f8' : '#0f0f12'
  const textMuted = isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'
  const bulletColor = isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.65)'

  return (
    <>
    <style>{`
      @media (max-width: 768px) {
        .feature-section-grid {
          grid-template-columns: 1fr !important;
          direction: ltr !important;
          gap: 32px !important;
        }
        .feature-section-wrap { padding: 48px 20px !important; }
      }
    `}</style>
    <section className="feature-section-wrap" style={{ padding: '80px 32px', maxWidth: 1200, margin: '0 auto' }}>
      <div className="feature-section-grid" style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 64,
        alignItems: 'center',
        direction: reverse ? 'rtl' : 'ltr',
      } as React.CSSProperties}>
        <div style={{ direction: 'ltr' } as React.CSSProperties}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px',
            borderRadius: 100, border: `1px solid ${accentColor}30`, background: `${accentColor}0d`,
            marginBottom: 20, fontSize: 12, fontWeight: 600, color: accentColor,
            letterSpacing: '0.04em', textTransform: 'uppercase' as const,
          }}>{tag}</div>
          <h2 style={{ fontSize: 'clamp(22px, 3.5vw, 38px)', fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 16, color: textPrimary, lineHeight: 1.15 }}>{title}</h2>
          <p style={{ fontSize: 16, color: textMuted, lineHeight: 1.7, marginBottom: 24 }}>{description}</p>
          <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {bullets.map((b, i) => (
              <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 14, color: bulletColor }}>
                <span style={{ color: accentColor, flexShrink: 0, fontSize: 16, marginTop: 1 }}>&#10003;</span>
                {b}
              </li>
            ))}
          </ul>
        </div>
        <div style={{ direction: 'ltr', overflow: 'hidden' } as React.CSSProperties}>{visual}</div>
      </div>
    </section>
    </>
  )
}
