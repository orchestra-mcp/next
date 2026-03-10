'use client'
import { useState, useMemo, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { useMCP } from '@/hooks/useMCP'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import type { MCPTool } from '@/lib/mcp'

// ---------------------------------------------------------------------------
// Plugin definitions
// ---------------------------------------------------------------------------

interface PluginDef {
  key: string
  label: string
  icon: string
  color: string
  description: string
  match: (name: string) => boolean
}

const PLUGINS: PluginDef[] = [
  { key: 'components', label: 'Components', icon: 'bx-cube', color: '#a900ff', description: 'UI component inspection and management', match: n => n.startsWith('component_') },
  { key: 'database', label: 'Database', icon: 'bx-data', color: '#00e5ff', description: 'Database queries, schema inspection, migrations', match: n => n.startsWith('db_') },
  { key: 'debugger', label: 'Debugger', icon: 'bx-bug', color: '#ef4444', description: 'Breakpoints, stack traces, variable inspection', match: n => n.startsWith('debug_') },
  { key: 'devops', label: 'DevOps', icon: 'bx-rocket', color: '#f59e0b', description: 'CI/CD pipelines, deployments, infrastructure', match: n => n.startsWith('devops_') },
  { key: 'docker', label: 'Docker', icon: 'bx-box', color: '#2563eb', description: 'Container management, images, compose', match: n => n.startsWith('docker_') },
  { key: 'file-explorer', label: 'File Explorer', icon: 'bx-file', color: '#10b981', description: 'Browse files, read/write, search, LSP features', match: n => ['list_directory', 'read_file', 'write_file', 'delete_file', 'move_file', 'file_info', 'file_search', 'code_symbols', 'code_goto_definition', 'code_find_references', 'code_hover', 'code_complete', 'code_diagnostics', 'code_actions', 'code_workspace_symbols', 'code_namespace', 'code_imports'].includes(n) },
  { key: 'git', label: 'Git', icon: 'bx-git-branch', color: '#f97316', description: 'Repository operations, branches, commits, diffs', match: n => n.startsWith('git_') || n.startsWith('gh_') },
  { key: 'log-viewer', label: 'Log Viewer', icon: 'bx-list-ul', color: '#8b5cf6', description: 'Application and system log monitoring', match: n => n.startsWith('log_') },
  { key: 'services', label: 'Services', icon: 'bx-server', color: '#06b6d4', description: 'Service management, health checks, restart', match: n => n.endsWith('_service') || n.endsWith('_services') || ['list_services', 'restart_service', 'service_info', 'service_logs', 'start_service', 'stop_service'].includes(n) },
  { key: 'ssh', label: 'SSH', icon: 'bx-terminal', color: '#64748b', description: 'Remote server connections and command execution', match: n => n.startsWith('ssh_') },
  { key: 'terminal', label: 'Terminal', icon: 'bx-command', color: '#22c55e', description: 'Shell sessions and command execution', match: n => n.includes('terminal') },
  { key: 'test-runner', label: 'Test Runner', icon: 'bx-check-circle', color: '#14b8a6', description: 'Run tests, view results, coverage reports', match: n => n.startsWith('test_') },
]

// ---------------------------------------------------------------------------
// Schema helpers
// ---------------------------------------------------------------------------

interface SchemaProperty {
  name: string
  type: string
  description: string
  required: boolean
  enumValues?: string[]
}

function extractSchemaProperties(schema: Record<string, unknown> | undefined): SchemaProperty[] {
  if (!schema) return []
  const properties = schema.properties as Record<string, Record<string, unknown>> | undefined
  if (!properties) return []
  const required = (schema.required as string[]) ?? []
  return Object.entries(properties).map(([name, prop]) => ({
    name,
    type: (prop.type as string) ?? 'unknown',
    description: (prop.description as string) ?? '',
    required: required.includes(name),
    enumValues: prop.enum as string[] | undefined,
  }))
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default function DevToolsPage() {
  const { callTool, tools, status: connStatus, tunnel, loading: toolsLoading } = useMCP()
  const t = useTranslations('app')
  const searchParams = useSearchParams()
  const selectedPluginKey = searchParams.get('plugin')

  const [search, setSearch] = useState('')

  // Try Tool modal
  const [tryTool, setTryTool] = useState<MCPTool | null>(null)
  const [tryArgs, setTryArgs] = useState<Record<string, string>>({})
  const [tryRunning, setTryRunning] = useState(false)
  const [tryResult, setTryResult] = useState<string | null>(null)
  const [tryError, setTryError] = useState<string | null>(null)

  // Session state
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [sessionMessages, setSessionMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([])
  const [sessionInput, setSessionInput] = useState('')
  const [sessionSending, setSessionSending] = useState(false)
  const [sessionCreating, setSessionCreating] = useState(false)

  // Get current plugin and its tools
  const currentPlugin = PLUGINS.find(p => p.key === selectedPluginKey) ?? null
  const currentTools = useMemo(() => {
    if (!currentPlugin) return []
    return tools.filter(t => currentPlugin.match(t.name))
  }, [tools, currentPlugin])

  const filteredTools = useMemo(() => {
    if (!search.trim()) return currentTools
    const q = search.toLowerCase()
    return currentTools.filter(t => t.name.toLowerCase().includes(q) || (t.description ?? '').toLowerCase().includes(q))
  }, [currentTools, search])

  // Try tool handlers
  const openTryTool = useCallback((tool: MCPTool) => {
    setTryTool(tool)
    setTryArgs({})
    setTryResult(null)
    setTryError(null)
    setTryRunning(false)
  }, [])

  const executeTool = useCallback(async () => {
    if (!tryTool || connStatus !== 'connected') return
    setTryRunning(true)
    setTryResult(null)
    setTryError(null)
    try {
      const args: Record<string, unknown> = {}
      for (const [key, value] of Object.entries(tryArgs)) {
        if (value.trim()) {
          try { args[key] = JSON.parse(value) } catch { args[key] = value }
        }
      }
      const result = await callTool(tryTool.name, Object.keys(args).length > 0 ? args : undefined)
      const text = result.content?.map((c: { type: string; text: string }) => c.text).join('\n') ?? 'No output'
      setTryResult(text)
    } catch (e) {
      setTryError((e as Error).message)
    } finally {
      setTryRunning(false)
    }
  }, [tryTool, tryArgs, connStatus, callTool])

  // Session handlers
  const startSession = useCallback(async () => {
    if (!currentPlugin || connStatus !== 'connected') return
    setSessionCreating(true)
    try {
      const result = await callTool('create_session', {
        account_id: 'default',
        name: `DevTools: ${currentPlugin.label}`,
      })
      const text = result.content?.[0]?.text ?? ''
      const idMatch = text.match(/SES-[A-Z0-9]+/)
      if (idMatch) {
        setSessionId(idMatch[0])
        setSessionMessages([])
      }
    } catch (e) {
      console.error('[devtools] create_session error:', e)
    } finally {
      setSessionCreating(false)
    }
  }, [currentPlugin, connStatus, callTool])

  const sendMessage = useCallback(async () => {
    if (!sessionId || !sessionInput.trim() || connStatus !== 'connected') return
    const msg = sessionInput.trim()
    setSessionInput('')
    setSessionMessages(prev => [...prev, { role: 'user', text: msg }])
    setSessionSending(true)
    try {
      const result = await callTool('send_message', { session_id: sessionId, message: msg })
      const text = result.content?.[0]?.text ?? ''
      setSessionMessages(prev => [...prev, { role: 'assistant', text }])
    } catch (e) {
      setSessionMessages(prev => [...prev, { role: 'assistant', text: `Error: ${(e as Error).message}` }])
    } finally {
      setSessionSending(false)
    }
  }, [sessionId, sessionInput, connStatus, callTool])

  const endSession = useCallback(async () => {
    if (!sessionId) return
    try { await callTool('delete_session', { session_id: sessionId }) } catch { /* ignore */ }
    setSessionId(null)
    setSessionMessages([])
  }, [sessionId, callTool])

  // Not connected
  if (connStatus !== 'connected' && connStatus !== 'connecting') {
    return (
      <div className="page-wrapper" style={{ padding: '28px 32px' }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 24px', letterSpacing: '-0.02em' }}>DevTools</h1>
        <div style={{ padding: '60px 40px', textAlign: 'center', borderRadius: 12, border: '1px solid var(--color-border)' }}>
          <i className="bx bx-transfer-alt" style={{ fontSize: 40, color: '#f59e0b', display: 'block', marginBottom: 14 }} />
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>No tunnel connected</div>
          <div style={{ fontSize: 13, color: 'var(--color-fg-muted)', marginBottom: 20 }}>
            Connect to a workspace tunnel to access DevTools.
          </div>
          <Link href="/tunnels" style={{ padding: '9px 20px', borderRadius: 9, border: 'none', background: 'linear-gradient(135deg, #00e5ff, #a900ff)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', textDecoration: 'none', display: 'inline-block' }}>
            Go to Tunnels
          </Link>
        </div>
      </div>
    )
  }

  if (connStatus === 'connecting') {
    return (
      <div className="page-wrapper" style={{ padding: '28px 32px' }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 24px', letterSpacing: '-0.02em' }}>DevTools</h1>
        <div style={{ padding: '60px 40px', textAlign: 'center', borderRadius: 12, border: '1px solid var(--color-border)' }}>
          <i className="bx bx-loader-alt bx-spin" style={{ fontSize: 36, color: '#00e5ff', display: 'block', marginBottom: 14 }} />
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>Connecting to workspace...</div>
          {tunnel && <div style={{ fontSize: 12, color: 'var(--color-fg-muted)' }}>{tunnel.name} ({tunnel.hostname})</div>}
        </div>
      </div>
    )
  }

  // No plugin selected
  if (!currentPlugin) {
    return (
      <div className="page-wrapper" style={{ padding: '28px 32px', height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <i className="bx bx-wrench" style={{ fontSize: 48, color: 'var(--color-fg-muted)', opacity: 0.3, display: 'block', marginBottom: 14 }} />
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-fg-muted)', marginBottom: 6 }}>Select a plugin</div>
            <div style={{ fontSize: 13, color: 'var(--color-fg-muted)', opacity: 0.6 }}>
              Choose a DevTools plugin from the sidebar
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Session view
  if (sessionId) {
    return (
      <div className="page-wrapper" style={{ padding: 0, height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Session header */}
        <div style={{
          padding: '14px 24px',
          borderBottom: '1px solid var(--color-border)',
          display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0,
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: `${currentPlugin.color}15`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <i className={`bx ${currentPlugin.icon}`} style={{ fontSize: 16, color: currentPlugin.color }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 600 }}>{currentPlugin.label} Session</div>
            <div style={{ fontSize: 11, color: 'var(--color-fg-muted)', fontFamily: 'monospace' }}>{sessionId}</div>
          </div>
          <span style={{
            fontSize: 10, padding: '2px 8px', borderRadius: 5,
            background: 'rgba(16,185,129,0.1)', color: '#10b981', fontWeight: 500,
          }}>
            Active
          </span>
          <button
            onClick={endSession}
            style={{
              display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 7,
              border: 'none', background: 'rgba(239,68,68,0.08)', color: '#ef4444',
              fontSize: 12, fontWeight: 600, cursor: 'pointer',
            }}
          >
            <i className="bx bx-stop" style={{ fontSize: 14 }} />
            End
          </button>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {sessionMessages.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <div style={{ fontSize: 13, color: 'var(--color-fg-muted)' }}>
                Session started. Send a message to interact with {currentPlugin.label} tools.
              </div>
            </div>
          )}
          {sessionMessages.map((msg, i) => (
            <div key={i} style={{ alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
              <div style={{
                padding: '10px 14px', borderRadius: 10,
                background: msg.role === 'user' ? 'rgba(0,229,255,0.08)' : 'var(--color-bg-secondary)',
                border: `1px solid ${msg.role === 'user' ? 'rgba(0,229,255,0.15)' : 'var(--color-border)'}`,
              }}>
                <pre style={{
                  fontSize: 12, lineHeight: 1.5,
                  whiteSpace: 'pre-wrap', wordBreak: 'break-word', margin: 0,
                  fontFamily: msg.role === 'assistant' ? 'monospace' : 'inherit',
                }}>
                  {msg.text}
                </pre>
              </div>
            </div>
          ))}
          {sessionSending && (
            <div style={{ alignSelf: 'flex-start' }}>
              <div style={{ padding: '10px 14px', borderRadius: 10, background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}>
                <i className="bx bx-loader-alt bx-spin" style={{ fontSize: 14, color: '#00e5ff' }} />
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div style={{ padding: '12px 24px', borderTop: '1px solid var(--color-border)', flexShrink: 0 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              value={sessionInput}
              onChange={e => setSessionInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder={`Message ${currentPlugin.label}...`}
              disabled={sessionSending}
              style={{
                flex: 1, padding: '9px 12px', borderRadius: 9,
                border: '1px solid var(--color-border)', background: 'var(--color-bg-secondary)',
                fontSize: 13, outline: 'none',
              }}
            />
            <button
              onClick={sendMessage}
              disabled={sessionSending || !sessionInput.trim()}
              style={{
                padding: '9px 16px', borderRadius: 9, border: 'none',
                background: sessionInput.trim() ? 'linear-gradient(135deg, #00e5ff, #a900ff)' : 'var(--color-bg-secondary)',
                color: sessionInput.trim() ? '#fff' : 'var(--color-fg-muted)',
                fontSize: 13, fontWeight: 600, cursor: sessionInput.trim() ? 'pointer' : 'not-allowed',
              }}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Tool list view
  return (
    <div className="page-wrapper" style={{ padding: '28px 32px', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Plugin header */}
      <div style={{ marginBottom: 20, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: `${currentPlugin.color}12`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <i className={`bx ${currentPlugin.icon}`} style={{ fontSize: 20, color: currentPlugin.color }} />
            </div>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, letterSpacing: '-0.02em' }}>{currentPlugin.label}</h1>
              <div style={{ fontSize: 13, color: 'var(--color-fg-muted)', marginTop: 2 }}>{currentPlugin.description}</div>
            </div>
          </div>
          <button
            onClick={startSession}
            disabled={sessionCreating}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 9,
              border: 'none', background: 'linear-gradient(135deg, #00e5ff, #a900ff)', color: '#fff',
              fontSize: 12, fontWeight: 600, cursor: 'pointer',
              opacity: sessionCreating ? 0.7 : 1,
            }}
          >
            <i className={`bx ${sessionCreating ? 'bx-loader-alt bx-spin' : 'bx-play'}`} style={{ fontSize: 14 }} />
            {sessionCreating ? 'Starting...' : 'Start Session'}
          </button>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', marginTop: 16 }}>
          <i className="bx bx-search" style={{ position: 'absolute', insetInlineStart: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 13, color: 'var(--color-fg-muted)', pointerEvents: 'none' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search tools..."
            style={{
              width: '100%', padding: '8px 10px 8px 30px', borderRadius: 8,
              border: '1px solid var(--color-border)', background: 'var(--color-bg-secondary)',
              fontSize: 12, outline: 'none', boxSizing: 'border-box',
            }}
          />
        </div>
      </div>

      {/* Tool list */}
      <div style={{ flex: 1, overflowY: 'auto', borderRadius: 10, border: '1px solid var(--color-border)' }}>
        {toolsLoading ? (
          <div style={{ padding: '40px 20px', textAlign: 'center' }}>
            <i className="bx bx-loader-alt bx-spin" style={{ fontSize: 24, color: '#00e5ff' }} />
          </div>
        ) : filteredTools.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', fontSize: 12, color: 'var(--color-fg-muted)' }}>
            {search ? 'No matching tools' : 'No tools in this plugin'}
          </div>
        ) : (
          filteredTools.map((tool, idx) => {
            const props = extractSchemaProperties(tool.inputSchema)
            return (
              <div
                key={tool.name}
                style={{
                  padding: '14px 20px',
                  borderBottom: idx < filteredTools.length - 1 ? '1px solid var(--color-border)' : undefined,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, fontFamily: 'monospace' }}>{tool.name}</span>
                    </div>
                    {tool.description && (
                      <div style={{ fontSize: 12, color: 'var(--color-fg-muted)', lineHeight: 1.5, marginBottom: props.length > 0 ? 10 : 0 }}>
                        {tool.description}
                      </div>
                    )}
                    {props.length > 0 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {props.map(p => (
                          <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11 }}>
                            <code style={{
                              padding: '1px 5px', borderRadius: 3,
                              background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)',
                              fontFamily: 'monospace', fontSize: 11,
                            }}>
                              {p.name}
                            </code>
                            <span style={{ color: 'var(--color-fg-muted)' }}>{p.type}</span>
                            {p.required && <span style={{ color: '#ef4444', fontSize: 10, fontWeight: 500 }}>required</span>}
                            {!p.required && <span style={{ color: 'var(--color-fg-muted)', fontSize: 10 }}>optional</span>}
                            {p.enumValues && (
                              <span style={{ color: 'var(--color-fg-muted)', fontSize: 10 }}>[{p.enumValues.join(', ')}]</span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => openTryTool(tool)}
                    style={{
                      padding: '5px 12px', borderRadius: 7, border: '1px solid var(--color-border)',
                      background: 'transparent', color: currentPlugin.color,
                      fontSize: 11, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
                    }}
                  >
                    Try Tool
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Try Tool Modal */}
      {tryTool && (
        <div
          onClick={e => { if (e.target === e.currentTarget) setTryTool(null) }}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
        >
          <div className="modal-content" style={{
            width: '100%', maxWidth: 560, maxHeight: '85vh', overflow: 'auto',
            background: 'var(--color-bg-primary)', border: '1px solid var(--color-border)',
            borderRadius: 16, padding: '28px 28px 24px', boxShadow: '0 24px 60px rgba(0,0,0,0.4)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <h2 style={{ fontSize: 17, fontWeight: 700, margin: 0, fontFamily: 'monospace' }}>{tryTool.name}</h2>
                {tryTool.description && (
                  <p style={{ fontSize: 12, color: 'var(--color-fg-muted)', margin: '4px 0 0', lineHeight: 1.4 }}>{tryTool.description}</p>
                )}
              </div>
              <button onClick={() => setTryTool(null)} style={{ background: 'none', border: 'none', color: 'var(--color-fg-muted)', cursor: 'pointer', fontSize: 20, display: 'flex', flexShrink: 0 }}>
                <i className="bx bx-x" />
              </button>
            </div>

            {(() => {
              const props = extractSchemaProperties(tryTool.inputSchema)
              if (props.length === 0) {
                return <div style={{ padding: '12px 0', fontSize: 12, color: 'var(--color-fg-muted)' }}>This tool takes no arguments.</div>
              }
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 16 }}>
                  {props.map(p => (
                    <div key={p.name}>
                      <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-fg-muted)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <code style={{ fontFamily: 'monospace', fontWeight: 600 }}>{p.name}</code>
                        <span style={{ fontSize: 10, color: 'var(--color-fg-muted)' }}>{p.type}</span>
                        {p.required && <span style={{ color: '#ef4444', fontSize: 10, fontWeight: 500 }}>required</span>}
                      </label>
                      {p.description && (
                        <div style={{ fontSize: 11, color: 'var(--color-fg-muted)', marginBottom: 5, lineHeight: 1.4 }}>{p.description}</div>
                      )}
                      {p.enumValues ? (
                        <select
                          value={tryArgs[p.name] ?? ''}
                          onChange={e => setTryArgs(prev => ({ ...prev, [p.name]: e.target.value }))}
                          style={{
                            width: '100%', padding: '9px 12px', borderRadius: 9,
                            border: '1px solid var(--color-border)', background: 'var(--color-bg-secondary)',
                            fontSize: 13, outline: 'none', cursor: 'pointer',
                          }}
                        >
                          <option value="">-- select --</option>
                          {p.enumValues.map(v => <option key={v} value={v}>{v}</option>)}
                        </select>
                      ) : (
                        <input
                          value={tryArgs[p.name] ?? ''}
                          onChange={e => setTryArgs(prev => ({ ...prev, [p.name]: e.target.value }))}
                          placeholder={p.type === 'boolean' ? 'true / false' : p.type === 'number' ? '0' : `Enter ${p.name}...`}
                          style={{
                            width: '100%', padding: '9px 12px', borderRadius: 9,
                            border: '1px solid var(--color-border)', background: 'var(--color-bg-secondary)',
                            fontSize: 13, outline: 'none', boxSizing: 'border-box',
                          }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              )
            })()}

            <div style={{ display: 'flex', gap: 10, marginBottom: tryResult || tryError ? 16 : 0 }}>
              <button
                onClick={executeTool}
                disabled={tryRunning}
                style={{
                  flex: 1, padding: '10px', borderRadius: 9, border: 'none',
                  background: 'linear-gradient(135deg, #00e5ff, #a900ff)', color: '#fff',
                  fontSize: 13, fontWeight: 600, cursor: tryRunning ? 'not-allowed' : 'pointer',
                  opacity: tryRunning ? 0.7 : 1,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                }}
              >
                {tryRunning && <i className="bx bx-loader-alt bx-spin" style={{ fontSize: 14 }} />}
                {tryRunning ? 'Running...' : 'Execute'}
              </button>
              <button
                onClick={() => setTryTool(null)}
                style={{ padding: '10px 18px', borderRadius: 9, border: '1px solid var(--color-border)', background: 'transparent', color: 'var(--color-fg-muted)', fontSize: 13, cursor: 'pointer' }}
              >
                Close
              </button>
            </div>

            {tryError && (
              <div style={{ padding: '10px 12px', borderRadius: 8, background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', fontSize: 12, lineHeight: 1.5, marginBottom: 8 }}>
                {tryError}
              </div>
            )}

            {tryResult && (
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-fg-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>Result</div>
                <pre style={{
                  padding: '12px 14px', borderRadius: 9, background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)',
                  fontSize: 11.5, lineHeight: 1.55, fontFamily: 'monospace',
                  whiteSpace: 'pre-wrap', wordBreak: 'break-word', maxHeight: 280, overflow: 'auto', margin: 0,
                }}>
                  {tryResult}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
