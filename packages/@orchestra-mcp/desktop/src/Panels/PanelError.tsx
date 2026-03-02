"use client";

import { useEffect } from 'react';
import { ErrorIcon } from '@orchestra-mcp/icons';
import { Button } from '@orchestra-mcp/ui';

interface PanelErrorProps {
  error: Error;
  route: string;
  onReload?: () => void;
}

/**
 * Error state when a panel component throws during render.
 * Uses Button from @orchestra-mcp/ui and ErrorIcon from @orchestra-mcp/icons.
 */
export function PanelError({ error, route, onReload }: PanelErrorProps) {
  useEffect(() => {
    console.error('Panel error:', error);
  }, [error]);

  const handleReload = () => {
    if (onReload) {
      onReload();
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="desktop-panel-state">
      <div className="desktop-panel-state__icon">
        <ErrorIcon size={40} />
      </div>
      <h2 className="desktop-panel-state__title desktop-panel-state__title--error">
        Panel Error
      </h2>
      <p className="desktop-panel-state__message">
        An error occurred while rendering the panel at{' '}
        <code className="desktop-panel-state__route">{route}</code>
      </p>
      <div className="desktop-panel-state__stack">
        <p className="desktop-panel-state__stack-error">{error.message}</p>
        {error.stack && (
          <details className="desktop-panel-state__stack-toggle">
            <summary>Stack trace</summary>
            <pre className="desktop-panel-state__stack-trace">{error.stack}</pre>
          </details>
        )}
      </div>
      <Button
        label="Reload Panel"
        variant="filled"
        color="danger"
        size="sm"
        onClick={handleReload}
      />
    </div>
  );
}
