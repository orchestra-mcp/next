'use client'
import { useState } from 'react'
import { useThemeStore } from '@/store/theme'

export default function ReportPage() {
  const [form, setForm] = useState({ type: 'Bug', description: '', steps: '' })
  const [sent, setSent] = useState(false)
  const { theme } = useThemeStore()
  const isDark = theme === 'dark'

  const textPrimary = isDark ? '#f8f8f8' : '#0f0f12'
  const textMuted = isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.5)'
  const labelColor = isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.55)'
  const cardBg = isDark ? 'rgba(255,255,255,0.03)' : '#ffffff'
  const cardBorder = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)'
  const inputBg = isDark ? 'rgba(255,255,255,0.04)' : '#f9f9fb'
  const inputBorder = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.12)'
  const inputColor = isDark ? '#f8f8f8' : '#0f0f12'
  const ghRowBg = isDark ? 'rgba(255,255,255,0.02)' : '#ffffff'
  const ghRowBorder = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)'
  const ghRowColor = isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'
  const ghIconColor = isDark ? '#f8f8f8' : '#0f0f12'
  const optInactiveBg = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)'
  const optInactiveBorder = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'
  const optInactiveColor = isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'
  const optionalLabelColor = isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.3)'

  const inputSt: React.CSSProperties = {
    width: '100%', padding: '11px 14px', borderRadius: 10,
    border: `1px solid ${inputBorder}`, background: inputBg,
    color: inputColor, fontSize: 14, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSent(true)
  }

  const issueTypes = ['Bug', 'Feature Request', 'Security Vulnerability', 'Documentation', 'Other']

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '72px 32px' }}>
      <div style={{ marginBottom: 48, textAlign: 'center' }}>
        <h1 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, letterSpacing: '-0.04em', color: textPrimary, marginBottom: 12 }}>Report an issue</h1>
        <p style={{ fontSize: 16, color: textMuted }}>Help us improve Orchestra by reporting bugs, security vulnerabilities, or missing features.</p>
      </div>

      {sent ? (
        <div style={{ padding: '40px', borderRadius: 16, border: '1px solid rgba(34,197,94,0.2)', background: 'rgba(34,197,94,0.06)', textAlign: 'center' }}>
          <i className="bx bx-check-circle" style={{ fontSize: 40, color: '#22c55e', display: 'block', marginBottom: 16 }} />
          <h2 style={{ fontSize: 20, fontWeight: 700, color: textPrimary, marginBottom: 8 }}>Report submitted</h2>
          <p style={{ fontSize: 14, color: textMuted }}>Thank you. We&apos;ll review your report and follow up if needed.</p>
        </div>
      ) : (
        <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 20, padding: '36px 32px', backdropFilter: 'blur(12px)' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label style={{ fontSize: 13, fontWeight: 500, color: labelColor }}>Issue type</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {issueTypes.map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, type: t }))}
                    style={{
                      padding: '7px 14px', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
                      background: form.type === t ? 'rgba(0,229,255,0.12)' : optInactiveBg,
                      border: form.type === t ? '1px solid rgba(0,229,255,0.3)' : `1px solid ${optInactiveBorder}`,
                      color: form.type === t ? '#00e5ff' : optInactiveColor,
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 500, color: labelColor }}>Description</label>
              <textarea required value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Describe the issue clearly..." rows={4} style={{ ...inputSt, resize: 'vertical' as const }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 500, color: labelColor }}>Steps to reproduce <span style={{ color: optionalLabelColor, fontWeight: 400 }}>(optional)</span></label>
              <textarea value={form.steps} onChange={e => setForm(f => ({ ...f, steps: e.target.value }))} placeholder="1. Open Orchestra&#10;2. Navigate to...&#10;3. See the error" rows={4} style={{ ...inputSt, resize: 'vertical' as const }} />
            </div>

            {form.type === 'Security Vulnerability' && (
              <div style={{ padding: '12px 14px', borderRadius: 8, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', fontSize: 13, color: '#ef4444' }}>
                <i className="bx bx-shield-x" style={{ marginRight: 6 }} />
                For critical security vulnerabilities, please email security@orchestra-mcp.dev directly.
              </div>
            )}

            <button type="submit" style={{ marginTop: 4, padding: '13px', borderRadius: 10, border: 'none', fontSize: 15, fontWeight: 600, color: '#fff', background: 'linear-gradient(135deg, #00e5ff, #a900ff)', cursor: 'pointer', fontFamily: 'inherit' }}>
              Submit report
            </button>
          </form>
        </div>
      )}

      <div style={{ marginTop: 32, padding: '16px 20px', borderRadius: 10, border: `1px solid ${ghRowBorder}`, background: ghRowBg, display: 'flex', alignItems: 'center', gap: 12, fontSize: 14, color: ghRowColor }}>
        <i className="bx bxl-github" style={{ fontSize: 20, color: ghIconColor, flexShrink: 0 }} />
        <span>Prefer GitHub?</span>
        <a href="https://github.com/orchestra-mcp/orchestra/issues/new" target="_blank" rel="noopener" style={{ color: '#00e5ff', textDecoration: 'none', fontWeight: 500, marginLeft: 'auto' }}>
          Open an issue &rarr;
        </a>
      </div>
    </div>
  )
}
