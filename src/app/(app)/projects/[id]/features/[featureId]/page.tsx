'use client'
import { useEffect, useState, useCallback } from 'react'
import { useMCP } from '@/hooks/useMCP'
import { use } from 'react'
import Link from 'next/link'
import { MarkdownRenderer } from '@orchestra-mcp/editor/MarkdownRenderer'
import { useSidebarMetaStore } from '@/store/sidebar-meta'

interface FeatureMeta {
  id: string
  title: string
  status: string
  priority: string
  kind: string
  assignee: string
  estimate: string
  labels: string[]
  dependsOn: string[]
  lockedBy: string
  lockedSince: string
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

const priorityColors: Record<string, string> = {
  P0: '#ef4444',
  P1: '#f97316',
  P2: '#eab308',
  P3: 'rgba(120,120,120,0.7)',
}

const kindIcons: Record<string, string> = {
  feature: 'bx-star',
  bug: 'bx-bug',
  hotfix: 'bx-bolt-circle',
  chore: 'bx-wrench',
  testcase: 'bx-test-tube',
}

const statusIcons: Record<string, string> = {
  done: 'bx-check-circle',
  'in-progress': 'bx-loader-circle',
  'in-review': 'bx-show',
  'in-testing': 'bx-flask',
  'in-docs': 'bx-file',
  'needs-edits': 'bx-edit',
  todo: 'bx-circle',
  backlog: 'bx-archive',
}

export default function FeatureDetailPage({ params }: { params: Promise<{ id: string; featureId: string }> }) {
  const { id: projectId, featureId } = use(params)
  const { callTool, status: connStatus } = useMCP()
  const [meta, setMeta] = useState<FeatureMeta | null>(null)
  const [body, setBody] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [projectName, setProjectName] = useState<string>(projectId)

  // Reactive sidebar meta for project custom name
  const displayProjectName = useSidebarMetaStore(s => s.items[`projects:${projectId}`]?.customName) || projectName

  const fetchFeature = useCallback(async () => {
    if (connStatus !== 'connected') return
    try {
      const result = await callTool('get_feature', { project_id: projectId, feature_id: featureId })
      const text = result.content?.[0]?.text ?? ''
      const parsed = parseFeatureResponse(text)
      setMeta(parsed.meta)
      setBody(parsed.body)

      // Try to get project name
      try {
        const statusResult = await callTool('get_project_status', { project_id: projectId })
        const statusText = statusResult.content?.[0]?.text ?? ''
        const nameMatch = statusText.match(/##\s+Project:\s*(.+)/i) || statusText.match(/\*\*(.+?)\*\*/)
        if (nameMatch) setProjectName(nameMatch[1].trim())
      } catch { /* fallback */ }

      setLoading(false)
    } catch (e) {
      console.error('[feature-detail] fetch error:', e)
      setLoading(false)
    }
  }, [connStatus, callTool, projectId, featureId])

  useEffect(() => {
    if (connStatus === 'connected') fetchFeature()
  }, [connStatus, fetchFeature])

  // --- Theme ---
  const textPrimary = 'var(--color-fg)'
  const textMuted = 'var(--color-fg-muted)'
  const textDim = 'var(--color-fg-dim)'
  const cardBg = 'var(--color-bg-alt)'
  const cardBorder = 'var(--color-border)'
  const breadcrumbColor = 'var(--color-fg-muted)'
  const emptyIconColor = 'var(--color-fg-dim)'
  const emptyTitleColor = 'var(--color-fg-dim)'
  const skeletonHi = 'var(--color-bg-active)'
  const skeletonMid = 'var(--color-bg-active)'
  const skeletonLo = 'var(--color-bg-alt)'

  if (connStatus !== 'connected') {
    return (
      <div className="page-wrapper" style={{ padding: '28px 32px' }}>
        <Link href={`/projects/${projectId}`} style={{ fontSize: 13, color: breadcrumbColor, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 5, marginBottom: 20 }}>
          <i className="bx bx-left-arrow-alt rtl-flip" /> Back to project
        </Link>
        <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 12, padding: '60px 40px', textAlign: 'center' }}>
          <i className="bx bx-transfer-alt" style={{ fontSize: 36, color: emptyIconColor, display: 'block', marginBottom: 12 }} />
          <div style={{ color: emptyTitleColor, fontSize: 14 }}>Connect to a tunnel to view this feature.</div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="page-wrapper" style={{ padding: '28px 32px' }}>
        <div style={{ height: 14, borderRadius: 6, background: skeletonHi, width: '30%', marginBottom: 24 }} />
        <div style={{ height: 26, borderRadius: 7, background: skeletonMid, width: '55%', marginBottom: 10 }} />
        <div style={{ height: 12, borderRadius: 5, background: skeletonLo, width: '80%', marginBottom: 32 }} />
        <div style={{ height: 200, borderRadius: 12, background: skeletonLo }} />
      </div>
    )
  }

  if (!meta) {
    return (
      <div className="page-wrapper" style={{ padding: '28px 32px' }}>
        <Link href={`/projects/${projectId}`} style={{ fontSize: 13, color: breadcrumbColor, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 5, marginBottom: 20 }}>
          <i className="bx bx-left-arrow-alt rtl-flip" /> Back to project
        </Link>
        <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 12, padding: '60px 40px', textAlign: 'center' }}>
          <i className="bx bx-error-circle" style={{ fontSize: 36, color: '#ef4444', display: 'block', marginBottom: 12 }} />
          <div style={{ color: emptyTitleColor, fontSize: 14 }}>Feature not found.</div>
        </div>
      </div>
    )
  }

  const sColor = statusColors[meta.status] ?? 'rgba(120,120,120,0.5)'
  const pColor = priorityColors[meta.priority] ?? 'rgba(120,120,120,0.7)'
  const kIcon = kindIcons[meta.kind] ?? 'bx-star'
  const sIcon = statusIcons[meta.status] ?? 'bx-circle'

  const metaItems: { label: string; icon: string; value: string; color?: string }[] = []
  if (meta.assignee) metaItems.push({ label: 'Assignee', icon: 'bx-user', value: meta.assignee })
  if (meta.estimate) metaItems.push({ label: 'Estimate', icon: 'bx-expand', value: meta.estimate })
  if (meta.dependsOn.length > 0) metaItems.push({ label: 'Depends on', icon: 'bx-link', value: meta.dependsOn.join(', ') })

  return (
    <div className="page-wrapper" style={{ padding: '28px 32px' }}>
      {/* Breadcrumbs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20, fontSize: 13, color: breadcrumbColor }}>
        <Link href="/projects" style={{ color: breadcrumbColor, textDecoration: 'none' }}>Projects</Link>
        <i className="bx bx-chevron-right rtl-flip" style={{ fontSize: 12 }} />
        <Link href={`/projects/${projectId}`} style={{ color: breadcrumbColor, textDecoration: 'none' }}>{displayProjectName}</Link>
        <i className="bx bx-chevron-right rtl-flip" style={{ fontSize: 12 }} />
        <span style={{ color: textPrimary, fontWeight: 500 }}>{featureId}</span>
      </div>

      {/* ═══════════════════════ Feature Header ═══════════════════════ */}
      <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 16, padding: '24px 28px', marginBottom: 20, position: 'relative', overflow: 'hidden' }}>
        {/* Status accent bar */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${sColor}, ${sColor}44)` }} />

        {/* Title row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 16 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: `${sColor}12`, border: `1.5px solid ${sColor}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <i className={`bx ${kIcon}`} style={{ fontSize: 22, color: sColor }} />
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: textPrimary, margin: 0, letterSpacing: '-0.02em', lineHeight: 1.3 }}>{meta.title}</h1>
            <span style={{ fontSize: 11, color: textDim, fontFamily: 'monospace', marginTop: 4, display: 'inline-block' }}>{meta.id}</span>
          </div>
        </div>

        {/* Status / Priority / Kind badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
          {/* Status */}
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, padding: '4px 12px', borderRadius: 100, border: `1px solid ${sColor}30`, background: `${sColor}10`, color: sColor, fontWeight: 600 }}>
            <i className={`bx ${sIcon}`} style={{ fontSize: 14 }} />
            {meta.status.replace(/-/g, ' ')}
          </span>
          {/* Priority */}
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, padding: '4px 10px', borderRadius: 100, border: `1px solid ${pColor}30`, background: `${pColor}10`, color: pColor, fontWeight: 700 }}>
            {meta.priority}
          </span>
          {/* Kind */}
          {meta.kind && meta.kind !== 'feature' && (
            <span style={{ fontSize: 10, padding: '3px 8px', borderRadius: 4, background: 'var(--color-bg-active)', color: textMuted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {meta.kind}
            </span>
          )}
          {/* Lock indicator */}
          {meta.lockedBy && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10, padding: '3px 8px', borderRadius: 4, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', color: '#f59e0b', fontWeight: 500 }}>
              <i className="bx bx-lock-alt" style={{ fontSize: 11 }} /> Locked
            </span>
          )}
        </div>

        {/* Meta grid */}
        {(metaItems.length > 0 || meta.labels.length > 0) && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10, padding: '14px 0 0', borderTop: `1px solid ${cardBorder}` }}>
            {metaItems.map(m => (
              <div key={m.label} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <i className={`bx ${m.icon}`} style={{ fontSize: 14, color: textDim, marginTop: 1 }} />
                <div>
                  <div style={{ fontSize: 10, color: textDim, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 2 }}>{m.label}</div>
                  <div style={{ fontSize: 12.5, color: textPrimary, fontWeight: 500 }}>{m.value}</div>
                </div>
              </div>
            ))}

            {/* Labels */}
            {meta.labels.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <i className="bx bx-purchase-tag" style={{ fontSize: 14, color: textDim, marginTop: 1 }} />
                <div>
                  <div style={{ fontSize: 10, color: textDim, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>Labels</div>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {meta.labels.map(l => (
                      <span key={l} style={{ fontSize: 10, padding: '2px 7px', borderRadius: 4, background: 'var(--color-bg-active)', color: textMuted, fontWeight: 500 }}>{l}</span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ═══════════════════════ Feature Body ═══════════════════════ */}
      {body.trim() ? (
        <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 16, padding: '24px 28px' }}>
          <MarkdownRenderer content={body} />
        </div>
      ) : (
        <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 12, padding: '40px', textAlign: 'center' }}>
          <i className="bx bx-file" style={{ fontSize: 28, color: textDim, display: 'block', marginBottom: 8 }} />
          <div style={{ fontSize: 13, color: textDim }}>No description body yet.</div>
        </div>
      )}
    </div>
  )
}

// ============================================================
// Parse get_feature response
// ============================================================

function parseFeatureResponse(text: string): { meta: FeatureMeta; body: string } {
  // Format:
  // ### FEAT-ABC — Title
  // - **Status:** in-progress
  // - **Priority:** P1
  // - **Kind:** feature
  // - **Assignee:** ...
  // - **Estimate:** M
  // - **Labels:** a, b, c
  // - **Locked by session:** `xxx` (since ...)
  //
  // ---
  //
  // Body markdown...

  const meta: FeatureMeta = {
    id: '', title: '', status: 'todo', priority: 'P2', kind: 'feature',
    assignee: '', estimate: '', labels: [], dependsOn: [], lockedBy: '', lockedSince: '',
  }

  // Split at --- separator
  const parts = text.split(/^---$/m)
  const headerSection = parts[0] ?? ''
  const body = parts.length > 1 ? parts.slice(1).join('---').trim() : ''

  // Parse header
  const titleMatch = headerSection.match(/###\s+(\S+)\s+[—–-]\s+(.+)/)
  if (titleMatch) {
    meta.id = titleMatch[1]
    meta.title = titleMatch[2].trim()
  }

  const extract = (field: string): string => {
    const re = new RegExp(`\\*\\*${field}:\\*\\*\\s*(.+)`, 'i')
    const m = headerSection.match(re)
    return m ? m[1].trim() : ''
  }

  meta.status = extract('Status') || meta.status
  meta.priority = extract('Priority') || meta.priority
  meta.kind = extract('Kind') || meta.kind
  meta.assignee = extract('Assignee')
  meta.estimate = extract('Estimate')

  const labelsStr = extract('Labels')
  if (labelsStr) meta.labels = labelsStr.split(',').map(l => l.trim()).filter(Boolean)

  const lockMatch = headerSection.match(/\*\*Locked by session:\*\*\s*`([^`]+)`\s*\(since\s*([^)]+)\)/)
  if (lockMatch) {
    meta.lockedBy = lockMatch[1]
    meta.lockedSince = lockMatch[2]
  }

  // Parse depends_on from body if present
  const depsMatch = headerSection.match(/\*\*Depends on:\*\*\s*(.+)/i)
  if (depsMatch) {
    meta.dependsOn = depsMatch[1].split(',').map(d => d.trim()).filter(d => d.startsWith('FEAT-'))
  }

  return { meta, body }
}
