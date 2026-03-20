'use client'
import { use, useState, useEffect, useRef } from 'react'
import { toPng } from 'html-to-image'
import { useCommunityStore } from '@/store/community'
import { useProfileTheme } from '@/components/profile/use-profile-theme'
import ProfileCard from '@/components/profile/profile-card'
import Link from 'next/link'

interface PageProps {
  params: Promise<{ handle: string; slug: string }>
}

export default function BadgeCelebrationPage(props: PageProps) {
  const { handle, slug } = use(props.params)
  const { profile } = useCommunityStore()
  const { colors } = useProfileTheme()
  const [showConfetti, setShowConfetti] = useState(true)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)

  const badge = (profile?.badges ?? []).find(b => b.slug === slug)

  // Confetti
  useEffect(() => {
    if (!showConfetti || !canvasRef.current) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight
    const particles: { x: number; y: number; vx: number; vy: number; color: string; size: number; r: number; rv: number }[] = []
    const cols = ['#00e5ff', '#a900ff', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#f97316']
    for (let i = 0; i < 80; i++) {
      particles.push({ x: Math.random() * canvas.width, y: -Math.random() * canvas.height, vx: (Math.random() - 0.5) * 4, vy: Math.random() * 3 + 2, color: cols[Math.floor(Math.random() * cols.length)], size: Math.random() * 6 + 4, r: Math.random() * 360, rv: (Math.random() - 0.5) * 10 })
    }
    let f = 0
    const go = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      for (const p of particles) { p.x += p.vx; p.y += p.vy; p.vy += 0.05; p.r += p.rv; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r * Math.PI / 180); ctx.fillStyle = p.color; ctx.globalAlpha = Math.max(0, 1 - f / 120); ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.4); ctx.restore() }
      f++
      if (f < 120) requestAnimationFrame(go); else setShowConfetti(false)
    }
    go()
  }, [showConfetti])

  if (!badge) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <p style={{ color: 'var(--color-fg-muted)', fontSize: 14 }}>Badge not found.</p>
        <Link href={`/@${handle}/badges`} style={{ color: '#00e5ff', textDecoration: 'none', fontSize: 13 }}>View all badges</Link>
      </div>
    )
  }

  const earnedDate = badge.awarded_at ? new Date(badge.awarded_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : null
  const shareText = `I earned the "${badge.name}" badge on Orchestra! ${badge.description}`
  const shareUrl = typeof window !== 'undefined' ? window.location.href : ''

  const downloadImage = async () => {
    if (!cardRef.current) return
    try {
      const dataUrl = await toPng(cardRef.current, { pixelRatio: 2 })
      const a = document.createElement('a')
      a.download = `badge-${badge.slug}.png`
      a.href = dataUrl
      a.click()
    } catch (err) {
      console.error('Download failed:', err)
    }
  }

  return (
    <div style={{ position: 'relative' }}>
      {showConfetti && (
        <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 10 }} />
      )}

      <Link href={`/@${handle}/badges`} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 13, color: 'var(--color-fg-dim)', textDecoration: 'none', marginBottom: 16 }}>
        <i className="bx bx-left-arrow-alt" /> All badges
      </Link>

      {/* Badge card — this is what gets captured for download */}
      <div ref={cardRef}>
        <ProfileCard variant="default" style={{ padding: '48px 32px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 30%, ${badge.color}10 0%, transparent 70%)`, pointerEvents: 'none' }} />

          <div style={{ position: 'relative' }}>
            {/* Badge icon */}
            <div style={{
              width: 100, height: 100, borderRadius: '50%', margin: '0 auto 20px',
              background: `${badge.color}15`, border: `2.5px solid ${badge.color}35`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 0 40px ${badge.color}20`,
            }}>
              <i className={`bx ${badge.icon}`} style={{ fontSize: 46, color: badge.color }} />
            </div>

            {/* Name */}
            <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--color-fg)', margin: '0 0 8px', letterSpacing: '-0.03em' }}>
              {badge.name}
            </h1>

            {/* Description */}
            <p style={{ fontSize: 15, color: 'var(--color-fg-muted)', margin: '0 0 10px', maxWidth: 400, marginInline: 'auto', lineHeight: 1.5 }}>
              {badge.description}
            </p>

            {/* Category */}
            <span style={{ display: 'inline-block', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 5, background: `${badge.color}15`, color: badge.color, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>
              {badge.category}
            </span>

            {/* Earned date */}
            {earnedDate && (
              <div style={{ fontSize: 13, color: 'var(--color-fg-dim)', marginBottom: 6 }}>
                <i className="bx bx-calendar" style={{ marginInlineEnd: 4, fontSize: 14, verticalAlign: '-1px' }} />
                Earned on {earnedDate}
              </div>
            )}

            {/* Earned by */}
            <div style={{ fontSize: 13, color: 'var(--color-fg-dim)', marginBottom: 24 }}>
              Earned by <Link href={`/@${handle}`} style={{ color: '#00e5ff', textDecoration: 'none', fontWeight: 600 }}>@{handle}</Link>
            </div>

            {/* Orchestra logo */}
            <div style={{ opacity: 0.35, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <img src="/logo.svg" alt="Orchestra" width={22} height={22} />
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-fg)' }}>Orchestra</span>
              <span style={{ fontSize: 10, color: 'var(--color-fg-dim)' }}>·</span>
              <span style={{ fontSize: 10, color: 'var(--color-fg-dim)' }}>orchestra-mcp.dev</span>
            </div>
          </div>
        </ProfileCard>
      </div>

      {/* Actions — outside cardRef so they don't appear in exported image */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginTop: 16 }}>
        <button onClick={downloadImage} style={{
          padding: '9px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600,
          background: 'linear-gradient(135deg, #00e5ff, #a900ff)', color: '#fff',
          border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5,
        }}>
          <i className="bx bx-download" /> Download
        </button>
        <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener" style={{
          padding: '9px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600,
          background: 'var(--color-bg-active)', color: 'var(--color-fg)',
          border: '1px solid var(--color-border)', textDecoration: 'none',
          display: 'flex', alignItems: 'center', gap: 5,
        }}>
          <i className="bx bxl-twitter" /> Share
        </a>
        <button onClick={() => navigator.clipboard?.writeText(shareUrl)} style={{
          padding: '9px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600,
          background: 'var(--color-bg-active)', color: 'var(--color-fg)',
          border: '1px solid var(--color-border)', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 5,
        }}>
          <i className="bx bx-link" /> Copy Link
        </button>
      </div>
    </div>
  )
}
