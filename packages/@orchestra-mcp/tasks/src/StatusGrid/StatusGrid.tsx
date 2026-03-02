import './StatusGrid.css';

export interface StatusCount {
  status: string;
  label: string;
  count: number;
  color?: string;
}

export interface StatusGridProps {
  /** Array of status entries with counts */
  items: StatusCount[];
  /** Called when a status cell is clicked */
  onStatusClick?: (status: string) => void;
  /** Currently selected/highlighted status */
  activeStatus?: string | null;
}

export const StatusGrid = ({ items, onStatusClick, activeStatus }: StatusGridProps) => {
  if (items.length === 0) return null;

  return (
    <div className="status-grid" data-testid="status-grid">
      {items.map((item) => (
        <button
          key={item.status}
          type="button"
          className={[
            'status-grid__cell',
            activeStatus === item.status ? 'status-grid__cell--active' : '',
          ].filter(Boolean).join(' ')}
          data-testid={`status-${item.status}`}
          onClick={() => onStatusClick?.(item.status)}
        >
          <span
            className="status-grid__dot"
            style={{ backgroundColor: item.color || 'var(--color-accent)' }}
          />
          <span className="status-grid__label">{item.label}</span>
          <span className="status-grid__count">{item.count}</span>
        </button>
      ))}
    </div>
  );
};
