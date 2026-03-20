'use client'
import { useState, useEffect } from 'react'
import { Switch } from '@orchestra-mcp/ui'
import { apiFetch } from '@/lib/api'
import { useAuthStore } from '@/store/auth'
import ProfileCard from '@/components/profile/profile-card'

export default function NotificationsSettingsPage() {
  const { user, fetchMe } = useAuthStore()
  const [pushEnabled, setPushEnabled] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const val = user?.settings?.push_enabled
    setPushEnabled(val === true)
  }, [user?.settings?.push_enabled])

  const handleToggle = async (val: boolean) => {
    setPushEnabled(val)
    setSaving(true)
    try {
      await apiFetch('/api/settings/profile', {
        method: 'PATCH',
        body: JSON.stringify({ push_enabled: val }),
      })
      await fetchMe()
    } catch {
      setPushEnabled(!val)
    } finally {
      setSaving(false)
    }
  }

  return (
    <ProfileCard variant="default" style={{ padding: 24 }}>
      <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-fg)', marginBottom: 20 }}>Notifications</h3>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 16px',
        borderRadius: 9,
        border: '1px solid var(--color-border)',
        background: 'var(--color-bg-alt)',
      }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-fg)' }}>Push Notifications</div>
          <div style={{ fontSize: 13, color: 'var(--color-fg-muted)', marginTop: 2 }}>
            Receive push notifications for important updates.
          </div>
        </div>
        <Switch
          checked={pushEnabled}
          onChange={handleToggle}
          disabled={saving}
        />
      </div>
    </ProfileCard>
  )
}
