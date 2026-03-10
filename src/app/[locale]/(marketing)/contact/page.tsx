'use client'
import { useState } from 'react'
import { useThemeStore } from '@/store/theme'
import { useTranslations } from 'next-intl'

export default function ContactPage() {
  const t = useTranslations()
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
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
  const linkRowBg = isDark ? 'rgba(255,255,255,0.02)' : '#ffffff'
  const linkRowBorder = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)'
  const arrowColor = isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'

  const inputSt: React.CSSProperties = {
    width: '100%', padding: '11px 14px', borderRadius: 10,
    border: `1px solid ${inputBorder}`, background: inputBg,
    color: inputColor, fontSize: 14, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSent(true)
  }

  return (
    <div className="mkt-page" style={{ maxWidth: 640, margin: '0 auto', padding: '72px 32px' }}>
      <div style={{ marginBottom: 48, textAlign: 'center' }}>
        <h1 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, letterSpacing: '-0.04em', color: textPrimary, marginBottom: 12 }}>{t('contact.title')}</h1>
        <p style={{ fontSize: 16, color: textMuted }}>{t('contact.subtitle')}</p>
      </div>

      {sent ? (
        <div style={{ padding: '40px', borderRadius: 16, border: '1px solid rgba(34,197,94,0.2)', background: 'rgba(34,197,94,0.06)', textAlign: 'center' }}>
          <i className="bx bx-check-circle" style={{ fontSize: 40, color: '#22c55e', display: 'block', marginBottom: 16 }} />
          <h2 style={{ fontSize: 20, fontWeight: 700, color: textPrimary, marginBottom: 8 }}>{t('contact.messageSent')}</h2>
          <p style={{ fontSize: 14, color: textMuted }}>{t('contact.messageSentDesc')}</p>
        </div>
      ) : (
        <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 20, padding: '36px 32px', backdropFilter: 'blur(12px)' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div className="mkt-form-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 500, color: labelColor }}>{t('contact.fullName')}</label>
                <input type="text" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder={t('contact.namePlaceholder')} style={inputSt} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 500, color: labelColor }}>{t('contact.emailAddress')}</label>
                <input type="email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="you@example.com" style={inputSt} />
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 500, color: labelColor }}>{t('contact.subject')}</label>
              <input type="text" required value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} placeholder={t('contact.subjectPlaceholder')} style={inputSt} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 500, color: labelColor }}>{t('contact.message')}</label>
              <textarea required value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} placeholder={t('contact.messagePlaceholder')} rows={6} style={{ ...inputSt, resize: 'vertical' as const }} />
            </div>
            <button type="submit" style={{ marginTop: 8, padding: '13px', borderRadius: 10, border: 'none', fontSize: 15, fontWeight: 600, color: '#fff', background: 'linear-gradient(135deg, #00e5ff, #a900ff)', cursor: 'pointer', fontFamily: 'inherit' }}>
              {t('contact.sendMessage')}
            </button>
          </form>
        </div>
      )}

      <div style={{ marginTop: 40, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {[
          { icon: 'bxl-github', label: t('contact.githubDiscussions'), href: 'https://github.com/orchestra-mcp/orchestra/discussions', color: isDark ? '#f8f8f8' : '#0f0f12' },
          { icon: 'bxl-discord-alt', label: t('contact.joinDiscord'), href: 'https://discord.gg/orchestra', color: '#5865f2' },
        ].map(link => (
          <a key={link.label} href={link.href} target="_blank" rel="noopener" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderRadius: 10, border: `1px solid ${linkRowBorder}`, background: linkRowBg, textDecoration: 'none', color: textPrimary, fontSize: 14 }}>
            <i className={`bx ${link.icon}`} style={{ fontSize: 20, color: link.color }} />
            {link.label}
            <i className="bx bx-right-arrow-alt rtl-flip" style={{ marginInlineStart: 'auto', color: arrowColor }} />
          </a>
        ))}
      </div>
    </div>
  )
}
