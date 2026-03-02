import type { PlanEvent } from '../types/events';
import { CardBase } from './CardBase';
import { ChatMarkdown } from '../ChatMarkdown';
import { BoxIcon } from '@orchestra-mcp/icons';
import './PlanCard.css';

export interface PlanCardProps {
  event: PlanEvent;
  defaultCollapsed?: boolean;
  className?: string;
}

export const PlanCard = ({
  event,
  defaultCollapsed = false,
  className,
}: PlanCardProps) => {
  return (
    <CardBase
      title="Implementation Plan"
      icon={<BoxIcon name="bx-map" size={16} />}
      badge="plan"
      badgeColor="info"
      status={event.status}
      defaultCollapsed={defaultCollapsed}
      timestamp={event.timestamp}
      className={`plan-card${className ? ' ' + className : ''}`}
    >
      <div className="plan-card__content">
        <ChatMarkdown content={event.content} />
      </div>
    </CardBase>
  );
};
