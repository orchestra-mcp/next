"use client";

import { useEffect } from 'react';
import './Notification.css';

export interface NotificationProps {
  id?: string;
  title?: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top-center' | 'bottom-center';
  duration?: number;
  onClose?: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export const Notification = ({
  id,
  title,
  message,
  type = 'info',
  position = 'top-right',
  duration = 5000,
  onClose,
  action,
  className = '',
}: NotificationProps) => {
  useEffect(() => {
    if (duration > 0 && onClose) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const classes = [
    'notification',
    `notification--${type}`,
    `notification--${position}`,
    className,
  ].filter(Boolean).join(' ');

  return (
    <div id={id} role="alert" aria-live="polite" className={classes}>
      <div className="notification__body">
        <div className="notification__content">
          {title && <h4 className="notification__title">{title}</h4>}
          <p className="notification__message">{message}</p>
          {action && (
            <button type="button" className="notification__action" onClick={action.onClick}>
              {action.label}
            </button>
          )}
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close notification"
            className="notification__close"
          >
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};
