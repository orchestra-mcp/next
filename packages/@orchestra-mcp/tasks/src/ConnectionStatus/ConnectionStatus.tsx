import type { FC } from 'react';
import './ConnectionStatus.css';

export interface ConnectionStatusProps {
  status: 'connected' | 'reconnecting' | 'disconnected';
}

const STATUS_LABELS: Record<ConnectionStatusProps['status'], string> = {
  connected: 'Connected',
  reconnecting: 'Reconnecting...',
  disconnected: 'Connection lost',
};

const BANNER_TEXT: Record<string, string> = {
  reconnecting: 'Reconnecting to server...',
  disconnected: 'Connection lost. Click refresh to retry.',
};

/** Full indicator: dot + optional banner. Use display:contents parent or standalone. */
export const ConnectionStatus: FC<ConnectionStatusProps> = ({ status }) => {
  const label = STATUS_LABELS[status];
  const bannerText = BANNER_TEXT[status];

  return (
    <div className="connection-status" data-testid="connection-status">
      <span
        className={`connection-status__dot connection-status__dot--${status}`}
        title={label}
        aria-label={label}
        role="status"
      />
      {bannerText && (
        <div
          className={`connection-status__banner connection-status__banner--${status}`}
          role="alert"
          data-testid="connection-status-banner"
        >
          {bannerText}
        </div>
      )}
    </div>
  );
};

/** Just the 8px dot indicator. For embedding inline in a header row. */
export const ConnectionStatusDot: FC<ConnectionStatusProps> = ({ status }) => {
  const label = STATUS_LABELS[status];

  return (
    <span
      className={`connection-status__dot connection-status__dot--${status}`}
      title={label}
      aria-label={label}
      role="status"
      data-testid="connection-status-dot"
    />
  );
};

/** Just the banner. For rendering below a header when status is not connected. */
export const ConnectionStatusBanner: FC<ConnectionStatusProps> = ({ status }) => {
  const bannerText = BANNER_TEXT[status];
  if (!bannerText) return null;

  return (
    <div
      className={`connection-status__banner connection-status__banner--${status}`}
      role="alert"
      data-testid="connection-status-banner"
    >
      {bannerText}
    </div>
  );
};
