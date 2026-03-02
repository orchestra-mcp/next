import './BacklogTreeHeader.css';

export interface BacklogTreeHeaderProps {
  totalTasks: number;
  doneTasks: number;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'todo', label: 'To Do' },
  { key: 'in-progress', label: 'In Progress' },
  { key: 'blocked', label: 'Blocked' },
  { key: 'done', label: 'Done' },
];

export const BacklogTreeHeader = ({
  totalTasks,
  doneTasks,
  searchQuery,
  onSearchChange,
  activeFilter,
  onFilterChange,
}: BacklogTreeHeaderProps) => {
  return (
    <div className="backlog-header" data-testid="backlog-tree-header">
      <div className="backlog-header__top">
        <input
          type="text"
          className="backlog-header__search"
          placeholder="Search backlog..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          data-testid="backlog-search"
        />
        <span className="backlog-header__count">
          {doneTasks}/{totalTasks}
        </span>
      </div>
      <div className="backlog-header__filters">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            className={`backlog-header__filter${activeFilter === f.key ? ' backlog-header__filter--active' : ''}`}
            onClick={() => onFilterChange(f.key)}
            data-testid={`backlog-filter-${f.key}`}
          >
            {f.label}
          </button>
        ))}
      </div>
    </div>
  );
};
