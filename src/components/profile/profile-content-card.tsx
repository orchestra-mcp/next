'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { apiFetch } from '@/lib/api'

interface ShareItem {
  id: number
  title: string
  slug: string
  entity_type: string
  visibility: string
}

interface Section {
  type: 'doc' | 'api_collection' | 'presentation'
  label: string
  icon: string
  color: string
  path: string
}

const SECTIONS: Section[] = [
  { type: 'doc',            label: 'Docs',         icon: 'bx-file',       color: '#00c853', path: 'docs' },
  { type: 'api_collection', label: 'APIs',         icon: 'bx-collection', color: '#3b82f6', path: 'apis' },
  { type: 'presentation',   label: 'Slides',       icon: 'bx-slideshow',  color: '#a900ff', path: 'slides' },
]

interface Props {
  handle: string
}

export default function ProfileContentCard({ handle }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const [shares, setShares] = useState<ShareItem[]>([])
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState<number | null>(null)
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const res = await apiFetch<{ shares: ShareItem[] }>('/api/community/shares')
        setShares(res.shares ?? [])
      } catch {
        setShares([])
      }
      setLoading(false)
    }
    load()
  }, [])

  async function toggleVisibility(share: ShareItem) {
    setToggling(share.id)
    const newVis = share.visibility === 'public' ? 'private' : 'public'
    try {
      await apiFetch(`/api/community/shares/${share.id}`, {
        method: 'PUT',
        body: JSON.stringify({ visibility: newVis }),
      })
      setShares(prev => prev.map(s => s.id === share.id ? { ...s, visibility: newVis } : s))
    } catch {}
    setToggling(null)
  }

  function currentSection(): string | null {
    const clean = pathname.replace(/^\/(en|ar)/, '').replace(`/member/${handle}`, `/@${handle}`)
    for (const s of SECTIONS) {
      if (clean.startsWith(`/@${handle}/${s.path}`)) return s.type
    }
    return null
  }

  const active = currentSection()

  const cardSt: React.CSSProperties = {
    borderRadius: 14,
    border: '1px solid var(--color-border, rgba(255,255,255,0.06))',
    background: 'var(--color-bg-alt, rgba(255,255,255,0.03))',
    overflow: 'hidden',
  }

  return (
    <div className="sb-card" style={cardSt}>
      {/* Header */}
      <div style={{ padding: '12px 14px 8px', display: 'flex', alignItems: 'center', gap: 6, borderBottom: '1px solid var(--color-border, rgba(255,255,255,0.06))' }}>
        <i className="bx bx-folder-open" style={{ fontSize: 14, color: 'var(--color-fg-dim)' }} />
        <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-fg-dim)' }}>My Content</span>
      </div>

      <div style={{ padding: '6px 0' }}>
        {SECTIONS.map(sec => {
          const sectionShares = shares.filter(s => s.entity_type === sec.type)
          const publicCount = sectionShares.filter(s => s.visibility === 'public').length
          const isActive = active === sec.type
          const isExpanded = expanded === sec.type

          return (
            <div key={sec.type}>
              {/* Section row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                {/* Main nav button */}
                <button
                  onClick={() => router.push(`/@${handle}/${sec.path}`)}
                  style={{
                    flex: 1, display: 'flex', alignItems: 'center', gap: 8,
                    padding: '7px 14px', border: 'none', cursor: 'pointer', textAlign: 'start',
                    background: isActive ? `${sec.color}0d` : 'transparent',
                    color: isActive ? sec.color : 'var(--color-fg-muted)',
                    transition: 'background 0.12s',
                  }}
                  onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'var(--color-bg-active, rgba(255,255,255,0.05))' }}
                  onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
                >
                  <i className={`bx ${sec.icon}`} style={{ fontSize: 15, color: isActive ? sec.color : 'var(--color-fg-dim)', width: 16, textAlign: 'center', flexShrink: 0 }} />
                  <span style={{ fontSize: 13, fontWeight: isActive ? 600 : 400, flex: 1 }}>{sec.label}</span>
                  {!loading && (
                    <span style={{
                      fontSize: 10, fontWeight: 600, borderRadius: 10, padding: '1px 6px',
                      background: `${sec.color}18`, color: sec.color,
                    }}>
                      {publicCount}/{sectionShares.length}
                    </span>
                  )}
                </button>

                {/* Expand toggle */}
                {!loading && sectionShares.length > 0 && (
                  <button
                    onClick={() => setExpanded(isExpanded ? null : sec.type)}
                    style={{
                      width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: 'none', border: 'none', cursor: 'pointer', marginRight: 4, flexShrink: 0,
                      color: 'var(--color-fg-dim)', borderRadius: 6,
                    }}
                    title="Manage visibility"
                  >
                    <i className={`bx bx-chevron-${isExpanded ? 'up' : 'down'}`} style={{ fontSize: 14 }} />
                  </button>
                )}
              </div>

              {/* Expanded: list items with toggle */}
              {isExpanded && sectionShares.length > 0 && (
                <div style={{ background: 'rgba(0,0,0,0.15)', borderTop: '1px solid var(--color-border, rgba(255,255,255,0.05))' }}>
                  {sectionShares.map(share => {
                    const isPublic = share.visibility === 'public'
                    const isToggling = toggling === share.id
                    return (
                      <div key={share.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 14px 5px 38px' }}>
                        <span style={{
                          flex: 1, fontSize: 11, color: 'var(--color-fg-muted)',
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }} title={share.title}>
                          {share.title}
                        </span>
                        {/* Visibility toggle */}
                        <button
                          onClick={() => toggleVisibility(share)}
                          disabled={isToggling}
                          title={isPublic ? 'Public — click to make private' : 'Private — click to make public'}
                          style={{
                            flexShrink: 0, width: 28, height: 16, borderRadius: 8, border: 'none',
                            cursor: isToggling ? 'wait' : 'pointer', position: 'relative',
                            background: isPublic ? '#22c55e' : 'var(--color-border, rgba(255,255,255,0.15))',
                            transition: 'background 0.2s', opacity: isToggling ? 0.5 : 1,
                          }}
                        >
                          <div style={{
                            width: 12, height: 12, borderRadius: '50%', background: '#fff',
                            position: 'absolute', top: 2,
                            left: isPublic ? 14 : 2,
                            transition: 'left 0.2s',
                          }} />
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
