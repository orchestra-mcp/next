import './Breadcrumbs.css';

export interface BreadcrumbItem {
  /** Display label */
  label: string;
  /** Navigation href (omit for current page) */
  href?: string;
  /** Optional icon rendered before the label */
  icon?: React.ReactNode;
}

export interface BreadcrumbsProps {
  /** Ordered list of breadcrumb items */
  items: BreadcrumbItem[];
  /** Separator character between items (default '/') */
  separator?: string;
  /** Max visible items — shows first, ellipsis, then last N-1 */
  maxItems?: number;
  /** Called when a breadcrumb link is clicked */
  onNavigate?: (item: BreadcrumbItem, index: number) => void;
  /** Additional CSS class */
  className?: string;
}

export const Breadcrumbs = ({
  items,
  separator = '/',
  maxItems,
  onNavigate,
  className,
}: BreadcrumbsProps) => {
  if (!items.length) return null;

  const visibleItems = getVisibleItems(items, maxItems);

  return (
    <nav aria-label="Breadcrumb" className={`breadcrumbs${className ? ` ${className}` : ''}`}>
      <ol className="breadcrumbs__list">
        {visibleItems.map((entry, idx) => {
          const isLast = idx === visibleItems.length - 1;
          const isEllipsis = entry.type === 'ellipsis';

          return (
            <li key={isEllipsis ? 'ellipsis' : entry.index} className="breadcrumbs__entry">
              {idx > 0 && (
                <span className="breadcrumbs__separator" aria-hidden="true">
                  {separator}
                </span>
              )}
              {isEllipsis ? (
                <span className="breadcrumbs__ellipsis" aria-hidden="true">...</span>
              ) : isLast ? (
                <span className="breadcrumbs__current" aria-current="page">
                  {entry.item.icon && <span className="breadcrumbs__icon">{entry.item.icon}</span>}
                  {entry.item.label}
                </span>
              ) : (
                <a
                  href={entry.item.href ?? '#'}
                  className="breadcrumbs__item"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate?.(entry.item, entry.index);
                  }}
                >
                  {entry.item.icon && <span className="breadcrumbs__icon">{entry.item.icon}</span>}
                  {entry.item.label}
                </a>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

type VisibleEntry =
  | { type: 'item'; item: BreadcrumbItem; index: number }
  | { type: 'ellipsis' };

function getVisibleItems(items: BreadcrumbItem[], maxItems?: number): VisibleEntry[] {
  const all: VisibleEntry[] = items.map((item, index) => ({ type: 'item', item, index }));

  if (!maxItems || maxItems >= items.length || maxItems < 2) {
    return all;
  }

  const first = all[0];
  const tail = all.slice(-(maxItems - 1));
  return [first, { type: 'ellipsis' }, ...tail];
}
