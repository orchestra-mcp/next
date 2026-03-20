'use client'
import { useEffect, useState } from 'react'
import { useSettingsStore } from '@/store/settings'
import ProfileCard from '@/components/profile/profile-card'

const saveBtnSt: React.CSSProperties = { padding: '10px 24px', borderRadius: 9, fontSize: 13, fontWeight: 600, background: 'linear-gradient(135deg, #00e5ff, #a900ff)', color: '#fff', border: 'none', cursor: 'pointer' }

export default function ApiKeysSettingsPage() {
  const { apiKeys, fetchApiKeys, createApiKey, revokeApiKey, loading } = useSettingsStore()
  const [newKeyValue, setNewKeyValue] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    fetchApiKeys()
  }, [fetchApiKeys])

  const handleCreate = async () => {
    const name = prompt('API key name:')
    if (!name) return

    setCreating(true)
    setMessage(null)
    try {
      const key = await createApiKey(name)
      if (key.key) {
        setNewKeyValue(key.key)
        setMessage({ type: 'success', text: 'API key created. Copy the key below -- it will not be shown again.' })
      }
    } catch (err) {
      setMessage({ type: 'error', text: (err as Error).message || 'Failed to create API key.' })
    } finally {
      setCreating(false)
    }
  }

  const handleRevoke = async (id: string) => {
    if (!confirm('Are you sure you want to revoke this API key? This action cannot be undone.')) return
    try {
      await revokeApiKey(id)
    } catch {
      // error handled in store
    }
  }

  return (
    <ProfileCard variant="default" style={{ padding: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-fg)', margin: 0 }}>API Keys</h3>
        <button style={{ ...saveBtnSt, opacity: creating ? 0.6 : 1 }} onClick={handleCreate} disabled={creating}>
          {creating ? 'Creating...' : 'Create API Key'}
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

      {newKeyValue && (
        <div style={{
          padding: '12px 14px',
          borderRadius: 9,
          border: '1px solid rgba(0,229,255,0.2)',
          background: 'rgba(0,229,255,0.05)',
          marginBottom: 16,
        }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-fg-muted)', marginBottom: 6 }}>Your new API key</div>
          <code style={{
            display: 'block',
            padding: '8px 12px',
            borderRadius: 6,
            background: 'var(--color-bg-alt)',
            border: '1px solid var(--color-border)',
            fontSize: 12,
            color: 'var(--color-fg)',
            wordBreak: 'break-all',
            userSelect: 'all',
          }}>
            {newKeyValue}
          </code>
          <button
            onClick={() => { navigator.clipboard.writeText(newKeyValue); setNewKeyValue(null) }}
            style={{
              marginTop: 8,
              padding: '6px 14px',
              borderRadius: 7,
              fontSize: 12,
              fontWeight: 600,
              background: 'var(--color-bg-alt)',
              color: 'var(--color-fg)',
              border: '1px solid var(--color-border)',
              cursor: 'pointer',
            }}
          >
            Copy & Dismiss
          </button>
        </div>
      )}

      {loading ? (
        <p style={{ color: 'var(--color-fg-muted)', fontSize: 13 }}>Loading API keys...</p>
      ) : apiKeys.length === 0 ? (
        <p style={{ color: 'var(--color-fg-muted)', fontSize: 13 }}>No API keys created yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {apiKeys.map((key) => (
            <div
              key={key.id}
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
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-fg)' }}>{key.name}</div>
                <div style={{ fontSize: 12, color: 'var(--color-fg-muted)', marginTop: 2, display: 'flex', gap: 12 }}>
                  <span>{key.prefix}...</span>
                  <span>Created {new Date(key.created_at).toLocaleDateString()}</span>
                  {key.last_used && <span>Last used {new Date(key.last_used).toLocaleDateString()}</span>}
                </div>
              </div>
              <button
                onClick={() => handleRevoke(key.id)}
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
                Revoke
              </button>
            </div>
          ))}
        </div>
      )}
    </ProfileCard>
  )
}
