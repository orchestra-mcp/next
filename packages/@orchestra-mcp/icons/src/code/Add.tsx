import { Icon } from '../Icon';
import type { IconProps } from '../types';

export function AddIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 5V19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Icon>
  );
}
