'use client'
import { useState } from 'react'
import { useLocale } from 'next-intl'
import { useRouter, usePathname } from '@/i18n/routing'
import { useThemeStore } from '@/store/theme'
import { locales, getDirection } from '@/i18n/config'
import type { Locale } from '@/i18n/config'
import { useAdminStore } from '@/store/admin'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'

const LOCALE_LABELS: Record<string, string> = {
  en: 'English',
  ar: '\u0627\u0644\u0639\u0631\u0628\u064a\u0629',
}

function FlagUS() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 7410 3900" preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }}>
      <rect width="7410" height="3900" fill="#b22234" />
      <path d="M0,450H7410m0,600H0m0,600H7410m0,600H0m0,600H7410m0,600H0" stroke="#fff" strokeWidth="300" />
      <rect width="2964" height="2100" fill="#3c3b6e" />
      <g fill="#fff">
        {[0,1,2,3,4,5,6,7,8].map(row => (
          Array.from({ length: row % 2 === 0 ? 6 : 5 }, (_, col) => (
            <circle
              key={`${row}-${col}`}
              cx={247 + (row % 2 === 0 ? 0 : 247) + col * 494}
              cy={210 / 2 + row * 210}
              r={62}
            />
          ))
        ))}
      </g>
    </svg>
  )
}

function FlagSA() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 600" preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }}>
      <rect width="900" height="600" fill="#006c35" />
      <g fill="#fff" transform="translate(450,240)">
        <rect x="-200" y="-30" width="400" height="8" rx="4" />
        <rect x="-200" y="-10" width="400" height="8" rx="4" />
        <rect x="-200" y="10" width="400" height="8" rx="4" />
        <rect x="-140" y="40" width="280" height="6" rx="3" />
        <rect x="-160" y="80" width="320" height="4" rx="2" />
        <circle cx="-160" cy="82" r="8" />
      </g>
    </svg>
  )
}

const FLAG_COMPONENTS: Record<string, () => React.ReactElement> = {
  en: FlagUS,
  ar: FlagSA,
}

export function LanguageSwitcher({ size = 34, urlBased = true }: { size?: number; urlBased?: boolean }) {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const { theme } = useThemeStore()
  const isDark = theme === 'dark'
  const [loading, setLoading] = useState(false)

  const switchLocale = (newLocale: string) => {
    if (newLocale === locale) return
    document.cookie = `NEXT_LOCALE=${newLocale};path=/;max-age=31536000;SameSite=Lax`
    document.documentElement.lang = newLocale
    document.documentElement.dir = getDirection(newLocale as Locale)
    useAdminStore.getState().setContentLocale(newLocale)
    if (urlBased) {
      router.replace(pathname, { locale: newLocale as Locale })
    } else {
      setLoading(true)
      setTimeout(() => window.location.reload(), 300)
    }
  }

  const FlagComponent = FLAG_COMPONENTS[locale]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          title={LOCALE_LABELS[locale] || locale}
          style={{
            width: size, height: size, borderRadius: size / 3, cursor: 'pointer',
            position: 'relative', overflow: 'hidden',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '1px solid var(--color-border, var(--border, rgba(255,255,255,0.07)))',
            background: 'var(--color-bg-active, var(--bg-hover, rgba(255,255,255,0.03)))',
            transition: 'all 0.2s',
            flexShrink: 0,
            padding: 0,
          }}
        >
          {loading ? (
            <i className="bx bx-loader-alt bx-spin" style={{ fontSize: size * 0.45, color: '#00e5ff' }} />
          ) : FlagComponent ? <FlagComponent /> : (
            <span style={{ fontSize: size * 0.4, fontWeight: 700, color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)' }}>
              {locale.toUpperCase()}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" style={{ minWidth: 160 }}>
        {locales.map(l => {
          const Flag = FLAG_COMPONENTS[l]
          const isActive = l === locale
          return (
            <DropdownMenuItem
              key={l}
              onClick={() => switchLocale(l)}
              style={{
                fontWeight: isActive ? 600 : 400,
                display: 'flex', alignItems: 'center', gap: 10,
              }}
            >
              <span style={{
                width: 28, height: 20, borderRadius: 4, overflow: 'hidden',
                position: 'relative',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                flexShrink: 0,
              }}>
                {Flag ? <Flag /> : null}
              </span>
              <span style={{ flex: 1 }}>{LOCALE_LABELS[l] || l.toUpperCase()}</span>
              {isActive && (
                <i className="bx bx-check" style={{ fontSize: 16, color: '#00e5ff' }} />
              )}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
