import { useState } from 'react';
import type { EditEvent } from '../types/events';
import { CardBase } from './CardBase';
import { CodeDiffEditor } from '@orchestra-mcp/editor';
import { BoxIcon } from '@orchestra-mcp/icons';
import './EditCard.css';

export interface EditCardProps {
  event: EditEvent;
  defaultCollapsed?: boolean;
  onOpenInWindow?: () => void;
  onAccept?: (event: EditEvent) => void;
  onReject?: (event: EditEvent) => void;
  className?: string;
}

function getFileName(filePath: string): string {
  const parts = filePath.split('/');
  return parts[parts.length - 1] || filePath;
}

export const EditCard = ({
  event,
  defaultCollapsed,
  onOpenInWindow,
  onAccept,
  onReject,
  className,
}: EditCardProps) => {
  const [decision, setDecision] = useState<'accepted' | 'rejected' | null>(null);

  const handleAccept = () => {
    setDecision('accepted');
    onAccept?.(event);
  };

  const handleReject = () => {
    setDecision('rejected');
    onReject?.(event);
  };

  const showActions = (onAccept || onReject) && !decision && event.status === 'done';

  return (
    <CardBase
      title={getFileName(event.filePath)}
      icon={<BoxIcon name="bx-pencil" size={16} />}
      badge={event.language}
      badgeColor="info"
      status={event.status}
      defaultCollapsed={defaultCollapsed}
      timestamp={event.timestamp}
      headerActions={
        onOpenInWindow && (
          <button
            type="button"
            className="card-base__action-btn"
            onClick={onOpenInWindow}
            title="Open in Window"
          >
            <BoxIcon name="bx-link-external" size={14} />
          </button>
        )
      }
      className={`edit-card${className ? ` ${className}` : ''}`}
    >
      <div className="edit-card__body" title={event.filePath}>
        <CodeDiffEditor
          original={event.original}
          modified={event.modified}
          language={event.language}
          fileName={event.filePath}
          height={250}
          readOnly
          renderSideBySide={false}
        />
      </div>
      {showActions && (
        <div className="edit-card__actions">
          <button type="button" className="edit-card__btn edit-card__btn--accept" onClick={handleAccept}>
            <BoxIcon name="bx-check" size={14} />
            Accept
          </button>
          <button type="button" className="edit-card__btn edit-card__btn--reject" onClick={handleReject}>
            <BoxIcon name="bx-x" size={14} />
            Reject
          </button>
        </div>
      )}
      {decision && (
        <div className={`edit-card__decision edit-card__decision--${decision}`}>
          {decision === 'accepted' ? 'Change accepted' : 'Change rejected'}
        </div>
      )}
    </CardBase>
  );
};
