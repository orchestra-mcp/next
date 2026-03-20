'use client'
import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/auth'
import { apiFetch } from '@/lib/api'
import ProfileCard from '@/components/profile/profile-card'

const MCP_URL = 'https://orchestra-mcp.dev/mcp'

interface McpPermission {
  key: string
  label: string
  description: string
  enabled: boolean
}

const DEFAULT_PERMISSIONS: McpPermission[] = [
  { key: 'mcp.status', label: 'Check installation status', description: 'Allow agents to check if Orchestra is installed on your machine.', enabled: true },
  { key: 'mcp.install', label: 'Install Orchestra', description: 'Allow agents to install Orchestra CLI and IDE integrations via shell scripts.', enabled: true },
  { key: 'mcp.marketplace', label: 'Browse & install packs', description: 'Allow agents to browse and install packs from the marketplace.', enabled: true },
  { key: 'mcp.profile.read', label: 'Read my profile', description: 'Allow agents to read your Orchestra profile (name, timezone, plan).', enabled: true },
  { key: 'mcp.profile.write', label: 'Update my profile', description: 'Allow agents to update your Orchestra profile fields.', enabled: false },
]

const saveBtnSt: React.CSSProperties = {
  padding: '10px 24px', borderRadius: 9, fontSize: 13, fontWeight: 600,
  background: 'linear-gradient(135deg, #00e5ff, #a900ff)', color: '#fff', border: 'none', cursor: 'pointer',
}

export default function McpSettingsPage() {
  const { token } = useAuthStore()
  const [permissions, setPermissions] = useState<McpPermission[]>(DEFAULT_PERMISSIONS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [regenerating, setRegenerating] = useState(false)
  const [mcpToken, setMcpToken] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    async function load() {
      // Load permissions from localStorage first (instant, no flicker)
      const stored = localStorage.getItem('orchestra_mcp_permissions')
      if (stored) {
        try {
          const map = JSON.parse(stored) as Record<string, boolean>
          setPermissions(DEFAULT_PERMISSIONS.map(p => ({ ...p, enabled: map[p.key] ?? p.enabled })))
        } catch {}
      }

      // Then try to sync with backend
      try {
        const [permRes, tokenRes] = await Promise.all([
          apiFetch<{ permissions?: Record<string, boolean> }>('/api/settings/mcp-permissions'),
          apiFetch<{ token?: string }>('/api/settings/mcp-token'),
        ])
        if (permRes.permissions) {
          setPermissions(DEFAULT_PERMISSIONS.map(p => ({ ...p, enabled: permRes.permissions![p.key] ?? p.enabled })))
        }
        if (tokenRes.token) setMcpToken(tokenRes.token)
      } catch {
        // backend not yet available — localStorage values remain
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  function copy(text: string, key: string) {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  async function savePermissions() {
    setSaving(true)
    setMessage(null)
    const map: Record<string, boolean> = {}
    permissions.forEach(p => { map[p.key] = p.enabled })

    // Always save locally first
    localStorage.setItem('orchestra_mcp_permissions', JSON.stringify(map))

    try {
      await apiFetch('/api/settings/mcp-permissions', { method: 'PATCH', body: JSON.stringify({ permissions: map }) })
    } catch {
      // backend not yet available — local save is sufficient
    }

    setMessage({ type: 'success', text: 'Permissions saved.' })
    setSaving(false)
  }

  async function regenerateToken() {
    if (!confirm('Regenerate your MCP token? The old token will stop working immediately.')) return
    setRegenerating(true)
    setMessage(null)
    try {
      const res = await apiFetch('/api/settings/mcp-token/regenerate', { method: 'POST' })
      if (res.token) setMcpToken(res.token)
      setMessage({ type: 'success', text: 'Token regenerated. Update your Claude Desktop config.' })
    } catch (err) {
      setMessage({ type: 'error', text: (err as Error).message || 'Failed to regenerate token.' })
    } finally {
      setRegenerating(false)
    }
  }

  const authToken = mcpToken || token || ''
  const authedUrl = authToken ? `${MCP_URL}?token=${authToken}` : null
  const jsonAnon = `{\n  "mcpServers": {\n    "orchestra-cloud": {\n      "type": "sse",\n      "url": "${MCP_URL}"\n    }\n  }\n}`
  const jsonAuth = authToken
    ? `{\n  "mcpServers": {\n    "orchestra-cloud": {\n      "type": "sse",\n      "url": "${MCP_URL}?token=${authToken}"\n    }\n  }\n}`
    : null

  if (loading) {
    return <ProfileCard variant="default" style={{ padding: 24 }}><p style={{ color: 'var(--color-fg-muted)', fontSize: 13 }}>Loading...</p></ProfileCard>
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {message && (
        <div style={{
          padding: '10px 14px', borderRadius: 9, fontSize: 13,
          background: message.type === 'success' ? 'rgba(0,229,255,0.1)' : 'rgba(239,68,68,0.1)',
          color: message.type === 'success' ? '#00e5ff' : '#ef4444',
          border: `1px solid ${message.type === 'success' ? 'rgba(0,229,255,0.2)' : 'rgba(239,68,68,0.2)'}`,
        }}>
          {message.text}
        </div>
      )}

      {/* Connect Claude Desktop */}
      <ProfileCard variant="default" style={{ padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <i className="bx bx-bot" style={{ fontSize: 20, color: '#00e5ff' }} />
          <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-fg)', margin: 0 }}>Connect Claude Desktop</h3>
        </div>
        <p style={{ fontSize: 13, color: 'var(--color-fg-muted)', marginBottom: 20, lineHeight: 1.6 }}>
          Add Orchestra as a connector in Claude — go to Settings → Connectors and paste the URL below.
        </p>

        {/* Step 1 */}
        <div style={{ display: 'flex', gap: 14, marginBottom: 14, alignItems: 'flex-start' }}>
          <div style={{ flexShrink: 0, width: 26, height: 26, borderRadius: '50%', background: 'rgba(0,229,255,0.15)', border: '1px solid rgba(0,229,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#00e5ff' }}>1</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-fg)', marginBottom: 6 }}>Open Claude → Settings → Connectors</div>
            <a href="https://claude.ai/settings/connectors" target="_blank" rel="noopener" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, textDecoration: 'none', background: 'rgba(0,229,255,0.12)', color: '#00e5ff', border: '1px solid rgba(0,229,255,0.3)' }}>
              <i className="bx bx-link-external" />Open Connectors settings
            </a>
          </div>
        </div>

        {/* Step 2 */}
        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
          <div style={{ flexShrink: 0, width: 26, height: 26, borderRadius: '50%', background: 'rgba(0,229,255,0.15)', border: '1px solid rgba(0,229,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#00e5ff' }}>2</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-fg)', marginBottom: 6 }}>Click "Add custom connector" and paste your URL</div>

            {/* Anonymous URL */}
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-fg-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Without account</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--color-bg)', borderRadius: 8, padding: '9px 12px', border: '1px solid var(--color-border)', marginBottom: 10 }}>
              <code style={{ flex: 1, fontSize: 12, fontFamily: 'monospace', color: 'var(--color-fg)', wordBreak: 'break-all' }}>{MCP_URL}</code>
              <button onClick={() => copy(MCP_URL, 'mcp-url')} style={{ flexShrink: 0, padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600, background: copied === 'mcp-url' ? 'rgba(0,229,255,0.12)' : 'var(--color-bg-alt)', color: copied === 'mcp-url' ? '#00e5ff' : 'var(--color-fg-muted)', border: '1px solid var(--color-border)', cursor: 'pointer' }}>
                {copied === 'mcp-url' ? 'Copied!' : 'Copy'}
              </button>
            </div>

            {/* Authenticated URL */}
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-fg-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>With your account (token in URL)</div>
            {authedUrl ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(0,229,255,0.04)', borderRadius: 8, padding: '9px 12px', border: '1px solid rgba(0,229,255,0.2)' }}>
                <code style={{ flex: 1, fontSize: 12, fontFamily: 'monospace', color: 'var(--color-fg)', wordBreak: 'break-all' }}>{authedUrl}</code>
                <button onClick={() => copy(authedUrl, 'auth-url')} style={{ flexShrink: 0, padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600, background: copied === 'auth-url' ? 'rgba(0,229,255,0.12)' : 'var(--color-bg-alt)', color: copied === 'auth-url' ? '#00e5ff' : 'var(--color-fg-muted)', border: '1px solid rgba(0,229,255,0.2)', cursor: 'pointer' }}>
                  {copied === 'auth-url' ? 'Copied!' : 'Copy'}
                </button>
              </div>
            ) : (
              <div style={{ fontSize: 12, color: 'var(--color-fg-dim)', fontStyle: 'italic', padding: '9px 12px', borderRadius: 8, border: '1px solid var(--color-border)', background: 'var(--color-bg)' }}>
                Log in to generate your personal token URL
              </div>
            )}
          </div>
        </div>
      </ProfileCard>

      {/* MCP Token */}
      <ProfileCard variant="default" style={{ padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-fg)', margin: 0 }}>MCP Token</h3>
            <p style={{ fontSize: 12, color: 'var(--color-fg-muted)', margin: '4px 0 0' }}>Use this token to authenticate Claude Desktop with your Orchestra account.</p>
          </div>
          <button
            onClick={regenerateToken}
            disabled={regenerating}
            style={{ padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)', cursor: 'pointer', opacity: regenerating ? 0.6 : 1 }}
          >
            {regenerating ? 'Regenerating...' : 'Regenerate'}
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', borderRadius: 8, background: 'var(--color-bg-alt)', border: '1px solid var(--color-border)' }}>
          <code style={{ flex: 1, fontSize: 12, color: 'var(--color-fg)', wordBreak: 'break-all', fontFamily: 'monospace' }}>
            {authToken ? `${authToken.slice(0, 12)}${'•'.repeat(24)}` : 'No token yet'}
          </code>
          {authToken && (
            <button
              onClick={() => copy(authToken, 'token')}
              style={{ flexShrink: 0, padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 600, background: copied === 'token' ? 'rgba(0,229,255,0.12)' : 'var(--color-bg)', color: copied === 'token' ? '#00e5ff' : 'var(--color-fg-muted)', border: '1px solid var(--color-border)', cursor: 'pointer' }}
            >
              {copied === 'token' ? 'Copied!' : 'Copy'}
            </button>
          )}
        </div>
      </ProfileCard>

      {/* Manual JSON config */}
      <ProfileCard variant="default" style={{ padding: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-fg)', marginBottom: 6, marginTop: 0 }}>Manual Configuration</h3>
        <p style={{ fontSize: 13, color: 'var(--color-fg-muted)', marginBottom: 16, lineHeight: 1.6 }}>
          Add to your <code style={{ fontFamily: 'monospace', fontSize: 12 }}>claude_desktop_config.json</code> manually:
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Anonymous JSON */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-fg-muted)', marginBottom: 6 }}>Without account</div>
            <div style={{ position: 'relative' }}>
              <pre style={{ margin: 0, padding: '12px 14px', borderRadius: 8, background: 'var(--color-bg-alt)', border: '1px solid var(--color-border)', fontSize: 12, color: 'var(--color-fg)', overflowX: 'auto', fontFamily: 'monospace', lineHeight: 1.6 }}>
                {jsonAnon}
              </pre>
              <button
                onClick={() => copy(jsonAnon, 'json-anon')}
                style={{ position: 'absolute', top: 8, right: 8, padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600, background: copied === 'json-anon' ? 'rgba(0,229,255,0.12)' : 'var(--color-bg)', color: copied === 'json-anon' ? '#00e5ff' : 'var(--color-fg-muted)', border: '1px solid var(--color-border)', cursor: 'pointer' }}
              >
                {copied === 'json-anon' ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>

          {/* Authenticated JSON */}
          {jsonAuth && (
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-fg-muted)', marginBottom: 6 }}>With your account</div>
              <div style={{ position: 'relative' }}>
                <pre style={{ margin: 0, padding: '12px 14px', borderRadius: 8, background: 'var(--color-bg-alt)', border: '1px solid var(--color-border)', fontSize: 12, color: 'var(--color-fg)', overflowX: 'auto', fontFamily: 'monospace', lineHeight: 1.6 }}>
                  {jsonAuth}
                </pre>
                <button
                  onClick={() => copy(jsonAuth, 'json-auth')}
                  style={{ position: 'absolute', top: 8, right: 8, padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600, background: copied === 'json-auth' ? 'rgba(0,229,255,0.12)' : 'var(--color-bg)', color: copied === 'json-auth' ? '#00e5ff' : 'var(--color-fg-muted)', border: '1px solid var(--color-border)', cursor: 'pointer' }}
                >
                  {copied === 'json-auth' ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          )}
        </div>
      </ProfileCard>

      {/* Permission toggles */}
      <ProfileCard variant="default" style={{ padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-fg)', margin: 0 }}>Agent Permissions</h3>
            <p style={{ fontSize: 12, color: 'var(--color-fg-muted)', margin: '4px 0 0' }}>Control what your AI agent is allowed to do via MCP.</p>
          </div>
          <button onClick={savePermissions} disabled={saving} style={{ ...saveBtnSt, opacity: saving ? 0.6 : 1, fontSize: 12, padding: '8px 18px' }}>
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 1, marginTop: 16 }}>
          {permissions.map((perm, i) => (
            <div
              key={perm.key}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '14px 0',
                borderBottom: i < permissions.length - 1 ? '1px solid var(--color-border)' : 'none',
              }}
            >
              <div style={{ flex: 1, paddingRight: 16 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-fg)' }}>{perm.label}</div>
                <div style={{ fontSize: 12, color: 'var(--color-fg-muted)', marginTop: 2 }}>{perm.description}</div>
              </div>
              <button
                onClick={() => setPermissions(prev => prev.map(p => p.key === perm.key ? { ...p, enabled: !p.enabled } : p))}
                style={{
                  flexShrink: 0, width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
                  background: perm.enabled ? '#00e5ff' : 'var(--color-bg-alt)',
                  position: 'relative', transition: 'background 0.15s',
                }}
                aria-label={perm.enabled ? 'Disable' : 'Enable'}
              >
                <span style={{
                  position: 'absolute', top: 3, left: perm.enabled ? 22 : 3,
                  width: 18, height: 18, borderRadius: '50%',
                  background: perm.enabled ? '#0f0f12' : 'var(--color-fg-dim)',
                  transition: 'left 0.15s',
                }} />
              </button>
            </div>
          ))}
        </div>
      </ProfileCard>
    </div>
  )
}
