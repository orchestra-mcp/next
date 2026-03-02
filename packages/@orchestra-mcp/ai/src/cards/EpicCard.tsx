import type { McpEpicResult } from './parseMcpResponse';
import { CardBase } from './CardBase';
import { BoxIcon } from '@orchestra-mcp/icons';
import './EpicCard.css';

const PRIORITY_COLORS: Record<string, string> = {
  low: '#22c55e',
  medium: '#eab308',
  high: '#f97316',
  critical: '#ef4444',
};

export interface EpicCardProps {
  data: McpEpicResult & {
    stories?: Array<{ id: string; title: string; status: string }>;
    story_count?: number;
    completion_percentage?: number;
  };
  className?: string;
}

function statusDotClass(status: string): string {
  if (status === 'done') return 'epic-card__dot epic-card__dot--done';
  if (status === 'in-progress') return 'epic-card__dot epic-card__dot--active';
  return 'epic-card__dot';
}

export const EpicCard = ({ data, className }: EpicCardProps) => {
  const pct = data.completion_percentage ?? 0;
  const badgeColor = pct === 100 ? 'success' : 'gray';
  const priorityColor = data.priority ? PRIORITY_COLORS[data.priority] : undefined;

  return (
    <CardBase
      title={`\u26A1 ${data.title}`}
      icon={<BoxIcon name="bx-bolt-circle" size={16} />}
      badge={data.id}
      badgeColor={badgeColor}
      defaultCollapsed={false}
      className={className}
    >
      <div className="epic-card__meta">
        <span className="epic-card__status">{data.status}</span>
        {data.priority && (
          <span
            className="epic-card__priority"
            style={priorityColor ? {
              background: `color-mix(in srgb, ${priorityColor} 18%, transparent)`,
              color: priorityColor,
            } : undefined}
          >
            {data.priority}
          </span>
        )}
        {data.story_count != null && (
          <span className="epic-card__count">{data.story_count} stories</span>
        )}
      </div>

      {data.completion_percentage != null && (
        <div className="epic-card__progress">
          <div className="epic-card__progress-bar">
            <div className="epic-card__progress-fill" style={{ width: `${pct}%` }} />
          </div>
          <span className="epic-card__progress-label">{pct}%</span>
        </div>
      )}

      {data.stories && data.stories.length > 0 && (
        <div className="epic-card__stories">
          {data.stories.map((story) => (
            <div key={story.id} className="epic-card__story-row">
              <span className={statusDotClass(story.status)} />
              <span className="epic-card__story-id">{story.id}</span>
              <span className="epic-card__story-title">{story.title}</span>
            </div>
          ))}
        </div>
      )}

      {data.description && (
        <p className="epic-card__desc">{data.description}</p>
      )}
    </CardBase>
  );
};
