import { Widget } from '@orchestra-mcp/widgets';
import { BoxIcon } from '@orchestra-mcp/icons';
import './RecentActivityWidget.css';

export interface ActivityItem {
  id: string;
  type: 'created' | 'updated' | 'completed' | 'commented' | 'synced';
  issueId: string;
  issueTitle: string;
  actor?: string;
  timestamp: string;
  provider?: 'local' | 'github' | 'jira' | 'linear';
  detail?: string;
}

export interface RecentActivityWidgetProps {
  /** List of recent activity items */
  activities: ActivityItem[];
  /** Called when an activity row is clicked */
  onActivityClick?: (activity: ActivityItem) => void;
  /** Maximum items to display */
  maxItems?: number;
  /** Show loading shimmer */
  loading?: boolean;
  /** Called when refresh button is clicked */
  onRefresh?: () => void;
}

const TYPE_ICONS: Record<ActivityItem['type'], string> = {
  created: '\u2728',
  updated: '\u270F\uFE0F',
  completed: '\u2705',
  commented: '\uD83D\uDCAC',
  synced: '\uD83D\uDD04',
};

function formatRelativeTime(timestamp: string): string {
  const now = Date.now();
  const then = new Date(timestamp).getTime();
  const diffSeconds = Math.floor((now - then) / 1000);

  if (diffSeconds < 60) return 'just now';
  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `${diffDays}d ago`;
  return `${Math.floor(diffDays / 30)}mo ago`;
}

export const RecentActivityWidget = ({
  activities,
  onActivityClick,
  maxItems = 20,
  loading,
  onRefresh,
}: RecentActivityWidgetProps) => {
  const visibleItems = activities.slice(0, maxItems);

  return (
    <Widget
      title="Recent Activity"
      icon={<BoxIcon name="bx-time-five" size={16} />}
      collapsible
      size="medium"
      loading={loading}
      onRefresh={onRefresh}
    >
      {visibleItems.length === 0 ? (
        <div className="recent-activity__empty" data-testid="recent-activity-empty">
          No recent activity
        </div>
      ) : (
        <div className="recent-activity" data-testid="recent-activity-widget">
          {visibleItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className="recent-activity__item"
              data-testid={`activity-${item.id}`}
              onClick={() => onActivityClick?.(item)}
            >
              <span className="recent-activity__icon">
                {TYPE_ICONS[item.type]}
              </span>
              <div className="recent-activity__body">
                <span className="recent-activity__title">{item.issueTitle}</span>
                {item.detail && (
                  <span className="recent-activity__detail">{item.detail}</span>
                )}
              </div>
              <div className="recent-activity__meta">
                <span className="recent-activity__time">
                  {formatRelativeTime(item.timestamp)}
                </span>
                {item.provider && item.provider !== 'local' && (
                  <span className="recent-activity__provider">{item.provider}</span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </Widget>
  );
};
