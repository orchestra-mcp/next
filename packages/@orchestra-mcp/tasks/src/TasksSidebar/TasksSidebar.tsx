import { useState, useMemo } from 'react';
import type { TreeNode } from '../widgets';
import type { FilterState } from '../TaskFilter';
import type { ConnectionStatusProps } from '../ConnectionStatus';
import { TaskFilter } from '../TaskFilter';
import { ConnectionStatusDot, ConnectionStatusBanner } from '../ConnectionStatus';
import { useFilteredTree, extractAssignees, collectMatchParentIds } from '../hooks/useFilteredTree';
import { useDebounce } from '../hooks/useDebounce';
import { BacklogTree } from '../BacklogTree';
import './TasksSidebar.css';

export interface TasksSidebarProps {
  projectName: string;
  projectSlug: string;
  tree: TreeNode[];
  loading?: boolean;
  connectionStatus?: ConnectionStatusProps['status'];
  onBack?: () => void;
  onTaskClick?: (node: TreeNode) => void;
  onTaskSelect?: (taskId: string, epicId: string, storyId: string) => void;
  onRefresh?: () => void;
}

const INITIAL_FILTERS: FilterState = { statuses: [], priorities: [], assignee: '', searchQuery: '' };

export function TasksSidebar({
  projectName,
  projectSlug,
  tree,
  loading,
  connectionStatus,
  onBack,
  onTaskClick,
  onTaskSelect,
  onRefresh,
}: TasksSidebarProps) {
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
  const debouncedQuery = useDebounce(filters.searchQuery, 300);
  const debouncedFilters = useMemo(
    () => ({ ...filters, searchQuery: debouncedQuery }),
    [filters, debouncedQuery],
  );
  const filteredTree = useFilteredTree(tree, debouncedFilters);
  const autoExpandIds = useMemo(
    () => collectMatchParentIds(tree, debouncedQuery),
    [tree, debouncedQuery],
  );
  const assignees = extractAssignees(tree);

  return (
    <div className="tasks-sidebar" data-testid="tasks-sidebar">
      <div className="tasks-sidebar__header">
        {onBack && (
          <button
            type="button"
            className="tasks-sidebar__back"
            onClick={onBack}
            aria-label="Back to projects"
          >
            &#8592;
          </button>
        )}
        <span className="tasks-sidebar__project-name">{projectName}</span>
        {connectionStatus && <ConnectionStatusDot status={connectionStatus} />}
        {onRefresh && (
          <button
            type="button"
            className="tasks-sidebar__refresh"
            onClick={onRefresh}
            aria-label="Refresh"
          >
            &#8635;
          </button>
        )}
      </div>
      {connectionStatus && <ConnectionStatusBanner status={connectionStatus} />}
      <TaskFilter value={filters} onChange={setFilters} assignees={assignees} />
      <BacklogTree
        tree={filteredTree}
        projectSlug={projectSlug}
        loading={loading}
        onTaskClick={onTaskClick}
        onTaskSelect={onTaskSelect}
        autoExpandIds={autoExpandIds}
      />
    </div>
  );
}
