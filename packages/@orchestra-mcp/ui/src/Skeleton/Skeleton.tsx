import './Skeleton.css';

export interface SkeletonProps {
  /** Shape variant */
  variant?: 'text' | 'circular' | 'rectangular';
  /** Width (string or number in px) */
  width?: string | number;
  /** Height (string or number in px) */
  height?: string | number;
  /** Number of text lines to render */
  lines?: number;
  /** Gap between lines in px */
  gap?: number;
  /** Enable shimmer animation (default true) */
  animate?: boolean;
  /** Additional CSS class */
  className?: string;
}

function toSize(value: string | number | undefined): string | undefined {
  if (value === undefined) return undefined;
  return typeof value === 'number' ? `${value}px` : value;
}

export const Skeleton = ({
  variant = 'text',
  width,
  height,
  lines,
  gap = 8,
  animate = true,
  className = '',
}: SkeletonProps) => {
  const baseClass = [
    'skeleton',
    `skeleton--${variant}`,
    animate ? 'skeleton--animated' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if (variant === 'text' && lines && lines > 1) {
    return (
      <div className="skeleton-group" style={{ gap: `${gap}px` }}>
        {Array.from({ length: lines }, (_, i) => {
          const isLast = i === lines - 1;
          const lineWidth = isLast ? '60%' : toSize(width) ?? '100%';
          return (
            <div
              key={i}
              className={baseClass}
              data-testid="skeleton-line"
              style={{
                width: lineWidth,
                height: toSize(height),
              }}
            />
          );
        })}
      </div>
    );
  }

  const style: React.CSSProperties = {
    width: toSize(width),
    height: toSize(height),
  };

  if (variant === 'circular' && width && !height) {
    style.height = toSize(width);
  }

  return <div className={baseClass} style={style} />;
};
