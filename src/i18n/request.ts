import { getRequestConfig } from 'next-intl/server'
import { cookies, headers } from 'next/headers'
import { routing } from './routing'
import { type Locale } from './config'

export default getRequestConfig(async ({ requestLocale }) => {
  // Try requestLocale first (set by next-intl middleware if present)
  let locale = await requestLocale

  // Fall back to NEXT_LOCALE cookie
  if (!locale || !routing.locales.includes(locale as Locale)) {
    const cookieStore = await cookies()
    locale = cookieStore.get('NEXT_LOCALE')?.value
  }

  // Fall back to Accept-Language header
  if (!locale || !routing.locales.includes(locale as Locale)) {
    const headerStore = await headers()
    const acceptLang = headerStore.get('accept-language') ?? ''
    const preferred = acceptLang.split(',').map(l => l.split(';')[0].trim().split('-')[0])
    locale = preferred.find(l => routing.locales.includes(l as Locale))
  }

  // Final fallback to default
  if (!locale || !routing.locales.includes(locale as Locale)) {
    locale = routing.defaultLocale
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  }
})
