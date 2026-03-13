'use client'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
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
}

interface GitHubRepo {
  owner: string
  name: string
  full_name: string
  description: string
  language: string
  stars: number
  is_private: boolean
  default_branch: string
  topics: string[]
  added: boolean
}

export default function ReposPage() {
  const [repos, setRepos] = useState<RepoWorkspace[]>([])
  const [githubRepos, setGithubRepos] = useState<GitHubRepo[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [addingRepo, setAddingRepo] = useState<string | null>(null)
  const [ghLoading, setGhLoading] = useState(false)
  const [ghSearch, setGhSearch] = useState('')
  const [chatOpen, setChatOpen] = useState<string | null>(null)
  const [prompt, setPrompt] = useState('')
  const [chatResponse, setChatResponse] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [syncingId, setSyncingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [githubConnected, setGithubConnected] = useState<boolean | null>(null)

  const fetchRepos = useCallback(async () => {
    try {
      const accounts = await apiFetch<Array<{ provider: string }>>('/api/settings/connected-accounts')
      const hasGithub = accounts.some(a => a.provider === 'github')
      setGithubConnected(hasGithub)
      if (!hasGithub) { setLoading(false); return }
      const data = await apiFetch<RepoWorkspace[]>('/api/repos')
      setRepos(data)
    } catch (e) {
      console.error('[repos] fetch error:', e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRepos()
    const interval = setInterval(fetchRepos, 10000)
    return () => clearInterval(interval)
  }, [fetchRepos])

  async function openAddModal() {
    setShowAdd(true)
    setGhLoading(true)
    try {
      const data = await apiFetch<GitHubRepo[]>('/api/repos/github')
      setGithubRepos(data)
    } catch (e) {
      console.error('[repos] github list error:', e)
    } finally {
      setGhLoading(false)
    }
  }

  async function addRepo(gh: GitHubRepo) {
    setAddingRepo(gh.full_name)
    try {
      await apiFetch('/api/repos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repo_owner: gh.owner,
          repo_name: gh.name,
          branch: gh.default_branch,
          description: gh.description,
          language: gh.language,
          stars: gh.stars,
          is_private: gh.is_private,
        }),
      })
      setShowAdd(false)
      await fetchRepos()
    } catch (e) {
      console.error('[repos] add error:', e)
    } finally {
      setAddingRepo(null)
    }
  }

  async function handleSync(id: string) {
    setSyncingId(id)
    try {
      await apiFetch(`/api/repos/${id}/sync`, { method: 'POST' })
      await fetchRepos()
    } catch (e) {
      console.error('[repos] sync error:', e)
    } finally {
      setSyncingId(null)
    }
  }

  async function handleChat(id: string) {
    if (!prompt.trim()) return
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

  async function handleDelete(id: string) {
    if (!confirm('Delete this repository workspace?')) return
    setDeletingId(id)
    try {
      await apiFetch(`/api/repos/${id}`, { method: 'DELETE' })
      await fetchRepos()
    } catch (e) {
      console.error('[repos] delete error:', e)
    } finally {
      setDeletingId(null)
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
  }

  const statusColors: Record<string, { bg: string; color: string }> = {
    pending: { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b' },
    cloning: { bg: 'rgba(0,229,255,0.12)', color: '#00e5ff' },
    ready: { bg: 'rgba(34,197,94,0.12)', color: '#22c55e' },
    error: { bg: 'rgba(239,68,68,0.12)', color: '#ef4444' },
    syncing: { bg: 'rgba(169,0,255,0.12)', color: '#a900ff' },
  }

  const langColors: Record<string, string> = {
    TypeScript: '#3178c6', JavaScript: '#f1e05a', Go: '#00add8', Rust: '#dea584',
    Python: '#3572a5', Ruby: '#701516', Java: '#b07219', Swift: '#f05138',
    'C#': '#178600', Kotlin: '#a97bff', PHP: '#4f5d95', Shell: '#89e051',
  }

  const filteredGh = githubRepos.filter(r =>
    r.full_name.toLowerCase().includes(ghSearch.toLowerCase()) ||
    (r.description || '').toLowerCase().includes(ghSearch.toLowerCase())
  )

  if (githubConnected === false) {
    return (
      <div className="page-wrapper" style={{ padding: '28px 32px' }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: textPrimary, margin: '0 0 24px', letterSpacing: '-0.02em' }}>Repositories</h1>
        <div style={{ ...card, padding: '60px 40px', textAlign: 'center' }}>
          <div style={{
            width: 64, height: 64, borderRadius: 16, margin: '0 auto 18px',
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <i className="bx bxl-github" style={{ fontSize: 32, color: textMuted }} />
          </div>
          <div style={{ fontSize: 16, fontWeight: 600, color: textPrimary, marginBottom: 8 }}>Connect your GitHub account</div>
          <div style={{ fontSize: 13, color: textMuted, maxWidth: 360, margin: '0 auto 20px', lineHeight: 1.6 }}>
            Link your GitHub account to add repositories, sync code, and chat with AI about your codebase.
          </div>
          <Link
            href="/settings?tab=social"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '10px 22px', borderRadius: 9, fontSize: 13, fontWeight: 600,
              background: 'linear-gradient(135deg, #00e5ff, #a900ff)',
              color: '#fff', textDecoration: 'none',
            }}
          >
            <i className="bx bxl-github" style={{ fontSize: 16 }} />
            Connect GitHub
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="page-wrapper" style={{ padding: '28px 32px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: textPrimary, margin: 0, letterSpacing: '-0.02em' }}>Repositories</h1>
          <p style={{ fontSize: 13, color: textMuted, marginTop: 5 }}>
            {loading ? 'Loading...' : `${repos.length} workspace${repos.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <button
          onClick={openAddModal}
          style={{ padding: '9px 18px', borderRadius: 9, border: 'none', background: 'linear-gradient(135deg, #00e5ff, #a900ff)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <i className="bx bx-plus" style={{ fontSize: 15 }} />
          Add Repository
        </button>
      </div>

      {/* Repo grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ ...card, padding: 20, height: 140 }}>
              <div style={{ height: 14, borderRadius: 6, background: 'var(--color-bg-active)', width: '60%', marginBottom: 10 }} />
              <div style={{ height: 10, borderRadius: 5, background: 'var(--color-bg-alt)', width: '85%', marginBottom: 6 }} />
              <div style={{ height: 10, borderRadius: 5, background: 'var(--color-bg-alt)', width: '50%' }} />
            </div>
          ))}
        </div>
      ) : repos.length === 0 ? (
        <div style={{ ...card, padding: '60px 40px', textAlign: 'center' }}>
          <i className="bx bx-git-repo-forked" style={{ fontSize: 40, color: textMuted, display: 'block', marginBottom: 14 }} />
          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-fg-muted)', marginBottom: 6 }}>No repositories yet</div>
          <div style={{ fontSize: 13, color: textMuted }}>Add a GitHub repository to get started with AI-powered workspace management.</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
          {repos.map(r => {
            const sc = statusColors[r.status] || statusColors.pending
            return (
              <div key={r.id} style={{ ...card, padding: '20px 22px' }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, flex: 1 }}>
                    <div style={{ width: 34, height: 34, borderRadius: 9, background: 'rgba(0,229,255,0.08)', border: '1px solid rgba(0,229,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <i className={`bx ${r.is_private ? 'bx-lock-alt' : 'bx-git-repo-forked'}`} style={{ fontSize: 17, color: '#00e5ff' }} />
                    </div>
                    <div style={{ overflow: 'hidden' }}>
                      <a href={r.repo_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 14, fontWeight: 600, color: textPrimary, textDecoration: 'none', letterSpacing: '-0.01em', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {r.name}
                      </a>
                    </div>
                  </div>
                  <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 100, background: sc.bg, color: sc.color, fontWeight: 600, flexShrink: 0, textTransform: 'capitalize' }}>
                    {r.status}
                  </span>
                </div>

                {/* Description */}
                {r.description && (
                  <div style={{ fontSize: 12, color: textMuted, lineHeight: 1.5, marginBottom: 10, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const }}>
                    {r.description}
                  </div>
                )}

                {/* Meta */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 11, color: textMuted, marginBottom: 10 }}>
                  {r.language && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: langColors[r.language] || '#888' }} />
                      {r.language}
                    </span>
                  )}
                  {r.stars > 0 && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                      <i className="bx bxs-star" style={{ fontSize: 11, color: '#f59e0b' }} />
                      {r.stars}
                    </span>
                  )}
                  <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <i className="bx bx-git-branch" style={{ fontSize: 12 }} />
                    {r.branch}
                  </span>
                </div>

                {/* Error */}
                {r.error && (
                  <div style={{ fontSize: 11, color: '#ef4444', background: 'rgba(239,68,68,0.08)', padding: '6px 10px', borderRadius: 8, marginBottom: 10 }}>
                    {r.error}
                  </div>
                )}

                {/* SHA + sync info */}
                {r.commit_sha && (
                  <div style={{ fontSize: 10, color: textMuted, fontFamily: 'monospace', marginBottom: 10 }}>
                    {r.commit_sha.slice(0, 7)}
                    {r.last_synced_at && (
                      <span style={{ marginLeft: 8 }}>synced {new Date(r.last_synced_at).toLocaleDateString()}</span>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div style={{ display: 'flex', gap: 6, paddingTop: 12, borderTop: `1px solid ${cardBorder}` }}>
                  <button
                    onClick={() => { setChatOpen(chatOpen === r.id ? null : r.id); setChatResponse(''); setPrompt('') }}
                    disabled={r.status !== 'ready'}
                    style={{ flex: 1, padding: '7px 0', borderRadius: 7, border: `1px solid ${cardBorder}`, background: chatOpen === r.id ? 'rgba(169,0,255,0.12)' : 'transparent', color: chatOpen === r.id ? '#a900ff' : textMuted, fontSize: 11, fontWeight: 500, cursor: 'pointer', opacity: r.status !== 'ready' ? 0.4 : 1 }}
                  >
                    <i className="bx bx-chat" style={{ marginRight: 4 }} />Chat
                  </button>
                  <button
                    onClick={() => handleSync(r.id)}
                    disabled={r.status !== 'ready' || syncingId === r.id}
                    style={{ flex: 1, padding: '7px 0', borderRadius: 7, border: `1px solid ${cardBorder}`, background: 'transparent', color: textMuted, fontSize: 11, fontWeight: 500, cursor: 'pointer', opacity: r.status !== 'ready' || syncingId === r.id ? 0.4 : 1 }}
                  >
                    <i className={`bx ${syncingId === r.id ? 'bx-loader-alt bx-spin' : 'bx-refresh'}`} style={{ marginRight: 4 }} />Sync
                  </button>
                  <button
                    onClick={() => handleDelete(r.id)}
                    disabled={deletingId === r.id}
                    style={{ padding: '7px 10px', borderRadius: 7, border: `1px solid ${cardBorder}`, background: 'transparent', color: '#ef4444', fontSize: 11, cursor: 'pointer', opacity: deletingId === r.id ? 0.4 : 1 }}
                  >
                    <i className={`bx ${deletingId === r.id ? 'bx-loader-alt bx-spin' : 'bx-trash'}`} />
                  </button>
                </div>

                {/* Chat panel */}
                {chatOpen === r.id && (
                  <div style={{ marginTop: 12, padding: '12px', background: 'var(--color-bg)', borderRadius: 10, border: `1px solid ${cardBorder}` }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <input
                        value={prompt}
                        onChange={e => setPrompt(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleChat(r.id)}
                        placeholder="Ask Claude about this repo..."
                        style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: `1px solid ${cardBorder}`, background: cardBg, color: textPrimary, fontSize: 12, outline: 'none' }}
                      />
                      <button
                        onClick={() => handleChat(r.id)}
                        disabled={chatLoading || !prompt.trim()}
                        style={{ padding: '8px 14px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, #00e5ff, #a900ff)', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', opacity: chatLoading || !prompt.trim() ? 0.5 : 1 }}
                      >
                        {chatLoading ? <i className="bx bx-loader-alt bx-spin" /> : <i className="bx bx-send" />}
                      </button>
                    </div>
                    {chatResponse && (
                      <div style={{ marginTop: 10, fontSize: 12, color: textPrimary, lineHeight: 1.6, whiteSpace: 'pre-wrap', maxHeight: 300, overflowY: 'auto', padding: '10px 12px', background: cardBg, borderRadius: 8, border: `1px solid ${cardBorder}` }}>
                        {chatResponse}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Add Modal */}
      {showAdd && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div onClick={() => setShowAdd(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} />
          <div style={{ position: 'relative', width: '90%', maxWidth: 560, maxHeight: '80vh', display: 'flex', flexDirection: 'column', background: 'var(--color-bg)', borderRadius: 16, border: `1px solid ${cardBorder}`, boxShadow: '0 25px 60px rgba(0,0,0,0.4)' }}>
            <div style={{ padding: '20px 24px', borderBottom: `1px solid ${cardBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: textPrimary, margin: 0 }}>Add Repository</h2>
              <button onClick={() => setShowAdd(false)} style={{ background: 'none', border: 'none', color: textMuted, fontSize: 18, cursor: 'pointer', padding: 4 }}>
                <i className="bx bx-x" />
              </button>
            </div>

            <div style={{ padding: '12px 24px 0' }}>
              <input
                value={ghSearch}
                onChange={e => setGhSearch(e.target.value)}
                placeholder="Search your repositories..."
                style={{ width: '100%', padding: '9px 12px', borderRadius: 9, border: `1px solid ${cardBorder}`, background: cardBg, color: textPrimary, fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '12px 24px 20px' }}>
              {ghLoading ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: textMuted }}>
                  <i className="bx bx-loader-alt bx-spin" style={{ fontSize: 24, display: 'block', marginBottom: 10 }} />
                  Loading your GitHub repos...
                </div>
              ) : filteredGh.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: textMuted, fontSize: 13 }}>
                  {ghSearch ? 'No matching repos found' : 'No GitHub repos found. Connect your GitHub account first.'}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {filteredGh.map(gh => (
                    <div key={gh.full_name} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 10, border: `1px solid ${cardBorder}`, background: gh.added ? 'rgba(34,197,94,0.05)' : cardBg }}>
                      <i className={`bx ${gh.is_private ? 'bx-lock-alt' : 'bx-git-repo-forked'}`} style={{ fontSize: 18, color: textMuted, flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: textPrimary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{gh.full_name}</div>
                        {gh.description && (
                          <div style={{ fontSize: 11, color: textMuted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: 2 }}>{gh.description}</div>
                        )}
                        <div style={{ display: 'flex', gap: 10, marginTop: 4, fontSize: 10, color: textMuted }}>
                          {gh.language && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                              <span style={{ width: 7, height: 7, borderRadius: '50%', background: langColors[gh.language] || '#888' }} />
                              {gh.language}
                            </span>
                          )}
                          {gh.stars > 0 && <span><i className="bx bxs-star" style={{ fontSize: 10, color: '#f59e0b' }} /> {gh.stars}</span>}
                        </div>
                      </div>
                      {gh.added ? (
                        <span style={{ fontSize: 11, color: '#22c55e', fontWeight: 500, flexShrink: 0 }}>Added</span>
                      ) : (
                        <button
                          onClick={() => addRepo(gh)}
                          disabled={addingRepo === gh.full_name}
                          style={{ padding: '6px 14px', borderRadius: 7, border: 'none', background: 'linear-gradient(135deg, #00e5ff, #a900ff)', color: '#fff', fontSize: 11, fontWeight: 600, cursor: 'pointer', flexShrink: 0, opacity: addingRepo === gh.full_name ? 0.5 : 1 }}
                        >
                          {addingRepo === gh.full_name ? <i className="bx bx-loader-alt bx-spin" /> : 'Add'}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
