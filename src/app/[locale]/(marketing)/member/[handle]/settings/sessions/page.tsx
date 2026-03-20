'use client'
import { useEffect } from 'react'
import { useSettingsStore } from '@/store/settings'
import ProfileCard from '@/components/profile/profile-card'

const saveBtnSt: React.CSSProperties = { padding: '10px 24px', borderRadius: 9, fontSize: 13, fontWeight: 600, background: 'linear-gradient(135deg, #00e5ff, #a900ff)', color: '#fff', border: 'none', cursor: 'pointer' }

export default function SessionsSettingsPage() {
  const { sessions, fetchSessions, revokeSession, loading } = useSettingsStore()

  useEffect(() => {
    fetchSessions()
  }, [fetchSessions])

  const handleRevoke = async (id: string) => {
    if (!confirm('Revoke this session? The device will be logged out.')) return
    try {
      await revokeSession(id)
    } catch {
      // error handled in store
    }
  }

  return (
    <ProfileCard variant="default" style={{ padding: 24 }}>
      <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-fg)', marginBottom: 20 }}>Active Sessions</h3>

      {loading ? (
        <p style={{ color: 'var(--color-fg-muted)', fontSize: 13 }}>Loading sessions...</p>
      ) : sessions.length === 0 ? (
        <p style={{ color: 'var(--color-fg-muted)', fontSize: 13 }}>No active sessions found.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {sessions.map((session) => (
            <div
              key={session.id}
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
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-fg)' }}>{session.device}</span>
                  {session.is_current && (
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: 5,
                      fontSize: 11,
                      fontWeight: 600,
                      background: 'rgba(0,229,255,0.1)',
                      color: '#00e5ff',
                    }}>
                      Current
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 12, color: 'var(--color-fg-muted)', marginTop: 4, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <span>IP: {session.ip}</span>
                  {session.location && <span>{session.location}</span>}
                  <span>Last active: {new Date(session.last_seen).toLocaleString()}</span>
                </div>
              </div>
              {!session.is_current && (
                <button
                  onClick={() => handleRevoke(session.id)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 7,
                    fontSize: 12,
                    fontWeight: 600,
                    background: 'rgba(239,68,68,0.1)',
                    color: '#ef4444',
                    border: '1px solid rgba(239,68,68,0.2)',
                    cursor: 'pointer',
                    flexShrink: 0,
                  }}
                >
                  Revoke
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </ProfileCard>
  )
}
