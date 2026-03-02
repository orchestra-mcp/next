import { useState, useEffect, useCallback, useRef } from 'react';
import type { ReactNode, KeyboardEvent } from 'react';
import './SearchSpotlight.css';

export interface SearchResult {
  id: string;
  title: string;
  description?: string;
  icon?: ReactNode;
  category?: string;
  shortcut?: string;
}

export interface SearchCategory {
  id: string;
  label: string;
  icon?: ReactNode;
}

export interface SearchSpotlightProps {
  /** Whether the spotlight is open */
  open: boolean;
  /** Called when the spotlight should close */
  onClose: () => void;
  /** Called when the search query changes */
  onSearch: (query: string) => void;
  /** Search results to display */
  results: SearchResult[];
  /** Called when a result is selected */
  onSelect: (result: SearchResult) => void;
  /** Placeholder text for the search input */
  placeholder?: string;
  /** Whether results are loading */
  loading?: boolean;
  /** Recent search strings to show when query is empty */
  recentSearches?: string[];
  /** Categories for grouping results */
  categories?: SearchCategory[];
}

export const SearchSpotlight = ({
  open,
  onClose,
  onSearch,
  results,
  onSelect,
  placeholder = 'Search...',
  loading = false,
  recentSearches = [],
  categories = [],
}: SearchSpotlightProps) => {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQuery('');
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  const grouped = groupByCategory(results, categories);
  const flatResults = grouped.flatMap((g) => g.results);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, flatResults.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === 'Enter' && flatResults[activeIndex]) {
        onSelect(flatResults[activeIndex]);
      }
    },
    [flatResults, activeIndex, onClose, onSelect],
  );

  const handleChange = (value: string) => {
    setQuery(value);
    setActiveIndex(0);
    onSearch(value);
  };

  if (!open) return null;

  const showRecent = query === '' && recentSearches.length > 0 && results.length === 0;
  const showEmpty = query !== '' && results.length === 0 && !loading;

  return (
    <div className="spotlight-overlay" data-testid="spotlight-overlay" onClick={onClose}>
      <div
        className="spotlight-modal"
        role="dialog"
        aria-label="Search"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        <input
          ref={inputRef}
          className="spotlight-input"
          type="text"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={placeholder}
          aria-label="Search input"
        />

        {loading && <div className="spotlight-loading" data-testid="spotlight-loading">Searching...</div>}

        {showRecent && (
          <div className="spotlight-section">
            <div className="spotlight-section-label">Recent</div>
            {recentSearches.map((term) => (
              <button
                key={term}
                className="spotlight-recent"
                onClick={() => handleChange(term)}
              >
                {term}
              </button>
            ))}
          </div>
        )}

        {showEmpty && <div className="spotlight-empty">No results found</div>}

        {grouped.map((group) => (
          <div key={group.label} className="spotlight-section">
            {group.label && <div className="spotlight-section-label">{group.label}</div>}
            {group.results.map((result) => {
              const idx = flatResults.indexOf(result);
              return (
                <button
                  key={result.id}
                  className={`spotlight-result${idx === activeIndex ? ' spotlight-result--active' : ''}`}
                  data-testid={`spotlight-result-${result.id}`}
                  onClick={() => onSelect(result)}
                  aria-selected={idx === activeIndex}
                >
                  {result.icon && <span className="spotlight-result-icon">{result.icon}</span>}
                  <div className="spotlight-result-body">
                    <span className="spotlight-result-title">{result.title}</span>
                    {result.description && (
                      <span className="spotlight-result-desc">{result.description}</span>
                    )}
                  </div>
                  {result.shortcut && (
                    <kbd className="spotlight-result-shortcut">{result.shortcut}</kbd>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

interface GroupedResults {
  label: string;
  results: SearchResult[];
}

function groupByCategory(
  results: SearchResult[],
  categories: SearchCategory[],
): GroupedResults[] {
  if (categories.length === 0) {
    return results.length > 0 ? [{ label: '', results }] : [];
  }
  const catMap = new Map(categories.map((c) => [c.id, c.label]));
  const groups = new Map<string, SearchResult[]>();
  for (const r of results) {
    const key = r.category ?? '';
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(r);
  }
  const out: GroupedResults[] = [];
  for (const cat of categories) {
    const items = groups.get(cat.id);
    if (items) out.push({ label: catMap.get(cat.id) ?? cat.id, results: items });
  }
  const uncategorized = groups.get('');
  if (uncategorized) out.push({ label: '', results: uncategorized });
  return out;
}
