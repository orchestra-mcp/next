import type { MessageAction } from '../types/message';
import './ChatMessageActions.css';

export interface ChatMessageActionsProps {
  /** ID of the parent message */
  messageId: string;
  /** Action definitions (icon, label, onClick) */
  actions: MessageAction[];
  /** Whether the action bar is visible (controlled by parent hover) */
  visible: boolean;
  /** Additional CSS class */
  className?: string;
}

export const ChatMessageActions = ({
  messageId,
  actions,
  visible,
  className,
}: ChatMessageActionsProps) => {
  const cls = [
    'chat-actions',
    visible && 'chat-actions--visible',
    className,
  ].filter(Boolean).join(' ');

  if (actions.length === 0) return null;

  return (
    <div className={cls} data-testid="chat-message-actions" role="toolbar">
      {actions.map((action) => (
        <button
          key={action.id}
          type="button"
          className="chat-actions__btn"
          onClick={() => action.onClick(messageId)}
          aria-label={action.label}
          title={action.label}
          data-testid={`chat-action-${action.id}`}
        >
          <span className="chat-actions__icon">{action.icon}</span>
        </button>
      ))}
    </div>
  );
};
