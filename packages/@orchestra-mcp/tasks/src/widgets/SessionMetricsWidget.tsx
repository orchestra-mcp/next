import { Widget } from '@orchestra-mcp/widgets';
import { BoxIcon } from '@orchestra-mcp/icons';
import './SessionMetricsWidget.css';

export interface SessionKPI {
  label: string;
  value: string | number;
  color?: string;
}

export interface SessionMetricsWidgetProps {
  /** KPI entries to display */
  kpis: SessionKPI[];
  /** Show loading shimmer */
  loading?: boolean;
  /** Called when refresh button is clicked */
  onRefresh?: () => void;
}

const ACCENT_COLOR = 'var(--color-accent, #7c3aed)';

export const SessionMetricsWidget = ({
  kpis,
  loading,
  onRefresh,
}: SessionMetricsWidgetProps) => {
  return (
    <Widget
      title="Session Metrics"
      icon={<BoxIcon name="bx-trending-up" size={16} />}
      collapsible
      size="medium"
      loading={loading}
      onRefresh={onRefresh}
    >
      {kpis.length === 0 ? (
        <div className="session-metrics__empty" data-testid="session-metrics-empty">
          No session data
        </div>
      ) : (
        <div className="session-metrics" data-testid="session-metrics-widget">
          {kpis.map((kpi) => (
            <div
              key={kpi.label}
              className="session-metrics__card"
              style={{ borderTopColor: kpi.color || ACCENT_COLOR }}
              data-testid={`session-kpi-${kpi.label.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <span className="session-metrics__label">{kpi.label}</span>
              <span className="session-metrics__value">{kpi.value}</span>
            </div>
          ))}
        </div>
      )}
    </Widget>
  );
};
