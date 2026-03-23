// src/lib/fcm.ts — Web Push API (no Firebase)

function getApiUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL || ''
}

function getAuthHeaders(): HeadersInit {
  let token: string | null = null
  if (typeof window !== 'undefined') {
    try { const s = JSON.parse(localStorage.getItem('orchestra-auth') ?? '{}'); token = s?.state?.mcpToken ?? null } catch {}
  }
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`
  return headers
}

export async function requestNotificationPermission(): Promise<PushSubscription | null> {
  try {
    if (!('Notification' in window) || !('serviceWorker' in navigator)) return null

    const permission = await Notification.requestPermission()
    if (permission !== 'granted') return null

    const registration = await navigator.serviceWorker.register('/sw.js')
    await navigator.serviceWorker.ready

    const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
    if (!vapidKey) {
      console.warn('[Push] No VAPID public key configured')
      return null
    }

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidKey),
    })

    // Register with backend
    const keys = subscription.toJSON().keys ?? {}
    await fetch(`${getApiUrl()}/api/notifications/push/subscribe`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        endpoint: subscription.endpoint,
        p256dh: keys.p256dh ?? '',
        auth: keys.auth ?? '',
        platform: 'web',
        user_agent: navigator.userAgent,
      }),
    })

    return subscription
  } catch (e) {
    console.error('[Push] Failed to subscribe:', e)
    return null
  }
}

export async function unsubscribeDevice(): Promise<void> {
  try {
    const registration = await navigator.serviceWorker.getRegistration()
    const subscription = await registration?.pushManager.getSubscription()
    if (!subscription) return

    await subscription.unsubscribe()
    await fetch(`${getApiUrl()}/api/notifications/push/unsubscribe`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
      body: JSON.stringify({ endpoint: subscription.endpoint }),
    })
  } catch (e) {
    console.error('[Push] Failed to unsubscribe:', e)
  }
}

// Check if push is currently subscribed
export async function isPushSubscribed(): Promise<boolean> {
  try {
    const registration = await navigator.serviceWorker.getRegistration()
    const subscription = await registration?.pushManager.getSubscription()
    return !!subscription
  } catch {
    return false
  }
}

// Helper: convert VAPID base64 to Uint8Array
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}
