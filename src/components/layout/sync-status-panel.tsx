'use client'
import { useSyncStore } from '@/store/sync'
import type { SyncConflict } from '@/store/sync'
import { useTunnelStore } from '@/store/tunnels'

interface SyncStatusPanelProps {
  open: boolean
  onClose: () => void
}

const ENTITY_ICONS: Record<string, string> = {
  feature: 'bx-rocket',
  project: 'bx-folder',
  note: 'bx-note',
  doc: 'bx-file',
  skill: 'bx-terminal',
  agent: 'bx-bot',
  plan: 'bx-layout',
  session: 'bx-conversation',
  workspace: 'bx-grid-alt',
}

const ACTION_COLORS: Record<string, string> = {
  created: '#22c55e',
  updated: '#00e5ff',
  deleted: '#ef4444',
  status_changed: '#f59e0b',
}

const REALTIME_STATE_CONFIG: Record<string, { color: string; label: string; icon: string }> = {
  connected: { color: '#22c55e', label: 'Connected', icon: 'bx-check-circle' },
  connecting: { color: '#f59e0b', label: 'Connecting', icon: 'bx-loader-alt' },
  disconnected: { color: '#ef4444', label: 'Disconnected', icon: 'bx-x-circle' },
}

const CONFLICT_RESOLUTION_COLORS: Record<string, string> = {
  local_wins: '#22c55e',
  remote_wins: '#00e5ff',
  merged: '#a855f7',
  pending: '#f59e0b',
}

function formatRelativeTime(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000)
  if (seconds < 5) return 'just now'
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

function formatLastSeen(dateStr?: string): string {
  if (!dateStr) return 'Unknown'
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (seconds < 5) return 'Just now'
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

function formatTimestamp(dateStr: string | null): string {
  if (!dateStr) return 'Never'
  const d = new Date(dateStr)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

const STATUS_CONFIG = {
  idle: { color: '#22c55e', label: 'Connected' },
  syncing: { color: '#f59e0b', label: 'Syncing' },
  error: { color: '#ef4444', label: 'Error' },
} as const

const TUNNEL_STATUS_COLORS: Record<string, string> = {
  online: '#22c55e',
  offline: 'rgba(255, 255, 255, 0.3)',
  connecting: '#f59e0b',
}

export function SyncStatusPanel({ open, onClose }: SyncStatusPanelProps) {
  const { syncStatus, realtimeState, lastSyncAt, recentEvents, pendingWrites, conflicts, autoRefresh, setAutoRefresh, clearConflicts } = useSyncStore()
  const { tunnels } = useTunnelStore()

  const statusConfig = STATUS_CONFIG[syncStatus]
  const rtConfig = REALTIME_STATE_CONFIG[realtimeState] ?? REALTIME_STATE_CONFIG.disconnected
  const displayEvents = recentEvents.slice(0, 20)
  const pendingConflicts = conflicts.filter(c => c.resolution === 'pending').length

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.4)',
          zIndex: 99,
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          transition: 'opacity 0.2s ease',
        }}
      />

      {/* Panel */}
      <div
        style={{
          position: 'fixed',
          right: 0,
          top: 0,
          height: '100vh',
          width: 360,
          zIndex: 100,
          background: '#1a1520',
          borderLeft: '1px solid rgba(255, 255, 255, 0.06)',
          boxShadow: '-8px 0 32px rgba(0, 0, 0, 0.4)',
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 20px 16px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <i className="bx bx-sync" style={{ fontSize: 18, color: '#a900ff' }} />
            <span style={{
              fontSize: 15,
              fontWeight: 700,
              color: '#f8f8f8',
              letterSpacing: '-0.01em',
            }}>
              Sync Status
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'rgba(255, 255, 255, 0.3)',
              cursor: 'pointer',
              fontSize: 20,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
              transition: 'color 0.15s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255, 255, 255, 0.3)' }}
          >
            <i className="bx bx-x" />
          </button>
        </div>

        {/* Scrollable content */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px 20px',
        }}>
          {/* Status indicator */}
          <div style={{
            padding: '16px',
            borderRadius: 12,
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            marginBottom: 24,
          }}>
            <div style={{
              width: 14,
              height: 14,
              borderRadius: '50%',
              background: statusConfig.color,
              boxShadow: `0 0 10px ${statusConfig.color}40`,
              flexShrink: 0,
              animation: syncStatus === 'syncing' ? 'syncPulse 1.5s ease-in-out infinite' : undefined,
            }} />
            <div>
              <div style={{
                fontSize: 14,
                fontWeight: 600,
                color: '#f8f8f8',
              }}>
                {statusConfig.label}
              </div>
              <div style={{
                fontSize: 11,
                color: 'rgba(255, 255, 255, 0.35)',
                marginTop: 2,
              }}>
                {syncStatus === 'idle' && 'All changes synced'}
                {syncStatus === 'syncing' && 'Synchronizing changes...'}
                {syncStatus === 'error' && 'Connection lost. Retrying...'}
              </div>
            </div>
          </div>

          {/* Realtime + Pending Writes + Last Sync row */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: 8,
            marginBottom: 24,
          }}>
            {/* Realtime State */}
            <div style={{
              padding: '12px 10px',
              borderRadius: 10,
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              textAlign: 'center',
            }}>
              <i className={`bx ${rtConfig.icon}`} style={{
                fontSize: 18,
                color: rtConfig.color,
                display: 'block',
                marginBottom: 4,
                animation: realtimeState === 'connecting' ? 'syncPulse 1.5s ease-in-out infinite' : undefined,
              }} />
              <div style={{ fontSize: 10, fontWeight: 600, color: rtConfig.color }}>{rtConfig.label}</div>
              <div style={{ fontSize: 9, color: 'rgba(255, 255, 255, 0.25)', marginTop: 2 }}>Realtime</div>
            </div>

            {/* Pending Writes */}
            <div style={{
              padding: '12px 10px',
              borderRadius: 10,
              background: 'rgba(255, 255, 255, 0.03)',
              border: `1px solid ${pendingWrites > 0 ? 'rgba(245, 158, 11, 0.3)' : 'rgba(255, 255, 255, 0.06)'}`,
              textAlign: 'center',
            }}>
              <div style={{
                fontSize: 20,
                fontWeight: 700,
                color: pendingWrites > 0 ? '#f59e0b' : 'rgba(255, 255, 255, 0.5)',
                lineHeight: 1,
                marginBottom: 4,
              }}>
                {pendingWrites}
              </div>
              <div style={{ fontSize: 10, fontWeight: 600, color: pendingWrites > 0 ? '#f59e0b' : 'rgba(255, 255, 255, 0.35)' }}>
                Pending
              </div>
              <div style={{ fontSize: 9, color: 'rgba(255, 255, 255, 0.25)', marginTop: 2 }}>Writes</div>
            </div>

            {/* Last Sync */}
            <div style={{
              padding: '12px 10px',
              borderRadius: 10,
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              textAlign: 'center',
            }}>
              <i className="bx bx-time-five" style={{ fontSize: 18, color: 'rgba(255, 255, 255, 0.4)', display: 'block', marginBottom: 4 }} />
              <div style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255, 255, 255, 0.5)' }}>
                {formatTimestamp(lastSyncAt)}
              </div>
              <div style={{ fontSize: 9, color: 'rgba(255, 255, 255, 0.25)', marginTop: 2 }}>Last Sync</div>
            </div>
          </div>

          {/* Auto-refresh toggle */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 14px',
            borderRadius: 10,
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            marginBottom: 24,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <i className="bx bx-revision" style={{ fontSize: 14, color: autoRefresh ? '#22c55e' : 'rgba(255, 255, 255, 0.3)' }} />
              <span style={{ fontSize: 12, color: '#f8f8f8', fontWeight: 500 }}>Auto-refresh</span>
            </div>
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              style={{
                width: 36,
                height: 20,
                borderRadius: 10,
                border: 'none',
                background: autoRefresh ? '#22c55e' : 'rgba(255, 255, 255, 0.15)',
                cursor: 'pointer',
                position: 'relative',
                transition: 'background 0.2s ease',
                padding: 0,
              }}
            >
              <div style={{
                width: 16,
                height: 16,
                borderRadius: '50%',
                background: '#fff',
                position: 'absolute',
                top: 2,
                left: autoRefresh ? 18 : 2,
                transition: 'left 0.2s ease',
              }} />
            </button>
          </div>

          {/* Conflict Log */}
          {conflicts.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 10,
              }}>
                <div style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: 'rgba(255, 255, 255, 0.35)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}>
                  Conflicts
                  {pendingConflicts > 0 && (
                    <span style={{
                      fontSize: 9,
                      fontWeight: 700,
                      color: '#fff',
                      background: '#ef4444',
                      borderRadius: 8,
                      padding: '1px 5px',
                      minWidth: 16,
                      textAlign: 'center',
                    }}>
                      {pendingConflicts}
                    </span>
                  )}
                </div>
                <button
                  onClick={clearConflicts}
                  style={{
                    fontSize: 10,
                    color: 'rgba(255, 255, 255, 0.3)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '2px 6px',
                    borderRadius: 4,
                    transition: 'color 0.15s ease',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)' }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255, 255, 255, 0.3)' }}
                >
                  Clear
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {conflicts.slice(0, 20).map(conflict => {
                  const icon = ENTITY_ICONS[conflict.entity_type] ?? 'bx-cube'
                  const resColor = CONFLICT_RESOLUTION_COLORS[conflict.resolution] ?? '#6b7280'
                  return (
                    <div
                      key={conflict.id}
                      style={{
                        padding: '8px 10px',
                        borderRadius: 6,
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid rgba(255, 255, 255, 0.04)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                      }}
                    >
                      <i className={`bx ${icon}`} style={{ fontSize: 13, color: 'rgba(255, 255, 255, 0.3)', flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontSize: 11,
                          color: '#f8f8f8',
                          fontWeight: 500,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}>
                          {conflict.entity_id}
                        </div>
                        {conflict.detail && (
                          <div style={{ fontSize: 10, color: 'rgba(255, 255, 255, 0.25)', marginTop: 1 }}>
                            {conflict.detail}
                          </div>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                        <span style={{
                          fontSize: 9,
                          fontWeight: 600,
                          color: resColor,
                          padding: '1px 5px',
                          borderRadius: 4,
                          background: `${resColor}15`,
                          textTransform: 'uppercase',
                        }}>
                          {conflict.resolution.replace('_', ' ')}
                        </span>
                        <span style={{ fontSize: 9, color: 'rgba(255, 255, 255, 0.2)' }}>
                          {formatRelativeTime(conflict.timestamp)}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Connected tunnels section */}
          <div style={{ marginBottom: 24 }}>
            <div style={{
              fontSize: 11,
              fontWeight: 600,
              color: 'rgba(255, 255, 255, 0.35)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: 10,
            }}>
              Connected Tunnels ({tunnels.length})
            </div>

            {tunnels.length === 0 ? (
              <div style={{
                padding: '20px 16px',
                borderRadius: 10,
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.04)',
                textAlign: 'center',
              }}>
                <i className="bx bx-cloud-upload" style={{ fontSize: 24, color: 'rgba(255, 255, 255, 0.15)', display: 'block', marginBottom: 8 }} />
                <div style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.3)' }}>
                  No tunnels connected
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {tunnels.map(tunnel => (
                  <div
                    key={tunnel.id}
                    style={{
                      padding: '10px 12px',
                      borderRadius: 8,
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                    }}
                  >
                    <div style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: TUNNEL_STATUS_COLORS[tunnel.status] ?? 'rgba(255, 255, 255, 0.3)',
                      flexShrink: 0,
                    }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: '#f8f8f8',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        {tunnel.name}
                      </div>
                      {tunnel.workspace && (
                        <div style={{
                          fontSize: 11,
                          color: 'rgba(255, 255, 255, 0.3)',
                          marginTop: 1,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}>
                          {tunnel.workspace}
                        </div>
                      )}
                    </div>
                    <div style={{
                      fontSize: 10,
                      color: 'rgba(255, 255, 255, 0.25)',
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                    }}>
                      {formatLastSeen(tunnel.last_seen_at)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent events section */}
          <div>
            <div style={{
              fontSize: 11,
              fontWeight: 600,
              color: 'rgba(255, 255, 255, 0.35)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: 10,
            }}>
              Recent Events ({displayEvents.length})
            </div>

            {displayEvents.length === 0 ? (
              <div style={{
                padding: '20px 16px',
                borderRadius: 10,
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.04)',
                textAlign: 'center',
              }}>
                <i className="bx bx-time-five" style={{ fontSize: 24, color: 'rgba(255, 255, 255, 0.15)', display: 'block', marginBottom: 8 }} />
                <div style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.3)' }}>
                  No recent events
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {displayEvents.map((event, idx) => {
                  const icon = ENTITY_ICONS[event.entity_type] ?? 'bx-cube'
                  const actionColor = ACTION_COLORS[event.action] ?? 'rgba(255, 255, 255, 0.5)'
                  return (
                    <div
                      key={`${event.entity_id}-${event.timestamp}-${idx}`}
                      style={{
                        padding: '8px 10px',
                        borderRadius: 6,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        transition: 'background 0.1s ease',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)' }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                    >
                      <i
                        className={`bx ${icon}`}
                        style={{
                          fontSize: 14,
                          color: 'rgba(255, 255, 255, 0.3)',
                          flexShrink: 0,
                        }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                        }}>
                          <span style={{
                            fontSize: 12,
                            color: '#f8f8f8',
                            fontWeight: 500,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}>
                            {event.entity_id}
                          </span>
                          <span style={{
                            fontSize: 10,
                            fontWeight: 600,
                            color: actionColor,
                            padding: '1px 5px',
                            borderRadius: 4,
                            background: `${actionColor}15`,
                            textTransform: 'uppercase',
                            letterSpacing: '0.03em',
                            flexShrink: 0,
                          }}>
                            {event.action.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                      <div style={{
                        fontSize: 10,
                        color: 'rgba(255, 255, 255, 0.2)',
                        whiteSpace: 'nowrap',
                        flexShrink: 0,
                      }}>
                        {formatRelativeTime(event.timestamp)}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes syncPulse {
          0%, 100% { opacity: 1 }
          50% { opacity: 0.5 }
        }
      `}</style>
    </>
  )
}
