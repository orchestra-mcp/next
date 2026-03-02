import { Icon } from '../Icon';
import type { IconProps } from '../types';

export function CheckIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Icon>
  );
}
