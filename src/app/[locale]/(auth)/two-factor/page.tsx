'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useAuthStore } from '@/store/auth'
import { useThemeStore } from '@/store/theme'
import { useTranslations } from 'next-intl'

export default function TwoFactorPage() {
  const t = useTranslations()
  const router = useRouter()
  const searchParams = useSearchParams()
  const tempTokenParam = searchParams.get('temp_token') ?? ''
  const { verify2FA, loading, error, clearError } = useAuthStore()
  const { theme } = useThemeStore()
  const isDark = theme === 'dark'

  const [digits, setDigits] = useState(['', '', '', '', '', ''])
  const [useRecovery, setUseRecovery] = useState(false)
  const [recoveryCode, setRecoveryCode] = useState('')
  const refs = useRef<(HTMLInputElement | null)[]>([])

  // Read temp token from URL param or sessionStorage
  const tempToken = tempTokenParam || (typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('orchestra_2fa_token') ?? '' : '')
  const savedEmail = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('orchestra_2fa_email') ?? '' : ''

  useEffect(() => {
    if (!tempToken) router.replace('/login')
    refs.current[0]?.focus()
  }, [tempToken, router])

  const textPrimary = isDark ? '#f8f8f8' : '#0f0f12'
  const textMuted = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.45)'
  const cardBg = isDark ? 'rgba(255,255,255,0.03)' : '#ffffff'
  const cardBorder = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)'
  const cardShadow = isDark ? '0 0 60px rgba(169,0,255,0.08)' : '0 8px 32px rgba(0,0,0,0.06)'
  const digitBg = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'
  const digitBorder = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)'
  const digitColor = isDark ? '#f8f8f8' : '#0f0f12'
  const hintColor = isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.45)'
  const inputBg = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'
  const inputBorder = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.12)'
  const inputColor = isDark ? '#f8f8f8' : '#0f0f12'
  const footerText = isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.4)'
  const toggleColor = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)'

  const otp = digits.join('')

  const handleDigit = (i: number, val: string) => {
    clearError()
    const v = val.replace(/\D/g, '').slice(-1)
    const next = [...digits]
    next[i] = v
    setDigits(next)
    if (v && i < 5) refs.current[i + 1]?.focus()
    if (v && next.every(d => d !== '') && i === 5) {
      submitCode(next.join(''))
    }
  }

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) refs.current[i - 1]?.focus()
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted.length === 6) {
      setDigits(pasted.split(''))
      refs.current[5]?.focus()
      submitCode(pasted)
    }
  }

  const submitCode = async (code: string) => {
    try {
      await verify2FA(code, tempToken)
      router.replace('/dashboard')
    } catch {}
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (useRecovery) {
      await submitCode(recoveryCode.replace(/-/g, ''))
    } else if (otp.length === 6) {
      await submitCode(otp)
    }
  }

  return (
    <div style={{ maxWidth: 420, margin: '0 auto' }}>
      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
          <Image src="/logo.svg" alt="Orchestra" width={52} height={52} />
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: textPrimary, margin: 0, letterSpacing: '-0.02em' }}>{t('auth.twoFactorAuth')}</h1>
        <p style={{ fontSize: 14, color: textMuted, marginTop: 8 }}>
          {savedEmail
            ? <>{t('auth.signingInAs')} <strong style={{ color: textPrimary }}>{savedEmail}</strong></>
            : t('auth.enter2faCode')
          }
        </p>
      </div>

      <div className="auth-card" style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 20, padding: '32px 28px', backdropFilter: 'blur(16px)', boxShadow: cardShadow }}>
        {error && (
          <div style={{ marginBottom: 20, padding: '10px 14px', borderRadius: 8, fontSize: 13, background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {!useRecovery ? (
            <>
              <div>
                <div style={{ fontSize: 12, color: hintColor, marginBottom: 14, textAlign: 'center' }}>
                  {t('auth.enter2faCodeShort')}
                </div>
                <div className="otp-digits" style={{ display: 'flex', gap: 10, justifyContent: 'center' }} onPaste={handlePaste}>
                  {digits.map((d, i) => (
                    <input
                      key={i}
                      ref={el => { refs.current[i] = el }}
                      type="text" inputMode="numeric" maxLength={1} value={d}
                      onChange={e => handleDigit(i, e.target.value)}
                      onKeyDown={e => handleKeyDown(i, e)}
                      style={{
                        width: 48, height: 56, textAlign: 'center', fontSize: 22, fontWeight: 700,
                        borderRadius: 12, border: `2px solid ${d ? 'rgba(169,0,255,0.4)' : digitBorder}`,
                        background: d ? 'rgba(169,0,255,0.06)' : digitBg,
                        color: digitColor, outline: 'none', fontFamily: 'inherit',
                        transition: 'border-color 0.15s, background 0.15s',
                      }}
                    />
                  ))}
                </div>
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
                {loading ? t('auth.verifying') : t('auth.verify')}
              </button>
            </>
          ) : (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 500, color: hintColor }}>{t('auth.recoveryCodeLabel')}</label>
                <input
                  type="text" value={recoveryCode}
                  onChange={e => { setRecoveryCode(e.target.value); clearError() }}
                  placeholder="XXXX-XXXX-XXXX"
                  style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: `1px solid ${inputBorder}`, background: inputBg, color: inputColor, fontSize: 14, outline: 'none', boxSizing: 'border-box', fontFamily: 'monospace', letterSpacing: '0.05em' }}
                />
                <div style={{ fontSize: 12, color: hintColor }}>{t('auth.recoveryCodeHint')}</div>
              </div>
              <button
                type="submit" disabled={loading || !recoveryCode}
                style={{
                  padding: '13px', borderRadius: 10, border: 'none', fontSize: 15, fontWeight: 600,
                  color: (loading || !recoveryCode) ? (isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)') : '#fff',
                  background: (loading || !recoveryCode) ? (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)') : 'linear-gradient(135deg, #00e5ff, #a900ff)',
                  cursor: (loading || !recoveryCode) ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                {loading ? t('auth.verifying') : t('auth.useRecoveryCode')}
              </button>
            </>
          )}
        </form>

        <div style={{ marginTop: 20, textAlign: 'center' }}>
          <button
            onClick={() => { setUseRecovery(!useRecovery); clearError() }}
            style={{ background: 'none', border: 'none', color: toggleColor, fontSize: 13, cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: 3 }}
          >
            {useRecovery ? t('auth.useAuthenticator') : t('auth.cantAccessApp')}
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
