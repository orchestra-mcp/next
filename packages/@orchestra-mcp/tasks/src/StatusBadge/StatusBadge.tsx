import './StatusBadge.css';

const STATUS_COLORS: Record<string, string> = {
  backlog: '#6b7280',
  todo: '#3b82f6',
  'in-progress': '#8b5cf6',
  blocked: '#ef4444',
  'ready-for-testing': '#f59e0b',
  'in-testing': '#f97316',
  'ready-for-docs': '#06b6d4',
  'in-docs': '#0ea5e9',
  documented: '#14b8a6',
  'in-review': '#a855f7',
  done: '#22c55e',
  rejected: '#ef4444',
  cancelled: '#6b7280',
};

const STATUS_LABELS: Record<string, string> = {
  backlog: 'Backlog',
  todo: 'To Do',
  'in-progress': 'In Progress',
  blocked: 'Blocked',
  'ready-for-testing': 'Ready for Testing',
  'in-testing': 'In Testing',
  'ready-for-docs': 'Ready for Docs',
  'in-docs': 'In Docs',
  documented: 'Documented',
  'in-review': 'In Review',
  done: 'Done',
  rejected: 'Rejected',
  cancelled: 'Cancelled',
};

export interface StatusBadgeProps {
  status: string;
  variant?: 'dot' | 'pill';
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, variant = 'dot', size = 'sm' }: StatusBadgeProps) {
  const color = STATUS_COLORS[status] ?? '#6b7280';
  const label = STATUS_LABELS[status] ?? status;

  if (variant === 'dot') {
    return (
      <span
        className={`status-badge status-badge--dot status-badge--${size}`}
        style={{ backgroundColor: color }}
        title={label}
        aria-label={label}
      />
    );
  }

  return (
    <span
      className={`status-badge status-badge--pill status-badge--${size}`}
      style={{ backgroundColor: `${color}20`, color }}
      title={label}
    >
      <span className="status-badge__dot" style={{ backgroundColor: color }} />
      {label}
    </span>
  );
}
