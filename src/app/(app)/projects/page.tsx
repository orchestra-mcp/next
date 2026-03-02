'use client'
import { useEffect, useState } from 'react'
import { apiFetch, isDevSeed } from '@/lib/api'
import { useThemeStore } from '@/store/theme'
import Link from 'next/link'

interface Project {
  id: string
  slug: string
  name: string
  description?: string
  created_at: string
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const { theme } = useThemeStore()
  const isDark = theme === 'dark'

  // New project modal
  const [showNew, setShowNew] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  useEffect(() => {
    apiFetch<Project[] | { projects: Project[] }>('/api/projects')
      .then(r => { setProjects(Array.isArray(r) ? r : (r.projects ?? [])); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const filtered = projects.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.description ?? '').toLowerCase().includes(search.toLowerCase())
  )

  async function handleCreate() {
    if (!newName.trim()) return
    setCreating(true); setCreateError(null)
    try {
      if (isDevSeed()) {
        // Fake it locally
        const fakeId = crypto.randomUUID()
        const fakeSlug = newName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
        const fake: Project = { id: fakeId, slug: fakeSlug, name: newName.trim(), description: newDesc.trim() || undefined, created_at: new Date().toISOString() }
        setProjects(p => [fake, ...p])
      } else {
        const created = await apiFetch<Project>('/api/projects', {
          method: 'POST',
          body: JSON.stringify({ name: newName.trim(), description: newDesc.trim() }),
        })
        setProjects(p => [created, ...p])
      }
      setShowNew(false); setNewName(''); setNewDesc('')
    } catch (e) {
      setCreateError((e as Error).message)
    } finally {
      setCreating(false)
    }
  }

  const textPrimary = isDark ? '#f8f8f8' : '#0f0f12'
  const textMuted = isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.4)'
  const textDim = isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.3)'
  const cardBg = isDark ? 'rgba(255,255,255,0.025)' : '#ffffff'
  const cardBorder = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)'
  const searchBg = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)'
  const searchBorder = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)'
  const searchColor = isDark ? '#f8f8f8' : '#0f0f12'
  const searchIconColor = isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.35)'
  const idBg = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'
  const idBorder = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'
  const idColor = isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.35)'
  const cardFooterBorder = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)'
  const dateColor = isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.3)'
  const calIconColor = isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.25)'
  const skeletonHi = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'
  const skeletonMid = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'
  const skeletonLo = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)'
  const emptyIconColor = isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)'
  const emptyTitleColor = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)'
  const inputBg = isDark ? 'rgba(255,255,255,0.05)' : '#f7f7f9'
  const inputBorder = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.12)'
  const modalBg = isDark ? '#1a1520' : '#ffffff'
  const modalBorder = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
  const descColor = isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.45)'

  const card: React.CSSProperties = {
    background: cardBg,
    border: `1px solid ${cardBorder}`,
    borderRadius: 14,
  }

  const inputSt: React.CSSProperties = {
    width: '100%', padding: '9px 12px', borderRadius: 9,
    border: `1px solid ${inputBorder}`, background: inputBg,
    color: textPrimary, fontSize: 13, outline: 'none', boxSizing: 'border-box',
  }

  return (
    <div style={{ padding: '28px 32px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: textPrimary, margin: 0, letterSpacing: '-0.02em' }}>Projects</h1>
          <p style={{ fontSize: 13, color: textMuted, marginTop: 5 }}>
            {loading ? 'Loading…' : `${projects.length} project${projects.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <button
          onClick={() => { setShowNew(true); setNewName(''); setNewDesc(''); setCreateError(null) }}
          style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 16px', borderRadius: 9, border: 'none', background: 'linear-gradient(135deg, #00e5ff, #a900ff)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
        >
          <i className="bx bx-plus" style={{ fontSize: 16 }} />
          New Project
        </button>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 24, maxWidth: 380 }}>
        <i className="bx bx-search" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 15, color: searchIconColor, pointerEvents: 'none' }} />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search projects…"
          style={{ width: '100%', padding: '9px 12px 9px 36px', borderRadius: 9, border: `1px solid ${searchBorder}`, background: searchBg, color: searchColor, fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
        />
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
          {[1,2,3,4,5,6].map(i => (
            <div key={i} style={{ ...card, padding: '20px', height: 110 }}>
              <div style={{ height: 14, borderRadius: 6, background: skeletonHi, marginBottom: 10, width: '60%' }} />
              <div style={{ height: 10, borderRadius: 5, background: skeletonMid, width: '85%', marginBottom: 6 }} />
              <div style={{ height: 10, borderRadius: 5, background: skeletonLo, width: '50%' }} />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ ...card, padding: '60px 40px', textAlign: 'center' }}>
          <i className="bx bx-folder" style={{ fontSize: 40, color: emptyIconColor, display: 'block', marginBottom: 14 }} />
          <div style={{ fontSize: 15, fontWeight: 600, color: emptyTitleColor, marginBottom: 6 }}>
            {search ? 'No matching projects' : 'No projects yet'}
          </div>
          <div style={{ fontSize: 13, color: textDim, marginBottom: 20 }}>
            {search ? 'Try a different search term.' : 'Create your first project to get started.'}
          </div>
          {!search && (
            <button
              onClick={() => setShowNew(true)}
              style={{ padding: '9px 20px', borderRadius: 9, border: 'none', background: 'linear-gradient(135deg, #00e5ff, #a900ff)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
            >
              Create Project
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
          {filtered.map((p) => (
            <Link key={p.id} href={`/projects/${p.slug || p.id}`} style={{ ...card, padding: '20px 22px', textDecoration: 'none', display: 'block' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: 9, background: 'rgba(0,229,255,0.08)', border: '1px solid rgba(0,229,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <i className="bx bx-folder" style={{ fontSize: 17, color: '#00e5ff' }} />
                </div>
                <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 100, background: idBg, border: `1px solid ${idBorder}`, color: idColor, fontFamily: 'monospace', letterSpacing: '0.02em' }}>
                  {p.id.slice(0, 8)}
                </span>
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: textPrimary, marginBottom: 5, letterSpacing: '-0.01em' }}>{p.name}</div>
              {p.description && (
                <div style={{ fontSize: 12, color: descColor, lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const }}>
                  {p.description}
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 14, paddingTop: 12, borderTop: `1px solid ${cardFooterBorder}` }}>
                <i className="bx bx-calendar" style={{ fontSize: 12, color: calIconColor }} />
                <span style={{ fontSize: 11, color: dateColor }}>{new Date(p.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* New Project Modal */}
      {showNew && (
        <div
          onClick={e => { if (e.target === e.currentTarget) setShowNew(false) }}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
        >
          <div style={{ width: '100%', maxWidth: 440, background: modalBg, border: `1px solid ${modalBorder}`, borderRadius: 16, padding: '28px 28px 24px', boxShadow: '0 24px 60px rgba(0,0,0,0.4)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: textPrimary, margin: 0, letterSpacing: '-0.01em' }}>New Project</h2>
              <button onClick={() => setShowNew(false)} style={{ background: 'none', border: 'none', color: textMuted, cursor: 'pointer', fontSize: 20, display: 'flex' }}>
                <i className="bx bx-x" />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 500, color: textMuted, marginBottom: 6, display: 'block' }}>
                  Project name <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  autoFocus
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleCreate()}
                  placeholder="e.g. My App, Backend API…"
                  style={inputSt}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 500, color: textMuted, marginBottom: 6, display: 'block' }}>
                  Description <span style={{ color: textDim, fontWeight: 400 }}>(optional)</span>
                </label>
                <textarea
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                  placeholder="What is this project about?"
                  rows={3}
                  style={{ ...inputSt, resize: 'vertical' }}
                />
              </div>

              {createError && (
                <div style={{ padding: '9px 12px', borderRadius: 8, background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', fontSize: 13 }}>
                  {createError}
                </div>
              )}

              <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
                <button
                  onClick={handleCreate}
                  disabled={creating || !newName.trim()}
                  style={{ flex: 1, padding: '10px', borderRadius: 9, border: 'none', background: newName.trim() ? 'linear-gradient(135deg, #00e5ff, #a900ff)' : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)'), color: newName.trim() ? '#fff' : textMuted, fontSize: 13, fontWeight: 600, cursor: newName.trim() ? 'pointer' : 'not-allowed', opacity: creating ? 0.7 : 1 }}
                >
                  {creating ? 'Creating…' : 'Create Project'}
                </button>
                <button
                  onClick={() => setShowNew(false)}
                  style={{ padding: '10px 18px', borderRadius: 9, border: `1px solid ${cardBorder}`, background: 'transparent', color: textMuted, fontSize: 13, cursor: 'pointer' }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
