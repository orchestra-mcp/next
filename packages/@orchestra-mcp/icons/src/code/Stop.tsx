import { Icon } from '../Icon';
import type { IconProps } from '../types';

export function StopIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect
        x="4"
        y="4"
        width="16"
        height="16"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Icon>
  );
}
