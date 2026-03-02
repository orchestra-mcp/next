import './Alert.css';

export interface AlertProps {
  /** Alert variant determines color scheme */
  variant?: 'info' | 'success' | 'warning' | 'error';
  /** Optional bold title above the message */
  title?: string;
  /** Alert body content */
  children: React.ReactNode;
  /** Show a dismiss (X) button */
  dismissible?: boolean;
  /** Callback when dismiss button is clicked */
  onDismiss?: () => void;
  /** Custom icon element (defaults to variant-based icon) */
  icon?: React.ReactNode;
  /** Additional CSS class */
  className?: string;
}

const defaultIcons: Record<string, string> = {
  info: '\u24D8',
  success: '\u2714',
  warning: '\u26A0',
  error: '\u2716',
};

export const Alert = ({
  variant = 'info',
  title,
  children,
  dismissible = false,
  onDismiss,
  icon,
  className = '',
}: AlertProps) => {
  const classes = [
    'alert',
    `alert--${variant}`,
    className,
  ].filter(Boolean).join(' ');

  const renderedIcon = icon !== undefined ? icon : defaultIcons[variant];

  return (
    <div role="alert" className={classes}>
      {renderedIcon && (
        <span className="alert__icon" aria-hidden="true">
          {renderedIcon}
        </span>
      )}
      <div className="alert__content">
        {title && <p className="alert__title">{title}</p>}
        <div>{children}</div>
      </div>
      {dismissible && (
        <button
          type="button"
          className="alert__dismiss"
          onClick={onDismiss}
          aria-label="Dismiss alert"
        >
          &times;
        </button>
      )}
    </div>
  );
};
