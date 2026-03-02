import { Icon } from '../Icon';
import type { IconProps } from '../types';

export function CloseIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Icon>
  );
}
