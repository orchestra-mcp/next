import { Widget, DonutChart } from '@orchestra-mcp/widgets';
import { BoxIcon } from '@orchestra-mcp/icons';
import type { ChartDataPoint } from './TaskDistributionWidget';
import './ProgressDistributionWidget.css';

export interface ProgressDistributionWidgetProps {
  data: ChartDataPoint[];
  completionPercent: number;
  loading?: boolean;
  onRefresh?: () => void;
}

export const ProgressDistributionWidget = ({
  data,
  completionPercent,
  loading,
  onRefresh,
}: ProgressDistributionWidgetProps) => {
  return (
    <Widget
      title="Progress Distribution"
      icon={<BoxIcon name="bx-doughnut-chart" size={16} />}
      collapsible
      size="medium"
      loading={loading}
      onRefresh={onRefresh}
    >
      {data.length === 0 ? (
        <div className="progress-dist__empty">No data</div>
      ) : (
        <div className="progress-dist">
          <DonutChart
            data={data}
            width={180}
            height={180}
            showLegend={false}
            innerRatio={0.65}
            centerLabel={`${Math.round(completionPercent)}%`}
            className="progress-dist__chart"
          />
          <div className="progress-dist__legend">
            {data.map((point) => (
              <div key={point.label} className="progress-dist__legend-row">
                <span
                  className="progress-dist__legend-dot"
                  style={{ backgroundColor: point.color }}
                />
                <span className="progress-dist__legend-label">{point.label}</span>
                <span className="progress-dist__legend-value">{point.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Widget>
  );
};
