'use client'

import { useState, useEffect, useCallback } from 'react'
import { useProfileTheme } from '@/components/profile/use-profile-theme'

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
  const { colors } = useProfileTheme()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [fullscreen, setFullscreen] = useState(false)
  const [showNotes, setShowNotes] = useState(false)
  const [animating, setAnimating] = useState(false)

  const total = slides.length

  const goTo = useCallback((idx: number) => {
    if (idx < 0 || idx >= total || animating) return
    setAnimating(true)
    setTimeout(() => {
      setCurrentIndex(idx)
      setAnimating(false)
    }, 120)
  }, [total, animating])

  const goNext = useCallback(() => goTo(currentIndex + 1), [currentIndex, goTo])
  const goPrev = useCallback(() => goTo(currentIndex - 1), [currentIndex, goTo])
  const toggleFullscreen = useCallback(() => setFullscreen(f => !f), [])

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      switch (e.key) {
        case 'ArrowRight': case 'ArrowDown': case ' ': e.preventDefault(); goNext(); break
        case 'ArrowLeft': case 'ArrowUp': e.preventDefault(); goPrev(); break
        case 'Escape': setFullscreen(false); break
        case 'f': toggleFullscreen(); break
        case 'n': setShowNotes(s => !s); break
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [goNext, goPrev, toggleFullscreen])

  if (total === 0) {
    return (
      <div style={{ padding: 60, textAlign: 'center' }}>
        <i className="bx bx-slideshow" style={{ fontSize: 36, color: colors.textMuted, display: 'block', marginBottom: 12 }} />
        <p style={{ fontSize: 13, color: colors.textMuted }}>No slides to display</p>
      </div>
    )
  }

  const slide = slides[currentIndex]
  const progress = ((currentIndex + 1) / total) * 100

  // Theme-derived palette for slides
  const slideBg = fullscreen ? '#0d0d14' : 'var(--color-bg-alt, #10101a)'
  const slideAccent = colors.accent
  const slideFg = fullscreen ? '#f0f0f0' : 'var(--color-fg, #f0f0f0)'
  const slideFgMuted = fullscreen ? 'rgba(240,240,240,0.55)' : 'var(--color-fg-dim, rgba(240,240,240,0.55))'

  const containerStyle: React.CSSProperties = fullscreen
    ? { position: 'fixed', inset: 0, zIndex: 9999, background: '#0d0d14', display: 'flex', flexDirection: 'column' }
    : { borderRadius: 16, border: `1px solid ${colors.cardBorder}`, background: colors.cardBg, overflow: 'hidden' }

  const isTitle = slide.layout === 'title'
  const isQuote = slide.layout === 'quote'
  const isTwoCol = slide.layout === 'two-column'

  return (
    <div style={containerStyle} data-testid="slide-renderer">
      {/* Slide stage */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: fullscreen ? '60px 80px' : '40px 32px',
        background: slideBg,
        position: 'relative',
        minHeight: fullscreen ? 0 : 420,
        overflow: 'hidden',
      }}>
        {/* Background accent pattern */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -80, right: -80, width: 280, height: 280, borderRadius: '50%', background: `${slideAccent}08` }} />
          <div style={{ position: 'absolute', bottom: -60, left: -60, width: 200, height: 200, borderRadius: '50%', background: `${slideAccent}06` }} />
        </div>

        {/* Slide number chip */}
        <div style={{ position: 'absolute', top: fullscreen ? 20 : 14, right: fullscreen ? 24 : 16, fontSize: 11, fontWeight: 600, color: slideFgMuted, background: 'rgba(255,255,255,0.06)', borderRadius: 20, padding: '3px 10px' }}>
          {currentIndex + 1} / {total}
        </div>

        {/* Slide content with fade animation */}
        <div style={{
          maxWidth: fullscreen ? 860 : 680,
          width: '100%',
          opacity: animating ? 0 : 1,
          transform: animating ? 'translateY(8px)' : 'translateY(0)',
          transition: 'opacity 0.12s ease, transform 0.12s ease',
        }}>
          {/* Title slide */}
          {isTitle && (
            <div style={{ textAlign: 'center' }}>
              {slide.title && (
                <h1 style={{ fontSize: fullscreen ? 52 : 36, fontWeight: 900, color: slideFg, margin: '0 0 16px', letterSpacing: '-0.04em', lineHeight: 1.15 }}>
                  {slide.title}
                </h1>
              )}
              <div style={{ width: 48, height: 3, background: `linear-gradient(90deg, ${slideAccent}, ${slideAccent}60)`, borderRadius: 2, margin: '0 auto 20px' }} />
              {slide.content && (
                <div style={{ fontSize: fullscreen ? 20 : 16, color: slideFgMuted, lineHeight: 1.6 }}
                  dangerouslySetInnerHTML={{ __html: renderSlideContent(slide.content) }} />
              )}
            </div>
          )}

          {/* Quote slide */}
          {isQuote && slide.content && (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <i className="bx bxs-quote-alt-left" style={{ fontSize: fullscreen ? 36 : 28, color: slideAccent, display: 'block', marginBottom: 16, opacity: 0.7 }} />
              <blockquote style={{ fontSize: fullscreen ? 26 : 20, fontStyle: 'italic', color: slideFg, lineHeight: 1.6, margin: 0, fontWeight: 500 }}>
                <div dangerouslySetInnerHTML={{ __html: renderSlideContent(slide.content) }} />
              </blockquote>
              {slide.title && (
                <p style={{ fontSize: fullscreen ? 14 : 12, color: slideFgMuted, marginTop: 20, fontWeight: 600 }}>— {slide.title}</p>
              )}
            </div>
          )}

          {/* Two-column slide */}
          {isTwoCol && (
            <div>
              {slide.title && <h2 style={{ fontSize: fullscreen ? 32 : 22, fontWeight: 800, color: slideFg, margin: '0 0 20px', letterSpacing: '-0.02em' }}>{slide.title}</h2>}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: fullscreen ? 40 : 24 }}>
                <div style={{ fontSize: fullscreen ? 17 : 14, color: slideFgMuted, lineHeight: 1.7 }}
                  dangerouslySetInnerHTML={{ __html: renderSlideContent(slide.content) }} />
                <div style={{ borderLeft: `1px solid ${slideAccent}30`, paddingLeft: fullscreen ? 40 : 24 }}>
                  {/* Placeholder for second column */}
                </div>
              </div>
            </div>
          )}

          {/* Standard content slide */}
          {!isTitle && !isQuote && !isTwoCol && (
            <div>
              {slide.title && (
                <h2 style={{ fontSize: fullscreen ? 34 : 24, fontWeight: 800, color: slideFg, margin: '0 0 20px', letterSpacing: '-0.025em', lineHeight: 1.2 }}>
                  {slide.title}
                </h2>
              )}
              {slide.content && (
                <div
                  style={{ fontSize: fullscreen ? 18 : 15, color: slideFgMuted, lineHeight: 1.75 }}
                  dangerouslySetInnerHTML={{ __html: renderSlideContent(slide.content) }}
                />
              )}
            </div>
          )}
        </div>

        {/* Slide dot thumbnails */}
        <div style={{ position: 'absolute', bottom: fullscreen ? 24 : 16, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 5 }}>
          {slides.map((_, i) => (
            <button key={i} onClick={() => goTo(i)} style={{
              width: i === currentIndex ? 20 : 6, height: 6, borderRadius: 3,
              background: i === currentIndex ? slideAccent : `${slideFg}25`,
              border: 'none', cursor: 'pointer', padding: 0,
              transition: 'all 0.2s ease',
            }} />
          ))}
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: 2, background: colors.cardBorder, flexShrink: 0 }}>
        <div style={{ height: '100%', width: `${progress}%`, background: `linear-gradient(90deg, ${slideAccent}, ${slideAccent}80)`, transition: 'width 0.2s ease' }} />
      </div>

      {/* Speaker notes */}
      {showNotes && slide.notes && (
        <div style={{ padding: '12px 20px', background: 'rgba(0,0,0,0.3)', borderTop: `1px solid ${colors.cardBorder}`, flexShrink: 0, maxHeight: 120, overflowY: 'auto' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Speaker Notes</div>
          <p style={{ fontSize: 13, color: colors.textMuted, margin: 0, lineHeight: 1.6 }}>{slide.notes}</p>
        </div>
      )}

      {/* Controls */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '8px 16px', borderTop: `1px solid ${colors.cardBorder}`,
        background: fullscreen ? 'rgba(0,0,0,0.5)' : colors.cardBg,
        flexShrink: 0, gap: 12,
      }}>
        {/* Left: nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <NavBtn onClick={goPrev} disabled={currentIndex === 0} icon="bx-chevron-left" label="Previous slide" colors={colors} />
          <span style={{ fontSize: 12, color: colors.textMuted, minWidth: 56, textAlign: 'center', fontVariantNumeric: 'tabular-nums' }}>
            {currentIndex + 1} <span style={{ opacity: 0.4 }}>/</span> {total}
          </span>
          <NavBtn onClick={goNext} disabled={currentIndex === total - 1} icon="bx-chevron-right" label="Next slide" colors={colors} />
        </div>

        {/* Center: title */}
        {title && (
          <span style={{ fontSize: 12, color: colors.textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, textAlign: 'center' }}>
            {title}
          </span>
        )}

        {/* Right: extras */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {slide.notes && (
            <NavBtn onClick={() => setShowNotes(s => !s)} icon={showNotes ? 'bx-hide' : 'bx-note'} label="Toggle notes" colors={colors} active={showNotes} />
          )}
          <NavBtn onClick={toggleFullscreen} icon={fullscreen ? 'bx-exit-fullscreen' : 'bx-fullscreen'} label={fullscreen ? 'Exit fullscreen' : 'Fullscreen'} colors={colors} />
        </div>
      </div>

      {/* Inline CSS for slide content elements */}
      <style>{`
        [data-testid="slide-renderer"] ul { padding-left: 1.4em; margin: 0 0 12px; }
        [data-testid="slide-renderer"] li { margin-bottom: 6px; }
        [data-testid="slide-renderer"] code { font-family: monospace; font-size: 0.9em; padding: 1px 5px; border-radius: 4px; background: rgba(255,255,255,0.08); }
        [data-testid="slide-renderer"] pre { background: rgba(0,0,0,0.4); border-radius: 8px; padding: 12px; overflow-x: auto; margin: 12px 0; }
        [data-testid="slide-renderer"] pre code { background: none; padding: 0; }
        [data-testid="slide-renderer"] h1, [data-testid="slide-renderer"] h2, [data-testid="slide-renderer"] h3 { margin: 0 0 10px; line-height: 1.3; }
        [data-testid="slide-renderer"] p { margin: 0 0 10px; }
        [data-testid="slide-renderer"] strong { font-weight: 700; }
      `}</style>
    </div>
  )
}

function NavBtn({ onClick, disabled, icon, label, colors, active }: {
  onClick: () => void
  disabled?: boolean
  icon: string
  label: string
  colors: any
  active?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: 30, height: 30, borderRadius: 7, border: 'none', padding: 0,
        background: active ? `${colors.accent}18` : 'transparent',
        color: disabled ? `${colors.textMuted}40` : (active ? colors.accent : colors.textMuted),
        cursor: disabled ? 'default' : 'pointer',
        transition: 'background 0.1s, color 0.1s',
      }}
      onMouseEnter={e => { if (!disabled && !active) (e.currentTarget as HTMLElement).style.background = colors.hoverBg }}
      onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
    >
      <i className={`bx ${icon}`} style={{ fontSize: 18 }} />
    </button>
  )
}
