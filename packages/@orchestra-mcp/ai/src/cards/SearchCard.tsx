import type { McpSearchResult } from './parseMcpResponse';
import { CardBase } from './CardBase';
import { BoxIcon } from '@orchestra-mcp/icons';
import './SearchCard.css';

export interface SearchCardProps {
  data: McpSearchResult;
  className?: string;
}

const TYPE_ICONS: Record<string, string> = {
  task:    'bx-task',
  bug:     'bx-bug',
  hotfix:  'bx-wrench',
  epic:    'bx-layer',
  story:   'bx-book-open',
  sprint:  'bx-run',
};

const STATUS_COLOR: Record<string, string> = {
  done: 'success',
  completed: 'success',
  active: 'info',
  'in-progress': 'warning',
  'in_progress': 'warning',
  blocked: 'danger',
  cancelled: 'muted',
};

export const SearchCard = ({ data, className }: SearchCardProps) => {
  const results = data.results ?? [];

  return (
    <CardBase
      title={`Search: "${data.query}"`}
      icon={<BoxIcon name="bx-search" size={16} />}
      badge={String(results.length)}
      badgeColor="info"
      defaultCollapsed={false}
      className={`search-card${className ? ` ${className}` : ''}`}
    >
      {results.length === 0 ? (
        <div className="search-card__empty">No results found</div>
      ) : (
        <div className="search-card__results">
          {results.map((r) => {
            const icon = TYPE_ICONS[r.type] ?? 'bx-file';
            const statusKey = (r.status ?? '').toLowerCase();
            const color = STATUS_COLOR[statusKey] ?? 'muted';
            return (
              <div key={r.id} className="search-card__result">
                <BoxIcon name={icon as 'bx-task'} size={13} className="search-card__result-icon" />
                <div className="search-card__result-body">
                  <div className="search-card__result-row">
                    <span className="search-card__result-id">{r.id}</span>
                    <span className="search-card__result-title">{r.title}</span>
                  </div>
                  <div className="search-card__result-meta">
                    <span className="search-card__type-badge">{r.type}</span>
                    {r.status && (
                      <span className={`search-card__status-badge search-card__status-badge--${color}`}>
                        {r.status}
                      </span>
                    )}
                    {r.score !== undefined && (
                      <span className="search-card__score">
                        {Math.round(r.score * 100)}%
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </CardBase>
  );
};
