import './BacklogView.css';

export interface BacklogCard {
  id: string;
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  assignee?: string;
  tags?: string[];
  type?: 'task' | 'bug' | 'story' | 'epic';
}

export interface BacklogColumn {
  id: string;
  title: string;
  cards: BacklogCard[];
  color?: string;
}

export interface BacklogViewProps {
  columns: BacklogColumn[];
  onCardMove?: (cardId: string, fromColumn: string, toColumn: string) => void;
  onCardClick?: (card: BacklogCard) => void;
  compact?: boolean;
}

const TYPE_ICONS: Record<string, string> = {
  task: '\u2611',
  bug: '\uD83D\uDC1B',
  story: '\uD83D\uDCD6',
  epic: '\u26A1',
};

const getInitials = (name: string): string =>
  name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);

export const BacklogView = ({
  columns,
  onCardClick,
  compact = false,
}: BacklogViewProps) => {
  return (
    <div
      className={`backlog ${compact ? 'backlog--compact' : ''}`}
      data-testid="backlog-view"
    >
      {columns.map((col) => (
        <div key={col.id} className="backlog__column" data-testid={`column-${col.id}`}>
          <div className="backlog__column-header">
            <span
              className="backlog__column-dot"
              style={{ backgroundColor: col.color || 'var(--color-accent)' }}
            />
            <span className="backlog__column-title">{col.title}</span>
            <span className="backlog__column-count" data-testid={`count-${col.id}`}>
              {col.cards.length}
            </span>
          </div>
          <div className="backlog__cards">
            {col.cards.map((card) => (
              <button
                key={card.id}
                type="button"
                className="backlog__card"
                data-testid={`card-${card.id}`}
                onClick={() => onCardClick?.(card)}
              >
                <div className="backlog__card-top">
                  {card.type && (
                    <span className="backlog__card-type" data-testid={`type-${card.id}`}>
                      {TYPE_ICONS[card.type] || card.type}
                    </span>
                  )}
                  {card.priority && (
                    <span
                      className={`backlog__card-priority backlog__card-priority--${card.priority}`}
                      data-testid={`priority-${card.id}`}
                    />
                  )}
                </div>
                <span className="backlog__card-title">{card.title}</span>
                {card.description && (
                  <span className="backlog__card-desc">{card.description}</span>
                )}
                <div className="backlog__card-bottom">
                  {card.tags && card.tags.length > 0 && (
                    <div className="backlog__card-tags" data-testid={`tags-${card.id}`}>
                      {card.tags.map((tag) => (
                        <span key={tag} className="backlog__card-tag">{tag}</span>
                      ))}
                    </div>
                  )}
                  {card.assignee && (
                    <span className="backlog__card-assignee" data-testid={`assignee-${card.id}`}>
                      {getInitials(card.assignee)}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
