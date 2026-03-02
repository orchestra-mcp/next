import { Icon } from '../Icon';
import type { IconProps } from '../types';

export function RunIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <polygon
        points="5 3 19 12 5 21 5 3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Icon>
  );
}
