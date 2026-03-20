'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

interface BadgeInfo {
  name: string
  desc: string
  icon: string
  color: string
  category: string
}

interface Props {
  slug: string
  badge: BadgeInfo | null
}

export default function BadgeCelebrationClient({ slug, badge }: Props) {
  const [confetti, setConfetti] = useState<{ id: number; x: number; color: string; delay: number }[]>([])
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    // Generate confetti particles.
    const particles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      color: ['#00e5ff', '#a900ff', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6'][i % 6],
      delay: Math.random() * 2,
    }))
    setConfetti(particles)
  }, [])

  if (!badge) {
    return (
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '120px 32px', textAlign: 'center' }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--color-fg, #f8f8f8)', marginBottom: 12 }}>Badge not found</h1>
        <Link href="/marketplace" style={{ color: '#00e5ff', textDecoration: 'none' }}>Back to Marketplace</Link>
      </div>
    )
  }

  const shareUrl = typeof window !== 'undefined' ? window.location.href : ''
  const shareText = `I just earned the ${badge.name} badge on Orchestra! ${badge.desc}`

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '80px 32px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
      {/* Confetti */}
      <style>{`
        @keyframes confettiFall {
          0% { transform: translateY(-100vh) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
      {confetti.map(p => (
        <div key={p.id} style={{
          position: 'fixed', top: 0, left: `${p.x}%`,
          width: 8, height: 8, borderRadius: 2,
          background: p.color,
          animation: `confettiFall 3s ease-in ${p.delay}s both`,
          pointerEvents: 'none', zIndex: 0,
        }} />
      ))}

      {/* Badge icon */}
      <div style={{
        width: 120, height: 120, borderRadius: 30, margin: '0 auto 32px',
        background: `${badge.color}18`, border: `2px solid ${badge.color}40`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative', zIndex: 1,
      }}>
        <i className={`bx ${badge.icon}`} style={{ fontSize: 56, color: badge.color }} />
      </div>

      {/* Title */}
      <h1 style={{
        fontSize: 32, fontWeight: 800, color: 'var(--color-fg, #f8f8f8)',
        marginBottom: 8, letterSpacing: '-0.03em', position: 'relative', zIndex: 1,
      }}>
        {badge.name}
      </h1>

      <p style={{
        fontSize: 16, color: 'var(--color-fg-muted, rgba(255,255,255,0.5))',
        marginBottom: 8, position: 'relative', zIndex: 1,
      }}>
        {badge.desc}
      </p>

      <span style={{
        display: 'inline-block', fontSize: 11, fontWeight: 600, padding: '4px 12px',
        borderRadius: 6, background: `${badge.color}15`, color: badge.color,
        textTransform: 'uppercase', letterSpacing: '0.05em',
        marginBottom: 40, position: 'relative', zIndex: 1,
      }}>
        {badge.category}
      </span>

      {/* Share buttons */}
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>
        <a
          href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`}
          target="_blank" rel="noopener"
          style={{
            padding: '10px 20px', borderRadius: 10, fontSize: 13, fontWeight: 600,
            background: '#1da1f2', color: '#fff', textDecoration: 'none',
            display: 'inline-flex', alignItems: 'center', gap: 6,
          }}
        >
          <i className="bx bxl-twitter" /> Share on X
        </a>
        <button onClick={handleCopyLink} style={{
          padding: '10px 20px', borderRadius: 10, fontSize: 13, fontWeight: 600,
          background: 'var(--color-bg-alt, rgba(255,255,255,0.05))',
          border: '1px solid var(--color-border, rgba(255,255,255,0.1))',
          color: copied ? '#22c55e' : 'var(--color-fg-muted, rgba(255,255,255,0.5))',
          cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6,
        }}>
          <i className={`bx ${copied ? 'bx-check' : 'bx-link'}`} />
          {copied ? 'Copied!' : 'Copy Link'}
        </button>
      </div>
    </div>
  )
}
