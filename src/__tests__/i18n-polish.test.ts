/**
 * Tests for i18n: Arabic Font + Typography + Dual Routing
 * Verifies: translation parity, notFound namespace, CSS rules, hreflang metadata,
 * dual routing (URL-based for public, cookie-based for dashboard), locale switching
 */
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { locales, isRTL, getDirection } from '../i18n/config'

const root = resolve(__dirname, '../..')
const enJson = JSON.parse(readFileSync(resolve(root, 'src/messages/en.json'), 'utf-8'))
const arJson = JSON.parse(readFileSync(resolve(root, 'src/messages/ar.json'), 'utf-8'))
const globalsCss = readFileSync(resolve(root, 'src/app/globals.css'), 'utf-8')
const layoutTsx = readFileSync(resolve(root, 'src/app/layout.tsx'), 'utf-8')
const notFoundTsx = readFileSync(resolve(root, 'src/app/not-found.tsx'), 'utf-8')
const routingTs = readFileSync(resolve(root, 'src/i18n/routing.ts'), 'utf-8')
const middlewareTs = readFileSync(resolve(root, 'src/middleware.ts'), 'utf-8')
const langSwitcher = readFileSync(resolve(root, 'src/components/ui/language-switcher.tsx'), 'utf-8')
const preferencesTs = readFileSync(resolve(root, 'src/store/preferences.ts'), 'utf-8')
const localeLayoutTsx = readFileSync(resolve(root, 'src/app/[locale]/layout.tsx'), 'utf-8')
const requestTs = readFileSync(resolve(root, 'src/i18n/request.ts'), 'utf-8')

describe('i18n config', () => {
  it('exports en and ar locales', () => {
    expect(locales).toContain('en')
    expect(locales).toContain('ar')
  })

  it('ar is RTL', () => {
    expect(isRTL('ar')).toBe(true)
    expect(getDirection('ar')).toBe('rtl')
  })

  it('en is LTR', () => {
    expect(isRTL('en')).toBe(false)
    expect(getDirection('en')).toBe('ltr')
  })
})

describe('translation parity', () => {
  it('en and ar have the same top-level namespaces', () => {
    const enKeys = Object.keys(enJson).sort()
    const arKeys = Object.keys(arJson).sort()
    expect(arKeys).toEqual(enKeys)
  })

  it('notFound namespace exists in both languages', () => {
    expect(enJson.notFound).toBeDefined()
    expect(arJson.notFound).toBeDefined()
    expect(Object.keys(enJson.notFound).sort()).toEqual(Object.keys(arJson.notFound).sort())
  })

  it('notFound has required keys', () => {
    expect(enJson.notFound.title).toBe('Page not found')
    expect(enJson.notFound.description).toBeTruthy()
    expect(enJson.notFound.goHome).toBe('Go home')
  })

  it('Arabic notFound translations are non-empty', () => {
    expect(arJson.notFound.title).toBeTruthy()
    expect(arJson.notFound.description).toBeTruthy()
    expect(arJson.notFound.goHome).toBeTruthy()
  })
})

describe('globals.css Arabic font support', () => {
  it('imports IBM Plex Sans Arabic from Google Fonts', () => {
    expect(globalsCss).toContain('IBM+Plex+Sans+Arabic')
  })

  it('sets Arabic font-family for RTL', () => {
    expect(globalsCss).toContain("[dir=\"rtl\"]")
    expect(globalsCss).toContain("'IBM Plex Sans Arabic'")
  })

  it('resets letter-spacing for RTL', () => {
    expect(globalsCss).toContain('[dir="rtl"] *')
    expect(globalsCss).toContain('letter-spacing: 0em')
  })

  it('has RTL icon rail transform fix for mobile', () => {
    expect(globalsCss).toContain('[dir="rtl"] .app-icon-rail')
    expect(globalsCss).toContain('translateX(100%)')
  })

  it('keeps the rtl-flip class', () => {
    expect(globalsCss).toContain('[dir="rtl"] .rtl-flip')
    expect(globalsCss).toContain('scaleX(-1)')
  })
})

describe('root layout SEO', () => {
  it('includes alternates.languages metadata', () => {
    expect(layoutTsx).toContain('alternates')
    expect(layoutTsx).toContain('languages')
  })

  it('imports locales from i18n config', () => {
    expect(layoutTsx).toContain("import { getDirection, locales }")
  })
})

describe('not-found page', () => {
  it('uses next/link instead of <a>', () => {
    expect(notFoundTsx).toContain("import Link from 'next/link'")
    expect(notFoundTsx).toContain('<Link')
    expect(notFoundTsx).not.toMatch(/<a\s/)
  })

  it('uses useTranslations with notFound namespace', () => {
    expect(notFoundTsx).toContain("useTranslations('notFound')")
  })

  it('renders translated keys', () => {
    expect(notFoundTsx).toContain("t('title')")
    expect(notFoundTsx).toContain("t('description')")
    expect(notFoundTsx).toContain("t('goHome')")
  })
})

describe('dual routing: URL-based for public, cookie-based for dashboard', () => {
  it('uses localePrefix: always for URL-based locale on public routes', () => {
    expect(routingTs).toContain("localePrefix: 'always'")
  })

  it('middleware uses next-intl createMiddleware for public routes', () => {
    expect(middlewareTs).toContain('intlMiddleware')
    expect(middlewareTs).toContain('createMiddleware')
  })

  it('middleware only applies intl to public routes', () => {
    expect(middlewareTs).toContain('isPublicRoute')
    expect(middlewareTs).toContain('PUBLIC_ROUTES')
  })

  it('[locale]/layout.tsx validates locale and calls setRequestLocale', () => {
    expect(localeLayoutTsx).toContain('setRequestLocale')
    expect(localeLayoutTsx).toContain('generateStaticParams')
    expect(localeLayoutTsx).toContain('notFound()')
  })

  it('i18n/request.ts reads NEXT_LOCALE cookie for dashboard locale detection', () => {
    expect(requestTs).toContain('NEXT_LOCALE')
    expect(requestTs).toContain('cookies')
    expect(requestTs).toContain('accept-language')
  })
})

describe('locale switching', () => {
  it('language switcher sets NEXT_LOCALE cookie', () => {
    expect(langSwitcher).toContain('NEXT_LOCALE')
    expect(langSwitcher).toContain('document.cookie')
  })

  it('language switcher uses URL-based navigation with locale prefix', () => {
    expect(langSwitcher).toContain('router.push')
    expect(langSwitcher).toContain('switchLocale')
  })

  it('language switcher uses dropdown menu', () => {
    expect(langSwitcher).toContain('DropdownMenu')
    expect(langSwitcher).toContain('DropdownMenuTrigger')
    expect(langSwitcher).toContain('DropdownMenuItem')
  })

  it('language switcher has labels for all locales', () => {
    expect(langSwitcher).toContain('LOCALE_LABELS')
    expect(langSwitcher).toContain("en: 'English'")
  })

  it('preferences store sets NEXT_LOCALE cookie on language change', () => {
    expect(preferencesTs).toContain('NEXT_LOCALE')
    expect(preferencesTs).toContain('document.cookie')
  })
})
