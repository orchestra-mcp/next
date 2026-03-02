import { useMemo } from 'react';
import type { TreeNode } from '../widgets';
import type { FilterState } from '../TaskFilter';

export function useFilteredTree(tree: TreeNode[], filters: FilterState): TreeNode[] {
  return useMemo(() => {
    const hasFilters =
      filters.statuses.length > 0 ||
      filters.priorities.length > 0 ||
      filters.assignee !== '' ||
      filters.searchQuery !== '';
    if (!hasFilters) return tree;
    return filterTree(tree, filters);
  }, [tree, filters]);
}

function filterTree(nodes: TreeNode[], filters: FilterState): TreeNode[] {
  return nodes.reduce<TreeNode[]>((acc, node) => {
    if (node.type === 'task' || node.type === 'bug' || node.type === 'hotfix') {
      if (matchesFilters(node, filters)) acc.push(node);
    } else {
      const filteredChildren = filterTree(node.children ?? [], filters);
      if (filteredChildren.length > 0) {
        acc.push({ ...node, children: filteredChildren });
      }
    }
    return acc;
  }, []);
}

function matchesFilters(node: TreeNode, filters: FilterState): boolean {
  if (filters.statuses.length > 0 && !filters.statuses.includes(node.status)) {
    return false;
  }
  if (filters.priorities.length > 0 && node.priority && !filters.priorities.includes(node.priority)) {
    return false;
  }
  if (filters.priorities.length > 0 && !node.priority) {
    return false;
  }
  if (filters.assignee && node.assignedTo !== filters.assignee) {
    return false;
  }
  if (filters.searchQuery) {
    const query = filters.searchQuery.toLowerCase();
    const titleMatch = node.title.toLowerCase().includes(query);
    const descMatch = node.description?.toLowerCase().includes(query) ?? false;
    if (!titleMatch && !descMatch) return false;
  }
  return true;
}

export function collectMatchParentIds(tree: TreeNode[], searchQuery: string): Set<string> {
  if (!searchQuery) return new Set();
  const ids = new Set<string>();
  const query = searchQuery.toLowerCase();

  function walk(nodes: TreeNode[], parentIds: string[]) {
    for (const node of nodes) {
      const isLeaf = node.type === 'task' || node.type === 'bug' || node.type === 'hotfix';
      if (isLeaf) {
        const matches = node.title.toLowerCase().includes(query) ||
          (node.description?.toLowerCase().includes(query) ?? false);
        if (matches) {
          for (const id of parentIds) ids.add(id);
        }
      } else {
        walk(node.children ?? [], [...parentIds, node.id]);
      }
    }
  }
  walk(tree, []);
  return ids;
}

export function extractAssignees(tree: TreeNode[]): string[] {
  const set = new Set<string>();
  function walk(nodes: TreeNode[]) {
    for (const n of nodes) {
      if (n.assignedTo) set.add(n.assignedTo);
      if (n.children) walk(n.children);
    }
  }
  walk(tree);
  return [...set].sort();
}
