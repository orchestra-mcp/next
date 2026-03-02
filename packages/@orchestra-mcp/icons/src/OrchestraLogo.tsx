import { Icon } from './Icon';
import type { IconProps } from './types';

export function OrchestraLogo(props: IconProps) {
  return (
    <Icon viewBox="0 0 32 32" {...props}>
      <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="2" fill="none" />
      <circle cx="16" cy="8" r="2" fill="currentColor" />
      <circle cx="16" cy="16" r="2" fill="currentColor" />
      <circle cx="16" cy="24" r="2" fill="currentColor" />
      <circle cx="8" cy="12" r="1.5" fill="currentColor" />
      <circle cx="24" cy="12" r="1.5" fill="currentColor" />
      <circle cx="8" cy="20" r="1.5" fill="currentColor" />
      <circle cx="24" cy="20" r="1.5" fill="currentColor" />
      <path
        d="M16 8 L8 12 M16 8 L24 12 M8 12 L16 16 M24 12 L16 16 M16 16 L8 20 M16 16 L24 20 M8 20 L16 24 M24 20 L16 24"
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.3"
      />
    </Icon>
  );
}
