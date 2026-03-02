import { Widget } from '@orchestra-mcp/widgets';
import { BoxIcon } from '@orchestra-mcp/icons';
import './FeatureAdoptionWidget.css';

export interface FeatureUsage {
  feature: string;
  count: number;
  color?: string;
}

export interface FeatureAdoptionWidgetProps {
  /** Feature usage entries to display */
  features: FeatureUsage[];
  /** Max bar width basis (tallest bar = 100%) */
  maxCount?: number;
  /** Show loading shimmer */
  loading?: boolean;
  /** Called when refresh button is clicked */
  onRefresh?: () => void;
}

const BAR_COLOR = 'var(--color-accent, #7c3aed)';

export const FeatureAdoptionWidget = ({
  features,
  maxCount,
  loading,
  onRefresh,
}: FeatureAdoptionWidgetProps) => {
  const resolvedMax = maxCount ?? Math.max(...features.map((f) => f.count), 1);

  return (
    <Widget
      title="Feature Adoption"
      icon={<BoxIcon name="bx-star" size={16} />}
      collapsible
      size="medium"
      loading={loading}
      onRefresh={onRefresh}
    >
      {features.length === 0 ? (
        <div className="feature-adoption__empty" data-testid="feature-adoption-empty">
          No feature data
        </div>
      ) : (
        <div className="feature-adoption" data-testid="feature-adoption-widget">
          {features.map((entry) => {
            const widthPercent = Math.round((entry.count / resolvedMax) * 100);
            return (
              <div
                key={entry.feature}
                className="feature-adoption__row"
                data-testid={`feature-row-${entry.feature}`}
              >
                <span className="feature-adoption__name">{entry.feature}</span>
                <div className="feature-adoption__bar-track">
                  <div
                    className="feature-adoption__bar-fill"
                    style={{
                      width: `${widthPercent}%`,
                      backgroundColor: entry.color || BAR_COLOR,
                    }}
                  />
                </div>
                <span className="feature-adoption__count">{entry.count}</span>
              </div>
            );
          })}
        </div>
      )}
    </Widget>
  );
};
