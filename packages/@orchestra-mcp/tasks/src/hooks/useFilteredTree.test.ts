import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import type { TreeNode } from '../widgets';
import type { FilterState } from '../TaskFilter';
import { useFilteredTree, extractAssignees, collectMatchParentIds } from './useFilteredTree';

const emptyFilters: FilterState = { statuses: [], priorities: [], assignee: '', searchQuery: '' };

function makeTree(): TreeNode[] {
  return [
    {
      id: 'E-1', title: 'Epic 1', type: 'epic', status: 'in-progress',
      children: [
        {
          id: 'S-1', title: 'Story 1', type: 'story', status: 'in-progress',
          children: [
            { id: 'T-1', title: 'Task A', type: 'task', status: 'todo', priority: 'high', assignedTo: 'alice' },
            { id: 'T-2', title: 'Task B', type: 'task', status: 'in-progress', priority: 'medium', assignedTo: 'bob' },
            { id: 'T-3', title: 'Bug C', type: 'bug', status: 'done', priority: 'critical', assignedTo: 'alice' },
          ],
        },
        {
          id: 'S-2', title: 'Story 2', type: 'story', status: 'todo',
          children: [
            { id: 'T-4', title: 'Task D', type: 'task', status: 'todo', priority: 'low', assignedTo: 'carol' },
          ],
        },
      ],
    },
  ];
}

describe('useFilteredTree', () => {
  it('returns unfiltered tree when no filters active', () => {
    const tree = makeTree();
    const { result } = renderHook(() => useFilteredTree(tree, emptyFilters));
    expect(result.current).toBe(tree);
  });

  it('filters tasks by single status', () => {
    const tree = makeTree();
    const filters: FilterState = { statuses: ['todo'], priorities: [], assignee: '', searchQuery: '' };
    const { result } = renderHook(() => useFilteredTree(tree, filters));
    expect(result.current).toHaveLength(1);
    const epic = result.current[0];
    expect(epic.children).toHaveLength(2);
    expect(epic.children![0].children).toHaveLength(1);
    expect(epic.children![0].children![0].id).toBe('T-1');
    expect(epic.children![1].children).toHaveLength(1);
    expect(epic.children![1].children![0].id).toBe('T-4');
  });

  it('filters tasks by multiple statuses', () => {
    const tree = makeTree();
    const filters: FilterState = { statuses: ['todo', 'done'], priorities: [], assignee: '', searchQuery: '' };
    const { result } = renderHook(() => useFilteredTree(tree, filters));
    const s1 = result.current[0].children![0];
    expect(s1.children).toHaveLength(2);
    const ids = s1.children!.map((c) => c.id);
    expect(ids).toContain('T-1');
    expect(ids).toContain('T-3');
  });

  it('filters tasks by priority', () => {
    const tree = makeTree();
    const filters: FilterState = { statuses: [], priorities: ['high'], assignee: '', searchQuery: '' };
    const { result } = renderHook(() => useFilteredTree(tree, filters));
    expect(result.current).toHaveLength(1);
    const s1 = result.current[0].children![0];
    expect(s1.children).toHaveLength(1);
    expect(s1.children![0].id).toBe('T-1');
  });

  it('filters tasks by assignee', () => {
    const tree = makeTree();
    const filters: FilterState = { statuses: [], priorities: [], assignee: 'bob', searchQuery: '' };
    const { result } = renderHook(() => useFilteredTree(tree, filters));
    expect(result.current).toHaveLength(1);
    const s1 = result.current[0].children![0];
    expect(s1.children).toHaveLength(1);
    expect(s1.children![0].id).toBe('T-2');
  });

  it('removes empty parents when no children match', () => {
    const tree = makeTree();
    const filters: FilterState = { statuses: ['in-progress'], priorities: [], assignee: '', searchQuery: '' };
    const { result } = renderHook(() => useFilteredTree(tree, filters));
    expect(result.current).toHaveLength(1);
    // S-2 should be removed (no in-progress children)
    expect(result.current[0].children).toHaveLength(1);
    expect(result.current[0].children![0].id).toBe('S-1');
  });

  it('combines status + priority filters', () => {
    const tree = makeTree();
    const filters: FilterState = { statuses: ['todo'], priorities: ['high'], assignee: '', searchQuery: '' };
    const { result } = renderHook(() => useFilteredTree(tree, filters));
    expect(result.current).toHaveLength(1);
    // Only T-1 matches (todo + high)
    expect(result.current[0].children).toHaveLength(1);
    expect(result.current[0].children![0].children).toHaveLength(1);
    expect(result.current[0].children![0].children![0].id).toBe('T-1');
  });

  it('returns empty array when nothing matches', () => {
    const tree = makeTree();
    const filters: FilterState = { statuses: ['cancelled'], priorities: [], assignee: '', searchQuery: '' };
    const { result } = renderHook(() => useFilteredTree(tree, filters));
    expect(result.current).toHaveLength(0);
  });

  it('filters tasks by search query in title', () => {
    const tree: TreeNode[] = [
      {
        id: 'E-1', title: 'Epic', type: 'epic', status: 'in-progress',
        children: [
          {
            id: 'S-1', title: 'Story', type: 'story', status: 'in-progress',
            children: [
              { id: 'T-1', title: 'Build login', type: 'task', status: 'todo' },
              { id: 'T-2', title: 'Add validation', type: 'task', status: 'todo' },
            ],
          },
        ],
      },
    ];
    const filters: FilterState = { statuses: [], priorities: [], assignee: '', searchQuery: 'login' };
    const { result } = renderHook(() => useFilteredTree(tree, filters));
    expect(result.current).toHaveLength(1);
    const tasks = result.current[0].children![0].children!;
    expect(tasks).toHaveLength(1);
    expect(tasks[0].id).toBe('T-1');
  });

  it('filters tasks by search query in description', () => {
    const tree: TreeNode[] = [
      {
        id: 'E-1', title: 'Epic', type: 'epic', status: 'in-progress',
        children: [
          {
            id: 'S-1', title: 'Story', type: 'story', status: 'in-progress',
            children: [
              { id: 'T-1', title: 'Task one', type: 'task', status: 'todo', description: 'Implement auth flow' },
              { id: 'T-2', title: 'Task two', type: 'task', status: 'todo' },
            ],
          },
        ],
      },
    ];
    const filters: FilterState = { statuses: [], priorities: [], assignee: '', searchQuery: 'auth' };
    const { result } = renderHook(() => useFilteredTree(tree, filters));
    const tasks = result.current[0].children![0].children!;
    expect(tasks).toHaveLength(1);
    expect(tasks[0].id).toBe('T-1');
  });

  it('search is case insensitive', () => {
    const tree: TreeNode[] = [
      {
        id: 'E-1', title: 'Epic', type: 'epic', status: 'in-progress',
        children: [
          {
            id: 'S-1', title: 'Story', type: 'story', status: 'in-progress',
            children: [
              { id: 'T-1', title: 'Build login form', type: 'task', status: 'todo' },
            ],
          },
        ],
      },
    ];
    const filters: FilterState = { statuses: [], priorities: [], assignee: '', searchQuery: 'LOGIN' };
    const { result } = renderHook(() => useFilteredTree(tree, filters));
    const tasks = result.current[0].children![0].children!;
    expect(tasks).toHaveLength(1);
    expect(tasks[0].id).toBe('T-1');
  });

  it('combines search with status filter', () => {
    const tree = makeTree();
    const filters: FilterState = { statuses: ['todo'], priorities: [], assignee: '', searchQuery: 'Task A' };
    const { result } = renderHook(() => useFilteredTree(tree, filters));
    expect(result.current).toHaveLength(1);
    const tasks = result.current[0].children![0].children!;
    expect(tasks).toHaveLength(1);
    expect(tasks[0].id).toBe('T-1');
  });
});

describe('extractAssignees', () => {
  it('returns sorted unique assignees from tree', () => {
    const tree = makeTree();
    const assignees = extractAssignees(tree);
    expect(assignees).toEqual(['alice', 'bob', 'carol']);
  });

  it('returns empty array for tree with no assignees', () => {
    const tree: TreeNode[] = [
      { id: 'E-1', title: 'Epic', type: 'epic', status: 'todo', children: [] },
    ];
    expect(extractAssignees(tree)).toEqual([]);
  });
});

describe('collectMatchParentIds', () => {
  it('collects parent IDs for matching tasks', () => {
    const tree = makeTree();
    const ids = collectMatchParentIds(tree, 'Task A');
    expect(ids.has('E-1')).toBe(true);
    expect(ids.has('S-1')).toBe(true);
    expect(ids.has('S-2')).toBe(false);
  });

  it('returns empty set when no search query', () => {
    const tree = makeTree();
    const ids = collectMatchParentIds(tree, '');
    expect(ids.size).toBe(0);
  });
});
