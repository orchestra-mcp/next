import { useState, useCallback } from 'react';
import { mcpCall } from '../mcp/client';

interface TaskLocation extends Record<string, string> {
  project: string;
  epic_id: string;
  story_id: string;
  task_id: string;
}

interface ActionState {
  loading: boolean;
  error: string | null;
}

export function useTaskActions() {
  const [actionState, setActionState] = useState<Record<string, ActionState>>({});

  const getState = (key: string): ActionState =>
    actionState[key] ?? { loading: false, error: null };

  const run = useCallback(async (key: string, fn: () => Promise<unknown>) => {
    setActionState((prev) => ({ ...prev, [key]: { loading: true, error: null } }));
    try {
      await fn();
      setActionState((prev) => ({ ...prev, [key]: { loading: false, error: null } }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Action failed';
      setActionState((prev) => ({ ...prev, [key]: { loading: false, error: message } }));
    }
  }, []);

  const startTask = useCallback(
    (loc: TaskLocation) =>
      run('start', () => mcpCall('set_current_task', loc)),
    [run],
  );

  const advanceTask = useCallback(
    (loc: TaskLocation, evidence?: string) =>
      run('advance', () => mcpCall('advance_task', { ...loc, evidence })),
    [run],
  );

  const blockTask = useCallback(
    (loc: TaskLocation) =>
      run('block', () => mcpCall('update_task', { ...loc, status: 'blocked' })),
    [run],
  );

  const assignTask = useCallback(
    (loc: TaskLocation, assignee: string) =>
      run('assign', () => mcpCall('assign_task', { ...loc, assignee })),
    [run],
  );

  const completeTask = useCallback(
    (loc: TaskLocation) =>
      run('complete', () => mcpCall('complete_task', loc)),
    [run],
  );

  return {
    startTask,
    advanceTask,
    blockTask,
    assignTask,
    completeTask,
    starting: getState('start'),
    advancing: getState('advance'),
    blocking: getState('block'),
    assigning: getState('assign'),
    completing: getState('complete'),
  };
}
