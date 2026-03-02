import type { McpStoryResult } from './parseMcpResponse';
import { CardBase } from './CardBase';
import { BoxIcon } from '@orchestra-mcp/icons';
import './StoryCard.css';

const PRIORITY_COLORS: Record<string, string> = {
  low: '#22c55e',
  medium: '#eab308',
  high: '#f97316',
  critical: '#ef4444',
};

const TYPE_ICONS: Record<string, string> = {
  task: '\u2611',
  bug: '\uD83D\uDC1B',
  hotfix: '\uD83D\uDD25',
};

export interface StoryCardProps {
  data: McpStoryResult & {
    user_story?: string;
    tasks?: Array<{ id: string; title: string; status: string; type: string }>;
    task_count?: number;
  };
  className?: string;
}

function statusDotClass(status: string): string {
  if (status === 'done') return 'story-card__dot story-card__dot--done';
  if (status === 'in-progress') return 'story-card__dot story-card__dot--active';
  return 'story-card__dot';
}

export const StoryCard = ({ data, className }: StoryCardProps) => {
  const priorityColor = data.priority ? PRIORITY_COLORS[data.priority] : undefined;

  return (
    <CardBase
      title={`\uD83D\uDCD6 ${data.title}`}
      icon={<BoxIcon name="bx-book-open" size={16} />}
      badge={data.id}
      badgeColor="gray"
      defaultCollapsed={false}
      className={className}
    >
      <div className="story-card__meta">
        <span className="story-card__status">{data.status}</span>
        {data.priority && (
          <span
            className="story-card__priority"
            style={priorityColor ? {
              background: `color-mix(in srgb, ${priorityColor} 18%, transparent)`,
              color: priorityColor,
            } : undefined}
          >
            {data.priority}
          </span>
        )}
        {data.task_count != null && (
          <span className="story-card__count">{data.task_count} tasks</span>
        )}
      </div>

      {data.user_story && (
        <p className="story-card__user-story">{data.user_story}</p>
      )}

      {data.tasks && data.tasks.length > 0 && (
        <div className="story-card__tasks">
          {data.tasks.map((task) => (
            <div key={task.id} className="story-card__task-row">
              <span className={statusDotClass(task.status)} />
              <span className="story-card__task-icon" aria-hidden="true">
                {TYPE_ICONS[task.type] ?? '\u2611'}
              </span>
              <span className="story-card__task-id">{task.id}</span>
              <span className="story-card__task-title">{task.title}</span>
            </div>
          ))}
        </div>
      )}

      {data.description && (
        <p className="story-card__desc">{data.description}</p>
      )}
    </CardBase>
  );
};
