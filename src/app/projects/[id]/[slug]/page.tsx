'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { apiFetch } from '@/lib/api'

interface FeatureCard {
  id: string
  title: string
  status: string
  priority: string
}

interface PublicProject {
  project: {
    name: string
    slug: string
    description: string
    created_at: string
  }
  health: {
    completion_pct: number
    total: number
    done: number
    in_progress: number
    in_review: number
    todo: number
  }
  kanban: Record<string, FeatureCard[]>
  members: { name: string; avatar: string; role: string }[] | null
}

const colors = {
  bg: '#fafafa',
  cardBg: '#fff',
  border: '#e5e7eb',
  text: '#1a1a2e',
  muted: '#6b7280',
  accent: '#a900ff',
  accentLight: 'rgba(169,0,255,0.08)',
  green: '#22c55e',
  yellow: '#eab308',
  red: '#ef4444',
  blue: '#3b82f6',
}

const COLUMNS = [
  { key: 'todo', label: 'To Do', color: colors.muted },
  { key: 'in-progress', label: 'In Progress', color: colors.blue },
  { key: 'in-review', label: 'In Review', color: colors.yellow },
  { key: 'done', label: 'Done', color: colors.green },
]

const priorityColors: Record<string, string> = {
  P0: colors.red,
  P1: '#f97316',
  P2: colors.yellow,
  P3: colors.muted,
}

export default function PublicProjectPage() {
  const params = useParams()
  const user = params.id as string
  const slug = params.slug as string

  const [data, setData] = useState<PublicProject | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user || !slug) return
    setLoading(true)
    apiFetch<PublicProject>(`/api/public/projects/${user}/${slug}`, { skipAuth: true })
      .then(setData)
      .catch(err => setError(err.message || 'Failed to load project'))
      .finally(() => setLoading(false))
  }, [user, slug])

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: colors.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: colors.muted }}>
          <div style={{
            width: 32, height: 32,
            border: `3px solid ${colors.border}`, borderTopColor: colors.accent,
            borderRadius: '50%', animation: 'spin 0.8s linear infinite',
            margin: '0 auto 16px',
          }} />
          <div style={{ fontSize: 14 }}>Loading project...</div>
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div style={{ minHeight: '100vh', background: colors.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: colors.muted }}>
          <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.3 }}>404</div>
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>Project not found</div>
          <div style={{ fontSize: 13 }}>{error || 'This project is not public or does not exist.'}</div>
        </div>
      </div>
    )
  }

  const { project, health, kanban, members } = data

  return (
    <div style={{
      minHeight: '100vh',
      background: colors.bg,
      color: colors.text,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    }}>
      {/* Header */}
      <header style={{ borderBottom: `1px solid ${colors.border}`, background: colors.cardBg }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="8" fill={colors.accent} />
            <text x="16" y="22" textAnchor="middle" fill="#fff" fontSize="18" fontWeight="700" fontFamily="sans-serif">O</text>
          </svg>
          <span style={{ fontSize: 16, fontWeight: 700 }}>Orchestra</span>
          <span style={{ fontSize: 13, color: colors.muted, marginLeft: 4 }}>{user} / {project.slug}</span>
        </div>
      </header>

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px 64px' }}>
        {/* Project Info */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: '0 0 8px' }}>{project.name}</h1>
          {project.description && (
            <p style={{ fontSize: 15, color: colors.muted, margin: 0, lineHeight: 1.6 }}>{project.description}</p>
          )}
        </div>

        {/* Health Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: 12,
          marginBottom: 32,
        }}>
          <StatCard label="Completion" value={`${health.completion_pct}%`} color={colors.accent}>
            <div style={{
              height: 4, borderRadius: 2, background: colors.border, marginTop: 8,
            }}>
              <div style={{
                height: '100%', borderRadius: 2,
                background: colors.accent,
                width: `${health.completion_pct}%`,
                transition: 'width 0.3s',
              }} />
            </div>
          </StatCard>
          <StatCard label="Total Features" value={String(health.total)} color={colors.text} />
          <StatCard label="Done" value={String(health.done)} color={colors.green} />
          <StatCard label="In Progress" value={String(health.in_progress)} color={colors.blue} />
          <StatCard label="In Review" value={String(health.in_review)} color={colors.yellow} />
          <StatCard label="To Do" value={String(health.todo)} color={colors.muted} />
        </div>

        {/* Kanban Board */}
        <h2 style={{
          fontSize: 13, fontWeight: 600, textTransform: 'uppercase',
          letterSpacing: '0.05em', color: colors.muted, marginBottom: 16,
        }}>
          Feature Board
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 16,
          marginBottom: 40,
        }}>
          {COLUMNS.map(col => {
            const items = kanban[col.key] || []
            return (
              <div key={col.key}>
                <div style={{
                  fontSize: 12, fontWeight: 600, color: col.color,
                  textTransform: 'uppercase', letterSpacing: '0.04em',
                  marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  <span style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: col.color, display: 'inline-block',
                  }} />
                  {col.label}
                  <span style={{ opacity: 0.5, fontWeight: 400 }}>({items.length})</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {items.length === 0 ? (
                    <div style={{
                      padding: '24px 16px', textAlign: 'center',
                      fontSize: 12, color: colors.muted, opacity: 0.5,
                      border: `1px dashed ${colors.border}`, borderRadius: 8,
                    }}>
                      No items
                    </div>
                  ) : items.map(item => (
                    <div key={item.id} style={{
                      padding: '12px 16px',
                      background: colors.cardBg,
                      border: `1px solid ${colors.border}`,
                      borderRadius: 8,
                    }}>
                      <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 6 }}>{item.title}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{
                          fontSize: 10, fontWeight: 700, padding: '1px 6px',
                          borderRadius: 4,
                          background: `${priorityColors[item.priority] || colors.muted}20`,
                          color: priorityColors[item.priority] || colors.muted,
                        }}>
                          {item.priority}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* Team Members */}
        {members && members.length > 0 && (
          <>
            <h2 style={{
              fontSize: 13, fontWeight: 600, textTransform: 'uppercase',
              letterSpacing: '0.05em', color: colors.muted, marginBottom: 16,
            }}>
              Team
            </h2>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              {members.map((m, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 16px',
                  background: colors.cardBg,
                  border: `1px solid ${colors.border}`,
                  borderRadius: 10,
                }}>
                  {m.avatar ? (
                    <img src={m.avatar} alt="" style={{ width: 32, height: 32, borderRadius: '50%' }} />
                  ) : (
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%',
                      background: colors.accentLight,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 14, fontWeight: 600, color: colors.accent,
                    }}>
                      {(m.name || '?')[0].toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>{m.name}</div>
                    <div style={{ fontSize: 11, color: colors.muted }}>{m.role}</div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: `1px solid ${colors.border}`,
        background: colors.cardBg,
        padding: '20px 24px',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: 12, color: colors.muted, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          Powered by <span style={{ fontWeight: 700, color: colors.accent }}>Orchestra</span>
        </div>
      </footer>
    </div>
  )
}

function StatCard({ label, value, color, children }: {
  label: string
  value: string
  color: string
  children?: React.ReactNode
}) {
  return (
    <div style={{
      padding: '16px 20px',
      background: colors.cardBg,
      border: `1px solid ${colors.border}`,
      borderRadius: 10,
    }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: colors.muted, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        {label}
      </div>
      <div style={{ fontSize: 28, fontWeight: 700, color, marginTop: 4 }}>{value}</div>
      {children}
    </div>
  )
}
