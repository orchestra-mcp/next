'use client'
import { useEffect, useState, useCallback } from 'react'
import { useMCP } from '@/hooks/useMCP'
import { useTranslations } from 'next-intl'
import Link from 'next/link'

interface Project {
  id: string
  slug: string
  name: string
  description?: string
  created_at: string
  updated_at: string
}

interface ProjectStatus {
  project_id: string
  total: number
  done: number
  in_progress: number
  backlog: number
  todo: number
}

export default function ProjectsPage() {
  const { callTool, status: connStatus, tunnel } = useMCP()
  const [projects, setProjects] = useState<Project[]>([])
  const [statuses, setStatuses] = useState<Record<string, ProjectStatus>>({})
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const t = useTranslations('app')
  const tNav = useTranslations('nav')

  const [deletingId, setDeletingId] = useState<string | null>(null)

  const fetchProjects = useCallback(async () => {
    if (connStatus !== 'connected') return
    try {
      const result = await callTool('list_projects')
      const text = result.content?.[0]?.text ?? ''
      // MCP returns markdown table — parse the JSON from structured content
      // The tool result text contains structured data we need to parse
      const parsed = parseMCPProjects(text)
      setProjects(parsed)
      setLoading(false)

      // Fetch status for each project
      const statusMap: Record<string, ProjectStatus> = {}
      for (const p of parsed) {
        try {
          const statusResult = await callTool('get_project_status', { project_id: p.id })
          const statusText = statusResult.content?.[0]?.text ?? ''
          const ps = parseMCPProjectStatus(statusText, p.id)
          if (ps) statusMap[p.id] = ps
        } catch {
          // skip status errors
        }
      }
      setStatuses(statusMap)
    } catch (e) {
      console.error('[projects] fetch error:', e)
      setLoading(false)
    }
  }, [connStatus, callTool])

  useEffect(() => {
    if (connStatus === 'connected') {
      fetchProjects()
    }
  }, [connStatus, fetchProjects])

  const filtered = projects.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.description ?? '').toLowerCase().includes(search.toLowerCase())
  )

  async function handleDelete(projectId: string) {
    setDeletingId(projectId)
    try {
      await callTool('delete_project', { project_id: projectId })
      await fetchProjects()
    } catch (e) {
      console.error('[projects] delete error:', e)
    } finally {
      setDeletingId(null)
    }
  }

  const textPrimary = 'var(--color-fg)'
  const textMuted = 'var(--color-fg-dim)'
  const textDim = 'var(--color-fg-dim)'
  const cardBg = 'var(--color-bg-alt)'
  const cardBorder = 'var(--color-border)'
  const searchBg = 'var(--color-bg-alt)'
  const searchBorder = 'var(--color-border)'
  const searchColor = 'var(--color-fg)'
  const searchIconColor = 'var(--color-fg-dim)'
  const idBg = 'var(--color-bg-alt)'
  const idBorder = 'var(--color-border)'
  const idColor = 'var(--color-fg-dim)'
  const cardFooterBorder = 'var(--color-border)'
  const dateColor = 'var(--color-fg-dim)'
  const calIconColor = 'var(--color-fg-dim)'
  const skeletonHi = 'var(--color-bg-active)'
  const skeletonMid = 'var(--color-bg-alt)'
  const skeletonLo = 'var(--color-bg-alt)'
  const emptyIconColor = 'var(--color-fg-dim)'
  const emptyTitleColor = 'var(--color-fg-muted)'
  const descColor = 'var(--color-fg-dim)'
  const progressBg = 'var(--color-bg-active)'
  const statsColor = 'var(--color-fg-dim)'
  const warnColor = '#f59e0b'

  const card: React.CSSProperties = {
    background: cardBg,
    border: `1px solid ${cardBorder}`,
    borderRadius: 14,
  }

  // Not connected — show connection prompt
  if (connStatus !== 'connected' && connStatus !== 'connecting') {
    return (
      <div className="page-wrapper" style={{ padding: '28px 32px' }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: textPrimary, margin: '0 0 24px', letterSpacing: '-0.02em' }}>{tNav('projects')}</h1>
        <div style={{ ...card, padding: '60px 40px', textAlign: 'center' }}>
          <i className="bx bx-transfer-alt" style={{ fontSize: 40, color: warnColor, display: 'block', marginBottom: 14 }} />
          <div style={{ fontSize: 15, fontWeight: 600, color: emptyTitleColor, marginBottom: 6 }}>{t('noTunnelConnected')}</div>
          <div style={{ fontSize: 13, color: textDim, marginBottom: 20 }}>
            {t('connectTunnelProjects')}
          </div>
          <Link href="/tunnels" style={{ padding: '9px 20px', borderRadius: 9, border: 'none', background: 'linear-gradient(135deg, #00e5ff, #a900ff)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', textDecoration: 'none', display: 'inline-block' }}>
            {t('goToTunnels')}
          </Link>
        </div>
      </div>
    )
  }

  // Connecting — show connecting state
  if (connStatus === 'connecting') {
    return (
      <div className="page-wrapper" style={{ padding: '28px 32px' }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: textPrimary, margin: '0 0 24px', letterSpacing: '-0.02em' }}>{tNav('projects')}</h1>
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
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: textPrimary, margin: 0, letterSpacing: '-0.02em' }}>{tNav('projects')}</h1>
          <p style={{ fontSize: 13, color: textMuted, marginTop: 5 }}>
            {loading ? t('loadingFromWorkspace') : `${projects.length} project${projects.length !== 1 ? 's' : ''}`}
            {tunnel && (
              <span style={{ marginInlineStart: 8, fontSize: 11, color: textDim }}>
                <i className="bx bx-link" style={{ marginInlineEnd: 3, fontSize: 12 }} />
                {tunnel.name}
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="search-wrapper" style={{ position: 'relative', marginBottom: 24, maxWidth: 380 }}>
        <i className="bx bx-search" style={{ position: 'absolute', insetInlineStart: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 15, color: searchIconColor, pointerEvents: 'none' }} />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={t('searchProjects')}
          style={{ width: '100%', padding: '9px 12px 9px 36px', borderRadius: 9, border: `1px solid ${searchBorder}`, background: searchBg, color: searchColor, fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
        />
      </div>

      {loading ? (
        <div className="grid-3col" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
          {[1,2,3,4,5,6].map(i => (
            <div key={i} style={{ ...card, padding: '20px', height: 130 }}>
              <div style={{ height: 14, borderRadius: 6, background: skeletonHi, marginBottom: 10, width: '60%' }} />
              <div style={{ height: 10, borderRadius: 5, background: skeletonMid, width: '85%', marginBottom: 6 }} />
              <div style={{ height: 10, borderRadius: 5, background: skeletonLo, width: '50%' }} />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ ...card, padding: '60px 40px', textAlign: 'center' }}>
          <i className="bx bx-folder" style={{ fontSize: 40, color: emptyIconColor, display: 'block', marginBottom: 14 }} />
          <div style={{ fontSize: 15, fontWeight: 600, color: emptyTitleColor, marginBottom: 6 }}>
            {search ? t('noMatchingProjects') : t('noProjectsYet')}
          </div>
          <div style={{ fontSize: 13, color: textDim }}>
            {search ? t('tryDifferentSearch') : t('createFirstProject')}
          </div>
        </div>
      ) : (
        <div className="grid-3col" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
          {filtered.map((p) => {
            const ps = statuses[p.id]
            const total = ps?.total ?? 0
            const done = ps?.done ?? 0
            const progress = total > 0 ? Math.round((done / total) * 100) : 0
            return (
              <Link key={p.id} href={`/projects/${p.id}`} style={{ ...card, padding: '20px 22px', textDecoration: 'none', display: 'block' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 10 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 9, background: 'rgba(0,229,255,0.08)', border: '1px solid rgba(0,229,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <i className="bx bx-folder" style={{ fontSize: 17, color: '#00e5ff' }} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 100, background: idBg, border: `1px solid ${idBorder}`, color: idColor, fontFamily: 'monospace', letterSpacing: '0.02em' }}>
                      {p.id}
                    </span>
                    <button
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDelete(p.id) }}
                      disabled={deletingId === p.id}
                      title="Delete project"
                      style={{ padding: '2px 5px', borderRadius: 5, border: 'none', background: 'transparent', color: '#ef4444', fontSize: 13, cursor: 'pointer', opacity: deletingId === p.id ? 0.4 : 0.5 }}
                    >
                      <i className={`bx ${deletingId === p.id ? 'bx-loader-alt bx-spin' : 'bx-trash'}`} />
                    </button>
                  </div>
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: textPrimary, marginBottom: 5, letterSpacing: '-0.01em' }}>{p.name}</div>
                {p.description && (
                  <div style={{ fontSize: 12, color: descColor, lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const }}>
                    {p.description}
                  </div>
                )}

                {/* Progress bar */}
                {total > 0 && (
                  <div style={{ marginTop: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 10, color: statsColor }}>{t('featuresDone', { done, total })}</span>
                      <span style={{ fontSize: 10, color: progress === 100 ? '#22c55e' : statsColor }}>{progress}%</span>
                    </div>
                    <div style={{ height: 4, borderRadius: 2, background: progressBg, overflow: 'hidden' }}>
                      <div style={{ height: '100%', borderRadius: 2, background: progress === 100 ? '#22c55e' : 'linear-gradient(90deg, #00e5ff, #a900ff)', width: `${progress}%`, transition: 'width 0.3s ease' }} />
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: total > 0 ? 10 : 14, paddingTop: 12, borderTop: `1px solid ${cardFooterBorder}` }}>
                  <i className="bx bx-calendar" style={{ fontSize: 12, color: calIconColor }} />
                  <span style={{ fontSize: 11, color: dateColor }}>{new Date(p.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
              </Link>
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

/** Slugify a project name the same way the Go backend does. */
function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'project'
}

/** Parse list_projects MCP markdown response into Project array.
 *  Format: "## Projects (N)\n\n- **Name** (`slug`) — description\n"
 */
function parseMCPProjects(text: string): Project[] {
  const projects: Project[] = []
  const lines = text.split('\n')

  for (const line of lines) {
    // Match: - **Project Name** (`slug`) — description
    // or:   - **Project Name** (`slug`)
    // Also support legacy format without slug: - **Name** — description
    const matchWithSlug = line.match(/^-\s+\*\*(.+?)\*\*\s+\(`([^)]+)`\)(?:\s*[—–-]\s*(.+))?$/)
    const matchLegacy = line.match(/^-\s+\*\*(.+?)\*\*(?:\s*[—–-]\s*(.+))?$/)

    if (matchWithSlug) {
      const name = matchWithSlug[1].trim()
      const slug = matchWithSlug[2].trim()
      const description = matchWithSlug[3]?.trim() || undefined
      projects.push({
        id: slug,
        slug,
        name,
        description,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
    } else if (matchLegacy) {
      const name = matchLegacy[1].trim()
      const description = matchLegacy[2]?.trim() || undefined
      const slug = slugify(name)
      projects.push({
        id: slug,
        slug,
        name,
        description,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
    }
  }

  return projects
}

/** Parse get_project_status MCP response. */
function parseMCPProjectStatus(text: string, projectId: string): ProjectStatus | null {
  // get_project_status returns:
  // ## Project: name
  // **Completion:** X%
  // | Status | Count |
  // |--------|-------|
  // | done   | 5     |
  // | in-progress | 2 |
  // ...
  const status: ProjectStatus = { project_id: projectId, total: 0, done: 0, in_progress: 0, backlog: 0, todo: 0 }

  const lines = text.split('\n')
  for (const line of lines) {
    if (!line.startsWith('|') || line.includes('---') || line.toLowerCase().includes('| status')) continue
    const cells = line.split('|').map(c => c.trim()).filter(Boolean)
    if (cells.length >= 2) {
      const key = cells[0].toLowerCase().replace(/\s+/g, '_').replace(/-/g, '_')
      const count = parseInt(cells[1], 10)
      if (!isNaN(count)) {
        status.total += count
        if (key === 'done') status.done = count
        else if (key === 'in_progress') status.in_progress = count
        else if (key === 'backlog') status.backlog = count
        else if (key === 'todo') status.todo = count
      }
    }
  }

  // Also try matching "**Completion:** X%" or "Total: X"
  const totalMatch = text.match(/total[:\s]+(\d+)/i)
  if (totalMatch) status.total = parseInt(totalMatch[1], 10)

  const doneMatch = text.match(/done[:\s]+(\d+)/i)
  if (doneMatch) status.done = parseInt(doneMatch[1], 10)

  return status.total > 0 ? status : null
}
