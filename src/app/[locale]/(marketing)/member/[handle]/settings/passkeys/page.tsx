'use client'
import { useState, useEffect, useCallback } from 'react'
import { apiFetch } from '@/lib/api'
import { useAuthStore } from '@/store/auth'
import ProfileCard from '@/components/profile/profile-card'

const saveBtnSt: React.CSSProperties = { padding: '10px 24px', borderRadius: 9, fontSize: 13, fontWeight: 600, background: 'linear-gradient(135deg, #00e5ff, #a900ff)', color: '#fff', border: 'none', cursor: 'pointer' }

interface PasskeyItem {
  id: number
  name: string
  created_at: string
}

export default function PasskeysSettingsPage() {
  const { beginPasskeyRegistration, finishPasskeyRegistration } = useAuthStore()
  const [passkeys, setPasskeys] = useState<PasskeyItem[]>([])
  const [loading, setLoading] = useState(true)
  const [registering, setRegistering] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const fetchPasskeys = useCallback(async () => {
    try {
      const res = await apiFetch<PasskeyItem[]>('/api/settings/passkeys')
      setPasskeys(Array.isArray(res) ? res : [])
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPasskeys()
  }, [fetchPasskeys])

  const handleRegister = async () => {
    setRegistering(true)
    setMessage(null)
    try {
      const opts = await beginPasskeyRegistration()
      const credential = await navigator.credentials.create({ publicKey: opts })
      if (!credential) {
        setMessage({ type: 'error', text: 'Passkey registration was cancelled.' })
        setRegistering(false)
        return
      }
      const name = prompt('Give this passkey a name:') || 'My Passkey'
      await finishPasskeyRegistration(credential, name)
      setMessage({ type: 'success', text: 'Passkey registered successfully.' })
      await fetchPasskeys()
    } catch (err) {
      setMessage({ type: 'error', text: (err as Error).message || 'Failed to register passkey.' })
    } finally {
      setRegistering(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this passkey?')) return
    try {
      await apiFetch(`/api/settings/passkeys/${id}`, { method: 'DELETE' })
      setPasskeys((prev) => prev.filter((p) => p.id !== id))
    } catch (err) {
      setMessage({ type: 'error', text: (err as Error).message || 'Failed to delete passkey.' })
    }
  }

  return (
    <ProfileCard variant="default" style={{ padding: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-fg)', margin: 0 }}>Passkeys</h3>
        <button style={{ ...saveBtnSt, opacity: registering ? 0.6 : 1 }} onClick={handleRegister} disabled={registering}>
          {registering ? 'Registering...' : 'Register Passkey'}
        </button>
      </div>

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

      {loading ? (
        <p style={{ color: 'var(--color-fg-muted)', fontSize: 13 }}>Loading passkeys...</p>
      ) : passkeys.length === 0 ? (
        <p style={{ color: 'var(--color-fg-muted)', fontSize: 13 }}>No passkeys registered. Register one to enable passwordless sign-in.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {passkeys.map((pk) => (
            <div
              key={pk.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                borderRadius: 9,
                border: '1px solid var(--color-border)',
                background: 'var(--color-bg-alt)',
              }}
            >
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-fg)' }}>{pk.name}</div>
                <div style={{ fontSize: 12, color: 'var(--color-fg-muted)', marginTop: 2 }}>
                  Added {new Date(pk.created_at).toLocaleDateString()}
                </div>
              </div>
              <button
                onClick={() => handleDelete(pk.id)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 7,
                  fontSize: 12,
                  fontWeight: 600,
                  background: 'rgba(239,68,68,0.1)',
                  color: '#ef4444',
                  border: '1px solid rgba(239,68,68,0.2)',
                  cursor: 'pointer',
                }}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </ProfileCard>
  )
}
