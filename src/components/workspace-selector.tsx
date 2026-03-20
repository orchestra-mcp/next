'use client'
import { useEffect, useState } from 'react'
import { apiFetch } from '@/lib/api'

interface Workspace {
  id: string
  name: string
  folders: string[]
  primary_folder: string
  status: string
  metadata?: Record<string, unknown>
  created_at: string
  updated_at: string
}

interface WorkspaceSelectorProps {
  onSelect: (workspace: Workspace) => void
  onCreateNew: () => void
}

function timeAgo(dateStr: string): string {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diff = now - then
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  const weeks = Math.floor(days / 7)
  const months = Math.floor(days / 30)

  if (months > 0) return `${months} month${months !== 1 ? 's' : ''} ago`
  if (weeks > 0) return `${weeks} week${weeks !== 1 ? 's' : ''} ago`
  if (days > 0) return `${days} day${days !== 1 ? 's' : ''} ago`
  if (hours > 0) return `${hours} hour${hours !== 1 ? 's' : ''} ago`
  if (minutes > 0) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`
  return 'just now'
}

const colors = {
  bg: '#0f0b14',
  cardBg: '#1a1520',
  border: 'rgba(255,255,255,0.06)',
  text: '#f8f8f8',
  muted: 'rgba(255,255,255,0.45)',
  accent: '#a900ff',
  hoverBg: 'rgba(169,0,255,0.08)',
  hoverBorder: 'rgba(169,0,255,0.35)',
  statusActive: '#22c55e',
  statusArchived: '#6b7280',
}

export function WorkspaceSelector({ onSelect, onCreateNew }: WorkspaceSelectorProps) {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const data = await apiFetch<Workspace[]>('/api/workspaces')
        if (!cancelled) setWorkspaces(data)
      } catch (e) {
        if (!cancelled) setError((e as Error).message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: colors.bg,
      zIndex: 10000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
    }}>
      <div style={{
        width: '100%',
        maxWidth: 640,
      }}>
        {/* Header */}
        <div style={{ marginBottom: 32, textAlign: 'center' }}>
          <div style={{
            width: 56,
            height: 56,
            borderRadius: 16,
            background: `${colors.accent}15`,
            border: `1px solid ${colors.accent}25`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
          }}>
            <i className="bx bx-folder" style={{ fontSize: 26, color: colors.accent }} />
          </div>
          <h1 style={{
            fontSize: 24,
            fontWeight: 800,
            color: colors.text,
            margin: '0 0 8px',
            letterSpacing: '-0.03em',
          }}>
            Select Workspace
          </h1>
          <p style={{
            fontSize: 14,
            color: colors.muted,
            margin: 0,
            lineHeight: 1.5,
          }}>
            Choose a workspace to continue
          </p>
        </div>

        {/* Loading skeletons */}
        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[1, 2, 3].map(i => (
              <div
                key={i}
                style={{
                  padding: '18px 20px',
                  borderRadius: 14,
                  border: `1px solid ${colors.border}`,
                  background: colors.cardBg,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{
                    width: 42,
                    height: 42,
                    borderRadius: 12,
                    background: 'rgba(255,255,255,0.04)',
                    animation: 'pulse 1.8s ease-in-out infinite',
                  }} />
                  <div style={{ flex: 1 }}>
                    <div style={{
                      width: `${100 + i * 30}px`,
                      height: 14,
                      borderRadius: 6,
                      background: 'rgba(255,255,255,0.06)',
                      marginBottom: 8,
                      animation: 'pulse 1.8s ease-in-out infinite',
                    }} />
                    <div style={{
                      width: `${160 + i * 20}px`,
                      height: 10,
                      borderRadius: 5,
                      background: 'rgba(255,255,255,0.04)',
                      animation: 'pulse 1.8s ease-in-out infinite',
                    }} />
                  </div>
                </div>
              </div>
            ))}
            <style>{`
              @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.4; }
              }
            `}</style>
          </div>
        )}

        {/* Error state */}
        {error && !loading && (
          <div style={{
            padding: '16px 20px',
            borderRadius: 12,
            background: 'rgba(239,68,68,0.07)',
            border: '1px solid rgba(239,68,68,0.2)',
            color: '#ef4444',
            fontSize: 13,
            textAlign: 'center',
            marginBottom: 16,
          }}>
            {error}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && workspaces.length === 0 && (
          <div style={{
            padding: '40px 20px',
            borderRadius: 14,
            border: `1px dashed ${colors.border}`,
            background: colors.cardBg,
            textAlign: 'center',
          }}>
            <i className="bx bx-folder" style={{ fontSize: 36, color: 'rgba(255,255,255,0.15)', display: 'block', marginBottom: 12 }} />
            <div style={{ fontSize: 14, color: colors.muted, marginBottom: 4 }}>No workspaces found</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>Create your first workspace to get started</div>
          </div>
        )}

        {/* Workspace cards */}
        {!loading && !error && workspaces.length > 0 && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            maxHeight: 'calc(100vh - 320px)',
            overflowY: 'auto',
          }}>
            {workspaces.map(workspace => {
              const isHovered = hoveredId === workspace.id
              const isActive = workspace.status === 'active'
              return (
                <button
                  key={workspace.id}
                  onClick={() => onSelect(workspace)}
                  onMouseEnter={() => setHoveredId(workspace.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    padding: '18px 20px',
                    borderRadius: 14,
                    border: `1px solid ${isHovered ? colors.hoverBorder : colors.border}`,
                    background: isHovered ? colors.hoverBg : colors.cardBg,
                    cursor: 'pointer',
                    textAlign: 'start',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {/* Icon */}
                  <div style={{
                    width: 42,
                    height: 42,
                    borderRadius: 12,
                    background: isHovered ? `${colors.accent}18` : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${isHovered ? `${colors.accent}30` : 'rgba(255,255,255,0.06)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    transition: 'all 0.15s ease',
                  }}>
                    <i className="bx bx-folder" style={{
                      fontSize: 20,
                      color: isHovered ? colors.accent : colors.muted,
                      transition: 'color 0.15s ease',
                    }} />
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: colors.text,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        {workspace.name}
                      </span>
                      {/* Status dot */}
                      <span style={{
                        width: 7,
                        height: 7,
                        borderRadius: '50%',
                        background: isActive ? colors.statusActive : colors.statusArchived,
                        flexShrink: 0,
                      }} />
                    </div>
                    <div style={{
                      fontSize: 12,
                      color: colors.muted,
                      fontFamily: 'monospace',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {workspace.primary_folder}
                    </div>
                  </div>

                  {/* Right side: folder count + timestamp */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                    gap: 6,
                    flexShrink: 0,
                  }}>
                    <span style={{
                      fontSize: 10,
                      fontWeight: 600,
                      padding: '2px 8px',
                      borderRadius: 100,
                      background: 'rgba(255,255,255,0.06)',
                      color: colors.muted,
                      whiteSpace: 'nowrap',
                    }}>
                      {workspace.folders.length} folder{workspace.folders.length !== 1 ? 's' : ''}
                    </span>
                    <span style={{
                      fontSize: 11,
                      color: 'rgba(255,255,255,0.3)',
                      whiteSpace: 'nowrap',
                    }}>
                      {timeAgo(workspace.updated_at)}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        )}

        {/* Create workspace button */}
        <button
          onClick={onCreateNew}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            padding: '14px',
            marginTop: 16,
            borderRadius: 14,
            border: 'none',
            background: colors.accent,
            color: '#fff',
            fontSize: 14,
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'opacity 0.15s ease',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.9' }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '1' }}
        >
          <i className="bx bx-plus" style={{ fontSize: 18 }} />
          Create Workspace
        </button>
      </div>
    </div>
  )
}
