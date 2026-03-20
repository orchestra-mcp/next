'use client'

import { useState } from 'react'
import Link from 'next/link'

interface DocItem {
  id: number
  slug: string
  title: string
  entity_type: string
  description?: string
  updated_at: string
}

interface DocSidebarProps {
  docs: DocItem[]
  handle: string
  activeSlug?: string
}

export function DocSidebar({ docs, handle, activeSlug }: DocSidebarProps) {
  const [search, setSearch] = useState('')

  const filtered = search
    ? docs.filter(
        (d) =>
          d.title.toLowerCase().includes(search.toLowerCase()) ||
          d.description?.toLowerCase().includes(search.toLowerCase())
      )
    : docs

  return (
    <nav style={sidebarStyle}>
      {/* Search */}
      <div style={{ padding: '12px 14px 8px' }}>
        <div style={searchWrapStyle}>
          <i className="bx bx-search" style={{ fontSize: 14, color: 'var(--color-fg-dim)' }} />
          <input
            type="text"
            placeholder="Search docs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={searchInputStyle}
          />
        </div>
      </div>

      {/* Doc list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '4px 8px 12px' }}>
        {filtered.length === 0 ? (
          <p style={{ fontSize: 12, color: 'var(--color-fg-dim)', textAlign: 'center', padding: 20 }}>
            {search ? 'No matching docs' : 'No docs'}
          </p>
        ) : (
          filtered.map((doc) => {
            const isActive = doc.slug === activeSlug
            return (
              <Link
                key={doc.id}
                href={`/@${handle}/docs/${doc.slug}`}
                style={{
                  ...itemStyle,
                  background: isActive ? 'var(--color-bg-active)' : 'transparent',
                  borderLeft: isActive ? '2px solid #00e5ff' : '2px solid transparent',
                }}
              >
                <span style={{ fontSize: 13, fontWeight: isActive ? 600 : 400, color: 'var(--color-fg)' }}>
                  {doc.title}
                </span>
                {doc.description && (
                  <span style={descStyle}>
                    {doc.description.length > 60 ? doc.description.slice(0, 60) + '...' : doc.description}
                  </span>
                )}
              </Link>
            )
          })
        )}
      </div>
    </nav>
  )
}

const sidebarStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  borderRadius: 12,
  border: '1px solid var(--color-border)',
  background: 'var(--color-bg)',
  height: 'fit-content',
  maxHeight: 'calc(100vh - 200px)',
  position: 'sticky',
  top: 100,
}

const searchWrapStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  background: 'var(--color-bg-alt)',
  borderRadius: 8,
  padding: '6px 10px',
}

const searchInputStyle: React.CSSProperties = {
  flex: 1,
  background: 'transparent',
  border: 'none',
  outline: 'none',
  fontSize: 12,
  color: 'var(--color-fg)',
}

const itemStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
  padding: '8px 12px',
  borderRadius: 6,
  textDecoration: 'none',
  transition: 'background 0.1s ease',
}

const descStyle: React.CSSProperties = {
  fontSize: 11,
  color: 'var(--color-fg-dim)',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
}
