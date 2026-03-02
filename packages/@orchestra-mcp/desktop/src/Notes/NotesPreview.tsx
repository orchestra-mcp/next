import { useState, useCallback, useRef, useEffect } from 'react'
import { MarkdownEditor, MarkdownRenderer } from '@orchestra-mcp/editor'
import { BoxIcon } from '@orchestra-mcp/icons'
import { WelcomeContent } from '../Chat/WelcomeContent'
import './NotesPreview.css'

export interface NotesPreviewProps {
  note: { id: string; title: string; content: string } | null
  onTitleChange: (id: string, title: string) => void
  onContentChange: (id: string, content: string) => void
  onExport: (id: string, format: 'md' | 'pdf' | 'doc') => void
  onDelete: (id: string) => void
  onSendToNotion?: (id: string) => void
  onSendToAppleNotes?: (id: string) => void
  logoSrc?: string
}

export function NotesPreview({ note, onTitleChange, onContentChange, onExport, onDelete, onSendToNotion, onSendToAppleNotes, logoSrc }: NotesPreviewProps) {
  const [editing, setEditing] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const [exportOpen, setExportOpen] = useState(false)
  const exportRef = useRef<HTMLDivElement>(null)

  // Reset to view mode when switching notes
  useEffect(() => {
    if (note) {
      setEditTitle(note.title)
      setEditing(false)
    }
  }, [note?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!exportOpen) return
    const handler = (e: MouseEvent) => {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) setExportOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [exportOpen])

  const commitTitle = useCallback(() => {
    if (note && editTitle.trim() && editTitle !== note.title) {
      onTitleChange(note.id, editTitle.trim())
    }
  }, [note, editTitle, onTitleChange])

  const handleContentChange = useCallback((value: string) => {
    if (note) onContentChange(note.id, value)
  }, [note, onContentChange])

  const handleDone = useCallback(() => {
    commitTitle()
    setEditing(false)
  }, [commitTitle])

  if (!note) {
    return (
      <div className="notes-preview">
        {logoSrc ? (
          <WelcomeContent
            logoSrc={logoSrc}
            hint="Select a note or create a new one"
            shortcutKey="+"
            shortcutLabel="New note"
          />
        ) : null}
      </div>
    )
  }

  return (
    <div className="notes-preview">
      <div className="notes-preview__toolbar">
        {editing ? (
          <input
            className="notes-preview__title-input"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onBlur={commitTitle}
            onKeyDown={(e) => { if (e.key === 'Enter') commitTitle() }}
            placeholder="Note title..."
          />
        ) : (
          <span className="notes-preview__title-text">{note.title || 'Untitled Note'}</span>
        )}
        {editing ? (
          <button
            className="notes-preview__btn notes-preview__btn--done"
            onClick={handleDone}
            title="Done editing"
            type="button"
          >
            <BoxIcon name="bx-check" size={16} />
          </button>
        ) : (
          <button
            className="notes-preview__btn"
            onClick={() => setEditing(true)}
            title="Edit note"
            type="button"
          >
            <BoxIcon name="bx-edit-alt" size={16} />
          </button>
        )}
        <div className="notes-preview__export-wrap" ref={exportRef}>
          <button
            className="notes-preview__btn"
            onClick={() => setExportOpen(!exportOpen)}
            title="Export"
            type="button"
          >
            <BoxIcon name="bx-export" size={16} />
          </button>
          {exportOpen && (
            <div className="notes-preview__export-menu">
              <button className="notes-preview__export-item" onClick={() => { setExportOpen(false); onExport(note.id, 'md') }} type="button">
                <BoxIcon name="bx-download" size={14} /> Markdown
              </button>
              <button className="notes-preview__export-item" onClick={() => { setExportOpen(false); onExport(note.id, 'doc') }} type="button">
                <BoxIcon name="bxs-file-doc" size={14} /> Google Docs
              </button>
              <button className="notes-preview__export-item" onClick={() => { setExportOpen(false); onExport(note.id, 'pdf') }} type="button">
                <BoxIcon name="bx-globe" size={14} /> HTML / PDF
              </button>
              {onSendToNotion && (
                <button className="notes-preview__export-item" onClick={() => { setExportOpen(false); onSendToNotion(note.id) }} type="button">
                  <BoxIcon name="bx-transfer" size={14} /> Send to Notion
                </button>
              )}
              {onSendToAppleNotes && (
                <button className="notes-preview__export-item" onClick={() => { setExportOpen(false); onSendToAppleNotes(note.id) }} type="button">
                  <BoxIcon name="bx-note" size={14} /> Send to Apple Notes
                </button>
              )}
            </div>
          )}
        </div>
        <button
          className="notes-preview__btn notes-preview__btn--danger"
          onClick={() => onDelete(note.id)}
          title="Delete"
          type="button"
        >
          <BoxIcon name="bx-trash" size={16} />
        </button>
      </div>
      <div className="notes-preview__body">
        {editing ? (
          <MarkdownEditor
            value={note.content}
            onChange={handleContentChange}
            placeholder="Start writing..."
            hidePreview
          />
        ) : (
          <div className="notes-preview__view">
            {note.content ? (
              <MarkdownRenderer content={note.content} />
            ) : (
              <p className="notes-preview__view-empty">No content yet. Click the edit button to start writing.</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
