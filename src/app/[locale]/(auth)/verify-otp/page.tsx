'use client'
import { useState, useRef, useEffect, use } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useAuthStore } from '@/store/auth'
import { useThemeStore } from '@/store/theme'
import { useTranslations } from 'next-intl'

export default function VerifyOtpPage() {
  const t = useTranslations()
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email') ?? ''
  const purpose = (searchParams.get('purpose') ?? 'reset') as 'reset' | 'magic'
  const { verifyOtp, forgotPassword, requestMagicLink, loading, error, clearError } = useAuthStore()
  const { theme } = useThemeStore()
  const isDark = theme === 'dark'

  const [digits, setDigits] = useState(['', '', '', '', '', ''])
  const [resent, setResent] = useState(false)
  const refs = useRef<(HTMLInputElement | null)[]>([])

  const textPrimary = isDark ? '#f8f8f8' : '#0f0f12'
  const textMuted = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.45)'
  const cardBg = isDark ? 'rgba(255,255,255,0.03)' : '#ffffff'
  const cardBorder = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)'
  const cardShadow = isDark ? '0 0 60px rgba(169,0,255,0.08)' : '0 8px 32px rgba(0,0,0,0.06)'
  const digitBg = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'
  const digitBorder = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)'
  const digitColor = isDark ? '#f8f8f8' : '#0f0f12'
  const hintColor = isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.45)'
  const resendColor = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)'
  const footerText = isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.4)'

  useEffect(() => {
    refs.current[0]?.focus()
  }, [])

  const otp = digits.join('')

  const handleDigit = (i: number, val: string) => {
    clearError()
    const v = val.replace(/\D/g, '').slice(-1)
    const next = [...digits]
    next[i] = v
    setDigits(next)
    if (v && i < 5) refs.current[i + 1]?.focus()
    // auto-submit when complete
    if (v && next.every(d => d !== '') && i === 5) {
      submitOtp(next.join(''))
    }
  }

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) {
      refs.current[i - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted.length === 6) {
      const next = pasted.split('')
      setDigits(next)
      refs.current[5]?.focus()
      submitOtp(pasted)
    }
  }

  const submitOtp = async (code: string) => {
    if (!email) return
    try {
      const result = await verifyOtp(email, code, purpose)
      if (purpose === 'reset') {
        router.push(`/reset-password?token=${encodeURIComponent(result.token ?? '')}`)
      } else {
        // magic login — user is now logged in
        router.replace('/dashboard')
      }
    } catch {}
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (otp.length === 6) await submitOtp(otp)
  }

  const handleResend = async () => {
    try {
      if (purpose === 'reset') {
        await forgotPassword(email)
      } else {
        await requestMagicLink(email)
      }
      setDigits(['', '', '', '', '', ''])
      refs.current[0]?.focus()
      setResent(true)
      setTimeout(() => setResent(false), 3000)
    } catch {}
  }

  return (
    <div style={{ maxWidth: 420, margin: '0 auto' }}>
      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
          <Image src="/logo.svg" alt="Orchestra" width={52} height={52} />
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: textPrimary, margin: 0, letterSpacing: '-0.02em' }}>
          {purpose === 'magic' ? t('auth.checkYourEmailMagic') : t('auth.enterYourCode')}
        </h1>
        <p style={{ fontSize: 14, color: textMuted, marginTop: 8 }}>
          {t('auth.codeSentToEmail')}{' '}
          <strong style={{ color: textPrimary }}>{email || 'your email'}</strong>
        </p>
      </div>

      <div className="auth-card" style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 20, padding: '32px 28px', backdropFilter: 'blur(16px)', boxShadow: cardShadow }}>
        {error && (
          <div style={{ marginBottom: 20, padding: '10px 14px', borderRadius: 8, fontSize: 13, background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>
            {error}
          </div>
        )}

        {resent && (
          <div style={{ marginBottom: 20, padding: '10px 14px', borderRadius: 8, fontSize: 13, background: 'rgba(34,197,94,0.08)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.2)' }}>
            {t('auth.newCodeSent')}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* 6-digit input */}
          <div className="otp-digits" style={{ display: 'flex', gap: 10, justifyContent: 'center' }} onPaste={handlePaste}>
            {digits.map((d, i) => (
              <input
                key={i}
                ref={el => { refs.current[i] = el }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={d}
                onChange={e => handleDigit(i, e.target.value)}
                onKeyDown={e => handleKeyDown(i, e)}
                style={{
                  width: 48, height: 56, textAlign: 'center', fontSize: 22, fontWeight: 700,
                  borderRadius: 12, border: `2px solid ${d ? 'rgba(0,229,255,0.4)' : digitBorder}`,
                  background: d ? 'rgba(0,229,255,0.06)' : digitBg,
                  color: digitColor, outline: 'none', fontFamily: 'inherit',
                  transition: 'border-color 0.15s, background 0.15s',
                }}
              />
            ))}
          </div>

          <div style={{ textAlign: 'center', fontSize: 12, color: hintColor }}>
            {t('auth.codeExpiresIn')}
          </div>

          <button
            type="submit" disabled={loading || otp.length < 6}
            style={{
              padding: '13px', borderRadius: 10, border: 'none', fontSize: 15, fontWeight: 600,
              color: (loading || otp.length < 6) ? (isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)') : '#fff',
              background: (loading || otp.length < 6) ? (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)') : 'linear-gradient(135deg, #00e5ff, #a900ff)',
              cursor: (loading || otp.length < 6) ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit',
            }}
          >
            {loading ? t('auth.verifying') : t('auth.verifyCode')}
          </button>
        </form>

        <div style={{ marginTop: 20, textAlign: 'center', fontSize: 13, color: resendColor }}>
          {t('auth.didntReceive')}{' '}
          <button
            onClick={handleResend}
            disabled={loading}
            style={{ background: 'none', border: 'none', color: '#00e5ff', fontSize: 13, fontWeight: 600, cursor: 'pointer', padding: 0 }}
          >
            {t('auth.resendCode')}
          </button>
        </div>
      </div>

      <p style={{ textAlign: 'center', fontSize: 13, color: footerText, marginTop: 24 }}>
        <Link href="/login" style={{ color: footerText, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
          <i className="bx bx-left-arrow-alt rtl-flip" /> {t('common.backToSignIn')}
        </Link>
      </p>
    </div>
  )
}
