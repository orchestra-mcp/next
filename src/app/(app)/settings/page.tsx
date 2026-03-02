'use client'
import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/auth'
import { useSettingsStore } from '@/store/settings'
import { useRoleStore } from '@/store/roles'
import { useThemeStore } from '@/store/theme'
import { useAdminStore } from '@/store/admin'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { apiFetch, isDevSeed } from '@/lib/api'

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
  | 'admin-email' | 'admin-aimodels' | 'admin-seo'

const TIMEZONES = ['UTC','America/New_York','America/Chicago','America/Denver','America/Los_Angeles','Europe/London','Europe/Paris','Europe/Berlin','Asia/Tokyo','Asia/Shanghai','Asia/Dubai','Australia/Sydney']
const GENDERS = ['', 'Male', 'Female', 'Non-binary', 'Prefer not to say']

export default function SettingsPage() {
  const { user } = useAuthStore()
  const { sessions, apiKeys, connectedAccounts, fetchSessions, revokeSession, fetchApiKeys, createApiKey, revokeApiKey, fetchConnectedAccounts, unlinkAccount } = useSettingsStore()
  const { can } = useRoleStore()
  const { fetchSetting, updateSetting } = useAdminStore()
  const { theme, set: setTheme } = useThemeStore()
  const isDark = theme === 'dark'
  const isAdmin = can('canViewAdmin')

  const [tab, setTab] = useState<Tab>('profile')

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

  // Push
  const [pushEnabled, setPushEnabled] = useState(false)
  const [emailPrefs, setEmailPrefs] = useState({ feature_updates: true, security_alerts: true, team_invites: true, billing: false })

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
  const textPrimary = isDark ? '#f8f8f8' : '#0f0f12'
  const textMuted = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.45)'
  const textDim = isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.3)'
  const pageBg = isDark ? '#0f0f12' : '#f5f5f7'
  const sidebarBg = isDark ? '#0a0a0e' : '#ffffff'
  const sidebarBorder = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.09)'
  const cardBg = isDark ? 'rgba(255,255,255,0.025)' : '#ffffff'
  const cardBorder = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)'
  const cardDivider = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.07)'
  const labelColor = isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'
  const inputBg = isDark ? 'rgba(255,255,255,0.04)' : '#f9f9fb'
  const inputBorder = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.12)'
  const inputColor = isDark ? '#f8f8f8' : '#0f0f12'
  const activeNavBg = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)'
  const activeNavColor = isDark ? '#f8f8f8' : '#0f0f12'
  const inactiveNavColor = isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.5)'
  const groupLabelColor = isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.3)'

  const card: React.CSSProperties = { background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 12, padding: '24px', marginBottom: 20 }
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
    if (pwNew !== pwConfirm) { setPwMsg({ ok: false, text: 'Passwords do not match' }); return }
    setPwSaving(true); setPwMsg(null)
    try {
      if (!isDevSeed()) await apiFetch('/api/auth/change-password', { method: 'POST', body: JSON.stringify({ current_password: pwCurrent, new_password: pwNew }) })
      setPwMsg({ ok: true, text: 'Password updated successfully' })
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
        <button onClick={() => update(!val)} style={{ width: 44, height: 24, borderRadius: 100, border: 'none', cursor: 'pointer', background: val ? 'linear-gradient(135deg, #00e5ff, #a900ff)' : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'), position: 'relative', flexShrink: 0 }}>
          <span style={{ position: 'absolute', top: 3, left: val ? 22 : 3, width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'left 0.15s' }} />
        </button>
      </div>
    )
  }

  function SaveRow({ settingKey }: { settingKey: string }) {
    return (
      <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
        <button onClick={() => handleSaveAdminSetting(settingKey)} disabled={adminSaving} style={saveBtnSt}>
          {adminSaving ? 'Saving…' : 'Save changes'}
        </button>
        {adminSaved && <span style={{ fontSize: 12, color: '#22c55e', display: 'flex', alignItems: 'center', gap: 5 }}><i className="bx bx-check-circle" /> Saved</span>}
      </div>
    )
  }

  // Sidebar nav item
  function NavItem({ id, label }: { id: Tab; label: string }) {
    const active = tab === id
    return (
      <button onClick={() => setTab(id)} style={{
        width: '100%', textAlign: 'left', padding: '7px 12px', borderRadius: 7, border: 'none', cursor: 'pointer',
        background: active ? activeNavBg : 'transparent',
        color: active ? activeNavColor : inactiveNavColor,
        fontSize: 13, fontWeight: active ? 500 : 400, transition: 'all 0.12s',
        display: 'block',
      }}>
        {label}
      </button>
    )
  }

  function GroupLabel({ label }: { label: string }) {
    return <div style={{ fontSize: 11, fontWeight: 600, color: groupLabelColor, letterSpacing: '0.05em', textTransform: 'uppercase', padding: '14px 12px 4px' }}>{label}</div>
  }

  function SectionTitle({ title, desc }: { title: string; desc?: string }) {
    return (
      <div style={{ marginBottom: 20, paddingBottom: 16, borderBottom: `1px solid ${cardDivider}` }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: textPrimary }}>{title}</div>
        {desc && <div style={{ fontSize: 12, color: textMuted, marginTop: 4 }}>{desc}</div>}
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: pageBg }}>

      {/* ── Left Sidebar ── */}
      <div style={{ width: 220, flexShrink: 0, background: sidebarBg, borderRight: `1px solid ${sidebarBorder}`, padding: '24px 12px', position: 'sticky', top: 0, height: 'calc(100vh - 52px)', overflowY: 'scroll' }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: textPrimary, padding: '0 12px 16px', letterSpacing: '-0.01em' }}>Settings</div>

        <GroupLabel label="Account" />
        <NavItem id="profile" label="Profile" />
        <NavItem id="password" label="Password" />
        <NavItem id="appearance" label="Appearance" />

        <GroupLabel label="Security & Authentication" />
        <NavItem id="2fa" label="Two-Factor Auth" />
        <NavItem id="passkeys" label="Passkeys" />
        <NavItem id="social" label="Connected Accounts" />
        <NavItem id="sessions" label="Sessions" />
        <NavItem id="apitokens" label="API Tokens" />

        <GroupLabel label="Notifications" />
        <NavItem id="push" label="Push Notifications" />

        {isAdmin && (
          <>
            <GroupLabel label="Administration" />
            <NavItem id="admin-general" label="General" />
            <NavItem id="admin-features" label="Features" />
            <NavItem id="admin-homepage" label="Home Page" />
            <NavItem id="admin-agents" label="Agents" />
            <NavItem id="admin-contact" label="Contact" />
            <NavItem id="admin-pricing" label="Pricing" />
            <NavItem id="admin-download" label="Download" />
            <NavItem id="admin-integrations" label="Integrations" />
            <NavItem id="admin-email" label="Email" />
            <NavItem id="admin-aimodels" label="AI Models" />
            <NavItem id="admin-seo" label="SEO" />
          </>
        )}
      </div>

      {/* ── Content ── */}
      <div style={{ flex: 1, padding: '32px 48px', maxWidth: 680 }}>

        {/* ── Profile ── */}
        {tab === 'profile' && (
          <>
            <div style={card}>
              <SectionTitle title="Profile information" desc="Update your avatar, name, and personal details" />

              {/* Avatar row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
                <div style={{ position: 'relative' }}>
                  <Avatar style={{ width: 72, height: 72 }}>
                    {user?.email && <AvatarImage src={gravatarUrl(user.email, 144)} alt={initials} />}
                    <AvatarFallback style={{ fontSize: 24, fontWeight: 700 }}>{initials}</AvatarFallback>
                  </Avatar>
                  <div style={{ position: 'absolute', bottom: 0, right: 0, width: 22, height: 22, borderRadius: '50%', background: isDark ? '#1e1e24' : '#fff', border: `2px solid ${cardBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    <i className="bx bx-camera" style={{ fontSize: 11, color: textMuted }} />
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: textPrimary }}>{user?.name ?? 'User'}</div>
                  <div style={{ fontSize: 13, color: textMuted, marginTop: 2 }}>Click the camera to upload · JPG, PNG, WebP or GIF</div>
                </div>
              </div>

              {/* Name + email */}
              <div style={{ marginBottom: 16 }}>
                <label style={labelSt}>Name</label>
                <input style={{ ...inputSt, maxWidth: 380 }} value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={labelSt}>Email address</label>
                <input style={{ ...inputSt, maxWidth: 380 }} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={labelSt}>Mobile number <span style={{ color: textDim, fontWeight: 400 }}>(optional)</span></label>
                <input style={{ ...inputSt, maxWidth: 380 }} value={phone} onChange={e => setPhone(e.target.value)} placeholder="+1 555 000 0000" />
              </div>

              {/* Gender + Position */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, maxWidth: 380, marginBottom: 16 }}>
                <div>
                  <label style={labelSt}>Gender <span style={{ color: textDim, fontWeight: 400 }}>(optional)</span></label>
                  <select style={selectSt} value={gender} onChange={e => setGender(e.target.value)}>
                    {GENDERS.map(g => <option key={g} value={g}>{g || 'Select…'}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelSt}>Current position <span style={{ color: textDim, fontWeight: 400 }}>(optional)</span></label>
                  <input style={inputSt} value={position} onChange={e => setPosition(e.target.value)} placeholder="e.g. Tech Lead" />
                </div>
              </div>

              {/* Timezone */}
              <div style={{ marginBottom: 20 }}>
                <label style={labelSt}>Timezone</label>
                <select style={{ ...selectSt, maxWidth: 380 }} value={timezone} onChange={e => setTimezone(e.target.value)}>
                  {TIMEZONES.map(tz => <option key={tz} value={tz}>{tz}</option>)}
                </select>
                <div style={{ fontSize: 11, color: textDim, marginTop: 5 }}>Used for date &amp; time display across the app</div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button onClick={handleSaveProfile} style={saveBtnSt}>Save changes</button>
                {saved && <span style={{ fontSize: 12, color: '#22c55e', display: 'flex', alignItems: 'center', gap: 4 }}><i className="bx bx-check-circle" /> Saved</span>}
              </div>
            </div>

            {/* Delete account */}
            <div style={card}>
              <div style={{ fontSize: 14, fontWeight: 600, color: textPrimary, marginBottom: 4 }}>Delete account</div>
              <div style={{ fontSize: 13, color: textMuted, marginBottom: 16 }}>Delete your account and all of its resources</div>
              <div style={{ padding: 16, borderRadius: 10, background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#ef4444', marginBottom: 4 }}>Warning</div>
                <div style={{ fontSize: 12, color: textMuted, marginBottom: 14 }}>Please proceed with caution, this cannot be undone.</div>
                <button style={{ padding: '7px 16px', borderRadius: 8, border: 'none', background: '#ef4444', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Delete account</button>
              </div>
            </div>
          </>
        )}

        {/* ── Password ── */}
        {tab === 'password' && (
          <div style={card}>
            <SectionTitle title="Change password" desc="Update your account password. We recommend a strong, unique password." />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 380 }}>
              <div><label style={labelSt}>Current password</label><input style={inputSt} type="password" value={pwCurrent} onChange={e => setPwCurrent(e.target.value)} placeholder="••••••••" /></div>
              <div><label style={labelSt}>New password</label><input style={inputSt} type="password" value={pwNew} onChange={e => setPwNew(e.target.value)} placeholder="••••••••" /></div>
              <div><label style={labelSt}>Confirm new password</label><input style={inputSt} type="password" value={pwConfirm} onChange={e => setPwConfirm(e.target.value)} placeholder="••••••••" /></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <button onClick={handleSavePassword} disabled={pwSaving} style={saveBtnSt}>{pwSaving ? 'Updating…' : 'Update password'}</button>
                {pwMsg && <span style={{ fontSize: 12, color: pwMsg.ok ? '#22c55e' : '#ef4444' }}>{pwMsg.text}</span>}
              </div>
            </div>
          </div>
        )}

        {/* ── Appearance ── */}
        {tab === 'appearance' && (
          <div style={card}>
            <SectionTitle title="Appearance" desc="Choose how Orchestra looks for you." />
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              {(['dark', 'light'] as const).map(t => (
                <button key={t} onClick={() => setTheme(t)} style={{ padding: '14px 24px', borderRadius: 10, border: `2px solid ${theme === t ? '#00e5ff' : cardBorder}`, background: t === 'dark' ? '#0f0f12' : '#f5f5f7', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, minWidth: 120 }}>
                  <div style={{ width: 48, height: 32, borderRadius: 6, background: t === 'dark' ? '#1a1520' : '#ffffff', border: `1px solid ${t === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}` }} />
                  <span style={{ fontSize: 13, fontWeight: 500, color: t === 'dark' ? '#f8f8f8' : '#0f0f12', textTransform: 'capitalize' }}>{t}</span>
                  {theme === t && <i className="bx bx-check-circle" style={{ color: '#00e5ff', fontSize: 14 }} />}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Two-Factor Auth ── */}
        {tab === '2fa' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={card}>
              <SectionTitle title="Two-Factor Authentication" desc="Add an extra layer of security to your account." />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: textPrimary, marginBottom: 3 }}>Authenticator App (TOTP)</div>
                  <div style={{ fontSize: 12, color: textDim }}>Use Google Authenticator, Authy, or any TOTP app.</div>
                  {user?.two_factor_enabled && <span style={{ fontSize: 11, marginTop: 6, display: 'inline-flex', alignItems: 'center', gap: 4, color: '#22c55e' }}><i className="bx bx-check-circle" />Enabled</span>}
                </div>
                <a href="/settings/two-factor" style={{ padding: '7px 16px', borderRadius: 8, border: `1px solid ${cardBorder}`, background: 'transparent', color: textPrimary, fontSize: 13, fontWeight: 500, textDecoration: 'none' }}>
                  {user?.two_factor_enabled ? 'Manage' : 'Enable'}
                </a>
              </div>
            </div>
            <div style={card}>
              <div style={{ fontSize: 14, fontWeight: 600, color: textPrimary, marginBottom: 6 }}>Recovery Codes</div>
              <div style={{ fontSize: 12, color: textMuted, marginBottom: 14 }}>Save these codes in a safe place. Each code can only be used once.</div>
              <button style={{ padding: '7px 16px', borderRadius: 8, border: `1px solid ${cardBorder}`, background: 'transparent', color: textMuted, fontSize: 13, cursor: 'pointer' }}>
                <i className="bx bx-download" style={{ marginRight: 6 }} />Download recovery codes
              </button>
            </div>
          </div>
        )}

        {/* ── Passkeys ── */}
        {tab === 'passkeys' && (
          <div style={card}>
            <SectionTitle title="Passkey Authentication" desc="Sign in without a password using biometrics or a hardware key." />
            <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', marginBottom: 24 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(0,229,255,0.08)', border: '1px solid rgba(0,229,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <i className="bx bx-fingerprint" style={{ fontSize: 22, color: '#00e5ff' }} />
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: textPrimary, marginBottom: 6 }}>Sign in without a password</div>
                <div style={{ fontSize: 13, color: textMuted, lineHeight: 1.6 }}>Use Face ID, Touch ID, or a hardware security key to sign in instantly. Passkeys are more secure than passwords — they can&apos;t be phished.</div>
              </div>
            </div>
            <button onClick={() => alert('Passkey registration coming soon!')} style={saveBtnSt}>
              <i className="bx bx-plus" style={{ marginRight: 6 }} />Register Passkey
            </button>
            <div style={{ fontSize: 12, color: textDim, marginTop: 12 }}>No passkeys registered yet.</div>
          </div>
        )}

        {/* ── Connected Accounts ── */}
        {tab === 'social' && (
          <div style={card}>
            <SectionTitle title="Connected Accounts" desc="Connect your social accounts for faster sign-in." />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { provider: 'google', label: 'Google', icon: 'bxl-google', color: '#ea4335' },
                { provider: 'github', label: 'GitHub', icon: 'bxl-github', color: textPrimary },
              ].map(({ provider, label, icon, color }) => {
                const connected = connectedAccounts.find(a => a.provider === provider)
                return (
                  <div key={provider} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderRadius: 10, border: `1px solid ${cardBorder}` }}>
                    <div style={{ width: 38, height: 38, borderRadius: 9, background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <i className={`bx ${icon}`} style={{ fontSize: 20, color }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: textPrimary }}>{label}</div>
                      {connected ? <div style={{ fontSize: 11, color: textMuted, marginTop: 2 }}>{connected.email}</div> : <div style={{ fontSize: 11, color: textDim, marginTop: 2 }}>Not connected</div>}
                    </div>
                    {connected
                      ? <button onClick={() => unlinkAccount(provider)} style={{ padding: '6px 14px', borderRadius: 7, border: '1px solid rgba(239,68,68,0.25)', background: 'rgba(239,68,68,0.07)', color: '#ef4444', fontSize: 12, cursor: 'pointer' }}>Disconnect</button>
                      : <button style={{ padding: '6px 14px', borderRadius: 7, border: `1px solid ${cardBorder}`, background: 'transparent', color: textMuted, fontSize: 12, cursor: 'pointer' }}>Connect</button>}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── Sessions ── */}
        {tab === 'sessions' && (
          <div style={card}>
            <SectionTitle title="Active Sessions" desc="These devices are currently signed into your account." />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {sessions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: textDim, fontSize: 13 }}>
                  <i className="bx bx-devices" style={{ fontSize: 32, display: 'block', marginBottom: 10 }} />
                  No active sessions found
                </div>
              ) : sessions.map(s => (
                <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '13px 16px', borderRadius: 10, border: `1px solid ${s.is_current ? 'rgba(0,229,255,0.2)' : cardBorder}`, background: s.is_current ? 'rgba(0,229,255,0.03)' : 'transparent' }}>
                  <div style={{ width: 38, height: 38, borderRadius: 9, background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <i className={`bx ${deviceIcon(s.device_type)}`} style={{ fontSize: 18, color: s.is_current ? '#00e5ff' : textMuted }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: textPrimary, display: 'flex', alignItems: 'center', gap: 8 }}>
                      {s.device}
                      {s.is_current && <span style={{ fontSize: 10, padding: '1px 7px', borderRadius: 100, background: 'rgba(0,229,255,0.1)', color: '#00e5ff', fontWeight: 600 }}>Current</span>}
                    </div>
                    <div style={{ fontSize: 11, color: textDim, marginTop: 3 }}>{s.ip} · {s.location} · {s.last_seen}</div>
                  </div>
                  {!s.is_current && (
                    <button onClick={() => revokeSession(s.id)} style={{ padding: '5px 12px', borderRadius: 7, border: '1px solid rgba(239,68,68,0.25)', background: 'rgba(239,68,68,0.06)', color: '#ef4444', fontSize: 12, cursor: 'pointer' }}>Revoke</button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── API Tokens ── */}
        {tab === 'apitokens' && (
          <>
            <div style={card}>
              <SectionTitle title="Generate API Key" desc="Create personal access tokens for CLI, CI/CD, or external integrations." />
              <div style={{ display: 'flex', gap: 10 }}>
                <input style={{ ...inputSt, flex: 1 }} value={newKeyName} onChange={e => setNewKeyName(e.target.value)} placeholder="Key name (e.g. CLI token, CI/CD)" />
                <button onClick={handleCreateKey} style={{ ...saveBtnSt, flexShrink: 0, padding: '9px 20px' }}>Generate</button>
              </div>
              {createdKey && (
                <div style={{ marginTop: 16, padding: '14px 16px', borderRadius: 10, background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.15)' }}>
                  <div style={{ fontSize: 12, color: '#22c55e', fontWeight: 600, marginBottom: 8 }}>Copy your key now — it won&apos;t be shown again</div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input style={{ ...inputSt, flex: 1, fontFamily: 'monospace', fontSize: 12 }} readOnly value={createdKey} />
                    <button onClick={() => handleCopy(createdKey)} style={{ padding: '9px 14px', borderRadius: 9, border: `1px solid ${cardBorder}`, background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)', color: textMuted, fontSize: 13, cursor: 'pointer', flexShrink: 0 }}>
                      {copied ? <i className="bx bx-check" style={{ color: '#22c55e' }} /> : <i className="bx bx-copy" />}
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div style={card}>
              <SectionTitle title="Your API Keys" />
              {apiKeys.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px 0', color: textDim, fontSize: 13 }}>
                  <i className="bx bx-key" style={{ fontSize: 32, display: 'block', marginBottom: 10 }} />
                  No API keys yet
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
                      <div style={{ fontSize: 11, color: textDim, marginRight: 8 }}>{k.last_used ? `Last used ${k.last_used}` : 'Never used'}</div>
                      <button onClick={() => revokeApiKey(k.id)} style={{ padding: '5px 10px', borderRadius: 7, border: '1px solid rgba(239,68,68,0.25)', background: 'rgba(239,68,68,0.06)', color: '#ef4444', fontSize: 12, cursor: 'pointer' }}>Revoke</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* ── Push Notifications ── */}
        {tab === 'push' && (
          <>
            <div style={card}>
              <SectionTitle title="Push Notifications" desc="Receive real-time alerts in your browser." />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: textPrimary, marginBottom: 3 }}>Browser push notifications</div>
                  <div style={{ fontSize: 12, color: textDim }}>Receive real-time alerts directly in your browser.</div>
                </div>
                <button onClick={() => setPushEnabled(v => !v)} style={{ width: 44, height: 24, borderRadius: 100, border: 'none', cursor: 'pointer', background: pushEnabled ? 'linear-gradient(135deg, #00e5ff, #a900ff)' : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'), position: 'relative' }}>
                  <span style={{ position: 'absolute', top: 3, left: pushEnabled ? 22 : 3, width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'left 0.15s' }} />
                </button>
              </div>
            </div>
            <div style={card}>
              <SectionTitle title="Email Preferences" desc="Choose which emails you receive from Orchestra." />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {([
                  { key: 'feature_updates', label: 'Feature & product updates', desc: 'News about new features and platform improvements' },
                  { key: 'security_alerts', label: 'Security alerts', desc: 'Important alerts about your account security' },
                  { key: 'team_invites', label: 'Team invitations', desc: 'When you are invited to join a team' },
                  { key: 'billing', label: 'Billing & receipts', desc: 'Invoices and payment notifications' },
                ] as { key: keyof typeof emailPrefs; label: string; desc: string }[]).map(({ key, label, desc }) => (
                  <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '13px 0', borderBottom: `1px solid ${cardDivider}` }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: textPrimary }}>{label}</div>
                      <div style={{ fontSize: 11, color: textDim, marginTop: 2 }}>{desc}</div>
                    </div>
                    <input type="checkbox" checked={emailPrefs[key]} onChange={e => setEmailPrefs(p => ({ ...p, [key]: e.target.checked }))} style={{ width: 16, height: 16, cursor: 'pointer', flexShrink: 0, accentColor: '#00e5ff' }} />
                  </div>
                ))}
                <button style={{ ...saveBtnSt, alignSelf: 'flex-start', marginTop: 20 }}>Save preferences</button>
              </div>
            </div>
          </>
        )}

        {/* ── Admin: General ── */}
        {tab === 'admin-general' && isAdmin && (
          <div style={card}>
            <SectionTitle title="General Settings" desc="Core platform configuration." />
            {adminField('general', 'site_name', 'Site name')}
            {adminField('general', 'tagline', 'Tagline')}
            {adminField('general', 'url', 'Site URL', 'url')}
            {adminField('general', 'support_email', 'Support email', 'email')}
            {adminToggle('general', 'maintenance_mode', 'Maintenance mode', 'Show maintenance page to all non-admin users')}
            <SaveRow settingKey="general" />
          </div>
        )}

        {/* ── Admin: Features ── */}
        {tab === 'admin-features' && isAdmin && (
          <div style={card}>
            <SectionTitle title="Feature Flags" desc="Enable or disable platform features." />
            {[
              { key: 'rag', label: 'RAG Memory', desc: 'Vector search and memory engine' },
              { key: 'multi_agent', label: 'Multi-Agent', desc: 'Agent orchestration and workflows' },
              { key: 'marketplace', label: 'Marketplace', desc: 'Pack marketplace and discovery' },
              { key: 'quic_bridge', label: 'QUIC Bridge', desc: 'QUIC transport plugin' },
              { key: 'web_gateway', label: 'Web Gateway', desc: 'HTTP/2 web dashboard gateway' },
              { key: 'packs', label: 'Packs', desc: 'Skill and agent packs' },
            ].map(f => adminToggle('features', f.key, f.label, f.desc))}
            <SaveRow settingKey="features" />
          </div>
        )}

        {/* ── Admin: Home Page ── */}
        {tab === 'admin-homepage' && isAdmin && (
          <div style={card}>
            <SectionTitle title="Home Page Settings" desc="Configure the public landing page content." />
            {adminField('homepage', 'hero_headline', 'Hero headline')}
            {adminField('homepage', 'hero_subtext', 'Hero subtext', 'textarea')}
            {adminField('homepage', 'cta_primary', 'Primary CTA label')}
            {adminField('homepage', 'cta_secondary', 'Secondary CTA label')}
            {adminField('homepage', 'stats_tools', 'Stats — Tools count')}
            {adminField('homepage', 'stats_plugins', 'Stats — Plugins count')}
            {adminField('homepage', 'stats_platforms', 'Stats — Platforms count')}
            {adminField('homepage', 'stats_packs', 'Stats — Packs count')}
            <SaveRow settingKey="homepage" />
          </div>
        )}

        {/* ── Admin: Agents ── */}
        {tab === 'admin-agents' && isAdmin && (
          <div style={card}>
            <SectionTitle title="Agents Page" desc="Configure the agents showcase page." />
            {adminField('agents', 'headline', 'Page headline')}
            {adminField('agents', 'subtext', 'Page subtext', 'textarea')}
            {adminField('agents', 'featured_ids', 'Featured agent IDs (comma-separated)')}
            <SaveRow settingKey="agents" />
          </div>
        )}

        {/* ── Admin: Contact ── */}
        {tab === 'admin-contact' && isAdmin && (
          <div style={card}>
            <SectionTitle title="Contact Settings" desc="Public contact page configuration." />
            {adminField('contact', 'headline', 'Page headline')}
            {adminField('contact', 'support_email', 'Support email', 'email')}
            {adminField('contact', 'hours', 'Support hours')}
            {adminField('contact', 'twitter', 'Twitter URL', 'url')}
            {adminField('contact', 'github', 'GitHub URL', 'url')}
            {adminField('contact', 'discord', 'Discord URL', 'url')}
            <SaveRow settingKey="contact" />
          </div>
        )}

        {/* ── Admin: Pricing ── */}
        {tab === 'admin-pricing' && isAdmin && (
          <div style={card}>
            <SectionTitle title="Pricing Configuration" desc="Set plan names, prices, and features." />
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
          </div>
        )}

        {/* ── Admin: Download ── */}
        {tab === 'admin-download' && isAdmin && (
          <div style={card}>
            <SectionTitle title="Download Links" desc="Platform binary URLs and version info." />
            {(['macos', 'windows', 'linux', 'ios', 'android'] as const).map(platform => (
              <div key={platform} style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: textPrimary, marginBottom: 10, paddingBottom: 8, borderBottom: `1px solid ${cardDivider}`, textTransform: 'capitalize' }}>{platform}</div>
                {adminField('download', `${platform}_url`, 'Download URL', 'url')}
                {adminField('download', `${platform}_version`, 'Version')}
                {adminField('download', `${platform}_release_date`, 'Release date')}
              </div>
            ))}
            <SaveRow settingKey="download" />
          </div>
        )}

        {/* ── Admin: Integrations ── */}
        {tab === 'admin-integrations' && isAdmin && (
          <div style={card}>
            <SectionTitle title="OAuth Integrations" desc="Third-party OAuth provider credentials." />
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: textPrimary, marginBottom: 10, paddingBottom: 8, borderBottom: `1px solid ${cardDivider}` }}>Google OAuth</div>
              {adminField('integrations', 'google_client_id', 'Client ID')}
              {adminField('integrations', 'google_client_secret', 'Client secret')}
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: textPrimary, marginBottom: 10, paddingBottom: 8, borderBottom: `1px solid ${cardDivider}` }}>GitHub OAuth</div>
              {adminField('integrations', 'github_client_id', 'Client ID')}
              {adminField('integrations', 'github_client_secret', 'Client secret')}
            </div>
            <SaveRow settingKey="integrations" />
          </div>
        )}

        {/* ── Admin: Email / SMTP ── */}
        {tab === 'admin-email' && isAdmin && (
          <div style={card}>
            <SectionTitle title="SMTP / Email Settings" desc="Configure outbound email delivery." />
            {adminField('smtp', 'host', 'SMTP host')}
            {adminField('smtp', 'port', 'SMTP port', 'number')}
            {adminField('smtp', 'username', 'Username')}
            {adminField('smtp', 'password', 'Password')}
            {adminField('smtp', 'from_name', 'From name')}
            {adminField('smtp', 'from_email', 'From email', 'email')}
            <div style={{ marginTop: 14, display: 'flex', gap: 10, alignItems: 'center' }}>
              <button style={saveBtnSt} onClick={() => handleSaveAdminSetting('smtp')}>Save changes</button>
              <button style={{ padding: '8px 16px', borderRadius: 8, border: `1px solid ${cardBorder}`, background: 'transparent', color: textMuted, fontSize: 13, cursor: 'pointer' }}>Send test email</button>
              {adminSaved && <span style={{ fontSize: 12, color: '#22c55e', display: 'flex', alignItems: 'center', gap: 4 }}><i className="bx bx-check-circle" /> Saved</span>}
            </div>
          </div>
        )}

        {/* ── Admin: AI Models ── */}
        {tab === 'admin-aimodels' && isAdmin && (
          <div style={card}>
            <SectionTitle title="AI Model Configuration" desc="Default AI models and API keys for each provider." />
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
          </div>
        )}

        {/* ── Admin: SEO ── */}
        {tab === 'admin-seo' && isAdmin && (
          <div style={card}>
            <SectionTitle title="SEO Configuration" desc="Search engine and social media metadata." />
            {adminField('seo', 'title_template', 'Title template (e.g. %s — Orchestra)')}
            {adminField('seo', 'meta_description', 'Meta description', 'textarea')}
            {adminField('seo', 'og_image_url', 'OG image URL', 'url')}
            {adminField('seo', 'robots_txt', 'robots.txt content', 'textarea')}
            {adminField('seo', 'sitemap_url', 'Sitemap URL', 'url')}
            <SaveRow settingKey="seo" />
          </div>
        )}

      </div>
    </div>
  )
}
