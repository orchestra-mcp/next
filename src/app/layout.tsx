import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessages } from 'next-intl/server'
import { getDirection, locales } from '@/i18n/config'
import type { Locale } from '@/i18n/config'
import './globals.css'
import 'boxicons/css/boxicons.min.css'
import { ThemeProvider } from '@/components/ui/theme-provider'

export const metadata: Metadata = {
  title: { default: 'Orchestra', template: '%s | Orchestra' },
  description: 'AI-native platform for every developer. 131 tools, 5 platforms, one protocol.',
  icons: { icon: '/favicon.png' },
  alternates: {
    languages: Object.fromEntries(
      locales.map(l => [l, `/${l}`])
    ),
  },
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale() as Locale
  const messages = await getMessages()
  const dir = getDirection(locale)

  return (
    <html lang={locale} dir={dir}>
      <body suppressHydrationWarning>
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
