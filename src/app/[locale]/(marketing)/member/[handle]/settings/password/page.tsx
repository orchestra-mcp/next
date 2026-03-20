'use client'
import { useState } from 'react'
import { apiFetch } from '@/lib/api'
import ProfileCard from '@/components/profile/profile-card'

const inputSt: React.CSSProperties = { width: '100%', padding: '9px 12px', borderRadius: 9, border: '1px solid var(--color-border)', background: 'var(--color-bg-alt)', color: 'var(--color-fg)', fontSize: 13, outline: 'none' }
const labelSt: React.CSSProperties = { display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6, color: 'var(--color-fg-muted)' }
const saveBtnSt: React.CSSProperties = { padding: '10px 24px', borderRadius: 9, fontSize: 13, fontWeight: 600, background: 'linear-gradient(135deg, #00e5ff, #a900ff)', color: '#fff', border: 'none', cursor: 'pointer' }

export default function PasswordSettingsPage() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match.' })
      return
    }

    if (newPassword.length < 8) {
      setMessage({ type: 'error', text: 'Password must be at least 8 characters.' })
      return
    }

    setSaving(true)
    try {
      await apiFetch('/api/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
      })
      setMessage({ type: 'success', text: 'Password updated successfully.' })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      setMessage({ type: 'error', text: (err as Error).message || 'Failed to change password.' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <ProfileCard variant="default" style={{ padding: 24 }}>
      <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-fg)', marginBottom: 20 }}>Change Password</h3>

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

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label style={labelSt}>Current Password</label>
          <input
            type="password"
            style={inputSt}
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </div>

        <div>
          <label style={labelSt}>New Password</label>
          <input
            type="password"
            style={inputSt}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            autoComplete="new-password"
            minLength={8}
          />
        </div>

        <div>
          <label style={labelSt}>Confirm New Password</label>
          <input
            type="password"
            style={inputSt}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            autoComplete="new-password"
          />
        </div>

        <div style={{ marginTop: 8 }}>
          <button type="submit" style={{ ...saveBtnSt, opacity: saving ? 0.6 : 1 }} disabled={saving}>
            {saving ? 'Saving...' : 'Update Password'}
          </button>
        </div>
      </form>
    </ProfileCard>
  )
}
