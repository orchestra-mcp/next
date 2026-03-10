'use client'
import { useEffect, useState, useCallback } from 'react'
import { useTunnelStore } from '@/store/tunnels'
import type { Tunnel } from '@/store/tunnels'
import { useTunnelConnection } from '@/hooks/useTunnelConnection'
import { useTranslations } from 'next-intl'
import type { MCPTool } from '@/lib/mcp'

// --- Status helpers ---

const statusColors: Record<string, string> = {
  online: '#22c55e', offline: '#6b7280', connecting: '#f59e0b',
  connected: '#22c55e', disconnected: '#6b7280', error: '#ef4444',
}

const statusLabelKeys: Record<string, string> = {
  online: 'statusOnline', offline: 'statusOffline', connecting: 'statusConnecting',
  connected: 'statusConnected', disconnected: 'statusDisconnected', error: 'statusError',
}

const osIcons: Record<string, string> = {
  darwin: 'bxl-apple', linux: 'bxl-tux', windows: 'bxl-windows',
}

const osLabels: Record<string, string> = {
  darwin: 'macOS', linux: 'Linux', windows: 'Windows',
}

function timeAgo(dateStr?: string): string {
  if (!dateStr) return 'never'
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

// --- Register tunnel dialog ---

function RegisterDialog({
  onClose,
}: {
  onClose: () => void
}) {
  const registerTunnel = useTunnelStore(s => s.registerTunnel)
  const t = useTranslations('tunnels')
  const [token, setToken] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const textPrimary = 'var(--color-fg)'
  const textMuted = 'var(--color-fg-muted)'
  const inputBg = 'var(--color-bg-alt)'
  const inputBorder = 'var(--color-border)'

  async function handleSubmit() {
    if (!token.trim()) return
    setLoading(true)
    setError('')
    try {
      await registerTunnel(token.trim(), name.trim() || undefined)
      onClose()
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.5)',
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        width: 440, borderRadius: 14,
        background: 'var(--color-bg-contrast)',
        border: '1px solid var(--color-border)',
        boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
        padding: '24px',
      }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, color: textPrimary, margin: '0 0 4px' }}>{t('registerTitle')}</h3>
        <p style={{ fontSize: 13, color: textMuted, margin: '0 0 20px' }}>
          {t('registerDesc', { command: 'orchestra serve --web-gate' })}
        </p>
        <label style={{ fontSize: 12, fontWeight: 500, color: textMuted, display: 'block', marginBottom: 4 }}>{t('nameOptional')}</label>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder={t('namePlaceholder')}
          style={{
            width: '100%', padding: '8px 12px', borderRadius: 8,
            border: `1px solid ${inputBorder}`, background: inputBg,
            color: textPrimary, fontSize: 13, outline: 'none',
            marginBottom: 12, boxSizing: 'border-box',
          }}
        />
        <label style={{ fontSize: 12, fontWeight: 500, color: textMuted, display: 'block', marginBottom: 4 }}>{t('registrationToken')}</label>
        <textarea
          value={token}
          onChange={e => setToken(e.target.value)}
          placeholder="eyJob3N0bmFtZ..."
          rows={3}
          style={{
            width: '100%', padding: '8px 12px', borderRadius: 8,
            border: `1px solid ${inputBorder}`, background: inputBg,
            color: textPrimary, fontSize: 12, fontFamily: 'monospace',
            outline: 'none', resize: 'none', marginBottom: 12, boxSizing: 'border-box',
          }}
        />
        {error && <div style={{ fontSize: 12, color: '#ef4444', marginBottom: 12 }}>{error}</div>}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{
            padding: '8px 16px', borderRadius: 8,
            border: `1px solid ${inputBorder}`, background: 'transparent',
            color: textMuted, fontSize: 13, cursor: 'pointer',
          }}>Cancel</button>
          <button onClick={handleSubmit} disabled={loading || !token.trim()} style={{
            padding: '8px 16px', borderRadius: 8, border: 'none',
            background: '#a900ff', color: '#fff', fontSize: 13, fontWeight: 500,
            cursor: loading ? 'wait' : 'pointer',
            opacity: loading || !token.trim() ? 0.5 : 1,
          }}>{loading ? t('registering') : t('register')}</button>
        </div>
      </div>
    </div>
  )
}

// --- Rename dialog ---

function RenameDialog({
  tunnel, onClose,
}: {
  tunnel: Tunnel
  onClose: () => void
}) {
  const updateTunnel = useTunnelStore(s => s.updateTunnel)
  const t = useTranslations('tunnels')
  const [name, setName] = useState(tunnel.name)
  const [loading, setLoading] = useState(false)

  const textPrimary = 'var(--color-fg)'
  const textMuted = 'var(--color-fg-muted)'
  const inputBg = 'var(--color-bg-alt)'
  const inputBorder = 'var(--color-border)'

  async function handleSave() {
    if (!name.trim()) return
    setLoading(true)
    try {
      await updateTunnel(tunnel.id, { name: name.trim() })
      onClose()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.5)',
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        width: 380, borderRadius: 14,
        background: 'var(--color-bg-contrast)',
        border: '1px solid var(--color-border)',
        boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
        padding: '24px',
      }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, color: textPrimary, margin: '0 0 16px' }}>{t('renameTunnel')}</h3>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSave()}
          autoFocus
          style={{
            width: '100%', padding: '8px 12px', borderRadius: 8,
            border: `1px solid ${inputBorder}`, background: inputBg,
            color: textPrimary, fontSize: 13, outline: 'none',
            marginBottom: 16, boxSizing: 'border-box',
          }}
        />
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{
            padding: '8px 16px', borderRadius: 8,
            border: `1px solid ${inputBorder}`, background: 'transparent',
            color: textMuted, fontSize: 13, cursor: 'pointer',
          }}>Cancel</button>
          <button onClick={handleSave} disabled={loading || !name.trim()} style={{
            padding: '8px 16px', borderRadius: 8, border: 'none',
            background: '#a900ff', color: '#fff', fontSize: 13, fontWeight: 500,
            cursor: 'pointer', opacity: loading || !name.trim() ? 0.5 : 1,
          }}>{loading ? 'Saving...' : 'Save'}</button>
        </div>
      </div>
    </div>
  )
}

// --- Tool list panel ---

function ToolListPanel({
  tools,
}: {
  tools: MCPTool[]
}) {
  const t = useTranslations('tunnels')
  const [search, setSearch] = useState('')
  const textPrimary = 'var(--color-fg)'
  const textMuted = 'var(--color-fg-muted)'
  const textDim = 'var(--color-fg-dim)'
  const inputBg = 'var(--color-bg-alt)'
  const inputBorder = 'var(--color-border)'
  const rowBg = 'var(--color-bg-alt)'
  const rowBorder = 'var(--color-border)'

  const filtered = search
    ? tools.filter(t => t.name.toLowerCase().includes(search.toLowerCase()) || t.description?.toLowerCase().includes(search.toLowerCase()))
    : tools

  return (
    <div>
      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder={t('searchTools')}
        style={{
          width: '100%', padding: '7px 10px', borderRadius: 8,
          border: `1px solid ${inputBorder}`, background: inputBg,
          color: textPrimary, fontSize: 12, outline: 'none',
          marginBottom: 10, boxSizing: 'border-box',
        }}
      />
      <div style={{ maxHeight: 320, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px 0', color: textDim, fontSize: 12 }}>
            {search ? t('noMatchingTools') : t('noToolsAvailable')}
          </div>
        ) : filtered.map((tool, i) => (
          <div key={`${tool.name}-${i}`} style={{
            padding: '8px 10px', borderRadius: 8,
            border: `1px solid ${rowBorder}`, background: rowBg,
          }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: textPrimary, fontFamily: 'monospace' }}>
              {tool.name}
            </div>
            {tool.description && (
              <div style={{ fontSize: 11, color: textMuted, marginTop: 2, lineHeight: 1.4 }}>
                {tool.description.length > 120 ? tool.description.slice(0, 120) + '...' : tool.description}
              </div>
            )}
          </div>
        ))}
      </div>
      <div style={{ fontSize: 11, color: textDim, marginTop: 8, textAlign: 'end' }}>
        {t('toolsOfTotal', { filtered: filtered.length, total: tools.length })}
      </div>
    </div>
  )
}

// --- Main page ---

export default function TunnelsPage() {
  const {
    tunnels, activeTunnelId, connectionStatus,
    fetchTunnels, selectTunnel, removeTunnel, loading,
  } = useTunnelStore()
  const { status, listTools } = useTunnelConnection()
  const t = useTranslations('tunnels')

  const [showRegister, setShowRegister] = useState(false)
  const [renaming, setRenaming] = useState<Tunnel | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [toolsCache, setToolsCache] = useState<Record<string, MCPTool[]>>({})
  const [toolsLoading, setToolsLoading] = useState(false)

  useEffect(() => {
    fetchTunnels()
  }, [fetchTunnels])

  // Fetch tools when a tunnel is expanded and connected
  const fetchToolsForTunnel = useCallback(async (tunnelId: string) => {
    if (toolsCache[tunnelId]) return
    if (tunnelId !== activeTunnelId || status !== 'connected') return
    setToolsLoading(true)
    try {
      const tools = await listTools()
      setToolsCache(prev => ({ ...prev, [tunnelId]: tools }))
    } catch {
      // ignore
    } finally {
      setToolsLoading(false)
    }
  }, [activeTunnelId, status, listTools, toolsCache])

  // When active tunnel connects, fetch tools if expanded
  useEffect(() => {
    if (expandedId && expandedId === activeTunnelId && status === 'connected' && !toolsCache[expandedId]) {
      fetchToolsForTunnel(expandedId)
    }
  }, [expandedId, activeTunnelId, status, fetchToolsForTunnel, toolsCache])

  function handleExpand(tunnelId: string) {
    const next = expandedId === tunnelId ? null : tunnelId
    setExpandedId(next)
    if (next) {
      // Auto-select this tunnel for connection
      if (next !== activeTunnelId) selectTunnel(next)
      fetchToolsForTunnel(next)
    }
  }

  function handleRemove(tunnelId: string) {
    if (confirm(t('removeConfirm'))) {
      removeTunnel(tunnelId)
      if (expandedId === tunnelId) setExpandedId(null)
    }
  }

  // Theme colors
  const textPrimary = 'var(--color-fg)'
  const textMuted = 'var(--color-fg-muted)'
  const textDim = 'var(--color-fg-dim)'
  const cardBg = 'var(--color-bg-alt)'
  const cardBorder = 'var(--color-border)'
  const actionBg = 'var(--color-bg-alt)'
  const actionBorder = 'var(--color-border)'

  const onlineCount = tunnels.filter(t => t.status === 'online').length
  const connectedCount = Object.values(connectionStatus).filter(s => s === 'connected').length

  return (
    <div className="page-wrapper" style={{ padding: '28px 32px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: textPrimary, margin: 0, letterSpacing: '-0.02em' }}>{t('title')}</h1>
          <p style={{ fontSize: 13, color: textMuted, marginTop: 4 }}>
            {tunnels.length === 0 ? t('noMachinesYet') : t('machineCount', { count: tunnels.length, online: onlineCount })}
          </p>
        </div>
        <button onClick={() => setShowRegister(true)} style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '8px 16px', borderRadius: 8, border: 'none',
          background: '#a900ff', color: '#fff', fontSize: 13, fontWeight: 500,
          cursor: 'pointer',
        }}>
          <i className="bx bx-plus" style={{ fontSize: 16 }} />
          {t('registerTunnel')}
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
        {[
          { icon: 'bx-desktop', label: t('totalMachines'), value: String(tunnels.length), color: '#00e5ff' },
          { icon: 'bx-signal-5', label: t('online'), value: String(onlineCount), color: '#22c55e' },
          { icon: 'bx-transfer-alt', label: t('wsConnected'), value: String(connectedCount), color: '#a900ff' },
          { icon: 'bx-wrench', label: t('totalTools'), value: String(tunnels.reduce((sum, tn) => sum + tn.tool_count, 0)), color: '#f59e0b' },
        ].map(s => (
          <div key={s.label} style={{
            background: cardBg, border: `1px solid ${cardBorder}`,
            borderRadius: 14, padding: '20px 22px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <span style={{ fontSize: 12, fontWeight: 500, color: textMuted }}>{s.label}</span>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: `${s.color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className={`bx ${s.icon}`} style={{ fontSize: 16, color: s.color }} />
              </div>
            </div>
            <div style={{ fontSize: 30, fontWeight: 700, color: textPrimary, letterSpacing: '-0.03em', lineHeight: 1 }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Machine list */}
      {loading && tunnels.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: textDim }}>{t('loadingTunnels')}</div>
      ) : tunnels.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '60px 20px',
          background: cardBg, border: `1px solid ${cardBorder}`,
          borderRadius: 14,
        }}>
          <i className="bx bx-transfer-alt" style={{ fontSize: 40, color: textDim, display: 'block', marginBottom: 12 }} />
          <div style={{ fontSize: 15, fontWeight: 500, color: textPrimary, marginBottom: 6 }}>{t('noTunnelsRegistered')}</div>
          <div style={{ fontSize: 13, color: textMuted, marginBottom: 20 }}>
            {t('noTunnelsDesc', { command: 'orchestra serve --web-gate :9201' })}
          </div>
          <button onClick={() => setShowRegister(true)} style={{
            padding: '8px 16px', borderRadius: 8, border: 'none',
            background: '#a900ff', color: '#fff', fontSize: 13, fontWeight: 500, cursor: 'pointer',
          }}>{t('registerFirst')}</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {tunnels.map(tunnel => {
            const isActive = tunnel.id === activeTunnelId
            const wsStatus = connectionStatus[tunnel.id] ?? 'disconnected'
            const expanded = expandedId === tunnel.id
            const displayStatus = isActive ? wsStatus : tunnel.status
            const tools = toolsCache[tunnel.id]

            return (
              <div key={tunnel.id} style={{
                background: cardBg,
                border: `1px solid ${expanded ? 'rgba(169,0,255,0.25)' : cardBorder}`,
                borderRadius: 14, overflow: 'hidden',
                transition: 'border-color 0.15s',
              }}>
                {/* Row header */}
                <div
                  onClick={() => handleExpand(tunnel.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '16px 20px', cursor: 'pointer',
                  }}
                >
                  {/* OS icon */}
                  <div style={{
                    width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                    background: isActive ? 'rgba(169,0,255,0.1)' : 'var(--color-bg-alt)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <i className={`bx ${osIcons[tunnel.os] ?? 'bx-desktop'}`} style={{
                      fontSize: 20, color: isActive ? '#a900ff' : textMuted,
                    }} />
                  </div>

                  {/* Name + meta */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{
                        fontSize: 14, fontWeight: 600, color: textPrimary,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>{tunnel.name}</span>
                      {isActive && (
                        <span style={{
                          fontSize: 9, padding: '2px 6px', borderRadius: 4,
                          background: 'rgba(169,0,255,0.12)', color: '#a900ff',
                          fontWeight: 600, letterSpacing: '0.04em', flexShrink: 0,
                        }}>ACTIVE</span>
                      )}
                    </div>
                    <div style={{ fontSize: 12, color: textMuted, marginTop: 2 }}>
                      {tunnel.hostname} &middot; {osLabels[tunnel.os] ?? tunnel.os} {tunnel.architecture} &middot; {tunnel.tool_count} tools
                    </div>
                  </div>

                  {/* Status dot + label */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                    <span style={{
                      width: 8, height: 8, borderRadius: '50%',
                      background: statusColors[displayStatus] ?? '#6b7280',
                    }} />
                    <span style={{ fontSize: 12, fontWeight: 500, color: statusColors[displayStatus] ?? textMuted }}>
                      {statusLabelKeys[displayStatus] ? t(statusLabelKeys[displayStatus] as any) : displayStatus}
                    </span>
                  </div>

                  {/* Last seen */}
                  <span style={{ fontSize: 11, color: textDim, flexShrink: 0, minWidth: 50, textAlign: 'end' }}>
                    {timeAgo(tunnel.last_seen_at ?? tunnel.updated_at)}
                  </span>

                  {/* Expand chevron */}
                  <i className={`bx bx-chevron-${expanded ? 'up' : 'down'}`} style={{ fontSize: 18, color: textDim }} />
                </div>

                {/* Expanded detail */}
                {expanded && (
                  <div style={{
                    padding: '0 20px 20px',
                    borderTop: `1px solid ${cardBorder}`,
                  }}>
                    {/* Actions bar */}
                    <div style={{ display: 'flex', gap: 8, padding: '14px 0 16px', flexWrap: 'wrap' }}>
                      {!isActive && (
                        <button onClick={e => { e.stopPropagation(); selectTunnel(tunnel.id) }} style={{
                          display: 'inline-flex', alignItems: 'center', gap: 5,
                          padding: '6px 12px', borderRadius: 7, fontSize: 12, fontWeight: 500,
                          border: `1px solid ${actionBorder}`, background: actionBg,
                          color: textPrimary, cursor: 'pointer',
                        }}>
                          <i className="bx bx-link" style={{ fontSize: 14 }} /> {t('connect')}
                        </button>
                      )}
                      {isActive && wsStatus === 'connected' && (
                        <button onClick={e => { e.stopPropagation(); selectTunnel(null) }} style={{
                          display: 'inline-flex', alignItems: 'center', gap: 5,
                          padding: '6px 12px', borderRadius: 7, fontSize: 12, fontWeight: 500,
                          border: `1px solid ${actionBorder}`, background: actionBg,
                          color: textPrimary, cursor: 'pointer',
                        }}>
                          <i className="bx bx-unlink" style={{ fontSize: 14 }} /> {t('disconnect')}
                        </button>
                      )}
                      <button onClick={e => { e.stopPropagation(); setRenaming(tunnel) }} style={{
                        display: 'inline-flex', alignItems: 'center', gap: 5,
                        padding: '6px 12px', borderRadius: 7, fontSize: 12, fontWeight: 500,
                        border: `1px solid ${actionBorder}`, background: actionBg,
                        color: textPrimary, cursor: 'pointer',
                      }}>
                        <i className="bx bx-edit-alt" style={{ fontSize: 14 }} /> {t('rename')}
                      </button>
                      <button onClick={e => { e.stopPropagation(); handleRemove(tunnel.id) }} style={{
                        display: 'inline-flex', alignItems: 'center', gap: 5,
                        padding: '6px 12px', borderRadius: 7, fontSize: 12, fontWeight: 500,
                        border: '1px solid rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.06)',
                        color: '#ef4444', cursor: 'pointer',
                      }}>
                        <i className="bx bx-trash" style={{ fontSize: 14 }} /> {t('remove')}
                      </button>
                    </div>

                    {/* Info grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                      {[
                        { label: t('hostname'), value: tunnel.hostname },
                        { label: t('osArch'), value: `${osLabels[tunnel.os] ?? tunnel.os} / ${tunnel.architecture}` },
                        { label: t('localIp'), value: tunnel.local_ip ?? t('unknown') },
                        { label: t('gateAddress'), value: tunnel.gate_address },
                        { label: t('version'), value: tunnel.version || t('unknown') },
                        { label: t('toolCount'), value: String(tunnel.tool_count) },
                        { label: t('labels'), value: tunnel.labels.length > 0 ? tunnel.labels.join(', ') : t('none') },
                        { label: t('registered'), value: new Date(tunnel.created_at).toLocaleDateString() },
                      ].map(item => (
                        <div key={item.label} style={{
                          padding: '10px 12px', borderRadius: 8,
                          background: 'var(--color-bg-alt)',
                          border: '1px solid var(--color-border)',
                        }}>
                          <div style={{ fontSize: 10, fontWeight: 600, color: textDim, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 3 }}>{item.label}</div>
                          <div style={{ fontSize: 13, color: textPrimary, fontFamily: item.label === 'Gate Address' || item.label === 'Local IP' ? 'monospace' : 'inherit' }}>{item.value}</div>
                        </div>
                      ))}
                    </div>

                    {/* Tools section */}
                    {isActive && wsStatus === 'connected' && (
                      <div>
                        <h4 style={{ fontSize: 13, fontWeight: 600, color: textPrimary, margin: '0 0 10px', display: 'flex', alignItems: 'center', gap: 6 }}>
                          <i className="bx bx-wrench" style={{ fontSize: 15, color: '#f59e0b' }} />
                          {t('availableTools')}
                          {toolsLoading && <span style={{ fontSize: 11, color: textDim, fontWeight: 400 }}>loading...</span>}
                        </h4>
                        {tools ? (
                          <ToolListPanel tools={tools} />
                        ) : toolsLoading ? (
                          <div style={{ padding: '16px 0', textAlign: 'center', color: textDim, fontSize: 12 }}>
                            {t('fetchingTools')}
                          </div>
                        ) : (
                          <div style={{ padding: '16px 0', textAlign: 'center', color: textDim, fontSize: 12 }}>
                            {t('connectToSeeTools')}
                          </div>
                        )}
                      </div>
                    )}
                    {isActive && wsStatus === 'connecting' && (
                      <div style={{ padding: '12px 0', textAlign: 'center', color: '#f59e0b', fontSize: 12 }}>
                        <i className="bx bx-loader-alt bx-spin" style={{ marginInlineEnd: 6 }} />
                        {t('connectingToTunnel')}
                      </div>
                    )}
                    {!isActive && (
                      <div style={{ padding: '12px 0', textAlign: 'center', color: textDim, fontSize: 12 }}>
                        {t('selectToConnect')}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Dialogs */}
      {showRegister && <RegisterDialog onClose={() => setShowRegister(false)} />}
      {renaming && <RenameDialog tunnel={renaming} onClose={() => setRenaming(null)} />}
    </div>
  )
}
