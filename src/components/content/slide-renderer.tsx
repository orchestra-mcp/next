'use client'

import { useState, useEffect, useCallback } from 'react'

interface Slide {
  id: string
  slide_number: number
  layout: string
  title: string
  content: string
  notes: string
  properties: any
}

interface SlideRendererProps {
  slides: Slide[]
  title?: string
}

const LAYOUT_CONFIGS: Record<string, { showTitle: boolean; columns: number }> = {
  title: { showTitle: true, columns: 1 },
  'title-content': { showTitle: true, columns: 1 },
  'two-column': { showTitle: true, columns: 2 },
  'image-full': { showTitle: false, columns: 1 },
  quote: { showTitle: false, columns: 1 },
  blank: { showTitle: false, columns: 1 },
}

function renderSlideContent(content: string): string {
  if (!content) return ''
  return content
    .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>[\s\S]*?<\/li>)+/g, '<ul>$&</ul>')
    .replace(/^(?!<[hlupoc]|<li|<pre|<code)(.+)$/gm, '<p>$1</p>')
}

export function SlideRenderer({ slides, title }: SlideRendererProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [fullscreen, setFullscreen] = useState(false)

  const total = slides.length

  const goNext = useCallback(() => {
    setCurrentIndex((i) => Math.min(i + 1, total - 1))
  }, [total])

  const goPrev = useCallback(() => {
    setCurrentIndex((i) => Math.max(i - 1, 0))
  }, [])

  const toggleFullscreen = useCallback(() => {
    setFullscreen((f) => !f)
  }, [])

  // Keyboard navigation
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
        case ' ':
          e.preventDefault()
          goNext()
          break
        case 'ArrowLeft':
        case 'ArrowUp':
          e.preventDefault()
          goPrev()
          break
        case 'Escape':
          setFullscreen(false)
          break
        case 'f':
          toggleFullscreen()
          break
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [goNext, goPrev, toggleFullscreen])

  if (total === 0) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <p style={{ fontSize: 13, color: 'var(--color-fg-dim)' }}>No slides</p>
      </div>
    )
  }

  const slide = slides[currentIndex]
  const layout = LAYOUT_CONFIGS[slide.layout] ?? LAYOUT_CONFIGS['title-content']

  const containerStyle: React.CSSProperties = fullscreen
    ? {
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: '#0a0a0a',
        display: 'flex',
        flexDirection: 'column',
      }
    : {
        borderRadius: 12,
        border: '1px solid var(--color-border)',
        background: 'var(--color-bg)',
        overflow: 'hidden',
      }

  return (
    <div style={containerStyle} data-testid="slide-renderer">
      {/* Slide area */}
      <div style={slideAreaStyle(fullscreen)}>
        {/* Slide content */}
        <div style={slideContentStyle(fullscreen)}>
          {layout.showTitle && slide.title && (
            <h2 style={slideTitleStyle(fullscreen, slide.layout === 'title')}>
              {slide.title}
            </h2>
          )}

          {slide.layout === 'quote' && slide.content ? (
            <blockquote style={quoteStyle(fullscreen)}>
              <div dangerouslySetInnerHTML={{ __html: renderSlideContent(slide.content) }} />
            </blockquote>
          ) : layout.columns === 2 ? (
            <div style={{ display: 'flex', gap: 24, flex: 1 }}>
              <div
                style={{ flex: 1 }}
                dangerouslySetInnerHTML={{ __html: renderSlideContent(slide.content) }}
              />
              <div style={{ flex: 1, borderLeft: '1px solid var(--color-border)', paddingLeft: 24 }}>
                {/* Second column: could be extended for dual content */}
              </div>
            </div>
          ) : (
            slide.content && (
              <div
                style={bodyStyle(fullscreen)}
                dangerouslySetInnerHTML={{ __html: renderSlideContent(slide.content) }}
              />
            )
          )}
        </div>
      </div>

      {/* Controls bar */}
      <div style={controlsStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={goPrev}
            disabled={currentIndex === 0}
            style={navBtnStyle}
            aria-label="Previous slide"
          >
            <i className="bx bx-chevron-left" style={{ fontSize: 18 }} />
          </button>
          <span style={{ fontSize: 12, color: 'var(--color-fg-dim)', minWidth: 60, textAlign: 'center' }}>
            {currentIndex + 1} / {total}
          </span>
          <button
            onClick={goNext}
            disabled={currentIndex === total - 1}
            style={navBtnStyle}
            aria-label="Next slide"
          >
            <i className="bx bx-chevron-right" style={{ fontSize: 18 }} />
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {title && (
            <span style={{ fontSize: 12, color: 'var(--color-fg-dim)' }}>
              {title}
            </span>
          )}
          <button
            onClick={toggleFullscreen}
            style={navBtnStyle}
            aria-label={fullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          >
            <i className={`bx bx-${fullscreen ? 'exit-fullscreen' : 'fullscreen'}`} style={{ fontSize: 16 }} />
          </button>
        </div>
      </div>
    </div>
  )
}

function slideAreaStyle(fullscreen: boolean): React.CSSProperties {
  return {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: fullscreen ? 60 : 30,
    minHeight: fullscreen ? 0 : 400,
    background: fullscreen ? '#0a0a0a' : 'var(--color-bg-alt)',
  }
}

function slideContentStyle(fullscreen: boolean): React.CSSProperties {
  return {
    maxWidth: fullscreen ? 900 : 700,
    width: '100%',
    color: fullscreen ? '#e0e0e0' : 'var(--color-fg)',
  }
}

function slideTitleStyle(fullscreen: boolean, isTitleSlide: boolean): React.CSSProperties {
  return {
    fontSize: isTitleSlide ? (fullscreen ? 42 : 28) : (fullscreen ? 28 : 20),
    fontWeight: 700,
    marginBottom: isTitleSlide ? 8 : 16,
    margin: 0,
    lineHeight: 1.3,
  }
}

function quoteStyle(fullscreen: boolean): React.CSSProperties {
  return {
    borderLeft: '4px solid #00e5ff',
    paddingLeft: 20,
    margin: '20px 0',
    fontSize: fullscreen ? 22 : 16,
    fontStyle: 'italic',
    lineHeight: 1.6,
  }
}

function bodyStyle(fullscreen: boolean): React.CSSProperties {
  return {
    fontSize: fullscreen ? 18 : 14,
    lineHeight: 1.7,
  }
}

const controlsStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '8px 14px',
  borderTop: '1px solid var(--color-border)',
  background: 'var(--color-bg)',
  flexShrink: 0,
}

const navBtnStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  color: 'var(--color-fg-dim)',
  borderRadius: 6,
  padding: 4,
  width: 30,
  height: 30,
}
