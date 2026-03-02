"use client";

import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { ToastType, ToastAction } from './ToasterContext';

interface ToasterItemProps {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration: number;
  action?: ToastAction;
  icon?: ReactNode;
  onDismiss: (id: string) => void;
}

const typeIcons: Record<ToastType, ReactNode> = {
  success: (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <path d="M6 10l3 3 5-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  error: (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <path d="M13 7L7 13M7 7l6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  warning: (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <path d="M10 7v4M10 13h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  info: (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <path d="M10 9v4M10 7h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  loading: (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" className="toast__spinner">
      <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="2" opacity="0.3" />
      <path d="M10 3a7 7 0 014.95 2.05" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
};

export const ToasterItem = ({
  id, type, title, message, duration, action, icon, onDismiss,
}: ToasterItemProps) => {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (duration <= 0) return;
    const timer = setTimeout(() => {
      setExiting(true);
      setTimeout(() => onDismiss(id), 200);
    }, duration);
    return () => clearTimeout(timer);
  }, [id, duration, onDismiss]);

  const handleDismiss = () => {
    setExiting(true);
    setTimeout(() => onDismiss(id), 200);
  };

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`toast toast--${type}${exiting ? ' toast--exit' : ''}`}
      data-toast-id={id}
    >
      <div className="toast__icon">{icon ?? typeIcons[type]}</div>
      <div className="toast__content">
        <p className="toast__title">{title}</p>
        {message && <p className="toast__message">{message}</p>}
        {action && (
          <button type="button" className="toast__action" onClick={action.onClick}>
            {action.label}
          </button>
        )}
      </div>
      <button type="button" className="toast__close" onClick={handleDismiss} aria-label="Dismiss toast">
        <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
          <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>
      {duration > 0 && (
        <div className="toast__countdown" style={{ animationDuration: `${duration}ms` }} />
      )}
    </div>
  );
};
