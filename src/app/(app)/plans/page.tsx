'use client'
import { useEffect, useState, useCallback } from 'react'
import { useMCP } from '@/hooks/useMCP'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'

interface Plan {
  id: string
  title: string
  status: string
  featureCount: number
  body?: string
}

interface Project {
  id: string
  name: string
}

export default function PlansPage() {
  const { callTool, status: connStatus, tunnel } = useMCP()
  const router = useRouter()
  const [plans, setPlans] = useState<Plan[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const t = useTranslations('app')

  // Action states
  const [approvingId, setApprovingId] = useState<string | null>(null)
  const [completingId, setCompletingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // New plan modal
  const [showNew, setShowNew] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [newProjectId, setNewProjectId] = useState<string>('')
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  const fetchProjects = useCallback(async () => {
    if (connStatus !== 'connected') return
    try {
      const result = await callTool('list_projects')
      const text = result.content?.[0]?.text ?? ''
      const parsed = parseMCPProjects(text)
      setProjects(parsed)
      if (parsed.length > 0 && !selectedProject) {
        setSelectedProject(parsed[0].id)
      }
    } catch (e) {
      console.error('[plans] fetch projects error:', e)
    }
  }, [connStatus, callTool, selectedProject])

  const fetchPlans = useCallback(async () => {
    if (connStatus !== 'connected' || !selectedProject) return
    setLoading(true)
    try {
      const args: Record<string, unknown> = { project_id: selectedProject }
      if (statusFilter !== 'all') args.status = statusFilter
      const result = await callTool('list_plans', args)
      const text = result.content?.[0]?.text ?? ''
      const parsed = parseMCPPlans(text)
      setPlans(parsed)
    } catch (e) {
      console.error('[plans] fetch error:', e)
    } finally {
      setLoading(false)
    }
  }, [connStatus, callTool, selectedProject, statusFilter])

  useEffect(() => {
    if (connStatus === 'connected') {
      fetchProjects()
    }
  }, [connStatus, fetchProjects])

  useEffect(() => {
    if (connStatus === 'connected' && selectedProject) {
      fetchPlans()
    }
  }, [connStatus, selectedProject, statusFilter, fetchPlans])

  async function handleApprove(planId: string) {
    if (!selectedProject) return
    setApprovingId(planId)
    try {
      await callTool('approve_plan', { project_id: selectedProject, plan_id: planId })
      await fetchPlans()
    } catch (e) {
      console.error('[plans] approve error:', e)
    } finally {
      setApprovingId(null)
    }
  }

  async function handleComplete(planId: string) {
    if (!selectedProject) return
    setCompletingId(planId)
    try {
      await callTool('complete_plan', { project_id: selectedProject, plan_id: planId })
      await fetchPlans()
    } catch (e) {
      console.error('[plans] complete error:', e)
    } finally {
      setCompletingId(null)
    }
  }

  async function handleDelete(planId: string) {
    if (!selectedProject) return
    setDeletingId(planId)
    try {
      await callTool('delete_plan', { project_id: selectedProject, plan_id: planId })
      await fetchPlans()
    } catch (e) {
      console.error('[plans] delete error:', e)
    } finally {
      setDeletingId(null)
    }
  }

  async function handleCreate() {
    const projectId = newProjectId || selectedProject
    if (!newTitle.trim() || !projectId || connStatus !== 'connected') return
    setCreating(true); setCreateError(null)
    try {
      const args: Record<string, unknown> = {
        project_id: projectId,
        title: newTitle.trim(),
      }
      if (newDesc.trim()) args.description = newDesc.trim()
      await callTool('create_plan', args)
      setShowNew(false); setNewTitle(''); setNewDesc(''); setNewProjectId('')
      if (projectId !== selectedProject) {
        setSelectedProject(projectId)
      } else {
        await fetchPlans()
      }
    } catch (e) {
      setCreateError((e as Error).message)
    } finally {
      setCreating(false)
    }
  }

  const filtered = statusFilter === 'all'
    ? plans
    : plans.filter(p => p.status === statusFilter)

  // Theme colors (matching projects/notes pages)
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
  const inputBg = 'var(--color-bg-alt)'
  const inputBorder = 'var(--color-border)'
  const modalBg = 'var(--color-bg-contrast)'
  const modalBorder = 'var(--color-border)'
  const warnColor = '#f59e0b'
  const tabBg = 'var(--color-bg-active)'
  const tabColor = 'var(--color-fg-muted)'
  const tabActiveBg = 'rgba(0,229,255,0.1)'
  const tabActiveColor = '#00e5ff'
  const actionColor = 'var(--color-fg-dim)'
  const featureCountColor = 'var(--color-fg-dim)'
  const selectBg = 'var(--color-bg-alt)'
  const selectBorder = 'var(--color-border)'
  const selectColor = 'var(--color-fg)'

  const statusColors: Record<string, string> = {
    draft: 'rgba(120,120,120,0.7)',
    approved: '#6366f1',
    'in-progress': '#00e5ff',
    completed: '#22c55e',
  }

  const card: React.CSSProperties = {
    background: cardBg,
    border: `1px solid ${cardBorder}`,
    borderRadius: 12,
  }

  const inputSt: React.CSSProperties = {
    width: '100%', padding: '9px 12px', borderRadius: 9,
    border: `1px solid ${inputBorder}`, background: inputBg,
    color: textPrimary, fontSize: 13, outline: 'none', boxSizing: 'border-box',
  }

  const selectSt: React.CSSProperties = {
    padding: '7px 12px', borderRadius: 8,
    border: `1px solid ${selectBorder}`, background: selectBg,
    color: selectColor, fontSize: 13, outline: 'none',
    cursor: 'pointer', appearance: 'none' as const,
    backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%2388889040' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 10px center',
    paddingInlineEnd: 28,
  }

  const statusTabs = ['all', 'draft', 'approved', 'in-progress', 'completed']

  function getStatusBadgeStyle(status: string): React.CSSProperties {
    const color = statusColors[status] || textMuted
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
          <div style={{ fontSize: 13, color: textDim, marginBottom: 20 }}>
            {t('connectTunnelPlans')}
          </div>
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

  return (
    <div className="page-wrapper" style={{ padding: '28px 32px' }}>
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 22 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: textPrimary, margin: 0, letterSpacing: '-0.02em' }}>{t('plans')}</h1>
          <p style={{ fontSize: 13, color: textMuted, marginTop: 5 }}>
            {loading ? t('loadingFromWorkspace') : `${plans.length} plan${plans.length !== 1 ? 's' : ''}`}
            {tunnel && (
              <span style={{ marginInlineStart: 8, fontSize: 11, color: textDim }}>
                <i className="bx bx-link" style={{ marginInlineEnd: 3, fontSize: 12 }} />
                {tunnel.name}
              </span>
            )}
          </p>
        </div>
        <button
          onClick={() => { setShowNew(true); setNewTitle(''); setNewDesc(''); setNewProjectId(''); setCreateError(null) }}
          disabled={connStatus !== 'connected' || !selectedProject}
          style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 16px', borderRadius: 9, border: 'none', background: 'linear-gradient(135deg, #00e5ff, #a900ff)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: connStatus !== 'connected' || !selectedProject ? 0.5 : 1 }}
        >
          <i className="bx bx-plus" style={{ fontSize: 16 }} />
          {t('newPlan')}
        </button>
      </div>

      {/* Project selector */}
      <div style={{ marginBottom: 18 }}>
        <label style={{ fontSize: 12, fontWeight: 500, color: textMuted, marginInlineEnd: 10 }}>{t('project')}</label>
        <select
          value={selectedProject ?? ''}
          onChange={e => setSelectedProject(e.target.value)}
          style={selectSt}
        >
          {projects.length === 0 && <option value="">{t('noProjects')}</option>}
          {projects.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      {/* Status filter tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
        {statusTabs.map(tab => (
          <button
            key={tab}
            onClick={() => setStatusFilter(tab)}
            style={{
              fontSize: 11,
              padding: '4px 12px',
              borderRadius: 6,
              border: 'none',
              cursor: 'pointer',
              background: statusFilter === tab ? tabActiveBg : tabBg,
              color: statusFilter === tab ? tabActiveColor : tabColor,
              fontWeight: 500,
              textTransform: 'capitalize' as const,
            }}
          >
            {tab === 'all' ? t('all') : tab}
          </button>
        ))}
      </div>

      {/* Plans list */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} style={{ ...card, padding: '18px 20px', height: 64 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: skeletonHi }} />
                <div style={{ flex: 1 }}>
                  <div style={{ height: 12, borderRadius: 5, background: skeletonHi, width: '35%', marginBottom: 6 }} />
                  <div style={{ height: 10, borderRadius: 5, background: skeletonMid, width: '20%' }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : !selectedProject ? (
        <div style={{ ...card, padding: '60px 40px', textAlign: 'center' }}>
          <i className="bx bx-folder" style={{ fontSize: 40, color: emptyIconColor, display: 'block', marginBottom: 14 }} />
          <div style={{ fontSize: 15, fontWeight: 600, color: emptyTitleColor, marginBottom: 6 }}>{t('noProjectSelected')}</div>
          <div style={{ fontSize: 13, color: textDim }}>{t('selectOrCreateProject')}</div>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ ...card, padding: '60px 40px', textAlign: 'center' }}>
          <i className="bx bx-map-alt" style={{ fontSize: 40, color: emptyIconColor, display: 'block', marginBottom: 14 }} />
          <div style={{ fontSize: 15, fontWeight: 600, color: emptyTitleColor, marginBottom: 6 }}>
            {statusFilter !== 'all' ? t('noPlansFiltered', { status: statusFilter }) : t('noPlansYet')}
          </div>
          <div style={{ fontSize: 13, color: textDim, marginBottom: 20 }}>
            {statusFilter !== 'all' ? t('tryDifferentFilter') : t('createFirstPlan')}
          </div>
          {statusFilter === 'all' && (
            <button
              onClick={() => setShowNew(true)}
              style={{ padding: '9px 20px', borderRadius: 9, border: 'none', background: 'linear-gradient(135deg, #00e5ff, #a900ff)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
            >
              {t('createPlan')}
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map(plan => (
            <div
              key={plan.id}
              onClick={() => router.push(`/plans/${plan.id}?project=${selectedProject}`)}
              style={{ ...card, padding: '16px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}
            >
              {/* Icon */}
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: plan.status === 'completed' ? 'rgba(34,197,94,0.08)' : 'rgba(99,102,241,0.08)',
                border: `1px solid ${plan.status === 'completed' ? 'rgba(34,197,94,0.12)' : 'rgba(99,102,241,0.12)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <i className={`bx ${plan.status === 'completed' ? 'bx-check-circle' : 'bx-map-alt'}`} style={{
                  fontSize: 15,
                  color: plan.status === 'completed' ? '#22c55e' : '#6366f1',
                }} />
              </div>

              {/* Title + meta */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: textPrimary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {plan.title}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 3 }}>
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
                    <span style={{ fontSize: 11, color: featureCountColor }}>
                      <i className="bx bx-list-ul" style={{ fontSize: 12, marginInlineEnd: 3 }} />
                      {t('features', { count: plan.featureCount })}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                {plan.status === 'draft' && (
                  <button
                    onClick={(e) => { e.stopPropagation(); handleApprove(plan.id) }}
                    disabled={approvingId === plan.id}
                    title="Approve plan"
                    style={{
                      padding: '5px 12px', borderRadius: 7, border: 'none',
                      background: 'rgba(99,102,241,0.12)', color: '#6366f1',
                      fontSize: 11, fontWeight: 600, cursor: 'pointer',
                      opacity: approvingId === plan.id ? 0.6 : 1,
                    }}
                  >
                    {approvingId === plan.id ? t('approving') : t('approve')}
                  </button>
                )}
                {plan.status === 'in-progress' && (
                  <button
                    onClick={(e) => { e.stopPropagation(); handleComplete(plan.id) }}
                    disabled={completingId === plan.id}
                    title="Complete plan"
                    style={{
                      padding: '5px 12px', borderRadius: 7, border: 'none',
                      background: 'rgba(34,197,94,0.12)', color: '#22c55e',
                      fontSize: 11, fontWeight: 600, cursor: 'pointer',
                      opacity: completingId === plan.id ? 0.6 : 1,
                    }}
                  >
                    {completingId === plan.id ? t('completing') : t('complete')}
                  </button>
                )}
                {plan.status === 'completed' && (
                  <i className="bx bx-check-circle" style={{ fontSize: 18, color: '#22c55e' }} />
                )}
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(plan.id) }}
                  disabled={deletingId === plan.id}
                  title="Delete plan"
                  style={{
                    padding: '4px 6px', borderRadius: 6, border: 'none',
                    background: 'transparent', color: '#ef4444',
                    fontSize: 15, cursor: 'pointer',
                    opacity: deletingId === plan.id ? 0.4 : 0.6,
                  }}
                >
                  <i className={`bx ${deletingId === plan.id ? 'bx-loader-alt bx-spin' : 'bx-trash'}`} />
                </button>
                <i className="bx bx-chevron-right" style={{ fontSize: 18, color: actionColor }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Plan Modal */}
      {showNew && (
        <div
          onClick={e => { if (e.target === e.currentTarget) setShowNew(false) }}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
        >
          <div className="modal-content" style={{ width: '100%', maxWidth: 480, background: modalBg, border: `1px solid ${modalBorder}`, borderRadius: 16, padding: '28px 28px 24px', boxShadow: '0 24px 60px rgba(0,0,0,0.4)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: textPrimary, margin: 0, letterSpacing: '-0.01em' }}>{t('newPlan')}</h2>
              <button onClick={() => setShowNew(false)} style={{ background: 'none', border: 'none', color: textMuted, cursor: 'pointer', fontSize: 20, display: 'flex' }}>
                <i className="bx bx-x" />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 500, color: textMuted, marginBottom: 6, display: 'block' }}>
                  {t('project')}
                </label>
                <select
                  value={newProjectId || selectedProject || ''}
                  onChange={e => setNewProjectId(e.target.value)}
                  style={{ ...inputSt, cursor: 'pointer', appearance: 'none' as const, backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%2388889040' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center', paddingInlineEnd: 28 }}
                >
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 500, color: textMuted, marginBottom: 6, display: 'block' }}>
                  Title <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  autoFocus
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleCreate()}
                  placeholder={t('planTitlePlaceholder')}
                  style={inputSt}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 500, color: textMuted, marginBottom: 6, display: 'block' }}>
                  {t('description')} <span style={{ color: textDim, fontWeight: 400 }}>({t('descriptionOptionalMarkdown')})</span>
                </label>
                <textarea
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                  placeholder={t('planDescPlaceholder')}
                  rows={4}
                  style={{ ...inputSt, resize: 'vertical' }}
                />
              </div>

              {createError && (
                <div style={{ padding: '9px 12px', borderRadius: 8, background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', fontSize: 13 }}>
                  {createError}
                </div>
              )}

              <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
                <button
                  onClick={handleCreate}
                  disabled={creating || !newTitle.trim()}
                  style={{ flex: 1, padding: '10px', borderRadius: 9, border: 'none', background: newTitle.trim() ? 'linear-gradient(135deg, #00e5ff, #a900ff)' : 'var(--color-border)', color: newTitle.trim() ? '#fff' : textMuted, fontSize: 13, fontWeight: 600, cursor: newTitle.trim() ? 'pointer' : 'not-allowed', opacity: creating ? 0.7 : 1 }}
                >
                  {creating ? t('creating') : t('createPlan')}
                </button>
                <button
                  onClick={() => setShowNew(false)}
                  style={{ padding: '10px 18px', borderRadius: 9, border: `1px solid ${cardBorder}`, background: 'transparent', color: textMuted, fontSize: 13, cursor: 'pointer' }}
                >
                  {t('cancel')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================================
// MCP response parsers
// ============================================================

/** Parse list_projects response into minimal Project array for the selector. */
function parseMCPProjects(text: string): Project[] {
  const projects: Project[] = []
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

/**
 * Parse list_plans MCP markdown table response into Plan array.
 * Expected format:
 *   | ID | Title | Status | Features |
 *   |----|-------|--------|----------|
 *   | PLAN-ABC | My Plan | draft | 3 |
 *
 * Uses header-based column mapping for resilience against column order changes.
 */
function parseMCPPlans(text: string): Plan[] {
  const plans: Plan[] = []
  const lines = text.split('\n')
  let headerCols: string[] = []

  for (const line of lines) {
    if (!line.startsWith('|') || line.includes('---')) continue
    const cells = line.split('|').map(c => c.trim()).filter(Boolean)
    if (cells.length < 2) continue

    // Detect header row
    if (cells[0].toLowerCase() === 'id') {
      headerCols = cells.map(c => c.toLowerCase())
      continue
    }

    // Map cells by header position
    const row: Record<string, string> = {}
    cells.forEach((cell, i) => {
      const col = headerCols[i] || `col${i}`
      row[col] = cell
    })

    const id = row['id'] || cells[0]
    const title = row['title'] || cells[1] || ''
    const status = (row['status'] || cells[2] || 'draft').toLowerCase()
    const featuresRaw = row['features'] || cells[3] || '0'
    const featureCount = parseInt(featuresRaw, 10) || 0

    if (!id) continue

    plans.push({ id, title, status, featureCount })
  }

  return plans
}
