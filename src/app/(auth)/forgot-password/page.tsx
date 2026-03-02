'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useAuthStore } from '@/store/auth'
import { useThemeStore } from '@/store/theme'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const { forgotPassword, loading, error, clearError } = useAuthStore()
  const { theme } = useThemeStore()
  const isDark = theme === 'dark'
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  const textPrimary = isDark ? '#f8f8f8' : '#0f0f12'
  const textMuted = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.45)'
  const cardBg = isDark ? 'rgba(255,255,255,0.03)' : '#ffffff'
  const cardBorder = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)'
  const cardShadow = isDark ? '0 0 60px rgba(169,0,255,0.08)' : '0 8px 32px rgba(0,0,0,0.06)'
  const inputBg = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'
  const inputBorder = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.12)'
  const inputColor = isDark ? '#f8f8f8' : '#0f0f12'
  const labelColor = isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'
  const footerText = isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.4)'
  const backIconColor = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)'
  const hintColor = isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.45)'

  const inputSt: React.CSSProperties = {
    width: '100%', padding: '11px 14px', borderRadius: 10,
    border: `1px solid ${inputBorder}`, background: inputBg,
    color: inputColor, fontSize: 14, outline: 'none', boxSizing: 'border-box',
    fontFamily: 'inherit',
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await forgotPassword(email)
      setSent(true)
    } catch {}
  }

  return (
    <div style={{ maxWidth: 420, margin: '0 auto' }}>
      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
          <Image src="/logo.svg" alt="Orchestra" width={52} height={52} />
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: textPrimary, margin: 0, letterSpacing: '-0.02em' }}>Reset your password</h1>
        <p style={{ fontSize: 14, color: textMuted, marginTop: 8 }}>Enter your email and we&apos;ll send a 6-digit code.</p>
      </div>

      <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 20, padding: '32px 28px', backdropFilter: 'blur(16px)', boxShadow: cardShadow }}>
        {sent ? (
          <div style={{ textAlign: 'center', padding: '8px 0' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(0,229,255,0.1)', border: '1px solid rgba(0,229,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <i className="bx bx-mail-send" style={{ fontSize: 26, color: '#00e5ff' }} />
            </div>
            <div style={{ fontSize: 16, fontWeight: 600, color: textPrimary, marginBottom: 10 }}>Check your email</div>
            <div style={{ fontSize: 13, color: hintColor, marginBottom: 24, lineHeight: 1.6 }}>
              We sent a 6-digit code to <strong style={{ color: textPrimary }}>{email}</strong>.<br />It expires in 10 minutes.
            </div>
            <button
              onClick={() => router.push(`/verify-otp?email=${encodeURIComponent(email)}&purpose=reset`)}
              style={{ width: '100%', padding: '13px', borderRadius: 10, border: 'none', fontSize: 15, fontWeight: 600, color: '#fff', background: 'linear-gradient(135deg, #00e5ff, #a900ff)', cursor: 'pointer', fontFamily: 'inherit' }}
            >
              Enter code
            </button>
            <button
              onClick={() => setSent(false)}
              style={{ marginTop: 12, width: '100%', padding: '11px', borderRadius: 10, border: `1px solid ${cardBorder}`, background: 'transparent', fontSize: 13, color: hintColor, cursor: 'pointer', fontFamily: 'inherit' }}
            >
              Resend code
            </button>
          </div>
        ) : (
          <>
            {error && (
              <div style={{ marginBottom: 20, padding: '10px 14px', borderRadius: 8, fontSize: 13, background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 500, color: labelColor }}>Email address</label>
                <input
                  type="email" required value={email}
                  onChange={e => { setEmail(e.target.value); clearError() }}
                  placeholder="you@example.com" style={inputSt}
                  autoFocus
                />
              </div>
              <button
                type="submit" disabled={loading}
                style={{ marginTop: 4, padding: '13px', borderRadius: 10, border: 'none', fontSize: 15, fontWeight: 600, color: loading ? (isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)') : '#fff', background: loading ? (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)') : 'linear-gradient(135deg, #00e5ff, #a900ff)', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}
              >
                {loading ? 'Sending...' : 'Send reset code'}
              </button>
            </form>
          </>
        )}
      </div>

      <p style={{ textAlign: 'center', fontSize: 13, color: footerText, marginTop: 24 }}>
        <Link href="/login" style={{ color: backIconColor, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
          <i className="bx bx-left-arrow-alt" /> Back to sign in
        </Link>
      </p>
    </div>
  )
}
