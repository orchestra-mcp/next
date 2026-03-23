'use client'

import { use, useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/store/auth'
import { relativeTime } from '@/lib/mcp-parsers'
import ProfileSection from '@/components/profile/profile-section'

interface DocShare {
  id: number
  slug: string
  title: string
  description: string
  entity_type: string
  visibility: string
  updated_at: string
}

interface PageProps {
  params: Promise<{ handle: string }>
}

export default function PublicDocsPage(props: PageProps) {
  const { handle } = use(props.params)
  const { user } = useAuthStore()
  const [docs, setDocs] = useState<DocShare[]>([])
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState<number | null>(null)

  const isOwner = !!user && (user.username === handle || (user.settings?.handle as string) === handle)

  useEffect(() => {
    async function load() {
      try {
        const sb = createClient()
        let shares: DocShare[] = []
        if (isOwner) {
          const { data, error } = await sb.from('shares').select('*').eq('entity_type', 'doc').order('updated_at', { ascending: false })
          if (error) throw error
          shares = data ?? []
        } else {
          const { data, error } = await sb.from('shares').select('*').eq('author_handle', handle).eq('entity_type', 'doc').eq('visibility', 'public').order('updated_at', { ascending: false })
          if (error) throw error
          shares = data ?? []
        }
        setDocs(shares)
      } catch {
        setDocs([])
      }
      setLoading(false)
    }
    load()
  }, [handle, isOwner])

  async function toggleVisibility(e: React.MouseEvent, doc: DocShare) {
    e.preventDefault()
    e.stopPropagation()
    setToggling(doc.id)
    const newVis = doc.visibility === 'public' ? 'private' : 'public'
    try {
      const sb = createClient()
      const { error } = await sb.from('shares').update({ visibility: newVis }).eq('id', doc.id)
      if (error) throw error
      setDocs(prev => prev.map(d => d.id === doc.id ? { ...d, visibility: newVis } : d))
    } catch {}
    setToggling(null)
  }

  if (loading) {
    return (
      <ProfileSection title="Documentation" icon="bx-file">
        <p style={{ fontSize: 13, color: 'var(--color-fg-dim)' }}>Loading...</p>
      </ProfileSection>
    )
  }

  if (docs.length === 0) {
    return (
      <ProfileSection title="Documentation" icon="bx-file">
        <div style={{ padding: '40px 0', textAlign: 'center' }}>
          <i className="bx bx-file" style={{ fontSize: 40, color: 'var(--color-fg-dim)', display: 'block', marginBottom: 12 }} />
          <p style={{ fontSize: 14, color: 'var(--color-fg-dim)', margin: 0 }}>
            No {isOwner ? '' : 'public '}documentation
          </p>
        </div>
      </ProfileSection>
    )
  }

  return (
    <ProfileSection title="Documentation" icon="bx-file">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {docs.map((doc) => {
          const isPublic = doc.visibility === 'public'
          const isToggling = toggling === doc.id
          return (
            <div key={doc.id} style={{ position: 'relative' }}>
              <Link href={`/@${handle}/docs/${doc.slug}`} style={{ textDecoration: 'none', display: 'block' }}>
                <div
                  style={{
                    ...cardStyle,
                    borderColor: !isPublic && isOwner ? 'rgba(239,68,68,0.25)' : 'var(--color-border)',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = isPublic || !isOwner ? '#00e5ff' : '#ef4444' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = !isPublic && isOwner ? 'rgba(239,68,68,0.25)' : 'var(--color-border)' }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <i className="bx bx-file" style={{ fontSize: 18, color: '#00c853', marginTop: 2, flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-fg)', flex: 1, minWidth: 0 }}>
                          {doc.title}
                        </span>
                        {/* Owner visibility toggle on the card */}
                        {isOwner && (
                          <button
                            onClick={e => toggleVisibility(e, doc)}
                            disabled={isToggling}
                            title={isPublic ? 'Public — click to make private' : 'Private — click to make public'}
                            style={{
                              flexShrink: 0, display: 'flex', alignItems: 'center', gap: 4,
                              padding: '2px 7px', borderRadius: 5, border: 'none', cursor: isToggling ? 'wait' : 'pointer',
                              fontSize: 10, fontWeight: 600,
                              background: isPublic ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                              color: isPublic ? '#22c55e' : '#ef4444',
                              opacity: isToggling ? 0.5 : 1, transition: 'all 0.15s',
                            }}
                          >
                            <i className={`bx ${isPublic ? 'bx-globe' : 'bx-lock-alt'}`} style={{ fontSize: 10 }} />
                            {isPublic ? 'Public' : 'Private'}
                          </button>
                        )}
                      </div>
                      {doc.description && <p style={descriptionStyle}>{doc.description}</p>}
                      <span style={{ fontSize: 11, color: 'var(--color-fg-dim)' }}>
                        Updated {relativeTime(doc.updated_at)}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          )
        })}
      </div>
    </ProfileSection>
  )
}

const cardStyle: React.CSSProperties = {
  borderRadius: 10, border: '1px solid var(--color-border)',
  background: 'var(--color-bg)', padding: 16,
  transition: 'border-color 0.15s ease', cursor: 'pointer',
}

const descriptionStyle: React.CSSProperties = {
  fontSize: 13, color: 'var(--color-fg-dim)', margin: '0 0 6px',
  display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
  overflow: 'hidden', lineHeight: '1.45',
}
