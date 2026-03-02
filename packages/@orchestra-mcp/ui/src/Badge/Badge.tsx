import type { ReactNode } from 'react';
import './Badge.css';

export interface BadgeProps {
  /** Badge text label */
  label?: string;
  /** Visual variant */
  variant?: 'outlined' | 'filled' | 'soft';
  /** Color scheme */
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'gray';
  /** Size */
  size?: 'xs' | 'sm' | 'md' | 'lg';
  /** Numeric count (overrides label, 99+ if over 99) */
  count?: number;
  /** Optional icon before label */
  icon?: ReactNode;
  /** Show a small dot indicator before the label */
  dot?: boolean;
  /** Show remove button */
  removable?: boolean;
  /** Called when remove button clicked */
  onRemove?: () => void;
  /** Disabled state */
  disabled?: boolean;
}

export const Badge = ({
  label,
  variant = 'filled',
  color = 'primary',
  size = 'md',
  count,
  icon,
  dot = false,
  removable = false,
  onRemove,
  disabled = false,
}: BadgeProps) => {
  const displayText = count !== undefined
    ? (count > 99 ? '99+' : String(count))
    : label;

  return (
    <span
      className={[
        'badge',
        `badge--${variant}`,
        `badge--${color}`,
        `badge--${size}`,
        disabled ? 'badge--disabled' : '',
      ].filter(Boolean).join(' ')}
    >
      {dot && <span className="badge__dot" />}
      {icon && <span className="badge__icon">{icon}</span>}
      <span className="badge__label">{displayText}</span>
      {removable && (
        <button
          type="button"
          className="badge__remove"
          onClick={onRemove}
          aria-label="Remove"
          disabled={disabled}
        >
          <svg className="badge__remove-icon" viewBox="0 0 16 16" fill="currentColor">
            <path d="M5.28 4.22a.75.75 0 0 0-1.06 1.06L6.94 8l-2.72 2.72a.75.75 0 1 0 1.06 1.06L8 9.06l2.72 2.72a.75.75 0 1 0 1.06-1.06L9.06 8l2.72-2.72a.75.75 0 0 0-1.06-1.06L8 6.94 5.28 4.22Z" />
          </svg>
        </button>
      )}
    </span>
  );
};
