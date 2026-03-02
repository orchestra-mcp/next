/**
 * Firebase Client SDK Configuration
 * Used by all frontend platforms (Desktop, Chrome, Mobile)
 */

import { initializeApp, FirebaseApp, FirebaseOptions } from 'firebase/app';
import { getAnalytics, Analytics } from 'firebase/analytics';
import { getMessaging, Messaging } from 'firebase/messaging';

// Firebase configuration from environment variables (set in .env)
const firebaseConfig: FirebaseOptions = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || '',
};

// Singleton instances
let app: FirebaseApp | null = null;
let analytics: Analytics | null = null;
let messaging: Messaging | null = null;

/**
 * Initialize Firebase app (call once at app startup)
 */
export function initializeFirebase(): FirebaseApp {
  if (app) {
    return app;
  }

  if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    throw new Error(
      'Firebase not configured. Set VITE_FIREBASE_API_KEY and VITE_FIREBASE_PROJECT_ID in .env',
    );
  }

  app = initializeApp(firebaseConfig);

  // Initialize Analytics (browser only)
  if (typeof window !== 'undefined') {
    try {
      analytics = getAnalytics(app);
      console.log('✓ Firebase Analytics initialized');
    } catch (err) {
      console.warn('Firebase Analytics not available:', err);
    }
  }

  console.log('✓ Firebase initialized', {
    projectId: firebaseConfig.projectId,
    appId: firebaseConfig.appId,
  });

  return app;
}

/**
 * Get Firebase app instance
 */
export function getFirebaseApp(): FirebaseApp {
  if (!app) {
    return initializeFirebase();
  }
  return app;
}

/**
 * Get Analytics instance (browser only)
 */
export function getFirebaseAnalytics(): Analytics | null {
  if (!analytics && typeof window !== 'undefined') {
    try {
      analytics = getAnalytics(getFirebaseApp());
    } catch (err) {
      console.warn('Firebase Analytics not available:', err);
    }
  }
  return analytics;
}

/**
 * Get Messaging instance for push notifications (browser only)
 */
export function getFirebaseMessaging(): Messaging | null {
  if (!messaging && typeof window !== 'undefined') {
    try {
      messaging = getMessaging(getFirebaseApp());
      console.log('✓ Firebase Messaging initialized');
    } catch (err) {
      console.warn('Firebase Messaging not available:', err);
    }
  }
  return messaging;
}

/**
 * Check if Firebase is initialized
 */
export function isFirebaseInitialized(): boolean {
  return app !== null;
}

export { firebaseConfig };
