'use client'
import { useEffect, useState, useCallback, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useMCP } from '@/hooks/useMCP'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { MarkdownEditor } from '@orchestra-mcp/editor/MarkdownEditor'
import { MarkdownRenderer } from '@orchestra-mcp/editor/MarkdownRenderer'

interface Note {
  id: string
  title: string
  body?: string
  tags?: string[]
  icon?: string
  color?: string
  pinned?: boolean
  project_id?: string
  created_at: string
  updated_at: string
}

// ── Icon & color options ─────────────────────────────────────
const iconOptions = [
  { label: 'Note', value: 'bx-note' },
  { label: 'Lightbulb', value: 'bxs-bulb' },
  { label: 'Star', value: 'bxs-star' },
  { label: 'Heart', value: 'bxs-heart' },
  { label: 'Flag', value: 'bx-flag' },
  { label: 'Bookmark', value: 'bx-bookmark' },
  { label: 'Lightning', value: 'bx-bolt-circle' },
  { label: 'Code', value: 'bx-code-alt' },
  { label: 'Bug', value: 'bx-bug' },
  { label: 'Rocket', value: 'bx-rocket' },
  { label: 'Globe', value: 'bx-globe' },
  { label: 'Music', value: 'bx-music' },
  { label: 'Folder', value: 'bx-folder' },
  { label: 'Pin', value: 'bx-pin' },
  { label: 'Calendar', value: 'bx-calendar' },
  { label: 'Chat', value: 'bx-chat' },
]

const colorOptions = [
  { label: 'Purple', value: '#a900ff' },
  { label: 'Cyan', value: '#00e5ff' },
  { label: 'Red', value: '#ef4444' },
  { label: 'Orange', value: '#f59e0b' },
  { label: 'Green', value: '#22c55e' },
  { label: 'Blue', value: '#3b82f6' },
  { label: 'Pink', value: '#ec4899' },
  { label: 'White', value: 'var(--color-fg-muted)' },
]

export default function NotesPage() {
  const { callTool, status: connStatus, tunnel } = useMCP()
  const router = useRouter()
  const searchParams = useSearchParams()
  const noteId = searchParams.get('id')

  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeTag, setActiveTag] = useState<string | null>(null)
  const t = useTranslations('app')
  const tNav = useTranslations('nav')

  // Selected note state
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [noteLoading, setNoteLoading] = useState(false)
  const [noteRefreshKey, setNoteRefreshKey] = useState(0)

  // Edit mode state (for existing notes)
  const [editing, setEditing] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const [editBody, setEditBody] = useState('')
  const [editIcon, setEditIcon] = useState('')
  const [editColor, setEditColor] = useState('#a900ff')
  const [editTags, setEditTags] = useState('')
  const [saving, setSaving] = useState(false)

  // New note creation mode (inline, not modal)
  const [isCreating, setIsCreating] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newBody, setNewBody] = useState('')
  const [newIcon, setNewIcon] = useState('bx-note')
  const [newColor, setNewColor] = useState('#a900ff')
  const [newTags, setNewTags] = useState('')
  const [createError, setCreateError] = useState<string | null>(null)
  const titleInputRef = useRef<HTMLInputElement>(null)

  // Icon picker popover
  const [showIconPicker, setShowIconPicker] = useState(false)
  const iconPickerRef = useRef<HTMLDivElement>(null)

  const fetchNotes = useCallback(async () => {
    if (connStatus !== 'connected') return
    try {
      const args: Record<string, unknown> = {}
      if (activeTag) args.tag = activeTag
      const result = await callTool('list_notes', args)
      const text = result.content?.[0]?.text ?? ''
      const parsed = parseMCPNotes(text)
      setNotes(parsed)
      setLoading(false)
    } catch (e) {
      console.error('[notes] fetch error:', e)
      setLoading(false)
    }
  }, [connStatus, callTool, activeTag])

  useEffect(() => {
    if (connStatus === 'connected') fetchNotes()
  }, [connStatus, fetchNotes])

  // Listen for sidebar icon/color changes to refresh the note
  useEffect(() => {
    function handleNoteUpdated(e: Event) {
      const detail = (e as CustomEvent).detail
      if (!noteId || (detail?.noteId && detail.noteId !== noteId)) return
      setNoteRefreshKey(k => k + 1)
    }
    window.addEventListener('orchestra:note-updated', handleNoteUpdated)
    return () => window.removeEventListener('orchestra:note-updated', handleNoteUpdated)
  }, [noteId])

  // Fetch individual note when noteId changes or after sidebar update
  useEffect(() => {
    if (!noteId || connStatus !== 'connected') {
      setSelectedNote(null)
      setEditing(false)
      return
    }
    let cancelled = false
    async function loadNote() {
      // Only show loading spinner on initial load, not on refresh
      if (!selectedNote || selectedNote.id !== noteId) setNoteLoading(true)
      setEditing(false)
      try {
        const result = await callTool('get_note', { note_id: noteId })
        const text = result.content?.[0]?.text ?? ''
        const note = parseSingleNote(text, noteId!)
        if (!cancelled) setSelectedNote(note)
      } catch (e) {
        console.error('[notes] get_note error:', e)
        if (!cancelled) setSelectedNote(null)
      } finally {
        if (!cancelled) setNoteLoading(false)
      }
    }
    loadNote()
    return () => { cancelled = true }
  }, [noteId, connStatus, callTool, noteRefreshKey])

  // Close icon picker on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (iconPickerRef.current && !iconPickerRef.current.contains(e.target as Node)) {
        setShowIconPicker(false)
      }
    }
    if (showIconPicker) {
      document.addEventListener('mousedown', handleClick)
      return () => document.removeEventListener('mousedown', handleClick)
    }
  }, [showIconPicker])

  // Search via MCP when search input changes (debounced)
  const [searchResults, setSearchResults] = useState<Note[] | null>(null)
  useEffect(() => {
    if (!search.trim() || connStatus !== 'connected') {
      setSearchResults(null)
      return
    }
    const timer = setTimeout(async () => {
      try {
        const result = await callTool('search_notes', { query: search.trim() })
        const text = result.content?.[0]?.text ?? ''
        setSearchResults(parseMCPNotes(text))
      } catch {
        setSearchResults(null)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [search, connStatus, callTool])

  const displayNotes = searchResults ?? notes
  const pinned = displayNotes.filter(n => n.pinned)
  const rest = displayNotes.filter(n => !n.pinned)
  const allTags = Array.from(new Set(notes.flatMap(n => n.tags ?? [])))

  // ── Handlers ──────────────────────────────────────────────────

  function handleNewNote() {
    setIsCreating(true)
    setNewTitle('')
    setNewBody('')
    setNewIcon('bx-note')
    setNewColor('#a900ff')
    setNewTags('')
    setCreateError(null)
    // Clear selected note
    router.push('/notes')
    setTimeout(() => titleInputRef.current?.focus(), 50)
  }

  async function handleCreateSave() {
    if (!newTitle.trim() || connStatus !== 'connected') return
    setSaving(true)
    setCreateError(null)
    try {
      const args: Record<string, unknown> = {
        title: newTitle.trim(),
        body: newBody.trim() || ' ',
        icon: newIcon,
        color: newColor,
      }
      if (newTags.trim()) {
        args.tags = newTags.split(',').map(t => t.trim()).filter(Boolean)
      }
      const result = await callTool('create_note', args)
      // Try to extract ID from result to navigate to it
      const text = result.content?.[0]?.text ?? ''
      const idMatch = text.match(/(?:NOTE|note)[-_]?([A-Z0-9]+)/i) || text.match(/(NOTE-[A-Z0-9]+)/i)
      setIsCreating(false)
      await fetchNotes()
      if (idMatch) {
        router.push(`/notes?id=${idMatch[0]}`)
      }
    } catch (e) {
      setCreateError((e as Error).message)
    } finally {
      setSaving(false)
    }
  }

  function handleEdit() {
    if (!selectedNote) return
    setEditTitle(selectedNote.title)
    setEditBody(selectedNote.body || '')
    setEditIcon(selectedNote.icon || 'bx-note')
    setEditColor(selectedNote.color || '#a900ff')
    setEditTags(selectedNote.tags?.join(', ') || '')
    setEditing(true)
  }

  async function handleEditSave() {
    if (!selectedNote || !editTitle.trim()) return
    setSaving(true)
    try {
      const args: Record<string, unknown> = {
        note_id: selectedNote.id,
        title: editTitle.trim(),
        body: editBody.trim() || ' ',
        icon: editIcon,
        color: editColor,
      }
      if (editTags.trim()) {
        args.tags = editTags.split(',').map(t => t.trim()).filter(Boolean)
      }
      await callTool('update_note', args)
      // Reload note
      const result = await callTool('get_note', { note_id: selectedNote.id })
      const text = result.content?.[0]?.text ?? ''
      setSelectedNote(parseSingleNote(text, selectedNote.id))
      setEditing(false)
      fetchNotes()
    } catch (e) {
      console.error('[notes] save error:', e)
    } finally {
      setSaving(false)
    }
  }

  function handleCancelEdit() {
    setEditing(false)
  }

  function handleCancelCreate() {
    setIsCreating(false)
  }

  async function handlePin(noteId: string, pinned: boolean) {
    try {
      await callTool('pin_note', { note_id: noteId, pinned: !pinned })
      await fetchNotes()
      if (selectedNote?.id === noteId) {
        setSelectedNote(prev => prev ? { ...prev, pinned: !pinned } : null)
      }
    } catch (e) {
      console.error('[notes] pin error:', e)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm(t('deleteNote'))) return
    try {
      await callTool('delete_note', { note_id: id })
      if (selectedNote?.id === id) {
        router.push('/notes')
      }
      await fetchNotes()
    } catch (e) {
      console.error('[notes] delete error:', e)
    }
  }

  // ── Style tokens ──────────────────────────────────────────────
  const textPrimary = 'var(--color-fg)'
  const textMuted = 'var(--color-fg-dim)'
  const textDim = 'var(--color-fg-dim)'
  const cardBg = 'var(--color-bg-alt)'
  const cardBorder = 'var(--color-border)'
  const searchBg = 'var(--color-bg-alt)'
  const searchBorder = 'var(--color-border)'
  const searchColor = 'var(--color-fg)'
  const searchIconColor = 'var(--color-fg-dim)'
  const noteContentColor = 'var(--color-fg-dim)'
  const noteDateColor = 'var(--color-fg-dim)'
  const sectionLabelColor = 'var(--color-fg-dim)'
  const skeletonIconBg = 'var(--color-bg-alt)'
  const skeletonLineBg = 'var(--color-bg-active)'
  const emptyIconColor = 'var(--color-fg-dim)'
  const emptyTitleColor = 'var(--color-fg-muted)'
  const inputBg = 'var(--color-bg-alt)'
  const inputBorder = 'var(--color-border)'
  const tagBg = 'var(--color-bg-active)'
  const tagColor = 'var(--color-fg-muted)'
  const tagActiveBg = 'rgba(0,229,255,0.1)'
  const tagActiveColor = '#00e5ff'
  const actionColor = 'var(--color-fg-dim)'

  const card: React.CSSProperties = { background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 12 }
  const inputSt: React.CSSProperties = { width: '100%', padding: '9px 12px', borderRadius: 9, border: `1px solid ${inputBorder}`, background: inputBg, color: textPrimary, fontSize: 13, outline: 'none', boxSizing: 'border-box' }

  // ── Icon picker component ─────────────────────────────────────
  function IconColorPicker({
    icon, color, onIconChange, onColorChange,
  }: {
    icon: string; color: string
    onIconChange: (v: string) => void; onColorChange: (v: string) => void
  }) {
    const [open, setOpen] = useState(false)
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
      function handleClick(e: MouseEvent) {
        if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
      }
      if (open) {
        document.addEventListener('mousedown', handleClick)
        return () => document.removeEventListener('mousedown', handleClick)
      }
    }, [open])

    return (
      <div ref={ref} style={{ position: 'relative', flexShrink: 0 }}>
        <button
          type="button"
          onClick={() => setOpen(v => !v)}
          style={{
            width: 38, height: 38, borderRadius: 9, border: `1px solid ${cardBorder}`,
            background: `${color}12`, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'border-color 0.15s',
          }}
          title="Pick icon & color"
        >
          <i className={`bx ${icon}`} style={{ fontSize: 18, color }} />
        </button>

        {open && (
          <div style={{
            position: 'absolute', top: '100%', left: 0, marginTop: 6, zIndex: 100,
            background: 'var(--color-bg-contrast)', border: `1px solid ${cardBorder}`,
            borderRadius: 12, padding: 14, width: 240,
            boxShadow: 'var(--color-shadow-lg)',
          }}>
            {/* Color row */}
            <div style={{ fontSize: 11, fontWeight: 600, color: textMuted, marginBottom: 8, letterSpacing: '0.04em' }}>Color</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
              {colorOptions.map(c => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => onColorChange(c.value)}
                  title={c.label}
                  style={{
                    width: 22, height: 22, borderRadius: '50%', border: color === c.value ? '2px solid var(--color-fg)' : '2px solid transparent',
                    background: c.value, cursor: 'pointer', padding: 0,
                    outline: color === c.value ? '2px solid var(--color-bg-contrast)' : 'none',
                    outlineOffset: -3,
                  }}
                />
              ))}
            </div>

            {/* Icon grid */}
            <div style={{ fontSize: 11, fontWeight: 600, color: textMuted, marginBottom: 8, letterSpacing: '0.04em' }}>Icon</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 4 }}>
              {iconOptions.map(ic => (
                <button
                  key={ic.value}
                  type="button"
                  onClick={() => { onIconChange(ic.value); setOpen(false) }}
                  title={ic.label}
                  style={{
                    width: 32, height: 32, borderRadius: 6, border: 'none',
                    background: icon === ic.value ? `${color}20` : 'transparent',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'background 0.1s',
                  }}
                  onMouseEnter={e => { if (icon !== ic.value) e.currentTarget.style.background = 'var(--color-bg-active)' }}
                  onMouseLeave={e => { if (icon !== ic.value) e.currentTarget.style.background = 'transparent' }}
                >
                  <i className={`bx ${ic.value}`} style={{ fontSize: 16, color: icon === ic.value ? color : 'var(--color-fg-muted)' }} />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  // ── Note card (list view) ─────────────────────────────────────
  function NoteCard({ note }: { note: Note }) {
    const isActive = noteId === note.id
    const noteIcon = note.icon || (note.pinned ? 'bx-pin' : 'bx-note')
    const noteColor = note.color || (note.pinned ? '#00e5ff' : '#a900ff')

    return (
      <div
        onClick={() => { setIsCreating(false); router.push(`/notes?id=${note.id}`) }}
        style={{
          ...card, padding: '16px 18px', cursor: 'pointer',
          borderColor: isActive ? noteColor : cardBorder,
          background: isActive ? `${noteColor}08` : cardBg,
          transition: 'border-color 0.15s, background 0.15s',
        }}
        onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'var(--color-bg-active)' }}
        onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = cardBg }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: note.body ? 8 : 0 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 7,
            background: `${noteColor}12`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <i className={`bx ${noteIcon}`} style={{ fontSize: 14, color: noteColor }} />
          </div>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: textPrimary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{note.title || t('titleLabel')}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <button
              onClick={(e) => { e.stopPropagation(); handlePin(note.id, !!note.pinned) }}
              title={note.pinned ? t('unpin') : t('pin')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px', display: 'flex' }}
            >
              <i className={`bx ${note.pinned ? 'bxs-pin' : 'bx-pin'}`} style={{ fontSize: 13, color: actionColor }} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleDelete(note.id) }}
              title="Delete"
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px', display: 'flex' }}
            >
              <i className="bx bx-trash" style={{ fontSize: 13, color: actionColor }} />
            </button>
          </div>
          <div style={{ fontSize: 11, color: noteDateColor, flexShrink: 0 }}>
            {new Date(note.updated_at || note.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </div>
        </div>
        {note.body && (
          <div style={{ fontSize: 12, color: noteContentColor, lineHeight: 1.55, paddingInlineStart: 36, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const }}>
            {note.body}
          </div>
        )}
        {note.tags && note.tags.length > 0 && (
          <div style={{ display: 'flex', gap: 4, paddingInlineStart: 36, marginTop: 6, flexWrap: 'wrap' }}>
            {note.tags.map((tag, i) => (
              <span key={`${tag}-${i}`} style={{ fontSize: 10, padding: '1px 6px', borderRadius: 4, background: tagBg, color: tagColor }}>
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    )
  }

  // ── Not connected / connecting states ─────────────────────────
  if (connStatus !== 'connected' && connStatus !== 'connecting') {
    return (
      <div className="page-wrapper" style={{ padding: '28px 32px' }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: textPrimary, margin: '0 0 24px', letterSpacing: '-0.02em' }}>{tNav('notes')}</h1>
        <div style={{ ...card, padding: '60px 40px', textAlign: 'center' }}>
          <i className="bx bx-transfer-alt" style={{ fontSize: 40, color: '#f59e0b', display: 'block', marginBottom: 14 }} />
          <div style={{ fontSize: 15, fontWeight: 600, color: emptyTitleColor, marginBottom: 6 }}>{t('noTunnelConnected')}</div>
          <div style={{ fontSize: 13, color: textDim, marginBottom: 20 }}>{t('connectTunnelNotes')}</div>
          <Link href="/tunnels" style={{ padding: '9px 20px', borderRadius: 9, border: 'none', background: 'linear-gradient(135deg, #00e5ff, #a900ff)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', textDecoration: 'none', display: 'inline-block' }}>
            {t('goToTunnels')}
          </Link>
        </div>
      </div>
    )
  }

  if (connStatus === 'connecting') {
    return (
      <div className="page-wrapper" style={{ padding: '28px 32px' }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: textPrimary, margin: '0 0 24px', letterSpacing: '-0.02em' }}>{tNav('notes')}</h1>
        <div style={{ ...card, padding: '60px 40px', textAlign: 'center' }}>
          <i className="bx bx-loader-alt bx-spin" style={{ fontSize: 36, color: '#00e5ff', display: 'block', marginBottom: 14 }} />
          <div style={{ fontSize: 14, fontWeight: 600, color: emptyTitleColor, marginBottom: 6 }}>{t('connectingToWorkspace')}</div>
          {tunnel && <div style={{ fontSize: 12, color: textDim }}>{tunnel.name} ({tunnel.hostname})</div>}
        </div>
      </div>
    )
  }

  // ── Render: New note editor (full-page) ───────────────────────
  if (isCreating) {
    return (
      <div className="page-wrapper" style={{ padding: '28px 32px', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Title row with icon picker */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, flexShrink: 0 }}>
          <IconColorPicker
            icon={newIcon}
            color={newColor}
            onIconChange={setNewIcon}
            onColorChange={setNewColor}
          />
          <input
            ref={titleInputRef}
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            placeholder={t('noteTitlePlaceholder')}
            autoFocus
            style={{
              flex: 1, fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em',
              background: 'transparent', color: textPrimary,
              border: 'none', borderBottom: `1px solid ${cardBorder}`,
              padding: '4px 0', outline: 'none',
            }}
          />
        </div>

        {/* Tags input */}
        <div style={{ marginBottom: 16, flexShrink: 0 }}>
          <input
            value={newTags}
            onChange={e => setNewTags(e.target.value)}
            placeholder={`${t('tags')} (${t('tagsCommaSeparated')})`}
            style={{
              ...inputSt,
              fontSize: 12, padding: '6px 10px', borderRadius: 6,
              background: 'transparent', border: `1px solid ${cardBorder}`,
            }}
          />
        </div>

        {/* Markdown editor */}
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <MarkdownEditor
            value={newBody}
            onChange={setNewBody}
            placeholder={t('startWriting')}
            hidePreview
          />
        </div>

        {/* Error */}
        {createError && (
          <div style={{ padding: '9px 12px', borderRadius: 8, background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', fontSize: 13, marginTop: 12, flexShrink: 0 }}>
            {createError}
          </div>
        )}

        {/* Action bar */}
        <div style={{ display: 'flex', gap: 8, paddingTop: 16, flexShrink: 0, borderTop: `1px solid ${cardBorder}`, marginTop: 12 }}>
          <button
            onClick={handleCreateSave}
            disabled={saving || !newTitle.trim()}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 18px', borderRadius: 8, border: 'none',
              background: newTitle.trim() ? 'linear-gradient(135deg, #00e5ff, #a900ff)' : 'var(--color-border)',
              color: newTitle.trim() ? '#fff' : textMuted,
              fontSize: 13, fontWeight: 600, cursor: newTitle.trim() ? 'pointer' : 'not-allowed',
              opacity: saving ? 0.7 : 1,
            }}
          >
            {saving ? <i className="bx bx-loader-alt bx-spin" style={{ fontSize: 14 }} /> : <i className="bx bx-check" style={{ fontSize: 15 }} />}
            {saving ? t('creating') : t('createNote')}
          </button>
          <button
            onClick={handleCancelCreate}
            style={{
              padding: '8px 16px', borderRadius: 8, border: `1px solid ${cardBorder}`,
              background: 'transparent', color: textMuted, fontSize: 13, cursor: 'pointer',
            }}
          >
            {t('cancel')}
          </button>
        </div>
      </div>
    )
  }

  // ── Render: Note detail view (wiki-style) ─────────────────────
  if (noteId) {
    if (noteLoading) {
      return (
        <div className="page-wrapper" style={{ padding: '28px 32px', height: '100%', display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <i className="bx bx-loader-alt bx-spin" style={{ fontSize: 28, color: '#00e5ff', display: 'block', marginBottom: 10 }} />
              <div style={{ fontSize: 13, color: textMuted }}>Loading note...</div>
            </div>
          </div>
        </div>
      )
    }

    if (!selectedNote) {
      return (
        <div className="page-wrapper" style={{ padding: '28px 32px', height: '100%', display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <i className="bx bx-error-circle" style={{ fontSize: 36, color: '#ef4444', display: 'block', marginBottom: 10 }} />
              <div style={{ fontSize: 14, fontWeight: 600, color: textPrimary, marginBottom: 6 }}>Note not found</div>
              <div style={{ fontSize: 13, color: textMuted, marginBottom: 16 }}>The note may have been deleted.</div>
              <button
                onClick={() => router.push('/notes')}
                style={{ padding: '8px 18px', borderRadius: 8, border: `1px solid ${cardBorder}`, background: 'transparent', color: textMuted, fontSize: 13, cursor: 'pointer' }}
              >
                Back to notes
              </button>
            </div>
          </div>
        </div>
      )
    }

    const noteIcon = selectedNote.icon || 'bx-note'
    const noteColor = selectedNote.color || '#a900ff'

    return (
      <div className="page-wrapper" style={{ padding: '28px 32px', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Title row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6, flexShrink: 0 }}>
          {editing ? (
            <>
              <IconColorPicker
                icon={editIcon}
                color={editColor}
                onIconChange={setEditIcon}
                onColorChange={setEditColor}
              />
              <input
                value={editTitle}
                onChange={e => setEditTitle(e.target.value)}
                autoFocus
                style={{
                  flex: 1, fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em',
                  background: 'transparent', color: textPrimary,
                  border: 'none', borderBottom: `1px solid ${cardBorder}`,
                  padding: '4px 0', outline: 'none',
                }}
              />
            </>
          ) : (
            <>
              <div style={{
                width: 38, height: 38, borderRadius: 9, flexShrink: 0,
                background: `${noteColor}12`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <i className={`bx ${noteIcon}`} style={{ fontSize: 18, color: noteColor }} />
              </div>
              <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, letterSpacing: '-0.02em', flex: 1, color: textPrimary }}>
                {selectedNote.title}
              </h1>
            </>
          )}

          {/* Action buttons */}
          {!editing ? (
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                onClick={() => handlePin(selectedNote.id, !!selectedNote.pinned)}
                title={selectedNote.pinned ? t('unpin') : t('pin')}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '5px 10px', borderRadius: 6, border: `1px solid ${cardBorder}`,
                  background: 'transparent', color: textMuted,
                  fontSize: 12, cursor: 'pointer',
                }}
              >
                <i className={`bx ${selectedNote.pinned ? 'bxs-pin' : 'bx-pin'}`} style={{ fontSize: 14, color: selectedNote.pinned ? '#00e5ff' : undefined }} />
              </button>
              <button
                onClick={handleEdit}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '5px 12px', borderRadius: 6, border: `1px solid ${cardBorder}`,
                  background: 'transparent', color: textMuted,
                  fontSize: 12, fontWeight: 500, cursor: 'pointer',
                }}
              >
                <i className="bx bx-edit-alt" style={{ fontSize: 14 }} />
                {t('content') === 'Content' ? 'Edit' : t('content')}
              </button>
              <button
                onClick={() => handleDelete(selectedNote.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '5px 10px', borderRadius: 6, border: `1px solid ${cardBorder}`,
                  background: 'transparent', color: '#ef4444',
                  fontSize: 12, cursor: 'pointer',
                }}
              >
                <i className="bx bx-trash" style={{ fontSize: 14 }} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                onClick={handleCancelEdit}
                disabled={saving}
                style={{
                  padding: '5px 12px', borderRadius: 6, border: `1px solid ${cardBorder}`,
                  background: 'transparent', color: textMuted,
                  fontSize: 12, fontWeight: 500, cursor: 'pointer', opacity: saving ? 0.5 : 1,
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleEditSave}
                disabled={saving || !editTitle.trim()}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '5px 14px', borderRadius: 6, border: 'none',
                  background: '#00e5ff', color: '#000',
                  fontSize: 12, fontWeight: 600, cursor: 'pointer', opacity: saving ? 0.5 : 1,
                }}
              >
                {saving ? <i className="bx bx-loader-alt bx-spin" style={{ fontSize: 13 }} /> : <i className="bx bx-check" style={{ fontSize: 14 }} />}
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          )}
        </div>

        {/* Tags row (view/edit) */}
        {editing ? (
          <div style={{ marginBottom: 14, flexShrink: 0 }}>
            <input
              value={editTags}
              onChange={e => setEditTags(e.target.value)}
              placeholder={`${t('tags')} (${t('tagsCommaSeparated')})`}
              style={{
                ...inputSt,
                fontSize: 12, padding: '6px 10px', borderRadius: 6,
                background: 'transparent', border: `1px solid ${cardBorder}`,
              }}
            />
          </div>
        ) : (
          selectedNote.tags && selectedNote.tags.length > 0 && (
            <div style={{ display: 'flex', gap: 5, marginBottom: 14, flexWrap: 'wrap', flexShrink: 0 }}>
              {selectedNote.tags.map((tag, i) => (
                <span key={`${tag}-${i}`} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 5, background: tagBg, color: tagColor }}>
                  {tag}
                </span>
              ))}
            </div>
          )
        )}

        {/* Meta row */}
        {!editing && (
          <div style={{ fontSize: 11, color: textDim, marginBottom: 16, flexShrink: 0, display: 'flex', gap: 12, alignItems: 'center' }}>
            <span>{selectedNote.id}</span>
            <span style={{ opacity: 0.4 }}>|</span>
            <span>{new Date(selectedNote.updated_at || selectedNote.created_at).toLocaleString()}</span>
            {selectedNote.pinned && (
              <>
                <span style={{ opacity: 0.4 }}>|</span>
                <span style={{ color: '#00e5ff' }}><i className="bx bxs-pin" style={{ fontSize: 11, marginRight: 2 }} /> {t('pinned')}</span>
              </>
            )}
          </div>
        )}

        {/* Body: markdown viewer or editor */}
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {editing ? (
            <MarkdownEditor
              value={editBody}
              onChange={setEditBody}
              placeholder={t('startWriting')}
              hidePreview
            />
          ) : (
            <div style={{ flex: 1, overflowY: 'auto' }}>
              <div style={{ fontSize: 14, lineHeight: 1.75 }} className="wiki-body-markdown">
                <MarkdownRenderer content={selectedNote.body || ''} />
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  // ── Render: Notes list view (no note selected) ────────────────
  return (
    <div className="page-wrapper" style={{ padding: '28px 32px' }}>
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 22 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: textPrimary, margin: 0, letterSpacing: '-0.02em' }}>{tNav('notes')}</h1>
          <p style={{ fontSize: 13, color: textMuted, marginTop: 5 }}>
            {loading ? t('loadingFromWorkspace') : `${notes.length} note${notes.length !== 1 ? 's' : ''}`}
            {tunnel && (
              <span style={{ marginInlineStart: 8, fontSize: 11, color: textDim }}>
                <i className="bx bx-link" style={{ marginInlineEnd: 3, fontSize: 12 }} />
                {tunnel.name}
              </span>
            )}
          </p>
        </div>
        <button
          onClick={handleNewNote}
          disabled={connStatus !== 'connected'}
          style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 16px', borderRadius: 9, border: 'none', background: 'linear-gradient(135deg, #00e5ff, #a900ff)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: connStatus !== 'connected' ? 0.5 : 1 }}
        >
          <i className="bx bx-plus" style={{ fontSize: 16 }} />
          {t('newNote')}
        </button>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: allTags.length > 0 ? 12 : 24 }}>
        <i className="bx bx-search" style={{ position: 'absolute', insetInlineStart: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 15, color: searchIconColor, pointerEvents: 'none' }} />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={t('searchNotes')}
          style={{ width: '100%', padding: '9px 12px 9px 36px', borderRadius: 9, border: `1px solid ${searchBorder}`, background: searchBg, color: searchColor, fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
        />
      </div>

      {/* Tag filters */}
      {allTags.length > 0 && (
        <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveTag(null)}
            style={{ fontSize: 11, padding: '3px 10px', borderRadius: 6, border: 'none', cursor: 'pointer', background: !activeTag ? tagActiveBg : tagBg, color: !activeTag ? tagActiveColor : tagColor, fontWeight: 500 }}
          >
            {t('all')}
          </button>
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => setActiveTag(activeTag === tag ? null : tag)}
              style={{ fontSize: 11, padding: '3px 10px', borderRadius: 6, border: 'none', cursor: 'pointer', background: activeTag === tag ? tagActiveBg : tagBg, color: activeTag === tag ? tagActiveColor : tagColor, fontWeight: 500 }}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

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
      ) : displayNotes.length === 0 ? (
        <div style={{ ...card, padding: '60px 40px', textAlign: 'center' }}>
          <i className="bx bx-note" style={{ fontSize: 40, color: emptyIconColor, display: 'block', marginBottom: 14 }} />
          <div style={{ fontSize: 15, fontWeight: 600, color: emptyTitleColor, marginBottom: 6 }}>
            {search ? t('noMatchingNotes') : t('noNotesYet')}
          </div>
          <div style={{ fontSize: 13, color: textDim, marginBottom: 20 }}>
            {search ? t('tryDifferentSearch') : t('createFirstNote')}
          </div>
          {!search && (
            <button
              onClick={handleNewNote}
              style={{ padding: '9px 20px', borderRadius: 9, border: 'none', background: 'linear-gradient(135deg, #00e5ff, #a900ff)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
            >
              {t('createNote')}
            </button>
          )}
        </div>
      ) : (
        <div>
          {pinned.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: sectionLabelColor, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>{t('pinned')}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {pinned.map(n => <NoteCard key={n.id} note={n} />)}
              </div>
            </div>
          )}
          {rest.length > 0 && (
            <div>
              {pinned.length > 0 && <div style={{ fontSize: 11, fontWeight: 600, color: sectionLabelColor, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>{t('allNotes')}</div>}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {rest.map(n => <NoteCard key={n.id} note={n} />)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ============================================================
// MCP response parsers
// ============================================================

/** Parse list_notes / search_notes MCP markdown response into Note array. */
function parseMCPNotes(text: string): Note[] {
  const notes: Note[] = []
  const lines = text.split('\n')
  let headerCols: string[] = []

  for (const line of lines) {
    if (!line.startsWith('|') || line.includes('---')) continue
    const cells = line.split('|').map(c => c.trim()).filter(Boolean)
    if (cells.length < 2) continue

    if (cells[0].toLowerCase() === 'id') {
      headerCols = cells.map(c => c.toLowerCase())
      continue
    }

    const row: Record<string, string> = {}
    cells.forEach((cell, i) => {
      const col = headerCols[i] || `col${i}`
      row[col] = cell
    })

    const id = row['id'] || cells[0]
    const title = row['title'] || cells[1]
    if (!id || !title) continue

    const pinnedStr = row['pinned'] || ''
    const tagsStr = row['tags'] || ''
    const tags = tagsStr && tagsStr !== '\u2014' && tagsStr !== '-'
      ? tagsStr.split(',').map(t => t.trim()).filter(Boolean)
      : []

    notes.push({
      id,
      title,
      tags,
      pinned: pinnedStr.toLowerCase() === 'true' || pinnedStr === 'yes',
      updated_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    })
  }

  return notes
}

/** Parse get_note MCP response into a single Note object.
 *
 * Actual MCP format:
 *   ### note-id — Title text
 *   - **Icon:** bx-folder
 *   - **Color:** #22c55e
 *   - **Pinned:** no
 *   - **Tags:** tag1, tag2
 *   - **Created:** 2026-03-09T...
 *   - **Updated:** 2026-03-09T...
 *
 *   ---
 *
 *   Body content here...
 */
function parseSingleNote(text: string, fallbackId: string): Note | null {
  const lines = text.split('\n')
  let title = ''
  let id = fallbackId
  let icon = ''
  let color = ''
  let tags: string[] = []
  let pinned = false
  let created_at = new Date().toISOString()
  let updated_at = new Date().toISOString()
  let bodyStartIdx = -1

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // Title from "### note-id — Title" or "## Note: Title"
    const headerMatch = line.match(/^#{2,3}\s+(?:Note:\s*)?(?:\S+\s+—\s+)?(.+)$/i)
    if (headerMatch && !title) {
      // Extract title part (after " — " if present)
      const raw = headerMatch[1].trim()
      // If the header is "### note-id — Title", extract the title after " — "
      const dashIdx = line.indexOf(' — ')
      if (dashIdx >= 0) {
        title = line.slice(dashIdx + 3).trim()
        // Extract id from before " — "
        const idMatch = line.match(/^#{2,3}\s+(\S+)\s+—/)
        if (idMatch) id = idMatch[1]
      } else {
        title = raw
      }
      continue
    }

    // Field extraction: "- **Key:** value" or "**Key:** value"
    const fieldMatch = line.match(/^-?\s*\*\*(\w+):\*\*\s*(.*)$/i)
    if (fieldMatch) {
      const key = fieldMatch[1].toLowerCase()
      const val = fieldMatch[2].trim()
      if (key === 'id') id = val
      else if (key === 'title') title = title || val
      else if (key === 'icon') icon = val
      else if (key === 'color') color = val
      else if (key === 'tags') tags = val && val !== '\u2014' && val !== '—' ? val.split(',').map(t => t.trim()).filter(Boolean) : []
      else if (key === 'pinned') pinned = val.toLowerCase() === 'true' || val === 'yes'
      else if (key === 'created') created_at = val || created_at
      else if (key === 'updated') updated_at = val || updated_at
      continue
    }

    // Body separator
    if (line.trim() === '---' && bodyStartIdx === -1) {
      bodyStartIdx = i + 1
    }
  }

  // Body is everything after ---
  let body = ''
  if (bodyStartIdx >= 0) {
    body = lines.slice(bodyStartIdx).join('\n').trim()
  }

  if (!title) return null

  return { id, title, body, tags, icon, color, pinned, created_at, updated_at }
}
