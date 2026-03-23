'use client'
import { useState, useEffect, useCallback } from 'react'
import { useAdminStore } from '@/store/admin'
import { useRoleStore } from '@/store/roles'
import { createClient } from '@/lib/supabase/client'
import { ContentLocaleTabs } from '@/components/ui/content-locale-tabs'
import ProfileCard from '@/components/profile/profile-card'
import { Switch } from '@orchestra-mcp/ui'

const inputSt: React.CSSProperties = { width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid var(--color-border)', background: 'var(--color-bg-alt)', color: 'var(--color-fg)', fontSize: 13, outline: 'none', boxSizing: 'border-box' }
const labelSt: React.CSSProperties = { fontSize: 12, fontWeight: 500, color: 'var(--color-fg-muted)', marginBottom: 6, display: 'block' }
const saveBtnSt: React.CSSProperties = { padding: '8px 20px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, #00e5ff, #a900ff)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }

export interface FieldDef {
  key: string
  label: string
  type?: 'text' | 'email' | 'url' | 'number' | 'textarea' | 'toggle'
}

interface Props {
  settingKey: string
  title: string
  fields: FieldDef[]
  showLocale?: boolean
  defaults?: Record<string, unknown>
}

export default function AdminSettingsForm({ settingKey, title, fields, showLocale = true, defaults }: Props) {
  const { fetchSetting, updateSetting, contentLocale, setContentLocale } = useAdminStore()
  const { can } = useRoleStore()
  const [values, setValues] = useState<Record<string, unknown>>(defaults ?? {})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loaded, setLoaded] = useState(false)

  const load = useCallback(async () => {
    try {
      const val = await fetchSetting(settingKey)
      if (val && typeof val === 'object') {
        const merged = { ...(defaults ?? {}), ...(val as Record<string, unknown>) }
        setValues(merged)
      }
    } catch {}
    setLoaded(true)
  }, [settingKey, fetchSetting])

  useEffect(() => { load() }, [load, contentLocale])

  const update = (field: string, val: unknown) => {
    setValues(prev => ({ ...prev, [field]: val }))
  }

  const save = async () => {
    setSaving(true)
    try {
      const sb = createClient()

      // Upsert the setting into the settings table
      const { error } = await sb
        .from('system_settings')
        .upsert(
          { key: `${settingKey}:${contentLocale}`, value: values },
          { onConflict: 'key' }
        )
      if (error) throw new Error(error.message)

      // Sync standalone settings that have their own keys
      if (settingKey === 'general' && 'coming_soon' in values) {
        const { error: csError } = await sb
          .from('system_settings')
          .upsert(
            {
              key: `coming_soon:${contentLocale}`,
              value: { enabled: !!(values.coming_soon), title: 'Coming Soon', message: "We're putting the finishing touches on something amazing. Stay tuned!" },
            },
            { onConflict: 'key' }
          )
        if (csError) throw new Error(csError.message)
      }
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (e) {
      alert('Save failed: ' + (e as Error).message)
    }
    setSaving(false)
  }

  if (!can('canViewAdmin')) {
    return (
      <ProfileCard variant="default" style={{ padding: 24 }}>
        <p style={{ color: 'var(--color-fg-muted)', fontSize: 13 }}>Access denied. Admin role required.</p>
      </ProfileCard>
    )
  }

  return (
    <ProfileCard variant="default" style={{ padding: 24 }}>
      <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-fg)', marginBottom: 20 }}>{title}</h3>

      {showLocale && (
        <div style={{ marginBottom: 20 }}>
          <ContentLocaleTabs activeLocale={contentLocale} onChange={setContentLocale} />
        </div>
      )}

      {!loaded ? (
        <div style={{ padding: 20, fontSize: 13, color: 'var(--color-fg-dim)' }}>Loading...</div>
      ) : (
        <>
          {fields.map(field => {
            if (field.type === 'toggle') {
              return (
                <div key={field.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--color-border)' }}>
                  <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-fg)' }}>{field.label}</label>
                  <Switch
                    checked={!!(values[field.key])}
                    onChange={(v: boolean) => update(field.key, v)}
                  />
                </div>
              )
            }

            const val = (values[field.key] as string) ?? ''
            return (
              <div key={field.key} style={{ marginBottom: 14 }}>
                <label style={labelSt}>{field.label}</label>
                {field.type === 'textarea' ? (
                  <textarea
                    style={{ ...inputSt, height: 80, resize: 'vertical' }}
                    value={val}
                    onChange={e => update(field.key, e.target.value)}
                  />
                ) : (
                  <input
                    style={inputSt}
                    type={field.type ?? 'text'}
                    value={val}
                    onChange={e => update(field.key, e.target.value)}
                  />
                )}
              </div>
            )
          })}

          <div style={{ marginTop: 20, display: 'flex', gap: 12, alignItems: 'center' }}>
            <button type="button" style={{ ...saveBtnSt, opacity: saving ? 0.6 : 1 }} onClick={save}>
              {saving ? 'Saving...' : 'Save'}
            </button>
            {saved && <span style={{ fontSize: 12, color: '#22c55e' }}>Saved!</span>}
          </div>
        </>
      )}
    </ProfileCard>
  )
}
