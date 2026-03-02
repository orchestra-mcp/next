import { NextRequest, NextResponse } from 'next/server'

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

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Always allow static assets, API routes, and bypass paths
  if (
    PUBLIC_PREFIXES.some(p => pathname.startsWith(p)) ||
    BYPASS_PATHS.some(p => pathname === p || pathname.startsWith(p + '/'))
  ) {
    return NextResponse.next()
  }

  // Fetch coming soon setting from backend (server-side, no auth required)
  const apiBase = process.env.INTERNAL_API_URL || 'http://localhost:8080'
  let comingSoon = false
  let isAdmin = false

  try {
    const res = await fetch(`${apiBase}/api/settings/coming_soon`, {
      next: { revalidate: 30 }, // cache for 30s to avoid hammering the API
    })
    if (res.ok) {
      const data = await res.json()
      comingSoon = data?.value?.enabled === true
    }
  } catch {
    // If API is unreachable, don't block access
    comingSoon = false
  }

  if (!comingSoon) {
    return NextResponse.next()
  }

  // Coming soon is enabled — check if the user is an admin via their JWT
  const token = req.cookies.get('orchestra_token')?.value ||
    req.headers.get('authorization')?.replace('Bearer ', '')

  if (token && token !== 'dev_seed_token') {
    try {
      // Decode JWT payload (no verification needed here — just read role)
      const parts = token.split('.')
      if (parts.length === 3) {
        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString())
        // Fetch user role from API to confirm admin status
        const meRes = await fetch(`${apiBase}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (meRes.ok) {
          const user = await meRes.json()
          isAdmin = user?.role === 'admin'
        }
      }
    } catch {
      // Invalid token — treat as non-admin
    }
  }

  if (isAdmin) {
    return NextResponse.next()
  }

  // Redirect to coming soon page
  const url = req.nextUrl.clone()
  url.pathname = '/coming-soon'
  return NextResponse.redirect(url)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
