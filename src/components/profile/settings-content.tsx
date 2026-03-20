'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/auth'
import { useCommunityStore } from '@/store/community'
import { apiFetch } from '@/lib/api'
import { useProfileTheme } from './use-profile-theme'
import ProfileEditForm from './profile-edit-form'
import { SearchableSelect } from '@/components/ui/searchable-select'

// ── Social Links Panel ──

const PLATFORM_OPTIONS = [
  { value: 'github', label: 'GitHub', icon: 'bxl-github', placeholder: 'https://github.com/...' },
  { value: 'twitter', label: 'Twitter / X', icon: 'bxl-twitter', placeholder: 'https://twitter.com/...' },
  { value: 'linkedin', label: 'LinkedIn', icon: 'bxl-linkedin', placeholder: 'https://linkedin.com/in/...' },
  { value: 'youtube', label: 'YouTube', icon: 'bxl-youtube', placeholder: 'https://youtube.com/...' },
  { value: 'discord', label: 'Discord', icon: 'bxl-discord-alt', placeholder: 'https://discord.gg/...' },
  { value: 'website', label: 'Website', icon: 'bx-globe', placeholder: 'https://...' },
  { value: 'mastodon', label: 'Mastodon', icon: 'bxl-mastodon', placeholder: 'https://...' },
  { value: 'instagram', label: 'Instagram', icon: 'bxl-instagram', placeholder: 'https://instagram.com/...' },
  { value: 'bluesky', label: 'Bluesky', icon: 'bx-hash', placeholder: 'https://bsky.app/...' },
  { value: 'other', label: 'Other', icon: 'bx-link-external', placeholder: 'https://...' },
]

function SocialLinksPanel() {
  const { colors } = useProfileTheme()
  const { user } = useAuthStore()
  const [links, setLinks] = useState<{ platform: string; url: string }[]>([])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const s = user?.settings as Record<string, unknown> | undefined
    if (s?.social_links && Array.isArray(s.social_links)) {
      setLinks(s.social_links as { platform: string; url: string }[])
    }
  }, [user])

  function addLink() {
    if (links.length >= 10) return
    setLinks([...links, { platform: 'website', url: '' }])
  }

  function removeLink(idx: number) {
    setLinks(links.filter((_, i) => i !== idx))
  }

  function updateLink(idx: number, field: 'platform' | 'url', value: string) {
    setLinks(links.map((l, i) => i === idx ? { ...l, [field]: value } : l))
  }

  async function handleSave() {
    setSaving(true)
    setSaved(false)
    try {
      await apiFetch('/api/settings/profile', {
        method: 'PATCH',
        body: JSON.stringify({ social_links: links.filter(l => l.url.trim()) }),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch {}
    setSaving(false)
  }

  return (
    <div className="space-y-4">
      {links.map((link, idx) => (
        <div key={idx} className="flex gap-2 items-start">
          <SearchableSelect
            value={link.platform}
            onChange={val => updateLink(idx, 'platform', val)}
            options={PLATFORM_OPTIONS.map(p => ({ value: p.value, label: p.label }))}
            className="px-3 py-2 rounded-lg border text-sm outline-none"
            style={{ background: colors.inputBg, borderColor: colors.inputBorder, color: colors.textPrimary, width: 140 }}
          />
          <input
            type="url"
            value={link.url}
            onChange={e => updateLink(idx, 'url', e.target.value)}
            placeholder={PLATFORM_OPTIONS.find(p => p.value === link.platform)?.placeholder || 'https://...'}
            className="flex-1 px-3 py-2 rounded-lg border text-sm outline-none"
            style={{ background: colors.inputBg, borderColor: colors.inputBorder, color: colors.textPrimary }}
          />
          <button
            onClick={() => removeLink(idx)}
            className="w-9 h-9 rounded-lg border-none cursor-pointer flex items-center justify-center text-base"
            style={{ background: 'rgba(239,68,68,0.1)', color: colors.danger }}
          >
            <i className="bx bx-trash" />
          </button>
        </div>
      ))}
      <div className="flex items-center gap-3">
        {links.length < 10 && (
          <button
            onClick={addLink}
            className="px-4 py-2 rounded-lg border text-[13px] font-medium cursor-pointer"
            style={{ borderColor: colors.cardBorder, background: 'transparent', color: colors.textMuted }}
          >
            <i className="bx bx-plus mr-1" /> Add Link
          </button>
        )}
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-2 rounded-lg border-none text-[13px] font-semibold text-white cursor-pointer disabled:opacity-60"
          style={{ background: colors.accent }}
        >
          {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Links'}
        </button>
      </div>
    </div>
  )
}

// ── Sponsors Panel ──

interface Sponsor {
  name: string
  logo_url: string
  url: string
  order: number
}

function SponsorsPanel() {
  const { colors } = useProfileTheme()
  const { user, fetchMe } = useAuthStore()
  const { profile, fetchMemberProfile } = useCommunityStore()
  const [sponsors, setSponsors] = useState<Sponsor[]>([])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const s = user?.settings as Record<string, unknown> | undefined
    if (s?.sponsors && Array.isArray(s.sponsors)) {
      setSponsors(s.sponsors as Sponsor[])
    }
  }, [user])

  function addSponsor() {
    if (sponsors.length >= 10) return
    setSponsors([...sponsors, { name: '', logo_url: '', url: '', order: sponsors.length }])
  }

  function removeSponsor(idx: number) {
    setSponsors(sponsors.filter((_, i) => i !== idx).map((s, i) => ({ ...s, order: i })))
  }

  function updateSponsor(idx: number, field: keyof Sponsor, value: string) {
    setSponsors(sponsors.map((s, i) => i === idx ? { ...s, [field]: value } : s))
  }

  function moveSponsor(idx: number, direction: 'up' | 'down') {
    const target = direction === 'up' ? idx - 1 : idx + 1
    if (target < 0 || target >= sponsors.length) return
    const next = [...sponsors]
    ;[next[idx], next[target]] = [next[target], next[idx]]
    setSponsors(next.map((s, i) => ({ ...s, order: i })))
  }

  async function handleSave() {
    setSaving(true)
    setSaved(false)
    try {
      await apiFetch('/api/settings/profile', {
        method: 'PATCH',
        body: JSON.stringify({ sponsors: sponsors.filter(s => s.name.trim()) }),
      })
      await fetchMe()
      const h = profile?.handle || user?.username
      if (h) await fetchMemberProfile(h)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch {}
    setSaving(false)
  }

  return (
    <div className="space-y-4">
      {sponsors.map((sponsor, idx) => (
        <div key={idx} className="flex gap-2 items-start">
          <input
            type="text"
            value={sponsor.name}
            onChange={e => updateSponsor(idx, 'name', e.target.value)}
            placeholder="Sponsor name"
            className="px-3 py-2 rounded-lg border text-sm outline-none"
            style={{ background: colors.inputBg, borderColor: colors.inputBorder, color: colors.textPrimary, width: 140 }}
          />
          <input
            type="url"
            value={sponsor.logo_url}
            onChange={e => updateSponsor(idx, 'logo_url', e.target.value)}
            placeholder="https://example.com/logo.png"
            className="flex-1 px-3 py-2 rounded-lg border text-sm outline-none"
            style={{ background: colors.inputBg, borderColor: colors.inputBorder, color: colors.textPrimary }}
          />
          <input
            type="url"
            value={sponsor.url}
            onChange={e => updateSponsor(idx, 'url', e.target.value)}
            placeholder="https://example.com"
            className="flex-1 px-3 py-2 rounded-lg border text-sm outline-none"
            style={{ background: colors.inputBg, borderColor: colors.inputBorder, color: colors.textPrimary }}
          />
          <button
            onClick={() => moveSponsor(idx, 'up')}
            disabled={idx === 0}
            className="w-9 h-9 rounded-lg border cursor-pointer flex items-center justify-center text-base disabled:opacity-30 disabled:cursor-default"
            style={{ background: 'transparent', borderColor: colors.cardBorder, color: colors.textMuted }}
          >
            <i className="bx bx-chevron-up" />
          </button>
          <button
            onClick={() => moveSponsor(idx, 'down')}
            disabled={idx === sponsors.length - 1}
            className="w-9 h-9 rounded-lg border cursor-pointer flex items-center justify-center text-base disabled:opacity-30 disabled:cursor-default"
            style={{ background: 'transparent', borderColor: colors.cardBorder, color: colors.textMuted }}
          >
            <i className="bx bx-chevron-down" />
          </button>
          <button
            onClick={() => removeSponsor(idx)}
            className="w-9 h-9 rounded-lg border-none cursor-pointer flex items-center justify-center text-base"
            style={{ background: 'rgba(239,68,68,0.1)', color: colors.danger }}
          >
            <i className="bx bx-trash" />
          </button>
        </div>
      ))}
      <div className="flex items-center gap-3">
        {sponsors.length < 10 && (
          <button
            onClick={addSponsor}
            className="px-4 py-2 rounded-lg border text-[13px] font-medium cursor-pointer"
            style={{ borderColor: colors.cardBorder, background: 'transparent', color: colors.textMuted }}
          >
            <i className="bx bx-plus mr-1" /> Add Sponsor
          </button>
        )}
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-2 rounded-lg border-none text-[13px] font-semibold text-white cursor-pointer disabled:opacity-60"
          style={{ background: colors.accent }}
        >
          {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Sponsors'}
        </button>
      </div>
    </div>
  )
}

// ── Appearance Panel ──

function AppearancePanel() {
  const { isDark, colors } = useProfileTheme()
  const [profileTheme, setProfileTheme] = useState('system')
  const [accentColor, setAccentColor] = useState('#00e5ff')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const ACCENT_PRESETS = ['#00e5ff', '#a900ff', '#22c55e', '#f59e0b', '#ef4444', '#3b82f6', '#ec4899']

  async function handleSave() {
    setSaving(true)
    setSaved(false)
    try {
      await apiFetch('/api/settings/profile', {
        method: 'PATCH',
        body: JSON.stringify({ appearance: { theme: profileTheme, accent: accentColor } }),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch {}
    setSaving(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <label className="text-[13px] font-medium mb-2 block" style={{ color: colors.textSecondary }}>Theme</label>
        <div className="flex gap-2">
          {['light', 'dark', 'system'].map(t => (
            <button
              key={t}
              onClick={() => setProfileTheme(t)}
              className="px-4 py-2 rounded-lg border text-[13px] capitalize cursor-pointer"
              style={{
                borderColor: profileTheme === t ? colors.accent : colors.cardBorder,
                background: profileTheme === t ? (isDark ? 'rgba(0,229,255,0.08)' : 'rgba(0,229,255,0.06)') : 'transparent',
                color: profileTheme === t ? colors.accent : colors.textMuted,
                fontWeight: profileTheme === t ? 600 : 400,
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="text-[13px] font-medium mb-2 block" style={{ color: colors.textSecondary }}>Accent Color</label>
        <div className="flex gap-2 items-center">
          {ACCENT_PRESETS.map(c => (
            <button
              key={c}
              onClick={() => setAccentColor(c)}
              className="w-8 h-8 rounded-full border-2 cursor-pointer"
              style={{
                background: c,
                borderColor: accentColor === c ? colors.textPrimary : 'transparent',
              }}
            />
          ))}
        </div>
      </div>
      <button
        onClick={handleSave}
        disabled={saving}
        className="px-5 py-2 rounded-lg border-none text-[13px] font-semibold text-white cursor-pointer disabled:opacity-60"
        style={{ background: colors.accent }}
      >
        {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Appearance'}
      </button>
    </div>
  )
}

// ── Privacy Panel ──

function PrivacyPanel() {
  const { isDark, colors } = useProfileTheme()
  const [isPublic, setIsPublic] = useState(true)
  const [showComments, setShowComments] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleSave() {
    setSaving(true)
    setSaved(false)
    try {
      await apiFetch('/api/settings/profile', {
        method: 'PATCH',
        body: JSON.stringify({ public_profile_enabled: isPublic, show_comments_on_profile: showComments }),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch {}
    setSaving(false)
  }

  return (
    <div className="space-y-5">
      <ToggleRow
        label="Public Profile"
        description="Allow anyone to view your profile"
        value={isPublic}
        onChange={setIsPublic}
        colors={colors}
        isDark={isDark}
      />
      <ToggleRow
        label="Show Comments"
        description="Allow comments on your profile posts"
        value={showComments}
        onChange={setShowComments}
        colors={colors}
        isDark={isDark}
      />
      <button
        onClick={handleSave}
        disabled={saving}
        className="px-5 py-2 rounded-lg border-none text-[13px] font-semibold text-white cursor-pointer disabled:opacity-60"
        style={{ background: colors.accent }}
      >
        {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Privacy'}
      </button>
    </div>
  )
}

function ToggleRow({ label, description, value, onChange, colors, isDark }: {
  label: string
  description: string
  value: boolean
  onChange: (v: boolean) => void
  colors: ReturnType<typeof useProfileTheme>['colors']
  isDark: boolean
}) {
  return (
    <div className="flex items-center justify-between py-3" style={{ borderBottom: `1px solid ${colors.cardBorder}` }}>
      <div>
        <div className="text-sm font-medium" style={{ color: colors.textPrimary }}>{label}</div>
        <div className="text-xs mt-0.5" style={{ color: colors.textMuted }}>{description}</div>
      </div>
      <button
        onClick={() => onChange(!value)}
        className="w-10 h-6 rounded-full border-none cursor-pointer relative transition-colors"
        style={{ background: value ? colors.accent : (isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)') }}
      >
        <span
          className="absolute top-1 w-4 h-4 rounded-full bg-white transition-transform"
          style={{ left: value ? 20 : 4 }}
        />
      </button>
    </div>
  )
}

// ── Placeholder panels ──

function PlaceholderPanel({ title }: { title: string }) {
  const { colors } = useProfileTheme()
  return (
    <div className="py-8 text-center">
      <p className="text-sm" style={{ color: colors.textMuted }}>
        {title} settings will be available here.
      </p>
    </div>
  )
}

// ── Main Content Router ──

interface SettingsContentProps {
  activeSection: string
  handle: string
}

export default function SettingsContent({ activeSection, handle }: SettingsContentProps) {
  const { user } = useAuthStore()

  switch (activeSection) {
    case 'edit':
      return user ? (
        <ProfileEditForm
          user={{
            name: user.name,
            username: user.username,
            bio: user.bio,
            avatar_url: user.avatar_url,
            cover_url: user.cover_url,
          }}
        />
      ) : null

    case 'social':
      return <SocialLinksPanel />

    case 'appearance':
      return <AppearancePanel />

    case 'privacy':
      return <PrivacyPanel />

    case 'account':
      return <PlaceholderPanel title="Account" />

    case 'security':
      return <PlaceholderPanel title="Security" />

    case 'notifications':
      return <PlaceholderPanel title="Notifications" />

    case 'sponsor':
      return <SponsorsPanel />

    default:
      return null
  }
}
