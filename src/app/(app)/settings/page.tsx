'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useAuthStore } from '@/store/auth'
import { useSettingsStore } from '@/store/settings'
import { useRoleStore } from '@/store/roles'
import { useThemeStore } from '@/store/theme'
import { ThemePicker } from '@orchestra-mcp/theme'
import { SettingGroupShell } from '@orchestra-mcp/settings'
import type { SettingGroupType } from '@orchestra-mcp/settings'
import '../../../../packages/@orchestra-mcp/settings/src/SettingsForm/SettingsForm.css'
import { useAdminStore } from '@/store/admin'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { apiFetch, isDevSeed } from '@/lib/api'
import { useTranslations } from 'next-intl'
import { usePreferencesStore } from '@/store/preferences'
import { locales } from '@/i18n/config'
import type { Locale } from '@/i18n/config'

function md5(str: string): string {
  function safeAdd(x: number, y: number) { const lsw = (x & 0xffff) + (y & 0xffff); return ((((x >> 16) + (y >> 16) + (lsw >> 16)) << 16) | (lsw & 0xffff)) >>> 0 }
  function bitRotateLeft(num: number, cnt: number) { return (num << cnt) | (num >>> (32 - cnt)) }
  function md5cmn(q: number, a: number, b: number, x: number, s: number, t: number) { return safeAdd(bitRotateLeft(safeAdd(safeAdd(a, q), safeAdd(x, t)), s), b) }
  function md5ff(a: number, b: number, c: number, d: number, x: number, s: number, t: number) { return md5cmn((b & c) | (~b & d), a, b, x, s, t) }
  function md5gg(a: number, b: number, c: number, d: number, x: number, s: number, t: number) { return md5cmn((b & d) | (c & ~d), a, b, x, s, t) }
  function md5hh(a: number, b: number, c: number, d: number, x: number, s: number, t: number) { return md5cmn(b ^ c ^ d, a, b, x, s, t) }
  function md5ii(a: number, b: number, c: number, d: number, x: number, s: number, t: number) { return md5cmn(c ^ (b | ~d), a, b, x, s, t) }
  function md5blks(s: string) {
    const nblk = ((s.length + 8) >> 6) + 1; const blks = new Array(nblk * 16).fill(0)
    for (let i = 0; i < s.length; i++) blks[i >> 2] |= s.charCodeAt(i) << (i % 4 * 8)
    blks[s.length >> 2] |= 0x80 << (s.length % 4 * 8); blks[nblk * 16 - 2] = s.length * 8; return blks
  }
  const x = md5blks(str); let [a, b, c, d] = [1732584193, -271733879, -1732584194, 271733878]
  for (let i = 0; i < x.length; i += 16) {
    const [oa, ob, oc, od] = [a, b, c, d]
    a = md5ff(a,b,c,d,x[i+0],7,-680876936);d=md5ff(d,a,b,c,x[i+1],12,-389564586);c=md5ff(c,d,a,b,x[i+2],17,606105819);b=md5ff(b,c,d,a,x[i+3],22,-1044525330)
    a = md5ff(a,b,c,d,x[i+4],7,-176418897);d=md5ff(d,a,b,c,x[i+5],12,1200080426);c=md5ff(c,d,a,b,x[i+6],17,-1473231341);b=md5ff(b,c,d,a,x[i+7],22,-45705983)
    a = md5ff(a,b,c,d,x[i+8],7,1770035416);d=md5ff(d,a,b,c,x[i+9],12,-1958414417);c=md5ff(c,d,a,b,x[i+10],17,-42063);b=md5ff(b,c,d,a,x[i+11],22,-1990404162)
    a = md5ff(a,b,c,d,x[i+12],7,1804603682);d=md5ff(d,a,b,c,x[i+13],12,-40341101);c=md5ff(c,d,a,b,x[i+14],17,-1502002290);b=md5ff(b,c,d,a,x[i+15],22,1236535329)
    a = md5gg(a,b,c,d,x[i+1],5,-165796510);d=md5gg(d,a,b,c,x[i+6],9,-1069501632);c=md5gg(c,d,a,b,x[i+11],14,643717713);b=md5gg(b,c,d,a,x[i+0],20,-373897302)
    a = md5gg(a,b,c,d,x[i+5],5,-701558691);d=md5gg(d,a,b,c,x[i+10],9,38016083);c=md5gg(c,d,a,b,x[i+15],14,-660478335);b=md5gg(b,c,d,a,x[i+4],20,-405537848)
    a = md5gg(a,b,c,d,x[i+9],5,568446438);d=md5gg(d,a,b,c,x[i+14],9,-1019803690);c=md5gg(c,d,a,b,x[i+3],14,-187363961);b=md5gg(b,c,d,a,x[i+8],20,1163531501)
    a = md5gg(a,b,c,d,x[i+13],5,-1444681467);d=md5gg(d,a,b,c,x[i+2],9,-51403784);c=md5gg(c,d,a,b,x[i+7],14,1735328473);b=md5gg(b,c,d,a,x[i+12],20,-1926607734)
    a = md5hh(a,b,c,d,x[i+5],4,-378558);d=md5hh(d,a,b,c,x[i+8],11,-2022574463);c=md5hh(c,d,a,b,x[i+11],16,1839030562);b=md5hh(b,c,d,a,x[i+14],23,-35309556)
    a = md5hh(a,b,c,d,x[i+1],4,-1530992060);d=md5hh(d,a,b,c,x[i+4],11,1272893353);c=md5hh(c,d,a,b,x[i+7],16,-155497632);b=md5hh(b,c,d,a,x[i+10],23,-1094730640)
    a = md5hh(a,b,c,d,x[i+13],4,681279174);d=md5hh(d,a,b,c,x[i+0],11,-358537222);c=md5hh(c,d,a,b,x[i+3],16,-722521979);b=md5hh(b,c,d,a,x[i+6],23,76029189)
    a = md5hh(a,b,c,d,x[i+9],4,-640364487);d=md5hh(d,a,b,c,x[i+12],11,-421815835);c=md5hh(c,d,a,b,x[i+15],16,530742520);b=md5hh(b,c,d,a,x[i+2],23,-995338651)
    a = md5ii(a,b,c,d,x[i+0],6,-198630844);d=md5ii(d,a,b,c,x[i+7],10,1126891415);c=md5ii(c,d,a,b,x[i+14],15,-1416354905);b=md5ii(b,c,d,a,x[i+5],21,-57434055)
    a = md5ii(a,b,c,d,x[i+12],6,1700485571);d=md5ii(d,a,b,c,x[i+3],10,-1894986606);c=md5ii(c,d,a,b,x[i+10],15,-1051523);b=md5ii(b,c,d,a,x[i+1],21,-2054922799)
    a = md5ii(a,b,c,d,x[i+8],6,1873313359);d=md5ii(d,a,b,c,x[i+15],10,-30611744);c=md5ii(c,d,a,b,x[i+6],15,-1560198380);b=md5ii(b,c,d,a,x[i+13],21,1309151649)
    a = md5ii(a,b,c,d,x[i+4],6,-145523070);d=md5ii(d,a,b,c,x[i+11],10,-1120210379);c=md5ii(c,d,a,b,x[i+2],15,718787259);b=md5ii(b,c,d,a,x[i+9],21,-343485551)
    a=safeAdd(a,oa);b=safeAdd(b,ob);c=safeAdd(c,oc);d=safeAdd(d,od)
  }
  return [a,b,c,d].map(n => { const h = (n >>> 0).toString(16); return ('00000000' + h).slice(-8).match(/../g)!.map(b => b[1]+b[0]).join('') }).join('')
}
function gravatarUrl(email: string, size = 40) {
  return `https://www.gravatar.com/avatar/${md5(email.trim().toLowerCase())}?s=${size}&d=identicon`
}

type Tab =
  | 'profile' | 'password' | 'appearance'
  | '2fa' | 'passkeys' | 'social' | 'sessions' | 'apitokens'
  | 'push'
  | 'admin-general' | 'admin-features' | 'admin-homepage' | 'admin-agents'
  | 'admin-contact' | 'admin-pricing' | 'admin-download' | 'admin-integrations'
  | 'admin-email' | 'admin-aimodels' | 'admin-seo' | 'admin-discord' | 'admin-slack'

const TIMEZONES = ['UTC','America/New_York','America/Chicago','America/Denver','America/Los_Angeles','Europe/London','Europe/Paris','Europe/Berlin','Asia/Tokyo','Asia/Shanghai','Asia/Dubai','Australia/Sydney']
const GENDERS = ['', 'Male', 'Female', 'Non-binary', 'Prefer not to say']

export default function SettingsPage() {
  const { user, updateAvatarUrl } = useAuthStore()
  const { sessions, apiKeys, connectedAccounts, fetchSessions, revokeSession, fetchApiKeys, createApiKey, revokeApiKey, fetchConnectedAccounts, unlinkAccount } = useSettingsStore()
  const { can } = useRoleStore()
  const { fetchSetting, updateSetting } = useAdminStore()
  const { theme, set: setTheme, setColorTheme } = useThemeStore()
  const t = useTranslations('settings')
  const { preferences, updatePreference } = usePreferencesStore()
  const isAdmin = can('canViewAdmin')

  const searchParams = useSearchParams()
  const tab = (searchParams.get('tab') as Tab) || 'profile'

  // Profile
  const [name, setName] = useState(user?.name ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [phone, setPhone] = useState('')
  const [gender, setGender] = useState('')
  const [position, setPosition] = useState('')
  const [timezone, setTimezone] = useState('UTC')
  const [saved, setSaved] = useState(false)

  // Password
  const [pwCurrent, setPwCurrent] = useState('')
  const [pwNew, setPwNew] = useState('')
  const [pwConfirm, setPwConfirm] = useState('')
  const [pwSaving, setPwSaving] = useState(false)
  const [pwMsg, setPwMsg] = useState<{ ok: boolean; text: string } | null>(null)

  // API Tokens
  const [newKeyName, setNewKeyName] = useState('')
  const [createdKey, setCreatedKey] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  // Avatar
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const [avatarUploading, setAvatarUploading] = useState(false)

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarUploading(true)
    try {
      const formData = new FormData()
      formData.append('avatar', file)
      const res = await apiFetch<{ ok: boolean; avatar_url: string }>('/api/settings/avatar', { method: 'POST', body: formData })
      updateAvatarUrl(res.avatar_url)
    } catch {}
    finally { setAvatarUploading(false) }
  }

  // Push — sync state with actual browser Notification permission
  const [pushEnabled, setPushEnabled] = useState(false)
  const [pushPermission, setPushPermission] = useState<NotificationPermission | 'unsupported'>('default')
  const [emailPrefs, setEmailPrefs] = useState({ feature_updates: true, security_alerts: true, team_invites: true, billing: false })

  useEffect(() => {
    if (typeof window === 'undefined' || typeof Notification === 'undefined') {
      setPushPermission('unsupported')
      return
    }
    setPushPermission(Notification.permission)
    setPushEnabled(Notification.permission === 'granted')
    // Register service worker on mount
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    }
  }, [])

  async function handleTogglePush() {
    if (typeof Notification === 'undefined') return
    if (Notification.permission === 'granted') {
      // Already granted — toggle off just disables in-app (can't revoke browser permission)
      setPushEnabled(v => !v)
      return
    }
    if (Notification.permission === 'denied') {
      // Permission was denied — user must change in browser settings
      return
    }
    // Request permission
    const result = await Notification.requestPermission()
    setPushPermission(result)
    setPushEnabled(result === 'granted')
  }

  // Admin settings local values
  const [adminSettings, setAdminSettings] = useState<Record<string, Record<string, unknown>>>({})
  const [adminSaving, setAdminSaving] = useState(false)
  const [adminSaved, setAdminSaved] = useState(false)

  // Map tab IDs to setting keys (where they differ)
  const tabToSettingKey: Record<string, string> = { email: 'smtp' }

  useEffect(() => {
    if (tab === 'sessions') fetchSessions()
    if (tab === 'apitokens') fetchApiKeys()
    if (tab === 'social') fetchConnectedAccounts()
    if (tab.startsWith('admin-') && isAdmin) {
      const rawKey = tab.replace('admin-', '')
      const settingKey = tabToSettingKey[rawKey] ?? rawKey
      fetchSetting(settingKey).then(val => {
        if (val && Object.keys(val).length > 0) {
          setAdminSettings(prev => ({ ...prev, [settingKey]: val }))
        }
      }).catch(() => {})
    }
  }, [tab])

  // Theme
  const textPrimary = 'var(--color-fg)'
  const textMuted = 'var(--color-fg-muted)'
  const textDim = 'var(--color-fg-dim)'
  const pageBg = 'var(--color-bg)'
  // Sidebar moved to layout — settings page only renders content
  const cardBg = 'var(--color-bg-alt)'
  const cardBorder = 'var(--color-border)'
  const cardDivider = 'var(--color-border)'
  const labelColor = 'var(--color-fg-muted)'
  const inputBg = 'var(--color-bg-alt)'
  const inputBorder = 'var(--color-border)'
  const inputColor = 'var(--color-fg)'

  const labelSt: React.CSSProperties = { fontSize: 12, fontWeight: 500, color: labelColor, marginBottom: 6, display: 'block' }
  const inputSt: React.CSSProperties = { width: '100%', padding: '9px 12px', borderRadius: 8, border: `1px solid ${inputBorder}`, background: inputBg, color: inputColor, fontSize: 13, outline: 'none', boxSizing: 'border-box' }
  const selectSt: React.CSSProperties = { ...inputSt, appearance: 'none', cursor: 'pointer' }
  const saveBtnSt: React.CSSProperties = { padding: '8px 20px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, #00e5ff, #a900ff)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }

  const initials = user?.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() ?? 'U'

  async function handleSaveProfile() {
    if (isDevSeed()) { setSaved(true); setTimeout(() => setSaved(false), 2000); return }
    try {
      await apiFetch('/api/settings/profile', { method: 'PATCH', body: JSON.stringify({ name, email, phone, gender, position, timezone }) })
      setSaved(true); setTimeout(() => setSaved(false), 2500)
    } catch { setSaved(false) }
  }

  async function handleSavePassword() {
    if (pwNew !== pwConfirm) { setPwMsg({ ok: false, text: t('passwordsDoNotMatch') }); return }
    setPwSaving(true); setPwMsg(null)
    try {
      if (!isDevSeed()) await apiFetch('/api/auth/change-password', { method: 'POST', body: JSON.stringify({ current_password: pwCurrent, new_password: pwNew }) })
      setPwMsg({ ok: true, text: t('passwordUpdated') })
      setPwCurrent(''); setPwNew(''); setPwConfirm('')
    } catch (e) { setPwMsg({ ok: false, text: (e as Error).message }) }
    finally { setPwSaving(false) }
  }

  async function handleCreateKey() {
    if (!newKeyName.trim()) return
    try {
      const key = await createApiKey(newKeyName.trim())
      setCreatedKey(key?.key ?? null)
      setNewKeyName('')
    } catch {}
  }

  function handleCopy(text: string) {
    navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000) })
  }

  const deviceIcon = (type: string) => type === 'mobile' ? 'bx-mobile-alt' : type === 'tablet' ? 'bx-tab' : 'bx-laptop'

  async function handleSaveAdminSetting(key: string) {
    setAdminSaving(true)
    try {
      await updateSetting(key, adminSettings[key] ?? {})
      setAdminSaved(true); setTimeout(() => setAdminSaved(false), 2000)
    } catch {} finally { setAdminSaving(false) }
  }

  function adminField(settingKey: string, field: string, label: string, type: 'text' | 'email' | 'url' | 'number' | 'textarea' = 'text') {
    const val = (adminSettings[settingKey]?.[field] as string) ?? ''
    const update = (v: string) => setAdminSettings(p => ({ ...p, [settingKey]: { ...p[settingKey], [field]: v } }))
    return (
      <div style={{ marginBottom: 14 }}>
        <label style={labelSt}>{label}</label>
        {type === 'textarea'
          ? <textarea style={{ ...inputSt, height: 80, resize: 'vertical' }} value={val} onChange={e => update(e.target.value)} />
          : <input style={inputSt} type={type} value={val} onChange={e => update(e.target.value)} />}
      </div>
    )
  }

  function adminToggle(settingKey: string, field: string, label: string, desc?: string) {
    const val = !!(adminSettings[settingKey]?.[field])
    const update = (v: boolean) => setAdminSettings(p => ({ ...p, [settingKey]: { ...p[settingKey], [field]: v } }))
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: `1px solid ${cardDivider}` }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 500, color: textPrimary }}>{label}</div>
          {desc && <div style={{ fontSize: 11, color: textDim, marginTop: 2 }}>{desc}</div>}
        </div>
        <button onClick={() => update(!val)} style={{ width: 44, height: 24, borderRadius: 100, border: 'none', cursor: 'pointer', background: val ? 'linear-gradient(135deg, #00e5ff, #a900ff)' : 'var(--color-border)', position: 'relative', flexShrink: 0 }}>
          <span style={{ position: 'absolute', top: 3, left: val ? 22 : 3, width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'left 0.15s' }} />
        </button>
      </div>
    )
  }

  function SaveRow({ settingKey }: { settingKey: string }) {
    return (
      <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
        <button onClick={() => handleSaveAdminSetting(settingKey)} disabled={adminSaving} style={saveBtnSt}>
          {adminSaving ? t('saving') : t('saveChanges')}
        </button>
        {adminSaved && <span style={{ fontSize: 12, color: '#22c55e', display: 'flex', alignItems: 'center', gap: 5 }}><i className="bx bx-check-circle" /> {t('saved')}</span>}
      </div>
    )
  }

  function SettingsCard({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
    const group: SettingGroupType = { id: title, label: title, description: desc, order: 0 }
    return <SettingGroupShell group={group}>{children}</SettingGroupShell>
  }

  return (
    <div className="settings-content page-wrapper" style={{ padding: '32px 48px' }}>

        {/* ── Profile ── */}
        {tab === 'profile' && (
          <>
            <SettingsCard title={t('profileInfo')} desc={t('profileDesc')}>

              {/* Avatar row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
                <div style={{ position: 'relative' }}>
                  <Avatar style={{ width: 72, height: 72, opacity: avatarUploading ? 0.5 : 1, transition: 'opacity 0.2s' }}>
                    {user?.avatar_url
                      ? <AvatarImage src={user.avatar_url} alt={initials} />
                      : user?.email && <AvatarImage src={gravatarUrl(user.email, 144)} alt={initials} />}
                    <AvatarFallback style={{ fontSize: 24, fontWeight: 700 }}>{initials}</AvatarFallback>
                  </Avatar>
                  <input ref={avatarInputRef} type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: 'none' }} />
                  <div onClick={() => avatarInputRef.current?.click()} style={{ position: 'absolute', bottom: 0, right: 0, width: 22, height: 22, borderRadius: '50%', background: 'var(--color-bg-alt)', border: `2px solid ${cardBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    <i className="bx bx-camera" style={{ fontSize: 11, color: textMuted }} />
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: textPrimary }}>{user?.name ?? t('userFallback')}</div>
                  <div style={{ fontSize: 13, color: textMuted, marginTop: 2 }}>{t('uploadHint')}</div>
                </div>
              </div>

              {/* Name + email */}
              <div style={{ marginBottom: 16 }}>
                <label style={labelSt}>{t('nameLabel')}</label>
                <input style={inputSt} value={name} onChange={e => setName(e.target.value)} placeholder={t('namePlaceholder')} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={labelSt}>{t('emailLabel')}</label>
                <input style={inputSt} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={labelSt}>{t('mobileLabel')} <span style={{ color: textDim, fontWeight: 400 }}>(optional)</span></label>
                <input style={inputSt} value={phone} onChange={e => setPhone(e.target.value)} placeholder="+1 555 000 0000" />
              </div>

              {/* Gender + Position */}
              <div className="grid-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
                <div>
                  <label style={labelSt}>{t('genderLabel')} <span style={{ color: textDim, fontWeight: 400 }}>(optional)</span></label>
                  <select style={selectSt} value={gender} onChange={e => setGender(e.target.value)}>
                    {GENDERS.map(g => <option key={g} value={g}>{g || t('selectPlaceholder')}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelSt}>{t('positionLabel')} <span style={{ color: textDim, fontWeight: 400 }}>(optional)</span></label>
                  <input style={inputSt} value={position} onChange={e => setPosition(e.target.value)} placeholder={t('positionPlaceholder')} />
                </div>
              </div>

              {/* Timezone + Language */}
              <div className="grid-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
                <div>
                  <label style={labelSt}>{t('timezoneLabel')}</label>
                  <select style={selectSt} value={timezone} onChange={e => setTimezone(e.target.value)}>
                    {TIMEZONES.map(tz => <option key={tz} value={tz}>{tz}</option>)}
                  </select>
                  <div style={{ fontSize: 11, color: textDim, marginTop: 5 }}>{t('timezoneHint')}</div>
                </div>
                <div>
                  <label style={labelSt}>{t('language')}</label>
                  <select
                    style={selectSt}
                    value={preferences.language}
                    onChange={e => updatePreference('language', e.target.value)}
                  >
                    {locales.map((loc: Locale) => (
                      <option key={loc} value={loc}>{loc === 'en' ? 'English' : loc === 'ar' ? '\u0627\u0644\u0639\u0631\u0628\u064A\u0629' : loc}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button onClick={handleSaveProfile} style={saveBtnSt}>{t('saveChanges')}</button>
                {saved && <span style={{ fontSize: 12, color: '#22c55e', display: 'flex', alignItems: 'center', gap: 4 }}><i className="bx bx-check-circle" /> {t('saved')}</span>}
              </div>
            </SettingsCard>

            {/* Delete account */}
            <SettingsCard title={t('deleteAccount')} desc={t('deleteAccountDesc')}>
              <div style={{ padding: 16, borderRadius: 10, background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#ef4444', marginBottom: 4 }}>{t('deleteWarning')}</div>
                <div style={{ fontSize: 12, color: textMuted, marginBottom: 14 }}>{t('deleteWarningDesc')}</div>
                <button style={{ padding: '7px 16px', borderRadius: 8, border: 'none', background: '#ef4444', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>{t('deleteAccount')}</button>
              </div>
            </SettingsCard>
          </>
        )}

        {/* ── Password ── */}
        {tab === 'password' && (
          <SettingsCard title={t('changePassword')} desc={t('changePasswordDesc')}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div><label style={labelSt}>{t('currentPassword')}</label><input style={inputSt} type="password" value={pwCurrent} onChange={e => setPwCurrent(e.target.value)} placeholder="••••••••" /></div>
              <div><label style={labelSt}>{t('newPassword')}</label><input style={inputSt} type="password" value={pwNew} onChange={e => setPwNew(e.target.value)} placeholder="••••••••" /></div>
              <div><label style={labelSt}>{t('confirmNewPassword')}</label><input style={inputSt} type="password" value={pwConfirm} onChange={e => setPwConfirm(e.target.value)} placeholder="••••••••" /></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <button onClick={handleSavePassword} disabled={pwSaving} style={saveBtnSt}>{pwSaving ? t('updating') : t('updatePassword')}</button>
                {pwMsg && <span style={{ fontSize: 12, color: pwMsg.ok ? '#22c55e' : '#ef4444' }}>{pwMsg.text}</span>}
              </div>
            </div>
          </SettingsCard>
        )}

        {/* ── Appearance ── */}
        {tab === 'appearance' && (
          <>
            <SettingsCard title={t('appearanceTitle')} desc={t('appearanceDesc')}>
              <ThemePicker
                onThemeChange={(themeId) => setColorTheme(themeId)}
                showVariants={false}
              />
            </SettingsCard>
          </>
        )}

        {/* ── Two-Factor Auth ── */}
        {tab === '2fa' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <SettingsCard title={t('twoFactorTitle')} desc={t('twoFactorDesc')}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: textPrimary, marginBottom: 3 }}>{t('authenticatorApp')}</div>
                  <div style={{ fontSize: 12, color: textDim }}>{t('authenticatorAppDesc')}</div>
                  {user?.two_factor_enabled && <span style={{ fontSize: 11, marginTop: 6, display: 'inline-flex', alignItems: 'center', gap: 4, color: '#22c55e' }}><i className="bx bx-check-circle" />{t('enabled')}</span>}
                </div>
                <Link href="/settings/two-factor" style={{ padding: '7px 16px', borderRadius: 8, border: `1px solid ${cardBorder}`, background: 'transparent', color: textPrimary, fontSize: 13, fontWeight: 500, textDecoration: 'none' }}>
                  {user?.two_factor_enabled ? t('manage') : t('enable')}
                </Link>
              </div>
            </SettingsCard>
            <SettingsCard title={t('recoveryCodes')} desc={t('recoveryCodesDesc')}>
              <button style={{ padding: '7px 16px', borderRadius: 8, border: `1px solid ${cardBorder}`, background: 'transparent', color: textMuted, fontSize: 13, cursor: 'pointer' }}>
                <i className="bx bx-download" style={{ marginInlineEnd: 6 }} />{t('downloadRecoveryCodes')}
              </button>
            </SettingsCard>
          </div>
        )}

        {/* ── Passkeys ── */}
        {tab === 'passkeys' && (
          <SettingsCard title={t('passkeysTitle')} desc={t('passkeysDesc')}>
            <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', marginBottom: 24 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(0,229,255,0.08)', border: '1px solid rgba(0,229,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <i className="bx bx-fingerprint" style={{ fontSize: 22, color: '#00e5ff' }} />
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: textPrimary, marginBottom: 6 }}>{t('passkeySignIn')}</div>
                <div style={{ fontSize: 13, color: textMuted, lineHeight: 1.6 }}>{t('passkeyExplain')}</div>
              </div>
            </div>
            <button onClick={() => alert('Passkey registration coming soon!')} style={saveBtnSt}>
              <i className="bx bx-plus" style={{ marginInlineEnd: 6 }} />{t('registerPasskey')}
            </button>
            <div style={{ fontSize: 12, color: textDim, marginTop: 12 }}>{t('noPasskeys')}</div>
          </SettingsCard>
        )}

        {/* ── Connected Accounts ── */}
        {tab === 'social' && (
          <SettingsCard title={t('connectedAccountsTitle')} desc={t('connectedAccountsDesc')}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { provider: 'google', label: 'Google', icon: 'bxl-google', color: '#ea4335' },
                { provider: 'github', label: 'GitHub', icon: 'bxl-github', color: textPrimary },
                { provider: 'discord', label: 'Discord', icon: 'bxl-discord-alt', color: '#5865F2' },
                { provider: 'slack', label: 'Slack', icon: 'bxl-slack', color: '#4A154B' },
              ].map(({ provider, label, icon, color }) => {
                const connected = connectedAccounts.find(a => a.provider === provider)
                return (
                  <div key={provider} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderRadius: 10, border: `1px solid ${cardBorder}` }}>
                    <div style={{ width: 38, height: 38, borderRadius: 9, background: 'var(--color-bg-alt)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <i className={`bx ${icon}`} style={{ fontSize: 20, color }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: textPrimary }}>{label}</div>
                      {connected ? <div style={{ fontSize: 11, color: textMuted, marginTop: 2 }}>{connected.email}</div> : <div style={{ fontSize: 11, color: textDim, marginTop: 2 }}>{t('notConnected')}</div>}
                    </div>
                    {connected
                      ? <button onClick={() => unlinkAccount(provider)} style={{ padding: '6px 14px', borderRadius: 7, border: '1px solid rgba(239,68,68,0.25)', background: 'rgba(239,68,68,0.07)', color: '#ef4444', fontSize: 12, cursor: 'pointer' }}>{t('disconnect')}</button>
                      : <button onClick={() => window.location.href = `${process.env.NEXT_PUBLIC_API_URL || ''}/api/auth/oauth/${provider}/connect`} style={{ padding: '6px 14px', borderRadius: 7, border: `1px solid ${cardBorder}`, background: 'transparent', color: textMuted, fontSize: 12, cursor: 'pointer' }}>{t('connect')}</button>}
                  </div>
                )
              })}
            </div>
          </SettingsCard>
        )}

        {/* ── Sessions ── */}
        {tab === 'sessions' && (
          <SettingsCard title={t('activeSessions')} desc={t('activeSessionsDesc')}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {sessions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: textDim, fontSize: 13 }}>
                  <i className="bx bx-devices" style={{ fontSize: 32, display: 'block', marginBottom: 10 }} />
                  {t('noActiveSessions')}
                </div>
              ) : sessions.map(s => (
                <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '13px 16px', borderRadius: 10, border: `1px solid ${s.is_current ? 'rgba(0,229,255,0.2)' : cardBorder}`, background: s.is_current ? 'rgba(0,229,255,0.03)' : 'transparent' }}>
                  <div style={{ width: 38, height: 38, borderRadius: 9, background: 'var(--color-bg-alt)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <i className={`bx ${deviceIcon(s.device_type)}`} style={{ fontSize: 18, color: s.is_current ? '#00e5ff' : textMuted }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: textPrimary, display: 'flex', alignItems: 'center', gap: 8 }}>
                      {s.device}
                      {s.is_current && <span style={{ fontSize: 10, padding: '1px 7px', borderRadius: 100, background: 'rgba(0,229,255,0.1)', color: '#00e5ff', fontWeight: 600 }}>{t('current')}</span>}
                    </div>
                    <div style={{ fontSize: 11, color: textDim, marginTop: 3 }}>{s.ip} · {s.location} · {s.last_seen}</div>
                  </div>
                  {!s.is_current && (
                    <button onClick={() => revokeSession(s.id)} style={{ padding: '5px 12px', borderRadius: 7, border: '1px solid rgba(239,68,68,0.25)', background: 'rgba(239,68,68,0.06)', color: '#ef4444', fontSize: 12, cursor: 'pointer' }}>{t('revoke')}</button>
                  )}
                </div>
              ))}
            </div>
          </SettingsCard>
        )}

        {/* ── API Tokens ── */}
        {tab === 'apitokens' && (
          <>
            <SettingsCard title={t('generateApiKey')} desc={t('generateApiKeyDesc')}>
              <div style={{ display: 'flex', gap: 10 }}>
                <input style={{ ...inputSt, flex: 1 }} value={newKeyName} onChange={e => setNewKeyName(e.target.value)} placeholder={t('keyNamePlaceholder')} />
                <button onClick={handleCreateKey} style={{ ...saveBtnSt, flexShrink: 0, padding: '9px 20px' }}>{t('generate')}</button>
              </div>
              {createdKey && (
                <div style={{ marginTop: 16, padding: '14px 16px', borderRadius: 10, background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.15)' }}>
                  <div style={{ fontSize: 12, color: '#22c55e', fontWeight: 600, marginBottom: 8 }}>{t('copyKeyWarning')}</div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input style={{ ...inputSt, flex: 1, fontFamily: 'monospace', fontSize: 12 }} readOnly value={createdKey} />
                    <button onClick={() => handleCopy(createdKey)} style={{ padding: '9px 14px', borderRadius: 9, border: `1px solid ${cardBorder}`, background: 'var(--color-bg-active)', color: textMuted, fontSize: 13, cursor: 'pointer', flexShrink: 0 }}>
                      {copied ? <i className="bx bx-check" style={{ color: '#22c55e' }} /> : <i className="bx bx-copy" />}
                    </button>
                  </div>
                </div>
              )}
            </SettingsCard>
            <SettingsCard title={t('yourApiKeys')}>
              {apiKeys.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px 0', color: textDim, fontSize: 13 }}>
                  <i className="bx bx-key" style={{ fontSize: 32, display: 'block', marginBottom: 10 }} />
                  {t('noApiKeys')}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {apiKeys.map(k => (
                    <div key={k.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', borderRadius: 9, border: `1px solid ${cardBorder}` }}>
                      <i className="bx bx-key" style={{ fontSize: 18, color: textDim, flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 500, color: textPrimary }}>{k.name}</div>
                        <div style={{ fontSize: 11, color: textDim, marginTop: 2, fontFamily: 'monospace' }}>{k.prefix}••••••••</div>
                      </div>
                      <div style={{ fontSize: 11, color: textDim, marginInlineEnd: 8 }}>{k.last_used ? `${t('lastUsed')} ${k.last_used}` : t('neverUsed')}</div>
                      <button onClick={() => revokeApiKey(k.id)} style={{ padding: '5px 10px', borderRadius: 7, border: '1px solid rgba(239,68,68,0.25)', background: 'rgba(239,68,68,0.06)', color: '#ef4444', fontSize: 12, cursor: 'pointer' }}>{t('revoke')}</button>
                    </div>
                  ))}
                </div>
              )}
            </SettingsCard>
          </>
        )}

        {/* ── Push Notifications ── */}
        {tab === 'push' && (
          <>
            <SettingsCard title={t('pushNotificationsTitle')} desc={t('pushNotificationsDesc')}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: textPrimary, marginBottom: 3 }}>{t('browserPush')}</div>
                  <div style={{ fontSize: 12, color: textDim }}>
                    {pushPermission === 'denied'
                      ? 'Notifications blocked by browser. Please enable in browser settings.'
                      : pushPermission === 'unsupported'
                        ? 'Push notifications are not supported in this browser.'
                        : t('browserPushDesc')}
                  </div>
                </div>
                <button
                  onClick={handleTogglePush}
                  disabled={pushPermission === 'denied' || pushPermission === 'unsupported'}
                  style={{ width: 44, height: 24, borderRadius: 100, border: 'none', cursor: pushPermission === 'denied' || pushPermission === 'unsupported' ? 'not-allowed' : 'pointer', background: pushEnabled ? 'linear-gradient(135deg, #00e5ff, #a900ff)' : 'var(--color-border)', position: 'relative', opacity: pushPermission === 'denied' || pushPermission === 'unsupported' ? 0.5 : 1 }}
                >
                  <span style={{ position: 'absolute', top: 3, left: pushEnabled ? 22 : 3, width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'left 0.15s' }} />
                </button>
              </div>
            </SettingsCard>
            <SettingsCard title={t('emailPreferences')} desc={t('emailPreferencesDesc')}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {([
                  { key: 'feature_updates', label: t('emailFeatureUpdates'), desc: t('emailFeatureUpdatesDesc') },
                  { key: 'security_alerts', label: t('emailSecurityAlerts'), desc: t('emailSecurityAlertsDesc') },
                  { key: 'team_invites', label: t('emailTeamInvites'), desc: t('emailTeamInvitesDesc') },
                  { key: 'billing', label: t('emailBilling'), desc: t('emailBillingDesc') },
                ] as { key: keyof typeof emailPrefs; label: string; desc: string }[]).map(({ key, label, desc }) => (
                  <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '13px 0', borderBottom: `1px solid ${cardDivider}` }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: textPrimary }}>{label}</div>
                      <div style={{ fontSize: 11, color: textDim, marginTop: 2 }}>{desc}</div>
                    </div>
                    <input type="checkbox" checked={emailPrefs[key]} onChange={e => setEmailPrefs(p => ({ ...p, [key]: e.target.checked }))} style={{ width: 16, height: 16, cursor: 'pointer', flexShrink: 0, accentColor: '#00e5ff' }} />
                  </div>
                ))}
                <button style={{ ...saveBtnSt, alignSelf: 'flex-start', marginTop: 20 }}>{t('savePreferences')}</button>
              </div>
            </SettingsCard>
          </>
        )}

        {/* ── Admin: General ── */}
        {tab === 'admin-general' && isAdmin && (
          <SettingsCard title={t('adminGeneralTitle')} desc={t('adminGeneralDesc')}>
            {adminField('general', 'site_name', 'Site name')}
            {adminField('general', 'tagline', 'Tagline')}
            {adminField('general', 'url', 'Site URL', 'url')}
            {adminField('general', 'support_email', 'Support email', 'email')}
            {adminToggle('general', 'maintenance_mode', 'Maintenance mode', 'Show maintenance page to all non-admin users')}
            <SaveRow settingKey="general" />
          </SettingsCard>
        )}

        {/* ── Admin: Features ── */}
        {tab === 'admin-features' && isAdmin && (
          <SettingsCard title={t('adminFeaturesTitle')} desc={t('adminFeaturesDesc')}>
            {[
              { key: 'rag', label: 'RAG Memory', desc: 'Vector search and memory engine' },
              { key: 'multi_agent', label: 'Multi-Agent', desc: 'Agent orchestration and workflows' },
              { key: 'marketplace', label: 'Marketplace', desc: 'Pack marketplace and discovery' },
              { key: 'quic_bridge', label: 'QUIC Bridge', desc: 'QUIC transport plugin' },
              { key: 'web_gateway', label: 'Web Gateway', desc: 'HTTP/2 web dashboard gateway' },
              { key: 'packs', label: 'Packs', desc: 'Skill and agent packs' },
            ].map(f => adminToggle('features', f.key, f.label, f.desc))}
            <SaveRow settingKey="features" />
          </SettingsCard>
        )}

        {/* ── Admin: Home Page ── */}
        {tab === 'admin-homepage' && isAdmin && (
          <SettingsCard title={t('adminHomepageTitle')} desc={t('adminHomepageDesc')}>
            {adminField('homepage', 'hero_headline', 'Hero headline')}
            {adminField('homepage', 'hero_subtext', 'Hero subtext', 'textarea')}
            {adminField('homepage', 'cta_primary', 'Primary CTA label')}
            {adminField('homepage', 'cta_secondary', 'Secondary CTA label')}
            {adminField('homepage', 'stats_tools', 'Stats — Tools count')}
            {adminField('homepage', 'stats_plugins', 'Stats — Plugins count')}
            {adminField('homepage', 'stats_platforms', 'Stats — Platforms count')}
            {adminField('homepage', 'stats_packs', 'Stats — Packs count')}
            <SaveRow settingKey="homepage" />
          </SettingsCard>
        )}

        {/* ── Admin: Agents ── */}
        {tab === 'admin-agents' && isAdmin && (
          <SettingsCard title={t('adminAgentsTitle')} desc={t('adminAgentsDesc')}>
            {adminField('agents', 'headline', 'Page headline')}
            {adminField('agents', 'subtext', 'Page subtext', 'textarea')}
            {adminField('agents', 'featured_ids', 'Featured agent IDs (comma-separated)')}
            <SaveRow settingKey="agents" />
          </SettingsCard>
        )}

        {/* ── Admin: Contact ── */}
        {tab === 'admin-contact' && isAdmin && (
          <SettingsCard title={t('adminContactTitle')} desc={t('adminContactDesc')}>
            {adminField('contact', 'headline', 'Page headline')}
            {adminField('contact', 'support_email', 'Support email', 'email')}
            {adminField('contact', 'hours', 'Support hours')}
            {adminField('contact', 'twitter', 'Twitter URL', 'url')}
            {adminField('contact', 'github', 'GitHub URL', 'url')}
            {adminField('contact', 'discord', 'Discord URL', 'url')}
            <SaveRow settingKey="contact" />
          </SettingsCard>
        )}

        {/* ── Admin: Pricing ── */}
        {tab === 'admin-pricing' && isAdmin && (
          <SettingsCard title={t('adminPricingTitle')} desc={t('adminPricingDesc')}>
            {(['free', 'pro', 'enterprise'] as const).map(plan => (
              <div key={plan} style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: textPrimary, marginBottom: 10, paddingBottom: 8, borderBottom: `1px solid ${cardDivider}`, textTransform: 'capitalize' }}>{plan} Plan</div>
                {adminField('pricing', `${plan}_name`, 'Plan name')}
                {adminField('pricing', `${plan}_price`, 'Price', 'text')}
                {adminField('pricing', `${plan}_period`, 'Billing period (e.g. /month)')}
                {adminField('pricing', `${plan}_cta`, 'CTA button label')}
                {adminField('pricing', `${plan}_features`, 'Features (one per line)', 'textarea')}
              </div>
            ))}
            <SaveRow settingKey="pricing" />
          </SettingsCard>
        )}

        {/* ── Admin: Download ── */}
        {tab === 'admin-download' && isAdmin && (
          <SettingsCard title={t('adminDownloadTitle')} desc={t('adminDownloadDesc')}>
            {(['macos', 'windows', 'linux', 'ios', 'android'] as const).map(platform => (
              <div key={platform} style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: textPrimary, marginBottom: 10, paddingBottom: 8, borderBottom: `1px solid ${cardDivider}`, textTransform: 'capitalize' }}>{platform}</div>
                {adminField('download', `${platform}_url`, 'Download URL', 'url')}
                {adminField('download', `${platform}_version`, 'Version')}
                {adminField('download', `${platform}_release_date`, 'Release date')}
              </div>
            ))}
            <SaveRow settingKey="download" />
          </SettingsCard>
        )}

        {/* ── Admin: Integrations ── */}
        {tab === 'admin-integrations' && isAdmin && (
          <SettingsCard title={t('adminIntegrationsTitle')} desc={t('adminIntegrationsDesc')}>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: textPrimary, marginBottom: 10, paddingBottom: 8, borderBottom: `1px solid ${cardDivider}` }}>Google OAuth</div>
              {adminField('integrations', 'google_client_id', 'Client ID')}
              {adminField('integrations', 'google_client_secret', 'Client secret')}
            </div>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: textPrimary, marginBottom: 10, paddingBottom: 8, borderBottom: `1px solid ${cardDivider}` }}>GitHub OAuth</div>
              {adminField('integrations', 'github_client_id', 'Client ID')}
              {adminField('integrations', 'github_client_secret', 'Client secret')}
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: textPrimary, marginBottom: 10, paddingBottom: 8, borderBottom: `1px solid ${cardDivider}` }}>Discord OAuth</div>
              {adminField('integrations', 'discord_client_id', 'Client ID')}
              {adminField('integrations', 'discord_client_secret', 'Client secret')}
            </div>
            <div style={{ marginTop: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: textPrimary, marginBottom: 10, paddingBottom: 8, borderBottom: `1px solid ${cardDivider}` }}>Slack OAuth</div>
              {adminField('integrations', 'slack_client_id', 'Client ID')}
              {adminField('integrations', 'slack_client_secret', 'Client secret')}
            </div>
            <SaveRow settingKey="integrations" />
          </SettingsCard>
        )}

        {/* ── Admin: Email / SMTP ── */}
        {tab === 'admin-email' && isAdmin && (
          <SettingsCard title={t('adminEmailTitle')} desc={t('adminEmailDesc')}>
            {adminField('smtp', 'host', 'SMTP host')}
            {adminField('smtp', 'port', 'SMTP port', 'number')}
            {adminField('smtp', 'username', 'Username')}
            {adminField('smtp', 'password', 'Password')}
            {adminField('smtp', 'from_name', 'From name')}
            {adminField('smtp', 'from_email', 'From email', 'email')}
            <div style={{ marginTop: 14, display: 'flex', gap: 10, alignItems: 'center' }}>
              <button style={saveBtnSt} onClick={() => handleSaveAdminSetting('smtp')}>{t('saveChanges')}</button>
              <button style={{ padding: '8px 16px', borderRadius: 8, border: `1px solid ${cardBorder}`, background: 'transparent', color: textMuted, fontSize: 13, cursor: 'pointer' }}>{t('sendTestEmail')}</button>
              {adminSaved && <span style={{ fontSize: 12, color: '#22c55e', display: 'flex', alignItems: 'center', gap: 4 }}><i className="bx bx-check-circle" /> {t('saved')}</span>}
            </div>
          </SettingsCard>
        )}

        {/* ── Admin: AI Models ── */}
        {tab === 'admin-aimodels' && isAdmin && (
          <SettingsCard title={t('adminAITitle')} desc={t('adminAIDesc')}>
            {[
              { provider: 'claude', label: 'Anthropic Claude', envKey: 'ANTHROPIC_API_KEY' },
              { provider: 'openai', label: 'OpenAI', envKey: 'OPENAI_API_KEY' },
              { provider: 'gemini', label: 'Google Gemini', envKey: 'GEMINI_API_KEY' },
              { provider: 'ollama', label: 'Ollama', envKey: 'OLLAMA_BASE_URL' },
            ].map(({ provider, label, envKey }) => (
              <div key={provider} style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: textPrimary, marginBottom: 10, paddingBottom: 8, borderBottom: `1px solid ${cardDivider}` }}>{label}</div>
                {adminField('aimodels', `${provider}_api_key`, envKey)}
                {adminField('aimodels', `${provider}_default_model`, 'Default model')}
              </div>
            ))}
            <SaveRow settingKey="aimodels" />
          </SettingsCard>
        )}

        {/* ── Admin: SEO ── */}
        {tab === 'admin-seo' && isAdmin && (
          <SettingsCard title={t('adminSEOTitle')} desc={t('adminSEODesc')}>
            {adminField('seo', 'title_template', 'Title template (e.g. %s — Orchestra)')}
            {adminField('seo', 'meta_description', 'Meta description', 'textarea')}
            {adminField('seo', 'og_image_url', 'OG image URL', 'url')}
            {adminField('seo', 'robots_txt', 'robots.txt content', 'textarea')}
            {adminField('seo', 'sitemap_url', 'Sitemap URL', 'url')}
            <SaveRow settingKey="seo" />
          </SettingsCard>
        )}

        {/* ── Admin: Discord Bot ── */}
        {tab === 'admin-discord' && isAdmin && (
          <SettingsCard title="Discord Bot" desc="Configure the Discord bot connection, allowed users, and notification settings.">
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: textPrimary, marginBottom: 10, paddingBottom: 8, borderBottom: `1px solid ${cardDivider}` }}>Bot Configuration</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <label style={{ fontSize: 13, fontWeight: 500, color: textMuted }}>Enabled</label>
                <input
                  type="checkbox"
                  checked={adminSettings.discord?.enabled === true || adminSettings.discord?.enabled === 'true'}
                  onChange={e => {
                    const val = { ...adminSettings.discord, enabled: e.target.checked }
                    setAdminSettings(s => ({ ...s, discord: val }))
                  }}
                  style={{ width: 18, height: 18, accentColor: '#a900ff', cursor: 'pointer' }}
                />
              </div>
              {adminField('discord', 'bot_token', 'Bot Token')}
              {adminField('discord', 'application_id', 'Application ID')}
              {adminField('discord', 'guild_id', 'Guild ID')}
              {adminField('discord', 'channel_id', 'Default Channel ID')}
              {adminField('discord', 'command_prefix', 'Command Prefix')}
              {adminField('discord', 'webhook_url', 'Webhook URL', 'url')}
            </div>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: textPrimary, marginBottom: 10, paddingBottom: 8, borderBottom: `1px solid ${cardDivider}` }}>OAuth Credentials</div>
              {adminField('discord', 'client_id', 'Client ID')}
              {adminField('discord', 'client_secret', 'Client Secret')}
            </div>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: textPrimary, marginBottom: 10, paddingBottom: 8, borderBottom: `1px solid ${cardDivider}` }}>Allowed Users</div>
              <div style={{ fontSize: 12, color: textDim, marginBottom: 12 }}>Enter Discord usernames (e.g. user#1234) that are allowed to interact with the bot. Leave empty to allow all users.</div>
              {adminField('discord', 'allowed_users', 'Allowed users (comma-separated)', 'textarea')}
            </div>
            <SaveRow settingKey="discord" />
          </SettingsCard>
        )}

        {/* ── Admin: Slack Bot ── */}
        {tab === 'admin-slack' && isAdmin && (
          <SettingsCard title="Slack Bot" desc="Configure the Slack bot connection (Socket Mode), allowed users, and notification settings.">
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: textPrimary, marginBottom: 10, paddingBottom: 8, borderBottom: `1px solid ${cardDivider}` }}>Bot Configuration</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <label style={{ fontSize: 13, fontWeight: 500, color: textMuted }}>Enabled</label>
                <input
                  type="checkbox"
                  checked={adminSettings.slack?.enabled === true || adminSettings.slack?.enabled === 'true'}
                  onChange={e => {
                    const val = { ...adminSettings.slack, enabled: e.target.checked }
                    setAdminSettings(s => ({ ...s, slack: val }))
                  }}
                  style={{ width: 18, height: 18, accentColor: '#a900ff', cursor: 'pointer' }}
                />
              </div>
              {adminField('slack', 'bot_token', 'Bot Token (xoxb-...)')}
              {adminField('slack', 'app_token', 'App-Level Token (xapp-...)')}
              {adminField('slack', 'signing_secret', 'Signing Secret')}
              {adminField('slack', 'app_id', 'App ID')}
              {adminField('slack', 'channel_id', 'Default Channel ID')}
              {adminField('slack', 'team_id', 'Team / Workspace ID')}
              {adminField('slack', 'command_prefix', 'Command Prefix')}
              {adminField('slack', 'webhook_url', 'Incoming Webhook URL', 'url')}
            </div>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: textPrimary, marginBottom: 10, paddingBottom: 8, borderBottom: `1px solid ${cardDivider}` }}>Allowed Users</div>
              <div style={{ fontSize: 12, color: textDim, marginBottom: 12 }}>Enter Slack user IDs (e.g. U12345ABC) that are allowed to interact with the bot. Leave empty to allow all users.</div>
              {adminField('slack', 'allowed_users', 'Allowed users (comma-separated)', 'textarea')}
            </div>
            <SaveRow settingKey="slack" />
          </SettingsCard>
        )}

    </div>
  )
}
