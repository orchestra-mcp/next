import { useState, useCallback, useEffect, useRef } from 'react';
import './TaskFilter.css';

export interface FilterState {
  statuses: string[];
  priorities: string[];
  assignee: string;
  searchQuery: string;
}

export interface TaskFilterProps {
  value: FilterState;
  onChange: (filters: FilterState) => void;
  assignees?: string[];
}

const ALL_STATUSES = [
  'backlog', 'todo', 'in-progress', 'blocked',
  'ready-for-testing', 'in-testing', 'ready-for-docs', 'in-docs',
  'documented', 'in-review', 'done', 'rejected', 'cancelled',
];

const ALL_PRIORITIES = ['critical', 'high', 'medium', 'low'];

const STATUS_LABELS: Record<string, string> = {
  backlog: 'Backlog', todo: 'To Do', 'in-progress': 'In Progress',
  blocked: 'Blocked', 'ready-for-testing': 'Ready Test', 'in-testing': 'Testing',
  'ready-for-docs': 'Ready Docs', 'in-docs': 'In Docs', documented: 'Documented',
  'in-review': 'In Review', done: 'Done', rejected: 'Rejected', cancelled: 'Cancelled',
};

const PRIORITY_LABELS: Record<string, string> = {
  critical: 'Critical', high: 'High', medium: 'Medium', low: 'Low',
};

type DropdownKey = 'status' | 'priority' | 'assignee' | null;

export function TaskFilter({ value, onChange, assignees = [] }: TaskFilterProps) {
  const [open, setOpen] = useState<DropdownKey>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toggleDropdown = useCallback((key: DropdownKey) => {
    setOpen((prev) => (prev === key ? null : key));
  }, []);

  const toggleStatus = useCallback((status: string) => {
    const next = value.statuses.includes(status)
      ? value.statuses.filter((s) => s !== status)
      : [...value.statuses, status];
    onChange({ ...value, statuses: next });
  }, [value, onChange]);

  const togglePriority = useCallback((priority: string) => {
    const next = value.priorities.includes(priority)
      ? value.priorities.filter((p) => p !== priority)
      : [...value.priorities, priority];
    onChange({ ...value, priorities: next });
  }, [value, onChange]);

  const setAssignee = useCallback((assignee: string) => {
    onChange({ ...value, assignee });
    setOpen(null);
  }, [value, onChange]);

  const clearAll = useCallback(() => {
    onChange({ statuses: [], priorities: [], assignee: '', searchQuery: '' });
  }, [onChange]);

  const selectAllStatuses = useCallback(() => {
    onChange({ ...value, statuses: [...ALL_STATUSES] });
  }, [value, onChange]);

  const clearStatuses = useCallback(() => {
    onChange({ ...value, statuses: [] });
  }, [value, onChange]);

  const onSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...value, searchQuery: e.target.value });
  }, [value, onChange]);

  const clearSearch = useCallback(() => {
    onChange({ ...value, searchQuery: '' });
  }, [value, onChange]);

  const hasFilters = value.statuses.length > 0 || value.priorities.length > 0 || value.assignee !== '' || value.searchQuery !== '';

  return (
    <div className="task-filter" ref={ref} data-testid="task-filter">
      <div className="task-filter__search-wrap">
        <input
          className="task-filter__search"
          type="text"
          placeholder="Search tasks..."
          value={value.searchQuery}
          onChange={onSearchChange}
          data-testid="task-filter-search"
        />
        {value.searchQuery && (
          <button
            type="button"
            className="task-filter__search-clear"
            onClick={clearSearch}
            aria-label="Clear search"
          >
            &times;
          </button>
        )}
      </div>
      <FilterDropdown
        label="Status"
        count={value.statuses.length}
        isOpen={open === 'status'}
        onToggle={() => toggleDropdown('status')}
      >
        <div className="task-filter__actions">
          <button type="button" className="task-filter__action-btn" onClick={selectAllStatuses}>
            Select All
          </button>
          <button type="button" className="task-filter__action-btn" onClick={clearStatuses}>
            Clear
          </button>
        </div>
        {ALL_STATUSES.map((s) => (
          <CheckboxOption
            key={s}
            label={STATUS_LABELS[s] ?? s}
            checked={value.statuses.includes(s)}
            onChange={() => toggleStatus(s)}
          />
        ))}
      </FilterDropdown>

      <FilterDropdown
        label="Priority"
        count={value.priorities.length}
        isOpen={open === 'priority'}
        onToggle={() => toggleDropdown('priority')}
      >
        {ALL_PRIORITIES.map((p) => (
          <CheckboxOption
            key={p}
            label={PRIORITY_LABELS[p] ?? p}
            checked={value.priorities.includes(p)}
            onChange={() => togglePriority(p)}
          />
        ))}
      </FilterDropdown>

      <FilterDropdown
        label="Assignee"
        count={value.assignee ? 1 : 0}
        isOpen={open === 'assignee'}
        onToggle={() => toggleDropdown('assignee')}
      >
        <button
          type="button"
          className={`task-filter__option${value.assignee === '' ? ' task-filter__option--selected' : ''}`}
          onClick={() => setAssignee('')}
        >
          All
        </button>
        {assignees.map((a) => (
          <button
            key={a}
            type="button"
            className={`task-filter__option${value.assignee === a ? ' task-filter__option--selected' : ''}`}
            onClick={() => setAssignee(a)}
          >
            {a}
          </button>
        ))}
      </FilterDropdown>

      {hasFilters && (
        <button type="button" className="task-filter__clear" onClick={clearAll}>
          Clear all
        </button>
      )}
    </div>
  );
}

function FilterDropdown({
  label,
  count,
  isOpen,
  onToggle,
  children,
}: {
  label: string;
  count: number;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="task-filter__dropdown-wrap">
      <button
        type="button"
        className={`task-filter__trigger${isOpen ? ' task-filter__trigger--active' : ''}`}
        onClick={onToggle}
        data-testid={`filter-trigger-${label.toLowerCase()}`}
      >
        {label}
        {count > 0 && <span className="task-filter__count">{count}</span>}
      </button>
      {isOpen && (
        <div className="task-filter__dropdown" data-testid={`filter-dropdown-${label.toLowerCase()}`}>
          {children}
        </div>
      )}
    </div>
  );
}

function CheckboxOption({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button type="button" className="task-filter__option" onClick={onChange}>
      <span className={`task-filter__checkbox${checked ? ' task-filter__checkbox--checked' : ''}`}>
        {checked ? '\u2713' : ''}
      </span>
      {label}
    </button>
  );
}
