'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { apiFetch, uploadUrl } from '@/lib/api'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface ContentItem {
  id: number
  title: string
  description: string
  entity_type: string
  entity_id: string
  slug: string
  visibility: 'public' | 'unlisted' | 'private'
  views_count: number
  likes_count: number
  unique_views: number
  user_id: number
  author_name: string
  author_avatar: string
  team_id: number | null
  created_at: string
  updated_at: string
}

interface ContentListResponse {
  items: ContentItem[]
  total: number
  page: number
  per_page: number
}

export interface AdminContentTableProps {
  apiBase?: string
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const ENTITY_TYPE_COLORS: Record<string, string> = {
  note: '#22c55e',
  skill: '#3b82f6',
  agent: '#a855f7',
  workflow: '#f59e0b',
  prompt: '#ec4899',
  api_collection: '#7c4dff',
  presentation: '#ff6d00',
  doc: '#00c853',
}

const ENTITY_TYPE_LABELS: Record<string, string> = {
  note: 'Note',
  skill: 'Skill',
  agent: 'Agent',
  workflow: 'Workflow',
  prompt: 'Prompt',
  api_collection: 'API Collection',
  presentation: 'Presentation',
  doc: 'Doc',
}

const VISIBILITY_COLORS: Record<string, string> = {
  public: '#22c55e',
  unlisted: '#f59e0b',
  private: '#6b7280',
}

const ENTITY_TYPE_OPTIONS = [
  'all', 'note', 'skill', 'agent', 'workflow', 'prompt', 'api_collection', 'presentation', 'doc',
] as const

const VISIBILITY_OPTIONS = ['all', 'public', 'unlisted', 'private'] as const

type SortField = 'title' | 'entity_type' | 'visibility' | 'views_count' | 'created_at'
type SortDir = 'asc' | 'desc'

const PER_PAGE = 20

/* ------------------------------------------------------------------ */
/*  Styles                                                             */
/* ------------------------------------------------------------------ */

const cellSt: React.CSSProperties = {
  padding: '10px 14px',
  fontSize: 13,
  color: 'var(--color-fg)',
  borderBottom: '1px solid var(--color-border)',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
}

const thSt: React.CSSProperties = {
  ...cellSt,
  fontSize: 11,
  fontWeight: 600,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.04em',
  color: 'var(--color-fg-dim)',
  background: 'var(--color-bg-alt)',
  position: 'sticky' as const,
  top: 0,
  zIndex: 2,
  cursor: 'pointer',
  userSelect: 'none' as const,
}

const inputSt: React.CSSProperties = {
  width: '100%',
  padding: '8px 12px',
  borderRadius: 8,
  border: '1px solid var(--color-border)',
  background: 'var(--color-bg-alt)',
  color: 'var(--color-fg)',
  fontSize: 13,
  outline: 'none',
}

const selectSt: React.CSSProperties = {
  ...inputSt,
  width: 'auto',
  minWidth: 120,
  cursor: 'pointer',
}

const btnSt: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '6px 12px',
  borderRadius: 8,
  border: '1px solid var(--color-border)',
  background: 'var(--color-bg-alt)',
  fontSize: 13,
  fontWeight: 500,
  color: 'var(--color-fg)',
  cursor: 'pointer',
  gap: 4,
}

const iconBtnSt: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 30,
  height: 30,
  borderRadius: 6,
  border: 'none',
  background: 'transparent',
  color: 'var(--color-fg-dim)',
  cursor: 'pointer',
  fontSize: 16,
}

const badgeSt = (color: string): React.CSSProperties => ({
  display: 'inline-block',
  padding: '2px 8px',
  borderRadius: 9999,
  fontSize: 11,
  fontWeight: 600,
  color: '#fff',
  background: color,
  lineHeight: '18px',
})

const checkboxSt: React.CSSProperties = {
  width: 16,
  height: 16,
  accentColor: 'var(--color-accent, #00e5ff)',
  cursor: 'pointer',
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function AdminContentTable({ apiBase = '/api/admin/content' }: AdminContentTableProps) {
  /* -- State -- */
  const [items, setItems] = useState<ContentItem[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [entityFilter, setEntityFilter] = useState<string>('all')
  const [visibilityFilter, setVisibilityFilter] = useState<string>('all')
  const [sortField, setSortField] = useState<SortField>('created_at')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [actionLoading, setActionLoading] = useState(false)

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  /* -- Debounced search -- */
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 300)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [search])

  /* -- Fetch -- */
  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('page', String(page))
      params.set('per_page', String(PER_PAGE))
      params.set('sort', sortField)
      params.set('dir', sortDir)
      if (debouncedSearch) params.set('q', debouncedSearch)
      if (entityFilter !== 'all') params.set('entity_type', entityFilter)
      if (visibilityFilter !== 'all') params.set('visibility', visibilityFilter)

      const res = await apiFetch<ContentListResponse>(`${apiBase}?${params.toString()}`)
      setItems(res.items ?? [])
      setTotal(res.total ?? 0)
    } catch {
      setItems([])
      setTotal(0)
    }
    setLoading(false)
  }, [apiBase, page, sortField, sortDir, debouncedSearch, entityFilter, visibilityFilter])

  useEffect(() => { fetchData() }, [fetchData])

  /* -- Reset selection when data changes -- */
  useEffect(() => { setSelected(new Set()) }, [items])

  /* -- Sort toggle -- */
  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDir('asc')
    }
    setPage(1)
  }

  const sortIcon = (field: SortField) => {
    if (sortField !== field) return 'bx-sort-alt-2'
    return sortDir === 'asc' ? 'bx-sort-up' : 'bx-sort-down'
  }

  /* -- Selection -- */
  const allSelected = items.length > 0 && items.every(i => selected.has(i.id))

  const toggleAll = () => {
    if (allSelected) {
      setSelected(new Set())
    } else {
      setSelected(new Set(items.map(i => i.id)))
    }
  }

  const toggleOne = (id: number) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  /* -- Row actions -- */
  const toggleVisibility = async (item: ContentItem) => {
    const nextVis = item.visibility === 'public' ? 'private' : 'public'
    try {
      await apiFetch(`${apiBase}/${item.id}/visibility`, {
        method: 'PATCH',
        body: JSON.stringify({ visibility: nextVis }),
      })
      await fetchData()
    } catch { /* silently fail */ }
  }

  const deleteItem = async (id: number) => {
    if (!confirm('Are you sure you want to delete this content?')) return
    try {
      await apiFetch(`${apiBase}/${id}`, { method: 'DELETE' })
      await fetchData()
    } catch { /* silently fail */ }
  }

  /* -- Bulk actions -- */
  const bulkAction = async (action: 'publish' | 'unpublish' | 'delete') => {
    if (action === 'delete' && !confirm(`Delete ${selected.size} item(s)?`)) return
    setActionLoading(true)
    try {
      await apiFetch(`${apiBase}/bulk`, {
        method: 'POST',
        body: JSON.stringify({ ids: Array.from(selected), action }),
      })
      setSelected(new Set())
      await fetchData()
    } catch { /* silently fail */ }
    setActionLoading(false)
  }

  /* -- Pagination -- */
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE))

  /* -- Helpers -- */
  const fmtDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
    } catch {
      return iso
    }
  }

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* -- Toolbar: search + filters -- */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1 1 220px', maxWidth: 360 }}>
          <i
            className="bx bx-search"
            style={{
              position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)',
              fontSize: 16, color: 'var(--color-fg-dim)', pointerEvents: 'none',
            }}
          />
          <input
            style={{ ...inputSt, paddingLeft: 32 }}
            placeholder="Search content..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <select
          style={selectSt}
          value={entityFilter}
          onChange={e => { setEntityFilter(e.target.value); setPage(1) }}
        >
          {ENTITY_TYPE_OPTIONS.map(o => (
            <option key={o} value={o}>
              {o === 'all' ? 'All Types' : ENTITY_TYPE_LABELS[o] ?? o}
            </option>
          ))}
        </select>

        <select
          style={selectSt}
          value={visibilityFilter}
          onChange={e => { setVisibilityFilter(e.target.value); setPage(1) }}
        >
          {VISIBILITY_OPTIONS.map(o => (
            <option key={o} value={o}>
              {o === 'all' ? 'All Visibility' : o.charAt(0).toUpperCase() + o.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* -- Bulk action bar -- */}
      {selected.size > 0 && (
        <div
          style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
            borderRadius: 10, border: '1px solid var(--color-border)',
            background: 'var(--color-bg-alt)',
          }}
        >
          <span style={{ fontSize: 13, color: 'var(--color-fg-dim)', marginRight: 4 }}>
            {selected.size} selected
          </span>
          <button
            style={{ ...btnSt, background: '#22c55e', color: '#fff', border: 'none' }}
            disabled={actionLoading}
            onClick={() => bulkAction('publish')}
          >
            Publish All
          </button>
          <button
            style={{ ...btnSt, background: '#f59e0b', color: '#fff', border: 'none' }}
            disabled={actionLoading}
            onClick={() => bulkAction('unpublish')}
          >
            Unpublish All
          </button>
          <button
            style={{ ...btnSt, background: '#ef4444', color: '#fff', border: 'none' }}
            disabled={actionLoading}
            onClick={() => bulkAction('delete')}
          >
            <i className="bx bx-trash" style={{ fontSize: 14 }} />
            Delete Selected
          </button>
        </div>
      )}

      {/* -- Table -- */}
      <div
        style={{
          borderRadius: 12,
          border: '1px solid var(--color-border)',
          overflow: 'auto',
          background: 'var(--color-bg)',
        }}
      >
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            minWidth: 800,
          }}
        >
          <thead>
            <tr>
              <th style={{ ...thSt, width: 40, cursor: 'default' }}>
                <input
                  type="checkbox"
                  style={checkboxSt}
                  checked={allSelected}
                  onChange={toggleAll}
                />
              </th>
              <th style={thSt} onClick={() => toggleSort('title')}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  Title
                  <i className={`bx ${sortIcon('title')}`} style={{ fontSize: 14 }} />
                </span>
              </th>
              <th style={thSt} onClick={() => toggleSort('entity_type')}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  Type
                  <i className={`bx ${sortIcon('entity_type')}`} style={{ fontSize: 14 }} />
                </span>
              </th>
              <th style={{ ...thSt, cursor: 'default' }}>Author</th>
              <th style={thSt} onClick={() => toggleSort('visibility')}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  Visibility
                  <i className={`bx ${sortIcon('visibility')}`} style={{ fontSize: 14 }} />
                </span>
              </th>
              <th style={thSt} onClick={() => toggleSort('views_count')}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  Views
                  <i className={`bx ${sortIcon('views_count')}`} style={{ fontSize: 14 }} />
                </span>
              </th>
              <th style={thSt} onClick={() => toggleSort('created_at')}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  Created
                  <i className={`bx ${sortIcon('created_at')}`} style={{ fontSize: 14 }} />
                </span>
              </th>
              <th style={{ ...thSt, width: 110, cursor: 'default', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} style={{ ...cellSt, textAlign: 'center', padding: '40px 14px', color: 'var(--color-fg-dim)' }}>
                  Loading...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ ...cellSt, textAlign: 'center', padding: '40px 14px', color: 'var(--color-fg-dim)' }}>
                  No content found.
                </td>
              </tr>
            ) : (
              items.map(item => (
                <tr
                  key={item.id}
                  style={{
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--color-bg-alt)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
                >
                  {/* Checkbox */}
                  <td style={{ ...cellSt, width: 40 }}>
                    <input
                      type="checkbox"
                      style={checkboxSt}
                      checked={selected.has(item.id)}
                      onChange={() => toggleOne(item.id)}
                    />
                  </td>

                  {/* Title + description */}
                  <td style={{ ...cellSt, maxWidth: 280, whiteSpace: 'normal' }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-fg)', lineHeight: 1.3 }}>
                      {item.title}
                    </div>
                    {item.description && (
                      <div
                        style={{
                          fontSize: 12, color: 'var(--color-fg-dim)', marginTop: 2,
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 260,
                        }}
                      >
                        {item.description}
                      </div>
                    )}
                  </td>

                  {/* Entity type badge */}
                  <td style={cellSt}>
                    <span style={badgeSt(ENTITY_TYPE_COLORS[item.entity_type] ?? '#6b7280')}>
                      {ENTITY_TYPE_LABELS[item.entity_type] ?? item.entity_type}
                    </span>
                  </td>

                  {/* Author */}
                  <td style={cellSt}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {item.author_avatar ? (
                        <img
                          src={uploadUrl(item.author_avatar)}
                          alt=""
                          style={{ width: 24, height: 24, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                        />
                      ) : (
                        <div
                          style={{
                            width: 24, height: 24, borderRadius: '50%',
                            background: 'var(--color-bg-alt)', display: 'flex',
                            alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                          }}
                        >
                          <i className="bx bx-user" style={{ fontSize: 14, color: 'var(--color-fg-dim)' }} />
                        </div>
                      )}
                      <span style={{ fontSize: 12, color: 'var(--color-fg)' }}>
                        {item.author_name || 'Unknown'}
                      </span>
                    </div>
                  </td>

                  {/* Visibility badge */}
                  <td style={cellSt}>
                    <span style={badgeSt(VISIBILITY_COLORS[item.visibility] ?? '#6b7280')}>
                      {item.visibility}
                    </span>
                  </td>

                  {/* Views */}
                  <td style={{ ...cellSt, fontVariantNumeric: 'tabular-nums' }}>
                    {item.views_count.toLocaleString()}
                  </td>

                  {/* Created at */}
                  <td style={{ ...cellSt, fontSize: 12, color: 'var(--color-fg-dim)' }}>
                    {fmtDate(item.created_at)}
                  </td>

                  {/* Row actions */}
                  <td style={{ ...cellSt, textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: 2 }}>
                      <button
                        style={iconBtnSt}
                        title="View"
                        onClick={() => window.open(`/content/${item.slug}`, '_blank')}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--color-accent, #00e5ff)' }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--color-fg-dim)' }}
                      >
                        <i className="bx bx-show" />
                      </button>
                      <button
                        style={iconBtnSt}
                        title={item.visibility === 'public' ? 'Make private' : 'Make public'}
                        onClick={() => toggleVisibility(item)}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#f59e0b' }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--color-fg-dim)' }}
                      >
                        <i className={`bx ${item.visibility === 'public' ? 'bx-lock-open-alt' : 'bx-lock-alt'}`} />
                      </button>
                      <button
                        style={iconBtnSt}
                        title="Delete"
                        onClick={() => deleteItem(item.id)}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#ef4444' }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--color-fg-dim)' }}
                      >
                        <i className="bx bx-trash" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* -- Pagination -- */}
      {!loading && total > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 12, color: 'var(--color-fg-dim)' }}>
            Page {page} of {totalPages} ({total} item{total !== 1 ? 's' : ''})
          </span>
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              style={{ ...btnSt, opacity: page <= 1 ? 0.4 : 1 }}
              disabled={page <= 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
            >
              <i className="bx bx-chevron-left" style={{ fontSize: 16 }} />
              Previous
            </button>
            <button
              style={{ ...btnSt, opacity: page >= totalPages ? 0.4 : 1 }}
              disabled={page >= totalPages}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            >
              Next
              <i className="bx bx-chevron-right" style={{ fontSize: 16 }} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
