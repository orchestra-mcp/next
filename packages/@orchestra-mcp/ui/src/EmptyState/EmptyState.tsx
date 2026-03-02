import type { ReactNode } from 'react';
import './EmptyState.css';

export interface EmptyStateProps {
  /** Icon element displayed above the title */
  icon?: ReactNode;
  /** Primary message */
  title: string;
  /** Secondary description */
  description?: string;
  /** Optional action button or element */
  action?: ReactNode;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
}

export const EmptyState = ({
  icon,
  title,
  description,
  action,
  size = 'md',
}: EmptyStateProps) => (
  <div className={`empty-state empty-state--${size}`}>
    {icon && <span className="empty-state__icon">{icon}</span>}
    <span className="empty-state__title">{title}</span>
    {description && <span className="empty-state__desc">{description}</span>}
    {action && <div className="empty-state__action">{action}</div>}
  </div>
);
