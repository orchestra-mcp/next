import { Widget } from '@orchestra-mcp/widgets';
import { BoxIcon } from '@orchestra-mcp/icons';
import './SprintProgressWidget.css';

export interface SprintData {
  name: string;
  startDate: string;
  endDate: string;
  totalPoints: number;
  completedPoints: number;
  totalTasks: number;
  completedTasks: number;
}

export interface SprintProgressWidgetProps {
  /** Current sprint data, or null if no active sprint */
  sprint: SprintData | null;
  /** Message shown when there is no active sprint */
  noSprintMessage?: string;
  /** Show loading shimmer */
  loading?: boolean;
  /** Called when refresh button is clicked */
  onRefresh?: () => void;
}

function computeDaysRemaining(endDate: string): number {
  const end = new Date(endDate).getTime();
  const now = Date.now();
  const diff = end - now;
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function percent(completed: number, total: number): number {
  if (total === 0) return 0;
  return Math.min(100, Math.round((completed / total) * 100));
}

export const SprintProgressWidget = ({
  sprint,
  noSprintMessage = 'No active sprint',
  loading,
  onRefresh,
}: SprintProgressWidgetProps) => {
  const daysLeft = sprint ? computeDaysRemaining(sprint.endDate) : 0;
  const pointsPercent = sprint ? percent(sprint.completedPoints, sprint.totalPoints) : 0;
  const tasksPercent = sprint ? percent(sprint.completedTasks, sprint.totalTasks) : 0;

  return (
    <Widget
      title="Sprint Progress"
      icon={<BoxIcon name="bx-line-chart" size={16} />}
      collapsible
      size="medium"
      loading={loading}
      onRefresh={onRefresh}
    >
      {!sprint ? (
        <div className="sprint-progress__empty" data-testid="sprint-progress-empty">
          {noSprintMessage}
        </div>
      ) : (
        <div className="sprint-progress" data-testid="sprint-progress-widget">
          <div className="sprint-progress__header">
            <div>
              <div className="sprint-progress__name">{sprint.name}</div>
              <div className="sprint-progress__dates">
                {formatDate(sprint.startDate)} &ndash; {formatDate(sprint.endDate)}
              </div>
            </div>
            <div className="sprint-progress__days" data-testid="sprint-days-remaining">
              {daysLeft} {daysLeft === 1 ? 'day' : 'days'} left
            </div>
          </div>
          <div className="sprint-progress__bars">
            <div className="sprint-progress__metric">
              <div className="sprint-progress__metric-header">
                <span>Points</span>
                <span className="sprint-progress__metric-value">
                  {sprint.completedPoints}/{sprint.totalPoints}
                </span>
              </div>
              <div className="sprint-progress__bar-track">
                <div
                  className="sprint-progress__bar-fill sprint-progress__bar-fill--points"
                  style={{ width: `${pointsPercent}%` }}
                  data-testid="sprint-points-bar"
                />
              </div>
            </div>
            <div className="sprint-progress__metric">
              <div className="sprint-progress__metric-header">
                <span>Tasks</span>
                <span className="sprint-progress__metric-value">
                  {sprint.completedTasks}/{sprint.totalTasks}
                </span>
              </div>
              <div className="sprint-progress__bar-track">
                <div
                  className="sprint-progress__bar-fill sprint-progress__bar-fill--tasks"
                  style={{ width: `${tasksPercent}%` }}
                  data-testid="sprint-tasks-bar"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </Widget>
  );
};
