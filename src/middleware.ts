import { NextRequest, NextResponse } from 'next/server'
import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

// next-intl middleware for locale-prefixed public routes
const intlMiddleware = createMiddleware(routing)

// Routes that are always accessible even when coming soon is enabled
const BYPASS_PATHS = [
  '/coming-soon',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/magic-login',
  '/two-factor',
  '/cli-auth',
]

const PUBLIC_PREFIXES = ['/_next', '/api', '/favicon', '/logo', '/og-image', '/icons']

// Public routes under [locale]/ that use intl middleware (URL-based locale)
// Everything else is an app route (cookie-based locale, no URL prefix)
const PUBLIC_ROUTES = [
  '/blog', '/docs', '/download', '/solutions', '/marketplace',
  '/contact', '/privacy', '/terms', '/report', '/coming-soon',
  '/login', '/register', '/forgot-password', '/reset-password',
  '/magic-login', '/two-factor', '/verify-otp',
  '/community', '/member', '/sponsors', '/issues',
]

function isPublicRoute(pathname: string): boolean {
  // Root path — redirect to /en
  if (pathname === '/') return true
  // Already has locale prefix (e.g. /en/blog, /ar/docs)
  const localeMatch = pathname.match(/^\/(en|ar)(\/|$)/)
  if (localeMatch) return true
  // Matches a known public route without locale prefix
  return PUBLIC_ROUTES.some(p => pathname === p || pathname.startsWith(p + '/'))
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Always allow static assets and API routes
  if (PUBLIC_PREFIXES.some(p => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  // Rewrite /@handle paths to /member/handle (and /@handle/post/ID to /member/handle/post/ID)
  const atMatch = pathname.match(/^\/(en|ar)?\/?@([a-zA-Z0-9_-]+)(\/.*)?$/)
  if (atMatch) {
    const locale = atMatch[1] || 'en'
    const handle = atMatch[2]
    const rest = atMatch[3] || ''
    const url = req.nextUrl.clone()
    url.pathname = `/${locale}/member/${handle}${rest}`
    return NextResponse.rewrite(url)
  }

  // Fast bypass — never block auth pages or coming-soon itself, even when
  // coming-soon is enabled. This check runs BEFORE any async API call so
  // login/register are always reachable regardless of backend availability.
  const pathNoLocale = pathname.replace(/^\/(en|ar)/, '') || '/'
  const isBypass = BYPASS_PATHS.some(p =>
    pathNoLocale === p || pathNoLocale.startsWith(p + '/') ||
    pathname === p || pathname.startsWith(p + '/')
  )

  // Public routes — use intl middleware for locale-prefixed URLs
  if (isPublicRoute(pathname)) {
    if (!isBypass) {
      const comingSoonResponse = await handleComingSoon(req)
      if (comingSoonResponse.status === 307 || comingSoonResponse.status === 308) {
        return comingSoonResponse
      }
    }
    return intlMiddleware(req)
  }

  // App routes (settings, subscription, etc.) — skip intl middleware, use cookie-based locale
  if (isBypass) {
    return NextResponse.next()
  }
  return handleComingSoon(req)
}

async function handleComingSoon(req: NextRequest): Promise<NextResponse> {
  const { pathname } = req.nextUrl

  // Check bypass paths (with or without locale prefix)
  const pathWithoutLocale = pathname.replace(/^\/(en|ar)/, '') || '/'
  if (BYPASS_PATHS.some(p => pathWithoutLocale === p || pathWithoutLocale.startsWith(p + '/') ||
      pathname === p || pathname.startsWith(p + '/'))) {
    return NextResponse.next()
  }

  // Fetch coming soon setting from backend
  const apiBase = process.env.INTERNAL_API_URL || 'http://localhost:8080'
  let comingSoon = false

  try {
    const res = await fetch(`${apiBase}/api/public/settings/coming_soon`, {
      next: { revalidate: 30 },
    })
    if (res.ok) {
      const data = await res.json()
      comingSoon = data?.value?.enabled === true
    }
  } catch {
    comingSoon = false
  }

  if (!comingSoon) {
    return NextResponse.next()
  }

  // Coming soon is enabled — check if the user is authenticated
  const token = req.cookies.get('orchestra_token')?.value ||
    req.headers.get('authorization')?.replace('Bearer ', '')

  if (token) {
    // dev_seed_token always bypasses (development mode)
    if (token === 'dev_seed_token') {
      return NextResponse.next()
    }
    // Any valid JWT token means the user is logged in — let them through
    try {
      const parts = token.split('.')
      if (parts.length === 3) {
        const meRes = await fetch(`${apiBase}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (meRes.ok) {
          return NextResponse.next()
        }
      }
    } catch {
      // Invalid token — treat as unauthenticated
    }
  }

  // Redirect to the locale-prefixed coming-soon page to avoid an extra
  // intl-middleware redirect hop (e.g. /coming-soon → /en/coming-soon).
  const localeFromPath = pathname.match(/^\/(en|ar)(\/|$)/)?.[1] ?? 'en'
  const url = req.nextUrl.clone()
  url.pathname = `/${localeFromPath}/coming-soon`
  return NextResponse.redirect(url)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
