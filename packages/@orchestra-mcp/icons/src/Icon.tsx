import type { IconProps } from './types';

interface BaseIconProps extends IconProps {
  children: React.ReactNode;
  viewBox?: string;
}

export function Icon({
  size = 24,
  color = 'currentColor',
  className = '',
  viewBox = '0 0 24 24',
  children,
}: BaseIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox={viewBox}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ color }}
    >
      {children}
    </svg>
  );
}
