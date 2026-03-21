'use client'
import { useState, useEffect, useRef } from 'react'
import { useAuthStore } from '@/store/auth'
import { useCommunityStore } from '@/store/community'
import { apiFetch } from '@/lib/api'
import { SearchableSelect } from '@/components/ui/searchable-select'
import { Switch } from '@orchestra-mcp/ui'
import ProfileCard from '@/components/profile/profile-card'

const inputSt: React.CSSProperties = { width: '100%', padding: '9px 12px', borderRadius: 9, border: '1px solid var(--color-border)', background: 'var(--color-bg-alt)', color: 'var(--color-fg)', fontSize: 13, outline: 'none' }
const labelSt: React.CSSProperties = { display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6, color: 'var(--color-fg-muted)' }
const saveBtnSt: React.CSSProperties = { padding: '10px 24px', borderRadius: 9, fontSize: 13, fontWeight: 600, background: 'linear-gradient(135deg, #00e5ff, #a900ff)', color: '#fff', border: 'none', cursor: 'pointer' }
const sectionSt: React.CSSProperties = { marginBottom: 24, paddingBottom: 20, borderBottom: '1px solid var(--color-border)' }

const TIMEZONES = ['UTC', 'America/New_York', 'America/Chicago', 'America/Los_Angeles', 'America/Toronto', 'America/Sao_Paulo', 'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Europe/Moscow', 'Europe/Istanbul', 'Asia/Tokyo', 'Asia/Shanghai', 'Asia/Dubai', 'Asia/Riyadh', 'Asia/Kolkata', 'Africa/Cairo', 'Australia/Sydney', 'Pacific/Auckland']

const DEFAULT_PLATFORMS = [
  { value: 'github', label: 'GitHub', placeholder: 'https://github.com/...' },
  { value: 'twitter', label: 'Twitter / X', placeholder: 'https://twitter.com/...' },
  { value: 'linkedin', label: 'LinkedIn', placeholder: 'https://linkedin.com/in/...' },
  { value: 'website', label: 'Website', placeholder: 'https://...' },
  { value: 'youtube', label: 'YouTube', placeholder: 'https://youtube.com/...' },
  { value: 'discord', label: 'Discord', placeholder: 'Discord invite URL' },
  { value: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/...' },
]

export default function ProfileSettingsPage() {
  const { user, fetchMe } = useAuthStore()
  const { profile, fetchMemberProfile } = useCommunityStore()

  // Basic info
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [gender, setGender] = useState('')
  const [position, setPosition] = useState('')
  const [timezone, setTimezone] = useState('UTC')

  // Public profile
  const [publicEnabled, setPublicEnabled] = useState(false)
  const [profileHandle, setProfileHandle] = useState('')
  const [bio, setBio] = useState('')

  // Social links
  const [socialLinks, setSocialLinks] = useState<{ platform: string; url: string }[]>([])

  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!user) return
    const s = (user.settings ?? {}) as Record<string, unknown>

    // Basic info from user object
    setName(user.name ?? '')
    setEmail(user.email ?? '')
    setPhone((s.phone as string) ?? '')
    setGender((s.gender as string) ?? '')
    setPosition((s.position as string) ?? '')
    setTimezone((s.timezone as string) ?? 'UTC')

    // Public profile: user.settings is source of truth (persisted in DB)
    setPublicEnabled(!!(s.public_profile_enabled))
    setProfileHandle((s.handle as string) ?? profile?.handle ?? user.username ?? '')
    setBio((s.bio as string) ?? profile?.bio ?? user.bio ?? '')
    // Social links: user.settings is source of truth
    const settingsLinks = s.social_links
    const profileLinks = profile?.social_links
    if (Array.isArray(settingsLinks) && settingsLinks.length > 0) {
      setSocialLinks(settingsLinks as { platform: string; url: string }[])
    } else if (Array.isArray(profileLinks) && profileLinks.length > 0) {
      setSocialLinks(profileLinks)
    }
  }, [user, profile])

  const addSocialLink = () => {
    setSocialLinks([...socialLinks, { platform: 'website', url: '' }])
  }

  const removeSocialLink = (index: number) => {
    setSocialLinks(socialLinks.filter((_, i) => i !== index))
  }

  const updateSocialLink = (index: number, field: 'platform' | 'url', value: string) => {
    setSocialLinks(socialLinks.map((l, i) => i === index ? { ...l, [field]: value } : l))
  }

  const save = async () => {
    try {
      await apiFetch('/api/settings/profile', {
        method: 'PATCH',
        body: JSON.stringify({
          name, email, phone, gender, position, timezone,
          public_profile_enabled: publicEnabled,
          ...(profileHandle.trim() ? { handle: profileHandle.trim() } : {}),
          bio,
          social_links: socialLinks.filter(l => l.url.trim()),
        }),
      })
      await fetchMe()
      // Refresh community profile so sidebar reflects changes
      const h = profileHandle || profile?.handle || user?.username
      if (h) await fetchMemberProfile(h)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (e) {
      alert('Save failed: ' + (e as Error).message)
    }
  }

  return (
    <ProfileCard variant="default" style={{ padding: 24 }}>

      {/* ── Public Profile ── */}
      <div style={sectionSt}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-fg)', marginBottom: 16 }}>Public Profile</h3>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-fg)' }}>Enable public profile</div>
            <div style={{ fontSize: 11, color: 'var(--color-fg-dim)' }}>Make your profile visible to everyone</div>
          </div>
          <Switch checked={publicEnabled} onChange={setPublicEnabled} />
        </div>
        <div className="settings-profile-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div>
            <label style={labelSt}>Handle</label>
            <input style={inputSt} value={profileHandle} onChange={e => setProfileHandle(e.target.value)} placeholder="your-handle" />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <label style={{ ...labelSt, marginBottom: 0 }}>Bio</label>
              <span style={{ fontSize: 10, color: 'var(--color-fg-dim)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <i className="bx bxl-markdown" style={{ fontSize: 12 }} /> Markdown supported
              </span>
            </div>
            <textarea style={{ ...inputSt, height: 100, resize: 'vertical' }} value={bio} onChange={e => setBio(e.target.value)} placeholder="Tell others about yourself... (Markdown supported)" />
          </div>
        </div>
      </div>

      {/* ── Basic Info ── */}
      <div style={sectionSt}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-fg)', marginBottom: 16 }}>Basic Information</h3>
        <div className="settings-profile-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div><label style={labelSt}>Name</label><input style={inputSt} value={name} onChange={e => setName(e.target.value)} /></div>
          <div><label style={labelSt}>Email</label><input style={inputSt} value={email} onChange={e => setEmail(e.target.value)} /></div>
          <div><label style={labelSt}>Phone</label><input style={inputSt} value={phone} onChange={e => setPhone(e.target.value)} placeholder="+1 234 567 890" /></div>
          <div><label style={labelSt}>Position</label><input style={inputSt} value={position} onChange={e => setPosition(e.target.value)} placeholder="Software Engineer" /></div>
          <div>
            <label style={labelSt}>Gender</label>
            <select style={inputSt} value={gender} onChange={e => setGender(e.target.value)}>
              <option value="">Prefer not to say</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Non-binary">Non-binary</option>
            </select>
          </div>
          <div>
            <label style={labelSt}>Timezone</label>
            <SearchableSelect options={TIMEZONES.map(tz => ({ value: tz, label: tz }))} value={timezone} onChange={setTimezone} placeholder="Select timezone" />
          </div>
        </div>
      </div>

      {/* ── Social Links ── */}
      <div style={sectionSt}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-fg)', margin: 0 }}>Social Links</h3>
          <button onClick={addSocialLink} style={{
            padding: '5px 12px', borderRadius: 7, fontSize: 12, fontWeight: 600,
            background: 'var(--color-bg-active)', border: '1px solid var(--color-border)',
            color: 'var(--color-fg-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
          }}>
            <i className="bx bx-plus" style={{ fontSize: 14 }} /> Add
          </button>
        </div>
        {socialLinks.length === 0 ? (
          <p style={{ fontSize: 12, color: 'var(--color-fg-dim)' }}>No social links added yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {socialLinks.map((link, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <select
                  style={{ ...inputSt, width: 130, flexShrink: 0 }}
                  value={link.platform}
                  onChange={e => updateSocialLink(i, 'platform', e.target.value)}
                >
                  {DEFAULT_PLATFORMS.map(p => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
                <input
                  style={{ ...inputSt, flex: 1 }}
                  value={link.url}
                  onChange={e => updateSocialLink(i, 'url', e.target.value)}
                  placeholder={DEFAULT_PLATFORMS.find(p => p.value === link.platform)?.placeholder ?? 'https://...'}
                />
                <button onClick={() => removeSocialLink(i)} style={{
                  width: 32, height: 32, borderRadius: 7, border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'rgba(239,68,68,0.08)', color: '#ef4444', fontSize: 16, flexShrink: 0,
                }}>
                  <i className="bx bx-trash" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Save ── */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <button style={saveBtnSt} onClick={save}>Save changes</button>
        {saved && <span style={{ fontSize: 12, color: '#22c55e' }}>Saved!</span>}
      </div>

      <style>{`
        @media (max-width: 640px) {
          .settings-profile-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </ProfileCard>
  )
}
