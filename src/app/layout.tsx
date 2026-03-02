import type { Metadata } from 'next'
import './globals.css'
import 'boxicons/css/boxicons.min.css'
import { ThemeProvider } from '@/components/ui/theme-provider'

export const metadata: Metadata = {
  title: { default: 'Orchestra', template: '%s | Orchestra' },
  description: 'AI-native platform for every developer. 131 tools, 5 platforms, one protocol.',
  icons: { icon: '/favicon.png' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
