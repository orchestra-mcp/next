import { useState, useEffect, useCallback, useRef } from 'react';
import { mcpCall } from '../mcp/client';

export interface EvidenceEntry {
  gate: string;        // 'testing' | 'verification' | 'documentation' | 'review'
  description: string;
  timestamp: string;   // ISO 8601
}

export interface TaskDetail {
  id: string;
  title: string;
  status: string;
  type: string;
  priority?: string;
  description?: string;
  assigned_to?: string;
  estimate?: number;
  labels?: string[];
  depends_on?: string[];
  links?: Array<{ type: string; url: string; title?: string }>;
  created_at?: string;
  updated_at?: string;
  evidence?: EvidenceEntry[];
}

export interface TaskDetailParams {
  project: string;
  epicId: string;
  storyId: string;
  taskId: string;
}

export function useTaskDetail(params: TaskDetailParams | null) {
  const [task, setTask] = useState<TaskDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isStale, setIsStale] = useState(false);
  const latestRef = useRef<TaskDetail | null>(null);

  const project = params?.project ?? null;
  const epicId = params?.epicId ?? null;
  const storyId = params?.storyId ?? null;
  const taskId = params?.taskId ?? null;

  const refresh = useCallback(async () => {
    if (!project || !epicId || !storyId || !taskId) {
      setTask(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await mcpCall<TaskDetail>('get_task', {
        project,
        epic_id: epicId,
        story_id: storyId,
        task_id: taskId,
      });
      setTask(result);
      setIsStale(false);
      latestRef.current = null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load task');
    }
    setLoading(false);
  }, [project, epicId, storyId, taskId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const checkForUpdates = useCallback(async () => {
    if (!project || !epicId || !storyId || !taskId || !task) return;
    try {
      const fresh = await mcpCall<TaskDetail>('get_task', {
        project,
        epic_id: epicId,
        story_id: storyId,
        task_id: taskId,
      });
      if (fresh.updated_at !== task.updated_at) {
        latestRef.current = fresh;
        setIsStale(true);
      }
    } catch {
      /* silent -- don't interrupt the user */
    }
  }, [project, epicId, storyId, taskId, task]);

  const dismissStale = useCallback(() => {
    setIsStale(false);
    latestRef.current = null;
  }, []);

  const acceptStale = useCallback(() => {
    if (latestRef.current) {
      setTask(latestRef.current);
      latestRef.current = null;
    }
    setIsStale(false);
  }, []);

  return {
    task,
    loading,
    error,
    refresh,
    isStale,
    checkForUpdates,
    dismissStale,
    acceptStale,
  };
}
