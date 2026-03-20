/**
 * Tests for web push notification system
 * Validates: fcm.ts structure, NotificationToast, layout integration, service worker
 */
import { describe, it, expect } from 'vitest'
import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'

const root = resolve(__dirname, '../..')

describe('fcm.ts (Web Push API)', () => {
  const fcm = readFileSync(resolve(root, 'src/lib/fcm.ts'), 'utf-8')

  it('does NOT import firebase', () => {
    expect(fcm).not.toContain("from 'firebase/app'")
    expect(fcm).not.toContain("from 'firebase/messaging'")
    expect(fcm).not.toContain('importScripts')
  })

  it('exports requestNotificationPermission', () => {
    expect(fcm).toContain('export async function requestNotificationPermission')
  })

  it('exports isPushSubscribed', () => {
    expect(fcm).toContain('export async function isPushSubscribed')
  })

  it('exports unsubscribeDevice', () => {
    expect(fcm).toContain('export async function unsubscribeDevice')
  })

  it('uses correct backend endpoint for subscribe', () => {
    expect(fcm).toContain('/api/notifications/push/subscribe')
  })

  it('uses correct backend endpoint for unsubscribe', () => {
    expect(fcm).toContain('/api/notifications/push/unsubscribe')
  })

  it('sends VAPID subscription fields (endpoint, p256dh, auth)', () => {
    expect(fcm).toContain('endpoint:')
    expect(fcm).toContain('p256dh:')
    expect(fcm).toContain('auth:')
  })

  it('uses NEXT_PUBLIC_VAPID_PUBLIC_KEY env var', () => {
    expect(fcm).toContain('NEXT_PUBLIC_VAPID_PUBLIC_KEY')
  })

  it('registers /sw.js service worker', () => {
    expect(fcm).toContain("register('/sw.js')")
  })

  it('includes Authorization header', () => {
    expect(fcm).toContain('Authorization')
    expect(fcm).toContain('Bearer')
  })
})

describe('NotificationToast component', () => {
  const toast = readFileSync(resolve(root, 'src/components/NotificationToast.tsx'), 'utf-8')

  it('exists', () => {
    expect(existsSync(resolve(root, 'src/components/NotificationToast.tsx'))).toBe(true)
  })

  it('imports onNotifToast from useRealtimeSync', () => {
    expect(toast).toContain("from '@/hooks/useRealtimeSync'")
    expect(toast).toContain('onNotifToast')
  })

  it('exports NotificationToast function', () => {
    expect(toast).toContain('export function NotificationToast')
  })

  it('supports all notification types', () => {
    expect(toast).toContain("info:")
    expect(toast).toContain("success:")
    expect(toast).toContain("warning:")
    expect(toast).toContain("error:")
  })

  it('auto-dismisses toasts', () => {
    expect(toast).toContain('setTimeout')
    expect(toast).toContain('5000')
  })

  it('has dismiss button', () => {
    expect(toast).toContain('dismiss')
    expect(toast).toContain('bx-x')
  })
})

describe('App layout integration', () => {
  const layout = readFileSync(resolve(root, 'src/app/(app)/layout.tsx'), 'utf-8')

  it('uses useRealtimeSync hook', () => {
    expect(layout).toContain("from '@/hooks/useRealtimeSync'")
    expect(layout).toContain('useRealtimeSync()')
  })

  it('renders NotificationToast', () => {
    expect(layout).toContain("from '@/components/NotificationToast'")
    expect(layout).toContain('<NotificationToast')
  })

  it('imports push notification functions', () => {
    expect(layout).toContain('requestNotificationPermission')
    expect(layout).toContain('isPushSubscribed')
  })

  it('auto-requests push permission with delay', () => {
    expect(layout).toContain('setTimeout')
    expect(layout).toContain('3000')
    expect(layout).toContain("Notification.permission !== 'default'")
  })
})

describe('Service workers', () => {
  it('sw.js exists with push handler', () => {
    const sw = readFileSync(resolve(root, 'public/sw.js'), 'utf-8')
    expect(sw).toContain("addEventListener('push'")
    expect(sw).toContain("addEventListener('notificationclick'")
  })

  it('firebase-messaging-sw.js does NOT use Firebase', () => {
    const fbSw = readFileSync(resolve(root, 'public/firebase-messaging-sw.js'), 'utf-8')
    expect(fbSw).not.toContain('importScripts')
    expect(fbSw).not.toContain('firebase.initializeApp')
    expect(fbSw).not.toContain('firebase.messaging')
    expect(fbSw).toContain("addEventListener('push'")
  })
})

describe('useRealtimeSync notification handling', () => {
  const sync = readFileSync(resolve(root, 'src/hooks/useRealtimeSync.ts'), 'utf-8')

  it('emits toast on notification event', () => {
    expect(sync).toContain('emitNotifToast')
  })

  it('fires browser notification if permission granted', () => {
    expect(sync).toContain('new window.Notification')
    expect(sync).toContain("Notification.permission === 'granted'")
  })

  it('exports onNotifToast subscriber', () => {
    expect(sync).toContain('export function onNotifToast')
  })
})
