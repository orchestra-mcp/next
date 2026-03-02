import type { FC } from 'react';
import type { StartupPrompt } from '../types/message';
import './ChatStartupPrompts.css';

export interface ChatStartupPromptsProps {
  /** Heading text */
  title?: string;
  /** Secondary text below the title */
  subtitle?: string;
  /** Grid of prompt cards */
  prompts: StartupPrompt[];
  /** Fires when a prompt card is clicked */
  onSelect: (prompt: string) => void;
  /** Maximum prompts visible in the initial grid */
  maxVisible?: number;
  /** Fires when "Show all" is clicked (parent owns the modal) */
  onShowMore?: () => void;
  /** Additional CSS class */
  className?: string;
}

export const ChatStartupPrompts: FC<ChatStartupPromptsProps> = ({
  title = 'How can I help you?',
  subtitle,
  prompts,
  onSelect,
  maxVisible = 4,
  onShowMore,
  className,
}) => {
  const visiblePrompts = prompts.slice(0, maxVisible);
  const hasMore = prompts.length > maxVisible;

  return (
    <div
      className={`startup${className ? ` ${className}` : ''}`}
      data-testid="startup-prompts"
    >
      <div className="startup__header">
        <h2 className="startup__title">{title}</h2>
        {subtitle && <p className="startup__subtitle">{subtitle}</p>}
      </div>

      {prompts.length > 0 && (
        <div className="startup__grid">
          {visiblePrompts.map((p) => (
            <button
              key={p.id}
              type="button"
              className="startup__card"
              style={p.color ? { '--card-accent': p.color } as React.CSSProperties : undefined}
              onClick={() => onSelect(p.prompt)}
              data-testid={`startup-card-${p.id}`}
            >
              {p.icon && <span className="startup__card-icon">{p.icon}</span>}
              <span className="startup__card-title">{p.title}</span>
              {p.description && (
                <span className="startup__card-desc">{p.description}</span>
              )}
            </button>
          ))}
        </div>
      )}

      {hasMore && onShowMore && (
        <button
          type="button"
          className="startup__show-more"
          onClick={onShowMore}
          data-testid="startup-show-more"
        >
          Show all ({prompts.length})
        </button>
      )}
    </div>
  );
};
