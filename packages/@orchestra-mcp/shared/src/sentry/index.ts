/**
 * Sentry integration for Orchestra MCP
 * Exports all Sentry utilities
 */

export {
  initializeSentry,
  isSentryInitialized,
  getSentryConfig,
  sentryConfig,
} from './config';

export {
  captureException,
  captureMessage,
  captureErrorWithContext,
  setUser,
  setTag,
  setTags,
  setExtra,
  setExtras,
  addBreadcrumb,
  startTransaction,
  setContext,
  clearScope,
  logApiError,
  logNavigationError,
  logComponentError,
} from './capture';

export { ErrorBoundary, withErrorBoundary } from './ErrorBoundary';

// Re-export Sentry types for convenience
export type { User, Breadcrumb, SeverityLevel } from '@sentry/react';
