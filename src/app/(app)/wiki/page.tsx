'use client'
import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { apiFetch } from '@/lib/api'
import { MarkdownEditor } from '@orchestra-mcp/editor/MarkdownEditor'
import { MarkdownRenderer } from '@orchestra-mcp/editor/MarkdownRenderer'

interface DocResponse {
  doc_id: string
  title: string
  category: string
  body: string
}

export default function WikiPage() {
  const searchParams = useSearchParams()
  const docId = searchParams.get('file')
  const project = searchParams.get('project')

  const [doc, setDoc] = useState<DocResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editBody, setEditBody] = useState('')
  const [saving, setSaving] = useState(false)

  // Build the API path based on whether we have a project slug.
  // Project-scoped docs: /api/projects/:slug/docs/:id (requires auth)
  // System docs:         /api/docs/:id (public, no auth)
  const docApiPath = useCallback((id: string) => {
    if (project) {
      return `/api/projects/${encodeURIComponent(project)}/docs/${encodeURIComponent(id)}`
    }
    return `/api/docs/${encodeURIComponent(id)}`
  }, [project])

  // Load doc content when file or project changes
  useEffect(() => {
    if (!docId) {
      setDoc(null)
      setError(false)
      setEditing(false)
      return
    }
    let cancelled = false
    async function loadContent() {
      setLoading(true)
      setError(false)
      setEditing(false)
      try {
        // Try project-scoped endpoint first, then fall back to system endpoint.
        let result: DocResponse | null = null
        if (project) {
          try {
            result = await apiFetch<DocResponse>(
              `/api/projects/${encodeURIComponent(project)}/docs/${encodeURIComponent(docId!)}`
            )
          } catch {
            // Project endpoint failed — try system endpoint as fallback
            result = await apiFetch<DocResponse>(
              `/api/docs/${encodeURIComponent(docId!)}`,
              { skipAuth: true }
            )
          }
        } else {
          result = await apiFetch<DocResponse>(
            `/api/docs/${encodeURIComponent(docId!)}`,
            { skipAuth: true }
          )
        }
        if (!cancelled) setDoc(result)
      } catch (e) {
        console.error('[wiki] doc fetch error:', e)
        if (!cancelled) { setDoc(null); setError(true) }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    loadContent()
    return () => { cancelled = true }
  }, [docId, project])

  const handleEdit = useCallback(() => {
    if (doc) {
      setEditBody(doc.body)
      setEditing(true)
    }
  }, [doc])

  const handleCancel = useCallback(() => {
    setEditing(false)
    setEditBody('')
  }, [])

  const handleSave = useCallback(async () => {
    if (!docId || !doc) return
    setSaving(true)
    try {
      // Save uses the system endpoint (PUT /api/docs/:id) which requires auth.
      // Project-scoped docs don't have a PUT endpoint yet.
      const updated = await apiFetch<DocResponse>(
        `/api/docs/${encodeURIComponent(docId)}`,
        { method: 'PUT', body: JSON.stringify({ body: editBody }) }
      )
      setDoc(updated)
      setEditing(false)
      setEditBody('')
    } catch (e) {
      console.error('[wiki] save error:', e)
    } finally {
      setSaving(false)
    }
  }, [docId, doc, editBody])

  // No file selected
  if (!docId) {
    return (
      <div className="page-wrapper" style={{ padding: '28px 32px', height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <i className="bx bx-book-open" style={{ fontSize: 48, color: 'var(--color-fg-muted)', opacity: 0.3, display: 'block', marginBottom: 14 }} />
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-fg-muted)', marginBottom: 6 }}>Select a document</div>
            <div style={{ fontSize: 13, color: 'var(--color-fg-muted)', opacity: 0.6 }}>
              Choose a file from the sidebar to view its content
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="page-wrapper" style={{ padding: '28px 32px', height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <i className="bx bx-loader-alt bx-spin" style={{ fontSize: 28, color: '#00e5ff', display: 'block', marginBottom: 10 }} />
            <div style={{ fontSize: 13, color: 'var(--color-fg-muted)' }}>Loading document...</div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="page-wrapper" style={{ padding: '28px 32px', height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <i className="bx bx-error-circle" style={{ fontSize: 36, color: '#ef4444', display: 'block', marginBottom: 10 }} />
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>Failed to load document</div>
            <div style={{ fontSize: 13, color: 'var(--color-fg-muted)' }}>The file may have been moved or deleted.</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page-wrapper" style={{ padding: '28px 32px', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Breadcrumb + toolbar */}
      {!editing ? (
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12, flexShrink: 0 }}>
          <span style={{ fontSize: 13, color: 'var(--color-fg-muted)', fontFamily: 'var(--font-mono, monospace)', opacity: 0.7 }}>
            /docs/{docId}
          </span>
          <div style={{ flex: 1 }} />
          <button
            onClick={handleEdit}
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '5px 12px', borderRadius: 6, border: '1px solid var(--color-border)',
              background: 'var(--color-bg-secondary)', color: 'var(--color-fg-muted)',
              fontSize: 12, fontWeight: 500, cursor: 'pointer',
            }}
          >
            <i className="bx bx-edit-alt" style={{ fontSize: 14 }} />
            Edit
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12, flexShrink: 0 }}>
          <span style={{ fontSize: 13, color: 'var(--color-fg-muted)', fontFamily: 'var(--font-mono, monospace)', opacity: 0.7 }}>
            /docs/{docId}
          </span>
          <div style={{ flex: 1 }} />
          <button
            onClick={handleCancel}
            disabled={saving}
            style={{
              padding: '5px 12px', borderRadius: 6, border: '1px solid var(--color-border)',
              background: 'var(--color-bg-secondary)', color: 'var(--color-fg-muted)',
              fontSize: 12, fontWeight: 500, cursor: 'pointer', opacity: saving ? 0.5 : 1,
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
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

      {/* Full body */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {editing ? (
          <MarkdownEditor
            value={editBody}
            onChange={setEditBody}
            placeholder="Write your documentation here..."
            hidePreview
          />
        ) : (
          <div style={{ flex: 1, overflowY: 'auto' }}>
            <div style={{ fontSize: 14, lineHeight: 1.75 }} className="wiki-body-markdown">
              <MarkdownRenderer content={doc?.body || ''} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
