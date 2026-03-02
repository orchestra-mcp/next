'use client'
import { useEffect, useState } from 'react'
import { apiFetch, isDevSeed } from '@/lib/api'
import { useThemeStore } from '@/store/theme'

interface Note {
  id: string
  title: string
  content?: string
  updated_at: string
  pinned?: boolean
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const { theme } = useThemeStore()
  const isDark = theme === 'dark'

  // New note modal
  const [showNew, setShowNew] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newContent, setNewContent] = useState('')
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  useEffect(() => {
    apiFetch<Note[] | { notes: Note[] }>('/api/notes')
      .then(r => { setNotes(Array.isArray(r) ? r : (r.notes ?? [])); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const filtered = notes.filter(n =>
    (n.title ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (n.content ?? '').toLowerCase().includes(search.toLowerCase())
  )
  const pinned = filtered.filter(n => n.pinned)
  const rest = filtered.filter(n => !n.pinned)

  async function handleCreate() {
    if (!newTitle.trim()) return
    setCreating(true); setCreateError(null)
    try {
      if (isDevSeed()) {
        const fake: Note = { id: crypto.randomUUID(), title: newTitle.trim(), content: newContent.trim() || undefined, updated_at: new Date().toISOString() }
        setNotes(n => [fake, ...n])
      } else {
        const created = await apiFetch<Note>('/api/notes', {
          method: 'POST',
          body: JSON.stringify({ title: newTitle.trim(), content: newContent.trim() }),
        })
        setNotes(n => [created, ...n])
      }
      setShowNew(false); setNewTitle(''); setNewContent('')
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
  const noteContentColor = isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.45)'
  const noteDateColor = isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.3)'
  const sectionLabelColor = isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.3)'
  const skeletonIconBg = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'
  const skeletonLineBg = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'
  const emptyIconColor = isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)'
  const emptyTitleColor = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)'
  const inputBg = isDark ? 'rgba(255,255,255,0.05)' : '#f7f7f9'
  const inputBorder = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.12)'
  const modalBg = isDark ? '#1a1520' : '#ffffff'
  const modalBorder = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'

  const card: React.CSSProperties = { background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 12 }
  const inputSt: React.CSSProperties = { width: '100%', padding: '9px 12px', borderRadius: 9, border: `1px solid ${inputBorder}`, background: inputBg, color: textPrimary, fontSize: 13, outline: 'none', boxSizing: 'border-box' }

  function NoteCard({ note }: { note: Note }) {
    return (
      <div style={{ ...card, padding: '16px 18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: note.content ? 8 : 0 }}>
          <div style={{ width: 28, height: 28, borderRadius: 7, background: note.pinned ? 'rgba(0,229,255,0.08)' : 'rgba(169,0,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <i className={`bx ${note.pinned ? 'bx-pin' : 'bx-note'}`} style={{ fontSize: 14, color: note.pinned ? '#00e5ff' : '#a900ff' }} />
          </div>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: textPrimary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{note.title || 'Untitled'}</div>
          </div>
          <div style={{ fontSize: 11, color: noteDateColor, flexShrink: 0 }}>
            {new Date(note.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </div>
        </div>
        {note.content && (
          <div style={{ fontSize: 12, color: noteContentColor, lineHeight: 1.55, paddingLeft: 36, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const }}>
            {note.content}
          </div>
        )}
      </div>
    )
  }

  return (
    <div style={{ padding: '28px 32px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 22 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: textPrimary, margin: 0, letterSpacing: '-0.02em' }}>Notes</h1>
          <p style={{ fontSize: 13, color: textMuted, marginTop: 5 }}>
            {loading ? 'Loading…' : `${notes.length} note${notes.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <button
          onClick={() => { setShowNew(true); setNewTitle(''); setNewContent(''); setCreateError(null) }}
          style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 16px', borderRadius: 9, border: 'none', background: 'linear-gradient(135deg, #00e5ff, #a900ff)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
        >
          <i className="bx bx-plus" style={{ fontSize: 16 }} />
          New Note
        </button>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 24 }}>
        <i className="bx bx-search" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 15, color: searchIconColor, pointerEvents: 'none' }} />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search notes…"
          style={{ width: '100%', padding: '9px 12px 9px 36px', borderRadius: 9, border: `1px solid ${searchBorder}`, background: searchBg, color: searchColor, fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
        />
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[1,2,3,4,5].map(i => (
            <div key={i} style={{ ...card, padding: '16px 18px', height: 60 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 28, height: 28, borderRadius: 7, background: skeletonIconBg }} />
                <div style={{ flex: 1 }}>
                  <div style={{ height: 12, borderRadius: 5, background: skeletonLineBg, width: '40%' }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ ...card, padding: '60px 40px', textAlign: 'center' }}>
          <i className="bx bx-note" style={{ fontSize: 40, color: emptyIconColor, display: 'block', marginBottom: 14 }} />
          <div style={{ fontSize: 15, fontWeight: 600, color: emptyTitleColor, marginBottom: 6 }}>
            {search ? 'No matching notes' : 'No notes yet'}
          </div>
          <div style={{ fontSize: 13, color: textDim, marginBottom: 20 }}>
            {search ? 'Try a different search term.' : 'Create your first note to get started.'}
          </div>
          {!search && (
            <button
              onClick={() => setShowNew(true)}
              style={{ padding: '9px 20px', borderRadius: 9, border: 'none', background: 'linear-gradient(135deg, #00e5ff, #a900ff)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
            >
              Create Note
            </button>
          )}
        </div>
      ) : (
        <div>
          {pinned.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: sectionLabelColor, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>Pinned</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {pinned.map(n => <NoteCard key={n.id} note={n} />)}
              </div>
            </div>
          )}
          {rest.length > 0 && (
            <div>
              {pinned.length > 0 && <div style={{ fontSize: 11, fontWeight: 600, color: sectionLabelColor, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>All Notes</div>}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {rest.map(n => <NoteCard key={n.id} note={n} />)}
              </div>
            </div>
          )}
        </div>
      )}

      {/* New Note Modal */}
      {showNew && (
        <div
          onClick={e => { if (e.target === e.currentTarget) setShowNew(false) }}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
        >
          <div style={{ width: '100%', maxWidth: 480, background: modalBg, border: `1px solid ${modalBorder}`, borderRadius: 16, padding: '28px 28px 24px', boxShadow: '0 24px 60px rgba(0,0,0,0.4)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: textPrimary, margin: 0 }}>New Note</h2>
              <button onClick={() => setShowNew(false)} style={{ background: 'none', border: 'none', color: textMuted, cursor: 'pointer', fontSize: 20, display: 'flex' }}>
                <i className="bx bx-x" />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 500, color: textMuted, marginBottom: 6, display: 'block' }}>
                  Title <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  autoFocus
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleCreate()}
                  placeholder="Note title…"
                  style={inputSt}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 500, color: textMuted, marginBottom: 6, display: 'block' }}>
                  Content <span style={{ color: textDim, fontWeight: 400 }}>(optional)</span>
                </label>
                <textarea
                  value={newContent}
                  onChange={e => setNewContent(e.target.value)}
                  placeholder="Start writing…"
                  rows={5}
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
                  disabled={creating || !newTitle.trim()}
                  style={{ flex: 1, padding: '10px', borderRadius: 9, border: 'none', background: newTitle.trim() ? 'linear-gradient(135deg, #00e5ff, #a900ff)' : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)'), color: newTitle.trim() ? '#fff' : textMuted, fontSize: 13, fontWeight: 600, cursor: newTitle.trim() ? 'pointer' : 'not-allowed', opacity: creating ? 0.7 : 1 }}
                >
                  {creating ? 'Saving…' : 'Create Note'}
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
