/**
 * Sentry Error Capturing Utilities
 */

import * as Sentry from '@sentry/react';
import { isSentryInitialized } from './config';

/**
 * Capture an exception
 */
export function captureException(error: Error, context?: Record<string, any>): string | undefined {
  if (!isSentryInitialized()) {
    console.error('Sentry not initialized, error:', error);
    return;
  }

  return Sentry.captureException(error, {
    contexts: context ? { custom: context } : undefined,
  });
}

/**
 * Capture a message
 */
export function captureMessage(message: string, level: Sentry.SeverityLevel = 'info'): string | undefined {
  if (!isSentryInitialized()) {
    console.log(`[Sentry] ${level}:`, message);
    return;
  }

  return Sentry.captureMessage(message, level);
}

/**
 * Capture an error with additional context
 */
export function captureErrorWithContext(
  error: Error,
  tags?: Record<string, string>,
  extras?: Record<string, any>,
  user?: Sentry.User
): string | undefined {
  if (!isSentryInitialized()) {
    console.error('Sentry not initialized, error:', error, { tags, extras, user });
    return;
  }

  return Sentry.withScope((scope) => {
    if (tags) {
      Object.entries(tags).forEach(([key, value]) => scope.setTag(key, value));
    }
    if (extras) {
      Object.entries(extras).forEach(([key, value]) => scope.setExtra(key, value));
    }
    if (user) {
      scope.setUser(user);
    }
    return Sentry.captureException(error);
  });
}

/**
 * Set user context
 */
export function setUser(user: Sentry.User | null): void {
  if (!isSentryInitialized()) {
    return;
  }

  Sentry.setUser(user);
}

/**
 * Set a tag
 */
export function setTag(key: string, value: string): void {
  if (!isSentryInitialized()) {
    return;
  }

  Sentry.setTag(key, value);
}

/**
 * Set multiple tags
 */
export function setTags(tags: Record<string, string>): void {
  if (!isSentryInitialized()) {
    return;
  }

  Sentry.setTags(tags);
}

/**
 * Set extra context
 */
export function setExtra(key: string, value: any): void {
  if (!isSentryInitialized()) {
    return;
  }

  Sentry.setExtra(key, value);
}

/**
 * Set multiple extras
 */
export function setExtras(extras: Record<string, any>): void {
  if (!isSentryInitialized()) {
    return;
  }

  Sentry.setExtras(extras);
}

/**
 * Add a breadcrumb
 */
export function addBreadcrumb(breadcrumb: Sentry.Breadcrumb): void {
  if (!isSentryInitialized()) {
    return;
  }

  Sentry.addBreadcrumb(breadcrumb);
}

/**
 * Start a transaction for performance monitoring
 */
export function startTransaction(name: string, op?: string): Sentry.Transaction | undefined {
  if (!isSentryInitialized()) {
    return;
  }

  return Sentry.startTransaction({ name, op });
}

/**
 * Set context for a specific key
 */
export function setContext(key: string, context: Record<string, any> | null): void {
  if (!isSentryInitialized()) {
    return;
  }

  Sentry.setContext(key, context);
}

/**
 * Clear current scope
 */
export function clearScope(): void {
  if (!isSentryInitialized()) {
    return;
  }

  Sentry.getCurrentScope().clear();
}

/**
 * Log an API error
 */
export function logApiError(endpoint: string, statusCode: number, error: Error): void {
  captureErrorWithContext(
    error,
    {
      api_endpoint: endpoint,
      status_code: statusCode.toString(),
      error_type: 'api_error',
    },
    {
      endpoint,
      statusCode,
      errorMessage: error.message,
    }
  );
}

/**
 * Log a navigation error
 */
export function logNavigationError(path: string, error: Error): void {
  captureErrorWithContext(
    error,
    {
      navigation_path: path,
      error_type: 'navigation_error',
    },
    {
      path,
      errorMessage: error.message,
    }
  );
}

/**
 * Log a component error
 */
export function logComponentError(componentName: string, error: Error, errorInfo?: React.ErrorInfo): void {
  captureErrorWithContext(
    error,
    {
      component_name: componentName,
      error_type: 'component_error',
    },
    {
      componentName,
      componentStack: errorInfo?.componentStack,
      errorMessage: error.message,
    }
  );
}
