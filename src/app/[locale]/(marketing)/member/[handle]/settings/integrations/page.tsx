'use client'
import { useEffect } from 'react'
import { useSettingsStore } from '@/store/settings'
import ProfileCard from '@/components/profile/profile-card'

const PROVIDER_ICONS: Record<string, string> = {
  github: 'https://github.githubassets.com/favicons/favicon-dark.svg',
  google: 'https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg',
  discord: 'https://assets-global.website-files.com/6257adef93867e50d84d30e2/636e0a69f118df70ad7828d4_icon_clyde_blurple_RGB.svg',
  slack: 'https://a.slack-edge.com/80588/marketing/img/meta/favicon-32.png',
}

export default function IntegrationsSettingsPage() {
  const { connectedAccounts, fetchConnectedAccounts, unlinkAccount, loading } = useSettingsStore()

  useEffect(() => {
    fetchConnectedAccounts()
  }, [fetchConnectedAccounts])

  const handleUnlink = async (provider: string) => {
    if (!confirm(`Disconnect ${provider}? You may lose access to features linked to this account.`)) return
    try {
      await unlinkAccount(provider)
    } catch {
      // error handled in store
    }
  }

  return (
    <ProfileCard variant="default" style={{ padding: 24 }}>
      <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-fg)', marginBottom: 20 }}>Connected Accounts</h3>

      {loading ? (
        <p style={{ color: 'var(--color-fg-muted)', fontSize: 13 }}>Loading connected accounts...</p>
      ) : connectedAccounts.length === 0 ? (
        <p style={{ color: 'var(--color-fg-muted)', fontSize: 13 }}>No connected accounts.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {connectedAccounts.map((account) => (
            <div
              key={account.provider}
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
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={account.avatar || PROVIDER_ICONS[account.provider] || ''}
                  alt={account.provider}
                  style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--color-bg)' }}
                />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-fg)', textTransform: 'capitalize' }}>{account.provider}</div>
                  <div style={{ fontSize: 12, color: 'var(--color-fg-muted)', marginTop: 2 }}>
                    {account.name || account.email}
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleUnlink(account.provider)}
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
                Disconnect
              </button>
            </div>
          ))}
        </div>
      )}
    </ProfileCard>
  )
}
