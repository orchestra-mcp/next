import { CardBase } from './CardBase';
import { BoxIcon } from '@orchestra-mcp/icons';
import './RetrospectiveCard.css';

export interface RetroData {
  went_well: string[];
  didnt_go_well: string[];
  action_items?: Array<{ description: string; assignee?: string }>;
}

export interface RetrospectiveCardProps {
  data: RetroData;
  className?: string;
}

export const RetrospectiveCard = ({ data, className }: RetrospectiveCardProps) => {
  return (
    <CardBase
      title="Sprint Retrospective"
      icon={<BoxIcon name="bx-conversation" size={16} />}
      badgeColor="info"
      defaultCollapsed={false}
      className={`retro-card${className ? ` ${className}` : ''}`}
    >
      <div className="retro-card__section">
        <div className="retro-card__section-header retro-card__section-header--good">
          Went Well ({data.went_well.length})
        </div>
        {data.went_well.map((item, i) => (
          <div key={i} className="retro-card__item">
            <span className="retro-card__indicator--good">
              <BoxIcon name="bx-like" size={14} />
            </span>
            {item}
          </div>
        ))}
      </div>

      <div className="retro-card__section">
        <div className="retro-card__section-header retro-card__section-header--bad">
          Didn't Go Well ({data.didnt_go_well.length})
        </div>
        {data.didnt_go_well.map((item, i) => (
          <div key={i} className="retro-card__item">
            <span className="retro-card__indicator--bad">
              <BoxIcon name="bx-dislike" size={14} />
            </span>
            {item}
          </div>
        ))}
      </div>

      {data.action_items && data.action_items.length > 0 && (
        <div className="retro-card__section">
          <div className="retro-card__section-header retro-card__section-header--action">
            Action Items ({data.action_items.length})
          </div>
          {data.action_items.map((item, i) => (
            <div key={i} className="retro-card__item">
              <BoxIcon name="bx-checkbox" size={14} />
              {item.description}
              {item.assignee && (
                <span className="retro-card__assignee">{item.assignee}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </CardBase>
  );
};
