'use client'
import { useLocale } from 'next-intl'
import { useRouter, usePathname } from '@/i18n/routing'
import { useThemeStore } from '@/store/theme'
import { locales, getDirection } from '@/i18n/config'
import type { Locale } from '@/i18n/config'
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

export function LanguageSwitcher() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const { theme } = useThemeStore()
  const isDark = theme === 'dark'

  const switchLocale = (newLocale: string) => {
    if (newLocale === locale) return
    // Set cookie for locale persistence
    document.cookie = `NEXT_LOCALE=${newLocale};path=/;max-age=31536000;SameSite=Lax`
    document.documentElement.lang = newLocale
    document.documentElement.dir = getDirection(newLocale as Locale)

    // next-intl router handles locale prefix swapping automatically
    router.replace(pathname, { locale: newLocale as Locale })
  }

  const btnColor = isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          style={{
            display: 'flex', alignItems: 'center', gap: 4,
            padding: '5px 10px', borderRadius: 6,
            border: 'none', background: 'transparent',
            color: btnColor, fontSize: 13, fontWeight: 500,
            cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          <i className="bx bx-globe" style={{ fontSize: 15 }} />
          {LOCALE_LABELS[locale] || locale.toUpperCase()}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {locales.map(l => (
          <DropdownMenuItem
            key={l}
            onClick={() => switchLocale(l)}
            style={{ fontWeight: l === locale ? 600 : 400 }}
          >
            {LOCALE_LABELS[l] || l.toUpperCase()}
            {l === locale && ' \u2713'}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
