import type { MentionGroup } from '../types/message';
import './MentionToken.css';

export interface MentionTokenProps {
  label: string;
  group: MentionGroup;
  onRemove?: () => void;
}

/** Group colors matching GROUP_META from MentionPopup */
const GROUP_COLORS: Record<MentionGroup, string> = {
  files: '#6366f1',
  tasks: '#22c55e',
  epics: '#f59e0b',
  sessions: '#3b82f6',
  agents: '#ec4899',
  skills: '#8b5cf6',
};

export function MentionToken({ label, group, onRemove }: MentionTokenProps) {
  const color = GROUP_COLORS[group] || '#6366f1';

  return (
    <span
      className="mention-token"
      style={{ '--mention-color': color } as React.CSSProperties}
      data-group={group}
      data-testid={`mention-token-${label}`}
    >
      <span className="mention-token__label">@{label}</span>
      {onRemove && (
        <button
          type="button"
          className="mention-token__remove"
          onClick={onRemove}
          aria-label={`Remove @${label}`}
        >
          &times;
        </button>
      )}
    </span>
  );
}
