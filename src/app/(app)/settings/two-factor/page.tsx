'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { useAuthStore } from '@/store/auth'
import { useThemeStore } from '@/store/theme'

export default function TwoFactorSetupPage() {
  const router = useRouter()
  const { user, setup2FA, confirm2FA, disable2FA, loading, error, clearError } = useAuthStore()
  const { theme } = useThemeStore()
  const isDark = theme === 'dark'

  const [step, setStep] = useState<'idle' | 'setup' | 'confirm' | 'done' | 'disable'>('idle')
  const [qrUrl, setQrUrl] = useState('')
  const [secret, setSecret] = useState('')
  const [code, setCode] = useState('')
  const [codeError, setCodeError] = useState('')
  const [showSecret, setShowSecret] = useState(false)

  const enabled = user?.two_factor_enabled ?? false

  const textPrimary = isDark ? '#f8f8f8' : '#0f0f12'
  const textMuted = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.45)'
  const textDim = isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.35)'
  const cardBg = isDark ? 'rgba(255,255,255,0.025)' : '#ffffff'
  const cardBorder = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)'
  const cardDivider = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.07)'
  const inputBg = isDark ? 'rgba(255,255,255,0.04)' : '#f9f9fb'
  const inputBorder = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.12)'
  const inputColor = isDark ? '#f8f8f8' : '#0f0f12'
  const stepBg = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)'
  const stepBorder = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)'
  const secretBg = isDark ? 'rgba(0,0,0,0.3)' : '#f3f4f6'
  const qrBg = isDark ? '#ffffff' : '#ffffff'
  const appIconBg = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'
  const appIconBorder = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'

  const inputSt: React.CSSProperties = {
    width: '100%', padding: '11px 14px', borderRadius: 10,
    border: `1px solid ${inputBorder}`, background: inputBg,
    color: inputColor, fontSize: 14, outline: 'none', boxSizing: 'border-box',
    fontFamily: 'inherit', textAlign: 'center', letterSpacing: '0.2em', fontSize: 22,
  } as React.CSSProperties

  const handleStartSetup = async () => {
    clearError()
    try {
      const res = await setup2FA()
      setQrUrl(res.qr_url)
      setSecret(res.secret)
      setStep('setup')
    } catch {}
  }

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault()
    setCodeError('')
    if (code.replace(/\s/g, '').length < 6) { setCodeError('Enter the 6-digit code from your app'); return }
    clearError()
    try {
      await confirm2FA(code.replace(/\s/g, ''))
      setStep('done')
    } catch {}
  }

  const handleDisable = async (e: React.FormEvent) => {
    e.preventDefault()
    setCodeError('')
    clearError()
    try {
      await disable2FA(code.replace(/\s/g, ''))
      setCode('')
      setStep('idle')
    } catch {}
  }

  const anyError = codeError || error

  return (
    <div style={{ maxWidth: 680, padding: '28px 32px' }}>
      {/* Breadcrumb */}
      <Link href="/settings" style={{ fontSize: 13, color: textDim, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 5, marginBottom: 24 }}>
        <i className="bx bx-left-arrow-alt" style={{ fontSize: 15 }} /> Settings
      </Link>

      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: textPrimary, margin: 0, letterSpacing: '-0.02em' }}>Two-Factor Authentication</h1>
        <p style={{ fontSize: 13, color: textMuted, marginTop: 5 }}>Add an extra layer of security to your account.</p>
      </div>

      {/* Status card */}
      <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 14, padding: '20px 24px', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 42, height: 42, borderRadius: 10, background: enabled ? 'rgba(34,197,94,0.1)' : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <i className={`bx ${enabled ? 'bx-shield-quarter' : 'bx-shield'}`} style={{ fontSize: 22, color: enabled ? '#22c55e' : (isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.35)') }} />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: textPrimary }}>
              2FA is {enabled ? 'enabled' : 'disabled'}
            </div>
            <div style={{ fontSize: 12, color: textDim, marginTop: 2 }}>
              {enabled ? 'Your account is protected with an authenticator app.' : 'Your account is only protected by your password.'}
            </div>
          </div>
        </div>
        <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 100, fontWeight: 600, flexShrink: 0,
          background: enabled ? 'rgba(34,197,94,0.1)' : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'),
          color: enabled ? '#22c55e' : textDim,
          border: `1px solid ${enabled ? 'rgba(34,197,94,0.25)' : cardBorder}`,
        }}>
          {enabled ? 'Enabled' : 'Disabled'}
        </span>
      </div>

      {/* Idle — not yet enabled */}
      {!enabled && step === 'idle' && (
        <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 14, padding: '24px' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: textPrimary, marginBottom: 16, paddingBottom: 14, borderBottom: `1px solid ${cardDivider}` }}>
            Enable 2FA
          </div>

          {/* Supported apps */}
          <div style={{ fontSize: 13, color: textMuted, marginBottom: 16 }}>Works with any TOTP authenticator app:</div>
          <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
            {[
              { name: 'Google Authenticator', icon: 'bxl-google' },
              { name: 'Authy', icon: 'bx-shield-quarter' },
              { name: '1Password', icon: 'bx-key' },
            ].map(app => (
              <div key={app.name} style={{ padding: '8px 12px', borderRadius: 8, background: appIconBg, border: `1px solid ${appIconBorder}`, display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: textPrimary }}>
                <i className={`bx ${app.icon}`} style={{ fontSize: 15, color: '#00e5ff' }} />
                {app.name}
              </div>
            ))}
          </div>

          {error && (
            <div style={{ marginBottom: 16, padding: '10px 14px', borderRadius: 8, fontSize: 13, background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>
              {error}
            </div>
          )}

          <button
            onClick={handleStartSetup}
            disabled={loading}
            style={{ padding: '10px 22px', borderRadius: 9, border: 'none', background: 'linear-gradient(135deg, #00e5ff, #a900ff)', color: '#fff', fontSize: 14, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}
          >
            {loading ? 'Loading...' : 'Set up authenticator app'}
          </button>
        </div>
      )}

      {/* Step: setup — show QR */}
      {step === 'setup' && (
        <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 14, padding: '24px' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: textPrimary, marginBottom: 20, paddingBottom: 14, borderBottom: `1px solid ${cardDivider}` }}>
            Scan QR code
          </div>

          <div style={{ display: 'flex', gap: 28, marginBottom: 24, flexWrap: 'wrap' }}>
            {/* QR code */}
            <div style={{ background: qrBg, borderRadius: 12, padding: 16, display: 'inline-flex', flexShrink: 0 }}>
              {qrUrl ? (
                <Image src={qrUrl} alt="2FA QR Code" width={160} height={160} unoptimized />
              ) : (
                <div style={{ width: 160, height: 160, background: '#f0f0f0', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className="bx bx-qr" style={{ fontSize: 48, color: '#aaa' }} />
                </div>
              )}
            </div>
            {/* Steps */}
            <div style={{ flex: 1, minWidth: 200 }}>
              {[
                { n: '1', text: 'Open your authenticator app (Google Authenticator, Authy, 1Password, etc.)' },
                { n: '2', text: 'Tap "+" or "Add account" then scan the QR code' },
                { n: '3', text: 'Enter the 6-digit code shown in the app below' },
              ].map(s => (
                <div key={s.n} style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
                  <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(0,229,255,0.1)', border: '1px solid rgba(0,229,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#00e5ff', flexShrink: 0 }}>{s.n}</div>
                  <div style={{ fontSize: 13, color: textMuted, lineHeight: 1.5, paddingTop: 2 }}>{s.text}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Manual secret */}
          <div style={{ padding: '12px 14px', borderRadius: 9, background: stepBg, border: `1px solid ${stepBorder}`, marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: textDim }}>Can&apos;t scan? Enter this key manually:</span>
              <button
                onClick={() => setShowSecret(!showSecret)}
                style={{ background: 'none', border: 'none', color: '#00e5ff', fontSize: 12, cursor: 'pointer', padding: 0 }}
              >
                {showSecret ? 'Hide' : 'Show'}
              </button>
            </div>
            {showSecret ? (
              <div style={{ fontFamily: 'monospace', fontSize: 14, color: textPrimary, letterSpacing: '0.1em', background: secretBg, padding: '8px 12px', borderRadius: 6, wordBreak: 'break-all' }}>
                {secret}
              </div>
            ) : (
              <div style={{ fontFamily: 'monospace', fontSize: 14, color: textDim, letterSpacing: '0.1em' }}>{'•'.repeat(32)}</div>
            )}
          </div>

          <button
            onClick={() => setStep('confirm')}
            style={{ padding: '10px 22px', borderRadius: 9, border: 'none', background: 'linear-gradient(135deg, #00e5ff, #a900ff)', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
          >
            I&apos;ve scanned it — continue
          </button>
        </div>
      )}

      {/* Step: confirm code */}
      {step === 'confirm' && (
        <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 14, padding: '24px' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: textPrimary, marginBottom: 20, paddingBottom: 14, borderBottom: `1px solid ${cardDivider}` }}>
            Verify your code
          </div>
          <p style={{ fontSize: 13, color: textMuted, marginBottom: 20 }}>Enter the 6-digit code from your authenticator app to confirm setup.</p>

          {anyError && (
            <div style={{ marginBottom: 16, padding: '10px 14px', borderRadius: 8, fontSize: 13, background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>
              {anyError}
            </div>
          )}

          <form onSubmit={handleConfirm} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <input
              type="text" inputMode="numeric" maxLength={7} value={code}
              onChange={e => { setCode(e.target.value.replace(/\D/g, '').slice(0, 6)); clearError(); setCodeError('') }}
              placeholder="000000" style={inputSt}
              autoFocus
            />
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="button" onClick={() => setStep('setup')}
                style={{ flex: 1, padding: '10px', borderRadius: 9, border: `1px solid ${cardBorder}`, background: 'transparent', color: textMuted, fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>
                Back
              </button>
              <button type="submit" disabled={loading || code.length < 6}
                style={{ flex: 2, padding: '10px', borderRadius: 9, border: 'none',
                  background: (loading || code.length < 6) ? (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)') : 'linear-gradient(135deg, #00e5ff, #a900ff)',
                  color: (loading || code.length < 6) ? textDim : '#fff',
                  fontSize: 14, fontWeight: 600, cursor: (loading || code.length < 6) ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
                {loading ? 'Verifying...' : 'Enable 2FA'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Step: done */}
      {step === 'done' && (
        <div style={{ background: cardBg, border: '1px solid rgba(34,197,94,0.2)', borderRadius: 14, padding: '32px 24px', textAlign: 'center' }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <i className="bx bx-shield-quarter" style={{ fontSize: 26, color: '#22c55e' }} />
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, color: textPrimary, marginBottom: 8 }}>2FA is now enabled!</div>
          <div style={{ fontSize: 13, color: textMuted, marginBottom: 24, lineHeight: 1.6 }}>
            Your account is now protected. You&apos;ll need your authenticator app every time you sign in.
          </div>
          <button
            onClick={() => router.push('/settings')}
            style={{ padding: '10px 24px', borderRadius: 9, border: 'none', background: 'linear-gradient(135deg, #00e5ff, #a900ff)', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
          >
            Done
          </button>
        </div>
      )}

      {/* Disable 2FA flow */}
      {enabled && step === 'idle' && (
        <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 14, padding: '24px', marginTop: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: textPrimary, marginBottom: 16, paddingBottom: 14, borderBottom: `1px solid ${cardDivider}` }}>
            Disable 2FA
          </div>
          <p style={{ fontSize: 13, color: textMuted, marginBottom: 20 }}>
            Disabling 2FA will make your account less secure. You&apos;ll only need your password to sign in.
          </p>
          <button
            onClick={() => { setStep('disable'); setCode(''); clearError() }}
            style={{ padding: '8px 18px', borderRadius: 8, border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.08)', color: '#ef4444', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}
          >
            Disable 2FA
          </button>
        </div>
      )}

      {step === 'disable' && (
        <div style={{ background: cardBg, border: '1px solid rgba(239,68,68,0.2)', borderRadius: 14, padding: '24px' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#ef4444', marginBottom: 20, paddingBottom: 14, borderBottom: '1px solid rgba(239,68,68,0.15)' }}>
            Confirm disable 2FA
          </div>
          <p style={{ fontSize: 13, color: textMuted, marginBottom: 20 }}>Enter your current authenticator code to confirm.</p>

          {anyError && (
            <div style={{ marginBottom: 16, padding: '10px 14px', borderRadius: 8, fontSize: 13, background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>
              {anyError}
            </div>
          )}

          <form onSubmit={handleDisable} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <input
              type="text" inputMode="numeric" maxLength={6} value={code}
              onChange={e => { setCode(e.target.value.replace(/\D/g, '')); clearError(); setCodeError('') }}
              placeholder="000000" style={inputSt}
              autoFocus
            />
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="button" onClick={() => { setStep('idle'); setCode('') }}
                style={{ flex: 1, padding: '10px', borderRadius: 9, border: `1px solid ${cardBorder}`, background: 'transparent', color: textMuted, fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>
                Cancel
              </button>
              <button type="submit" disabled={loading || code.length < 6}
                style={{ flex: 2, padding: '10px', borderRadius: 9, border: 'none',
                  background: (loading || code.length < 6) ? (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)') : 'rgba(239,68,68,0.9)',
                  color: (loading || code.length < 6) ? textDim : '#fff',
                  fontSize: 14, fontWeight: 600, cursor: (loading || code.length < 6) ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
                {loading ? 'Disabling...' : 'Disable 2FA'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
