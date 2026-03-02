/**
 * Firebase Cloud Messaging wrapper
 * Handles push notifications and FCM token management
 */

import { getToken, onMessage, MessagePayload } from 'firebase/messaging';
import { getFirebaseMessaging } from './config';

/**
 * Request notification permission and get FCM token
 */
export async function requestNotificationPermission(): Promise<string | null> {
  const messaging = getFirebaseMessaging();
  if (!messaging) {
    console.warn('[FCM] Messaging not available');
    return null;
  }

  try {
    // Request permission
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.log('[FCM] Notification permission denied');
      return null;
    }

    // Get FCM token
    const token = await getToken(messaging, {
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY, // Add to .env
    });

    console.log('[FCM] Token obtained:', token.substring(0, 20) + '...');
    return token;
  } catch (err) {
    console.error('[FCM] Failed to get token:', err);
    return null;
  }
}

/**
 * Listen for foreground messages
 */
export function listenForMessages(callback: (payload: MessagePayload) => void): () => void {
  const messaging = getFirebaseMessaging();
  if (!messaging) {
    console.warn('[FCM] Messaging not available');
    return () => {};
  }

  const unsubscribe = onMessage(messaging, (payload) => {
    console.log('[FCM] Foreground message received:', payload);
    callback(payload);
  });

  return unsubscribe;
}

/**
 * Show desktop notification
 */
export function showNotification(title: string, options?: NotificationOptions): void {
  if (!('Notification' in window)) {
    console.warn('[FCM] Notifications not supported');
    return;
  }

  if (Notification.permission === 'granted') {
    new Notification(title, options);
  }
}

/**
 * Handle incoming push notification
 */
export function handlePushNotification(payload: MessagePayload): void {
  const { notification, data } = payload;

  if (notification) {
    showNotification(notification.title || 'Orchestra MCP', {
      body: notification.body,
      icon: notification.icon || '/icon.png',
      badge: '/badge.png',
      tag: data?.tag || 'default',
      data: data,
    });
  }

  // You can also dispatch custom events or update UI here
  window.dispatchEvent(
    new CustomEvent('push-notification', {
      detail: payload,
    })
  );
}
