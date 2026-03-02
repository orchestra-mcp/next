import type { McpHookEventsResult } from './parseMcpResponse';
import { CardBase } from './CardBase';
import { BoxIcon } from '@orchestra-mcp/icons';
import './HookEventCard.css';

export interface HookEventCardProps {
  data: McpHookEventsResult;
  className?: string;
}

export const HookEventCard = ({ data, className }: HookEventCardProps) => {
  const events = data.events ?? [];

  return (
    <CardBase
      title="Hook Events"
      icon={<BoxIcon name="bx-broadcast" size={16} />}
      badge={String(events.length)}
      badgeColor="info"
      defaultCollapsed={events.length > 5}
      className={`hook-event-card${className ? ` ${className}` : ''}`}
    >
      {events.length === 0 ? (
        <div className="hook-event-card__empty">No hook events</div>
      ) : (
        <div className="hook-event-card__events">
          {events.map((e, i) => {
            const dateStr = e.created_at
              ? new Date(e.created_at).toLocaleTimeString()
              : undefined;
            return (
              <div key={e.id ?? i} className="hook-event-card__event">
                <div className="hook-event-card__event-row">
                  <span className="hook-event-card__type">{e.event_type}</span>
                  {e.tool_name && (
                    <span className="hook-event-card__tool">{e.tool_name}</span>
                  )}
                  {dateStr && (
                    <span className="hook-event-card__date">{dateStr}</span>
                  )}
                </div>
                {e.session_id && (
                  <span className="hook-event-card__session">{e.session_id}</span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </CardBase>
  );
};
