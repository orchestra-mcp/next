'use client'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useAuthStore } from '@/store/auth'
import { useThemeStore } from '@/store/theme'
import { useTranslations } from 'next-intl'

function StrengthBar({ password }: { password: string }) {
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ]
  const score = checks.filter(Boolean).length
  const colors = ['transparent', '#ef4444', '#f97316', '#eab308', '#22c55e']
  const t = useTranslations()
  const labels = ['', t('auth.strengthWeak'), t('auth.strengthFair'), t('auth.strengthGood'), t('auth.strengthStrong')]

  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: 'flex', gap: 4, marginBottom: 5 }}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= score ? colors[score] : 'rgba(128,128,128,0.2)', transition: 'background 0.2s' }} />
        ))}
      </div>
      {password && <div style={{ fontSize: 11, color: colors[score] }}>{labels[score]}</div>}
    </div>
  )
}

export default function ResetPasswordPage() {
  const t = useTranslations()
  const router = useRouter()
  const searchParams = useSearchParams()
  const resetToken = searchParams.get('token') ?? ''
  const { resetPassword, loading, error, clearError } = useAuthStore()
  const { theme } = useThemeStore()
  const isDark = theme === 'dark'

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [done, setDone] = useState(false)
  const [localError, setLocalError] = useState('')

  useEffect(() => {
    if (!resetToken) router.replace('/forgot-password')
  }, [resetToken, router])

  const textPrimary = isDark ? '#f8f8f8' : '#0f0f12'
  const textMuted = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.45)'
  const cardBg = isDark ? 'rgba(255,255,255,0.03)' : '#ffffff'
  const cardBorder = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)'
  const cardShadow = isDark ? '0 0 60px rgba(169,0,255,0.08)' : '0 8px 32px rgba(0,0,0,0.06)'
  const inputBg = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'
  const inputBorder = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.12)'
  const inputColor = isDark ? '#f8f8f8' : '#0f0f12'
  const labelColor = isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'
  const eyeColor = isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.3)'
  const footerText = isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.4)'

  const inputSt: React.CSSProperties = {
    width: '100%', padding: '11px 44px 11px 14px', borderRadius: 10,
    border: `1px solid ${inputBorder}`, background: inputBg,
    color: inputColor, fontSize: 14, outline: 'none', boxSizing: 'border-box',
    fontFamily: 'inherit',
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError('')
    if (password !== confirm) { setLocalError(t('auth.passwordsDoNotMatch')); return }
    if (password.length < 8) { setLocalError(t('auth.passwordTooShort')); return }
    try {
      await resetPassword(resetToken, password)
      setDone(true)
    } catch {}
  }

  const anyError = localError || error

  return (
    <div style={{ maxWidth: 420, margin: '0 auto' }}>
      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
          <Image src="/logo.svg" alt="Orchestra" width={52} height={52} />
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: textPrimary, margin: 0, letterSpacing: '-0.02em' }}>{t('auth.setNewPassword')}</h1>
        <p style={{ fontSize: 14, color: textMuted, marginTop: 8 }}>{t('auth.setNewPasswordSubtitle')}</p>
      </div>

      <div className="auth-card" style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 20, padding: '32px 28px', backdropFilter: 'blur(16px)', boxShadow: cardShadow }}>
        {done ? (
          <div style={{ textAlign: 'center', padding: '8px 0' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <i className="bx bx-check" style={{ fontSize: 28, color: '#22c55e' }} />
            </div>
            <div style={{ fontSize: 16, fontWeight: 600, color: textPrimary, marginBottom: 10 }}>{t('auth.passwordUpdated')}</div>
            <div style={{ fontSize: 13, color: textMuted, marginBottom: 24 }}>{t('auth.passwordUpdatedDesc')}</div>
            <button
              onClick={() => router.push('/login')}
              style={{ width: '100%', padding: '13px', borderRadius: 10, border: 'none', fontSize: 15, fontWeight: 600, color: '#fff', background: 'linear-gradient(135deg, #00e5ff, #a900ff)', cursor: 'pointer', fontFamily: 'inherit' }}
            >
              {t('common.signIn')}
            </button>
          </div>
        ) : (
          <>
            {anyError && (
              <div style={{ marginBottom: 20, padding: '10px 14px', borderRadius: 8, fontSize: 13, background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>
                {anyError}
              </div>
            )}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 500, color: labelColor }}>{t('auth.newPasswordLabel')}</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPw ? 'text' : 'password'} required value={password}
                    onChange={e => { setPassword(e.target.value); clearError(); setLocalError('') }}
                    placeholder="••••••••" style={inputSt}
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: eyeColor, padding: 0 }}>
                    <i className={`bx ${showPw ? 'bx-hide' : 'bx-show'}`} style={{ fontSize: 18 }} />
                  </button>
                </div>
                {password && <StrengthBar password={password} />}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 500, color: labelColor }}>{t('auth.confirmPasswordLabel')}</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showConfirm ? 'text' : 'password'} required value={confirm}
                    onChange={e => { setConfirm(e.target.value); setLocalError('') }}
                    placeholder="••••••••" style={{ ...inputSt, borderColor: confirm && confirm !== password ? '#ef4444' : inputBorder }}
                  />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: eyeColor, padding: 0 }}>
                    <i className={`bx ${showConfirm ? 'bx-hide' : 'bx-show'}`} style={{ fontSize: 18 }} />
                  </button>
                </div>
              </div>
              <button
                type="submit" disabled={loading}
                style={{ marginTop: 4, padding: '13px', borderRadius: 10, border: 'none', fontSize: 15, fontWeight: 600, color: loading ? (isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)') : '#fff', background: loading ? (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)') : 'linear-gradient(135deg, #00e5ff, #a900ff)', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}
              >
                {loading ? t('auth.updating') : t('auth.updatePassword')}
              </button>
            </form>
          </>
        )}
      </div>

      {!done && (
        <p style={{ textAlign: 'center', fontSize: 13, color: footerText, marginTop: 24 }}>
          <Link href="/login" style={{ color: footerText, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
            <i className="bx bx-left-arrow-alt rtl-flip" /> {t('common.backToSignIn')}
          </Link>
        </p>
      )}
    </div>
  )
}
