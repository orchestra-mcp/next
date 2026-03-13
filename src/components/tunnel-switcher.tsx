'use client'
import { useEffect, useState } from 'react'
import { useTunnelStore } from '@/store/tunnels'
import type { Tunnel, ConnectionStatus } from '@/store/tunnels'

const statusColors: Record<Tunnel['status'] | ConnectionStatus, string> = {
  online: '#22c55e',
  offline: '#6b7280',
  connecting: '#f59e0b',
  connected: '#22c55e',
  disconnected: '#6b7280',
  error: '#ef4444',
}

const statusLabels: Record<Tunnel['status'] | ConnectionStatus, string> = {
  online: 'Online',
  offline: 'Offline',
  connecting: 'Connecting',
  connected: 'Connected',
  disconnected: 'Disconnected',
  error: 'Error',
}

const osIcons: Record<string, string> = {
  darwin: 'bx bxl-apple',
  linux: 'bx bxl-tux',
  windows: 'bx bxl-windows',
}

export function TunnelSwitcher() {
  const {
    tunnels,
    activeTunnelId,
    connectionStatus,
    fetchTunnels,
    selectTunnel,
    removeTunnel,
  } = useTunnelStore()
  const [open, setOpen] = useState(false)
  const [showRegister, setShowRegister] = useState(false)
  const [registerToken, setRegisterToken] = useState('')
  const [registerName, setRegisterName] = useState('')
  const [registerLoading, setRegisterLoading] = useState(false)
  const [registerError, setRegisterError] = useState('')
  const registerTunnel = useTunnelStore(s => s.registerTunnel)

  useEffect(() => {
    fetchTunnels()
  }, [fetchTunnels])

  const activeTunnel = tunnels.find(t => t.id === activeTunnelId)
  const activeStatus = activeTunnelId
    ? connectionStatus[activeTunnelId] ?? 'disconnected'
    : 'disconnected'

  async function handleRegister() {
    if (!registerToken.trim()) return
    setRegisterLoading(true)
    setRegisterError('')
    try {
      await registerTunnel(registerToken.trim(), registerName.trim() || undefined)
      setRegisterToken('')
      setRegisterName('')
      setShowRegister(false)
    } catch (e) {
      setRegisterError((e as Error).message)
    } finally {
      setRegisterLoading(false)
    }
  }

  return (
    <div style={{ padding: '0 8px', marginBottom: 4 }}>
      {/* Section header */}
      <div style={{
        padding: '0 8px 6px',
        fontSize: 11,
        fontWeight: 600,
        color: 'rgba(255,255,255,0.25)',
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <span>Tunnels</span>
        <button
          onClick={() => setOpen(!open)}
          style={{
            background: 'none',
            border: 'none',
            color: 'rgba(255,255,255,0.35)',
            cursor: 'pointer',
            fontSize: 14,
            padding: 0,
          }}
        >
          <i className={`bx ${open ? 'bx-chevron-up' : 'bx-chevron-down'}`} />
        </button>
      </div>

      {/* Active tunnel indicator (always shown) */}
      {activeTunnel && (
        <button
          onClick={() => setOpen(!open)}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 12px',
            borderRadius: 8,
            border: '1px solid rgba(169,0,255,0.2)',
            background: 'rgba(169,0,255,0.08)',
            cursor: 'pointer',
            textAlign: 'start',
          }}
        >
          <span style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: statusColors[activeStatus],
            flexShrink: 0,
          }} />
          <i
            className={osIcons[activeTunnel.os] ?? 'bx bx-desktop'}
            style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)' }}
          />
          <span style={{
            flex: 1,
            fontSize: 13,
            fontWeight: 500,
            color: '#f8f8f8',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {activeTunnel.name}
          </span>
          <span style={{
            fontSize: 10,
            color: statusColors[activeStatus],
            fontWeight: 500,
          }}>
            {statusLabels[activeStatus]}
          </span>
        </button>
      )}

      {/* No tunnels */}
      {!activeTunnel && tunnels.length === 0 && (
        <button
          onClick={() => { setOpen(true); setShowRegister(true) }}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 12px',
            borderRadius: 8,
            border: '1px dashed rgba(255,255,255,0.12)',
            background: 'transparent',
            cursor: 'pointer',
            fontSize: 12,
            color: 'rgba(255,255,255,0.4)',
          }}
        >
          <i className="bx bx-plus" style={{ fontSize: 14 }} />
          Add a tunnel
        </button>
      )}

      {/* Expanded panel */}
      {open && (
        <div style={{
          marginTop: 4,
          borderRadius: 8,
          border: '1px solid rgba(255,255,255,0.06)',
          background: 'rgba(0,0,0,0.2)',
          overflow: 'hidden',
        }}>
          {/* Tunnel list */}
          {tunnels.map(tunnel => {
            const isActive = tunnel.id === activeTunnelId
            const wsStatus = connectionStatus[tunnel.id] ?? 'disconnected'
            return (
              <div
                key={tunnel.id}
                onClick={() => selectTunnel(tunnel.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 12px',
                  cursor: 'pointer',
                  background: isActive ? 'rgba(169,0,255,0.1)' : 'transparent',
                  /* no left border */
                  transition: 'background 0.1s',
                }}
              >
                <span style={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  background: statusColors[tunnel.status],
                  flexShrink: 0,
                }} />
                <i
                  className={osIcons[tunnel.os] ?? 'bx bx-desktop'}
                  style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 12,
                    fontWeight: isActive ? 500 : 400,
                    color: isActive ? '#f8f8f8' : 'rgba(255,255,255,0.6)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {tunnel.name}
                  </div>
                  <div style={{
                    fontSize: 10,
                    color: 'rgba(255,255,255,0.25)',
                  }}>
                    {tunnel.hostname} &middot; {tunnel.tool_count} tools
                    {tunnel.workspace && (
                      <span style={{ display: 'block', marginTop: 1, opacity: 0.8 }}>{tunnel.workspace}</span>
                    )}
                  </div>
                </div>
                {isActive && (
                  <span style={{
                    fontSize: 9,
                    padding: '1px 5px',
                    borderRadius: 4,
                    background: statusColors[wsStatus],
                    color: '#000',
                    fontWeight: 600,
                  }}>
                    {wsStatus === 'connected' ? 'WS' : wsStatus === 'connecting' ? '...' : ''}
                  </span>
                )}
                <button
                  onClick={e => { e.stopPropagation(); removeTunnel(tunnel.id) }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'rgba(255,255,255,0.2)',
                    cursor: 'pointer',
                    fontSize: 13,
                    padding: '0 2px',
                  }}
                >
                  <i className="bx bx-x" />
                </button>
              </div>
            )
          })}

          {/* Register button / form */}
          {!showRegister ? (
            <button
              onClick={() => setShowRegister(true)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 12px',
                background: 'none',
                border: 'none',
                borderTop: '1px solid rgba(255,255,255,0.06)',
                cursor: 'pointer',
                fontSize: 12,
                color: 'rgba(255,255,255,0.4)',
              }}
            >
              <i className="bx bx-plus" style={{ fontSize: 14 }} />
              Register tunnel
            </button>
          ) : (
            <div style={{
              padding: '8px 12px',
              borderTop: '1px solid rgba(255,255,255,0.06)',
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
            }}>
              <input
                value={registerName}
                onChange={e => setRegisterName(e.target.value)}
                placeholder="Name (optional)"
                style={{
                  padding: '5px 8px',
                  borderRadius: 6,
                  border: '1px solid rgba(255,255,255,0.1)',
                  background: 'rgba(255,255,255,0.04)',
                  color: '#f8f8f8',
                  fontSize: 12,
                  outline: 'none',
                }}
              />
              <textarea
                value={registerToken}
                onChange={e => setRegisterToken(e.target.value)}
                placeholder="Paste registration token..."
                rows={2}
                style={{
                  padding: '5px 8px',
                  borderRadius: 6,
                  border: '1px solid rgba(255,255,255,0.1)',
                  background: 'rgba(255,255,255,0.04)',
                  color: '#f8f8f8',
                  fontSize: 11,
                  fontFamily: 'monospace',
                  outline: 'none',
                  resize: 'none',
                }}
              />
              {registerError && (
                <div style={{ fontSize: 11, color: '#ef4444' }}>{registerError}</div>
              )}
              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  onClick={handleRegister}
                  disabled={registerLoading || !registerToken.trim()}
                  style={{
                    flex: 1,
                    padding: '5px 8px',
                    borderRadius: 6,
                    border: 'none',
                    background: '#a900ff',
                    color: '#fff',
                    fontSize: 12,
                    fontWeight: 500,
                    cursor: registerLoading ? 'wait' : 'pointer',
                    opacity: registerLoading || !registerToken.trim() ? 0.5 : 1,
                  }}
                >
                  {registerLoading ? 'Registering...' : 'Register'}
                </button>
                <button
                  onClick={() => { setShowRegister(false); setRegisterError('') }}
                  style={{
                    padding: '5px 8px',
                    borderRadius: 6,
                    border: '1px solid rgba(255,255,255,0.1)',
                    background: 'transparent',
                    color: 'rgba(255,255,255,0.5)',
                    fontSize: 12,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
