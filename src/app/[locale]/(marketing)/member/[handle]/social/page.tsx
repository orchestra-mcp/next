'use client'
import { use, useState, useEffect, useCallback } from 'react'
import { useAuthStore } from '@/store/auth'
import { createClient } from '@/lib/supabase/client'
import { useProfileTheme } from '@/components/profile/use-profile-theme'
import ProfileSection from '@/components/profile/profile-section'
import ProfileCard from '@/components/profile/profile-card'
import { SearchableSelect } from '@/components/ui/searchable-select'

interface PageProps {
  params: Promise<{ handle: string }>
}

interface SocialLink {
  platform: string
  url: string
}

const PLATFORM_OPTIONS = [
  { value: 'github', label: 'GitHub' },
  { value: 'twitter', label: 'Twitter / X' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'website', label: 'Website' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'discord', label: 'Discord' },
  { value: 'mastodon', label: 'Mastodon' },
  { value: 'bluesky', label: 'Bluesky' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'other', label: 'Other' },
]

const MAX_LINKS = 10

export default function SocialLinksPage(props: PageProps) {
  const params = use(props.params)
  const handle = params.handle

  const { isDark, colors } = useProfileTheme()
  const { user } = useAuthStore()

  const [links, setLinks] = useState<SocialLink[]>([])
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [loaded, setLoaded] = useState(false)

  // Load current social links from the member profile
  const loadLinks = useCallback(async () => {
    try {
      const sb = createClient()
      const { data, error } = await sb.from('users').select('social_links').eq('handle', handle).single()
      if (error) throw error
      const existing = data?.social_links as SocialLink[] | undefined
      if (Array.isArray(existing) && existing.length > 0) {
        setLinks(existing)
      }
    } catch {
      // Profile may not exist yet or have no links -- start empty
    } finally {
      setLoaded(true)
    }
  }, [handle])

  useEffect(() => {
    loadLinks()
  }, [loadLinks])

  const addLink = () => {
    if (links.length >= MAX_LINKS) return
    setLinks([...links, { platform: 'github', url: '' }])
    setMessage(null)
  }

  const removeLink = (index: number) => {
    setLinks(links.filter((_, i) => i !== index))
    setMessage(null)
  }

  const updateLink = (index: number, field: 'platform' | 'url', value: string) => {
    const updated = links.map((link, i) =>
      i === index ? { ...link, [field]: value } : link
    )
    setLinks(updated)
    setMessage(null)
  }

  const save = async () => {
    // Validate all links have a URL
    for (let i = 0; i < links.length; i++) {
      if (!links[i].url.trim()) {
        setMessage({ type: 'error', text: `Link ${i + 1} is missing a URL.` })
        return
      }
    }

    setSaving(true)
    setMessage(null)
    try {
      const sb = createClient()
      const { error } = await sb.from('users').update({ social_links: links }).eq('handle', handle)
      if (error) throw error
      setMessage({ type: 'success', text: 'Social links saved.' })
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to save social links.'
      setMessage({ type: 'error', text: msg })
    } finally {
      setSaving(false)
    }
  }

  if (!user) {
    return (
      <ProfileSection
        title="Social Links"
        description="Please log in to manage your social links."
        icon="bx-link"
      >
        <div />
      </ProfileSection>
    )
  }

  if (!loaded) {
    return (
      <ProfileSection
        title="Social Links"
        description="Loading..."
        icon="bx-link"
      >
        <div />
      </ProfileSection>
    )
  }

  return (
    <ProfileSection
      title="Social Links"
      description={`Connect your social accounts and websites for @${handle}`}
      icon="bx-link"
    >
      <ProfileCard variant="default" className="p-6">
        {links.length === 0 && (
          <p className="text-sm mb-4" style={{ color: colors.textMuted }}>
            No social links yet. Click &quot;Add link&quot; to get started.
          </p>
        )}

        {links.map((link, index) => (
          <div key={index} className="flex items-center gap-3 mb-3">
            {/* Platform dropdown */}
            <SearchableSelect
              value={link.platform}
              onChange={(val) => updateLink(index, 'platform', val)}
              options={PLATFORM_OPTIONS}
              className="h-10 px-3 rounded-lg text-sm outline-none cursor-pointer flex-none w-40 border"
              style={{
                borderColor: colors.inputBorder,
                background: colors.inputBg,
                color: colors.textPrimary,
              }}
            />

            {/* URL input */}
            <input
              type="url"
              placeholder="https://..."
              value={link.url}
              onChange={(e) => updateLink(index, 'url', e.target.value)}
              className="flex-1 h-10 px-3 rounded-lg text-sm outline-none border"
              style={{
                borderColor: colors.inputBorder,
                background: colors.inputBg,
                color: colors.textPrimary,
              }}
            />

            {/* Remove button */}
            <button
              type="button"
              onClick={() => removeLink(index)}
              className="flex-none w-9 h-9 rounded-lg border flex items-center justify-center text-lg leading-none cursor-pointer"
              style={{
                borderColor: isDark ? 'rgba(239,68,68,0.3)' : 'rgba(239,68,68,0.25)',
                background: isDark ? 'rgba(239,68,68,0.1)' : 'rgba(239,68,68,0.06)',
                color: colors.danger,
              }}
              title="Remove link"
            >
              &times;
            </button>
          </div>
        ))}

        {/* Action buttons */}
        <div
          className={`flex items-center gap-3 ${links.length > 0 ? 'mt-5' : ''}`}
        >
          <button
            type="button"
            onClick={addLink}
            disabled={links.length >= MAX_LINKS}
            className="h-10 px-5 rounded-lg text-sm font-medium border bg-transparent transition-opacity"
            style={{
              borderColor: colors.inputBorder,
              color: links.length >= MAX_LINKS ? colors.textMuted : colors.textPrimary,
              cursor: links.length >= MAX_LINKS ? 'not-allowed' : 'pointer',
              opacity: links.length >= MAX_LINKS ? 0.5 : 1,
            }}
          >
            + Add link
          </button>

          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="h-10 px-6 rounded-lg border-none text-sm font-semibold text-white transition-opacity"
            style={{
              background: `linear-gradient(135deg, ${colors.accent}, ${colors.accentPurple})`,
              cursor: saving ? 'not-allowed' : 'pointer',
              opacity: saving ? 0.6 : 1,
            }}
          >
            {saving ? 'Saving...' : 'Save'}
          </button>

          {links.length >= MAX_LINKS && (
            <span className="text-[13px]" style={{ color: colors.textMuted }}>
              Maximum {MAX_LINKS} links reached
            </span>
          )}
        </div>

        {/* Status message */}
        {message && (
          <p
            className="mt-4 text-sm"
            style={{
              color: message.type === 'success' ? colors.success : colors.danger,
            }}
          >
            {message.text}
          </p>
        )}
      </ProfileCard>
    </ProfileSection>
  )
}
