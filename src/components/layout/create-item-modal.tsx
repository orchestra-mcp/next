'use client'
import { useState, useRef, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useMCP } from '@/hooks/useMCP'

export type CreateItemKind = 'project' | 'plan' | 'feature'

interface CreateItemModalProps {
  kind: CreateItemKind
  projectId?: string
  onClose: () => void
  onSuccess?: () => void
}

const FEATURE_KINDS = ['feature', 'bug', 'chore'] as const
const PRIORITIES = ['P0', 'P1', 'P2', 'P3'] as const

export function CreateItemModal({ kind, projectId, onClose, onSuccess }: CreateItemModalProps) {
  const { callTool, status: connStatus } = useMCP()
  const router = useRouter()
  const t = useTranslations('sidebar')
  const tApp = useTranslations('app')

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [featureKind, setFeatureKind] = useState<typeof FEATURE_KINDS[number]>('feature')
  const [priority, setPriority] = useState<typeof PRIORITIES[number]>('P1')
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // AI suggestion state
  const [aiSuggestion, setAiSuggestion] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const aiTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const modalBg = 'var(--color-bg-contrast)'
  const modalBorder = 'var(--color-border)'
  const textPrimary = 'var(--color-fg)'
  const textMuted = 'var(--color-fg-dim)'
  const inputBg = 'var(--color-bg-alt)'
  const inputBorder = 'var(--color-border)'

  const inputSt: React.CSSProperties = {
    width: '100%', padding: '9px 12px', borderRadius: 9,
    border: `1px solid ${inputBorder}`, background: inputBg,
    color: textPrimary, fontSize: 13, outline: 'none', boxSizing: 'border-box',
  }

  const titles: Record<CreateItemKind, string> = {
    project: t('newProject'),
    plan: t('newPlan'),
    feature: t('newFeature'),
  }

  const nameLabels: Record<CreateItemKind, string> = {
    project: tApp('projectName'),
    plan: t('planTitle'),
    feature: t('featureTitle'),
  }

  const namePlaceholders: Record<CreateItemKind, string> = {
    project: tApp('projectNamePlaceholder'),
    plan: t('planTitlePlaceholder'),
    feature: t('featureTitlePlaceholder'),
  }

  const createLabels: Record<CreateItemKind, string> = {
    project: tApp('createProject'),
    plan: tApp('createPlan'),
    feature: t('createFeature'),
  }

  // AI smart defaults — debounce on name change
  const fetchAiSuggestion = useCallback(async (itemName: string) => {
    if (!itemName.trim() || connStatus !== 'connected') return
    setAiLoading(true)
    try {
      const result = await callTool('ai_prompt', {
        prompt: `Generate a brief 1-2 sentence description for a ${kind} named "${itemName.trim()}". Be concise and professional. Return ONLY the description text, nothing else.`,
        wait: true,
      })
      const text = result.content?.[0]?.text ?? ''
      if (text.trim()) {
        setAiSuggestion(text.trim())
      }
    } catch {
      // AI suggestion is optional — fail silently
    } finally {
      setAiLoading(false)
    }
  }, [connStatus, callTool, kind])

  // Debounce AI suggestion on name change
  useEffect(() => {
    if (aiTimerRef.current) clearTimeout(aiTimerRef.current)
    if (!name.trim()) {
      setAiSuggestion('')
      return
    }
    aiTimerRef.current = setTimeout(() => {
      fetchAiSuggestion(name)
    }, 800)
    return () => {
      if (aiTimerRef.current) clearTimeout(aiTimerRef.current)
    }
  }, [name, fetchAiSuggestion])

  async function handleCreate() {
    if (!name.trim() || connStatus !== 'connected') return
    setCreating(true)
    setError(null)

    // Use AI suggestion as description if user hasn't typed their own
    const finalDesc = description.trim() || aiSuggestion

    try {
      if (kind === 'project') {
        await callTool('create_project', {
          name: name.trim(),
          ...(finalDesc ? { description: finalDesc } : {}),
        })
      } else if (kind === 'plan') {
        await callTool('create_plan', {
          project_id: projectId!,
          title: name.trim(),
          ...(finalDesc ? { description: finalDesc } : {}),
        })
      } else if (kind === 'feature') {
        await callTool('create_feature', {
          project_id: projectId!,
          title: name.trim(),
          ...(finalDesc ? { description: finalDesc } : {}),
          kind: featureKind,
          priority,
        })
      }

      onClose()
      onSuccess?.()

      // Navigate to new project if created
      if (kind === 'project') {
        const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'project'
        router.push(`/projects/${slug}`)
      }
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setCreating(false)
    }
  }

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 10002, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
    >
      <div style={{ width: '100%', maxWidth: 440, background: modalBg, border: `1px solid ${modalBorder}`, borderRadius: 16, padding: '28px 28px 24px', boxShadow: '0 24px 60px rgba(0,0,0,0.4)' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: textPrimary, margin: 0, letterSpacing: '-0.01em' }}>
            {titles[kind]}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: textMuted, cursor: 'pointer', fontSize: 20, display: 'flex' }}>
            <i className="bx bx-x" />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Name / Title */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 500, color: textMuted, marginBottom: 6, display: 'block' }}>
              {nameLabels[kind]} <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              autoFocus
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCreate()}
              placeholder={namePlaceholders[kind]}
              style={inputSt}
            />
          </div>

          {/* Description */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 500, color: textMuted, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
              {tApp('description')} <span style={{ color: textMuted, fontWeight: 400 }}>({tApp('descriptionOptional')})</span>
              {aiLoading && (
                <span style={{ fontSize: 10, color: '#a900ff', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                  <i className="bx bx-loader-alt bx-spin" style={{ fontSize: 11 }} />
                  AI
                </span>
              )}
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder={aiSuggestion || tApp('descriptionPlaceholder')}
              rows={3}
              style={{ ...inputSt, resize: 'vertical' }}
            />
            {aiSuggestion && !description && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                <i className="bx bx-bulb" style={{ fontSize: 12, color: '#a900ff' }} />
                <span style={{ fontSize: 10, color: 'var(--color-fg-dim)' }}>
                  {t('aiSuggested')}
                </span>
                <button
                  onClick={() => setDescription(aiSuggestion)}
                  style={{ fontSize: 10, color: '#a900ff', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
                >
                  {t('useIt')}
                </button>
              </div>
            )}
          </div>

          {/* Feature-specific fields */}
          {kind === 'feature' && (
            <div style={{ display: 'flex', gap: 10 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 12, fontWeight: 500, color: textMuted, marginBottom: 6, display: 'block' }}>
                  {t('kind')}
                </label>
                <select
                  value={featureKind}
                  onChange={e => setFeatureKind(e.target.value as typeof FEATURE_KINDS[number])}
                  style={{ ...inputSt, cursor: 'pointer' }}
                >
                  {FEATURE_KINDS.map(k => (
                    <option key={k} value={k}>{k.charAt(0).toUpperCase() + k.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 12, fontWeight: 500, color: textMuted, marginBottom: 6, display: 'block' }}>
                  {t('priority')}
                </label>
                <select
                  value={priority}
                  onChange={e => setPriority(e.target.value as typeof PRIORITIES[number])}
                  style={{ ...inputSt, cursor: 'pointer' }}
                >
                  {PRIORITIES.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div style={{ padding: '9px 12px', borderRadius: 8, background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', fontSize: 13 }}>
              {error}
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
            <button
              onClick={handleCreate}
              disabled={creating || !name.trim()}
              style={{
                flex: 1, padding: '10px', borderRadius: 9, border: 'none',
                background: name.trim() ? 'linear-gradient(135deg, #00e5ff, #a900ff)' : 'var(--color-border)',
                color: name.trim() ? '#fff' : textMuted,
                fontSize: 13, fontWeight: 600,
                cursor: name.trim() ? 'pointer' : 'not-allowed',
                opacity: creating ? 0.7 : 1,
              }}
            >
              {creating ? tApp('creating') : createLabels[kind]}
            </button>
            <button
              onClick={onClose}
              style={{ padding: '10px 18px', borderRadius: 9, border: `1px solid ${modalBorder}`, background: 'transparent', color: textMuted, fontSize: 13, cursor: 'pointer' }}
            >
              {t('cancel')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
