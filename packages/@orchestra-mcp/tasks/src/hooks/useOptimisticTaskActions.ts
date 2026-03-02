import { useState, useCallback, useRef } from 'react';
import { mcpCall } from '../mcp/client';

interface TaskLocation extends Record<string, string> {
  project: string;
  epic_id: string;
  story_id: string;
  task_id: string;
}

export interface OptimisticOptions {
  onOptimisticUpdate?: (taskId: string, newStatus: string) => void;
  onRevert?: (taskId: string, oldStatus: string) => void;
  onSettled?: (taskId: string) => void;
}

const ADVANCE_MAP: Record<string, string> = {
  'in-progress': 'ready-for-testing',
  'ready-for-testing': 'in-testing',
  'in-testing': 'ready-for-docs',
  'ready-for-docs': 'in-docs',
  'in-docs': 'documented',
  'documented': 'in-review',
  'in-review': 'done',
};

export function predictStatus(
  action: 'start' | 'advance' | 'block' | 'complete',
  currentStatus: string,
): string | null {
  switch (action) {
    case 'start':
      return 'in-progress';
    case 'advance':
      return ADVANCE_MAP[currentStatus] ?? null;
    case 'block':
      return 'blocked';
    case 'complete':
      return 'done';
    default:
      return null;
  }
}

export function useOptimisticTaskActions(options: OptimisticOptions = {}) {
  const [pendingTasks, setPendingTasks] = useState<Set<string>>(new Set());
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const addPending = useCallback((taskId: string) => {
    setPendingTasks((prev) => {
      const next = new Set(prev);
      next.add(taskId);
      return next;
    });
  }, []);

  const removePending = useCallback((taskId: string) => {
    setPendingTasks((prev) => {
      const next = new Set(prev);
      next.delete(taskId);
      return next;
    });
  }, []);

  const runOptimistic = useCallback(
    async (
      action: 'start' | 'advance' | 'block' | 'complete',
      currentStatus: string,
      loc: TaskLocation,
      mcpFn: () => Promise<unknown>,
    ) => {
      const taskId = loc.task_id;
      const predicted = predictStatus(action, currentStatus);

      if (predicted) {
        addPending(taskId);
        optionsRef.current.onOptimisticUpdate?.(taskId, predicted);
      }

      try {
        await mcpFn();
        optionsRef.current.onSettled?.(taskId);
      } catch {
        if (predicted) {
          optionsRef.current.onRevert?.(taskId, currentStatus);
        }
        optionsRef.current.onSettled?.(taskId);
      } finally {
        removePending(taskId);
      }
    },
    [addPending, removePending],
  );

  const startTask = useCallback(
    (loc: TaskLocation, currentStatus: string) =>
      runOptimistic('start', currentStatus, loc, () =>
        mcpCall('set_current_task', loc),
      ),
    [runOptimistic],
  );

  const advanceTask = useCallback(
    (loc: TaskLocation, currentStatus: string, evidence?: string) =>
      runOptimistic('advance', currentStatus, loc, () =>
        mcpCall('advance_task', { ...loc, evidence }),
      ),
    [runOptimistic],
  );

  const blockTask = useCallback(
    (loc: TaskLocation, currentStatus: string) =>
      runOptimistic('block', currentStatus, loc, () =>
        mcpCall('update_task', { ...loc, status: 'blocked' }),
      ),
    [runOptimistic],
  );

  const completeTask = useCallback(
    (loc: TaskLocation, currentStatus: string) =>
      runOptimistic('complete', currentStatus, loc, () =>
        mcpCall('complete_task', loc),
      ),
    [runOptimistic],
  );

  return {
    startTask,
    advanceTask,
    blockTask,
    completeTask,
    pendingTasks,
  };
}
