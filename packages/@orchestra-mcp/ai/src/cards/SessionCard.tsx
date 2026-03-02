import { CardBase } from './CardBase';
import { BoxIcon } from '@orchestra-mcp/icons';
import './SessionCard.css';

export interface SessionData {
  session_id: string;
  summary: string;
  events?: Array<{ type: string; description?: string }>;
  created_at?: string;
  project?: string;
}

export interface SessionCardProps {
  data: SessionData;
  className?: string;
}

function formatTime(iso?: string): string {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export const SessionCard = ({ data, className }: SessionCardProps) => {
  const shortId = data.session_id.slice(0, 8);
  const eventCount = data.events?.length;
  const badge = eventCount != null ? `${eventCount} events` : 'saved';

  return (
    <CardBase
      title={shortId}
      icon={<BoxIcon name="bx-history" size={16} />}
      badge={badge}
      badgeColor="info"
      defaultCollapsed={false}
      className={`session-card${className ? ` ${className}` : ''}`}
    >
      <p className="session-card__summary">{data.summary}</p>

      {data.events && data.events.length > 0 && (
        <div className="session-card__events">
          {data.events.map((ev, i) => (
            <div key={i} className="session-card__event">
              <span className="session-card__event-type">{ev.type}</span>
              {ev.description && <span>{ev.description}</span>}
            </div>
          ))}
        </div>
      )}

      {data.created_at && (
        <time className="session-card__time">{formatTime(data.created_at)}</time>
      )}
    </CardBase>
  );
};
