import type { WebSearchEvent } from '../types/events';
import { CardBase } from './CardBase';
import { BoxIcon } from '@orchestra-mcp/icons';
import './WebSearchCard.css';

export interface WebSearchCardProps {
  event: WebSearchEvent;
  className?: string;
}

export const WebSearchCard = ({ event, className }: WebSearchCardProps) => {
  const count = event.results.length;

  return (
    <CardBase
      title="Web Search"
      icon={<BoxIcon name="bx-search-alt" size={16} />}
      badge={`${count} result${count !== 1 ? 's' : ''}`}
      badgeColor="info"
      defaultCollapsed={false}
      className={`web-search-card${className ? ` ${className}` : ''}`}
    >
      <div className="web-search-card__query">
        <BoxIcon name="bx-search" size={12} />
        <span>{event.query}</span>
      </div>

      <div className="web-search-card__results">
        {event.results.map((result, i) => (
          <div key={result.url ?? i} className="web-search-card__result">
            <div className="web-search-card__result-top">
              {result.favicon && (
                <img
                  className="web-search-card__favicon"
                  src={result.favicon}
                  alt=""
                  width={16}
                  height={16}
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              )}
              <a
                className="web-search-card__title"
                href={result.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {result.title}
              </a>
            </div>
            <span className="web-search-card__url">{result.url}</span>
            {result.description && (
              <p className="web-search-card__desc">{result.description}</p>
            )}
          </div>
        ))}
      </div>
    </CardBase>
  );
};
