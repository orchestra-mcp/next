import { Icon } from '../Icon';
import type { IconProps } from '../types';

export function FilterIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path
        d="M22 3H2L10 12.46V19L14 21V12.46L22 3Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Icon>
  );
}
