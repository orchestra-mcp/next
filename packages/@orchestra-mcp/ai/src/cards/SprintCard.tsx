import type { McpSprintResult } from './parseMcpResponse';
import { CardBase } from './CardBase';
import { BoxIcon } from '@orchestra-mcp/icons';
import './SprintCard.css';

export interface SprintCardProps {
  data: McpSprintResult;
  className?: string;
}

const STATUS_BADGE: Record<string, 'success' | 'gray' | 'info'> = {
  active: 'success',
  planning: 'gray',
  completed: 'info',
};

function formatShortDate(iso?: string): string {
  if (!iso) return '--';
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export const SprintCard = ({ data, className }: SprintCardProps) => {
  const badgeColor = STATUS_BADGE[data.status] ?? 'gray';

  return (
    <CardBase
      title={data.name}
      icon={<BoxIcon name="bx-run" size={16} />}
      badge={data.status}
      badgeColor={badgeColor}
      defaultCollapsed={false}
      className={`sprint-card${className ? ` ${className}` : ''}`}
    >
      {data.goal && (
        <p className="sprint-card__goal">{data.goal}</p>
      )}

      <div className="sprint-card__dates">
        <span className="sprint-card__date">{formatShortDate(data.start_date)}</span>
        <span className="sprint-card__arrow">-&gt;</span>
        <span className="sprint-card__date">{formatShortDate(data.end_date)}</span>
      </div>

      <span className="sprint-card__id">{data.id}</span>
    </CardBase>
  );
};
