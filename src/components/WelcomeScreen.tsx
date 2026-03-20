'use client'

import { useState } from 'react'
import type { Workspace } from '@/types/models'
import { useWorkspaceStore } from '@/store/workspaces'

interface WelcomeScreenProps {
  workspaces: Workspace[]
  loading: boolean
  teamId?: string
  onWorkspaceSelected: (id: string) => void
}

export function WelcomeScreen({ workspaces, loading, teamId, onWorkspaceSelected }: WelcomeScreenProps) {
  const [tab, setTab] = useState<'recent' | 'create'>('recent')
  const [name, setName] = useState('')
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { createWorkspace } = useWorkspaceStore()

  const handleCreate = async () => {
    if (!name.trim() || !teamId) return
    setCreating(true)
    setError(null)
    try {
      const ws = await createWorkspace(teamId, { name: name.trim() })
      onWorkspaceSelected(ws.id)
    } catch (e) {
      setError((e as Error).message || 'Failed to create workspace')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100vh',
      background: 'linear-gradient(160deg, #0a0a1a 0%, #1a0a2e 50%, #0a1a2e 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    }}>
      <style>{`
        @keyframes welcome-glow { 0%, 100% { opacity: 0.4; } 50% { opacity: 0.8; } }
        .welcome-card:hover { border-color: rgba(169,0,255,0.2) !important; background: rgba(255,255,255,0.06) !important; }
      `}</style>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' }}>
        {/* Background glow */}
        <div style={{
          position: 'absolute', width: 500, height: 500, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(169,0,255,0.06) 0%, transparent 70%)',
          top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          animation: 'welcome-glow 6s ease-in-out infinite', pointerEvents: 'none',
        }} />

        <div style={{ width: 560, maxWidth: '90vw', position: 'relative' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{
              width: 56, height: 56, borderRadius: 14, margin: '0 auto 14px',
              background: 'linear-gradient(135deg, #a900ff, #00e5ff)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 8px 32px rgba(169,0,255,0.25)',
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            </div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#fff', letterSpacing: '-0.03em' }}>
              Select a Workspace
            </h1>
            <p style={{ margin: '6px 0 0', fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
              Choose a workspace to get started or create a new one
            </p>
          </div>

          {/* Tab toggle */}
          <div style={{ display: 'flex', gap: 3, padding: 3, background: 'rgba(255,255,255,0.04)', borderRadius: 10, marginBottom: 16 }}>
            <button onClick={() => setTab('recent')}
              style={{ flex: 1, padding: '8px 0', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, background: tab === 'recent' ? 'rgba(169,0,255,0.15)' : 'transparent', color: tab === 'recent' ? '#cc55ff' : 'rgba(255,255,255,0.4)', transition: 'all 0.15s' }}>
              Recent Workspaces
            </button>
            <button onClick={() => setTab('create')}
              style={{ flex: 1, padding: '8px 0', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, background: tab === 'create' ? 'rgba(169,0,255,0.15)' : 'transparent', color: tab === 'create' ? '#cc55ff' : 'rgba(255,255,255,0.4)', transition: 'all 0.15s' }}>
              Create New
            </button>
          </div>

          {/* Recent Workspaces */}
          {tab === 'recent' && (
            <div style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 12, overflow: 'hidden',
            }}>
              {loading ? (
                <div style={{ padding: '32px 20px', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>
                  Loading workspaces...
                </div>
              ) : workspaces.length === 0 ? (
                <div style={{ padding: '32px 20px', textAlign: 'center' }}>
                  <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
                    No workspaces yet
                  </p>
                  <p style={{ margin: '6px 0 0', fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>
                    Create a workspace to get started
                  </p>
                </div>
              ) : (
                <div style={{ maxHeight: 360, overflowY: 'auto' }}>
                  {workspaces.map(ws => (
                    <button
                      key={ws.id}
                      className="welcome-card"
                      onClick={() => onWorkspaceSelected(ws.id)}
                      style={{
                        width: '100%', textAlign: 'left',
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: '12px 16px',
                        border: 'none', borderBottom: '1px solid rgba(255,255,255,0.04)',
                        background: 'transparent', cursor: 'pointer',
                        transition: 'all 0.15s',
                      }}
                    >
                      <div style={{
                        width: 36, height: 36, borderRadius: 9,
                        background: 'rgba(169,0,255,0.1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a900ff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                        </svg>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {ws.name}
                        </div>
                        {ws.description && (
                          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 2 }}>
                            {ws.description}
                          </div>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                        {ws.project_count > 0 && (
                          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)' }}>
                            {ws.project_count} project{ws.project_count !== 1 ? 's' : ''}
                          </span>
                        )}
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Create New */}
          {tab === 'create' && (
            <div style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 12, overflow: 'hidden',
              padding: '20px 16px',
            }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 8 }}>
                Workspace Name
              </label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="My Workspace"
                  onKeyDown={e => e.key === 'Enter' && handleCreate()}
                  autoFocus
                  style={{
                    flex: 1, padding: '10px 12px', borderRadius: 8,
                    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                    color: '#fff', fontSize: 13, outline: 'none',
                  }}
                />
                <button
                  onClick={handleCreate}
                  disabled={creating || !name.trim() || !teamId}
                  style={{
                    padding: '10px 20px', borderRadius: 8, border: 'none',
                    background: !name.trim() ? 'rgba(255,255,255,0.06)' : 'linear-gradient(135deg, #a900ff, #00e5ff)',
                    color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                    opacity: creating ? 0.6 : 1,
                  }}
                >
                  {creating ? 'Creating...' : 'Create'}
                </button>
              </div>
              {error && <p style={{ margin: '8px 0 0', fontSize: 11, color: '#ef4444' }}>{error}</p>}
              {!teamId && (
                <p style={{ margin: '8px 0 0', fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>
                  Join or create a team first to create workspaces.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
