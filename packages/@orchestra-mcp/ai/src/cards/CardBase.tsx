"use client";

import { useState, useRef } from 'react';
import type { ReactNode } from 'react';
import './CardBase.css';

export interface CardBaseProps {
  title: string;
  icon?: ReactNode;
  badge?: string;
  badgeColor?: 'success' | 'warning' | 'danger' | 'info' | 'gray';
  status?: string;
  defaultCollapsed?: boolean;
  headerActions?: ReactNode;
  timestamp?: string;
  children: ReactNode;
  className?: string;
}

function StatusIcon({ status, badgeColor }: { status?: string; badgeColor?: string }) {
  if (status === 'running') {
    return (
      <span
        className="card-base__status-icon card-base__status-icon--running"
        aria-label="Running"
        data-testid="status-icon-running"
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
          <circle
            cx="8"
            cy="8"
            r="6"
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray="28.27"
            strokeDashoffset="8"
            strokeLinecap="round"
          />
        </svg>
      </span>
    );
  }

  if (status === 'done') {
    return (
      <span
        className="card-base__status-icon card-base__status-icon--done"
        aria-label="Done"
        data-testid="status-icon-done"
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
          <path
            d="M3.5 8.5L6.5 11.5L12.5 4.5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    );
  }

  if (status === 'error' || (!status && badgeColor === 'danger')) {
    return (
      <span
        className="card-base__status-icon card-base__status-icon--error"
        aria-label="Error"
        data-testid="status-icon-error"
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
          <path
            d="M4.5 4.5L11.5 11.5M11.5 4.5L4.5 11.5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </span>
    );
  }

  return null;
}

export const CardBase = ({
  title,
  icon,
  badge,
  badgeColor = 'gray',
  status,
  defaultCollapsed = true,
  headerActions,
  timestamp,
  children,
  className,
}: CardBaseProps) => {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  // Only enable the collapse transition after the user has explicitly toggled
  // the card. This prevents the grid-row animation from firing on initial mount
  // or when the parent re-renders (e.g. session switch).
  const interactedRef = useRef(false);

  const handleToggle = () => {
    interactedRef.current = true;
    setCollapsed((c) => !c);
  };

  return (
    <div
      className={`card-base${className ? ` ${className}` : ''}`}
      data-status={status}
      data-badge-color={!status ? badgeColor : undefined}
      data-testid="card-base"
    >
      <div className="card-base__header-row">
        <button
          type="button"
          className="card-base__header"
          onClick={handleToggle}
          aria-expanded={!collapsed}
        >
          {icon && <span className="card-base__icon">{icon}</span>}
          <StatusIcon status={status} badgeColor={badgeColor} />
          <span className="card-base__title" title={title}>
            {title}
          </span>
          {badge && (
            <span className={`card-base__badge card-base__badge--${badgeColor}`}>
              {badge}
            </span>
          )}
          {timestamp && (
            <time className="card-base__time">{timestamp}</time>
          )}
          <span
            className={`card-base__chevron${collapsed ? '' : ' card-base__chevron--open'}`}
            aria-hidden="true"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </span>
        </button>
        {headerActions && (
          <div className="card-base__actions">
            {headerActions}
          </div>
        )}
      </div>

      <div
        className={[
          'card-base__body',
          collapsed ? 'card-base__body--collapsed' : '',
          interactedRef.current ? 'card-base__body--animated' : '',
        ].filter(Boolean).join(' ')}
        data-testid="card-base-body"
      >
        <div className="card-base__body-inner">
          <div className="card-base__content">{children}</div>
        </div>
      </div>
    </div>
  );
};
