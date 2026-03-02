import type { FC } from 'react';
import './StaleNotification.css';

export interface StaleNotificationProps {
  onRefresh: () => void;
  onDismiss: () => void;
}

export const StaleNotification: FC<StaleNotificationProps> = ({
  onRefresh,
  onDismiss,
}) => {
  return (
    <div className="stale-notification" role="status" data-testid="stale-notification">
      <span className="stale-notification__text">Task updated externally</span>
      <button
        type="button"
        className="stale-notification__btn stale-notification__btn--refresh"
        onClick={onRefresh}
      >
        Refresh
      </button>
      <button
        type="button"
        className="stale-notification__btn stale-notification__btn--dismiss"
        onClick={onDismiss}
        aria-label="Dismiss"
      >
        &#x2715;
      </button>
    </div>
  );
};
