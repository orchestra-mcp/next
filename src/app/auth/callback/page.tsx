'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

/**
 * Auth callback page — handles both flows from GoTrue email links:
 *
 * 1. PKCE flow (OAuth, newer GoTrue): ?code=... → exchangeCodeForSession
 * 2. Implicit flow (magic link, recovery): #access_token=...&type=... → setSession
 */
export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const sb = createClient()

    async function handle() {
      // --- PKCE flow: ?code= in query string ---
      const params = new URLSearchParams(window.location.search)
      const code = params.get('code')
      const typeParam = params.get('type')

      if (code) {
        const { error } = await sb.auth.exchangeCodeForSession(code)
        if (!error) {
          router.replace(typeParam === 'recovery' ? '/reset-password' : '/dashboard')
          return
        }
        router.replace('/login?error=auth_callback_failed')
        return
      }

      // --- Implicit flow: #access_token= in hash ---
      const hash = window.location.hash.slice(1)
      if (hash) {
        const hashParams = new URLSearchParams(hash)
        const accessToken = hashParams.get('access_token')
        const refreshToken = hashParams.get('refresh_token')
        const type = hashParams.get('type')

        if (accessToken && refreshToken) {
          const { error } = await sb.auth.setSession({ access_token: accessToken, refresh_token: refreshToken })
          if (!error) {
            router.replace(type === 'recovery' ? '/reset-password' : '/dashboard')
            return
          }
        }
      }

      // Nothing matched — send to login
      router.replace('/login?error=auth_callback_failed')
    }

    handle()
  }, [router])

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div style={{ width: 32, height: 32, border: '3px solid rgba(169,0,255,0.2)', borderTop: '3px solid #a900ff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
