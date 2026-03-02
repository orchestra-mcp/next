import { Widget } from '@orchestra-mcp/widgets';
import { BoxIcon } from '@orchestra-mcp/icons';
import './ProjectStatusWidget.css';

export interface ProjectStatusWidgetProps {
  slug: string;
  totalTasks: number;
  doneTasks: number;
  completionPercent: number;
  statuses: Array<{ status: string; label: string; count: number; color: string }>;
  epicCount: number;
  storyCount: number;
  loading?: boolean;
  onRefresh?: () => void;
}

export const ProjectStatusWidget = ({
  totalTasks,
  doneTasks,
  completionPercent,
  statuses,
  loading,
  onRefresh,
}: ProjectStatusWidgetProps) => {
  const clampedPercent = Math.min(100, Math.max(0, completionPercent));

  return (
    <Widget
      title="Project Status"
      icon={<BoxIcon name="bx-bar-chart-alt-2" size={16} />}
      collapsible
      size="medium"
      loading={loading}
      onRefresh={onRefresh}
    >
      <div className="project-status-widget">
        <div className="project-status-widget__summary">
          <div className="project-status-widget__stat">
            <span className="project-status-widget__stat-value">{totalTasks}</span>
            <span className="project-status-widget__stat-label">Total Tasks</span>
          </div>
          <div className="project-status-widget__stat">
            <span className="project-status-widget__stat-value">{doneTasks}</span>
            <span className="project-status-widget__stat-label">Completed</span>
          </div>
          <div className="project-status-widget__stat">
            <span className="project-status-widget__stat-value">{clampedPercent}%</span>
            <span className="project-status-widget__stat-label">Completion</span>
          </div>
        </div>

        <div className="project-status-widget__progress">
          <div
            className="project-status-widget__progress-fill"
            style={{ width: `${clampedPercent}%` }}
          />
        </div>

        <div className="project-status-widget__statuses">
          {statuses.map((s) => (
            <div key={s.status} className="project-status-widget__status-chip">
              <span
                className="project-status-widget__status-dot"
                style={{ backgroundColor: s.color }}
              />
              <span className="project-status-widget__status-label">{s.label}</span>
              <span className="project-status-widget__status-count">{s.count}</span>
            </div>
          ))}
        </div>
      </div>
    </Widget>
  );
};
