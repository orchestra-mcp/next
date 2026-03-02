'use client'
import { useEffect, useState } from 'react'
import { apiFetch } from '@/lib/api'
import { useThemeStore } from '@/store/theme'
import { use } from 'react'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'

interface Feature {
  id: string
  feature_id: string
  title: string
  description?: string
  status?: string
  priority?: string
  assignee?: string
  estimate?: string
  body?: string
}

interface ProjectDetail {
  id: string
  name: string
  slug?: string
  description?: string
  features?: Feature[]
  created_at?: string
}

const statusColors: Record<string, string> = {
  done: '#22c55e',
  'in-progress': '#00e5ff',
  'in-review': '#a900ff',
  'in-testing': '#f59e0b',
  'ready-for-testing': '#f59e0b',
  'in-docs': '#6366f1',
  'ready-for-docs': '#6366f1',
  documented: '#8b5cf6',
  todo: 'rgba(120,120,120,0.8)',
  backlog: 'rgba(120,120,120,0.5)',
}

const priorityColors: Record<string, string> = {
  P0: '#ef4444',
  P1: '#f97316',
  P2: '#eab308',
  P3: 'rgba(120,120,120,0.7)',
}

function StatusBadge({ status }: { status?: string }) {
  const s = status ?? 'backlog'
  const color = statusColors[s] ?? 'rgba(120,120,120,0.5)'
  return (
    <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 100, border: `1px solid ${color}30`, background: `${color}10`, color, fontWeight: 600, letterSpacing: '0.03em', textTransform: 'capitalize' }}>
      {s.replace(/-/g, ' ')}
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

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [project, setProject] = useState<ProjectDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeStatus, setActiveStatus] = useState<string>('all')
  const [expanded, setExpanded] = useState<string | null>(null)
  const { theme } = useThemeStore()
  const isDark = theme === 'dark'

  useEffect(() => {
    function fetchProject() {
      apiFetch<{ project: ProjectDetail; epics?: unknown[] } | ProjectDetail>(`/api/projects/${id}/tree`)
        .then(r => {
          const p = 'project' in r ? r.project : r as ProjectDetail
          setProject(p)
          setLoading(false)
        })
        .catch(() => {
          apiFetch<ProjectDetail | { project: ProjectDetail }>(`/api/projects/${id}`)
            .then(r => {
              const p = 'project' in r ? r.project : r as ProjectDetail
              setProject(p)
              setLoading(false)
            })
            .catch(() => setLoading(false))
        })
    }
    fetchProject()
    const interval = setInterval(fetchProject, 30000)

    // Listen for realtime sync events to refetch immediately
    function handleSync(e: Event) {
      const detail = (e as CustomEvent).detail
      if (detail?.entity_type === 'project' && detail?.entity_id === id) {
        fetchProject()
      }
      if (detail?.entity_type === 'feature') {
        fetchProject() // features are nested under project
      }
    }
    window.addEventListener('orchestra:sync', handleSync)

    return () => {
      clearInterval(interval)
      window.removeEventListener('orchestra:sync', handleSync)
    }
  }, [id])

  const textPrimary = isDark ? '#f8f8f8' : '#0f0f12'
  const textMuted = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.45)'
  const textDim = isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.3)'
  const cardBg = isDark ? 'rgba(255,255,255,0.025)' : '#ffffff'
  const cardBorder = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)'
  const breadcrumbColor = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)'
  const featureRowBg = isDark ? 'rgba(255,255,255,0.025)' : '#ffffff'
  const featureRowBorder = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'
  const featureIdColor = isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.25)'
  const filterActiveBg = isDark ? 'rgba(169,0,255,0.15)' : 'rgba(169,0,255,0.08)'
  const filterActiveColor = isDark ? '#c040ff' : '#a900ff'
  const filterInactiveBg = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'
  const filterInactiveColor = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.45)'
  const filterCountColor = isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.3)'
  const emptyIconColor = isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)'
  const emptyTitleColor = isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)'
  const statsColor = isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.35)'
  const idMonoColor = isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.25)'
  const skeletonHi = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)'
  const skeletonMid = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'
  const skeletonLo = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'
  const mdBodyBg = isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.015)'
  const mdBorder = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'
  const mdCodeBg = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'

  const card: React.CSSProperties = {
    background: cardBg,
    border: `1px solid ${cardBorder}`,
    borderRadius: 12,
  }

  if (loading) return (
    <div style={{ padding: '28px 32px' }}>
      <div style={{ height: 14, borderRadius: 6, background: skeletonHi, width: '25%', marginBottom: 24 }} />
      <div style={{ height: 22, borderRadius: 7, background: skeletonMid, width: '45%', marginBottom: 10 }} />
      <div style={{ height: 12, borderRadius: 5, background: skeletonLo, width: '70%', marginBottom: 32 }} />
    </div>
  )

  if (!project) return (
    <div style={{ padding: '28px 32px' }}>
      <Link href="/projects" style={{ fontSize: 13, color: breadcrumbColor, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 5, marginBottom: 20 }}>
        <i className="bx bx-left-arrow-alt" /> Back to Projects
      </Link>
      <div style={{ ...card, padding: '60px 40px', textAlign: 'center' }}>
        <i className="bx bx-error" style={{ fontSize: 36, color: emptyIconColor, display: 'block', marginBottom: 12 }} />
        <div style={{ color: emptyTitleColor, fontSize: 14 }}>Project not found.</div>
      </div>
    </div>
  )

  const features = project.features ?? []
  const statuses = ['all', ...Array.from(new Set(features.map(f => f.status ?? 'backlog')))]
  const visibleFeatures = activeStatus === 'all' ? features : features.filter(f => (f.status ?? 'backlog') === activeStatus)

  const statusCounts = features.reduce<Record<string, number>>((acc, f) => {
    const s = f.status ?? 'backlog'
    acc[s] = (acc[s] ?? 0) + 1
    return acc
  }, {})

  return (
    <div style={{ padding: '28px 32px' }}>
      {/* Breadcrumb */}
      <Link href="/projects" style={{ fontSize: 13, color: breadcrumbColor, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 5, marginBottom: 20 }}>
        <i className="bx bx-left-arrow-alt" style={{ fontSize: 15 }} /> Projects
      </Link>

      {/* Project header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 10 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(0,229,255,0.08)', border: '1px solid rgba(0,229,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <i className="bx bx-folder" style={{ fontSize: 20, color: '#00e5ff' }} />
          </div>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: textPrimary, margin: 0, letterSpacing: '-0.02em' }}>{project.name}</h1>
            {project.description && <p style={{ fontSize: 13, color: textMuted, marginTop: 5 }}>{project.description}</p>}
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: 20, paddingLeft: 54 }}>
          <span style={{ fontSize: 12, color: statsColor }}>
            <i className="bx bx-git-branch" style={{ marginRight: 4 }} />
            {features.length} features
          </span>
          {statusCounts['done'] && (
            <span style={{ fontSize: 12, color: '#22c55e' }}>
              <i className="bx bx-check-circle" style={{ marginRight: 4 }} />
              {statusCounts['done']} done
            </span>
          )}
          {project.slug && (
            <span style={{ fontSize: 12, color: idMonoColor, fontFamily: 'monospace' }}>
              {project.slug}
            </span>
          )}
        </div>
      </div>

      {/* Status filter tabs */}
      {features.length > 0 && (
        <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
          {statuses.map(s => (
            <button
              key={s}
              onClick={() => setActiveStatus(s)}
              style={{
                padding: '5px 12px', borderRadius: 7, fontSize: 12, fontWeight: 500, cursor: 'pointer', border: 'none',
                background: activeStatus === s ? filterActiveBg : filterInactiveBg,
                color: activeStatus === s ? filterActiveColor : filterInactiveColor,
                borderLeft: activeStatus === s ? '2px solid #a900ff' : '2px solid transparent',
              }}
            >
              {s === 'all' ? 'All' : s.replace(/-/g, ' ')}
              {s !== 'all' && statusCounts[s] && (
                <span style={{ marginLeft: 5, fontSize: 10, color: filterCountColor }}>({statusCounts[s]})</span>
              )}
              {s === 'all' && <span style={{ marginLeft: 5, fontSize: 10, color: filterCountColor }}>({features.length})</span>}
            </button>
          ))}
        </div>
      )}

      {/* Features list */}
      {features.length === 0 ? (
        <div style={{ ...card, padding: '60px 40px', textAlign: 'center' }}>
          <i className="bx bx-git-branch" style={{ fontSize: 36, color: emptyIconColor, display: 'block', marginBottom: 12 }} />
          <div style={{ fontSize: 14, fontWeight: 600, color: emptyTitleColor, marginBottom: 6 }}>No features yet</div>
          <div style={{ fontSize: 12, color: textDim }}>Create features using the Orchestra MCP tools.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {visibleFeatures.map(f => {
            const isExpanded = expanded === f.id
            const hasBody = !!f.body?.trim()
            return (
              <div key={f.id} style={{ background: featureRowBg, border: `1px solid ${isExpanded ? 'rgba(169,0,255,0.2)' : featureRowBorder}`, borderRadius: 12, overflow: 'hidden' }}>
                {/* Feature header row */}
                <div
                  onClick={() => hasBody && setExpanded(isExpanded ? null : f.id)}
                  style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12, cursor: hasBody ? 'pointer' : 'default' }}
                >
                  <div style={{ width: 28, height: 28, borderRadius: 7, background: 'rgba(169,0,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {hasBody ? (
                      <i className={`bx bx-chevron-${isExpanded ? 'down' : 'right'}`} style={{ fontSize: 14, color: '#a900ff' }} />
                    ) : (
                      <i className="bx bx-git-branch" style={{ fontSize: 13, color: '#a900ff' }} />
                    )}
                  </div>
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{ fontSize: 13.5, fontWeight: 500, color: textPrimary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{f.title || f.feature_id}</div>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 2 }}>
                      <span style={{ fontSize: 10.5, color: featureIdColor, fontFamily: 'monospace' }}>{f.feature_id}</span>
                      {f.assignee && <span style={{ fontSize: 10, color: textMuted }}>{f.assignee}</span>}
                      {f.estimate && <span style={{ fontSize: 10, color: textDim }}>{f.estimate}</span>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                    <PriorityBadge priority={f.priority} />
                    <StatusBadge status={f.status} />
                  </div>
                </div>

                {/* Expanded markdown body */}
                {isExpanded && hasBody && (
                  <div style={{
                    borderTop: `1px solid ${mdBorder}`,
                    background: mdBodyBg,
                    padding: '16px 20px',
                  }}>
                    <div
                      className="feature-markdown"
                      style={{
                        fontSize: 13,
                        lineHeight: 1.7,
                        color: textPrimary,
                      }}
                    >
                      <ReactMarkdown
                        components={{
                          h1: ({ children }) => <h1 style={{ fontSize: 18, fontWeight: 700, color: textPrimary, margin: '16px 0 8px', letterSpacing: '-0.01em' }}>{children}</h1>,
                          h2: ({ children }) => <h2 style={{ fontSize: 15, fontWeight: 600, color: textPrimary, margin: '14px 0 6px', letterSpacing: '-0.01em' }}>{children}</h2>,
                          h3: ({ children }) => <h3 style={{ fontSize: 13.5, fontWeight: 600, color: textPrimary, margin: '12px 0 4px' }}>{children}</h3>,
                          p: ({ children }) => <p style={{ margin: '6px 0', color: textMuted }}>{children}</p>,
                          ul: ({ children }) => <ul style={{ margin: '4px 0', paddingLeft: 20 }}>{children}</ul>,
                          ol: ({ children }) => <ol style={{ margin: '4px 0', paddingLeft: 20 }}>{children}</ol>,
                          li: ({ children }) => <li style={{ margin: '2px 0', color: textMuted, fontSize: 12.5 }}>{children}</li>,
                          code: ({ children, className }) => {
                            const isBlock = className?.includes('language-')
                            if (isBlock) {
                              return (
                                <pre style={{ background: mdCodeBg, borderRadius: 8, padding: '10px 14px', overflow: 'auto', margin: '8px 0', fontSize: 12, fontFamily: 'monospace', color: textPrimary }}>
                                  <code>{children}</code>
                                </pre>
                              )
                            }
                            return <code style={{ background: mdCodeBg, padding: '1px 5px', borderRadius: 4, fontSize: '0.9em', fontFamily: 'monospace', color: filterActiveColor }}>{children}</code>
                          },
                          pre: ({ children }) => <>{children}</>,
                          blockquote: ({ children }) => (
                            <blockquote style={{ borderLeft: `3px solid rgba(169,0,255,0.3)`, margin: '8px 0', paddingLeft: 14, color: textMuted }}>
                              {children}
                            </blockquote>
                          ),
                          hr: () => <hr style={{ border: 'none', borderTop: `1px solid ${mdBorder}`, margin: '12px 0' }} />,
                          a: ({ href, children }) => <a href={href} style={{ color: '#00e5ff', textDecoration: 'none' }} target="_blank" rel="noopener noreferrer">{children}</a>,
                          strong: ({ children }) => <strong style={{ fontWeight: 600, color: textPrimary }}>{children}</strong>,
                        }}
                      >
                        {f.body!}
                      </ReactMarkdown>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
