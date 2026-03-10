"use client";

import type { PermissionEvent } from '../types/events';
import { CardBase } from './CardBase';
import { BoxIcon } from '@orchestra-mcp/icons';
import './PermissionCard.css';

export interface PermissionCardProps {
  event: PermissionEvent;
  defaultCollapsed?: boolean;
  className?: string;
  /** Called when user clicks Approve or Deny. */
  onDecision?: (requestId: string, decision: 'approve' | 'deny') => void;
}

export const PermissionCard = ({
  event,
  defaultCollapsed = false,
  className,
  onDecision,
}: PermissionCardProps) => {
  const decided = !!event.decision;
  const approved = event.decision === 'approved';

  return (
    <CardBase
      title={`Permission: ${event.toolName}`}
      icon={<BoxIcon name="bx-shield-quarter" size={16} />}
      badge={decided ? (approved ? 'Approved' : 'Denied') : 'Waiting'}
      badgeColor={decided ? (approved ? 'success' : 'danger') : 'warning'}
      status={decided ? 'done' : 'running'}
      defaultCollapsed={defaultCollapsed}
      className={`permission-card${className ? ` ${className}` : ''}`}
    >
      <div className="permission-card__body">
        {event.reason && (
          <p className="permission-card__reason">{event.reason}</p>
        )}
        {event.toolInput && (
          <pre className="permission-card__input">{event.toolInput}</pre>
        )}
        {!decided && (
          <div className="permission-card__actions">
            <button
              type="button"
              className="permission-card__btn permission-card__btn--approve"
              onClick={() => onDecision?.(event.requestId, 'approve')}
            >
              <BoxIcon name="bx-check" size={14} />
              Approve
            </button>
            <button
              type="button"
              className="permission-card__btn permission-card__btn--deny"
              onClick={() => onDecision?.(event.requestId, 'deny')}
            >
              <BoxIcon name="bx-x" size={14} />
              Deny
            </button>
          </div>
        )}
      </div>
    </CardBase>
  );
};
