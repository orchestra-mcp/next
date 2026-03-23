import { NextRequest, NextResponse } from 'next/server'
import createMiddleware from 'next-intl/middleware'
import { createServerClient } from '@supabase/ssr'
import { routing } from './i18n/routing'
import { updateSession } from '@/lib/supabase/middleware'

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
  '/auth/callback',
]

const PUBLIC_PREFIXES = ['/_next', '/api', '/uploads', '/favicon', '/logo', '/og-image', '/icons']

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

/**
 * Copy Supabase auth cookies from the session-refresh response onto
 * the final response produced by the rest of our middleware chain.
 * This ensures the refreshed Supabase tokens are always sent back
 * to the browser regardless of which code path produces the response.
 */
function mergeSupabaseCookies(
  supabaseResponse: NextResponse,
  finalResponse: NextResponse
): NextResponse {
  supabaseResponse.cookies.getAll().forEach(cookie => {
    finalResponse.cookies.set(cookie.name, cookie.value, {
      // Preserve attributes Supabase set on the cookie
      ...(cookie as any),
    })
  })
  return finalResponse
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Always allow static assets and API routes
  if (PUBLIC_PREFIXES.some(p => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  // Refresh Supabase auth session (sets updated cookies).
  // We capture the response so we can merge its cookies into
  // whatever final response the rest of the middleware produces.
  let supabaseResponse: NextResponse | null = null
  try {
    supabaseResponse = await updateSession(req)
  } catch {
    // Supabase not configured yet — silently continue
  }

  // Fast bypass — never block auth pages or coming-soon itself, even when
  // coming-soon is enabled. This check runs BEFORE any async API call so
  // login/register are always reachable regardless of backend availability.
  const pathNoLocale = pathname.replace(/^\/(en|ar)/, '') || '/'
  const isBypass = BYPASS_PATHS.some(p =>
    pathNoLocale === p || pathNoLocale.startsWith(p + '/') ||
    pathname === p || pathname.startsWith(p + '/')
  )

  // Rewrite /@handle paths FIRST (before coming-soon check so the rewritten
  // path is what gets checked, and settings pages aren't accidentally blocked)
  const atMatch = pathname.match(/^\/(en|ar)?\/?@([a-zA-Z0-9_-]+)(\/.*)?$/)
  if (atMatch) {
    const locale = atMatch[1] || 'en'
    const handle = atMatch[2]
    const rest = atMatch[3] || ''
    const url = req.nextUrl.clone()
    url.pathname = `/${locale}/member/${handle}${rest}`
    // Settings pages are always accessible to the owner (no coming-soon block)
    if (rest.startsWith('/settings')) {
      const res = NextResponse.rewrite(url)
      return supabaseResponse ? mergeSupabaseCookies(supabaseResponse, res) : res
    }
    // For other @handle pages, apply coming-soon check after rewrite
    if (!isBypass) {
      const comingSoonResponse = await handleComingSoon(req)
      if (comingSoonResponse.status === 307 || comingSoonResponse.status === 308) {
        return supabaseResponse ? mergeSupabaseCookies(supabaseResponse, comingSoonResponse) : comingSoonResponse
      }
    }
    const res = NextResponse.rewrite(url)
    return supabaseResponse ? mergeSupabaseCookies(supabaseResponse, res) : res
  }

  // Coming soon check for all other non-bypass routes
  if (!isBypass) {
    const comingSoonResponse = await handleComingSoon(req)
    if (comingSoonResponse.status === 307 || comingSoonResponse.status === 308) {
      return supabaseResponse ? mergeSupabaseCookies(supabaseResponse, comingSoonResponse) : comingSoonResponse
    }
  }

  // Public routes — use intl middleware for locale-prefixed URLs
  if (isPublicRoute(pathname)) {
    const res = intlMiddleware(req)
    return supabaseResponse ? mergeSupabaseCookies(supabaseResponse, res) : res
  }

  // App routes (settings, subscription, etc.)
  const res = NextResponse.next()
  return supabaseResponse ? mergeSupabaseCookies(supabaseResponse, res) : res
}

async function handleComingSoon(req: NextRequest): Promise<NextResponse> {
  const { pathname } = req.nextUrl

  // Check bypass paths (with or without locale prefix)
  const pathWithoutLocale = pathname.replace(/^\/(en|ar)/, '') || '/'
  if (BYPASS_PATHS.some(p => pathWithoutLocale === p || pathWithoutLocale.startsWith(p + '/') ||
      pathname === p || pathname.startsWith(p + '/'))) {
    return NextResponse.next()
  }

  // Fetch coming soon setting from Supabase PostgREST (anon key, public read)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  let comingSoon = false

  if (supabaseUrl && anonKey) {
    try {
      const res = await fetch(
        `${supabaseUrl}/rest/v1/settings?key=eq.coming_soon&select=value`,
        {
          headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` },
          next: { revalidate: 30 },
        }
      )
      if (res.ok) {
        const rows = await res.json()
        comingSoon = rows?.[0]?.value?.enabled === true
      }
    } catch {
      comingSoon = false
    }
  }

  if (!comingSoon) {
    return NextResponse.next()
  }

  // Coming soon is enabled — check if user is an admin via Supabase auth
  try {
    const supabase = createServerClient(
      supabaseUrl!,
      anonKey!,
      {
        cookies: {
          getAll() { return req.cookies.getAll() },
          setAll() { /* read-only in this check */ },
        },
      }
    )
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      // Query public.users for admin role check
      const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('auth_uid', user.id)
        .single()
      if (profile?.role === 'admin') {
        return NextResponse.next()
      }
    }
  } catch {
    // Auth check failed — treat as unauthenticated
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
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
