import './ProgressBar.css';

export interface ProgressBarProps {
  /** Current value (0-100) */
  value?: number;
  /** Determinate shows filled bar; indeterminate shows animated sliding bar */
  mode?: 'determinate' | 'indeterminate';
  /** Bar height */
  size?: 'sm' | 'md' | 'lg';
  /** Bar color */
  color?: 'primary' | 'success' | 'warning' | 'danger';
  /** Label shown above the bar */
  label?: string;
  /** Show diagonal stripes animation */
  striped?: boolean;
  /** Show percentage text on the right */
  showValue?: boolean;
}

export const ProgressBar = ({
  value = 0,
  mode = 'determinate',
  size = 'md',
  color = 'primary',
  label,
  striped = false,
  showValue = false,
}: ProgressBarProps) => {
  const clamped = Math.min(100, Math.max(0, value));
  const isDeterminate = mode === 'determinate';

  return (
    <div className="progress-bar-wrapper">
      {(label || showValue) && (
        <div className="progress-bar-header">
          {label && <span className="progress-bar-label">{label}</span>}
          {showValue && isDeterminate && (
            <span className="progress-bar-value">{clamped}%</span>
          )}
        </div>
      )}
      <div
        className={`progress-bar progress-bar--${size}`}
        role="progressbar"
        aria-valuenow={isDeterminate ? clamped : undefined}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <div
          className={[
            'progress-bar-fill',
            `progress-bar-fill--${color}`,
            !isDeterminate && 'progress-bar-fill--indeterminate',
            striped && 'progress-bar-fill--striped',
          ]
            .filter(Boolean)
            .join(' ')}
          style={isDeterminate ? { width: `${clamped}%` } : undefined}
        />
      </div>
    </div>
  );
};
