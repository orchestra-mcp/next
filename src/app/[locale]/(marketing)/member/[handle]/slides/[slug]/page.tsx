'use client'

import { use, useState, useEffect } from 'react'
import Link from 'next/link'
import { apiFetch } from '@/lib/api'
import { relativeTime } from '@/lib/mcp-parsers'
import { SlideRenderer } from '@/components/content/slide-renderer'
import { JsonLd } from '@/components/content/json-ld'
import { buildJsonLd } from '@/lib/seo'

interface Presentation {
  id: string
  title: string
  slug: string
  description: string
  slide_count: number
  visibility: string
  updated_at: string
}

interface Slide {
  id: string
  slide_number: number
  layout: string
  title: string
  content: string
  notes: string
  properties: any
}

interface PageProps {
  params: Promise<{ handle: string; slug: string }>
}

export default function PublicSlideDetailPage(props: PageProps) {
  const { handle, slug } = use(props.params)
  const [presentation, setPresentation] = useState<Presentation | null>(null)
  const [slides, setSlides] = useState<Slide[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const res = await apiFetch<{
          presentation: Presentation
          slides: Slide[]
        }>(`/api/public/presentations/${handle}/${slug}`)
        setPresentation(res.presentation)
        setSlides(res.slides ?? [])
      } catch {
        setNotFound(true)
      }
      setLoading(false)
    }
    load()
  }, [handle, slug])

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <p style={{ fontSize: 13, color: 'var(--color-fg-dim)' }}>Loading presentation...</p>
      </div>
    )
  }

  if (notFound || !presentation) {
    return (
      <div style={{ padding: 60, textAlign: 'center' }}>
        <i
          className="bx bx-error-circle"
          style={{ fontSize: 36, color: 'var(--color-fg-dim)', display: 'block', marginBottom: 12 }}
        />
        <p style={{ fontSize: 14, color: 'var(--color-fg-dim)', margin: '0 0 16px' }}>
          Presentation not found
        </p>
        <Link
          href={`/@${handle}/slides`}
          style={{ fontSize: 13, color: '#00e5ff', textDecoration: 'none' }}
        >
          <i className="bx bx-arrow-back" style={{ marginRight: 4, verticalAlign: 'middle' }} />
          Back to Presentations
        </Link>
      </div>
    )
  }

  return (
    <div>
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16 }}>
        <Link
          href={`/@${handle}/slides`}
          style={{ fontSize: 12, color: 'var(--color-fg-dim)', textDecoration: 'none' }}
        >
          Presentations
        </Link>
        <i className="bx bx-chevron-right" style={{ fontSize: 14, color: 'var(--color-fg-dim)' }} />
        <span style={{ fontSize: 12, color: 'var(--color-fg)', fontWeight: 600 }}>
          {presentation.title}
        </span>
      </div>

      {/* Header */}
      <div style={headerStyle}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-fg)', margin: 0 }}>
          {presentation.title}
        </h1>
        {presentation.description && (
          <p style={{ fontSize: 13, color: 'var(--color-fg-dim)', margin: '6px 0 0', lineHeight: '1.5' }}>
            {presentation.description}
          </p>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
          <span style={slideCountStyle}>
            {presentation.slide_count} slide{presentation.slide_count !== 1 ? 's' : ''}
          </span>
          <span style={{ fontSize: 11, color: 'var(--color-fg-dim)' }}>
            Updated {relativeTime(presentation.updated_at)}
          </span>
        </div>
      </div>

      {/* Slide viewer */}
      <SlideRenderer slides={slides} title={presentation.title} />

      <JsonLd data={buildJsonLd({ title: presentation.title, description: presentation.description, handle, type: 'slides', slug })} />
    </div>
  )
}

const headerStyle: React.CSSProperties = {
  marginBottom: 20,
}

const slideCountStyle: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 600,
  color: 'var(--color-fg-dim)',
  background: 'var(--color-bg-alt)',
  borderRadius: 20,
  padding: '2px 8px',
}
