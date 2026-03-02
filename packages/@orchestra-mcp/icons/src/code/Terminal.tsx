import { Icon } from '../Icon';
import type { IconProps } from '../types';

export function TerminalIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 17L10 11L4 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 19H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Icon>
  );
}
