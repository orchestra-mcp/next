'use client'

import { useTunnelStore } from '@/store/tunnels'
import Link from 'next/link'

const STATUS_COLORS: Record<string, string> = {
  connected: '#22c55e',
  connecting: '#f59e0b',
  disconnected: '#6b7280',
  error: '#ef4444',
}

export function ActiveTunnelsWidget() {
  const tunnels = useTunnelStore(s => s.tunnels)
  const activeTunnelId = useTunnelStore(s => s.activeTunnelId)
  const connectionStatus = useTunnelStore(s => s.connectionStatus)

  if (tunnels.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--color-fg-dim)', fontSize: 13 }}>
        <i className="bx bx-transfer-alt" style={{ fontSize: 24, opacity: 0.4, display: 'block', marginBottom: 6 }} />
        No tunnels configured
        <div style={{ marginTop: 10 }}>
          <Link href="/tunnels" style={{
            fontSize: 12, color: '#a900ff', textDecoration: 'none',
            padding: '4px 12px', borderRadius: 6,
            border: '1px solid rgba(169,0,255,0.3)',
          }}>
            Set up a tunnel
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {tunnels.map(tunnel => {
        const isActive = tunnel.id === activeTunnelId
        const status = isActive ? (connectionStatus[tunnel.id] || 'disconnected') : 'disconnected'
        const statusColor = STATUS_COLORS[status] || '#6b7280'

        return (
          <Link
            key={tunnel.id}
            href="/tunnels"
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '8px 10px', borderRadius: 8, textDecoration: 'none',
              background: isActive ? 'rgba(169,0,255,0.06)' : 'transparent',
              border: `1px solid ${isActive ? 'rgba(169,0,255,0.2)' : 'transparent'}`,
              transition: 'background 0.15s',
            }}
          >
            <span style={{
              width: 8, height: 8, borderRadius: '50%',
              background: statusColor, flexShrink: 0,
              boxShadow: status === 'connected' ? `0 0 6px ${statusColor}` : 'none',
            }} />
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div style={{
                fontSize: 13, fontWeight: 600, color: 'var(--color-fg)',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {tunnel.name}
              </div>
              <div style={{ fontSize: 11, color: 'var(--color-fg-dim)' }}>
                {tunnel.hostname || 'localhost'}
              </div>
            </div>
            <span style={{
              fontSize: 9, padding: '2px 6px', borderRadius: 4,
              background: `${statusColor}15`, color: statusColor,
              fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em',
            }}>
              {status}
            </span>
          </Link>
        )
      })}
    </div>
  )
}
