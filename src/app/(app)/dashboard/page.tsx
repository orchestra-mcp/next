'use client'
import { useEffect, useState, useRef } from 'react'
import { useAuthStore } from '@/store/auth'
import { useDashboardStore } from '@/store/dashboard'
import { apiFetch } from '@/lib/api'
import { useMCP } from '@/hooks/useMCP'
import { useTranslations } from 'next-intl'
import { WIDGET_REGISTRY } from '@/types/dashboard'
import { WIDGET_COMPONENTS } from '@/components/dashboard/widgets'
import type { Project } from '@/components/dashboard/widgets/RecentProjectsWidget'
import type { Note } from '@/components/dashboard/widgets/RecentNotesWidget'
import { WidgetShell } from '@/components/dashboard/WidgetShell'
import { DashboardGrid } from '@/components/dashboard/DashboardGrid'
import { DashboardToolbar } from '@/components/dashboard/DashboardToolbar'

function parseMCPProjects(text: string): Project[] {
  const items: Project[] = []
  for (const line of text.split('\n')) {
    const m = line.match(/^-\s+\*\*(.+?)\*\*\s+\(`([^)]+)`\)(?:\s*[—–-]\s*(.+))?$/)
    if (m) items.push({ id: m[2].trim(), name: m[1].trim(), description: m[3]?.trim(), created_at: new Date().toISOString() })
  }
  return items
}

function parseMCPNotes(text: string): Note[] {
  const notes: Note[] = []
  const lines = text.split('\n')
  let headerCols: string[] = []
  for (const line of lines) {
    if (!line.startsWith('|') || line.includes('---')) continue
    const cells = line.split('|').map(c => c.trim()).filter(Boolean)
    if (cells.length < 2) continue
    if (cells[0].toLowerCase() === 'id') { headerCols = cells.map(c => c.toLowerCase()); continue }
    const row: Record<string, string> = {}
    cells.forEach((cell, i) => { row[headerCols[i] || `col${i}`] = cell })
    const id = row['id'] || cells[0], title = row['title'] || cells[1]
    if (!id || !title) continue
    notes.push({ id, title, updated_at: new Date().toISOString() })
  }
  return notes
}

export default function DashboardPage() {
  const { user } = useAuthStore()
  const { callTool, status: connStatus, tools } = useMCP()
  const [projects, setProjects] = useState<Project[]>([])
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const t = useTranslations('dashboard')

  const {
    widgets, editMode, setEditMode,
    reorderWidget, resizeWidget, toggleWidget, lockWidget,
    resetLayout, fetchLayout,
  } = useDashboardStore()

  // Fetch widget layout from server on mount
  useEffect(() => { fetchLayout() }, [fetchLayout])

  // Fetch dashboard data from MCP tunnel or REST API
  const hasFetchedRef = useRef(false)

  useEffect(() => {
    // On mount: always fetch via REST immediately
    // When MCP connects: re-fetch via MCP for richer data
    const isMCP = connStatus === 'connected'

    // Skip re-fetches for non-connected status changes after initial load
    if (hasFetchedRef.current && !isMCP) return

    let cancelled = false

    async function fetchData() {
      // Only show shimmer on first load
      if (!hasFetchedRef.current) setLoading(true)

      if (isMCP) {
        try {
          const [projResult, notesResult] = await Promise.all([
            callTool('list_projects').catch(() => null),
            callTool('list_notes').catch(() => null),
          ])
          if (cancelled) return
          setProjects(parseMCPProjects(projResult?.content?.[0]?.text ?? ''))
          setNotes(parseMCPNotes(notesResult?.content?.[0]?.text ?? ''))
          setLoading(false)
          hasFetchedRef.current = true
          return
        } catch {
          // Fall through to REST API
        }
      }

      try {
        const [p, n] = await Promise.all([
          apiFetch<{ projects: Project[] }>('/api/projects').catch(() => ({ projects: [] })),
          apiFetch<{ notes: Note[] }>('/api/notes?limit=5').catch(() => ({ notes: [] })),
        ])
        if (cancelled) return
        setProjects(p.projects ?? [])
        setNotes(n.notes ?? [])
      } finally {
        if (!cancelled) {
          setLoading(false)
          hasFetchedRef.current = true
        }
      }
    }

    fetchData()
    return () => { cancelled = true }
  }, [connStatus, callTool])

  const firstName = user?.name?.split(' ')[0] ?? ''

  // Widget data props map
  const widgetProps: Record<string, Record<string, unknown>> = {
    stats: { projectCount: projects.length, noteCount: notes.length, toolCount: tools.length, connStatus },
    recent_projects: { projects },
    recent_notes: { notes },
    quick_actions: {},
  }

  return (
    <div className="page-wrapper" style={{ padding: '28px 32px' }}>
      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-fg)', margin: 0, letterSpacing: '-0.02em' }}>
            {firstName ? t('greetingWithName', { name: firstName }) : t('greeting')} &#128075;
          </h1>
          <p style={{ fontSize: 13, color: 'var(--color-fg-muted)', marginTop: 6 }}>{t('subtitle')}</p>
        </div>
        <DashboardToolbar
          editMode={editMode}
          onToggleEdit={() => setEditMode(!editMode)}
          onReset={resetLayout}
          widgets={widgets}
          onToggleWidget={toggleWidget}
        />
      </div>

      {/* Widget grid */}
      <DashboardGrid
        widgets={widgets}
        editMode={editMode}
        onReorder={reorderWidget}
      >
        {(widget) => {
          const def = WIDGET_REGISTRY[widget.type]
          const Component = WIDGET_COMPONENTS[widget.type]
          return (
            <WidgetShell
              widget={widget}
              definition={def}
              editMode={editMode}
              onResize={(colSpan) => resizeWidget(widget.id, colSpan)}
              onToggle={() => toggleWidget(widget.id)}
              onLock={() => lockWidget(widget.id)}
              loading={loading}
            >
              <Component {...(widgetProps[widget.type] ?? {})} />
            </WidgetShell>
          )
        }}
      </DashboardGrid>
    </div>
  )
}
