'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface ShareItem {
  id: number
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
  { type: 'doc',            label: 'Docs',   icon: 'bx-file',       color: '#00c853', path: 'docs' },
  { type: 'api_collection', label: 'APIs',   icon: 'bx-collection', color: '#3b82f6', path: 'apis' },
  { type: 'presentation',   label: 'Slides', icon: 'bx-slideshow',  color: '#a900ff', path: 'slides' },
]

interface Props { handle: string }

export default function ProfileContentCard({ handle }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const [shares, setShares] = useState<ShareItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const sb = createClient()
        const { data: { user } } = await sb.auth.getUser()
        if (!user) throw new Error('Not authenticated')
        const { data, error } = await sb.from('community_shares').select('id, entity_type, visibility').eq('user_id', user.id)
        if (error) throw error
        setShares(data ?? [])
      } catch {
        setShares([])
      }
      setLoading(false)
    }
    load()
  }, [])

  function currentSection(): string | null {
    const clean = pathname.replace(/^\/(en|ar)/, '').replace(`/member/${handle}`, `/@${handle}`)
    for (const s of SECTIONS) {
      if (clean.startsWith(`/@${handle}/${s.path}`)) return s.type
    }
    return null
  }

  const active = currentSection()

  return (
    <div className="sb-card" style={{
      borderRadius: 14,
      border: '1px solid var(--color-border, rgba(255,255,255,0.06))',
      background: 'var(--color-bg-alt, rgba(255,255,255,0.03))',
      overflow: 'hidden',
    }}>
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

          return (
            <button
              key={sec.type}
              onClick={() => router.push(`/@${handle}/${sec.path}`)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 8,
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
                <span style={{ fontSize: 10, fontWeight: 600, borderRadius: 10, padding: '1px 6px', background: `${sec.color}18`, color: sec.color }}>
                  {publicCount}/{sectionShares.length}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
