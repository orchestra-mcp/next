'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth'
import { useRoleStore } from '@/store/roles'
import { useSettingsStore } from '@/store/settings'
import { useRealtimeSync } from '@/hooks/useRealtimeSync'
import { NotificationToast } from '@/components/NotificationToast'
import { requestNotificationPermission, isPushSubscribed } from '@/lib/fcm'
import { MarketingNav } from '@/components/layout/marketing-nav'
import { MarketingFooter } from '@/components/layout/marketing-footer'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { token, user, fetchMe, impersonating, exitImpersonation } = useAuthStore()
  const { fetchMyRole } = useRoleStore()
  const { fetchNotifications } = useSettingsStore()

  // Connect WebSocket for realtime sync + notifications
  useRealtimeSync()

  // Auth + initial data loading
  useEffect(() => {
    if (!token) { router.push('/login'); return }
    if (!user) fetchMe()
    fetchMyRole()
    fetchNotifications()
  }, [token, user, router, fetchMe])

  // Auto-request push notification permission on first visit
  useEffect(() => {
    if (!token || !user) return
    const timer = setTimeout(async () => {
      if (typeof window === 'undefined' || !('Notification' in window)) return
      if (Notification.permission !== 'default') return // already decided
      const subscribed = await isPushSubscribed()
      if (!subscribed) {
        await requestNotificationPermission()
      }
    }, 3000) // delay 3s to not interrupt the user immediately
    return () => clearTimeout(timer)
  }, [token, user])

  if (!token) return null

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--color-bg)' }}>
      {/* Impersonation banner */}
      {impersonating && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999,
          background: 'linear-gradient(90deg, #f59e0b, #d97706)',
          padding: '8px 20px', display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <i className="bx bx-user-check" style={{ fontSize: 15, color: '#fff' }} />
          <span style={{ fontSize: 13, fontWeight: 500, color: '#fff', flex: 1 }}>
            Impersonating <strong>{impersonating.name}</strong> ({impersonating.email})
          </span>
          <button
            onClick={() => exitImpersonation()}
            style={{ background: 'rgba(255,255,255,0.25)', border: '1px solid rgba(255,255,255,0.4)', borderRadius: 6, padding: '3px 10px', fontSize: 12, fontWeight: 600, color: '#fff', cursor: 'pointer' }}
          >
            Exit
          </button>
        </div>
      )}

      <MarketingNav />
      <main style={{ flex: 1 }}>{children}</main>
      <MarketingFooter />
      <NotificationToast />
    </div>
  )
}
