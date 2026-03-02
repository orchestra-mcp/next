import { Icon } from '../Icon';
import type { IconProps } from '../types';

export function RefreshIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path
        d="M21.5 2V8H15.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2.5 22V16H8.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M19.13 5.13C17.7826 3.78252 16.0454 2.87098 14.1632 2.51892C12.2811 2.16686 10.3393 2.39193 8.58926 3.16479C6.83923 3.93765 5.35772 5.22227 4.34315 6.85472C3.32857 8.48717 2.82891 10.3926 2.91 12.32M21.09 11.68C21.0089 13.6074 20.5092 15.5128 19.4946 17.1453C18.4801 18.7777 16.9986 20.0623 15.2485 20.8352C13.4985 21.608 11.5567 21.8331 9.67454 21.4811C7.79237 21.129 6.05515 20.2175 4.70999 18.87"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Icon>
  );
}
