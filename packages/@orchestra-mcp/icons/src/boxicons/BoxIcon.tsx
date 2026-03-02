import type { IconProps } from '../types';
import { boxiconPaths } from './paths';

export interface BoxIconProps extends IconProps {
  /** Boxicon name, e.g. 'bx-home', 'bxs-star', 'bxl-github' */
  name: string;
}

/**
 * Renders a Boxicon by name using pre-generated SVG path data.
 *
 * Boxicons use `fill="currentColor"` (not stroke), so
 * the color is inherited from the parent's CSS `color` property.
 *
 * @example
 * <BoxIcon name="bx-home" size={24} />
 * <BoxIcon name="bxs-star" color="#f59e0b" />
 * <BoxIcon name="bxl-github" size={32} className="text-muted" />
 */
export function BoxIcon({ name, size = 24, color = 'currentColor', className = '' }: BoxIconProps) {
  const pathData = boxiconPaths[name];

  if (!pathData) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[BoxIcon] Unknown icon: "${name}"`);
    }
    return null;
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ color }}
      role="img"
      aria-label={name}
    >
      <g dangerouslySetInnerHTML={{ __html: pathData }} />
    </svg>
  );
}
