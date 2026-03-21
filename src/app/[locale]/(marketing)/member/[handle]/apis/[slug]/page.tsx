'use client'

import { use, useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { apiFetch } from '@/lib/api'
import { JsonLd } from '@/components/content/json-ld'
import { buildJsonLd } from '@/lib/seo'
import { useProfileTheme } from '@/components/profile/use-profile-theme'

interface ApiCollection {
  id: number
  name: string
  slug: string
  description: string
  base_url: string
  auth_type: string
  visibility: string
  version: string
}

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

interface PageProps {
  params: Promise<{ handle: string; slug: string }>
}

const METHOD_COLORS: Record<string, string> = {
  GET: '#22c55e', POST: '#3b82f6', PUT: '#f59e0b',
  PATCH: '#a855f7', DELETE: '#ef4444', HEAD: '#6b7280', OPTIONS: '#6b7280',
}

const AUTH_LABELS: Record<string, { label: string; icon: string; color: string }> = {
  bearer: { label: 'Bearer Token', icon: 'bx-key', color: '#22c55e' },
  api_key: { label: 'API Key', icon: 'bx-lock-alt', color: '#3b82f6' },
  basic: { label: 'Basic Auth', icon: 'bx-user-check', color: '#f59e0b' },
  oauth2: { label: 'OAuth 2.0', icon: 'bx-shield-alt-2', color: '#a855f7' },
  none: { label: 'No Auth', icon: 'bx-lock-open', color: '#6b7280' },
}

function parseParams(raw: any): { key: string; value: string; description: string }[] {
  if (!raw) return []
  if (typeof raw === 'string') { try { const p = JSON.parse(raw); return Array.isArray(p) ? p : [] } catch { return [] } }
  return Array.isArray(raw) ? raw : []
}

function formatBody(body: string): string {
  if (!body) return ''
  try { return JSON.stringify(JSON.parse(body), null, 2) } catch { return body }
}

function groupByFolder(endpoints: ApiEndpoint[]): Map<string, ApiEndpoint[]> {
  const sorted = [...endpoints].sort((a, b) => a.sort_order - b.sort_order)
  const groups = new Map<string, ApiEndpoint[]>()
  for (const ep of sorted) {
    const folder = ep.folder_path || ''
    if (!groups.has(folder)) groups.set(folder, [])
    groups.get(folder)!.push(ep)
  }
  return groups
}

export default function PublicApiCollectionDetailPage(props: PageProps) {
  const { handle, slug } = use(props.params)
  const { colors } = useProfileTheme()
  const [collection, setCollection] = useState<ApiCollection | null>(null)
  const [endpoints, setEndpoints] = useState<ApiEndpoint[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [copied, setCopied] = useState<string | null>(null)
  const endpointRefs = useRef<Record<string, HTMLDivElement | null>>({})

  useEffect(() => {
    async function load() {
      try {
        const res = await apiFetch<{ collection: ApiCollection; endpoints: ApiEndpoint[] }>(
          `/api/public/api-collections/${handle}/${slug}`
        )
        setCollection(res.collection)
        const eps = res.endpoints ?? []
        setEndpoints(eps)
        if (eps.length > 0) setActiveId(eps[0].id)
      } catch {
        setNotFound(true)
      }
      setLoading(false)
    }
    load()
  }, [handle, slug])

  function scrollTo(id: string) {
    setActiveId(id)
    setExpanded(prev => ({ ...prev, [id]: true }))
    endpointRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function copyToClipboard(text: string, key: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key)
      setTimeout(() => setCopied(null), 1500)
    })
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 80 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', border: `2px solid ${colors.accent}`, borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
          <p style={{ fontSize: 13, color: colors.textMuted }}>Loading API docs…</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  if (notFound || !collection) {
    return (
      <div style={{ padding: 80, textAlign: 'center' }}>
        <i className="bx bx-error-circle" style={{ fontSize: 40, color: colors.textMuted, display: 'block', marginBottom: 16 }} />
        <p style={{ fontSize: 15, fontWeight: 600, color: colors.textPrimary, margin: '0 0 8px' }}>Collection not found</p>
        <Link href={`/@${handle}/apis`} style={{ fontSize: 13, color: colors.accent, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <i className="bx bx-arrow-back" /> Back to APIs
        </Link>
      </div>
    )
  }

  const groups = groupByFolder(endpoints)
  const authInfo = AUTH_LABELS[collection.auth_type] ?? AUTH_LABELS.none

  return (
    <div style={{ display: 'flex', gap: 0, alignItems: 'flex-start' }}>
      {/* ── Left sidebar ── */}
      <aside style={{
        width: 240, flexShrink: 0, marginRight: 24,
        position: 'sticky', top: 80,
        maxHeight: 'calc(100vh - 120px)', overflowY: 'auto',
        borderRadius: 12, border: `1px solid ${colors.cardBorder}`,
        background: colors.cardBg,
      }}>
        {/* Collection info */}
        <div style={{ padding: '14px 14px 12px', borderBottom: `1px solid ${colors.cardBorder}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            <i className="bx bx-collection" style={{ fontSize: 14, color: colors.accent }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: colors.textPrimary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {collection.name}
            </span>
            {collection.version && (
              <span style={{ fontSize: 9, fontWeight: 700, color: colors.textMuted, background: colors.cardBorder, borderRadius: 4, padding: '1px 5px', flexShrink: 0 }}>
                {collection.version}
              </span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: authInfo.color }}>
            <i className={`bx ${authInfo.icon}`} style={{ fontSize: 12 }} />
            {authInfo.label}
          </div>
        </div>

        {/* Endpoint list */}
        <div style={{ padding: '8px 6px' }}>
          {Array.from(groups.entries()).map(([folder, eps]) => (
            <div key={folder}>
              {folder && (
                <div style={{ padding: '8px 8px 4px', fontSize: 10, fontWeight: 700, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <i className="bx bx-folder" style={{ fontSize: 12 }} />{folder}
                </div>
              )}
              {eps.map(ep => {
                const isActive = activeId === ep.id
                const mc = METHOD_COLORS[ep.method.toUpperCase()] ?? '#6b7280'
                return (
                  <button key={ep.id} onClick={() => scrollTo(ep.id)} style={{
                    display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '6px 8px', borderRadius: 7,
                    background: isActive ? `${colors.accent}12` : 'transparent',
                    border: 'none', cursor: 'pointer', textAlign: 'left',
                    borderLeft: isActive ? `2px solid ${colors.accent}` : '2px solid transparent',
                    marginBottom: 1, transition: 'all 0.1s',
                  }}
                  onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = colors.hoverBg }}
                  onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
                  >
                    <span style={{ fontSize: 9, fontWeight: 700, color: mc, background: `${mc}18`, borderRadius: 4, padding: '1px 5px', flexShrink: 0, fontFamily: 'monospace', minWidth: 36, textAlign: 'center' }}>
                      {ep.method.toUpperCase()}
                    </span>
                    <span style={{ fontSize: 12, color: isActive ? colors.textPrimary : colors.textBody, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'monospace' }}>
                      {ep.path}
                    </span>
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      </aside>

      {/* ── Main content ── */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20 }}>
          <Link href={`/@${handle}/apis`} style={{ fontSize: 12, color: colors.textMuted, textDecoration: 'none' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = colors.textPrimary }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = colors.textMuted }}
          >API Collections</Link>
          <i className="bx bx-chevron-right" style={{ fontSize: 13, color: colors.textMuted }} />
          <span style={{ fontSize: 12, color: colors.textPrimary, fontWeight: 600 }}>{collection.name}</span>
        </div>

        {/* Collection header card */}
        <div style={{ borderRadius: 14, border: `1px solid ${colors.cardBorder}`, background: colors.cardBg, padding: '20px 24px', marginBottom: 24, position: 'relative', overflow: 'hidden' }}>
          {/* Accent glow */}
          <div style={{ position: 'absolute', top: -40, right: -40, width: 120, height: 120, borderRadius: '50%', background: `${colors.accent}08`, pointerEvents: 'none' }} />
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, flexWrap: 'wrap' }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: 22, fontWeight: 800, color: colors.textPrimary, margin: 0, letterSpacing: '-0.02em' }}>{collection.name}</h1>
                {collection.version && (
                  <span style={{ fontSize: 11, fontWeight: 600, color: colors.textMuted, background: `${colors.cardBorder}`, borderRadius: 6, padding: '2px 8px' }}>{collection.version}</span>
                )}
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, color: authInfo.color, background: `${authInfo.color}14`, borderRadius: 20, padding: '3px 10px' }}>
                  <i className={`bx ${authInfo.icon}`} style={{ fontSize: 11 }} />{authInfo.label}
                </span>
              </div>
              {collection.description && (
                <p style={{ fontSize: 14, color: colors.textMuted, margin: '0 0 12px', lineHeight: 1.5 }}>{collection.description}</p>
              )}
              {collection.base_url && (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(0,0,0,0.25)', borderRadius: 8, padding: '7px 12px', border: `1px solid ${colors.cardBorder}` }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Base URL</span>
                  <code style={{ fontSize: 12, fontFamily: 'monospace', color: colors.accent }}>{collection.base_url}</code>
                  <button onClick={() => copyToClipboard(collection.base_url, 'base')} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: colors.textMuted, display: 'flex', alignItems: 'center', padding: 0 }}>
                    <i className={`bx ${copied === 'base' ? 'bx-check' : 'bx-copy'}`} style={{ fontSize: 14, color: copied === 'base' ? colors.success : colors.textMuted }} />
                  </button>
                </div>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 12, color: colors.textMuted }}>{endpoints.length} endpoint{endpoints.length !== 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>

        {/* Endpoints */}
        {endpoints.length === 0 ? (
          <div style={{ padding: '60px 0', textAlign: 'center' }}>
            <i className="bx bx-file-blank" style={{ fontSize: 36, color: colors.textMuted, display: 'block', marginBottom: 12 }} />
            <p style={{ fontSize: 13, color: colors.textMuted }}>No endpoints documented yet.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {Array.from(groups.entries()).map(([folder, eps]) => (
              <div key={folder} style={{ marginBottom: 24 }}>
                {folder && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <i className="bx bx-folder-open" style={{ fontSize: 14, color: colors.accent }} />
                    <span style={{ fontSize: 13, fontWeight: 700, color: colors.textPrimary, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{folder}</span>
                    <div style={{ flex: 1, height: 1, background: colors.cardBorder }} />
                  </div>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {eps.map(ep => {
                    const isOpen = expanded[ep.id] ?? false
                    const isActive = activeId === ep.id
                    const mc = METHOD_COLORS[ep.method.toUpperCase()] ?? '#6b7280'
                    const headers = parseParams(ep.headers)
                    const queryParams = parseParams(ep.query_params)
                    const fullUrl = collection.base_url ? `${collection.base_url}${ep.path}` : ep.path
                    const hasBody = ep.body && ep.body_type !== 'none'

                    return (
                      <div
                        key={ep.id}
                        ref={el => { endpointRefs.current[ep.id] = el }}
                        style={{
                          borderRadius: 12,
                          border: `1px solid ${isActive ? `${colors.accent}40` : colors.cardBorder}`,
                          background: colors.cardBg,
                          overflow: 'hidden',
                          transition: 'border-color 0.15s',
                          scrollMarginTop: 100,
                        }}
                      >
                        {/* Row */}
                        <div
                          style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', cursor: 'pointer' }}
                          onClick={() => {
                            setActiveId(ep.id)
                            setExpanded(prev => ({ ...prev, [ep.id]: !prev[ep.id] }))
                          }}
                        >
                          <span style={{
                            fontSize: 10, fontWeight: 700, color: '#fff', background: mc,
                            borderRadius: 6, padding: '3px 10px', minWidth: 58, textAlign: 'center',
                            fontFamily: 'monospace', flexShrink: 0, letterSpacing: '0.02em',
                          }}>{ep.method.toUpperCase()}</span>
                          <code style={{ fontSize: 13, fontFamily: 'monospace', color: colors.textPrimary, flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {ep.path}
                          </code>
                          {ep.name && (
                            <span style={{ fontSize: 12, color: colors.textMuted, flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 160 }}>{ep.name}</span>
                          )}
                          <i className={`bx bx-chevron-${isOpen ? 'up' : 'down'}`} style={{ fontSize: 18, color: colors.textMuted, flexShrink: 0 }} />
                        </div>

                        {/* Expanded */}
                        {isOpen && (
                          <div style={{ borderTop: `1px solid ${colors.cardBorder}`, padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {/* Full URL */}
                            <div>
                              <div style={{ fontSize: 11, fontWeight: 700, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Full URL</div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(0,0,0,0.25)', borderRadius: 8, padding: '8px 12px', border: `1px solid ${colors.cardBorder}` }}>
                                <code style={{ fontSize: 13, fontFamily: 'monospace', color: colors.accent, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', wordBreak: 'break-all' }}>{fullUrl}</code>
                                <button onClick={() => copyToClipboard(fullUrl, ep.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', color: colors.textMuted, padding: 0 }}>
                                  <i className={`bx ${copied === ep.id ? 'bx-check' : 'bx-copy'}`} style={{ fontSize: 14, color: copied === ep.id ? colors.success : colors.textMuted }} />
                                </button>
                              </div>
                            </div>

                            {/* Description */}
                            {ep.description && (
                              <div>
                                <div style={{ fontSize: 11, fontWeight: 700, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Description</div>
                                <p style={{ fontSize: 14, color: colors.textBody, margin: 0, lineHeight: 1.6 }}>{ep.description}</p>
                              </div>
                            )}

                            {/* Headers */}
                            {headers.length > 0 && (
                              <div>
                                <div style={{ fontSize: 11, fontWeight: 700, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Headers</div>
                                <ParamTable params={headers} colors={colors} />
                              </div>
                            )}

                            {/* Query Params */}
                            {queryParams.length > 0 && (
                              <div>
                                <div style={{ fontSize: 11, fontWeight: 700, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Query Parameters</div>
                                <ParamTable params={queryParams} colors={colors} />
                              </div>
                            )}

                            {/* Request Body */}
                            {hasBody && (
                              <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                  <span style={{ fontSize: 11, fontWeight: 700, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Request Body</span>
                                  <span style={{ fontSize: 10, fontWeight: 600, color: colors.textMuted, background: colors.cardBorder, borderRadius: 5, padding: '1px 6px' }}>{ep.body_type}</span>
                                </div>
                                <pre style={{ background: 'rgba(0,0,0,0.3)', border: `1px solid ${colors.cardBorder}`, borderRadius: 10, padding: '14px 16px', overflowX: 'auto', margin: 0, maxHeight: 300 }}>
                                  <code style={{ fontSize: 12, fontFamily: 'monospace', color: '#e2e8f0', lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{formatBody(ep.body)}</code>
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
        )}

        <JsonLd data={buildJsonLd({ title: collection.name, description: collection.description, handle, type: 'apis', slug })} />
      </div>
    </div>
  )
}

function ParamTable({ params, colors }: { params: { key: string; value: string; description: string }[]; colors: any }) {
  return (
    <div style={{ borderRadius: 8, border: `1px solid ${colors.cardBorder}`, overflow: 'hidden' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ background: 'rgba(0,0,0,0.2)' }}>
            <th style={{ padding: '7px 12px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: `1px solid ${colors.cardBorder}` }}>Name</th>
            <th style={{ padding: '7px 12px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: `1px solid ${colors.cardBorder}` }}>Value</th>
            <th style={{ padding: '7px 12px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: `1px solid ${colors.cardBorder}` }}>Description</th>
          </tr>
        </thead>
        <tbody>
          {params.map((p, i) => (
            <tr key={i}>
              <td style={{ padding: '8px 12px', borderBottom: i < params.length - 1 ? `1px solid ${colors.cardBorder}` : 'none', verticalAlign: 'top' }}>
                <code style={{ fontSize: 12, fontFamily: 'monospace', color: colors.accent, fontWeight: 600 }}>{p.key}</code>
              </td>
              <td style={{ padding: '8px 12px', borderBottom: i < params.length - 1 ? `1px solid ${colors.cardBorder}` : 'none', verticalAlign: 'top' }}>
                <span style={{ fontSize: 13, color: colors.textBody }}>{p.value || '—'}</span>
              </td>
              <td style={{ padding: '8px 12px', borderBottom: i < params.length - 1 ? `1px solid ${colors.cardBorder}` : 'none', verticalAlign: 'top' }}>
                <span style={{ fontSize: 13, color: colors.textMuted }}>{p.description || '—'}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
