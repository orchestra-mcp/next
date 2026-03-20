'use client'

import { useState } from 'react'

interface ApiEndpoint {
  id: string
  name: string
  method: string
  path: string
  headers: any
  query_params: any
  body: string
  body_type: string
  description: string
  sort_order: number
  folder_path: string
}

interface ApiDocRendererProps {
  endpoints: ApiEndpoint[]
  baseUrl?: string
}

const METHOD_COLORS: Record<string, string> = {
  GET: '#22c55e',
  POST: '#3b82f6',
  PUT: '#f59e0b',
  PATCH: '#a855f7',
  DELETE: '#ef4444',
  HEAD: '#6b7280',
  OPTIONS: '#6b7280',
}

function parseParams(raw: any): { key: string; value: string; description: string }[] {
  if (!raw) return []
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }
  return Array.isArray(raw) ? raw : []
}

function groupByFolder(endpoints: ApiEndpoint[]): Map<string, ApiEndpoint[]> {
  const sorted = [...endpoints].sort((a, b) => a.sort_order - b.sort_order)
  const groups = new Map<string, ApiEndpoint[]>()

  for (const ep of sorted) {
    const folder = ep.folder_path || ''
    if (!groups.has(folder)) {
      groups.set(folder, [])
    }
    groups.get(folder)!.push(ep)
  }

  return groups
}

function formatBody(body: string): string {
  if (!body) return ''
  try {
    const parsed = JSON.parse(body)
    return JSON.stringify(parsed, null, 2)
  } catch {
    return body
  }
}

export function ApiDocRenderer({ endpoints, baseUrl }: ApiDocRendererProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  if (endpoints.length === 0) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <i
          className="bx bx-file-blank"
          style={{ fontSize: 32, color: 'var(--color-fg-dim)', display: 'block', marginBottom: 8 }}
        />
        <p style={{ fontSize: 13, color: 'var(--color-fg-dim)', margin: 0 }}>
          No endpoints documented
        </p>
      </div>
    )
  }

  const groups = groupByFolder(endpoints)

  function toggle(id: string) {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {Array.from(groups.entries()).map(([folder, eps]) => (
        <div key={folder}>
          {/* Folder header (only for non-root) */}
          {folder && (
            <div style={folderHeaderStyle}>
              <i className="bx bx-folder" style={{ fontSize: 14, color: 'var(--color-fg-dim)' }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-fg)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                {folder}
              </span>
            </div>
          )}

          {/* Endpoints in this folder */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {eps.map((ep) => {
              const isOpen = expanded[ep.id] ?? false
              const methodColor = METHOD_COLORS[ep.method.toUpperCase()] ?? '#6b7280'
              const headers = parseParams(ep.headers)
              const queryParams = parseParams(ep.query_params)
              const allParams = [
                ...headers.map((h) => ({ ...h, source: 'Header' })),
                ...queryParams.map((q) => ({ ...q, source: 'Query' })),
              ]
              const hasBody = ep.body && ep.body_type !== 'none'
              const fullUrl = baseUrl ? `${baseUrl}${ep.path}` : ep.path

              return (
                <div key={ep.id} style={endpointCardStyle}>
                  {/* Collapsed row (always visible) */}
                  <div
                    style={collapsedRowStyle}
                    onClick={() => toggle(ep.id)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
                      <span style={{ ...methodBadgeStyle, background: methodColor }}>
                        {ep.method.toUpperCase()}
                      </span>
                      <code style={pathStyle}>{ep.path}</code>
                      {ep.name && (
                        <span style={endpointNameStyle}>{ep.name}</span>
                      )}
                    </div>
                    <i
                      className={`bx bx-chevron-${isOpen ? 'up' : 'down'}`}
                      style={{ fontSize: 18, color: 'var(--color-fg-dim)', flexShrink: 0 }}
                    />
                  </div>

                  {/* Expanded content */}
                  {isOpen && (
                    <div style={expandedStyle}>
                      {/* Full URL */}
                      <div style={{ marginBottom: 14 }}>
                        <span style={sectionLabelStyle}>URL</span>
                        <code style={fullUrlStyle}>{fullUrl}</code>
                      </div>

                      {/* Description */}
                      {ep.description && (
                        <div style={{ marginBottom: 14 }}>
                          <span style={sectionLabelStyle}>Description</span>
                          <p style={{ fontSize: 13, color: 'var(--color-fg)', margin: '4px 0 0', lineHeight: '1.5' }}>
                            {ep.description}
                          </p>
                        </div>
                      )}

                      {/* Parameters table */}
                      {allParams.length > 0 && (
                        <div style={{ marginBottom: 14 }}>
                          <span style={sectionLabelStyle}>Parameters</span>
                          <div style={tableContainerStyle}>
                            <table style={tableStyle}>
                              <thead>
                                <tr>
                                  <th style={thStyle}>Name</th>
                                  <th style={thStyle}>Value / Type</th>
                                  <th style={thStyle}>Description</th>
                                </tr>
                              </thead>
                              <tbody>
                                {allParams.map((p, i) => (
                                  <tr key={i}>
                                    <td style={tdStyle}>
                                      <code style={paramNameStyle}>{p.key}</code>
                                      <span style={paramSourceStyle}>{p.source}</span>
                                    </td>
                                    <td style={tdStyle}>
                                      <span style={{ fontSize: 12, color: 'var(--color-fg)' }}>
                                        {p.value || '\u2014'}
                                      </span>
                                    </td>
                                    <td style={tdStyle}>
                                      <span style={{ fontSize: 12, color: 'var(--color-fg-dim)' }}>
                                        {p.description || '\u2014'}
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {/* Request body */}
                      {hasBody && (
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                            <span style={sectionLabelStyle}>Request Body</span>
                            <span style={bodyTypeBadgeStyle}>{ep.body_type}</span>
                          </div>
                          <pre style={codeBlockStyle}>
                            <code>{formatBody(ep.body)}</code>
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

/* ── Styles ── */

const folderHeaderStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  padding: '8px 0',
  marginBottom: 4,
  marginTop: 10,
}

const endpointCardStyle: React.CSSProperties = {
  borderRadius: 10,
  border: '1px solid var(--color-border)',
  background: 'var(--color-bg)',
  overflow: 'hidden',
}

const collapsedRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '10px 14px',
  cursor: 'pointer',
  gap: 10,
}

const methodBadgeStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 10,
  fontWeight: 600,
  textTransform: 'uppercase',
  color: '#fff',
  borderRadius: 6,
  padding: '3px 8px',
  minWidth: 52,
  textAlign: 'center',
  flexShrink: 0,
  letterSpacing: '0.02em',
}

const pathStyle: React.CSSProperties = {
  fontSize: 13,
  fontFamily: 'monospace',
  color: 'var(--color-fg)',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
}

const endpointNameStyle: React.CSSProperties = {
  fontSize: 12,
  color: 'var(--color-fg-dim)',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  flexShrink: 1,
}

const expandedStyle: React.CSSProperties = {
  padding: '0 14px 14px',
  borderTop: '1px solid var(--color-border)',
  paddingTop: 14,
}

const sectionLabelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 11,
  fontWeight: 600,
  color: 'var(--color-fg-dim)',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  marginBottom: 4,
}

const fullUrlStyle: React.CSSProperties = {
  fontSize: 12,
  fontFamily: 'monospace',
  color: 'var(--color-fg-dim)',
  wordBreak: 'break-all',
}

const tableContainerStyle: React.CSSProperties = {
  overflowX: 'auto',
  marginTop: 4,
}

const tableStyle: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: 12,
}

const thStyle: React.CSSProperties = {
  textAlign: 'left',
  fontSize: 11,
  fontWeight: 600,
  color: 'var(--color-fg-dim)',
  textTransform: 'uppercase',
  letterSpacing: '0.03em',
  padding: '6px 10px',
  background: 'var(--color-bg-alt)',
  borderBottom: '1px solid var(--color-border)',
}

const tdStyle: React.CSSProperties = {
  padding: '7px 10px',
  borderBottom: '1px solid var(--color-border)',
  verticalAlign: 'top',
}

const paramNameStyle: React.CSSProperties = {
  fontSize: 12,
  fontFamily: 'monospace',
  color: 'var(--color-fg)',
  fontWeight: 600,
}

const paramSourceStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 10,
  color: 'var(--color-fg-dim)',
  marginTop: 1,
}

const bodyTypeBadgeStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  fontSize: 10,
  fontWeight: 600,
  color: 'var(--color-fg-dim)',
  background: 'var(--color-bg-alt)',
  borderRadius: 6,
  padding: '2px 7px',
  textTransform: 'lowercase',
}

const codeBlockStyle: React.CSSProperties = {
  fontSize: 12,
  fontFamily: 'monospace',
  background: 'var(--color-bg-alt)',
  borderRadius: 8,
  padding: 14,
  overflowX: 'auto',
  maxHeight: 300,
  margin: 0,
  color: 'var(--color-fg)',
  lineHeight: '1.5',
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
}
