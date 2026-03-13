'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
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
import { ContentLocaleTabs } from '@/components/ui/content-locale-tabs'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { apiFetch, isDevSeed } from '@/lib/api'
import { useTranslations } from 'next-intl'
import { usePreferencesStore } from '@/store/preferences'
import { useChatStore } from '@/store/chat'
import type { CopilotDockMode } from '@/store/chat'
import { PromptCardEditor } from '@orchestra-mcp/ai/PromptCardEditor'
import type { PromptCard } from '@orchestra-mcp/ai/PromptCardEditor'
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
  | '2fa' | 'passkeys' | 'social' | 'integrations' | 'sessions' | 'apitokens'
  | 'push' | 'copilot'
  | 'admin-general' | 'admin-features' | 'admin-homepage' | 'admin-agents'
  | 'admin-contact' | 'admin-pricing' | 'admin-download' | 'admin-integrations'
  | 'admin-email' | 'admin-seo' | 'admin-discord' | 'admin-slack' | 'admin-github' | 'admin-social'

const TIMEZONES = [
  'UTC',
  // Americas
  'America/New_York','America/Chicago','America/Denver','America/Los_Angeles',
  'America/Anchorage','America/Adak','America/Phoenix','America/Boise',
  'America/Detroit','America/Indiana/Indianapolis','America/Kentucky/Louisville',
  'America/Toronto','America/Vancouver','America/Winnipeg','America/Edmonton',
  'America/Halifax','America/St_Johns','America/Regina',
  'America/Mexico_City','America/Cancun','America/Bogota','America/Lima',
  'America/Santiago','America/Buenos_Aires','America/Sao_Paulo',
  'America/Caracas','America/Montevideo','America/Asuncion',
  'America/Guayaquil','America/La_Paz','America/Manaus',
  'America/Havana','America/Jamaica','America/Panama',
  'America/Costa_Rica','America/Guatemala','America/El_Salvador',
  // Europe
  'Europe/London','Europe/Dublin','Europe/Paris','Europe/Berlin','Europe/Madrid',
  'Europe/Rome','Europe/Amsterdam','Europe/Brussels','Europe/Vienna',
  'Europe/Zurich','Europe/Stockholm','Europe/Oslo','Europe/Copenhagen',
  'Europe/Helsinki','Europe/Warsaw','Europe/Prague','Europe/Budapest',
  'Europe/Bucharest','Europe/Sofia','Europe/Athens','Europe/Istanbul',
  'Europe/Moscow','Europe/Kiev','Europe/Minsk','Europe/Lisbon',
  'Europe/Belgrade','Europe/Zagreb','Europe/Ljubljana','Europe/Bratislava',
  'Europe/Tallinn','Europe/Riga','Europe/Vilnius',
  // Asia
  'Asia/Tokyo','Asia/Shanghai','Asia/Hong_Kong','Asia/Taipei',
  'Asia/Seoul','Asia/Singapore','Asia/Kuala_Lumpur','Asia/Bangkok',
  'Asia/Jakarta','Asia/Ho_Chi_Minh','Asia/Manila','Asia/Kolkata',
  'Asia/Mumbai','Asia/Colombo','Asia/Dhaka','Asia/Karachi',
  'Asia/Tashkent','Asia/Almaty','Asia/Novosibirsk','Asia/Krasnoyarsk',
  'Asia/Irkutsk','Asia/Vladivostok','Asia/Kamchatka',
  'Asia/Dubai','Asia/Riyadh','Asia/Baghdad','Asia/Tehran',
  'Asia/Beirut','Asia/Jerusalem','Asia/Amman','Asia/Kuwait',
  'Asia/Qatar','Asia/Muscat','Asia/Baku','Asia/Tbilisi','Asia/Yerevan',
  'Asia/Kabul','Asia/Kathmandu','Asia/Yangon',
  // Africa
  'Africa/Cairo','Africa/Lagos','Africa/Johannesburg','Africa/Nairobi',
  'Africa/Casablanca','Africa/Algiers','Africa/Tunis','Africa/Accra',
  'Africa/Addis_Ababa','Africa/Dar_es_Salaam','Africa/Khartoum',
  'Africa/Maputo','Africa/Harare','Africa/Abidjan',
  // Oceania
  'Australia/Sydney','Australia/Melbourne','Australia/Brisbane',
  'Australia/Perth','Australia/Adelaide','Australia/Hobart',
  'Australia/Darwin','Australia/Lord_Howe',
  'Pacific/Auckland','Pacific/Fiji','Pacific/Guam',
  'Pacific/Honolulu','Pacific/Chatham','Pacific/Tongatapu',
  'Pacific/Apia','Pacific/Noumea','Pacific/Port_Moresby',
  // Atlantic / Indian
  'Atlantic/Reykjavik','Atlantic/Azores','Atlantic/Cape_Verde',
  'Indian/Maldives','Indian/Mauritius',
]
const GENDERS = ['', 'Male', 'Female', 'Non-binary', 'Prefer not to say']

interface PasskeyItem { id: number; credential_id: string; name: string; aaguid: string; sign_count: number; transports: string; backup_eligible: boolean; backup_state: boolean; last_used_at: string | null; created_at: string }

function PasskeysTab({ textPrimary, textMuted, textDim, cardBorder, saveBtnSt, SettingsCard }: {
  textPrimary: string; textMuted: string; textDim: string; cardBorder: string; saveBtnSt: React.CSSProperties
  SettingsCard: React.ComponentType<{ title: string; desc?: string; children: React.ReactNode }>
}) {
  const t = useTranslations('settings')
  const { beginPasskeyRegistration, finishPasskeyRegistration } = useAuthStore()
  const [passkeys, setPasskeys] = useState<PasskeyItem[]>([])
  const [loading, setLoading] = useState(true)
  const [registering, setRegistering] = useState(false)
  const [naming, setNaming] = useState(false)
  const [newName, setNewName] = useState('')
  const [pendingCred, setPendingCred] = useState<Credential | null>(null)
  const [renamingId, setRenamingId] = useState<number | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const [error, setError] = useState<string | null>(null)

  const fetchPasskeys = useCallback(async () => {
    try {
      const res = await apiFetch<{ passkeys: PasskeyItem[] }>('/api/settings/passkeys')
      setPasskeys(res.passkeys ?? [])
    } catch { /* empty */ } finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchPasskeys() }, [fetchPasskeys])

  const handleRegister = async () => {
    setError(null); setRegistering(true)
    try {
      const opts = await beginPasskeyRegistration()
      const cred = await navigator.credentials.create({ publicKey: opts })
      if (!cred) { setRegistering(false); return }
      setPendingCred(cred); setNaming(true); setRegistering(false)
    } catch (e) {
      setError((e as Error).message); setRegistering(false)
    }
  }

  const handleFinishRegister = async () => {
    if (!pendingCred) return
    setError(null); setRegistering(true)
    try {
      await finishPasskeyRegistration(pendingCred, newName || undefined)
      setPendingCred(null); setNaming(false); setNewName('')
      await fetchPasskeys()
    } catch (e) {
      setError((e as Error).message)
    } finally { setRegistering(false) }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Remove this passkey? You won\'t be able to sign in with it anymore.')) return
    try {
      await apiFetch(`/api/settings/passkeys/${id}`, { method: 'DELETE' })
      setPasskeys(p => p.filter(k => k.id !== id))
    } catch (e) { setError((e as Error).message) }
  }

  const handleRename = async (id: number) => {
    try {
      await apiFetch(`/api/settings/passkeys/${id}`, { method: 'PATCH', body: JSON.stringify({ name: renameValue }) })
      setPasskeys(p => p.map(k => k.id === id ? { ...k, name: renameValue } : k))
      setRenamingId(null)
    } catch (e) { setError((e as Error).message) }
  }

  const browserSupported = typeof window !== 'undefined' && !!window.PublicKeyCredential

  return (
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

      {error && (
        <div style={{ marginBottom: 16, padding: '10px 14px', borderRadius: 8, fontSize: 13, background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>
          {error}
          <button onClick={() => setError(null)} style={{ float: 'right', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 14 }}><i className="bx bx-x" /></button>
        </div>
      )}

      {/* Naming modal after credential creation */}
      {naming && (
        <div style={{ marginBottom: 20, padding: 16, borderRadius: 10, border: `1px solid rgba(0,229,255,0.2)`, background: 'rgba(0,229,255,0.04)' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: textPrimary, marginBottom: 8 }}>Name your passkey</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input value={newName} onChange={e => setNewName(e.target.value)} placeholder='e.g. "MacBook Touch ID"' onKeyDown={e => e.key === 'Enter' && handleFinishRegister()} style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: `1px solid ${cardBorder}`, background: 'var(--color-bg)', color: textPrimary, fontSize: 13, outline: 'none' }} autoFocus />
            <button onClick={handleFinishRegister} disabled={registering} style={saveBtnSt}>
              {registering ? <i className="bx bx-loader-alt bx-spin" /> : 'Save'}
            </button>
            <button onClick={() => { setNaming(false); setPendingCred(null) }} style={{ padding: '8px 12px', borderRadius: 8, border: `1px solid ${cardBorder}`, background: 'transparent', color: textMuted, fontSize: 13, cursor: 'pointer' }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Register button */}
      {!naming && (
        <button onClick={handleRegister} disabled={registering || !browserSupported} style={{ ...saveBtnSt, opacity: !browserSupported ? 0.5 : 1, marginBottom: 20 }}>
          {registering ? <><i className="bx bx-loader-alt bx-spin" style={{ marginInlineEnd: 6 }} />Registering...</> : <><i className="bx bx-plus" style={{ marginInlineEnd: 6 }} />{t('registerPasskey')}</>}
        </button>
      )}

      {!browserSupported && <div style={{ fontSize: 12, color: '#f59e0b', marginBottom: 12 }}>Your browser does not support passkeys.</div>}

      {/* Passkey list */}
      {loading ? (
        <div style={{ fontSize: 13, color: textDim }}><i className="bx bx-loader-alt bx-spin" style={{ marginRight: 6 }} />Loading passkeys...</div>
      ) : passkeys.length === 0 ? (
        <div style={{ fontSize: 12, color: textDim }}>{t('noPasskeys')}</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {passkeys.map(pk => (
            <div key={pk.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 10, border: `1px solid ${cardBorder}`, background: 'var(--color-bg)' }}>
              <i className="bx bx-fingerprint" style={{ fontSize: 20, color: '#00e5ff', flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                {renamingId === pk.id ? (
                  <div style={{ display: 'flex', gap: 6 }}>
                    <input value={renameValue} onChange={e => setRenameValue(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleRename(pk.id)} style={{ flex: 1, padding: '4px 8px', borderRadius: 6, border: `1px solid ${cardBorder}`, background: 'var(--color-bg-alt)', color: textPrimary, fontSize: 13, outline: 'none' }} autoFocus />
                    <button onClick={() => handleRename(pk.id)} style={{ background: 'none', border: 'none', color: '#00e5ff', cursor: 'pointer', fontSize: 14 }}><i className="bx bx-check" /></button>
                    <button onClick={() => setRenamingId(null)} style={{ background: 'none', border: 'none', color: textDim, cursor: 'pointer', fontSize: 14 }}><i className="bx bx-x" /></button>
                  </div>
                ) : (
                  <>
                    <div style={{ fontSize: 13, fontWeight: 600, color: textPrimary }}>{pk.name || 'Passkey'}</div>
                    <div style={{ fontSize: 11, color: textDim, marginTop: 2 }}>
                      Added {new Date(pk.created_at).toLocaleDateString()}
                      {pk.last_used_at && <> · Last used {new Date(pk.last_used_at).toLocaleDateString()}</>}
                      {pk.sign_count > 0 && <> · {pk.sign_count} sign-ins</>}
                    </div>
                  </>
                )}
              </div>
              {renamingId !== pk.id && (
                <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                  <button onClick={() => { setRenamingId(pk.id); setRenameValue(pk.name || '') }} style={{ background: 'none', border: 'none', color: textMuted, cursor: 'pointer', padding: 4 }} title="Rename"><i className="bx bx-pencil" style={{ fontSize: 15 }} /></button>
                  <button onClick={() => handleDelete(pk.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 4 }} title="Remove"><i className="bx bx-trash" style={{ fontSize: 15 }} /></button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </SettingsCard>
  )
}

function SettingsCard({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  const group: SettingGroupType = { id: title, label: title, description: desc, order: 0 }
  return <SettingGroupShell group={group}>{children}</SettingGroupShell>
}

function SocialPlatformsAdmin({ inputSt, labelSt, saveBtnSt, textDim, textMuted, textPrimary, cardBorder }: {
  adminSettings: Record<string, Record<string, unknown>>
  setAdminSettings: React.Dispatch<React.SetStateAction<Record<string, Record<string, unknown>>>>
  handleSaveAdminSetting: (key: string) => Promise<void>
  adminSaving: boolean; adminSaved: boolean
  inputSt: React.CSSProperties; labelSt: React.CSSProperties; saveBtnSt: React.CSSProperties
  textDim: string; textMuted: string; textPrimary: string; cardBorder: string
}) {
  const { fetchSetting, updateSetting } = useAdminStore()
  const [platforms, setPlatforms] = useState<SocialPlatformDef[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    fetchSetting('social_platforms').then(data => {
      const list = data?.platforms
      if (Array.isArray(list) && list.length > 0) {
        setPlatforms(list as SocialPlatformDef[])
      } else {
        setPlatforms(DEFAULT_SOCIAL_PLATFORMS)
      }
      setLoaded(true)
    }).catch(() => {
      setPlatforms(DEFAULT_SOCIAL_PLATFORMS)
      setLoaded(true)
    })
  }, [])

  function addPlatform() {
    setPlatforms(prev => [...prev, { value: '', label: '', icon: 'bx-link', placeholder: 'https://...' }])
  }

  function removePlatform(idx: number) {
    setPlatforms(prev => prev.filter((_, i) => i !== idx))
  }

  function movePlatform(idx: number, dir: -1 | 1) {
    setPlatforms(prev => {
      const next = [...prev]
      const target = idx + dir
      if (target < 0 || target >= next.length) return prev
      ;[next[idx], next[target]] = [next[target], next[idx]]
      return next
    })
  }

  function updatePlatform(idx: number, field: keyof SocialPlatformDef, val: string) {
    setPlatforms(prev => prev.map((p, i) => {
      if (i !== idx) return p
      const updated = { ...p, [field]: val }
      // Auto-generate value from label if value is empty or matches old auto-generated value
      if (field === 'label') {
        const autoVal = val.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '')
        if (!p.value || p.value === p.label.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '')) {
          updated.value = autoVal
        }
      }
      return updated
    }))
  }

  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleSave() {
    setSaving(true)
    try {
      await updateSetting('social_platforms', { platforms } as Record<string, unknown>)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch {}
    finally { setSaving(false) }
  }

  if (!loaded) return null

  return (
    <SettingsCard title="Social Platforms" desc="Manage the social networks available for user profiles. Users pick from this list when adding their social links.">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {platforms.map((p, idx) => (
          <div key={idx} style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '10px 12px', borderRadius: 10, border: `1px solid ${cardBorder}`, background: 'var(--color-bg-alt)' }}>
            {/* Order controls */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flexShrink: 0 }}>
              <button type="button" onClick={() => movePlatform(idx, -1)} disabled={idx === 0} title="Move up"
                style={{ width: 22, height: 18, borderRadius: '5px 5px 0 0', border: `1px solid ${cardBorder}`, background: 'var(--color-bg)', color: idx === 0 ? 'var(--color-border)' : textMuted, cursor: idx === 0 ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>
                <i className="bx bx-chevron-up" style={{ fontSize: 14, lineHeight: 1 }} />
              </button>
              <button type="button" onClick={() => movePlatform(idx, 1)} disabled={idx === platforms.length - 1} title="Move down"
                style={{ width: 22, height: 18, borderRadius: '0 0 5px 5px', border: `1px solid ${cardBorder}`, borderTop: 'none', background: 'var(--color-bg)', color: idx === platforms.length - 1 ? 'var(--color-border)' : textMuted, cursor: idx === platforms.length - 1 ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>
                <i className="bx bx-chevron-down" style={{ fontSize: 14, lineHeight: 1 }} />
              </button>
            </div>
            {/* Order number */}
            <span style={{ fontSize: 10, fontWeight: 700, color: textDim, width: 16, textAlign: 'center', flexShrink: 0 }}>{idx + 1}</span>
            {/* Icon preview */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: 8, background: 'var(--color-bg)', border: `1px solid ${cardBorder}`, flexShrink: 0 }}>
              <i className={`bx ${p.icon || 'bx-link'}`} style={{ fontSize: 18, color: textPrimary }} />
            </div>
            {/* Fields */}
            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, minWidth: 0 }}>
              <div>
                <label style={{ ...labelSt, fontSize: 10, marginBottom: 3 }}>Name</label>
                <input style={{ ...inputSt, fontSize: 12, padding: '6px 10px' }} value={p.label} onChange={e => updatePlatform(idx, 'label', e.target.value)} placeholder="GitHub" />
              </div>
              <div>
                <label style={{ ...labelSt, fontSize: 10, marginBottom: 3 }}>Icon (Boxicons)</label>
                <input style={{ ...inputSt, fontSize: 12, padding: '6px 10px', fontFamily: 'monospace' }} value={p.icon} onChange={e => updatePlatform(idx, 'icon', e.target.value)} placeholder="bxl-github" />
              </div>
              <div>
                <label style={{ ...labelSt, fontSize: 10, marginBottom: 3 }}>Placeholder</label>
                <input style={{ ...inputSt, fontSize: 12, padding: '6px 10px' }} value={p.placeholder} onChange={e => updatePlatform(idx, 'placeholder', e.target.value)} placeholder="https://..." />
              </div>
            </div>
            {/* Delete */}
            <button onClick={() => removePlatform(idx)} type="button" title="Remove"
              style={{ width: 30, height: 30, borderRadius: 7, border: '1px solid rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.05)', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <i className="bx bx-trash" style={{ fontSize: 14 }} />
            </button>
          </div>
        ))}
        {platforms.length === 0 && (
          <div style={{ padding: '24px 16px', textAlign: 'center', color: textDim, fontSize: 12, border: `1px dashed ${cardBorder}`, borderRadius: 9 }}>
            No social platforms configured. Click "Add Platform" to get started.
          </div>
        )}
      </div>
      <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
        <button onClick={addPlatform} type="button" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, border: `1px dashed ${cardBorder}`, background: 'transparent', color: textMuted, fontSize: 12, cursor: 'pointer' }}>
          <i className="bx bx-plus" style={{ fontSize: 15 }} /> Add Platform
        </button>
      </div>
      <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
        <button onClick={handleSave} disabled={saving} style={saveBtnSt}>{saving ? 'Saving...' : 'Save Changes'}</button>
        {saved && <span style={{ fontSize: 12, color: '#22c55e', display: 'flex', alignItems: 'center', gap: 4 }}><i className="bx bx-check-circle" /> Saved</span>}
      </div>
      <div style={{ marginTop: 12, padding: '10px 14px', borderRadius: 8, background: 'var(--color-bg)', fontSize: 11, color: textDim }}>
        <strong style={{ color: textMuted }}>Icon reference:</strong> Use <a href="https://boxicons.com" target="_blank" rel="noopener noreferrer" style={{ color: '#00e5ff', textDecoration: 'none' }}>Boxicons</a> class names.
        Brand icons start with <code style={{ padding: '1px 4px', borderRadius: 3, background: 'var(--color-bg-alt)', fontSize: 10 }}>bxl-</code> (e.g. bxl-github, bxl-twitter, bxl-linkedin).
        Generic icons start with <code style={{ padding: '1px 4px', borderRadius: 3, background: 'var(--color-bg-alt)', fontSize: 10 }}>bx-</code> (e.g. bx-globe, bx-link).
      </div>
    </SettingsCard>
  )
}

export interface SocialPlatformDef {
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

function PublicProfileSettings({ inputSt, labelSt, saveBtnSt, textDim, textMuted, cardBorder }: {
  inputSt: React.CSSProperties; labelSt: React.CSSProperties; saveBtnSt: React.CSSProperties
  textDim: string; textMuted: string; cardBorder: string
}) {
  const { user, fetchMe } = useAuthStore()
  const { fetchSetting } = useAdminStore()
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
    // Load social links — support both old object format and new array format
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
      // In dev seed mode, show a local preview via object URL
      setCoverUrl(URL.createObjectURL(file))
      setCoverUploading(false)
      return
    }
    try {
      const formData = new FormData()
      formData.append('cover', file)
      const res = await apiFetch<{ ok: boolean; cover_url: string }>('/api/settings/cover', { method: 'POST', body: formData })
      setCoverUrl(res.cover_url)
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
        handle,
        bio,
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
      await apiFetch('/api/settings/profile', {
        method: 'PATCH',
        body: JSON.stringify({
          public_profile_enabled: publicEnabled,
          handle,
          bio,
          cover_url: coverUrl,
          social_links: socialLinks.filter(l => l.url.trim()),
        }),
      })
      setSaved(true)
      await fetchMe()
      setTimeout(() => setSaved(false), 2000)
    } catch {}
    finally { setSaving(false) }
  }

  const platformInfo = (value: string) => platforms.find(p => p.value === value) || { value, label: value, icon: 'bx-link', placeholder: 'https://...' }

  return (
    <SettingsCard title="Public Profile" desc="Configure your public community profile visible at /@handle.">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: `1px solid var(--color-border)` }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-fg)' }}>Enable Public Profile</div>
          <div style={{ fontSize: 11, color: textDim, marginTop: 2 }}>Make your profile visible on the community page</div>
        </div>
        <button onClick={() => setPublicEnabled(!publicEnabled)} style={{ width: 44, height: 24, borderRadius: 100, border: 'none', cursor: 'pointer', background: publicEnabled ? 'linear-gradient(135deg, #00e5ff, #a900ff)' : 'var(--color-border)', position: 'relative', flexShrink: 0 }}>
          <span style={{ position: 'absolute', top: 3, left: publicEnabled ? 22 : 3, width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'left 0.15s' }} />
        </button>
      </div>
      <div style={{ marginTop: 16, marginBottom: 16 }}>
        <label style={labelSt}>Handle</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
          <span style={{ padding: '9px 10px 9px 12px', borderRadius: '9px 0 0 9px', border: `1px solid var(--color-border)`, borderRight: 'none', background: 'var(--color-bg-active)', color: textMuted, fontSize: 13 }}>@</span>
          <input style={{ ...inputSt, borderRadius: '0 9px 9px 0' }} value={handle} onChange={e => setHandle(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))} placeholder="username" />
        </div>
        <div style={{ fontSize: 11, color: textDim, marginTop: 4 }}>Your profile will be accessible at /@{handle || 'username'}</div>
      </div>
      <div style={{ marginBottom: 16 }}>
        <label style={labelSt}>Bio</label>
        <textarea style={{ ...inputSt, height: 80, resize: 'vertical' }} value={bio} onChange={e => setBio(e.target.value)} placeholder="Tell the community about yourself..." />
      </div>
      {/* Cover Image Upload */}
      <div style={{ marginBottom: 16 }}>
        <label style={labelSt}>Cover Image</label>
        {coverUrl && (
          <div style={{ position: 'relative', marginBottom: 8, borderRadius: 10, overflow: 'hidden', height: 120 }}>
            <img src={coverUrl} alt="Cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <button onClick={() => setCoverUrl('')} style={{ position: 'absolute', top: 6, right: 6, width: 24, height: 24, borderRadius: 6, border: 'none', background: 'rgba(0,0,0,0.5)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>
              <i className="bx bx-x" />
            </button>
          </div>
        )}
        <input ref={coverInputRef} type="file" accept="image/*" onChange={handleCoverUpload} style={{ display: 'none' }} />
        <button
          onClick={() => coverInputRef.current?.click()}
          disabled={coverUploading}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, border: `1px dashed ${cardBorder}`, background: 'transparent', color: textMuted, fontSize: 12, cursor: 'pointer', width: '100%', justifyContent: 'center' }}
        >
          <i className={`bx ${coverUploading ? 'bx-loader-alt bx-spin' : 'bx-cloud-upload'}`} style={{ fontSize: 16 }} />
          {coverUploading ? 'Uploading...' : coverUrl ? 'Change Cover Image' : 'Upload Cover Image'}
        </button>
      </div>
      {/* Social Links Repeater */}
      <div style={{ fontSize: 11, fontWeight: 600, color: textDim, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span>Social Links</span>
        <button onClick={addSocialLink} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 6, border: `1px solid ${cardBorder}`, background: 'transparent', color: textMuted, fontSize: 11, cursor: 'pointer', fontWeight: 500, textTransform: 'none', letterSpacing: 'normal' }}>
          <i className="bx bx-plus" style={{ fontSize: 13 }} /> Add
        </button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
        {socialLinks.length === 0 && (
          <div style={{ padding: '20px 16px', textAlign: 'center', color: textDim, fontSize: 12, border: `1px dashed ${cardBorder}`, borderRadius: 9 }}>
            No social links added yet. Click "Add" to get started.
          </div>
        )}
        {socialLinks.map((link, idx) => {
          const info = platformInfo(link.platform)
          return (
            <div key={idx} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button type="button" style={{ ...inputSt, width: 150, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', textAlign: 'start' }}>
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
                style={{ width: 32, height: 32, borderRadius: 7, border: '1px solid rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.05)', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
              >
                <i className="bx bx-trash" style={{ fontSize: 14 }} />
              </button>
            </div>
          )
        })}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button onClick={handleSave} disabled={saving} style={saveBtnSt}>{saving ? 'Saving...' : 'Save Changes'}</button>
        {saved && <span style={{ fontSize: 12, color: '#22c55e', display: 'flex', alignItems: 'center', gap: 4 }}><i className="bx bx-check-circle" /> Saved</span>}
      </div>
    </SettingsCard>
  )
}

export default function SettingsPage() {
  const { user, updateAvatarUrl, fetchMe } = useAuthStore()
  const { sessions, apiKeys, connectedAccounts, fetchSessions, revokeSession, fetchApiKeys, createApiKey, revokeApiKey, fetchConnectedAccounts, unlinkAccount } = useSettingsStore()
  const { can } = useRoleStore()
  const { fetchSetting, updateSetting, contentLocale, setContentLocale } = useAdminStore()
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
  const [pendingLanguage, setPendingLanguage] = useState(preferences.language)
  const [saved, setSaved] = useState(false)

  // Load profile metadata from user.settings on mount / user change
  useEffect(() => {
    let s: Record<string, unknown> | null = null
    if (user?.settings && typeof user.settings === 'object') {
      s = user.settings as Record<string, unknown>
    } else if (isDevSeed()) {
      try { s = JSON.parse(localStorage.getItem('orchestra_dev_settings') || 'null') } catch {}
      if (s) useAuthStore.setState({ user: { ...user!, settings: s } })
    }
    if (!s) return
    if (typeof s.phone === 'string') setPhone(s.phone)
    if (typeof s.gender === 'string') setGender(s.gender)
    if (typeof s.position === 'string') setPosition(s.position)
    if (typeof s.timezone === 'string') setTimezone(s.timezone)
  }, [user])

  // Sync pendingLanguage when preferences load from server
  useEffect(() => {
    setPendingLanguage(preferences.language)
  }, [preferences.language])

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
  const [testEmailSending, setTestEmailSending] = useState(false)
  const [testEmailResult, setTestEmailResult] = useState<{ ok: boolean; text: string } | null>(null)

  const [enabledProviders, setEnabledProviders] = useState<Record<string, boolean>>({})

  // User integrations (Discord/Slack per-user config)
  const [userIntegrations, setUserIntegrations] = useState<Record<string, { guild_id: string; channel_id: string; team_id: string; webhook_url: string }>>({})
  const [appInstallUrls, setAppInstallUrls] = useState<Record<string, { install_url: string; name: string }>>({})
  const [integrationSaving, setIntegrationSaving] = useState(false)
  const [integrationSaved, setIntegrationSaved] = useState(false)

  // Map tab IDs to setting keys (where they differ)
  const tabToSettingKey: Record<string, string> = { email: 'smtp', social: 'social_platforms' }

  // Translatable admin setting keys — these show locale tabs
  const TRANSLATABLE_SETTINGS = new Set(['general', 'homepage', 'agents', 'contact', 'pricing', 'seo'])

  function handleSettingsLocaleChange(locale: string) {
    setContentLocale(locale)
    // The useEffect on [tab, contentLocale] will re-fetch the setting
  }

  useEffect(() => {
    apiFetch<{ value: Record<string, unknown> }>('/api/public/settings/integrations', { skipAuth: true })
      .then(res => {
        const providers: Record<string, boolean> = {}
        for (const [k, v] of Object.entries(res.value ?? {})) {
          if (k.endsWith('_enabled')) providers[k.replace('_enabled', '')] = !!v
        }
        setEnabledProviders(providers)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (tab === 'sessions') fetchSessions()
    if (tab === 'apitokens') fetchApiKeys()
    if (tab === 'social') fetchConnectedAccounts()
    if (tab === 'integrations') {
      apiFetch<{ integrations: Array<{ provider: string; guild_id: string; channel_id: string; team_id: string; webhook_url: string }> }>('/api/settings/integrations/user')
        .then(res => {
          const map: Record<string, { guild_id: string; channel_id: string; team_id: string; webhook_url: string }> = {}
          for (const i of res.integrations ?? []) {
            map[i.provider] = { guild_id: i.guild_id, channel_id: i.channel_id, team_id: i.team_id, webhook_url: i.webhook_url }
          }
          setUserIntegrations(map)
        })
        .catch(() => {})
      apiFetch<{ apps: Record<string, { install_url: string; name: string }> }>('/api/settings/integrations/apps')
        .then(res => setAppInstallUrls(res.apps ?? {}))
        .catch(() => {})
    }
    if (tab.startsWith('admin-') && isAdmin) {
      const rawKey = tab.replace('admin-', '')
      const settingKey = tabToSettingKey[rawKey] ?? rawKey
      fetchSetting(settingKey).then(val => {
        if (val && Object.keys(val).length > 0) {
          setAdminSettings(prev => ({ ...prev, [settingKey]: val }))
        }
      }).catch(() => {})
    }
  }, [tab, contentLocale])

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
    if (isDevSeed()) {
      const newSettings = { ...(user?.settings as Record<string, unknown> ?? {}), name, email, phone, gender, position, timezone }
      useAuthStore.setState({ user: { ...user!, name, email, settings: newSettings } })
      localStorage.setItem('orchestra_dev_settings', JSON.stringify(newSettings))
      setSaved(true); setTimeout(() => setSaved(false), 2000); return
    }
    try {
      await apiFetch('/api/settings/profile', { method: 'PATCH', body: JSON.stringify({ name, email, phone, gender, position, timezone }) })
      await fetchMe() // refresh user in store so settings persist

      // Apply language change only on save — reload page to get correct translations and dir
      if (pendingLanguage !== preferences.language) {
        await updatePreference('language', pendingLanguage)
        window.location.reload()
        return
      }

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
      <div key={`${settingKey}-${field}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: `1px solid ${cardDivider}` }}>
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
                    value={pendingLanguage}
                    onChange={e => setPendingLanguage(e.target.value)}
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

            {/* Public Profile */}
            <PublicProfileSettings inputSt={inputSt} labelSt={labelSt} saveBtnSt={saveBtnSt} textDim={textDim} textMuted={textMuted} cardBorder={cardBorder} />

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
        {tab === 'passkeys' && <PasskeysTab textPrimary={textPrimary} textMuted={textMuted} textDim={textDim} cardBorder={cardBorder} saveBtnSt={saveBtnSt} SettingsCard={SettingsCard} />}

        {/* ── Connected Accounts ── */}
        {tab === 'social' && (
          <SettingsCard title={t('connectedAccountsTitle')} desc={t('connectedAccountsDesc')}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { provider: 'google', label: 'Google', icon: 'bxl-google', color: '#ea4335' },
                { provider: 'github', label: 'GitHub', icon: 'bxl-github', color: textPrimary },
                { provider: 'discord', label: 'Discord', icon: 'bxl-discord-alt', color: '#5865F2' },
                { provider: 'slack', label: 'Slack', icon: 'bxl-slack', color: '#4A154B' },
              ].filter(({ provider }) => enabledProviders[provider]).map(({ provider, label, icon, color }) => {
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

        {/* ── Integrations (User-Level Discord/Slack) ── */}
        {tab === 'integrations' && (
          <>
            {[
              { provider: 'discord', label: 'Discord', icon: 'bxl-discord-alt', color: '#5865F2', fields: [
                { key: 'guild_id', label: 'Server (Guild) ID' },
                { key: 'channel_id', label: 'Default Channel ID' },
                { key: 'webhook_url', label: 'Webhook URL', type: 'url' as const },
              ]},
              { provider: 'slack', label: 'Slack', icon: 'bxl-slack', color: '#4A154B', fields: [
                { key: 'team_id', label: 'Workspace (Team) ID' },
                { key: 'channel_id', label: 'Default Channel ID' },
                { key: 'webhook_url', label: 'Webhook URL', type: 'url' as const },
              ]},
            ].filter(p => enabledProviders[p.provider]).map(provider => {
              const data = userIntegrations[provider.provider] ?? { guild_id: '', channel_id: '', team_id: '', webhook_url: '' }
              const installUrl = appInstallUrls[provider.provider]?.install_url
              const connected = connectedAccounts.find(a => a.provider === provider.provider)
              return (
                <SettingsCard key={provider.provider} title={provider.label} desc={`Configure your ${provider.label} integration settings`}>
                  {/* Connection status + Add to Server */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, padding: '14px 16px', borderRadius: 10, border: `1px solid ${cardBorder}`, background: 'var(--color-bg-alt)' }}>
                    <div style={{ width: 38, height: 38, borderRadius: 9, background: 'var(--color-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <i className={`bx ${provider.icon}`} style={{ fontSize: 20, color: provider.color }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: textPrimary }}>
                        {connected ? `Connected as ${connected.name || connected.email}` : 'Not connected'}
                      </div>
                      <div style={{ fontSize: 11, color: textDim, marginTop: 2 }}>
                        {connected ? connected.email : `Connect your ${provider.label} account in Connected Accounts`}
                      </div>
                    </div>
                    {installUrl && (
                      <a
                        href={installUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: 6,
                          padding: '7px 14px', borderRadius: 8, border: 'none', fontSize: 12, fontWeight: 600,
                          background: provider.color, color: '#fff', textDecoration: 'none', cursor: 'pointer', flexShrink: 0,
                        }}
                      >
                        <i className="bx bx-plus" style={{ fontSize: 14 }} />
                        {provider.provider === 'discord' ? 'Add to Server' : 'Add to Workspace'}
                      </a>
                    )}
                  </div>

                  {/* Config fields */}
                  {provider.fields.map(field => (
                    <div key={field.key} style={{ marginBottom: 14 }}>
                      <label style={labelSt}>{field.label}</label>
                      <input
                        style={inputSt}
                        type={field.type || 'text'}
                        value={(data as Record<string, string>)[field.key] ?? ''}
                        onChange={e => setUserIntegrations(prev => ({
                          ...prev,
                          [provider.provider]: { ...prev[provider.provider], [field.key]: e.target.value },
                        }))}
                        placeholder={field.label}
                      />
                    </div>
                  ))}

                  {/* Save / Remove */}
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 8 }}>
                    <button
                      disabled={integrationSaving}
                      onClick={async () => {
                        setIntegrationSaving(true)
                        try {
                          await apiFetch(`/api/settings/integrations/user/${provider.provider}`, {
                            method: 'PUT',
                            body: JSON.stringify(userIntegrations[provider.provider] ?? {}),
                          })
                          setIntegrationSaved(true); setTimeout(() => setIntegrationSaved(false), 2000)
                        } catch {} finally { setIntegrationSaving(false) }
                      }}
                      style={saveBtnSt}
                    >
                      {integrationSaving ? t('saving') : t('saveChanges')}
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          await apiFetch(`/api/settings/integrations/user/${provider.provider}`, { method: 'DELETE' })
                          setUserIntegrations(prev => { const n = { ...prev }; delete n[provider.provider]; return n })
                        } catch {}
                      }}
                      style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid rgba(239,68,68,0.25)', background: 'rgba(239,68,68,0.07)', color: '#ef4444', fontSize: 13, cursor: 'pointer' }}
                    >
                      Remove
                    </button>
                    {integrationSaved && <span style={{ fontSize: 12, color: '#22c55e', display: 'flex', alignItems: 'center', gap: 4 }}><i className="bx bx-check-circle" /> {t('saved')}</span>}
                  </div>
                </SettingsCard>
              )
            })}
            {Object.keys(enabledProviders).filter(k => enabledProviders[k] && (k === 'discord' || k === 'slack')).length === 0 && (
              <SettingsCard title="Integrations">
                <div style={{ textAlign: 'center', padding: '40px 0', color: textDim, fontSize: 13 }}>
                  <i className="bx bx-plug" style={{ fontSize: 32, display: 'block', marginBottom: 10 }} />
                  No integrations available. Ask your admin to enable Discord or Slack.
                </div>
              </SettingsCard>
            )}
          </>
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

        {/* ── AI Copilot ── */}
        {tab === 'copilot' && <CopilotSettingsTab textPrimary={textPrimary} textDim={textDim} cardBorder={cardBorder} cardDivider={cardDivider} labelSt={labelSt} saveBtnSt={saveBtnSt} SettingsCard={SettingsCard} />}

        {/* ── Admin: General ── */}
        {tab === 'admin-general' && isAdmin && (
          <SettingsCard title={t('adminGeneralTitle')} desc={t('adminGeneralDesc')}>
            <ContentLocaleTabs activeLocale={contentLocale} onChange={handleSettingsLocaleChange} />
            {adminField('general', 'site_name', t('generalSiteName'))}
            {adminField('general', 'tagline', t('generalTagline'))}
            {adminField('general', 'url', t('generalSiteUrl'), 'url')}
            {adminField('general', 'support_email', t('generalSupportEmail'), 'email')}
            {adminToggle('general', 'maintenance_mode', t('generalMaintenanceMode'), t('generalMaintenanceModeDesc'))}
            <SaveRow settingKey="general" />
            <div style={{ marginTop: 20, padding: '16px', borderRadius: 10, border: `1px solid ${cardDivider}`, background: cardBg }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: textPrimary, marginBottom: 6 }}>{t('seedAllDefaults')}</div>
              <div style={{ fontSize: 12, color: textDim, marginBottom: 12 }}>{t('seedAllDesc')}</div>
              <button
                style={{ padding: '8px 16px', borderRadius: 8, border: `1px solid ${cardBorder}`, background: 'transparent', color: textPrimary, fontSize: 13, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                onClick={async () => {
                  try {
                    const res = await apiFetch<{ ok: boolean; count: number; seeded: string[] }>('/api/admin/settings/seed', { method: 'POST' })
                    setAdminSaved(true); setTimeout(() => setAdminSaved(false), 3000)
                    // Reload current tab setting
                    const rawKey = tab.replace('admin-', '')
                    const settingKey = tabToSettingKey[rawKey] ?? rawKey
                    const val = await fetchSetting(settingKey)
                    if (val) setAdminSettings(p => ({ ...p, [settingKey]: val }))
                  } catch {}
                }}
              >
                <i className="bx bx-data" style={{ fontSize: 15 }} /> {t('seedAllDefaults')}
              </button>
            </div>
          </SettingsCard>
        )}

        {/* ── Admin: Features ── */}
        {tab === 'admin-features' && isAdmin && (
          <SettingsCard title={t('adminFeaturesTitle')} desc={t('adminFeaturesDesc')}>
            <div style={{ fontSize: 11, fontWeight: 600, color: textDim, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 8 }}>{t('platformFeatures')}</div>
            {[
              { key: 'rag', label: t('featureRag'), desc: t('featureRagDesc') },
              { key: 'multi_agent', label: t('featureMultiAgent'), desc: t('featureMultiAgentDesc') },
              { key: 'marketplace', label: t('featureMarketplace'), desc: t('featureMarketplaceDesc') },
              { key: 'quic_bridge', label: t('featureQuicBridge'), desc: t('featureQuicBridgeDesc') },
              { key: 'web_gateway', label: t('featureWebGateway'), desc: t('featureWebGatewayDesc') },
              { key: 'packs', label: t('featurePacks'), desc: t('featurePacksDesc') },
            ].map(f => adminToggle('features', f.key, f.label, f.desc))}
            <div style={{ fontSize: 11, fontWeight: 600, color: textDim, letterSpacing: '0.07em', textTransform: 'uppercase', marginTop: 24, marginBottom: 8 }}>{t('userPages')}</div>
            {[
              { key: 'projects', label: t('featureProjects'), desc: t('featureProjectsDesc') },
              { key: 'notes', label: t('featureNotes'), desc: t('featureNotesDesc') },
              { key: 'plans', label: t('featurePlans'), desc: t('featurePlansDesc') },
              { key: 'wiki', label: t('featureWiki'), desc: t('featureWikiDesc') },
              { key: 'devtools', label: t('featureDevTools'), desc: t('featureDevToolsDesc') },
            ].map(f => adminToggle('features', f.key, f.label, f.desc))}
            <div style={{ fontSize: 11, fontWeight: 600, color: textDim, letterSpacing: '0.07em', textTransform: 'uppercase', marginTop: 24, marginBottom: 8 }}>Public Pages</div>
            {[
              { key: 'sponsors', label: 'Sponsors', desc: 'Show sponsors page on the public site' },
              { key: 'community', label: 'Community', desc: 'Enable community profiles and posts' },
              { key: 'issues', label: 'GitHub Issues', desc: 'Show GitHub issues page on the public site' },
            ].map(f => adminToggle('features', f.key, f.label, f.desc))}
            <SaveRow settingKey="features" />
          </SettingsCard>
        )}

        {/* ── Admin: Home Page ── */}
        {tab === 'admin-homepage' && isAdmin && (
          <SettingsCard title={t('adminHomepageTitle')} desc={t('adminHomepageDesc')}>
            <ContentLocaleTabs activeLocale={contentLocale} onChange={handleSettingsLocaleChange} />
            {adminField('homepage', 'hero_headline', t('homepageHeroHeadline'))}
            {adminField('homepage', 'hero_subtext', t('homepageHeroSubtext'), 'textarea')}
            {adminField('homepage', 'cta_primary', t('homepageCtaPrimary'))}
            {adminField('homepage', 'cta_secondary', t('homepageCtaSecondary'))}
            {adminField('homepage', 'stats_tools', t('homepageStatsTools'))}
            {adminField('homepage', 'stats_plugins', t('homepageStatsPlugins'))}
            {adminField('homepage', 'stats_platforms', t('homepageStatsPlatforms'))}
            {adminField('homepage', 'stats_packs', t('homepageStatsPacks'))}
            <SaveRow settingKey="homepage" />
          </SettingsCard>
        )}

        {/* ── Admin: Agents ── */}
        {tab === 'admin-agents' && isAdmin && (
          <SettingsCard title={t('adminAgentsTitle')} desc={t('adminAgentsDesc')}>
            <ContentLocaleTabs activeLocale={contentLocale} onChange={handleSettingsLocaleChange} />
            {adminField('agents', 'headline', t('agentsHeadline'))}
            {adminField('agents', 'subtext', t('agentsSubtext'), 'textarea')}
            {adminField('agents', 'featured_ids', t('agentsFeaturedIds'))}
            <SaveRow settingKey="agents" />
          </SettingsCard>
        )}

        {/* ── Admin: Contact ── */}
        {tab === 'admin-contact' && isAdmin && (
          <SettingsCard title={t('adminContactTitle')} desc={t('adminContactDesc')}>
            <ContentLocaleTabs activeLocale={contentLocale} onChange={handleSettingsLocaleChange} />
            {adminField('contact', 'headline', t('contactHeadline'))}
            {adminField('contact', 'support_email', t('contactSupportEmail'), 'email')}
            {adminField('contact', 'hours', t('contactHours'))}
            {adminField('contact', 'twitter', t('contactTwitter'), 'url')}
            {adminField('contact', 'github', t('contactGithub'), 'url')}
            {adminField('contact', 'discord', t('contactDiscord'), 'url')}
            <SaveRow settingKey="contact" />
          </SettingsCard>
        )}

        {/* ── Admin: Pricing ── */}
        {tab === 'admin-pricing' && isAdmin && (
          <SettingsCard title={t('adminPricingTitle')} desc={t('adminPricingDesc')}>
            <ContentLocaleTabs activeLocale={contentLocale} onChange={handleSettingsLocaleChange} />
            {(['free', 'pro', 'enterprise'] as const).map(plan => (
              <div key={plan} style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: textPrimary, marginBottom: 10, paddingBottom: 8, borderBottom: `1px solid ${cardDivider}`, textTransform: 'capitalize' }}>{plan} Plan</div>
                {adminField('pricing', `${plan}_name`, t('pricingPlanName'))}
                {adminField('pricing', `${plan}_price`, t('pricingPrice'), 'text')}
                {adminField('pricing', `${plan}_period`, t('pricingPeriod'))}
                {adminField('pricing', `${plan}_cta`, t('pricingCta'))}
                {adminField('pricing', `${plan}_features`, t('pricingFeatures'), 'textarea')}
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
                {adminField('download', `${platform}_url`, t('downloadUrl'), 'url')}
                {adminField('download', `${platform}_version`, t('downloadVersion'))}
                {adminField('download', `${platform}_release_date`, t('downloadReleaseDate'))}
              </div>
            ))}
            <SaveRow settingKey="download" />
          </SettingsCard>
        )}

        {/* ── Admin: Integrations ── */}
        {tab === 'admin-integrations' && isAdmin && (
          <>
            {([
              { key: 'google', label: 'Google OAuth', icon: 'bxl-google', color: '#ea4335', desc: 'Allow users to sign in with their Google account' },
              { key: 'github', label: 'GitHub OAuth', icon: 'bxl-github', color: textPrimary, desc: 'Allow users to sign in with their GitHub account' },
              { key: 'discord', label: 'Discord OAuth', icon: 'bxl-discord-alt', color: '#5865F2', desc: 'Allow users to sign in with their Discord account' },
              { key: 'slack', label: 'Slack OAuth', icon: 'bxl-slack', color: '#4A154B', desc: 'Allow users to sign in with their Slack account' },
            ] as const).map(provider => {
              const enabled = !!(adminSettings.integrations?.[`${provider.key}_enabled`])
              return (
                <SettingsCard key={provider.key} title={provider.label} desc={provider.desc}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: enabled ? 16 : 0 }}>
                    <span style={{ fontSize: 13, color: textMuted }}>{enabled ? 'Enabled' : 'Disabled'}</span>
                    <button onClick={() => setAdminSettings(p => ({ ...p, integrations: { ...p.integrations, [`${provider.key}_enabled`]: !enabled } }))} style={{ width: 44, height: 24, borderRadius: 100, border: 'none', cursor: 'pointer', background: enabled ? 'linear-gradient(135deg, #00e5ff, #a900ff)' : 'var(--color-border)', position: 'relative', flexShrink: 0 }}>
                      <span style={{ position: 'absolute', top: 3, left: enabled ? 22 : 3, width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'left 0.15s' }} />
                    </button>
                  </div>
                  {enabled && (
                    <div style={{ paddingTop: 16, borderTop: `1px solid ${cardDivider}` }}>
                      {adminField('integrations', `${provider.key}_client_id`, t('integrationsClientId'))}
                      {adminField('integrations', `${provider.key}_client_secret`, t('integrationsClientSecret'))}
                    </div>
                  )}
                </SettingsCard>
              )
            })}
            <div style={{ marginTop: 8 }}>
              <SaveRow settingKey="integrations" />
            </div>
          </>
        )}

        {/* ── Admin: Email / SMTP ── */}
        {tab === 'admin-email' && isAdmin && (
          <SettingsCard title={t('adminEmailTitle')} desc={t('adminEmailDesc')}>
            {adminField('smtp', 'host', t('smtpHost'))}
            {adminField('smtp', 'port', t('smtpPort'), 'number')}
            {adminField('smtp', 'username', t('smtpUsername'))}
            {adminField('smtp', 'password', t('smtpPassword'))}
            {adminField('smtp', 'from_name', t('smtpFromName'))}
            {adminField('smtp', 'from_email', t('smtpFromEmail'), 'email')}
            <div style={{ marginTop: 14, display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
              <button style={saveBtnSt} onClick={() => handleSaveAdminSetting('smtp')}>{t('saveChanges')}</button>
              <button
                style={{ padding: '8px 16px', borderRadius: 8, border: `1px solid ${cardBorder}`, background: 'transparent', color: textPrimary, fontSize: 13, fontWeight: 500, cursor: testEmailSending ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 6, opacity: testEmailSending ? 0.6 : 1 }}
                disabled={testEmailSending}
                onClick={async () => {
                  setTestEmailSending(true); setTestEmailResult(null)
                  try {
                    // Save SMTP settings first, then send test
                    await handleSaveAdminSetting('smtp')
                    const res = await apiFetch<{ ok: boolean; sent_to?: string; error?: string }>('/api/admin/settings/test-email', { method: 'POST' })
                    setTestEmailResult({ ok: true, text: `Test email sent to ${res.sent_to}` })
                  } catch (e: any) {
                    setTestEmailResult({ ok: false, text: e?.message || 'Failed to send test email' })
                  } finally { setTestEmailSending(false) }
                }}
              >
                <i className="bx bx-paper-plane" style={{ fontSize: 14 }} />
                {testEmailSending ? 'Sending...' : t('sendTestEmail')}
              </button>
              {adminSaved && <span style={{ fontSize: 12, color: '#22c55e', display: 'flex', alignItems: 'center', gap: 4 }}><i className="bx bx-check-circle" /> {t('saved')}</span>}
              {testEmailResult && (
                <span style={{ fontSize: 12, color: testEmailResult.ok ? '#22c55e' : '#ef4444', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <i className={`bx ${testEmailResult.ok ? 'bx-check-circle' : 'bx-error-circle'}`} />
                  {testEmailResult.text}
                </span>
              )}
            </div>
          </SettingsCard>
        )}

        {/* ── Admin: SEO ── */}
        {tab === 'admin-seo' && isAdmin && (
          <SettingsCard title={t('adminSEOTitle')} desc={t('adminSEODesc')}>
            <ContentLocaleTabs activeLocale={contentLocale} onChange={handleSettingsLocaleChange} />
            {adminField('seo', 'title_template', t('seoTitleTemplate'))}
            {adminField('seo', 'meta_description', t('seoMetaDescription'), 'textarea')}
            {adminField('seo', 'og_image_url', t('seoOgImageUrl'), 'url')}
            {adminField('seo', 'robots_txt', t('seoRobotsTxt'), 'textarea')}
            {adminField('seo', 'sitemap_url', t('seoSitemapUrl'), 'url')}
            <div style={{ marginTop: 20, padding: '16px', borderRadius: 10, border: `1px solid ${cardDivider}`, background: cardBg }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: textPrimary, marginBottom: 6 }}>{t('seoGenerateSitemap')}</div>
              <div style={{ fontSize: 12, color: textDim, marginBottom: 12 }}>{t('seoSitemapPreview')}</div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <button
                  style={{ padding: '8px 16px', borderRadius: 8, border: `1px solid ${cardBorder}`, background: 'transparent', color: textPrimary, fontSize: 13, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                  onClick={async () => {
                    try {
                      const res = await apiFetch<{ ok: boolean; sitemap: string }>('/api/admin/settings/generate-sitemap', { method: 'POST' })
                      if (res.sitemap) {
                        setAdminSettings(p => ({ ...p, seo: { ...p.seo, generated_sitemap: res.sitemap } }))
                      }
                    } catch {}
                  }}
                >
                  <i className="bx bx-sitemap" style={{ fontSize: 15 }} /> {t('seoGenerateSitemap')}
                </button>
                {(adminSettings.seo?.generated_sitemap as string) && (
                  <button
                    style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, #00e5ff, #a900ff)', color: '#fff', fontSize: 13, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                    onClick={() => {
                      const blob = new Blob([adminSettings.seo?.generated_sitemap as string], { type: 'application/xml' })
                      const url = URL.createObjectURL(blob)
                      const a = document.createElement('a')
                      a.href = url; a.download = 'sitemap.xml'; a.click()
                      URL.revokeObjectURL(url)
                    }}
                  >
                    <i className="bx bx-download" style={{ fontSize: 15 }} /> {t('seoDownloadSitemap')}
                  </button>
                )}
              </div>
              {(adminSettings.seo?.generated_sitemap as string) && (
                <pre style={{ marginTop: 12, padding: 12, borderRadius: 8, background: 'var(--color-bg)', border: `1px solid ${cardDivider}`, fontSize: 11, color: textDim, overflow: 'auto', maxHeight: 200, whiteSpace: 'pre-wrap' }}>
                  {adminSettings.seo?.generated_sitemap as string}
                </pre>
              )}
            </div>
            <SaveRow settingKey="seo" />
          </SettingsCard>
        )}

        {/* ── Admin: Discord Bot ── */}
        {tab === 'admin-discord' && isAdmin && (
          <SettingsCard title={t('adminDiscordTitle')} desc={t('adminDiscordDesc')}>
            <div style={{ marginBottom: 20 }}>
              {adminToggle('discord', 'enabled', t('discordEnabled'), t('discordEnabledDesc'))}
              {adminField('discord', 'bot_token', t('discordBotToken'))}
              {adminField('discord', 'application_id', t('discordAppId'))}
              {adminField('discord', 'guild_id', t('discordGuildId'))}
              {adminField('discord', 'channel_id', t('discordChannelId'))}
              {adminField('discord', 'command_prefix', t('discordCommandPrefix'))}
              {adminField('discord', 'webhook_url', t('discordWebhookUrl'), 'url')}
            </div>
            <div style={{ marginBottom: 20 }}>
              {adminField('discord', 'allowed_users', t('discordAllowedUsers'), 'textarea')}
            </div>
            <SaveRow settingKey="discord" />
          </SettingsCard>
        )}

        {/* ── Admin: Slack Bot ── */}
        {tab === 'admin-slack' && isAdmin && (
          <SettingsCard title={t('adminSlackTitle')} desc={t('adminSlackDesc')}>
            <div style={{ marginBottom: 20 }}>
              {adminToggle('slack', 'enabled', t('slackEnabled'), t('slackEnabledDesc'))}
              {adminField('slack', 'bot_token', t('slackBotToken'))}
              {adminField('slack', 'app_token', t('slackAppToken'))}
              {adminField('slack', 'signing_secret', t('slackSigningSecret'))}
              {adminField('slack', 'app_id', t('slackAppId'))}
              {adminField('slack', 'channel_id', t('slackChannelId'))}
              {adminField('slack', 'team_id', t('slackTeamId'))}
              {adminField('slack', 'command_prefix', t('slackCommandPrefix'))}
              {adminField('slack', 'webhook_url', t('slackWebhookUrl'), 'url')}
            </div>
            <div style={{ marginBottom: 20 }}>
              {adminField('slack', 'allowed_users', t('slackAllowedUsers'), 'textarea')}
            </div>
            <SaveRow settingKey="slack" />
          </SettingsCard>
        )}

        {/* ── Admin: GitHub ── */}
        {tab === 'admin-github' && isAdmin && (
          <SettingsCard title="GitHub Integration" desc="Connect GitHub repositories for the public issues page.">
            {adminField('github', 'token', 'Personal Access Token')}
            {adminField('github', 'default_repos', 'Default Repositories', 'textarea')}
            <div style={{ fontSize: 11, color: textDim, marginTop: -8, marginBottom: 12 }}>Comma-separated, e.g. orchestra-mcp/framework, orchestra-mcp/cli</div>
            {adminField('github', 'sync_interval', 'Sync Interval (minutes)')}
            <SaveRow settingKey="github" />
          </SettingsCard>
        )}

        {/* ── Admin: Social Platforms ── */}
        {tab === 'admin-social' && isAdmin && (
          <SocialPlatformsAdmin
            adminSettings={adminSettings}
            setAdminSettings={setAdminSettings}
            handleSaveAdminSetting={handleSaveAdminSetting}
            adminSaving={adminSaving}
            adminSaved={adminSaved}
            inputSt={inputSt}
            labelSt={labelSt}
            saveBtnSt={saveBtnSt}
            textDim={textDim}
            textMuted={textMuted}
            textPrimary={textPrimary}
            cardBorder={cardBorder}
          />
        )}

    </div>
  )
}

/* ── AI Copilot Settings Tab ─────────────────────────────── */

const DOCK_MODES: { id: CopilotDockMode; label: string; desc: string; icon: string }[] = [
  { id: 'bubble', label: 'Bubble', desc: 'Floating draggable window', icon: 'bx-chat' },
  { id: 'sideover', label: 'Side Panel', desc: 'Docked to right edge', icon: 'bx-dock-right' },
  { id: 'modal', label: 'Modal', desc: 'Centered overlay dialog', icon: 'bx-window' },
  { id: 'fullscreen', label: 'Fullscreen', desc: 'Replaces main content area', icon: 'bx-fullscreen' },
]

const ICON_STYLES: { id: 'bot' | 'chat' | 'sparkle'; label: string; icon: string }[] = [
  { id: 'bot', label: 'Robot', icon: 'bx-bot' },
  { id: 'chat', label: 'Chat', icon: 'bx-chat' },
  { id: 'sparkle', label: 'Sparkle', icon: 'bx-star' },
]

const CHAT_MODES_LIST: { id: 'auto' | 'plan' | 'manual'; label: string; desc: string }[] = [
  { id: 'auto', label: 'Auto', desc: 'AI decides when to edit or plan' },
  { id: 'plan', label: 'Plan', desc: 'AI asks before making changes' },
  { id: 'manual', label: 'Manual', desc: 'Full manual control' },
]

function CopilotSettingsTab({ textPrimary, textDim, cardBorder, cardDivider, labelSt, saveBtnSt, SettingsCard }: {
  textPrimary: string; textDim: string; cardBorder: string; cardDivider: string
  labelSt: React.CSSProperties; saveBtnSt: React.CSSProperties
  SettingsCard: React.ComponentType<{ title: string; desc?: string; children: React.ReactNode }>
}) {
  const copilotMode = useChatStore(s => s.copilotMode)
  const setCopilotMode = useChatStore(s => s.setCopilotMode)
  const chatIconStyle = useChatStore(s => s.chatIconStyle)
  const setChatIconStyle = useChatStore(s => s.setChatIconStyle)
  const selectedModelId = useChatStore(s => s.selectedModelId)
  const setSelectedModelId = useChatStore(s => s.setSelectedModelId)
  const chatMode = useChatStore(s => s.chatMode)
  const setChatMode = useChatStore(s => s.setChatMode)
  const accounts = useChatStore(s => s.accounts)
  const userStartupPrompts = useChatStore(s => s.userStartupPrompts)
  const setUserStartupPrompts = useChatStore(s => s.setUserStartupPrompts)
  const userQuickActions = useChatStore(s => s.userQuickActions)
  const setUserQuickActions = useChatStore(s => s.setUserQuickActions)

  return (
    <>
      {/* Dock Mode */}
      <SettingsCard title="Dock Mode" desc="Choose how the AI copilot window appears">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 10 }}>
          {DOCK_MODES.map(m => (
            <button
              key={m.id}
              type="button"
              onClick={() => setCopilotMode(m.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px',
                borderRadius: 10, cursor: 'pointer', textAlign: 'left',
                border: copilotMode === m.id ? '2px solid var(--color-accent)' : `1px solid ${cardBorder}`,
                background: copilotMode === m.id ? 'color-mix(in srgb, var(--color-accent) 8%, transparent)' : 'transparent',
                color: textPrimary,
              }}
            >
              <i className={`bx ${m.icon}`} style={{ fontSize: 20, color: copilotMode === m.id ? 'var(--color-accent)' : textDim, flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{m.label}</div>
                <div style={{ fontSize: 11, color: textDim, marginTop: 2 }}>{m.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </SettingsCard>

      {/* Chat Icon */}
      <SettingsCard title="Chat Icon" desc="Choose the icon style for the copilot bubble button">
        <div style={{ display: 'flex', gap: 10 }}>
          {ICON_STYLES.map(s => (
            <button
              key={s.id}
              type="button"
              onClick={() => setChatIconStyle(s.id)}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                padding: '14px 20px', borderRadius: 10, cursor: 'pointer',
                border: chatIconStyle === s.id ? '2px solid var(--color-accent)' : `1px solid ${cardBorder}`,
                background: chatIconStyle === s.id ? 'color-mix(in srgb, var(--color-accent) 8%, transparent)' : 'transparent',
                color: textPrimary, minWidth: 80,
              }}
            >
              <i className={`bx ${s.icon}`} style={{ fontSize: 24, color: chatIconStyle === s.id ? 'var(--color-accent)' : textDim }} />
              <span style={{ fontSize: 12, fontWeight: 500 }}>{s.label}</span>
            </button>
          ))}
        </div>
      </SettingsCard>

      {/* Default Model */}
      {accounts.length > 0 && (
        <SettingsCard title="Default Model" desc="Select which AI model to use by default">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {accounts.map(acc => (
              <label
                key={acc.id}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                  borderRadius: 9, cursor: 'pointer',
                  border: selectedModelId === acc.id ? '2px solid var(--color-accent)' : `1px solid ${cardBorder}`,
                  background: selectedModelId === acc.id ? 'color-mix(in srgb, var(--color-accent) 8%, transparent)' : 'transparent',
                }}
              >
                <input
                  type="radio"
                  name="copilot-model"
                  checked={selectedModelId === acc.id}
                  onChange={() => setSelectedModelId(acc.id)}
                  style={{ accentColor: 'var(--color-accent)' }}
                />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: textPrimary }}>{acc.name}</div>
                  {acc.model && <div style={{ fontSize: 11, color: textDim, marginTop: 1 }}>{acc.model}</div>}
                </div>
              </label>
            ))}
          </div>
        </SettingsCard>
      )}

      {/* Default Chat Mode */}
      <SettingsCard title="Default Chat Mode" desc="Control how the AI behaves when you send a message">
        <div style={{ display: 'flex', gap: 10 }}>
          {CHAT_MODES_LIST.map(m => (
            <button
              key={m.id}
              type="button"
              onClick={() => setChatMode(m.id)}
              style={{
                flex: 1, padding: '12px 14px', borderRadius: 10, cursor: 'pointer', textAlign: 'center',
                border: chatMode === m.id ? '2px solid var(--color-accent)' : `1px solid ${cardBorder}`,
                background: chatMode === m.id ? 'color-mix(in srgb, var(--color-accent) 8%, transparent)' : 'transparent',
                color: textPrimary,
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 600 }}>{m.label}</div>
              <div style={{ fontSize: 11, color: textDim, marginTop: 4 }}>{m.desc}</div>
            </button>
          ))}
        </div>
      </SettingsCard>

      {/* Startup Prompts */}
      <SettingsCard title="Startup Prompts" desc="Customize the prompt cards shown when starting a new chat">
        <PromptCardEditor
          value={userStartupPrompts as PromptCard[]}
          onChange={(cards) => setUserStartupPrompts(cards.map(c => ({
            id: c.id,
            title: c.title || '',
            description: c.description,
            prompt: c.prompt || '',
            color: c.color,
            icon: c.icon,
          })))}
          fields={[
            { key: 'title', label: 'Title', placeholder: 'e.g. Project Status' },
            { key: 'description', label: 'Description', placeholder: 'Short description' },
            { key: 'prompt', label: 'Prompt', placeholder: 'The message to send', type: 'textarea' },
          ]}
          previewMode="prompts"
        />
        {userStartupPrompts.length > 0 && (
          <button
            type="button"
            onClick={() => setUserStartupPrompts([])}
            style={{ marginTop: 12, padding: '6px 14px', borderRadius: 7, border: `1px solid ${cardBorder}`, background: 'transparent', color: textDim, fontSize: 12, cursor: 'pointer' }}
          >
            Reset to defaults
          </button>
        )}
      </SettingsCard>

      {/* Quick Actions */}
      <SettingsCard title="Quick Actions" desc="Customize the action chips shown above the chat input">
        <PromptCardEditor
          value={userQuickActions as PromptCard[]}
          onChange={(cards) => setUserQuickActions(cards.map(c => ({
            id: c.id,
            label: c.label || '',
            prompt: c.prompt || '',
            color: c.color,
            icon: c.icon,
          })))}
          fields={[
            { key: 'label', label: 'Label', placeholder: 'e.g. Run Tests' },
            { key: 'prompt', label: 'Prompt', placeholder: 'The message to send', type: 'textarea' },
          ]}
          previewMode="actions"
        />
        {userQuickActions.length > 0 && (
          <button
            type="button"
            onClick={() => setUserQuickActions([])}
            style={{ marginTop: 12, padding: '6px 14px', borderRadius: 7, border: `1px solid ${cardBorder}`, background: 'transparent', color: textDim, fontSize: 12, cursor: 'pointer' }}
          >
            Reset to defaults
          </button>
        )}
      </SettingsCard>
    </>
  )
}
