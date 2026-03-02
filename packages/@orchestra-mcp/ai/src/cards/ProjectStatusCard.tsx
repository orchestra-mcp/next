import type { McpProjectResult } from './parseMcpResponse';
import { CardBase } from './CardBase';
import { BoxIcon } from '@orchestra-mcp/icons';
import './ProjectStatusCard.css';

export interface ProjectStatusCardProps {
  data: McpProjectResult & {
    total_tasks?: number;
    completed_tasks?: number;
    blocked_tasks?: number;
    in_progress_tasks?: number;
    completion_percentage?: number;
  };
  className?: string;
}

export const ProjectStatusCard = ({ data, className }: ProjectStatusCardProps) => {
  const pct = data.completion_percentage ?? 0;
  const badgeColor = pct === 100 ? 'success' : pct >= 50 ? 'info' : 'gray';

  return (
    <CardBase
      title={data.project ?? data.slug ?? 'Project'}
      icon={<BoxIcon name="bx-bar-chart-alt-2" size={16} />}
      badge={`${pct}%`}
      badgeColor={badgeColor}
      defaultCollapsed={false}
      className={className}
    >
      <div className="project-status-card__progress">
        <div className="project-status-card__bar">
          <div
            className="project-status-card__fill"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="project-status-card__stats">
        <div className="project-status-card__stat">
          <span className="project-status-card__stat-count">
            {data.total_tasks ?? 0}
          </span>
          <span className="project-status-card__stat-label">Total</span>
        </div>
        <div className="project-status-card__stat project-status-card__stat--done">
          <span className="project-status-card__stat-count">
            {data.completed_tasks ?? 0}
          </span>
          <span className="project-status-card__stat-label">Done</span>
        </div>
        <div className="project-status-card__stat project-status-card__stat--progress">
          <span className="project-status-card__stat-count">
            {data.in_progress_tasks ?? 0}
          </span>
          <span className="project-status-card__stat-label">Active</span>
        </div>
        <div className="project-status-card__stat project-status-card__stat--blocked">
          <span className="project-status-card__stat-count">
            {data.blocked_tasks ?? 0}
          </span>
          <span className="project-status-card__stat-label">Blocked</span>
        </div>
      </div>
    </CardBase>
  );
};
