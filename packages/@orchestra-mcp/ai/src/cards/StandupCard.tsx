import type { McpStandupResult } from './parseMcpResponse';
import { CardBase } from './CardBase';
import { BoxIcon } from '@orchestra-mcp/icons';
import './StandupCard.css';

export interface StandupCardProps {
  data: McpStandupResult;
  className?: string;
}

export const StandupCard = ({ data, className }: StandupCardProps) => {
  const completed = data.completed ?? [];
  const inProgress = data.in_progress ?? [];
  const blocked = data.blocked ?? [];
  const total = completed.length + inProgress.length + blocked.length;

  return (
    <CardBase
      title="Daily Standup"
      icon={<BoxIcon name="bx-calendar-check" size={16} />}
      badge={String(total)}
      badgeColor="info"
      defaultCollapsed={false}
      className={`standup-card${className ? ` ${className}` : ''}`}
    >
      <div className="standup-card__section">
        <div className="standup-card__section-header standup-card__section-header--completed">
          Completed ({completed.length})
        </div>
        {completed.map((t) => (
          <div key={t.id} className="standup-card__item">
            <BoxIcon name="bx-check" size={14} />
            <span className="standup-card__item-id">{t.id}</span>
            {t.title}
          </div>
        ))}
      </div>

      <div className="standup-card__section">
        <div className="standup-card__section-header standup-card__section-header--progress">
          In Progress ({inProgress.length})
        </div>
        {inProgress.map((t) => (
          <div key={t.id} className="standup-card__item">
            <BoxIcon name="bx-loader-alt" size={14} />
            <span className="standup-card__item-id">{t.id}</span>
            {t.title}
          </div>
        ))}
      </div>

      {blocked.length > 0 && (
        <div className="standup-card__section">
          <div className="standup-card__section-header standup-card__section-header--blocked">
            Blocked ({blocked.length})
          </div>
          {blocked.map((t) => (
            <div key={t.id}>
              <div className="standup-card__item">
                <BoxIcon name="bx-error" size={14} />
                <span className="standup-card__item-id">{t.id}</span>
                {t.title}
              </div>
              {t.reason && (
                <div className="standup-card__reason">{t.reason}</div>
              )}
            </div>
          ))}
        </div>
      )}
    </CardBase>
  );
};
