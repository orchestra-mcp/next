import { BoxIcon } from '@orchestra-mcp/icons';
import './PriorityIcon.css';

const PRIORITY_CONFIG: Record<string, { icon: string; color: string; label: string }> = {
  critical: { icon: 'bxs-chevrons-up', color: '#ef4444', label: 'Critical' },
  high: { icon: 'bx-chevron-up', color: '#f97316', label: 'High' },
  medium: { icon: 'bx-minus', color: '#eab308', label: 'Medium' },
  low: { icon: 'bx-chevron-down', color: '#6b7280', label: 'Low' },
};

export interface PriorityIconProps {
  priority: string;
  size?: number;
}

export function PriorityIcon({ priority, size = 14 }: PriorityIconProps) {
  const config = PRIORITY_CONFIG[priority];
  if (!config) return null;

  return (
    <span
      className="priority-icon"
      style={{ color: config.color }}
      title={config.label}
      aria-label={`${config.label} priority`}
    >
      <BoxIcon name={config.icon} size={size} />
    </span>
  );
}
