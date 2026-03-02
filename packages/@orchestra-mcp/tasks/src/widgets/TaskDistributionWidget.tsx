import { Widget } from '@orchestra-mcp/widgets';
import { BoxIcon } from '@orchestra-mcp/icons';
import './TaskDistributionWidget.css';

export interface ChartDataPoint {
  label: string;
  value: number;
  color: string;
}

export interface TaskDistributionWidgetProps {
  /** Data points grouped by status */
  byStatus: ChartDataPoint[];
  /** Data points grouped by priority */
  byPriority: ChartDataPoint[];
  /** Data points grouped by type */
  byType: ChartDataPoint[];
  /** Which chart tab is active */
  activeChart?: 'status' | 'priority' | 'type';
  /** Called when tab selection changes */
  onChartChange?: (chart: 'status' | 'priority' | 'type') => void;
  /** Show loading shimmer */
  loading?: boolean;
  /** Called when refresh button is clicked */
  onRefresh?: () => void;
}

type ChartKey = 'status' | 'priority' | 'type';

const TAB_LABELS: Record<ChartKey, string> = {
  status: 'By Status',
  priority: 'By Priority',
  type: 'By Type',
};

const TABS: ChartKey[] = ['status', 'priority', 'type'];

export const TaskDistributionWidget = ({
  byStatus,
  byPriority,
  byType,
  activeChart = 'status',
  onChartChange,
  loading,
  onRefresh,
}: TaskDistributionWidgetProps) => {
  const dataMap: Record<ChartKey, ChartDataPoint[]> = {
    status: byStatus,
    priority: byPriority,
    type: byType,
  };

  const data = dataMap[activeChart] || [];
  const maxValue = Math.max(...data.map((d) => d.value), 1);

  return (
    <Widget
      title="Task Distribution"
      icon={<BoxIcon name="bx-bar-chart-square" size={16} />}
      collapsible
      size="medium"
      loading={loading}
      onRefresh={onRefresh}
    >
      {data.length === 0 ? (
        <div className="task-distribution__empty" data-testid="task-distribution-empty">
          No distribution data
        </div>
      ) : (
        <div className="task-distribution" data-testid="task-distribution-widget">
          <div className="task-distribution__tabs" data-testid="task-distribution-tabs">
            {TABS.map((key) => (
              <button
                key={key}
                type="button"
                className={[
                  'task-distribution__tab',
                  activeChart === key ? 'task-distribution__tab--active' : '',
                ].filter(Boolean).join(' ')}
                data-testid={`tab-${key}`}
                onClick={() => onChartChange?.(key)}
              >
                {TAB_LABELS[key]}
              </button>
            ))}
          </div>
          <div className="task-distribution__chart" data-testid="task-distribution-chart">
            {data.map((point) => {
              const widthPercent = (point.value / maxValue) * 100;
              return (
                <div key={point.label} className="task-distribution__row">
                  <span className="task-distribution__label" title={point.label}>
                    {point.label}
                  </span>
                  <div className="task-distribution__bar-track">
                    <div
                      className="task-distribution__bar-fill"
                      style={{
                        width: `${widthPercent}%`,
                        backgroundColor: point.color,
                      }}
                    />
                  </div>
                  <span className="task-distribution__value">{point.value}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Widget>
  );
};
