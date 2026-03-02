import type { ReactNode } from 'react';
import './Button.css';

export interface ButtonProps {
  /** Button label text (omit for icon-only) */
  label?: string;
  /** Visual variant */
  variant?: 'filled' | 'soft' | 'outlined' | 'ghost';
  /** Color scheme — uses theme variables */
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'gray';
  /** Button size */
  size?: 'xs' | 'sm' | 'md' | 'lg';
  /** Icon before label */
  iconLeft?: ReactNode;
  /** Icon after label */
  iconRight?: ReactNode;
  /** Icon-only mode (square button, no label) */
  iconOnly?: boolean;
  /** Make button full-width */
  fullWidth?: boolean;
  /** Loading state — shows spinner, disables interaction */
  loading?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** HTML button type */
  type?: 'button' | 'submit' | 'reset';
  /** Accessible label (required for icon-only) */
  ariaLabel?: string;
  /** Click handler */
  onClick?: () => void;
}

export const Button = ({
  label,
  variant = 'filled',
  color = 'primary',
  size = 'md',
  iconLeft,
  iconRight,
  iconOnly = false,
  fullWidth = false,
  loading = false,
  disabled = false,
  type = 'button',
  ariaLabel,
  onClick,
}: ButtonProps) => {
  const classes = [
    'btn',
    `btn--${variant}`,
    `btn--${color}`,
    `btn--${size}`,
    iconOnly ? 'btn--icon-only' : '',
    fullWidth ? 'btn--full' : '',
    loading ? 'btn--loading' : '',
  ].filter(Boolean).join(' ');

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      onClick={onClick}
      aria-label={ariaLabel || (iconOnly ? label : undefined)}
      aria-busy={loading || undefined}
    >
      {loading && (
        <span className="btn__spinner" aria-hidden="true">
          <svg className="btn__spinner-svg" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" strokeDasharray="28" strokeDashoffset="8" strokeLinecap="round" />
          </svg>
        </span>
      )}
      {!loading && iconLeft && <span className="btn__icon">{iconLeft}</span>}
      {!iconOnly && label && <span className="btn__label">{label}</span>}
      {!loading && iconRight && <span className="btn__icon">{iconRight}</span>}
    </button>
  );
};
