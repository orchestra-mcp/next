import './TaskList.css';

export interface TaskItem {
  id: string;
  title: string;
  status: string;
  type?: string;
  priority?: string;
  description?: string;
  created_at?: string;
}

export interface TaskListProps {
  /** Task items to display */
  items: TaskItem[];
  /** Called when a task row is clicked */
  onTaskClick?: (task: TaskItem) => void;
  /** Status badge renderer — receives status string, returns label + color */
  statusConfig?: Record<string, { label: string; color: string }>;
  /** Empty state message */
  emptyMessage?: string;
}

const PRIORITY_COLORS: Record<string, string> = {
  low: '#22c55e',
  medium: '#eab308',
  high: '#f97316',
  critical: '#ef4444',
};

const TYPE_ICONS: Record<string, string> = {
  task: '\u2611',
  bug: '\uD83D\uDC1B',
  hotfix: '\uD83D\uDD25',
  story: '\uD83D\uDCD6',
  epic: '\u26A1',
};

export const TaskList = ({
  items,
  onTaskClick,
  statusConfig,
  emptyMessage = 'No tasks',
}: TaskListProps) => {
  if (items.length === 0) {
    return (
      <div className="task-list__empty" data-testid="task-list-empty">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="task-list" data-testid="task-list">
      {items.map((item) => {
        const cfg = statusConfig?.[item.status];
        return (
          <button
            key={item.id}
            type="button"
            className="task-list__row"
            data-testid={`task-${item.id}`}
            onClick={() => onTaskClick?.(item)}
          >
            {item.type && (
              <span className="task-list__type">
                {TYPE_ICONS[item.type] || item.type}
              </span>
            )}
            {item.priority && (
              <span
                className="task-list__priority"
                style={{ backgroundColor: PRIORITY_COLORS[item.priority] }}
                title={item.priority}
              />
            )}
            <span className="task-list__id">{item.id}</span>
            <span className="task-list__title">{item.title}</span>
            {cfg && (
              <span
                className="task-list__badge"
                style={{ backgroundColor: cfg.color + '22', color: cfg.color, borderColor: cfg.color + '44' }}
              >
                {cfg.label}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
