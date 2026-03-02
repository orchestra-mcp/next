import type { McpNoteResult } from './parseMcpResponse';
import { CardBase } from './CardBase';
import { BoxIcon } from '@orchestra-mcp/icons';
import './NoteCard.css';

export interface NoteCardProps {
  data: McpNoteResult;
  className?: string;
}

export const NoteCard = ({ data, className }: NoteCardProps) => {
  const tags = data.tags ?? [];
  const date = data.updated_at ?? data.created_at;
  const dateStr = date ? new Date(date).toLocaleDateString() : undefined;

  return (
    <CardBase
      title={data.title}
      icon={<BoxIcon name="bx-note" size={16} />}
      badge={data.pinned ? 'Pinned' : undefined}
      badgeColor="warning"
      defaultCollapsed={false}
      className={`note-card${className ? ` ${className}` : ''}`}
    >
      {data.content && (
        <div className="note-card__content">{data.content}</div>
      )}
      {(tags.length > 0 || dateStr) && (
        <div className="note-card__meta">
          {tags.map((tag) => (
            <span key={tag} className="note-card__tag">{tag}</span>
          ))}
          {dateStr && <span className="note-card__date">{dateStr}</span>}
        </div>
      )}
    </CardBase>
  );
};
