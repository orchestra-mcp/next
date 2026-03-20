'use client'
import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuthStore } from '@/store/auth'

export default function OAuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const token = searchParams.get('token')
    if (token) {
      localStorage.setItem('orchestra_token', token)
      document.cookie = `orchestra_token=${token};path=/;max-age=86400;SameSite=Lax`
      useAuthStore.setState({ token })
      // Fetch user profile then redirect to profile page
      useAuthStore.getState().fetchMe().then(() => {
        const user = useAuthStore.getState().user
        const username = user?.username || (user?.settings?.handle as string | undefined)
        router.replace(username ? `/@${username}` : '/dashboard')
      })
    } else {
      router.replace('/login?error=oauth_failed')
    }
  }, [searchParams, router])

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <p>Completing sign in...</p>
    </div>
  )
}
