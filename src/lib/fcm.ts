import { getApps, initializeApp } from 'firebase/app'
import { getMessaging, getToken, onMessage, type Messaging } from 'firebase/messaging'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'FIREBASE_API_KEY',
  authDomain: 'orchestra-mcp.firebaseapp.com',
  projectId: 'orchestra-mcp',
  storageBucket: 'orchestra-mcp.appspot.com',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_SENDER_ID || '000000000000',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:000000000000:web:0000000000000000',
}

let messaging: Messaging | null = null

function getMessagingInstance(): Messaging | null {
  if (typeof window === 'undefined') return null
  if (messaging) return messaging

  const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
  messaging = getMessaging(app)
  return messaging
}

export async function requestNotificationPermission(): Promise<string | null> {
  try {
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') return null

    const m = getMessagingInstance()
    if (!m) return null

    const token = await getToken(m, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY || '',
    })
    return token
  } catch (e) {
    console.error('[FCM] Failed to get token:', e)
    return null
  }
}

export function onForegroundMessage(callback: (payload: any) => void): (() => void) | null {
  const m = getMessagingInstance()
  if (!m) return null
  return onMessage(m, callback)
}

export async function subscribeDevice(token: string): Promise<void> {
  await fetch('/api/notifications/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, platform: 'web' }),
  })
}
