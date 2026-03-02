import type { ReactNode } from 'react';
import './Shimmer.css';

export interface ShimmerProps {
  /** Shape preset for the skeleton element */
  shape?: 'line' | 'circle' | 'rect' | 'card';
  /** Width of the element (CSS value) */
  width?: string;
  /** Height of the element (CSS value) */
  height?: string;
  /** Border radius override (CSS value) */
  borderRadius?: string;
  /** Whether to animate the shimmer gradient */
  animate?: boolean;
}

export interface ShimmerGroupProps {
  /** Gap between shimmer elements */
  gap?: string;
  /** Child shimmer elements */
  children: ReactNode;
}

const shapeDefaults: Record<string, { width: string; height: string; borderRadius: string }> = {
  line: { width: '100%', height: '16px', borderRadius: '4px' },
  circle: { width: '48px', height: '48px', borderRadius: '50%' },
  rect: { width: '100%', height: '100px', borderRadius: '4px' },
  card: { width: '100%', height: '200px', borderRadius: '8px' },
};

export const Shimmer = ({
  shape = 'line',
  width,
  height,
  borderRadius,
  animate = true,
}: ShimmerProps) => {
  const defaults = shapeDefaults[shape];
  const classes = ['shimmer', `shimmer--${shape}`];
  if (animate) classes.push('shimmer--animate');

  return (
    <div
      className={classes.join(' ')}
      data-testid={`shimmer-${shape}`}
      aria-hidden="true"
      style={{
        width: width ?? defaults.width,
        height: height ?? defaults.height,
        borderRadius: borderRadius ?? defaults.borderRadius,
      }}
    />
  );
};

export const ShimmerGroup = ({ gap = '12px', children }: ShimmerGroupProps) => {
  return (
    <div className="shimmer-group" data-testid="shimmer-group" style={{ gap }}>
      {children}
    </div>
  );
};
