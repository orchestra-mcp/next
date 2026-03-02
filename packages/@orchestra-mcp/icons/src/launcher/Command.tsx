import { Icon } from '../Icon';
import type { IconProps } from '../types';

export function CommandIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path
        d="M18 3C19.6569 3 21 4.34315 21 6C21 7.65685 19.6569 9 18 9H15V6C15 4.34315 16.3431 3 18 3Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6 3C4.34315 3 3 4.34315 3 6C3 7.65685 4.34315 9 6 9H9V6C9 4.34315 7.65685 3 6 3Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 15H6C4.34315 15 3 16.3431 3 18C3 19.6569 4.34315 21 6 21C7.65685 21 9 19.6569 9 18V15Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M18 15H15V18C15 19.6569 16.3431 21 18 21C19.6569 21 21 19.6569 21 18C21 16.3431 19.6569 15 18 15Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="9" y="9" width="6" height="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Icon>
  );
}
