import type { OrchestraEvent } from '../types/events';
import './OrchestraCard.css';

export interface OrchestraCardProps {
  event: OrchestraEvent;
  className?: string;
}

const TYPE_ICONS: Record<OrchestraEvent['issueType'], string> = {
  epic: '\u26A1',
  story: '\uD83D\uDCD6',
  task: '\u2611',
  bug: '\uD83D\uDC1B',
  hotfix: '\uD83D\uDD25',
};

const TYPE_BORDERS: Record<OrchestraEvent['issueType'], string> = {
  epic: 'var(--color-accent)',
  story: '#3b82f6',
  task: 'var(--color-border)',
  bug: '#ef4444',
  hotfix: '#f97316',
};

const PRIORITY_COLORS: Record<string, string> = {
  low: '#22c55e',
  medium: '#eab308',
  high: '#f97316',
  critical: '#ef4444',
};

export const OrchestraCard = ({ event, className }: OrchestraCardProps) => {
  const borderColor = TYPE_BORDERS[event.issueType];
  const priorityColor = event.priority
    ? PRIORITY_COLORS[event.priority]
    : undefined;

  return (
    <div
      className={`orchestra-card${className ? ` ${className}` : ''}`}
      style={{ borderLeftColor: borderColor }}
      data-status={event.status === 'in-progress' ? 'running' : undefined}
      data-testid="orchestra-card"
    >
      <div className="orchestra-card__top">
        <span className="orchestra-card__icon" aria-hidden="true">
          {TYPE_ICONS[event.issueType]}
        </span>
        <span className="orchestra-card__id">{event.issueId}</span>
        <span className="orchestra-card__title" title={event.title}>
          {event.title}
        </span>
      </div>
      <div className="orchestra-card__bottom">
        {event.status && (
          <span className="orchestra-card__status">{event.status}</span>
        )}
        {event.priority && (
          <span
            className="orchestra-card__priority"
            style={
              priorityColor
                ? {
                    background: `color-mix(in srgb, ${priorityColor} 18%, transparent)`,
                    color: priorityColor,
                  }
                : undefined
            }
          >
            {event.priority}
          </span>
        )}
      </div>
    </div>
  );
};
