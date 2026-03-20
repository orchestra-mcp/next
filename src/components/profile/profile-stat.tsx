'use client'

import { useEffect, useRef, useState } from 'react'
import { useProfileTheme } from './use-profile-theme'

interface ProfileStatProps {
  label: string
  value: number
  suffix?: string
}

export default function ProfileStat({ label, value, suffix = '' }: ProfileStatProps) {
  const { colors } = useProfileTheme()
  const [displayValue, setDisplayValue] = useState(0)
  const [hasAnimated, setHasAnimated] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (hasAnimated || !ref.current) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasAnimated(true)
          observer.disconnect()

          const duration = 800
          const start = performance.now()
          function tick(now: number) {
            const elapsed = now - start
            const progress = Math.min(elapsed / duration, 1)
            const eased = 1 - Math.pow(1 - progress, 3)
            setDisplayValue(Math.round(eased * value))
            if (progress < 1) requestAnimationFrame(tick)
          }
          requestAnimationFrame(tick)
        }
      },
      { threshold: 0.3 },
    )

    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [value, hasAnimated])

  return (
    <div ref={ref} className="profile-enter-stat flex items-center gap-2">
      <span className="text-[13px]" style={{ color: colors.textMuted }}>
        {label}
      </span>
      <span
        className="text-sm font-bold tabular-nums"
        style={{ color: colors.accent }}
      >
        {displayValue}{suffix}
      </span>
    </div>
  )
}
