'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { useAuthStore } from '@/store/auth'
import { useAdminStore } from '@/store/admin'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { isDevSeed } from '@/lib/api'
import { createClient } from '@/lib/supabase/client'

// ── Social platform definitions ──────────────────────────────

interface SocialPlatformDef {
  value: string
  label: string
  icon: string
  placeholder: string
}

const DEFAULT_SOCIAL_PLATFORMS: SocialPlatformDef[] = [
  { value: 'github', label: 'GitHub', icon: 'bxl-github', placeholder: 'https://github.com/...' },
  { value: 'twitter', label: 'Twitter / X', icon: 'bxl-twitter', placeholder: 'https://twitter.com/...' },
  { value: 'linkedin', label: 'LinkedIn', icon: 'bxl-linkedin', placeholder: 'https://linkedin.com/in/...' },
  { value: 'website', label: 'Website', icon: 'bx-globe', placeholder: 'https://...' },
]

// ── Styles ───────────────────────────────────────────────────

const inputSt: React.CSSProperties = {
  width: '100%', padding: '9px 12px', borderRadius: 9,
  border: '1px solid var(--color-border)', background: 'var(--color-bg)',
  color: 'var(--color-fg)', fontSize: 13, outline: 'none',
}

const labelSt: React.CSSProperties = {
  display: 'block', fontSize: 11, fontWeight: 600,
  color: 'var(--color-fg-muted)', letterSpacing: '0.04em',
  marginBottom: 6, textTransform: 'uppercase',
}

const saveBtnSt: React.CSSProperties = {
  padding: '9px 22px', borderRadius: 9, border: 'none',
  background: 'linear-gradient(135deg, #00e5ff, #a900ff)',
  color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer',
}

// ── Dashboard Page ───────────────────────────────────────────

export default function DashboardPage() {
  const { user, fetchMe } = useAuthStore()
  const { fetchSetting } = useAdminStore()

  // Redirect to public profile
  const profileHandle = user?.username || (user?.settings?.handle as string)
  const [redirecting, setRedirecting] = useState(false)
  useEffect(() => {
    if (profileHandle) {
      setRedirecting(true)
      window.location.href = `/@${profileHandle}`
    }
  }, [profileHandle])

  // Show nothing while redirecting
  if (redirecting || profileHandle) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', color: 'var(--color-fg-muted)', fontSize: 14 }}>
        Redirecting to your profile...
      </div>
    )
  }

  const [platforms, setPlatforms] = useState<SocialPlatformDef[]>(DEFAULT_SOCIAL_PLATFORMS)
  const [publicEnabled, setPublicEnabled] = useState(false)
  const [handle, setHandle] = useState('')
  const [bio, setBio] = useState('')
  const [coverUrl, setCoverUrl] = useState('')
  const [coverUploading, setCoverUploading] = useState(false)
  const coverInputRef = useRef<HTMLInputElement>(null)
  const [socialLinks, setSocialLinks] = useState<{ platform: string; url: string }[]>([])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const textDim = 'var(--color-fg-dim)'
  const textMuted = 'var(--color-fg-muted)'
  const cardBorder = 'var(--color-border)'
  const cardBg = 'var(--color-bg-alt)'
  const inputBg = 'var(--color-bg-alt)'
  const inputBorder = 'var(--color-border)'
  const fgColor = 'var(--color-fg)'

  // Load profile data from user.settings
  useEffect(() => {
    let s: Record<string, unknown> | null = null
    if (user?.settings && typeof user.settings === 'object') {
      s = user.settings as Record<string, unknown>
    } else if (isDevSeed()) {
      try { s = JSON.parse(localStorage.getItem('orchestra_dev_settings') || 'null') } catch {}
      if (s) useAuthStore.setState({ user: { ...user!, settings: s } })
    }
    if (!s) return
    if (typeof s.public_profile_enabled === 'boolean') setPublicEnabled(s.public_profile_enabled)
    if (typeof s.handle === 'string') setHandle(s.handle)
    if (typeof s.bio === 'string') setBio(s.bio)
    if (typeof s.cover_url === 'string') setCoverUrl(s.cover_url)
    const raw = s.social_links
    if (Array.isArray(raw)) {
      setSocialLinks(raw.filter((l: any) => l.platform && l.url))
    } else if (raw && typeof raw === 'object') {
      const obj = raw as Record<string, string>
      const links: { platform: string; url: string }[] = []
      for (const [key, val] of Object.entries(obj)) {
        if (val) links.push({ platform: key, url: val })
      }
      setSocialLinks(links)
    }
  }, [user])

  // Fetch custom social platforms from admin settings
  useEffect(() => {
    fetchSetting('social_platforms').then(data => {
      const list = data?.platforms
      if (Array.isArray(list) && list.length > 0) {
        setPlatforms(list as SocialPlatformDef[])
      }
    }).catch(() => {})
  }, [])

  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setCoverUploading(true)
    if (isDevSeed()) {
      setCoverUrl(URL.createObjectURL(file))
      setCoverUploading(false)
      return
    }
    try {
      const formData = new FormData()
      formData.append('cover', file)
      const sb = createClient()
      const { data: { user: authUser } } = await sb.auth.getUser()
      if (!authUser) throw new Error('Not authenticated')
      const ext = file.name.split('.').pop() || 'jpg'
      const path = `covers/${authUser.id}-${Date.now()}.${ext}`
      const { error: uploadError } = await sb.storage.from('uploads').upload(path, file, { upsert: true })
      if (uploadError) throw uploadError
      const { data: { publicUrl } } = sb.storage.from('uploads').getPublicUrl(path)
      setCoverUrl(publicUrl)
    } catch {}
    finally { setCoverUploading(false) }
  }

  function addSocialLink() {
    setSocialLinks(prev => [...prev, { platform: 'website', url: '' }])
  }

  function removeSocialLink(index: number) {
    setSocialLinks(prev => prev.filter((_, i) => i !== index))
  }

  function updateSocialLink(index: number, field: 'platform' | 'url', value: string) {
    setSocialLinks(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item))
  }

  async function handleSave() {
    setSaving(true)
    setSaved(false)
    if (isDevSeed()) {
      const newSettings = {
        ...(user?.settings as Record<string, unknown> ?? {}),
        public_profile_enabled: publicEnabled,
        handle, bio,
        cover_url: coverUrl,
        social_links: socialLinks.filter(l => l.url.trim()),
      }
      useAuthStore.setState({ user: { ...user!, settings: newSettings } })
      localStorage.setItem('orchestra_dev_settings', JSON.stringify(newSettings))
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
      setSaving(false)
      return
    }
    try {
      const sb = createClient()
      const { data: { user: authUser } } = await sb.auth.getUser()
      if (!authUser) throw new Error('Not authenticated')
      const { error } = await sb.from('users').update({
        is_public: publicEnabled,
        username: handle,
        bio,
        cover_url: coverUrl,
        social_links: socialLinks.filter(l => l.url.trim()),
      }).eq('auth_uid', authUser.id)
      if (error) throw new Error(error.message)
      setSaved(true)
      await fetchMe()
      setTimeout(() => setSaved(false), 2000)
    } catch {}
    finally { setSaving(false) }
  }

  const platformInfo = (value: string) =>
    platforms.find(p => p.value === value) || { value, label: value, icon: 'bx-link', placeholder: 'https://...' }

  return (
    <div className="mkt-page" style={{ maxWidth: 680, margin: '0 auto', padding: '72px 32px' }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--color-fg)', marginBottom: 8 }}>
        Community Profile
      </h1>
      <p style={{ fontSize: 15, color: textDim, marginBottom: 40 }}>
        Configure your public community profile visible at /@{handle || 'username'}.
      </p>

      {/* Enable Public Profile Toggle */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 0', borderBottom: `1px solid ${cardBorder}`, marginBottom: 24,
      }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-fg)' }}>Enable Public Profile</div>
          <div style={{ fontSize: 11, color: textDim, marginTop: 2 }}>Make your profile visible on the community page</div>
        </div>
        <button onClick={() => setPublicEnabled(!publicEnabled)} style={{
          width: 44, height: 24, borderRadius: 100, border: 'none', cursor: 'pointer',
          background: publicEnabled ? 'linear-gradient(135deg, #00e5ff, #a900ff)' : 'var(--color-border)',
          position: 'relative', flexShrink: 0,
        }}>
          <span style={{
            position: 'absolute', top: 3, left: publicEnabled ? 22 : 3,
            width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'left 0.15s',
          }} />
        </button>
      </div>

      {/* Handle */}
      <div style={{ marginBottom: 20 }}>
        <label style={labelSt}>Handle</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
          <span style={{
            padding: '9px 10px 9px 12px', borderRadius: '9px 0 0 9px',
            border: `1px solid ${cardBorder}`, borderRight: 'none',
            background: 'var(--color-bg-active)', color: textMuted, fontSize: 13,
          }}>@</span>
          <input
            style={{ ...inputSt, borderRadius: '0 9px 9px 0' }}
            value={handle}
            onChange={e => setHandle(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
            placeholder="username"
          />
        </div>
        <div style={{ fontSize: 11, color: textDim, marginTop: 4 }}>
          Your profile will be accessible at /@{handle || 'username'}
        </div>
      </div>

      {/* Bio */}
      <div style={{ marginBottom: 20 }}>
        <label style={labelSt}>Bio</label>
        <textarea
          style={{ ...inputSt, height: 80, resize: 'vertical' }}
          value={bio}
          onChange={e => setBio(e.target.value)}
          placeholder="Tell the community about yourself..."
        />
      </div>

      {/* Cover Image */}
      <div style={{ marginBottom: 20 }}>
        <label style={labelSt}>Cover Image</label>
        {coverUrl && (
          <div style={{ position: 'relative', marginBottom: 8, borderRadius: 10, overflow: 'hidden', height: 120 }}>
            <img src={coverUrl} alt="Cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <button onClick={() => setCoverUrl('')} style={{
              position: 'absolute', top: 6, right: 6, width: 24, height: 24, borderRadius: 6,
              border: 'none', background: 'rgba(0,0,0,0.5)', color: '#fff', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
            }}>
              <i className="bx bx-x" />
            </button>
          </div>
        )}
        <input ref={coverInputRef} type="file" accept="image/*" onChange={handleCoverUpload} style={{ display: 'none' }} />
        <button
          onClick={() => coverInputRef.current?.click()}
          disabled={coverUploading}
          style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8,
            border: `1px dashed ${cardBorder}`, background: 'transparent', color: textMuted,
            fontSize: 12, cursor: 'pointer', width: '100%', justifyContent: 'center',
          }}
        >
          <i className={`bx ${coverUploading ? 'bx-loader-alt bx-spin' : 'bx-cloud-upload'}`} style={{ fontSize: 16 }} />
          {coverUploading ? 'Uploading...' : coverUrl ? 'Change Cover Image' : 'Upload Cover Image'}
        </button>
      </div>

      {/* Social Links */}
      <div style={{
        fontSize: 11, fontWeight: 600, color: textDim, letterSpacing: '0.07em', textTransform: 'uppercase',
        marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span>Social Links</span>
        <button onClick={addSocialLink} style={{
          display: 'flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 6,
          border: `1px solid ${cardBorder}`, background: 'transparent', color: textMuted,
          fontSize: 11, cursor: 'pointer', fontWeight: 500, textTransform: 'none', letterSpacing: 'normal',
        }}>
          <i className="bx bx-plus" style={{ fontSize: 13 }} /> Add
        </button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
        {socialLinks.length === 0 && (
          <div style={{
            padding: '20px 16px', textAlign: 'center', color: textDim, fontSize: 12,
            border: `1px dashed ${cardBorder}`, borderRadius: 9,
          }}>
            No social links added yet. Click &quot;Add&quot; to get started.
          </div>
        )}
        {socialLinks.map((link, idx) => {
          const info = platformInfo(link.platform)
          return (
            <div key={idx} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button type="button" style={{
                    ...inputSt, width: 150, flexShrink: 0, display: 'flex', alignItems: 'center',
                    gap: 8, cursor: 'pointer', textAlign: 'start',
                  }}>
                    <i className={`bx ${info.icon}`} style={{ fontSize: 16, flexShrink: 0 }} />
                    <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{info.label}</span>
                    <i className="bx bx-chevron-down" style={{ fontSize: 14, color: textDim, flexShrink: 0 }} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" style={{ width: 190, maxHeight: 280, overflowY: 'auto' }}>
                  {platforms.map(p => (
                    <DropdownMenuItem
                      key={p.value}
                      onClick={() => updateSocialLink(idx, 'platform', p.value)}
                      style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: link.platform === p.value ? 600 : 400 }}
                    >
                      <i className={`bx ${p.icon}`} style={{ fontSize: 16, width: 18, textAlign: 'center' }} />
                      {p.label}
                      {link.platform === p.value && <i className="bx bx-check" style={{ marginInlineStart: 'auto', fontSize: 15, color: '#00e5ff' }} />}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <input
                style={{ ...inputSt, flex: 1, minWidth: 0 }}
                value={link.url}
                onChange={e => updateSocialLink(idx, 'url', e.target.value)}
                placeholder={info.placeholder}
              />
              <button
                onClick={() => removeSocialLink(idx)}
                type="button"
                title="Remove"
                style={{
                  width: 32, height: 32, borderRadius: 7,
                  border: '1px solid rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.05)',
                  color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', flexShrink: 0,
                }}
              >
                <i className="bx bx-trash" style={{ fontSize: 14 }} />
              </button>
            </div>
          )
        })}
      </div>

      {/* Save Button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button onClick={handleSave} disabled={saving} style={saveBtnSt}>
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
        {saved && (
          <span style={{ fontSize: 12, color: '#22c55e', display: 'flex', alignItems: 'center', gap: 4 }}>
            <i className="bx bx-check-circle" /> Saved
          </span>
        )}
      </div>

      {/* Settings Link */}
      <div style={{ marginTop: 40, borderTop: `1px solid ${cardBorder}`, paddingTop: 24 }}>
        <Link
          href="/settings"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '10px 20px', borderRadius: 10,
            border: `1px solid ${cardBorder}`, background: cardBg,
            textDecoration: 'none', color: fgColor,
            fontSize: 13, fontWeight: 600,
            transition: 'border-color 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(0,229,255,0.3)')}
          onMouseLeave={e => (e.currentTarget.style.borderColor = cardBorder)}
        >
          <i className="bx bx-cog" style={{ fontSize: 18 }} />
          Account Settings
        </Link>
      </div>
    </div>
  )
}
