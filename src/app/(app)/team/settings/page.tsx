'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useRoleStore } from '@/store/roles'
import { useTranslations } from 'next-intl'

export default function TeamSettingsPage() {
  const router = useRouter()
  const { can, roleLoaded, team, fetchTeam, updateTeam, loading, error, clearError } = useRoleStore()
  const t = useTranslations('app')

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!roleLoaded) return
    if (!can('canManageTeam')) { router.replace('/team'); return }
    if (!team) fetchTeam()
  }, [roleLoaded])

  useEffect(() => {
    if (team) {
      setName(team.name)
      setDescription(team.description ?? '')
    }
  }, [team])

  const textPrimary = 'var(--color-fg)'
  const textMuted = 'var(--color-fg-muted)'
  const textDim = 'var(--color-fg-dim)'
  const cardBg = 'var(--color-bg-alt)'
  const cardBorder = 'var(--color-border)'
  const divider = 'var(--color-border)'
  const inputBg = 'var(--color-bg-alt)'
  const inputBorder = 'var(--color-border)'
  const labelColor = 'var(--color-fg-muted)'

  const inputSt: React.CSSProperties = {
    width: '100%', padding: '9px 12px', borderRadius: 9, border: `1px solid ${inputBorder}`,
    background: inputBg, color: textPrimary, fontSize: 13, outline: 'none', boxSizing: 'border-box',
  }

  const handleSave = async () => {
    try {
      await updateTeam({ name: name.trim() || team?.name, description: description.trim() })
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch {}
  }

  const planColors: Record<string, string> = {
    free: 'var(--color-fg-muted)',
    pro: '#00e5ff',
    enterprise: '#a900ff',
  }

  return (
    <div className="page-wrapper" style={{ maxWidth: 680, padding: '28px 32px' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Link href="/team" style={{ fontSize: 13, color: textDim, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 5, marginBottom: 14 }}>
          <i className="bx bx-left-arrow-alt rtl-flip" /> {t('team')}
        </Link>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: textPrimary, margin: 0, letterSpacing: '-0.02em' }}>{t('settings')}</h1>
        <p style={{ fontSize: 13, color: textMuted, marginTop: 5 }}>Manage your team&apos;s name and details</p>
      </div>

      {error && (
        <div style={{ marginBottom: 16, padding: '10px 14px', borderRadius: 8, fontSize: 13, background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>
          {error}
          <button onClick={clearError} style={{ marginInlineStart: 8, background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 12 }}>✕</button>
        </div>
      )}

      {/* General settings */}
      <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 14, padding: '22px 24px', marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: textPrimary, marginBottom: 18, paddingBottom: 14, borderBottom: `1px solid ${divider}` }}>{t('general')}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: labelColor, marginBottom: 6, display: 'block', letterSpacing: '0.02em' }}>{t('teamName')}</label>
            <input style={inputSt} value={name} onChange={e => setName(e.target.value)} placeholder={t('teamNamePlaceholder')} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: labelColor, marginBottom: 6, display: 'block', letterSpacing: '0.02em' }}>{t('teamDescription')}</label>
            <textarea
              style={{ ...inputSt, minHeight: 80, resize: 'vertical' as const, fontFamily: 'inherit', lineHeight: 1.5 }}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder={t('teamDescPlaceholder')}
            />
          </div>
          {team && (
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: labelColor, marginBottom: 6, display: 'block', letterSpacing: '0.02em' }}>{t('slug')}</label>
              <input style={{ ...inputSt, opacity: 0.6, cursor: 'not-allowed', fontFamily: 'monospace', letterSpacing: '0.03em' }} value={team.slug} readOnly />
              <div style={{ fontSize: 11, color: textDim, marginTop: 5 }}>{t('slugCannotChange')}</div>
            </div>
          )}
        </div>
        <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={handleSave}
            disabled={loading}
            style={{ padding: '8px 20px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, #00e5ff, #a900ff)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1 }}
          >
            {loading ? t('loading') : t('save')}
          </button>
          {saved && (
            <span style={{ fontSize: 12, color: '#22c55e', display: 'flex', alignItems: 'center', gap: 5 }}>
              <i className="bx bx-check-circle" /> {t('save')}
            </span>
          )}
        </div>
      </div>

      {/* Plan info */}
      {team && (
        <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 14, padding: '22px 24px', marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: textPrimary, marginBottom: 16, paddingBottom: 14, borderBottom: `1px solid ${divider}` }}>{t('planBilling')}</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: textPrimary, marginBottom: 3, display: 'flex', alignItems: 'center', gap: 8 }}>
                {t('currentPlan')}
                <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 100, background: `${planColors[team.plan]}15`, color: planColors[team.plan], border: `1px solid ${planColors[team.plan]}30`, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' as const }}>
                  {team.plan}
                </span>
              </div>
              <div style={{ fontSize: 12, color: textDim }}>{team.member_count} member{team.member_count !== 1 ? 's' : ''} · Team ID: {team.id.slice(0, 8)}</div>
            </div>
            {can('canManageBilling') && (
              <Link href="/billing" style={{ padding: '7px 14px', borderRadius: 8, border: `1px solid ${cardBorder}`, background: 'transparent', color: textPrimary, fontSize: 13, fontWeight: 500, cursor: 'pointer', textDecoration: 'none' }}>
                Manage billing
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Danger zone */}
      {can('canDeleteTeam') && (
        <div style={{ background: cardBg, border: '1px solid rgba(239,68,68,0.2)', borderRadius: 14, padding: '22px 24px' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#ef4444', marginBottom: 16, paddingBottom: 14, borderBottom: '1px solid rgba(239,68,68,0.12)' }}>{t('dangerZone')}</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color: textPrimary, marginBottom: 3 }}>{t('deleteTeam')}</div>
              <div style={{ fontSize: 12, color: textDim }}>{t('deleteTeamDesc')}</div>
            </div>
            <button style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.08)', color: '#ef4444', fontSize: 13, fontWeight: 500, cursor: 'pointer', flexShrink: 0 }}>
              {t('deleteTeamBtn')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
