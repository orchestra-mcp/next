import { useState, useMemo, useCallback } from 'react';
import { Widget } from '@orchestra-mcp/widgets';
import { BoxIcon } from '@orchestra-mcp/icons';
import { ContextMenu } from '@orchestra-mcp/ui';
import type { ContextMenuItem } from '@orchestra-mcp/ui';
import { BacklogTreeHeader } from './BacklogTreeHeader';
import './BacklogTreeWidget.css';

export interface TreeNode {
  id: string;
  title: string;
  type: 'epic' | 'story' | 'task' | 'bug' | 'hotfix';
  status: string;
  priority?: string;
  children?: TreeNode[];
  description?: string;
  labels?: string[];
  estimate?: number;
  assignedTo?: string;
}

export interface BacklogTreeWidgetProps {
  tree: TreeNode[];
  onNodeClick?: (node: TreeNode) => void;
  onNodeExpand?: (nodeId: string) => void;
  onNodeAction?: (actionId: string, node: TreeNode) => void;
  expandedNodes?: Set<string>;
  selectedNode?: string | null;
  loading?: boolean;
  totalTasks?: number;
  doneTasks?: number;
  showHeader?: boolean;
  onRefresh?: () => void;
  onFullView?: () => void;
}

const TYPE_ICON_NAMES: Record<string, string> = {
  task: 'bx-checkbox-checked',
  bug: 'bx-bug',
  hotfix: 'bx-badge-check',
  story: 'bx-book-bookmark',
  epic: 'bx-layer',
};

const PRIORITY_COLORS: Record<string, string> = {
  low: '#22c55e',
  medium: '#eab308',
  high: '#f97316',
  critical: '#ef4444',
};

const STATUS_FILTER_MAP: Record<string, string[]> = {
  all: [],
  todo: ['backlog', 'todo'],
  'in-progress': ['in-progress', 'in-testing', 'in-docs', 'in-review'],
  blocked: ['blocked'],
  done: ['done', 'documented', 'cancelled'],
};

/** Recursively check if a node or any descendant matches */
function nodeMatches(node: TreeNode, query: string, statusFilter: string[]): boolean {
  const titleMatch = !query || node.title.toLowerCase().includes(query.toLowerCase());
  const statusMatch = statusFilter.length === 0 || statusFilter.includes(node.status);
  if (titleMatch && statusMatch) return true;
  if (node.children?.some((c) => nodeMatches(c, query, statusFilter))) return true;
  return false;
}

/** Count tasks + done tasks in a subtree */
function countTasks(node: TreeNode): { total: number; done: number } {
  if (!node.children || node.children.length === 0) {
    return { total: 1, done: node.status === 'done' ? 1 : 0 };
  }
  let total = 0;
  let done = 0;
  for (const child of node.children) {
    const c = countTasks(child);
    total += c.total;
    done += c.done;
  }
  return { total, done };
}

/** Sum story points for a parent node */
function sumEstimate(node: TreeNode): number {
  if (node.estimate) return node.estimate;
  if (!node.children) return 0;
  return node.children.reduce((sum, c) => sum + sumEstimate(c), 0);
}

const LABEL_COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4',
  '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6', '#f59e0b',
];

function labelColor(label: string): string {
  let hash = 0;
  for (let i = 0; i < label.length; i++) hash = (hash * 31 + label.charCodeAt(i)) | 0;
  return LABEL_COLORS[Math.abs(hash) % LABEL_COLORS.length];
}

interface TreeNodeRowProps {
  node: TreeNode;
  depth: number;
  expandedNodes: Set<string>;
  selectedNode?: string | null;
  onNodeClick?: (node: TreeNode) => void;
  onNodeExpand?: (nodeId: string) => void;
  onNodeAction?: (actionId: string, node: TreeNode) => void;
}

const TreeNodeRow = ({
  node,
  depth,
  expandedNodes,
  selectedNode,
  onNodeClick,
  onNodeExpand,
  onNodeAction,
}: TreeNodeRowProps) => {
  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = expandedNodes.has(node.id);
  const isSelected = selectedNode === node.id;

  const handleClick = (e: React.MouseEvent) => {
    // Don't expand when clicking on a task - just select it
    if (node.type === 'task' || node.type === 'bug' || node.type === 'hotfix') {
      onNodeClick?.(node);
      return;
    }

    // For epics and stories, toggle expand and select
    if (hasChildren) {
      onNodeExpand?.(node.id);
    }
    onNodeClick?.(node);
  };

  const contextMenuItems: ContextMenuItem[] = useMemo(() => {
    const items: ContextMenuItem[] = [];

    // View details (for all types)
    items.push({
      id: 'view',
      label: 'View Details',
      icon: <BoxIcon name="bx-show" size={14} />,
    });

    // Status actions (for tasks)
    if (node.type === 'task' || node.type === 'bug' || node.type === 'hotfix') {
      items.push({ id: 'sep-1', label: '', separator: true });

      if (node.status === 'backlog' || node.status === 'todo') {
        items.push({
          id: 'start',
          label: 'Start Task',
          icon: <BoxIcon name="bx-play" size={14} />,
          color: 'success',
        });
      }

      if (node.status === 'in-progress') {
        items.push({
          id: 'complete',
          label: 'Mark Complete',
          icon: <BoxIcon name="bx-check" size={14} />,
          color: 'success',
        });
      }

      if (node.status !== 'blocked') {
        items.push({
          id: 'block',
          label: 'Block Task',
          icon: <BoxIcon name="bx-block" size={14} />,
          color: 'warning',
        });
      }

      items.push({ id: 'sep-2', label: '', separator: true });
      items.push({
        id: 'delete',
        label: 'Delete Task',
        icon: <BoxIcon name="bx-trash" size={14} />,
        color: 'danger',
      });
    }

    return items;
  }, [node.type, node.status]);

  const handleContextAction = useCallback((actionId: string) => {
    if (actionId === 'view') {
      onNodeClick?.(node);
    } else {
      onNodeAction?.(actionId, node);
    }
  }, [node, onNodeClick, onNodeAction]);

  const nodeClasses = [
    'backlog-tree__node',
    isSelected ? 'backlog-tree__node--selected' : '',
  ].filter(Boolean).join(' ');

  const expandClasses = [
    'backlog-tree__expand',
    hasChildren && isExpanded ? 'backlog-tree__expand--open' : '',
    !hasChildren ? 'backlog-tree__expand--hidden' : '',
  ].filter(Boolean).join(' ');

  const counts = hasChildren ? countTasks(node) : null;
  const pct = counts && counts.total > 0 ? (counts.done / counts.total) * 100 : 0;
  const est = sumEstimate(node);

  return (
    <>
      <ContextMenu items={contextMenuItems} onAction={handleContextAction}>
        <button
          type="button"
          className={nodeClasses}
          style={{ paddingLeft: `${10 + depth * 20}px` }}
          data-testid={`tree-node-${node.id}`}
          onClick={handleClick}
        >
        <span className={expandClasses} aria-hidden="true">
          <BoxIcon name={isExpanded ? 'bx-chevron-down' : 'bx-chevron-right'} size={14} />
        </span>
        <span className="backlog-tree__type-icon">
          <BoxIcon name={TYPE_ICON_NAMES[node.type] || 'bx-circle'} size={14} />
        </span>
        <span className="backlog-tree__title">{node.title}</span>
        {node.labels && node.labels.length > 0 && (
          <span className="backlog-tree__labels">
            {node.labels.map((label) => (
              <span
                key={label}
                className="backlog-tree__label"
                style={{ backgroundColor: labelColor(label) }}
              >
                {label}
              </span>
            ))}
          </span>
        )}
        {est > 0 && (
          <span className="backlog-tree__estimate">{est}pts</span>
        )}
        {counts && (
          <span className="backlog-tree__task-count" title={`${counts.done}/${counts.total} done`}>
            {counts.total} tasks
          </span>
        )}
        {counts && counts.total > 0 && (
          <span className="backlog-tree__mini-bar">
            <span className="backlog-tree__mini-bar-fill" style={{ width: `${pct}%` }} />
          </span>
        )}
        <span className="backlog-tree__status">{node.status}</span>
        {node.priority && (
          <span
            className="backlog-tree__priority-dot"
            style={{ backgroundColor: PRIORITY_COLORS[node.priority] }}
            title={node.priority}
          />
        )}
      </button>
      </ContextMenu>
      {hasChildren && isExpanded && (
        <div className="backlog-tree__children" data-testid={`tree-children-${node.id}`}>
          {node.children!.map((child) => (
            <TreeNodeRow
              key={child.id}
              node={child}
              depth={depth + 1}
              expandedNodes={expandedNodes}
              selectedNode={selectedNode}
              onNodeClick={onNodeClick}
              onNodeExpand={onNodeExpand}
              onNodeAction={onNodeAction}
            />
          ))}
        </div>
      )}
    </>
  );
};

const EMPTY_SET = new Set<string>();

export const BacklogTreeWidget = ({
  tree,
  onNodeClick,
  onNodeExpand,
  onNodeAction,
  expandedNodes = EMPTY_SET,
  selectedNode = null,
  totalTasks = 0,
  doneTasks = 0,
  showHeader = true,
  loading,
  onRefresh,
  onFullView,
}: BacklogTreeWidgetProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [internalExpanded, setInternalExpanded] = useState(new Set<string>());

  // Use internal state if no external expandedNodes provided
  const effectiveExpanded = expandedNodes !== EMPTY_SET ? expandedNodes : internalExpanded;
  const isControlled = expandedNodes !== EMPTY_SET;

  const handleNodeExpand = (nodeId: string) => {
    if (isControlled) {
      onNodeExpand?.(nodeId);
    } else {
      setInternalExpanded((prev) => {
        const next = new Set(prev);
        if (next.has(nodeId)) {
          next.delete(nodeId);
        } else {
          next.add(nodeId);
        }
        return next;
      });
    }
  };

  const handleExpandAll = () => {
    const allIds = new Set<string>();
    const collectIds = (nodes: TreeNode[]) => {
      nodes.forEach((node) => {
        if (node.children && node.children.length > 0) {
          allIds.add(node.id);
          collectIds(node.children);
        }
      });
    };
    collectIds(tree);
    if (!isControlled) {
      setInternalExpanded(allIds);
    }
  };

  const handleCollapseAll = () => {
    if (!isControlled) {
      setInternalExpanded(new Set());
    }
  };

  const filteredTree = useMemo(() => {
    const statusFilter = STATUS_FILTER_MAP[activeFilter] ?? [];
    if (!searchQuery && statusFilter.length === 0) return tree;
    return tree.filter((node) => nodeMatches(node, searchQuery, statusFilter));
  }, [tree, searchQuery, activeFilter]);

  const widgetActions = [
    {
      id: 'expand-all',
      label: 'Expand All',
      icon: <BoxIcon name="bx-expand-alt" size={16} />,
      onClick: handleExpandAll,
    },
    {
      id: 'collapse-all',
      label: 'Collapse All',
      icon: <BoxIcon name="bx-collapse-alt" size={16} />,
      onClick: handleCollapseAll,
    },
    ...(onFullView
      ? [
          {
            id: 'full-view',
            label: 'Full View',
            icon: <BoxIcon name="bx-fullscreen" size={16} />,
            onClick: onFullView,
          },
        ]
      : []),
  ];

  return (
    <Widget
      title="Backlog"
      icon={<BoxIcon name="bx-list-ul" size={16} />}
      collapsible
      size="medium"
      loading={loading}
      onRefresh={onRefresh}
      actions={widgetActions}
    >
      <div className="backlog-tree-wrapper" data-testid="backlog-tree-widget">
        {showHeader && (
          <BacklogTreeHeader
            totalTasks={totalTasks}
            doneTasks={doneTasks}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
          />
        )}
        {filteredTree.length === 0 ? (
          <div className="backlog-tree__empty" data-testid="backlog-tree-empty">
            {searchQuery || activeFilter !== 'all' ? 'No matching items' : 'No items in backlog'}
          </div>
        ) : (
          <div className="backlog-tree">
            {filteredTree.map((node) => (
              <TreeNodeRow
                key={node.id}
                node={node}
                depth={0}
                expandedNodes={effectiveExpanded}
                selectedNode={selectedNode}
                onNodeClick={onNodeClick}
                onNodeExpand={handleNodeExpand}
                onNodeAction={onNodeAction}
              />
            ))}
          </div>
        )}
      </div>
    </Widget>
  );
};
