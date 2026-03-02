import { useState, useEffect, useCallback } from 'react';
import type { ProjectSummary } from '../ProjectsSidebar';
import { mcpCall } from '../mcp/client';

interface ProjectListResponse {
  projects?: Array<{
    slug: string;
    project: string;
    name?: string;
    status?: string;
  }>;
}

interface WorkflowStatusResponse {
  total: number;
  done: number;
  completion_pct: string;
  by_status: Record<string, number>;
}

export function useProjects() {
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await mcpCall<ProjectListResponse>('list_projects');
      if (!data.projects || !Array.isArray(data.projects)) {
        setProjects([]);
        setLoading(false);
        return;
      }

      const summaries: ProjectSummary[] = await Promise.all(
        data.projects.map(async (p) => {
          const displayName = p.project || p.name || p.slug;
          try {
            const wf = await mcpCall<WorkflowStatusResponse>(
              'get_workflow_status',
              { project: p.slug },
            );
            return {
              slug: p.slug,
              name: displayName,
              status: p.status ?? 'active',
              epicCount: 0,
              taskCount: wf?.total ?? 0,
              completionPercent: wf?.completion_pct
                ? parseFloat(wf.completion_pct)
                : 0,
              integrations: [] as ('github' | 'jira' | 'linear')[],
            };
          } catch {
            return {
              slug: p.slug,
              name: displayName,
              status: p.status ?? 'active',
              epicCount: 0,
              taskCount: 0,
              completionPercent: 0,
              integrations: [] as ('github' | 'jira' | 'linear')[],
            };
          }
        }),
      );
      setProjects(summaries);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load projects');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const createProject = useCallback(
    async (name: string) => {
      await mcpCall('create_project', { name });
      await refresh();
    },
    [refresh],
  );

  return { projects, loading, error, refresh, createProject };
}
