'use client'
import { useState, useEffect } from 'react'
import { Switch } from '@orchestra-mcp/ui'
import { apiFetch } from '@/lib/api'
import { useAuthStore } from '@/store/auth'
import { useCommunityStore } from '@/store/community'
import ProfileCard from '@/components/profile/profile-card'

export default function PrivacySettingsPage() {
  const { user, fetchMe } = useAuthStore()
  const { profile, fetchMemberProfile } = useCommunityStore()
  const [showBadges, setShowBadges] = useState(true)
  const [showWallet, setShowWallet] = useState(true)
  const [showComments, setShowComments] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!user) return
    const s = (user.settings ?? {}) as Record<string, unknown>
    setShowBadges(s.show_badges !== undefined ? !!(s.show_badges) : true)
    setShowWallet(s.show_wallet !== undefined ? !!(s.show_wallet) : true)
    setShowComments(s.show_comments_on_profile !== undefined ? !!(s.show_comments_on_profile) : true)
  }, [user])

  const save = async () => {
    setSaving(true)
    setSaved(false)
    try {
      await apiFetch('/api/settings/profile', {
        method: 'PATCH',
        body: JSON.stringify({
          show_badges: showBadges,
          show_wallet: showWallet,
          show_comments_on_profile: showComments,
        }),
      })
      await fetchMe()
      const handle = profile?.handle || user?.username
      if (handle) fetchMemberProfile(handle)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (e) {
      alert('Save failed: ' + (e as Error).message)
    }
    setSaving(false)
  }

  return (
    <ProfileCard variant="default" style={{ padding: 24 }}>
      <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-fg)', marginBottom: 16 }}>Privacy</h3>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--color-border)' }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-fg)' }}>Show badges on profile</div>
          <div style={{ fontSize: 11, color: 'var(--color-fg-dim)' }}>When off, badges are hidden from public view</div>
        </div>
        <Switch checked={showBadges} onChange={setShowBadges} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--color-border)' }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-fg)' }}>Show points on profile</div>
          <div style={{ fontSize: 11, color: 'var(--color-fg-dim)' }}>When off, wallet balance is hidden from public view</div>
        </div>
        <Switch checked={showWallet} onChange={setShowWallet} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0' }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-fg)' }}>Show comments on profile</div>
          <div style={{ fontSize: 11, color: 'var(--color-fg-dim)' }}>Allow comments on your profile posts</div>
        </div>
        <Switch checked={showComments} onChange={setShowComments} />
      </div>

      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 20 }}>
        <button
          onClick={save}
          disabled={saving}
          style={{
            padding: '10px 24px', borderRadius: 9, fontSize: 13, fontWeight: 600,
            background: 'linear-gradient(135deg, #00e5ff, #a900ff)', color: '#fff',
            border: 'none', cursor: 'pointer', opacity: saving ? 0.6 : 1,
          }}
        >
          {saving ? 'Saving...' : 'Save Privacy'}
        </button>
        {saved && <span style={{ fontSize: 12, color: '#22c55e' }}>Saved!</span>}
      </div>
    </ProfileCard>
  )
}
