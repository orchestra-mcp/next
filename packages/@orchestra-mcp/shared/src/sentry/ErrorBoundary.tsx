/**
 * React Error Boundary with Sentry integration
 */

import React, { Component, ReactNode } from 'react';
import * as Sentry from '@sentry/react';
import { logComponentError } from './capture';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary component with Sentry integration
 * Catches React component errors and reports them to Sentry
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log to Sentry
    logComponentError('ErrorBoundary', error, errorInfo);

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);

    console.error('ErrorBoundary caught error:', error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          style={{
            padding: '20px',
            textAlign: 'center',
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          <h2 style={{ color: '#e53e3e', marginBottom: '10px' }}>Something went wrong</h2>
          <p style={{ color: '#718096', marginBottom: '20px' }}>
            We've been notified and are working on a fix.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '10px 20px',
              background: '#3182ce',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            Reload Page
          </button>
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <pre
              style={{
                marginTop: '20px',
                padding: '15px',
                background: '#1a202c',
                color: '#e2e8f0',
                borderRadius: '6px',
                textAlign: 'left',
                fontSize: '12px',
                overflow: 'auto',
              }}
            >
              {this.state.error.toString()}
              {this.state.error.stack}
            </pre>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Higher-order component to wrap components with Sentry Error Boundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
): React.FC<P> {
  return (props: P) => (
    <Sentry.ErrorBoundary fallback={fallback}>
      <Component {...props} />
    </Sentry.ErrorBoundary>
  );
}
