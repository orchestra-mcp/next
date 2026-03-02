import { Widget } from '@orchestra-mcp/widgets';
import { BoxIcon } from '@orchestra-mcp/icons';
import './ActiveTasksWidget.css';

export interface ActiveTask {
  id: string;
  title: string;
  status: string;
  storyTitle?: string;
  epicTitle?: string;
  priority?: string;
}

export interface ActiveTasksWidgetProps {
  /** List of active tasks */
  tasks: ActiveTask[];
  /** Called when a task card is clicked */
  onTaskClick?: (taskId: string) => void;
  /** Show loading shimmer */
  loading?: boolean;
  /** Called when refresh button is clicked */
  onRefresh?: () => void;
}

const PRIORITY_COLORS: Record<string, string> = {
  low: '#22c55e',
  medium: '#eab308',
  high: '#f97316',
  critical: '#ef4444',
};

export const ActiveTasksWidget = ({
  tasks,
  onTaskClick,
  loading,
  onRefresh,
}: ActiveTasksWidgetProps) => {
  const breadcrumb = (task: ActiveTask): string | null => {
    const parts: string[] = [];
    if (task.epicTitle) parts.push(task.epicTitle);
    if (task.storyTitle) parts.push(task.storyTitle);
    return parts.length > 0 ? parts.join(' > ') : null;
  };

  return (
    <Widget
      title="Active Tasks"
      icon={<BoxIcon name="bx-task" size={16} />}
      collapsible
      size="medium"
      loading={loading}
      onRefresh={onRefresh}
    >
      {tasks.length === 0 ? (
        <div className="active-tasks__empty" data-testid="active-tasks-empty">
          <svg
            className="active-tasks__empty-icon"
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="24"
              cy="24"
              r="20"
              stroke="var(--color-accent, #22c55e)"
              strokeWidth="3"
              fill="none"
            />
            <path
              d="M15 25l6 6 12-12"
              stroke="var(--color-accent, #22c55e)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
          <h3>All Clear</h3>
          <p>No tasks currently in progress. Ready to start something new?</p>
        </div>
      ) : (
        <div className="active-tasks" data-testid="active-tasks-widget">
          <span className="active-tasks__count">
            {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
          </span>
          <div className="active-tasks__list">
            {tasks.map((task) => (
              <button
                key={task.id}
                type="button"
                className="active-tasks__item"
                data-testid={`active-task-${task.id}`}
                onClick={() => onTaskClick?.(task.id)}
              >
                <span
                  className="active-tasks__priority-dot"
                  style={{
                    backgroundColor:
                      PRIORITY_COLORS[task.priority ?? ''] ?? '#555',
                  }}
                />
                <div className="active-tasks__info">
                  <span className="active-tasks__title">{task.title}</span>
                  {breadcrumb(task) && (
                    <span className="active-tasks__breadcrumb">
                      {breadcrumb(task)}
                    </span>
                  )}
                </div>
                <span className="active-tasks__badge">{task.status}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </Widget>
  );
};
