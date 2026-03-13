'use client'
import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { apiFetch } from '@/lib/api'

interface RepoWorkspace {
  id: string
  name: string
  repo_url: string
  repo_owner: string
  repo_name: string
  branch: string
  status: string
  last_synced_at: string | null
  commit_sha: string
  error: string
  description: string
  language: string
  stars: number
  topics: string[] | null
  is_private: boolean
  created_at: string
  updated_at: string
}

const statusColors: Record<string, { bg: string; color: string; label: string }> = {
  pending: { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b', label: 'Pending' },
  cloning: { bg: 'rgba(0,229,255,0.12)', color: '#00e5ff', label: 'Cloning' },
  ready: { bg: 'rgba(34,197,94,0.12)', color: '#22c55e', label: 'Ready' },
  error: { bg: 'rgba(239,68,68,0.12)', color: '#ef4444', label: 'Error' },
  syncing: { bg: 'rgba(169,0,255,0.12)', color: '#a900ff', label: 'Syncing' },
}

const langColors: Record<string, string> = {
  TypeScript: '#3178c6', JavaScript: '#f1e05a', Go: '#00add8', Rust: '#dea584',
  Python: '#3572a5', Ruby: '#701516', Java: '#b07219', Swift: '#f05138',
  'C#': '#178600', Kotlin: '#a97bff', PHP: '#4f5d95', Shell: '#89e051',
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString()
}

export default function RepoDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [repo, setRepo] = useState<RepoWorkspace | null>(null)
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [prompt, setPrompt] = useState('')
  const [chatResponse, setChatResponse] = useState('')
  const [chatLoading, setChatLoading] = useState(false)

  const fetchRepo = useCallback(async () => {
    try {
      const data = await apiFetch<RepoWorkspace>(`/api/repos/${id}`)
      setRepo(data)
    } catch (e) {
      console.error('[repo] fetch error:', e)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchRepo()
    const interval = setInterval(fetchRepo, 15000)
    return () => clearInterval(interval)
  }, [fetchRepo])

  async function handleSync() {
    if (!repo) return
    setSyncing(true)
    try {
      await apiFetch(`/api/repos/${id}/sync`, { method: 'POST' })
      await fetchRepo()
    } catch (e) {
      console.error('[repo] sync error:', e)
    } finally {
      setSyncing(false)
    }
  }

  async function handleChat() {
    if (!prompt.trim() || !repo) return
    setChatLoading(true)
    setChatResponse('')
    try {
      const data = await apiFetch<{ response: string }>(`/api/repos/${id}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      })
      setChatResponse(data.response)
    } catch (e: any) {
      setChatResponse(`Error: ${e.message || e}`)
    } finally {
      setChatLoading(false)
    }
  }

  async function handleDelete() {
    if (!confirm('Delete this repository workspace? This cannot be undone.')) return
    setDeleting(true)
    try {
      await apiFetch(`/api/repos/${id}`, { method: 'DELETE' })
      router.push('/repos')
    } catch (e) {
      console.error('[repo] delete error:', e)
      setDeleting(false)
    }
  }

  const textPrimary = 'var(--color-fg)'
  const textMuted = 'var(--color-fg-dim)'
  const cardBg = 'var(--color-bg-alt)'
  const cardBorder = 'var(--color-border)'

  const card: React.CSSProperties = {
    background: cardBg,
    border: `1px solid ${cardBorder}`,
    borderRadius: 14,
    padding: '20px 24px',
  }

  if (loading) {
    return (
      <div className="page-wrapper" style={{ padding: '28px 32px' }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 24 }}>
          <div style={{ width: 180, height: 20, borderRadius: 6, background: 'var(--color-bg-active)' }} />
        </div>
        <div style={{ ...card, height: 200 }} />
      </div>
    )
  }

  if (!repo) {
    return (
      <div className="page-wrapper" style={{ padding: '28px 32px' }}>
        <div style={{ ...card, padding: '60px 40px', textAlign: 'center' }}>
          <i className="bx bx-error-circle" style={{ fontSize: 40, color: '#ef4444', display: 'block', marginBottom: 14 }} />
          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-fg-muted)', marginBottom: 6 }}>Repository not found</div>
          <button onClick={() => router.push('/repos')} style={{ marginTop: 12, padding: '8px 18px', borderRadius: 8, border: `1px solid ${cardBorder}`, background: cardBg, color: textPrimary, fontSize: 13, cursor: 'pointer' }}>
            Back to Repositories
          </button>
        </div>
      </div>
    )
  }

  const sc = statusColors[repo.status] || statusColors.pending

  return (
    <div className="page-wrapper" style={{ padding: '28px 32px', maxWidth: 900 }}>
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: textMuted, marginBottom: 20 }}>
        <button onClick={() => router.push('/repos')} style={{ background: 'none', border: 'none', color: textMuted, cursor: 'pointer', padding: 0, fontSize: 12 }}>
          Repositories
        </button>
        <i className="bx bx-chevron-right" style={{ fontSize: 14 }} />
        <span style={{ color: textPrimary, fontWeight: 500 }}>{repo.name}</span>
      </div>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: 'rgba(0,229,255,0.08)', border: '1px solid rgba(0,229,255,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <i className={`bx ${repo.is_private ? 'bx-lock-alt' : 'bx-git-repo-forked'}`} style={{ fontSize: 22, color: '#00e5ff' }} />
          </div>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: textPrimary, margin: 0, letterSpacing: '-0.02em' }}>{repo.name}</h1>
            {repo.description && (
              <p style={{ fontSize: 13, color: textMuted, margin: '4px 0 0' }}>{repo.description}</p>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <a href={repo.repo_url} target="_blank" rel="noopener noreferrer" style={{ padding: '8px 14px', borderRadius: 8, border: `1px solid ${cardBorder}`, background: cardBg, color: textPrimary, fontSize: 12, fontWeight: 500, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 5 }}>
            <i className="bx bxl-github" style={{ fontSize: 14 }} /> GitHub
          </a>
          <button onClick={handleSync} disabled={repo.status !== 'ready' || syncing} style={{ padding: '8px 14px', borderRadius: 8, border: `1px solid ${cardBorder}`, background: cardBg, color: textPrimary, fontSize: 12, fontWeight: 500, cursor: 'pointer', opacity: repo.status !== 'ready' || syncing ? 0.4 : 1, display: 'flex', alignItems: 'center', gap: 5 }}>
            <i className={`bx ${syncing ? 'bx-loader-alt bx-spin' : 'bx-refresh'}`} style={{ fontSize: 14 }} /> Sync
          </button>
          <button onClick={handleDelete} disabled={deleting} style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.08)', color: '#ef4444', fontSize: 12, fontWeight: 500, cursor: 'pointer', opacity: deleting ? 0.4 : 1, display: 'flex', alignItems: 'center', gap: 5 }}>
            <i className={`bx ${deleting ? 'bx-loader-alt bx-spin' : 'bx-trash'}`} style={{ fontSize: 14 }} /> Delete
          </button>
        </div>
      </div>

      {/* Info cards row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        {/* Status */}
        <div style={{ ...card, padding: '16px 18px' }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: textMuted, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 8 }}>Status</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: sc.color }} />
            <span style={{ fontSize: 14, fontWeight: 600, color: sc.color }}>{sc.label}</span>
          </div>
        </div>
        {/* Branch */}
        <div style={{ ...card, padding: '16px 18px' }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: textMuted, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 8 }}>Branch</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 500, color: textPrimary }}>
            <i className="bx bx-git-branch" style={{ fontSize: 15, color: textMuted }} />
            {repo.branch}
          </div>
        </div>
        {/* Language */}
        <div style={{ ...card, padding: '16px 18px' }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: textMuted, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 8 }}>Language</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {repo.language && <span style={{ width: 10, height: 10, borderRadius: '50%', background: langColors[repo.language] || '#888' }} />}
            <span style={{ fontSize: 14, fontWeight: 500, color: textPrimary }}>{repo.language || 'Unknown'}</span>
          </div>
        </div>
        {/* Stars */}
        <div style={{ ...card, padding: '16px 18px' }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: textMuted, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 8 }}>Stars</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 500, color: textPrimary }}>
            <i className="bx bxs-star" style={{ fontSize: 14, color: '#f59e0b' }} />
            {repo.stars}
          </div>
        </div>
      </div>

      {/* Error */}
      {repo.error && (
        <div style={{ marginBottom: 20, padding: '14px 18px', borderRadius: 10, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', fontSize: 13 }}>
          <div style={{ fontWeight: 600, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
            <i className="bx bx-error-circle" /> Error
          </div>
          {repo.error}
        </div>
      )}

      {/* Activity / Recent info */}
      <div style={{ ...card, marginBottom: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: textPrimary, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <i className="bx bx-history" style={{ fontSize: 16, color: textMuted }} />
          Activity
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Latest commit */}
          {repo.commit_sha && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                background: 'rgba(169,0,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <i className="bx bx-git-commit" style={{ fontSize: 16, color: '#a900ff' }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: textPrimary }}>Latest commit</div>
                <div style={{ fontSize: 12, color: textMuted, fontFamily: 'monospace', marginTop: 2 }}>
                  <a href={`${repo.repo_url}/commit/${repo.commit_sha}`} target="_blank" rel="noopener noreferrer" style={{ color: '#00e5ff', textDecoration: 'none' }}>
                    {repo.commit_sha.slice(0, 7)}
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Last sync */}
          {repo.last_synced_at && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                background: 'rgba(0,229,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <i className="bx bx-refresh" style={{ fontSize: 16, color: '#00e5ff' }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: textPrimary }}>Last synced</div>
                <div style={{ fontSize: 12, color: textMuted, marginTop: 2 }}>
                  {timeAgo(repo.last_synced_at)}
                  <span style={{ marginLeft: 8, opacity: 0.6 }}>{new Date(repo.last_synced_at).toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}

          {/* Created */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8, flexShrink: 0,
              background: 'rgba(34,197,94,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <i className="bx bx-plus-circle" style={{ fontSize: 16, color: '#22c55e' }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: textPrimary }}>Added to workspace</div>
              <div style={{ fontSize: 12, color: textMuted, marginTop: 2 }}>
                {timeAgo(repo.created_at)}
                <span style={{ marginLeft: 8, opacity: 0.6 }}>{new Date(repo.created_at).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* No activity yet */}
          {!repo.commit_sha && !repo.last_synced_at && (
            <div style={{ padding: '12px 0', fontSize: 12, color: textMuted, textAlign: 'center' }}>
              No sync activity yet. Click Sync to pull latest changes.
            </div>
          )}
        </div>
      </div>

      {/* Topics */}
      {repo.topics && repo.topics.length > 0 && (
        <div style={{ ...card, marginBottom: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: textPrimary, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <i className="bx bx-purchase-tag" style={{ fontSize: 16, color: textMuted }} />
            Topics
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {repo.topics.map(topic => (
              <span key={topic} style={{ fontSize: 11, padding: '3px 10px', borderRadius: 100, background: 'rgba(0,229,255,0.08)', border: '1px solid rgba(0,229,255,0.15)', color: '#00e5ff', fontWeight: 500 }}>
                {topic}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* AI Chat */}
      <div style={{ ...card }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: textPrimary, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
          <i className="bx bx-bot" style={{ fontSize: 16, color: '#a900ff' }} />
          AI Chat
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleChat()}
            placeholder="Ask Claude about this repository..."
            disabled={repo.status !== 'ready'}
            style={{
              flex: 1, padding: '10px 14px', borderRadius: 9, fontSize: 13,
              border: `1px solid ${cardBorder}`, background: cardBg, color: textPrimary,
              outline: 'none', opacity: repo.status !== 'ready' ? 0.4 : 1,
            }}
          />
          <button
            onClick={handleChat}
            disabled={chatLoading || !prompt.trim() || repo.status !== 'ready'}
            style={{
              padding: '10px 18px', borderRadius: 9, border: 'none',
              background: 'linear-gradient(135deg, #00e5ff, #a900ff)',
              color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer',
              opacity: chatLoading || !prompt.trim() || repo.status !== 'ready' ? 0.4 : 1,
            }}
          >
            {chatLoading ? <i className="bx bx-loader-alt bx-spin" /> : <i className="bx bx-send" />}
          </button>
        </div>
        {repo.status !== 'ready' && (
          <div style={{ fontSize: 11, color: textMuted, marginTop: 8 }}>
            AI chat is available once the repository is cloned and ready.
          </div>
        )}
        {chatResponse && (
          <div style={{
            marginTop: 12, fontSize: 13, color: textPrimary, lineHeight: 1.7,
            whiteSpace: 'pre-wrap', maxHeight: 400, overflowY: 'auto',
            padding: '14px 16px', background: cardBg, borderRadius: 10,
            border: `1px solid ${cardBorder}`,
          }}>
            {chatResponse}
          </div>
        )}
      </div>
    </div>
  )
}
