'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useRoleStore } from '@/store/roles'
import { apiFetch, isDevSeed } from '@/lib/api'
import { useTranslations } from 'next-intl'

export default function NewTeamPage() {
  const router = useRouter()
  const { fetchAllTeams, switchTeam, addTeamLocally } = useRoleStore()
  const t = useTranslations('app')

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const textPrimary = 'var(--color-fg)'
  const textMuted = 'var(--color-fg-muted)'
  const textDim = 'var(--color-fg-dim)'
  const cardBg = 'var(--color-bg-alt)'
  const cardBorder = 'var(--color-border)'
  const inputBg = 'var(--color-bg-alt)'
  const inputBorder = 'var(--color-border)'

  const inputSt: React.CSSProperties = {
    width: '100%', padding: '9px 12px', borderRadius: 9, border: `1px solid ${inputBorder}`,
    background: inputBg, color: textPrimary, fontSize: 13, outline: 'none', boxSizing: 'border-box',
  }
  const labelSt: React.CSSProperties = { fontSize: 12, fontWeight: 500, color: textMuted, marginBottom: 6, display: 'block' }

  async function handleCreate() {
    if (!name.trim()) { setError('Team name is required'); return }
    setSaving(true); setError(null)
    try {
      if (isDevSeed()) {
        // In dev seed mode, simulate team creation locally
        const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
        const fakeTeam = {
          id: `team_${slug}_${Date.now()}`,
          name: name.trim(),
          slug,
          description: description.trim() || undefined,
          plan: 'free' as const,
          member_count: 1,
          created_at: new Date().toISOString(),
          owner_id: 0,
        }
        addTeamLocally(fakeTeam)
        router.push('/team')
        return
      }
      const created = await apiFetch<{ id: string }>('/api/teams/', { method: 'POST', body: JSON.stringify({ name: name.trim(), description }) })
      // Refresh teams list and switch to the new team
      await fetchAllTeams()
      if (created?.id) switchTeam(created.id)
      router.push('/team')
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="page-wrapper" style={{ padding: '28px 32px', maxWidth: 520 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
        <Link href="/team" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: 8, border: `1px solid ${cardBorder}`, background: 'transparent', color: textMuted, textDecoration: 'none', fontSize: 16 }}>
          <i className="bx bx-arrow-back" />
        </Link>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: textPrimary, margin: 0, letterSpacing: '-0.02em' }}>Create a team</h1>
          <p style={{ fontSize: 13, color: textMuted, marginTop: 3 }}>Teams let you collaborate with others on projects.</p>
        </div>
      </div>

      {/* Form card */}
      <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 14, padding: '24px' }}>
        {/* Team avatar preview */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(169,0,255,0.12)', border: '1px solid rgba(169,0,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 800, color: '#a900ff', flexShrink: 0 }}>
            {name.trim() ? name.trim()[0].toUpperCase() : <i className="bx bx-group" style={{ fontSize: 22 }} />}
          </div>
          <div style={{ fontSize: 13, color: textDim }}>Team avatar is generated from the team name.</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={labelSt}>{t('teamName')} <span style={{ color: '#ef4444' }}>*</span></label>
            <input
              style={inputSt}
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Acme Corp, Engineering, Design..."
              onKeyDown={e => e.key === 'Enter' && handleCreate()}
              autoFocus
            />
          </div>

          <div>
            <label style={labelSt}>Description <span style={{ color: textDim, fontWeight: 400 }}>(optional)</span></label>
            <textarea
              style={{ ...inputSt, height: 72, resize: 'vertical' }}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="What does this team work on?"
            />
          </div>

          {error && (
            <div style={{ padding: '10px 14px', borderRadius: 9, background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', fontSize: 13 }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
            <button
              onClick={handleCreate}
              disabled={saving || !name.trim()}
              style={{ padding: '9px 22px', borderRadius: 9, border: 'none', background: name.trim() ? 'linear-gradient(135deg, #00e5ff, #a900ff)' : 'var(--color-border)', color: name.trim() ? '#fff' : textMuted, fontSize: 13, fontWeight: 600, cursor: name.trim() ? 'pointer' : 'not-allowed', opacity: saving ? 0.7 : 1 }}
            >
              {saving ? t('creating') : 'Create team'}
            </button>
            <Link href="/team" style={{ padding: '9px 18px', borderRadius: 9, border: `1px solid ${cardBorder}`, background: 'transparent', color: textMuted, fontSize: 13, fontWeight: 500, cursor: 'pointer', textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
              {t('cancel')}
            </Link>
          </div>
        </div>
      </div>

      {/* Info box */}
      <div style={{ marginTop: 16, padding: '14px 16px', borderRadius: 10, background: 'rgba(0,229,255,0.05)', border: `1px solid rgba(0,229,255,0.12)` }}>
        <div style={{ fontSize: 12, color: textMuted, lineHeight: 1.6 }}>
          <strong style={{ color: '#00e5ff' }}>Pro tip:</strong> You can invite team members after creating the team from the <Link href="/team/members" style={{ color: '#00e5ff', textDecoration: 'none' }}>Members</Link> page.
        </div>
      </div>
    </div>
  )
}
