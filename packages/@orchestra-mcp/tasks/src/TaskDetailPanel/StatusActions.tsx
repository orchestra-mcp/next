import { useCallback } from 'react';
import { useTaskActions } from '../hooks/useTaskActions';
import './StatusActions.css';

export interface StatusActionsProps {
  status: string;
  project: string;
  epicId: string;
  storyId: string;
  taskId: string;
  onAction?: () => void;
}

const TERMINAL = new Set(['done', 'cancelled', 'rejected']);
const STARTABLE = new Set(['backlog', 'todo', 'blocked']);
const IN_PROGRESS = 'in-progress';

export function StatusActions({ status, project, epicId, storyId, taskId, onAction }: StatusActionsProps) {
  const {
    startTask,
    advanceTask,
    blockTask,
    completeTask,
    starting,
    advancing,
    blocking,
    completing,
  } = useTaskActions();

  const loc = {
    project,
    epic_id: epicId,
    story_id: storyId,
    task_id: taskId,
  };

  const handleStart = useCallback(async () => {
    await startTask(loc);
    onAction?.();
  }, [startTask, loc, onAction]);

  const handleAdvance = useCallback(async () => {
    await advanceTask(loc, undefined);
    onAction?.();
  }, [advanceTask, loc, onAction]);

  const handleBlock = useCallback(async () => {
    await blockTask(loc);
    onAction?.();
  }, [blockTask, loc, onAction]);

  const handleComplete = useCallback(async () => {
    await completeTask(loc);
    onAction?.();
  }, [completeTask, loc, onAction]);

  const isTerminal = TERMINAL.has(status);
  if (isTerminal) return null;

  const showStart = STARTABLE.has(status);
  const showAdvance = status === IN_PROGRESS
    || (!TERMINAL.has(status) && !STARTABLE.has(status));
  const showBlock = status === IN_PROGRESS;
  const showComplete = status === IN_PROGRESS;

  return (
    <div className="status-actions">
      {showStart && (
        <button
          type="button"
          aria-label="Start task"
          className={`status-actions__btn status-actions__btn--start${starting.loading ? ' status-actions__btn--loading' : ''}`}
          onClick={handleStart}
          disabled={starting.loading}
        >
          {starting.loading ? <span className="status-actions__spinner" /> : '\u25B6'}
          Start
        </button>
      )}
      {showAdvance && (
        <button
          type="button"
          aria-label="Advance task"
          className={`status-actions__btn status-actions__btn--advance${advancing.loading ? ' status-actions__btn--loading' : ''}`}
          onClick={handleAdvance}
          disabled={advancing.loading}
        >
          {advancing.loading ? <span className="status-actions__spinner" /> : '\u23E9'}
          Advance
        </button>
      )}
      {showBlock && (
        <button
          type="button"
          aria-label="Block task"
          className={`status-actions__btn status-actions__btn--block${blocking.loading ? ' status-actions__btn--loading' : ''}`}
          onClick={handleBlock}
          disabled={blocking.loading}
        >
          {blocking.loading ? <span className="status-actions__spinner" /> : '\u26D4'}
          Block
        </button>
      )}
      {showComplete && (
        <button
          type="button"
          aria-label="Complete task"
          className={`status-actions__btn status-actions__btn--complete${completing.loading ? ' status-actions__btn--loading' : ''}`}
          onClick={handleComplete}
          disabled={completing.loading}
        >
          {completing.loading ? <span className="status-actions__spinner" /> : '\u2714'}
          Complete
        </button>
      )}
    </div>
  );
}
