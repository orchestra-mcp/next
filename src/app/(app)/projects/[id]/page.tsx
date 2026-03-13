'use client'
import { useEffect, useState, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useMCP } from '@/hooks/useMCP'
import { use } from 'react'
import Link from 'next/link'
import { useSidebarMetaStore } from '@/store/sidebar-meta'
import { useRoleStore } from '@/store/roles'

interface Feature {
  id: string
  title: string
  description?: string
  status: string
  priority?: string
  kind?: string
  assignee?: string
  estimate?: string
  labels?: string[]
}

interface Plan {
  id: string
  title: string
  status: string
  featureCount: number
}

const statusColors: Record<string, string> = {
  done: '#22c55e',
  'in-progress': '#00e5ff',
  'in-review': '#a900ff',
  'in-testing': '#f59e0b',
  'in-docs': '#6366f1',
  'needs-edits': '#ef4444',
  todo: 'rgba(120,120,120,0.8)',
  backlog: 'rgba(120,120,120,0.5)',
}

const statusOrder = ['in-progress', 'in-review', 'in-testing', 'in-docs', 'needs-edits', 'todo', 'done', 'backlog']

const priorityColors: Record<string, string> = {
  P0: '#ef4444',
  P1: '#f97316',
  P2: '#eab308',
  P3: 'rgba(120,120,120,0.7)',
}

const planStatusColors: Record<string, string> = {
  draft: 'rgba(120,120,120,0.7)',
  approved: '#00e5ff',
  'in-progress': '#f59e0b',
  completed: '#22c55e',
}

/** Default accent when no sidebar color is set. */
const DEFAULT_ACCENT = '#a900ff'

// ── Tooltip wrapper for stacked avatars ──
function AvatarTooltip({ label, children }: { label: string; children: React.ReactNode }) {
  const [show, setShow] = useState(false)
  const [pos, setPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const ref = useRef<HTMLDivElement>(null)

  return (
    <div
      ref={ref}
      onMouseEnter={() => {
        if (ref.current) {
          const r = ref.current.getBoundingClientRect()
          setPos({ x: r.left + r.width / 2, y: r.top - 4 })
        }
        setShow(true)
      }}
      onMouseLeave={() => setShow(false)}
      style={{ display: 'inline-flex', position: 'relative' }}
    >
      {children}
      {show && createPortal(
        <div style={{
          position: 'fixed', left: pos.x, top: pos.y, transform: 'translate(-50%, -100%)',
          zIndex: 10010, pointerEvents: 'none',
          padding: '4px 8px', borderRadius: 6,
          background: 'var(--color-bg-contrast)', border: '1px solid var(--color-border)',
          boxShadow: 'var(--color-shadow-sm)',
          fontSize: 11, fontWeight: 600, color: 'var(--color-fg)',
          whiteSpace: 'nowrap',
        }}>
          {label}
        </div>,
        document.body
      )}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const color = statusColors[status] ?? 'rgba(120,120,120,0.5)'
  return (
    <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 100, border: `1px solid ${color}30`, background: `${color}10`, color, fontWeight: 600, letterSpacing: '0.03em', textTransform: 'capitalize' }}>
      {status.replace(/-/g, ' ')}
    </span>
  )
}

function PriorityBadge({ priority }: { priority?: string }) {
  if (!priority) return null
  const color = priorityColors[priority] ?? 'rgba(120,120,120,0.7)'
  return (
    <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 5, background: `${color}15`, color, fontWeight: 700 }}>
      {priority}
    </span>
  )
}

function KindBadge({ kind }: { kind?: string }) {
  if (!kind || kind === 'feature') return null
  const colors: Record<string, string> = { bug: '#ef4444', hotfix: '#f97316', chore: '#6b7280', testcase: '#8b5cf6' }
  const color = colors[kind] ?? '#6b7280'
  return (
    <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 4, background: `${color}12`, color, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
      {kind}
    </span>
  )
}

function StatusDot({ status }: { status: string }) {
  const color = statusColors[status] ?? 'rgba(120,120,120,0.5)'
  return <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0, display: 'inline-block' }} />
}

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { callTool, status: connStatus } = useMCP()
  const [projectName, setProjectName] = useState<string>(id)
  const [projectDesc, setProjectDesc] = useState<string>('')
  const [features, setFeatures] = useState<Feature[]>([])
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [activeStatus, setActiveStatus] = useState<string>('all')

  // Subscribe to all sidebar-meta items so any change triggers re-render
  const sidebarItems = useSidebarMetaStore(s => s.items)
  const metaStore = useSidebarMetaStore()
  const projectMeta = sidebarItems[`projects:${id}`]
  const accent = projectMeta?.color || DEFAULT_ACCENT
  const icon = projectMeta?.icon || 'bx-folder'
  const customName = projectMeta?.customName

  // Teams & members
  const { teams: allTeams, members: allMembers } = useRoleStore()
  const teamIds = metaStore.getTeamIds('projects', id)
  const assigneeIds = metaStore.getAssigneeIds('projects', id)
  const projectTeams = allTeams.filter(t => teamIds.includes(t.id))
  const projectMembers = allMembers.filter(m => assigneeIds.includes(String(m.id)))

  // Project date
  const [projectDate, setProjectDate] = useState<string>('')

  const fetchProjectData = useCallback(async () => {
    if (connStatus !== 'connected') return
    try {
      const [featResult, plansResult] = await Promise.all([
        callTool('list_features', { project_id: id }),
        callTool('list_plans', { project_id: id }).catch(() => null),
      ])

      const featText = featResult.content?.[0]?.text ?? ''
      setFeatures(parseMCPFeatures(featText))

      if (plansResult) {
        const plansText = plansResult.content?.[0]?.text ?? ''
        setPlans(parseMCPPlans(plansText))
      }

      try {
        const statusResult = await callTool('get_project_status', { project_id: id })
        const statusText = statusResult.content?.[0]?.text ?? ''
        const nameMatch = statusText.match(/##\s+Project:\s*(.+)/i) || statusText.match(/\*\*(.+?)\*\*/)
        if (nameMatch) setProjectName(nameMatch[1].trim())
        const descMatch = statusText.match(/\*\*Description:\*\*\s*(.+)/i)
        if (descMatch) setProjectDesc(descMatch[1].trim())
        const dateMatch = statusText.match(/\*\*Created:\*\*\s*(.+)/i) || statusText.match(/created[_\s]?at[:\s]*(\S+)/i)
        if (dateMatch) setProjectDate(dateMatch[1].trim())
      } catch { /* fallback to id */ }

      setLoading(false)
    } catch (e) {
      console.error('[project-detail] fetch error:', e)
      setLoading(false)
    }
  }, [connStatus, callTool, id])

  useEffect(() => {
    if (connStatus === 'connected') fetchProjectData()
  }, [connStatus, fetchProjectData])

  // --- Theme vars ---
  const textPrimary = 'var(--color-fg)'
  const textMuted = 'var(--color-fg-muted)'
  const textDim = 'var(--color-fg-dim)'
  const cardBg = 'var(--color-bg-alt)'
  const cardBorder = 'var(--color-border)'
  const breadcrumbColor = 'var(--color-fg-muted)'
  const statsColor = 'var(--color-fg-dim)'
  const filterActiveBg = 'rgba(169,0,255,0.11)'
  const filterActiveColor = '#a900ff'
  const filterInactiveBg = 'var(--color-bg-alt)'
  const filterInactiveColor = 'var(--color-fg-muted)'
  const filterCountColor = 'var(--color-fg-dim)'
  const emptyIconColor = 'var(--color-fg-dim)'
  const emptyTitleColor = 'var(--color-fg-dim)'
  const skeletonHi = 'var(--color-bg-active)'
  const skeletonMid = 'var(--color-bg-active)'
  const skeletonLo = 'var(--color-bg-alt)'

  const card: React.CSSProperties = { background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 12 }

  if (connStatus !== 'connected') {
    return (
      <div className="page-wrapper" style={{ padding: '28px 32px' }}>
        <Link href="/projects" style={{ fontSize: 13, color: breadcrumbColor, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 5, marginBottom: 20 }}>
          <i className="bx bx-left-arrow-alt rtl-flip" /> Projects
        </Link>
        <div style={{ ...card, padding: '60px 40px', textAlign: 'center' }}>
          <i className="bx bx-transfer-alt" style={{ fontSize: 36, color: emptyIconColor, display: 'block', marginBottom: 12 }} />
          <div style={{ color: emptyTitleColor, fontSize: 14 }}>Connect to a tunnel to view this project.</div>
        </div>
      </div>
    )
  }

  if (loading) return (
    <div className="page-wrapper" style={{ padding: '28px 32px' }}>
      <div style={{ height: 14, borderRadius: 6, background: skeletonHi, width: '25%', marginBottom: 24 }} />
      <div style={{ height: 22, borderRadius: 7, background: skeletonMid, width: '45%', marginBottom: 10 }} />
      <div style={{ height: 12, borderRadius: 5, background: skeletonLo, width: '70%', marginBottom: 32 }} />
    </div>
  )

  // --- Derived data ---
  const statusCounts = features.reduce<Record<string, number>>((acc, f) => {
    acc[f.status] = (acc[f.status] ?? 0) + 1
    return acc
  }, {})
  const doneCount = statusCounts['done'] ?? 0
  const progress = features.length > 0 ? Math.round((doneCount / features.length) * 100) : 0

  // Group features by status in a canonical order
  const groupedFeatures: Record<string, Feature[]> = {}
  const presentStatuses = statusOrder.filter(s => statusCounts[s])
  for (const s of presentStatuses) {
    groupedFeatures[s] = features.filter(f => f.status === s)
  }
  // Add any statuses not in our canonical order
  for (const s of Object.keys(statusCounts)) {
    if (!groupedFeatures[s]) groupedFeatures[s] = features.filter(f => f.status === s)
  }

  const filteredStatuses = activeStatus === 'all' ? Object.keys(groupedFeatures) : [activeStatus]
  const statusList = ['all', ...Object.keys(groupedFeatures)]

  return (
    <div className="page-wrapper" style={{ padding: '28px 32px' }}>
      {/* Breadcrumb */}
      <Link href="/projects" style={{ fontSize: 13, color: breadcrumbColor, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 5, marginBottom: 20 }}>
        <i className="bx bx-left-arrow-alt rtl-flip" style={{ fontSize: 15 }} /> Projects
      </Link>

      {/* ═══════════════════════ Project Header ═══════════════════════ */}
      <div style={{ marginBottom: 28, background: cardBg, borderRadius: 16, padding: '24px 28px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
          {/* Icon */}
          <div style={{ width: 52, height: 52, borderRadius: 14, background: `${accent}12`, border: `1.5px solid ${accent}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <i className={`bx ${icon}`} style={{ fontSize: 26, color: accent }} />
          </div>

          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: textPrimary, margin: 0, letterSpacing: '-0.02em' }}>{customName || projectName}</h1>
            {projectDesc && <p style={{ fontSize: 13, color: textMuted, marginTop: 6, lineHeight: 1.5 }}>{projectDesc}</p>}

            {/* Stats row */}
            <div style={{ display: 'flex', gap: 20, marginTop: 14, flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: statsColor, display: 'flex', alignItems: 'center', gap: 4 }}>
                <i className="bx bx-git-branch" /> {features.length} features
              </span>
              {doneCount > 0 && (
                <span style={{ fontSize: 12, color: '#22c55e', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <i className="bx bx-check-circle" /> {doneCount} done
                </span>
              )}
              {plans.length > 0 && (
                <span style={{ fontSize: 12, color: statsColor, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <i className="bx bx-map" /> {plans.length} plan{plans.length !== 1 ? 's' : ''}
                </span>
              )}
              {projectDate && (
                <span style={{ fontSize: 12, color: statsColor, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <i className="bx bx-calendar" /> {new Date(projectDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                </span>
              )}
              <span style={{ fontSize: 11, color: textDim, fontFamily: 'monospace' }}>{id}</span>
            </div>

            {/* Progress bar */}
            {features.length > 0 && (
              <div style={{ marginTop: 14, maxWidth: 320 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 10, color: statsColor }}>{doneCount} / {features.length} complete</span>
                  <span style={{ fontSize: 10, color: progress === 100 ? '#22c55e' : statsColor, fontWeight: 600 }}>{progress}%</span>
                </div>
                <div style={{ height: 5, borderRadius: 3, background: 'var(--color-bg-active)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', borderRadius: 3, background: progress === 100 ? '#22c55e' : `linear-gradient(90deg, ${accent}, ${accent}88)`, width: `${progress}%`, transition: 'width 0.3s ease' }} />
                </div>
              </div>
            )}

            {/* Teams & Members stacked avatars */}
            {(projectTeams.length > 0 || projectMembers.length > 0) && (
              <div style={{ display: 'flex', gap: 16, marginTop: 14, alignItems: 'center', flexWrap: 'wrap' }}>
                {projectTeams.length > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 10, color: textDim, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Teams</span>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      {projectTeams.map((tm, idx) => (
                        <AvatarTooltip key={tm.id} label={tm.name}>
                          <div style={{
                            width: 28, height: 28, borderRadius: '50%',
                            background: tm.avatar_url ? 'transparent' : `${accent}22`,
                            border: '2px solid var(--color-bg-alt)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            overflow: 'hidden', flexShrink: 0, cursor: 'default',
                            marginInlineStart: idx > 0 ? -8 : 0,
                            zIndex: projectTeams.length - idx,
                          }}>
                            {tm.avatar_url ? (
                              <img src={tm.avatar_url} alt={tm.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              <span style={{ fontSize: 11, fontWeight: 700, color: accent }}>{tm.name.charAt(0).toUpperCase()}</span>
                            )}
                          </div>
                        </AvatarTooltip>
                      ))}
                    </div>
                  </div>
                )}
                {projectMembers.length > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 10, color: textDim, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Members</span>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      {projectMembers.map((m, idx) => (
                        <AvatarTooltip key={m.id} label={m.name}>
                          <div style={{
                            width: 28, height: 28, borderRadius: '50%',
                            background: m.avatar_url ? 'transparent' : 'rgba(0,229,255,0.13)',
                            border: '2px solid var(--color-bg-alt)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            overflow: 'hidden', flexShrink: 0, cursor: 'default',
                            marginInlineStart: idx > 0 ? -8 : 0,
                            zIndex: projectMembers.length - idx,
                          }}>
                            {m.avatar_url ? (
                              <img src={m.avatar_url} alt={m.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              <span style={{ fontSize: 11, fontWeight: 700, color: '#00e5ff' }}>{m.name.charAt(0).toUpperCase()}</span>
                            )}
                          </div>
                        </AvatarTooltip>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ═══════════════════════ Plans Section ═══════════════════════ */}
      {plans.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, color: textMuted, margin: '0 0 12px', letterSpacing: '0.02em', textTransform: 'uppercase' }}>Plans</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 10 }}>
            {plans.map(p => {
              const pColor = planStatusColors[p.status] ?? 'rgba(120,120,120,0.5)'
              return (
                <Link key={p.id} href={`/plans/${p.id}?project=${id}`} style={{ ...card, padding: '14px 18px', textDecoration: 'none', display: 'block' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <i className="bx bx-map" style={{ fontSize: 16, color: pColor }} />
                    <span style={{ fontSize: 13.5, fontWeight: 500, color: textPrimary, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 100, border: `1px solid ${pColor}30`, background: `${pColor}10`, color: pColor, fontWeight: 600 }}>
                      {p.status}
                    </span>
                    <span style={{ fontSize: 10.5, color: textDim, fontFamily: 'monospace' }}>{p.id}</span>
                    <span style={{ fontSize: 10, color: textDim, marginInlineStart: 'auto' }}>{p.featureCount} features</span>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* ═══════════════════════ Status Filter Tabs ═══════════════════════ */}
      {features.length > 0 && (
        <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
          {statusList.map(s => (
            <button
              key={s}
              onClick={() => setActiveStatus(s)}
              style={{
                padding: '5px 12px', borderRadius: 7, fontSize: 12, fontWeight: 500, cursor: 'pointer', border: 'none',
                background: activeStatus === s ? filterActiveBg : filterInactiveBg,
                color: activeStatus === s ? filterActiveColor : filterInactiveColor,
                /* no left border */
              }}
            >
              {s === 'all' ? 'All' : s.replace(/-/g, ' ')}
              <span style={{ marginInlineStart: 5, fontSize: 10, color: filterCountColor }}>
                ({s === 'all' ? features.length : statusCounts[s] ?? 0})
              </span>
            </button>
          ))}
        </div>
      )}

      {/* ═══════════════════════ Features Grouped by Status ═══════════════════════ */}
      {features.length === 0 ? (
        <div style={{ ...card, padding: '60px 40px', textAlign: 'center' }}>
          <i className="bx bx-git-branch" style={{ fontSize: 36, color: emptyIconColor, display: 'block', marginBottom: 12 }} />
          <div style={{ fontSize: 14, fontWeight: 600, color: emptyTitleColor, marginBottom: 6 }}>No features yet</div>
          <div style={{ fontSize: 12, color: textDim }}>Create features using the Orchestra MCP tools.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {filteredStatuses.map(status => {
            const group = groupedFeatures[status]
            if (!group || group.length === 0) return null
            const sColor = statusColors[status] ?? 'rgba(120,120,120,0.5)'
            return (
              <div key={status}>
                {/* Status group header */}
                {activeStatus === 'all' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <StatusDot status={status} />
                    <span style={{ fontSize: 12, fontWeight: 600, color: sColor, textTransform: 'capitalize', letterSpacing: '0.02em' }}>
                      {status.replace(/-/g, ' ')}
                    </span>
                    <span style={{ fontSize: 10, color: textDim }}>({group.length})</span>
                  </div>
                )}

                {/* Feature rows */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {group.map(f => (
                    <Link
                      key={f.id}
                      href={`/projects/${id}/features/${f.id}`}
                      style={{
                        background: cardBg,
                        border: `1px solid ${cardBorder}`,
                        borderRadius: 10,
                        padding: '12px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        textDecoration: 'none',
                        transition: 'border-color 0.15s ease',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.borderColor = `${accent}40`)}
                      onMouseLeave={e => (e.currentTarget.style.borderColor = cardBorder)}
                    >
                      {/* Status dot */}
                      <StatusDot status={f.status} />

                      {/* Title + meta */}
                      <div style={{ flex: 1, overflow: 'hidden' }}>
                        <div style={{ fontSize: 13.5, fontWeight: 500, color: textPrimary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{f.title}</div>
                        <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 2 }}>
                          <span style={{ fontSize: 10.5, color: textDim, fontFamily: 'monospace' }}>{f.id}</span>
                          {f.assignee && (
                            <span style={{ fontSize: 10, color: textMuted, display: 'flex', alignItems: 'center', gap: 3 }}>
                              <i className="bx bx-user" style={{ fontSize: 11 }} /> {f.assignee}
                            </span>
                          )}
                          {f.estimate && (
                            <span style={{ fontSize: 9, padding: '1px 5px', borderRadius: 3, background: 'var(--color-bg-active)', color: textDim, fontWeight: 600 }}>{f.estimate}</span>
                          )}
                        </div>
                      </div>

                      {/* Badges */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                        <KindBadge kind={f.kind} />
                        <PriorityBadge priority={f.priority} />
                        {activeStatus !== 'all' && <StatusBadge status={f.status} />}
                      </div>

                      {/* Chevron */}
                      <i className="bx bx-chevron-right rtl-flip" style={{ fontSize: 16, color: textDim, flexShrink: 0 }} />
                    </Link>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ============================================================
// MCP response parsers
// ============================================================

function parseMCPFeatures(text: string): Feature[] {
  const features: Feature[] = []
  const lines = text.split('\n')
  for (const line of lines) {
    if (!line.startsWith('|') || line.includes('---')) continue
    const cells = line.split('|').map(c => c.trim()).filter(Boolean)
    if (cells.length >= 3) {
      const id = cells[0]
      const title = cells[1]
      const status = cells[2]
      if (id.toLowerCase() === 'id' || id.toLowerCase().includes('feature')) continue
      const priority = cells.length > 3 ? cells[3] : undefined
      const kind = cells.length > 4 ? cells[4] : undefined
      const assignee = cells.length > 5 && cells[5] !== '—' && cells[5] !== '-' ? cells[5] : undefined
      if (id.startsWith('FEAT-')) {
        features.push({
          id,
          title,
          status: status.toLowerCase().replace(/\s+/g, '-'),
          priority: priority && priority !== '—' ? priority : undefined,
          kind: kind && kind !== '—' ? kind.toLowerCase() : undefined,
          assignee,
        })
      }
    }
  }
  return features
}

function parseMCPPlans(text: string): Plan[] {
  const plans: Plan[] = []
  const lines = text.split('\n')
  for (const line of lines) {
    if (!line.startsWith('|') || line.includes('---')) continue
    const cells = line.split('|').map(c => c.trim()).filter(Boolean)
    if (cells.length >= 3) {
      const id = cells[0]
      const title = cells[1]
      const status = cells[2]
      if (id.toLowerCase() === 'id' || id.toLowerCase().includes('plan')) continue
      const featureCount = cells.length > 3 ? parseInt(cells[3], 10) || 0 : 0
      if (id.startsWith('PLAN-')) {
        plans.push({ id, title, status: status.toLowerCase(), featureCount })
      }
    }
  }
  return plans
}
