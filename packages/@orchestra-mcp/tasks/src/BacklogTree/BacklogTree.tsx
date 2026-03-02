import { useState, useCallback, useEffect } from 'react';
import { BoxIcon } from '@orchestra-mcp/icons';
import { EmptyState } from '@orchestra-mcp/ui';
import type { TreeNode } from '../widgets';
import { StatusBadge } from '../StatusBadge';
import { PriorityIcon } from '../PriorityIcon';
import { QuickActions } from './QuickActions';
import './BacklogTree.css';

export interface BacklogTreeProps {
  tree: TreeNode[];
  projectSlug: string;
  loading?: boolean;
  onTaskClick?: (node: TreeNode) => void;
  onTaskSelect?: (taskId: string, epicId: string, storyId: string) => void;
  autoExpandIds?: Set<string>;
  pendingTaskIds?: Set<string>;
}

const STORAGE_KEY = 'orchestra-backlog-expanded';

function loadExpanded(slug: string): Set<string> {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY}:${slug}`);
    if (raw) return new Set(JSON.parse(raw));
  } catch { /* ignore */ }
  return new Set<string>();
}

function saveExpanded(slug: string, expanded: Set<string>) {
  try {
    localStorage.setItem(`${STORAGE_KEY}:${slug}`, JSON.stringify([...expanded]));
  } catch { /* ignore */ }
}

export function BacklogTree({ tree, projectSlug, loading, onTaskClick, onTaskSelect, autoExpandIds, pendingTaskIds }: BacklogTreeProps) {
  const [expanded, setExpanded] = useState<Set<string>>(() => loadExpanded(projectSlug));

  useEffect(() => {
    setExpanded(loadExpanded(projectSlug));
  }, [projectSlug]);

  useEffect(() => {
    if (autoExpandIds && autoExpandIds.size > 0) {
      setExpanded((prev) => {
        const next = new Set(prev);
        for (const id of autoExpandIds) next.add(id);
        return next;
      });
    }
  }, [autoExpandIds]);

  const toggle = useCallback((id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      saveExpanded(projectSlug, next);
      return next;
    });
  }, [projectSlug]);

  if (loading) {
    return <div className="backlog-sidebar__loading">Loading...</div>;
  }

  if (tree.length === 0) {
    return (
      <EmptyState
        icon={<BoxIcon name="bx-list-ul" size={40} />}
        title="No epics yet"
        description="Create an epic to get started"
      />
    );
  }

  return (
    <div className="backlog-sidebar" data-testid="backlog-tree">
      {tree.map((epic) => (
        <EpicNode
          key={epic.id}
          node={epic}
          expanded={expanded}
          onToggle={toggle}
          onTaskClick={onTaskClick}
          onTaskSelect={onTaskSelect}
          projectSlug={projectSlug}
          pendingTaskIds={pendingTaskIds}
        />
      ))}
    </div>
  );
}

function EpicNode({
  node, expanded, onToggle, onTaskClick, onTaskSelect, projectSlug, pendingTaskIds,
}: {
  node: TreeNode;
  expanded: Set<string>;
  onToggle: (id: string) => void;
  onTaskClick?: (node: TreeNode) => void;
  onTaskSelect?: (taskId: string, epicId: string, storyId: string) => void;
  projectSlug: string;
  pendingTaskIds?: Set<string>;
}) {
  const isOpen = expanded.has(node.id);
  const stories = node.children ?? [];

  return (
    <div className="backlog-sidebar__epic">
      <button
        type="button"
        className="backlog-sidebar__row backlog-sidebar__row--epic"
        onClick={() => onToggle(node.id)}
      >
        <span className={`backlog-sidebar__chevron${isOpen ? ' backlog-sidebar__chevron--open' : ''}`}>
          &#9654;
        </span>
        <span className="backlog-sidebar__title">{node.title}</span>
        {node.priority && <PriorityIcon priority={node.priority} size={12} />}
        <StatusBadge status={node.status} variant="dot" size="sm" />
      </button>
      {isOpen && stories.length > 0 && (
        <div className="backlog-sidebar__children">
          {stories.map((story) => (
            <StoryNode
              key={story.id}
              node={story}
              expanded={expanded}
              onToggle={onToggle}
              onTaskClick={onTaskClick}
              onTaskSelect={onTaskSelect}
              projectSlug={projectSlug}
              epicId={node.id}
              pendingTaskIds={pendingTaskIds}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function StoryNode({
  node, expanded, onToggle, onTaskClick, onTaskSelect, projectSlug, epicId, pendingTaskIds,
}: {
  node: TreeNode;
  expanded: Set<string>;
  onToggle: (id: string) => void;
  onTaskClick?: (node: TreeNode) => void;
  onTaskSelect?: (taskId: string, epicId: string, storyId: string) => void;
  projectSlug: string;
  epicId: string;
  pendingTaskIds?: Set<string>;
}) {
  const isOpen = expanded.has(node.id);
  const tasks = node.children ?? [];

  return (
    <div className="backlog-sidebar__story">
      <button
        type="button"
        className="backlog-sidebar__row backlog-sidebar__row--story"
        onClick={() => onToggle(node.id)}
      >
        <span className={`backlog-sidebar__chevron${isOpen ? ' backlog-sidebar__chevron--open' : ''}`}>
          &#9654;
        </span>
        <span className="backlog-sidebar__title">{node.title}</span>
        <span className="backlog-sidebar__count">{tasks.length}</span>
        <StatusBadge status={node.status} variant="dot" size="sm" />
      </button>
      {isOpen && tasks.length > 0 && (
        <div className="backlog-sidebar__children">
          {tasks.map((task) => (
            <TaskNode
              key={task.id}
              node={task}
              onTaskClick={onTaskClick}
              onTaskSelect={onTaskSelect}
              projectSlug={projectSlug}
              epicId={epicId}
              storyId={node.id}
              pending={pendingTaskIds?.has(task.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function getInitials(name: string): string {
  return name.split(/[\s-]+/).map((w) => w[0]).join('').toUpperCase().slice(0, 2);
}

function TaskNode({
  node, onTaskClick, onTaskSelect, projectSlug, epicId, storyId, pending,
}: {
  node: TreeNode;
  onTaskClick?: (node: TreeNode) => void;
  onTaskSelect?: (taskId: string, epicId: string, storyId: string) => void;
  projectSlug: string;
  epicId: string;
  storyId: string;
  pending?: boolean;
}) {
  const wrapClass = `backlog-sidebar__task-wrap${pending ? ' backlog-sidebar__task-wrap--pending' : ''}`;

  return (
    <div className={wrapClass} data-testid={pending ? `task-pending-${node.id}` : undefined}>
      <button
        type="button"
        className="backlog-sidebar__row backlog-sidebar__row--task"
        onClick={() => {
          onTaskClick?.(node);
          onTaskSelect?.(node.id, epicId, storyId);
        }}
      >
        <StatusBadge status={node.status} variant="dot" size="sm" />
        <span className="backlog-sidebar__title">{node.title}</span>
        {node.priority && <PriorityIcon priority={node.priority} size={12} />}
        {node.assignedTo && (
          <span className="backlog-sidebar__assignee" title={node.assignedTo}>
            {getInitials(node.assignedTo)}
          </span>
        )}
      </button>
      <QuickActions
        taskId={node.id}
        status={node.status}
        projectSlug={projectSlug}
        epicId={epicId}
        storyId={storyId}
        pending={pending}
      />
    </div>
  );
}
