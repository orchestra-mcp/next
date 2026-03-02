import { Widget } from '@orchestra-mcp/widgets';
import { BoxIcon } from '@orchestra-mcp/icons';
import { StatusGrid } from '../StatusGrid';
import type { StatusCount } from '../StatusGrid';
import './StatusOverviewWidget.css';

export interface StatusOverviewWidgetProps {
  /** Status entries with counts */
  statuses: StatusCount[];
  /** Total number of tasks across all statuses */
  totalTasks: number;
  /** Completion percentage (0-100) */
  completionPercent: number;
  /** Called when a status cell is clicked */
  onStatusClick?: (status: string) => void;
  /** Show loading shimmer */
  loading?: boolean;
  /** Called when refresh button is clicked */
  onRefresh?: () => void;
}

export const StatusOverviewWidget = ({
  statuses,
  totalTasks,
  completionPercent,
  onStatusClick,
  loading,
  onRefresh,
}: StatusOverviewWidgetProps) => {
  const clampedPercent = Math.min(100, Math.max(0, completionPercent));

  return (
    <Widget
      title="Status Overview"
      icon={<BoxIcon name="bx-pie-chart-alt" size={16} />}
      collapsible
      size="medium"
      loading={loading}
      onRefresh={onRefresh}
    >
      <div className="status-overview" data-testid="status-overview-widget">
        <div className="status-overview__summary">
          <span>
            <span className="status-overview__total">{totalTasks}</span> total tasks
          </span>
          <span>
            <span className="status-overview__percent">{Math.round(clampedPercent)}%</span> complete
          </span>
        </div>
        <div
          className="status-overview__progress-track"
          data-testid="status-overview-progress"
        >
          <div
            className="status-overview__progress-bar"
            style={{ width: `${clampedPercent}%` }}
          />
        </div>
        <StatusGrid items={statuses} onStatusClick={onStatusClick} />
      </div>
    </Widget>
  );
};
