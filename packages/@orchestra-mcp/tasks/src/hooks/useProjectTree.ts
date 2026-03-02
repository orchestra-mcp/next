import { useState, useEffect, useCallback } from 'react';
import type { TreeNode } from '../widgets';
import { mcpCall } from '../mcp/client';

interface EpicRaw {
  id: string;
  title: string;
  status: string;
  priority?: string;
  stories?: StoryRaw[];
}

interface StoryRaw {
  id: string;
  title: string;
  status: string;
  priority?: string;
  estimate?: number;
  tasks?: TaskRaw[];
}

interface TaskRaw {
  id: string;
  title: string;
  status: string;
  priority?: string;
  description?: string;
  type?: string;
  assigned_to?: string;
  estimate?: number;
  labels?: string[];
  depends_on?: string[];
  links?: Array<{ type: string; url: string; title?: string }>;
}

function mapTree(epics: EpicRaw[]): TreeNode[] {
  return epics.map((e) => ({
    id: e.id,
    title: e.title,
    type: 'epic' as const,
    status: e.status,
    priority: e.priority,
    children: (e.stories ?? []).map((s) => ({
      id: s.id,
      title: s.title,
      type: 'story' as const,
      status: s.status,
      priority: s.priority,
      estimate: s.estimate,
      children: (s.tasks ?? []).map((t) => ({
        id: t.id,
        title: t.title,
        type: (t.type || 'task') as 'task',
        status: t.status,
        priority: t.priority,
        description: t.description,
        labels: t.labels,
        estimate: t.estimate,
        assignedTo: t.assigned_to,
      })),
    })),
  }));
}

export function useProjectTree(slug: string | null) {
  const [tree, setTree] = useState<TreeNode[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!slug) {
      setTree([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const raw = await mcpCall<EpicRaw[]>('get_project_tree', { project: slug });
      setTree(Array.isArray(raw) ? mapTree(raw) : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load project tree');
    }
    setLoading(false);
  }, [slug]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { tree, loading, error, refresh };
}
