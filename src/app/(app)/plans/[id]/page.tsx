'use client'
import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useMCP } from '@/hooks/useMCP'
import { MarkdownEditor } from '@orchestra-mcp/editor/MarkdownEditor'
import { MarkdownRenderer } from '@orchestra-mcp/editor/MarkdownRenderer'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { useSidebarMetaStore } from '@/store/sidebar-meta'

interface PlanDetail {
  id: string
  title: string
  status: string
  featureCount: number
  featureIds: string[]
  body: string
  project_id: string
}

interface Feature {
  id: string
  title: string
  status: string
  kind: string
  priority: string
}

export default function PlanDetailPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const planId = params.id as string
  const { callTool, status: connStatus, tunnel } = useMCP()
  const t = useTranslations('app')

  const [plan, setPlan] = useState<PlanDetail | null>(null)
  const [features, setFeatures] = useState<Feature[]>([])
  const [loading, setLoading] = useState(true)
  const [featuresLoading, setFeaturesLoading] = useState(false)
  const [projectId, setProjectId] = useState<string | null>(searchParams.get('project'))

  // Action states
  const [approvingId, setApprovingId] = useState<string | null>(null)
  const [completingId, setCompletingId] = useState<string | null>(null)

  // Edit mode
  const [editing, setEditing] = useState(false)
  const [editDescription, setEditDescription] = useState('')
  const [editTitle, setEditTitle] = useState('')
  const [saving, setSaving] = useState(false)

  // Resolve project context first, then fetch plan
  const fetchPlan = useCallback(async () => {
    if (connStatus !== 'connected' || !planId) return
    setLoading(true)
    try {
      // Need a project ID — try cached/query param, then search across all projects
      let projId = projectId
      let planText = ''

      if (projId) {
        // Try the known project ID directly
        try {
          const result = await callTool('get_plan', { project_id: projId, plan_id: planId })
          planText = result.content?.[0]?.text ?? ''
        } catch {
          projId = null // Plan not in this project, search others
        }
      }

      if (!projId) {
        // Fetch all projects and try each until we find the plan
        const projResult = await callTool('list_projects')
        const projTextRaw = projResult.content?.[0]?.text ?? ''
        const projects = parseMCPProjects(projTextRaw)
        for (const p of projects) {
          try {
            const result = await callTool('get_plan', { project_id: p.id, plan_id: planId })
            const text = result.content?.[0]?.text ?? ''
            if (text && !text.includes('not_found')) {
              projId = p.id
              planText = text
              break
            }
          } catch {
            continue
          }
        }
        if (projId) setProjectId(projId)
      }

      if (!projId || !planText) {
        setLoading(false)
        return
      }

      const parsed = parsePlanDetail(planText, planId, projId)
      setPlan(parsed)

      // Fetch linked features by their IDs from the plan metadata
      if (parsed.featureIds.length > 0) {
        setFeaturesLoading(true)
        try {
          const featResult = await callTool('list_features', { project_id: projId })
          const featText = featResult.content?.[0]?.text ?? ''
          const allFeatures = parseMCPFeatures(featText)
          const idSet = new Set(parsed.featureIds)
          const planFeatures = allFeatures.filter(f => idSet.has(f.id))
          setFeatures(planFeatures)
        } catch {
          setFeatures([])
        } finally {
          setFeaturesLoading(false)
        }
      } else {
        setFeatures([])
      }
    } catch (e) {
      console.error('[plan-detail] fetch error:', e)
    } finally {
      setLoading(false)
    }
  }, [connStatus, callTool, planId, projectId])

  useEffect(() => {
    if (connStatus === 'connected') {
      fetchPlan()
    }
  }, [connStatus, fetchPlan])

  async function handleApprove() {
    if (!plan || !projectId) return
    setApprovingId(plan.id)
    try {
      await callTool('approve_plan', { project_id: projectId, plan_id: plan.id })
      await fetchPlan()
    } catch (e) {
      console.error('[plan-detail] approve error:', e)
    } finally {
      setApprovingId(null)
    }
  }

  async function handleComplete() {
    if (!plan || !projectId) return
    setCompletingId(plan.id)
    try {
      await callTool('complete_plan', { project_id: projectId, plan_id: plan.id })
      await fetchPlan()
    } catch (e) {
      console.error('[plan-detail] complete error:', e)
    } finally {
      setCompletingId(null)
    }
  }

  function handleEdit() {
    if (!plan) return
    setEditTitle(plan.title)
    setEditDescription(plan.body || '')
    setEditing(true)
  }

  async function handleEditSave() {
    if (!plan || !projectId) return
    setSaving(true)
    try {
      const args: Record<string, unknown> = {
        project_id: projectId,
        plan_id: plan.id,
      }
      if (editTitle.trim() && editTitle.trim() !== plan.title) {
        args.title = editTitle.trim()
      }
      if (editDescription !== plan.body) {
        args.description = editDescription.trim() || undefined
      }
      await callTool('update_plan', args)
      await fetchPlan()
      setEditing(false)
    } catch (e) {
      console.error('[plan-detail] save error:', e)
    } finally {
      setSaving(false)
    }
  }

  function handleEditCancel() {
    setEditing(false)
    setEditTitle(plan?.title || '')
    setEditDescription(plan?.body || '')
  }

  // Sidebar meta (icon/color overrides)
  const planMetaIcon = useSidebarMetaStore(s => s.items[`plans:${planId}`]?.icon)
  const planMetaColor = useSidebarMetaStore(s => s.items[`plans:${planId}`]?.color)

  // Theme colors
  const textPrimary = 'var(--color-fg)'
  const textMuted = 'var(--color-fg-dim)'
  const textDim = 'var(--color-fg-dim)'
  const cardBg = 'var(--color-bg-alt)'
  const cardBorder = 'var(--color-border)'
  const idBg = 'var(--color-bg-alt)'
  const idBorder = 'var(--color-border)'
  const idColor = 'var(--color-fg-dim)'
  const skeletonHi = 'var(--color-bg-active)'
  const skeletonMid = 'var(--color-bg-alt)'
  const emptyIconColor = 'var(--color-fg-dim)'
  const emptyTitleColor = 'var(--color-fg-muted)'
  const warnColor = '#f59e0b'

  const statusColors: Record<string, string> = {
    draft: 'rgba(120,120,120,0.7)',
    approved: '#6366f1',
    'in-progress': '#00e5ff',
    completed: '#22c55e',
  }

  const featureStatusColors: Record<string, string> = {
    todo: 'rgba(120,120,120,0.7)',
    'in-progress': '#00e5ff',
    'in-testing': '#f59e0b',
    'in-docs': '#8b5cf6',
    'in-review': '#6366f1',
    done: '#22c55e',
    'needs-edits': '#ef4444',
  }

  const card: React.CSSProperties = {
    background: cardBg,
    border: `1px solid ${cardBorder}`,
    borderRadius: 12,
  }

  function getStatusBadgeStyle(status: string, colors: Record<string, string> = statusColors): React.CSSProperties {
    const color = colors[status] || textMuted
    return {
      fontSize: 10,
      padding: '2px 8px',
      borderRadius: 100,
      background: `${color}18`,
      border: `1px solid ${color}30`,
      color,
      fontWeight: 600,
      letterSpacing: '0.02em',
      textTransform: 'capitalize' as const,
    }
  }

  // Not connected
  if (connStatus !== 'connected' && connStatus !== 'connecting') {
    return (
      <div className="page-wrapper" style={{ padding: '28px 32px' }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: textPrimary, margin: '0 0 24px', letterSpacing: '-0.02em' }}>{t('plans')}</h1>
        <div style={{ ...card, padding: '60px 40px', textAlign: 'center' }}>
          <i className="bx bx-transfer-alt" style={{ fontSize: 40, color: warnColor, display: 'block', marginBottom: 14 }} />
          <div style={{ fontSize: 15, fontWeight: 600, color: emptyTitleColor, marginBottom: 6 }}>{t('noTunnelConnected')}</div>
          <div style={{ fontSize: 13, color: textDim, marginBottom: 20 }}>{t('connectTunnelPlans')}</div>
          <Link href="/tunnels" style={{ padding: '9px 20px', borderRadius: 9, border: 'none', background: 'linear-gradient(135deg, #00e5ff, #a900ff)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', textDecoration: 'none', display: 'inline-block' }}>
            {t('goToTunnels')}
          </Link>
        </div>
      </div>
    )
  }

  // Connecting
  if (connStatus === 'connecting') {
    return (
      <div className="page-wrapper" style={{ padding: '28px 32px' }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: textPrimary, margin: '0 0 24px', letterSpacing: '-0.02em' }}>{t('plans')}</h1>
        <div style={{ ...card, padding: '60px 40px', textAlign: 'center' }}>
          <i className="bx bx-loader-alt bx-spin" style={{ fontSize: 36, color: '#00e5ff', display: 'block', marginBottom: 14 }} />
          <div style={{ fontSize: 14, fontWeight: 600, color: emptyTitleColor, marginBottom: 6 }}>{t('connectingToWorkspace')}</div>
          {tunnel && <div style={{ fontSize: 12, color: textDim }}>{tunnel.name} ({tunnel.hostname})</div>}
        </div>
      </div>
    )
  }

  // Loading
  if (loading) {
    return (
      <div className="page-wrapper" style={{ padding: '28px 32px' }}>
        <div style={{ marginBottom: 20 }}>
          <button
            onClick={() => router.push('/plans')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: textMuted, fontSize: 13, display: 'flex', alignItems: 'center', gap: 5, padding: 0 }}
          >
            <i className="bx bx-arrow-back" style={{ fontSize: 15 }} />
            {t('backToPlans')}
          </button>
        </div>
        <div style={{ ...card, padding: '24px' }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 20 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: skeletonHi }} />
            <div style={{ flex: 1 }}>
              <div style={{ height: 14, borderRadius: 5, background: skeletonHi, width: '40%', marginBottom: 8 }} />
              <div style={{ height: 10, borderRadius: 5, background: skeletonMid, width: '25%' }} />
            </div>
          </div>
          <div style={{ height: 10, borderRadius: 5, background: skeletonMid, width: '80%', marginBottom: 8 }} />
          <div style={{ height: 10, borderRadius: 5, background: skeletonMid, width: '60%' }} />
        </div>
      </div>
    )
  }

  // Plan not found
  if (!plan) {
    return (
      <div className="page-wrapper" style={{ padding: '28px 32px' }}>
        <div style={{ marginBottom: 20 }}>
          <button
            onClick={() => router.push('/plans')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: textMuted, fontSize: 13, display: 'flex', alignItems: 'center', gap: 5, padding: 0 }}
          >
            <i className="bx bx-arrow-back" style={{ fontSize: 15 }} />
            {t('backToPlans')}
          </button>
        </div>
        <div style={{ ...card, padding: '60px 40px', textAlign: 'center' }}>
          <i className="bx bx-error-circle" style={{ fontSize: 40, color: emptyIconColor, display: 'block', marginBottom: 14 }} />
          <div style={{ fontSize: 15, fontWeight: 600, color: emptyTitleColor, marginBottom: 6 }}>{t('planNotFound')}</div>
          <div style={{ fontSize: 13, color: textDim }}>{planId}</div>
        </div>
      </div>
    )
  }

  const statusColor = statusColors[plan.status] || textMuted

  return (
    <div className="page-wrapper" style={{ padding: '28px 32px' }}>
      {/* Back link */}
      <div style={{ marginBottom: 20 }}>
        <button
          onClick={() => router.push('/plans')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: textMuted, fontSize: 13, display: 'flex', alignItems: 'center', gap: 5, padding: 0 }}
        >
          <i className="bx bx-arrow-back" style={{ fontSize: 15 }} />
          {t('backToPlans')}
        </button>
      </div>

      {/* Plan header card */}
      <div style={{ ...card, padding: '20px 24px', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
          {/* Icon */}
          {(() => {
            const iconColor = planMetaColor || statusColor
            const isHex = iconColor.startsWith('#')
            const bg = isHex ? `${iconColor}15` : `color-mix(in srgb, ${iconColor} 8%, transparent)`
            const bdr = isHex ? `${iconColor}25` : `color-mix(in srgb, ${iconColor} 15%, transparent)`
            return (
              <div style={{
                width: 36, height: 36, borderRadius: 9,
                background: bg, border: `1px solid ${bdr}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <i className={`bx ${planMetaIcon || (plan.status === 'completed' ? 'bx-check-circle' : 'bx-map-alt')}`} style={{
                  fontSize: 17, color: iconColor,
                }} />
              </div>
            )
          })()}

          {/* Title + meta */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {editing ? (
              <input
                value={editTitle}
                onChange={e => setEditTitle(e.target.value)}
                style={{
                  fontSize: 18, fontWeight: 700, color: textPrimary, margin: 0, letterSpacing: '-0.01em',
                  background: 'var(--color-bg-active)', border: '1px solid rgba(169,0,255,0.25)',
                  borderRadius: 6, padding: '4px 10px', width: '100%', outline: 'none',
                }}
              />
            ) : (
              <h1 style={{ fontSize: 18, fontWeight: 700, color: textPrimary, margin: 0, letterSpacing: '-0.01em' }}>
                {plan.title}
              </h1>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
              <span style={{
                fontSize: 10, padding: '1px 6px', borderRadius: 100,
                background: idBg, border: `1px solid ${idBorder}`, color: idColor,
                fontFamily: 'monospace', letterSpacing: '0.02em',
              }}>
                {plan.id}
              </span>
              <span style={getStatusBadgeStyle(plan.status)}>
                {plan.status}
              </span>
              {plan.featureCount > 0 && (
                <span style={{ fontSize: 11, color: textDim }}>
                  <i className="bx bx-list-ul" style={{ fontSize: 12, marginInlineEnd: 3 }} />
                  {t('features', { count: plan.featureCount })}
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
            {editing ? (
              <>
                <button
                  onClick={handleEditCancel}
                  style={{
                    padding: '6px 14px', borderRadius: 7,
                    border: `1px solid var(--color-border)`, background: 'transparent',
                    color: textMuted, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  {t('cancel')}
                </button>
                <button
                  onClick={handleEditSave}
                  disabled={saving}
                  style={{
                    padding: '6px 14px', borderRadius: 7, border: 'none',
                    background: 'linear-gradient(135deg, #00e5ff, #a900ff)', color: '#fff',
                    fontSize: 12, fontWeight: 600, cursor: 'pointer',
                    opacity: saving ? 0.6 : 1,
                  }}
                >
                  {saving ? t('saving') : t('save')}
                </button>
              </>
            ) : (
              <button
                onClick={handleEdit}
                style={{
                  padding: '6px 14px', borderRadius: 7,
                  border: `1px solid var(--color-border)`, background: 'transparent',
                  color: textMuted, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 4,
                }}
              >
                <i className="bx bx-edit-alt" style={{ fontSize: 13 }} />
                {t('edit')}
              </button>
            )}
            {!editing && plan.status === 'draft' && (
              <button
                onClick={handleApprove}
                disabled={approvingId === plan.id}
                style={{
                  padding: '6px 14px', borderRadius: 7, border: 'none',
                  background: 'rgba(99,102,241,0.12)', color: '#6366f1',
                  fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  opacity: approvingId === plan.id ? 0.6 : 1,
                }}
              >
                {approvingId === plan.id ? t('approving') : t('approve')}
              </button>
            )}
            {!editing && plan.status === 'in-progress' && (
              <button
                onClick={handleComplete}
                disabled={completingId === plan.id}
                style={{
                  padding: '6px 14px', borderRadius: 7, border: 'none',
                  background: 'rgba(34,197,94,0.12)', color: '#22c55e',
                  fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  opacity: completingId === plan.id ? 0.6 : 1,
                }}
              >
                {completingId === plan.id ? t('completing') : t('complete')}
              </button>
            )}
            {!editing && plan.status === 'completed' && (
              <i className="bx bx-check-circle" style={{ fontSize: 20, color: '#22c55e' }} />
            )}
          </div>
        </div>
      </div>

      {/* Plan body — view or edit */}
      {editing ? (
        <div style={{ ...card, padding: '18px 22px', marginBottom: 16 }}>
          <MarkdownEditor
            value={editDescription}
            onChange={setEditDescription}
            placeholder="Write a plan description..."
          />
        </div>
      ) : plan.body ? (
        <div style={{ ...card, padding: '18px 22px', marginBottom: 16 }}>
          <div style={{ fontSize: 14, lineHeight: 1.75 }} className="plan-body-markdown">
            <MarkdownRenderer content={plan.body} />
          </div>
        </div>
      ) : !editing ? (
        <div
          onClick={handleEdit}
          style={{
            ...card, padding: '24px 16px', marginBottom: 16, textAlign: 'center',
            borderStyle: 'dashed', cursor: 'pointer', color: textDim, fontSize: 13,
          }}
        >
          <i className="bx bx-edit-alt" style={{ fontSize: 18, display: 'block', marginBottom: 6 }} />
          Click to add a description...
        </div>
      ) : null}

      {/* Linked features */}
      <div style={{ ...card, padding: '18px 22px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: textMuted, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            {t('linkedFeatures')}
          </div>
          {!featuresLoading && (
            <span style={{ fontSize: 11, color: textDim }}>
              {features.length} {features.length === 1 ? 'feature' : 'features'}
            </span>
          )}
        </div>

        {featuresLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ height: 44, borderRadius: 8, background: skeletonMid }} />
            ))}
          </div>
        ) : features.length === 0 ? (
          <div style={{ padding: '24px 0', textAlign: 'center' }}>
            <div style={{ fontSize: 13, color: textDim }}>{t('noLinkedFeatures')}</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {features.map(feat => (
              <Link
                key={feat.id}
                href={projectId ? `/projects/${projectId}/features/${feat.id}` : '#'}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 12px', borderRadius: 8,
                  background: 'var(--color-bg)',
                  border: `1px solid ${cardBorder}`,
                  textDecoration: 'none',
                  transition: 'border-color 0.15s ease',
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = `${planMetaColor || statusColor}40`)}
                onMouseLeave={e => (e.currentTarget.style.borderColor = cardBorder)}
              >
                {/* Status dot */}
                <span style={{
                  width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                  background: featureStatusColors[feat.status] || textMuted,
                }} />

                {/* Feature info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: textPrimary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {feat.title}
                  </div>
                </div>

                {/* Meta badges */}
                <span style={{
                  fontSize: 10, padding: '1px 6px', borderRadius: 100,
                  background: idBg, border: `1px solid ${idBorder}`, color: idColor,
                  fontFamily: 'monospace', flexShrink: 0,
                }}>
                  {feat.id}
                </span>
                <span style={getStatusBadgeStyle(feat.status, featureStatusColors)}>
                  {feat.status}
                </span>
                {feat.kind !== 'feature' && (
                  <span style={{
                    fontSize: 10, padding: '2px 6px', borderRadius: 4,
                    background: 'var(--color-bg-active)', color: textDim, fontWeight: 500,
                  }}>
                    {feat.kind}
                  </span>
                )}

                <i className="bx bx-chevron-right rtl-flip" style={{ fontSize: 16, color: textDim, flexShrink: 0 }} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================================
// MCP response parsers
// ============================================================

function parseMCPProjects(text: string): Array<{ id: string; name: string }> {
  const projects: Array<{ id: string; name: string }> = []
  const lines = text.split('\n')
  for (const line of lines) {
    const matchWithSlug = line.match(/^-\s+\*\*(.+?)\*\*\s+\(`([^)]+)`\)/)
    const matchLegacy = line.match(/^-\s+\*\*(.+?)\*\*/)
    if (matchWithSlug) {
      projects.push({ id: matchWithSlug[2].trim(), name: matchWithSlug[1].trim() })
    } else if (matchLegacy && !matchWithSlug) {
      const name = matchLegacy[1].trim()
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'project'
      projects.push({ id: slug, name })
    }
  }
  return projects
}

function parsePlanDetail(text: string, planId: string, projectId: string): PlanDetail {
  const lines = text.split('\n')
  let title = planId
  let status = 'draft'
  let featureIds: string[] = []
  let bodyStartIdx = -1

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // Title from "### PLAN-JMG — Swift macOS Chat UX Overhaul — 15 Features"
    const headerMatch = line.match(/^#{1,3}\s+(?:\S+\s+—\s+)?(.+)$/i)
    if (headerMatch && title === planId) {
      // Strip trailing " — N Features"
      title = headerMatch[1].replace(/\s*—\s*\d+\s+features?$/i, '').trim()
      continue
    }

    // Status from "- **Status:** in-progress"
    const statusMatch = line.match(/\*\*Status:\*\*\s*(.+)/i)
    if (statusMatch) {
      status = statusMatch[1].trim().toLowerCase()
      continue
    }

    // Features from "- **Features:** FEAT-IBD, FEAT-KXH, ..."
    const featMatch = line.match(/\*\*Features?:\*\*\s*(.+)/i)
    if (featMatch) {
      featureIds = featMatch[1].split(',').map(f => f.trim()).filter(Boolean)
      continue
    }

    // Body starts after ---
    if (line.trim() === '---' && bodyStartIdx === -1) {
      bodyStartIdx = i + 1
    }
  }

  const body = bodyStartIdx >= 0 ? lines.slice(bodyStartIdx).join('\n').trim() : ''
  return { id: planId, title, status, featureCount: featureIds.length, featureIds, body, project_id: projectId }
}

function parseMCPFeatures(text: string): Array<Feature & { labels?: string[] }> {
  const features: Array<Feature & { labels?: string[] }> = []
  const lines = text.split('\n')
  let headerCols: string[] = []

  for (const line of lines) {
    if (!line.startsWith('|') || line.includes('---')) continue
    const cells = line.split('|').map(c => c.trim()).filter(Boolean)
    if (cells.length < 2) continue

    if (cells[0].toLowerCase() === 'id') {
      headerCols = cells.map(c => c.toLowerCase())
      continue
    }

    const row: Record<string, string> = {}
    cells.forEach((cell, i) => {
      const col = headerCols[i] || `col${i}`
      row[col] = cell
    })

    const id = row['id'] || cells[0]
    const title = row['title'] || cells[1] || ''
    const status = (row['status'] || cells[2] || 'todo').toLowerCase()
    const kind = (row['kind'] || row['type'] || 'feature').toLowerCase()
    const priority = row['priority'] || row['pri'] || 'P2'
    const labelsStr = row['labels'] || ''
    const labels = labelsStr ? labelsStr.split(',').map(l => l.trim()).filter(Boolean) : []

    if (!id) continue
    features.push({ id, title, status, kind, priority, labels })
  }

  return features
}
