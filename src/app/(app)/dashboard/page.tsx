'use client'
import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/auth'
import { apiFetch } from '@/lib/api'
import { useThemeStore } from '@/store/theme'
import Link from 'next/link'

interface Project { id: string; name: string; description?: string; created_at: string }
interface Note { id: string; title: string; updated_at: string }

export default function DashboardPage() {
  const { user } = useAuthStore()
  const [projects, setProjects] = useState<Project[]>([])
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const { theme } = useThemeStore()
  const isDark = theme === 'dark'

  useEffect(() => {
    Promise.all([
      apiFetch<{ projects: Project[] }>('/api/projects').catch(() => ({ projects: [] })),
      apiFetch<{ notes: Note[] }>('/api/notes?limit=5').catch(() => ({ notes: [] })),
    ]).then(([p, n]) => {
      setProjects(p.projects ?? [])
      setNotes(n.notes ?? [])
      setLoading(false)
    })
  }, [])

  const firstName = user?.name?.split(' ')[0] ?? ''

  const textPrimary = isDark ? '#f8f8f8' : '#0f0f12'
  const textMuted = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.45)'
  const textDim = isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.3)'
  const cardBg = isDark ? 'rgba(255,255,255,0.03)' : '#ffffff'
  const cardBorder = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)'
  const rowBg = isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)'
  const rowBorder = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)'
  const skeletonHi = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'
  const skeletonLo = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.04)'
  const actionBg = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)'
  const actionBorder = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'

  const cardSt: React.CSSProperties = {
    background: cardBg,
    border: `1px solid ${cardBorder}`,
    borderRadius: 14,
    padding: '20px 22px',
  }

  return (
    <div style={{ padding: '28px 32px' }}>
      {/* Page header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: textPrimary, margin: 0, letterSpacing: '-0.02em' }}>
          Good morning{firstName ? `, ${firstName}` : ''} &#128075;
        </h1>
        <p style={{ fontSize: 13, color: textMuted, marginTop: 6 }}>Here&apos;s an overview of your workspace.</p>
      </div>

      {/* Stat cards row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 28 }}>
        {[
          { icon: 'bx-folder', label: 'Projects', value: loading ? '-' : String(projects.length), change: '', color: '#00e5ff' },
          { icon: 'bx-note', label: 'Notes', value: loading ? '-' : String(notes.length), change: '', color: '#a900ff' },
          { icon: 'bx-bolt', label: 'AI Tools', value: '131', change: '', color: '#00e5ff' },
          { icon: 'bx-plug', label: 'Plugins', value: '16', change: 'active', color: '#22c55e' },
        ].map(s => (
          <div key={s.label} style={cardSt}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <span style={{ fontSize: 12, fontWeight: 500, color: textMuted }}>{s.label}</span>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: `${s.color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className={`bx ${s.icon}`} style={{ fontSize: 16, color: s.color }} />
              </div>
            </div>
            <div style={{ fontSize: 30, fontWeight: 700, color: textPrimary, letterSpacing: '-0.03em', lineHeight: 1 }}>{s.value}</div>
            {s.change && <div style={{ fontSize: 11, color: '#22c55e', marginTop: 6 }}>{s.change}</div>}
          </div>
        ))}
      </div>

      {/* Two-column: Recent Projects + Recent Notes */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 28 }}>
        {/* Recent Projects */}
        <div style={cardSt}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <h2 style={{ fontSize: 14, fontWeight: 600, color: textPrimary, margin: 0 }}>Recent Projects</h2>
            <Link href="/projects" style={{ fontSize: 12, color: '#00e5ff', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
              View all <i className="bx bx-right-arrow-alt" />
            </Link>
          </div>
          {loading ? (
            <div style={{ fontSize: 13, color: textDim }}>Loading...</div>
          ) : projects.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '28px 0', color: textDim, fontSize: 13 }}>
              <i className="bx bx-folder" style={{ fontSize: 28, display: 'block', marginBottom: 8 }} />
              No projects yet
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {projects.slice(0, 5).map(p => (
                <Link key={p.id} href={`/projects/${p.id}`} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, border: `1px solid ${rowBorder}`, background: rowBg, textDecoration: 'none' }}>
                  <div style={{ width: 28, height: 28, borderRadius: 7, background: 'rgba(0,229,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <i className="bx bx-folder" style={{ fontSize: 14, color: '#00e5ff' }} />
                  </div>
                  <div style={{ overflow: 'hidden' }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: textPrimary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                    {p.description && <div style={{ fontSize: 11, color: textDim, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.description}</div>}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Notes */}
        <div style={cardSt}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <h2 style={{ fontSize: 14, fontWeight: 600, color: textPrimary, margin: 0 }}>Recent Notes</h2>
            <Link href="/notes" style={{ fontSize: 12, color: '#00e5ff', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
              View all <i className="bx bx-right-arrow-alt" />
            </Link>
          </div>
          {loading ? (
            <div style={{ fontSize: 13, color: textDim }}>Loading...</div>
          ) : notes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '28px 0', color: textDim, fontSize: 13 }}>
              <i className="bx bx-note" style={{ fontSize: 28, display: 'block', marginBottom: 8 }} />
              No notes yet
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {notes.map(n => (
                <div key={n.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, border: `1px solid ${rowBorder}`, background: rowBg }}>
                  <div style={{ width: 28, height: 28, borderRadius: 7, background: 'rgba(169,0,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <i className="bx bx-note" style={{ fontSize: 14, color: '#a900ff' }} />
                  </div>
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: textPrimary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{n.title || 'Untitled'}</div>
                    <div style={{ fontSize: 11, color: textDim }}>{new Date(n.updated_at).toLocaleDateString()}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div style={cardSt}>
        <h2 style={{ fontSize: 14, fontWeight: 600, color: textPrimary, margin: '0 0 16px' }}>Quick actions</h2>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {[
            { icon: 'bx-plus', label: 'New project', href: '/projects/new', color: '#00e5ff' },
            { icon: 'bx-file', label: 'New note', href: '/notes/new', color: '#a900ff' },
            { icon: 'bx-cog', label: 'Settings', href: '/settings', color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' },
          ].map(action => (
            <Link key={action.label} href={action.href} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, border: `1px solid ${actionBorder}`, background: actionBg, fontSize: 13, fontWeight: 500, color: textPrimary, textDecoration: 'none' }}>
              <i className={`bx ${action.icon}`} style={{ fontSize: 15, color: action.color }} />
              {action.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
