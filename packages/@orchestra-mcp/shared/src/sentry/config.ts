/**
 * Sentry Error Tracking Configuration
 * Used by all frontend platforms (Desktop, Chrome, Mobile)
 */

import * as Sentry from '@sentry/react';

// Sentry configuration from environment variables
const sentryConfig = {
  dsn: import.meta.env.VITE_SENTRY_DSN || '',
  environment: import.meta.env.VITE_SENTRY_ENVIRONMENT || 'development',
  release: import.meta.env.VITE_SENTRY_RELEASE || '1.0.0',
  tracesSampleRate: parseFloat(import.meta.env.VITE_SENTRY_TRACES_SAMPLE_RATE || '1.0'),
  replaysSessionSampleRate: parseFloat(import.meta.env.VITE_SENTRY_REPLAYS_SESSION_SAMPLE_RATE || '0.1'),
  replaysOnErrorSampleRate: parseFloat(import.meta.env.VITE_SENTRY_REPLAYS_ERROR_SAMPLE_RATE || '1.0'),
};

let initialized = false;

/**
 * Initialize Sentry (call once at app startup)
 */
export function initializeSentry(): void {
  if (initialized) {
    console.warn('Sentry already initialized');
    return;
  }

  if (!sentryConfig.dsn) {
    console.warn('Sentry DSN not provided, error tracking disabled');
    return;
  }

  Sentry.init({
    dsn: sentryConfig.dsn,
    environment: sentryConfig.environment,
    release: sentryConfig.release,

    // Performance Monitoring
    tracesSampleRate: sentryConfig.tracesSampleRate,

    // Session Replay
    integrations: [
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    replaysSessionSampleRate: sentryConfig.replaysSessionSampleRate,
    replaysOnErrorSampleRate: sentryConfig.replaysOnErrorSampleRate,

    // Filter out sensitive data
    beforeSend(event, hint) {
      // Don't send events in development unless explicitly enabled
      if (sentryConfig.environment === 'development' && !import.meta.env.VITE_SENTRY_DEV_ENABLED) {
        return null;
      }

      // Remove sensitive headers/cookies
      if (event.request) {
        delete event.request.cookies;
        if (event.request.headers) {
          delete event.request.headers['Authorization'];
          delete event.request.headers['Cookie'];
        }
      }

      return event;
    },

    // Ignore specific errors
    ignoreErrors: [
      // Browser extensions
      'top.GLOBALS',
      'originalCreateNotification',
      'canvas.contentDocument',
      'MyApp_RemoveAllHighlights',
      // Network errors
      'NetworkError',
      'Network request failed',
      // React errors we handle gracefully
      'ResizeObserver loop limit exceeded',
    ],

    // Ignore specific URLs
    denyUrls: [
      // Browser extensions
      /extensions\//i,
      /^chrome:\/\//i,
      /^chrome-extension:\/\//i,
    ],
  });

  initialized = true;

  console.log('✓ Sentry initialized', {
    environment: sentryConfig.environment,
    release: sentryConfig.release,
    dsn: sentryConfig.dsn.substring(0, 30) + '...',
  });
}

/**
 * Check if Sentry is initialized
 */
export function isSentryInitialized(): boolean {
  return initialized;
}

/**
 * Get Sentry config
 */
export function getSentryConfig() {
  return sentryConfig;
}

export { sentryConfig };
