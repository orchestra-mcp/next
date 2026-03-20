'use client'
import { useState, useEffect, useCallback } from 'react'
import { requestNotificationPermission, onForegroundMessage, subscribeDevice } from '@/lib/fcm'

interface Notification {
  id: string
  title: string
  body: string
  read: boolean
  created_at: string
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [open, setOpen] = useState(false)
  const [permissionGranted, setPermissionGranted] = useState(false)

  const unreadCount = notifications.filter(n => !n.read).length

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications?limit=10')
      if (res.ok) {
        const data = await res.json()
        setNotifications(data.data ?? [])
      }
    } catch {}
  }, [])

  useEffect(() => {
    fetchNotifications()

    // Setup FCM foreground listener
    const unsub = onForegroundMessage((payload: any) => {
      const n: Notification = {
        id: Date.now().toString(),
        title: payload.notification?.title ?? 'New notification',
        body: payload.notification?.body ?? '',
        read: false,
        created_at: new Date().toISOString(),
      }
      setNotifications(prev => [n, ...prev])
    })

    return () => { unsub?.() }
  }, [fetchNotifications])

  const handleEnableNotifications = async () => {
    const token = await requestNotificationPermission()
    if (token) {
      await subscribeDevice(token)
      setPermissionGranted(true)
    }
  }

  const markAsRead = async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    try {
      await fetch(`/api/notifications/${id}/read`, { method: 'PATCH' })
    } catch {}
  }

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          background: 'transparent', border: 'none', cursor: 'pointer',
          padding: 8, borderRadius: 8, position: 'relative',
          color: 'var(--color-fg-muted, rgba(255,255,255,0.5))',
        }}
      >
        <i className="bx bx-bell" style={{ fontSize: 22 }} />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute', top: 4, right: 4,
            width: 16, height: 16, borderRadius: '50%',
            background: '#ef4444', color: '#fff',
            fontSize: 10, fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: '100%', right: 0, marginTop: 8,
          width: 340, maxHeight: 400, overflowY: 'auto',
          borderRadius: 14, padding: 8,
          background: 'var(--color-bg-alt, #1a1a1a)',
          border: '1px solid var(--color-border, rgba(255,255,255,0.07))',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          zIndex: 1000,
        }}>
          <div style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-fg, #f8f8f8)' }}>Notifications</span>
            {!permissionGranted && typeof Notification !== 'undefined' && Notification.permission !== 'granted' && (
              <button
                onClick={handleEnableNotifications}
                style={{
                  fontSize: 11, padding: '4px 10px', borderRadius: 6,
                  background: 'rgba(0, 229, 255, 0.1)', color: '#00e5ff',
                  border: '1px solid rgba(0, 229, 255, 0.2)', cursor: 'pointer',
                }}
              >
                Enable Push
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <p style={{ padding: '20px 12px', textAlign: 'center', color: 'var(--color-fg-dim, rgba(255,255,255,0.3))', fontSize: 13 }}>
              No notifications yet
            </p>
          ) : notifications.map(n => (
            <div
              key={n.id}
              onClick={() => markAsRead(n.id)}
              style={{
                padding: '10px 12px', borderRadius: 8, cursor: 'pointer',
                background: n.read ? 'transparent' : 'rgba(0, 229, 255, 0.04)',
                marginBottom: 2,
              }}
            >
              <div style={{ fontSize: 13, fontWeight: n.read ? 400 : 600, color: 'var(--color-fg, #f8f8f8)', marginBottom: 2 }}>
                {n.title}
              </div>
              {n.body && (
                <div style={{ fontSize: 12, color: 'var(--color-fg-muted, rgba(255,255,255,0.45))' }}>
                  {n.body}
                </div>
              )}
              <div style={{ fontSize: 11, color: 'var(--color-fg-dim, rgba(255,255,255,0.25))', marginTop: 4 }}>
                {new Date(n.created_at).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
