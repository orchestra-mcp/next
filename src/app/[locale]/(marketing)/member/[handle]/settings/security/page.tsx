'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiFetch } from '@/lib/api'
import { useAuthStore } from '@/store/auth'
import ProfileCard from '@/components/profile/profile-card'

const inputSt: React.CSSProperties = { width: '100%', padding: '9px 12px', borderRadius: 9, border: '1px solid var(--color-border)', background: 'var(--color-bg-alt)', color: 'var(--color-fg)', fontSize: 13, outline: 'none' }
const labelSt: React.CSSProperties = { display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6, color: 'var(--color-fg-muted)' }
const saveBtnSt: React.CSSProperties = { padding: '10px 24px', borderRadius: 9, fontSize: 13, fontWeight: 600, background: 'linear-gradient(135deg, #00e5ff, #a900ff)', color: '#fff', border: 'none', cursor: 'pointer' }

export default function SecuritySettingsPage() {
  const router = useRouter()
  const { user, setup2FA, confirm2FA, disable2FA, logout } = useAuthStore()
  const [step, setStep] = useState<'idle' | 'setup' | 'verify' | 'disable'>('idle')
  const [qrUrl, setQrUrl] = useState('')
  const [secret, setSecret] = useState('')
  const [code, setCode] = useState('')
  const [disableCode, setDisableCode] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const is2FAEnabled = user?.two_factor_enabled ?? false

  const handleSetup = async () => {
    setSaving(true)
    setMessage(null)
    try {
      const res = await setup2FA()
      setQrUrl(res.qr_url)
      setSecret(res.secret)
      setStep('verify')
    } catch (err) {
      setMessage({ type: 'error', text: (err as Error).message || 'Failed to setup 2FA.' })
    } finally {
      setSaving(false)
    }
  }

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)
    try {
      await confirm2FA(code)
      setMessage({ type: 'success', text: 'Two-factor authentication enabled successfully.' })
      setStep('idle')
      setCode('')
      setQrUrl('')
      setSecret('')
    } catch (err) {
      setMessage({ type: 'error', text: (err as Error).message || 'Invalid verification code.' })
    } finally {
      setSaving(false)
    }
  }

  const handleDisable = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)
    try {
      await disable2FA(disableCode)
      setMessage({ type: 'success', text: 'Two-factor authentication disabled.' })
      setStep('idle')
      setDisableCode('')
    } catch (err) {
      setMessage({ type: 'error', text: (err as Error).message || 'Invalid code.' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <ProfileCard variant="default" style={{ padding: 24 }}>
      <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-fg)', marginBottom: 20 }}>Two-Factor Authentication</h3>

      {message && (
        <div style={{
          padding: '10px 14px',
          borderRadius: 9,
          fontSize: 13,
          marginBottom: 16,
          background: message.type === 'success' ? 'rgba(0,229,255,0.1)' : 'rgba(239,68,68,0.1)',
          color: message.type === 'success' ? '#00e5ff' : '#ef4444',
          border: `1px solid ${message.type === 'success' ? 'rgba(0,229,255,0.2)' : 'rgba(239,68,68,0.2)'}`,
        }}>
          {message.text}
        </div>
      )}

      <div style={{
        padding: '14px 16px',
        borderRadius: 9,
        border: '1px solid var(--color-border)',
        background: 'var(--color-bg-alt)',
        marginBottom: 20,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-fg)' }}>Status</div>
          <div style={{ fontSize: 13, color: 'var(--color-fg-muted)', marginTop: 2 }}>
            {is2FAEnabled ? 'Two-factor authentication is enabled.' : 'Two-factor authentication is not enabled.'}
          </div>
        </div>
        <div style={{
          padding: '4px 10px',
          borderRadius: 6,
          fontSize: 12,
          fontWeight: 600,
          background: is2FAEnabled ? 'rgba(0,229,255,0.1)' : 'rgba(128,128,128,0.1)',
          color: is2FAEnabled ? '#00e5ff' : 'var(--color-fg-muted)',
        }}>
          {is2FAEnabled ? 'Enabled' : 'Disabled'}
        </div>
      </div>

      {step === 'idle' && !is2FAEnabled && (
        <button style={{ ...saveBtnSt, opacity: saving ? 0.6 : 1 }} onClick={handleSetup} disabled={saving}>
          {saving ? 'Setting up...' : 'Enable 2FA'}
        </button>
      )}

      {step === 'idle' && is2FAEnabled && (
        <button
          style={{ ...saveBtnSt, background: 'rgba(239,68,68,0.15)', color: '#ef4444' }}
          onClick={() => setStep('disable')}
        >
          Disable 2FA
        </button>
      )}

      {step === 'verify' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <p style={{ fontSize: 13, color: 'var(--color-fg-muted)' }}>
            Scan the QR code below with your authenticator app, then enter the 6-digit code to verify.
          </p>

          {qrUrl && (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 16, background: '#fff', borderRadius: 9, width: 'fit-content' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrUrl} alt="2FA QR Code" style={{ width: 200, height: 200 }} />
            </div>
          )}

          {secret && (
            <div>
              <label style={labelSt}>Manual Entry Key</label>
              <code style={{
                display: 'block',
                padding: '8px 12px',
                borderRadius: 6,
                background: 'var(--color-bg-alt)',
                border: '1px solid var(--color-border)',
                fontSize: 12,
                color: 'var(--color-fg)',
                wordBreak: 'break-all',
              }}>
                {secret}
              </code>
            </div>
          )}

          <form onSubmit={handleConfirm} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={labelSt}>Verification Code</label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                style={{ ...inputSt, maxWidth: 200 }}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                required
                autoFocus
              />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="submit" style={{ ...saveBtnSt, opacity: saving ? 0.6 : 1 }} disabled={saving}>
                {saving ? 'Verifying...' : 'Verify & Enable'}
              </button>
              <button
                type="button"
                style={{ ...saveBtnSt, background: 'var(--color-bg-alt)', color: 'var(--color-fg-muted)', border: '1px solid var(--color-border)' }}
                onClick={() => { setStep('idle'); setCode(''); setQrUrl(''); setSecret('') }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {step === 'disable' && (
        <form onSubmit={handleDisable} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <p style={{ fontSize: 13, color: 'var(--color-fg-muted)' }}>
            Enter a code from your authenticator app to disable two-factor authentication.
          </p>
          <div>
            <label style={labelSt}>Verification Code</label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              style={{ ...inputSt, maxWidth: 200 }}
              value={disableCode}
              onChange={(e) => setDisableCode(e.target.value.replace(/\D/g, ''))}
              placeholder="000000"
              required
              autoFocus
            />
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button type="submit" style={{ ...saveBtnSt, background: 'rgba(239,68,68,0.15)', color: '#ef4444', opacity: saving ? 0.6 : 1 }} disabled={saving}>
              {saving ? 'Disabling...' : 'Disable 2FA'}
            </button>
            <button
              type="button"
              style={{ ...saveBtnSt, background: 'var(--color-bg-alt)', color: 'var(--color-fg-muted)', border: '1px solid var(--color-border)' }}
              onClick={() => { setStep('idle'); setDisableCode('') }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
      <DeleteAccountSection onDeleted={() => { logout(); router.push('/login') }} />
    </ProfileCard>
  )
}

// ── Delete Account ────────────────────────────────────────────────────────

function DeleteAccountSection({ onDeleted }: { onDeleted: () => void }) {
  const [showConfirm, setShowConfirm] = useState(false)
  const [password, setPassword] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password) { setError('Password is required'); return }
    setDeleting(true)
    setError('')
    try {
      await apiFetch('/api/auth/account', {
        method: 'DELETE',
        body: JSON.stringify({ password }),
      })
      onDeleted()
    } catch (err) {
      setError((err as Error).message || 'Failed to delete account')
      setDeleting(false)
    }
  }

  const dangerBtnSt: React.CSSProperties = { padding: '10px 24px', borderRadius: 9, fontSize: 13, fontWeight: 600, background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)', cursor: 'pointer' }

  return (
    <>
      <div style={{ marginTop: 32, paddingTop: 20, borderTop: '1px solid var(--color-border)' }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#ef4444', marginBottom: 8 }}>Danger Zone</h3>
        <p style={{ fontSize: 13, color: 'var(--color-fg-muted)', marginBottom: 16, lineHeight: 1.6 }}>
          Permanently delete your account and all associated data. After requesting deletion,
          you have 7 days to log in and cancel.
        </p>

        {!showConfirm ? (
          <button style={dangerBtnSt} onClick={() => setShowConfirm(true)}>
            Delete Account
          </button>
        ) : (
          <form onSubmit={handleDelete} style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 360 }}>
            {error && (
              <div style={{ padding: '8px 12px', borderRadius: 8, fontSize: 13, background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>
                {error}
              </div>
            )}
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6, color: 'var(--color-fg-muted)' }}>
                Confirm your password
              </label>
              <input
                type="password"
                style={{ width: '100%', padding: '9px 12px', borderRadius: 9, border: '1px solid var(--color-border)', background: 'var(--color-bg-alt)', color: 'var(--color-fg)', fontSize: 13, outline: 'none' }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                autoFocus
              />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="submit"
                style={{ ...dangerBtnSt, background: '#ef4444', color: '#fff', opacity: deleting ? 0.6 : 1 }}
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
              <button
                type="button"
                style={{ ...dangerBtnSt, background: 'var(--color-bg-alt)', color: 'var(--color-fg-muted)', border: '1px solid var(--color-border)' }}
                onClick={() => { setShowConfirm(false); setPassword(''); setError('') }}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </>
  )
}
