'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useThemeStore } from '@/store/theme'
import { useFeatureFlagsStore } from '@/store/feature-flags'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'

interface Sponsor {
  id: number
  name: string
  slug: string
  logo_url: string
  website_url: string
  tier: 'platinum' | 'gold' | 'silver' | 'bronze'
  description: string
  order: number
  status: 'active' | 'inactive'
}


const TIER_CONFIG = {
  platinum: { label: 'Platinum', color: '#00e5ff', cols: 2, height: 200, showDesc: true },
  gold: { label: 'Gold', color: '#facc15', cols: 3, height: 160, showDesc: true },
  silver: { label: 'Silver', color: '#8a8a8a', cols: 4, height: 120, showDesc: false },
  bronze: { label: 'Bronze', color: '#cd7f32', cols: 6, height: 0, showDesc: false },
} as const

type TierKey = keyof typeof TIER_CONFIG

export default function SponsorsPage() {
  const t = useTranslations()
  const router = useRouter()
  const { theme } = useThemeStore()
  const { isEnabled, fetchFlags, loaded } = useFeatureFlagsStore()
  const isDark = theme === 'dark'

  const textPrimary = isDark ? '#f8f8f8' : '#0f0f12'
  const textMuted = isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.55)'
  const textBody = isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.55)'
  const cardBg = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'
  const cardBorder = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'

  const [sponsors, setSponsors] = useState<Sponsor[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!loaded) fetchFlags()
  }, [loaded, fetchFlags])

  useEffect(() => {
    if (loaded && !isEnabled('sponsors')) {
      router.replace('/')
    }
  }, [loaded, isEnabled, router])

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const sb = createClient()
        const { data, error } = await sb.from('sponsors').select('*').eq('status', 'active').order('order', { ascending: true })
        if (error) throw error
        if (!cancelled) {
          setSponsors((data || []) as Sponsor[])
          setLoading(false)
        }
      } catch {
        if (!cancelled) {
          setSponsors([])
          setLoading(false)
        }
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  if (!loaded || (loaded && !isEnabled('sponsors'))) return null

  const grouped: Record<TierKey, Sponsor[]> = { platinum: [], gold: [], silver: [], bronze: [] }
  for (const s of sponsors) {
    if (grouped[s.tier]) grouped[s.tier].push(s)
  }
  grouped.platinum.sort((a, b) => a.order - b.order)
  grouped.gold.sort((a, b) => a.order - b.order)
  grouped.silver.sort((a, b) => a.order - b.order)
  grouped.bronze.sort((a, b) => a.order - b.order)

  const tiers: TierKey[] = ['platinum', 'gold', 'silver', 'bronze']

  function renderLogo(sponsor: Sponsor, size: number, tierColor: string) {
    if (sponsor.logo_url) {
      return (
        <img
          src={sponsor.logo_url}
          alt={sponsor.name}
          style={{ width: size, height: size, objectFit: 'contain', borderRadius: 8 }}
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; (e.target as HTMLImageElement).nextElementSibling?.removeAttribute('style') }}
        />
      )
    }
    return null
  }

  function renderFallbackLetter(name: string, size: number, tierColor: string) {
    return (
      <div style={{
        width: size, height: size, borderRadius: 8,
        background: `${tierColor}20`, border: `1px solid ${tierColor}40`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: size * 0.5, fontWeight: 700, color: tierColor,
        flexShrink: 0,
      }}>
        {name.charAt(0).toUpperCase()}
      </div>
    )
  }

  return (
    <div className="mkt-page" style={{ maxWidth: 1100, margin: '0 auto', padding: '72px 32px' }}>
      {/* Hero */}
      <div style={{ marginBottom: 64, textAlign: 'center' }}>
        <h1 style={{
          fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 800, letterSpacing: '-0.04em',
          background: 'linear-gradient(135deg, #00e5ff, #a900ff)', WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent', marginBottom: 14,
        }}>
          Our Sponsors
        </h1>
        <p style={{ fontSize: 17, color: textMuted, maxWidth: 520, margin: '0 auto' }}>
          Thanks to the companies and individuals who support Orchestra&apos;s development.
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: textMuted }}>
          <i className="bx bx-loader-alt bx-spin" style={{ fontSize: 28, marginBottom: 12, display: 'block' }} />
          Loading sponsors...
        </div>
      ) : sponsors.length === 0 ? (
        /* Empty state */
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <i className="bx bx-heart" style={{ fontSize: 48, color: textMuted, display: 'block', marginBottom: 16 }} />
          <h2 style={{ fontSize: 22, fontWeight: 700, color: textPrimary, marginBottom: 8 }}>No sponsors yet</h2>
          <p style={{ fontSize: 15, color: textMuted }}>
            Interested in sponsoring Orchestra? Get in touch.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 56 }}>
          {tiers.map(tier => {
            const items = grouped[tier]
            if (items.length === 0) return null
            const cfg = TIER_CONFIG[tier]

            return (
              <div key={tier}>
                {/* Tier label */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                  <div style={{
                    fontSize: 12, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.08em',
                    padding: '4px 12px', borderRadius: 100,
                    background: `${cfg.color}15`, color: cfg.color, border: `1px solid ${cfg.color}30`,
                  }}>
                    {cfg.label}
                  </div>
                  <div style={{ flex: 1, height: 1, background: `${cfg.color}15` }} />
                </div>

                {tier === 'bronze' ? (
                  /* Bronze: compact pill row */
                  <div className="mkt-grid-bronze" style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                    {items.map(sponsor => (
                      <a
                        key={sponsor.id}
                        href={sponsor.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: 8,
                          padding: '8px 16px', borderRadius: 100,
                          background: cardBg, border: `1px solid ${cardBorder}`,
                          textDecoration: 'none', color: textPrimary, fontSize: 13, fontWeight: 600,
                          transition: 'border-color 0.15s',
                        }}
                      >
                        {sponsor.logo_url ? (
                          <img src={sponsor.logo_url} alt={sponsor.name} style={{ width: 20, height: 20, objectFit: 'contain', borderRadius: 4 }} />
                        ) : (
                          <div style={{
                            width: 20, height: 20, borderRadius: 4,
                            background: `${cfg.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 11, fontWeight: 700, color: cfg.color,
                          }}>
                            {sponsor.name.charAt(0)}
                          </div>
                        )}
                        {sponsor.name}
                      </a>
                    ))}
                  </div>
                ) : (
                  /* Platinum / Gold / Silver: grid cards */
                  <div
                    className={cfg.cols === 2 ? 'mkt-grid-2' : cfg.cols === 3 ? 'mkt-grid-3' : 'mkt-grid-4'}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: `repeat(${cfg.cols}, 1fr)`,
                      gap: 16,
                    }}
                  >
                    {items.map(sponsor => (
                      <div
                        key={sponsor.id}
                        style={{
                          minHeight: cfg.height,
                          padding: tier === 'silver' ? '20px' : '28px',
                          borderRadius: 16,
                          background: cardBg,
                          border: `1px solid ${cardBorder}`,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 12,
                          position: 'relative',
                          overflow: 'hidden',
                        }}
                      >
                        {/* Subtle glow */}
                        {tier === 'platinum' && (
                          <div style={{
                            position: 'absolute', top: -30, right: -30, width: 200, height: 200,
                            borderRadius: '50%', background: `radial-gradient(ellipse, ${cfg.color}08 0%, transparent 70%)`,
                            filter: 'blur(40px)', pointerEvents: 'none',
                          }} />
                        )}

                        {/* Logo */}
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 14 }}>
                          <div style={{ position: 'relative' }}>
                            {renderLogo(sponsor, tier === 'silver' ? 36 : 48, cfg.color)}
                            <div style={{ display: 'none' }}>
                              {renderFallbackLetter(sponsor.name, tier === 'silver' ? 36 : 48, cfg.color)}
                            </div>
                          </div>
                          <div style={{ flex: 1 }}>
                            <h3 style={{
                              fontSize: tier === 'silver' ? 14 : 17, fontWeight: 700,
                              color: textPrimary, margin: 0,
                            }}>
                              {sponsor.name}
                            </h3>
                          </div>
                          <a
                            href={sponsor.website_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Visit website"
                            style={{ color: textMuted, fontSize: 18, lineHeight: 1, flexShrink: 0 }}
                          >
                            <i className="bx bx-link-external" />
                          </a>
                        </div>

                        {/* Description (platinum & gold only) */}
                        {cfg.showDesc && sponsor.description && (
                          <p style={{
                            fontSize: 13, color: textBody, lineHeight: 1.6, margin: 0,
                            flex: 1,
                          }}>
                            {sponsor.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
