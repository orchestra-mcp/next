import { Widget } from '@orchestra-mcp/widgets';
import { BoxIcon } from '@orchestra-mcp/icons';
import type { StatusCount } from '../StatusGrid';
import './TaskStatisticsWidget.css';

export interface TaskStatisticsWidgetProps {
  /** Status entries with counts */
  statuses: StatusCount[];
  /** Total number of tasks */
  totalTasks: number;
  /** Called when a status card is clicked */
  onStatusClick?: (status: string) => void;
  /** Show loading shimmer */
  loading?: boolean;
  /** Called when refresh button is clicked */
  onRefresh?: () => void;
}

const ACCENT_COLOR = 'var(--color-accent, #7c3aed)';
const FALLBACK_COLOR = '#6b7280';

export const TaskStatisticsWidget = ({
  statuses,
  totalTasks,
  onStatusClick,
  loading,
  onRefresh,
}: TaskStatisticsWidgetProps) => {
  return (
    <Widget
      title="Task Statistics"
      icon={<BoxIcon name="bx-chart" size={16} />}
      collapsible
      size="medium"
      loading={loading}
      onRefresh={onRefresh}
    >
      {statuses.length === 0 ? (
        <div className="task-stats__empty" data-testid="task-stats-empty">
          No status data
        </div>
      ) : (
        <div className="task-stats" data-testid="task-statistics-widget">
          <button
            type="button"
            className="task-stats__card"
            style={{ borderLeftColor: ACCENT_COLOR }}
            onClick={() => onStatusClick?.('total')}
          >
            <span
              className="task-stats__icon"
              style={{ backgroundColor: ACCENT_COLOR }}
            />
            <span className="task-stats__label">Total</span>
            <span className="task-stats__value">{totalTasks}</span>
          </button>
          {statuses.map((entry) => (
            <button
              key={entry.status}
              type="button"
              className="task-stats__card"
              style={{ borderLeftColor: entry.color || FALLBACK_COLOR }}
              data-testid={`task-stats-${entry.status}`}
              onClick={() => onStatusClick?.(entry.status)}
            >
              <span
                className="task-stats__icon"
                style={{ backgroundColor: entry.color || FALLBACK_COLOR }}
              />
              <span className="task-stats__label">{entry.label}</span>
              <span className="task-stats__value">{entry.count}</span>
            </button>
          ))}
        </div>
      )}
    </Widget>
  );
};
