import type { MouseEvent } from 'react';
import { useTaskActions } from '../hooks/useTaskActions';
import { predictStatus } from '../hooks/useOptimisticTaskActions';
import './QuickActions.css';

export interface QuickActionsProps {
  taskId: string;
  status: string;
  projectSlug: string;
  epicId?: string;
  storyId?: string;
  pending?: boolean;
  onOptimisticUpdate?: (taskId: string, newStatus: string) => void;
}

const TERMINAL = new Set(['done', 'cancelled', 'rejected']);
const STARTABLE = new Set(['backlog', 'todo', 'blocked']);
const IN_PROGRESS = 'in-progress';

export function QuickActions({ taskId, status, projectSlug, epicId, storyId, pending, onOptimisticUpdate }: QuickActionsProps) {
  const { startTask, advanceTask, blockTask, starting, advancing, blocking } = useTaskActions();

  const loc = {
    project: projectSlug,
    epic_id: epicId ?? '',
    story_id: storyId ?? '',
    task_id: taskId,
  };

  const handleClick = (e: MouseEvent) => e.stopPropagation();

  const fireOptimistic = (action: 'start' | 'advance' | 'block' | 'complete') => {
    const predicted = predictStatus(action, status);
    if (predicted && onOptimisticUpdate) {
      onOptimisticUpdate(taskId, predicted);
    }
  };

  const showStart = STARTABLE.has(status);
  const showAdvance = status === IN_PROGRESS
    || (!TERMINAL.has(status) && !STARTABLE.has(status));
  const showBlock = status === IN_PROGRESS;
  const isTerminal = TERMINAL.has(status);
  const isDisabled = pending === true;

  return (
    <div className={`quick-actions${isDisabled ? ' quick-actions--disabled' : ''}`} onClick={handleClick}>
      {!isTerminal && showStart && (
        <button
          type="button"
          aria-label="Start task"
          disabled={isDisabled}
          className={`quick-actions__btn quick-actions__btn--start${starting.loading ? ' quick-actions__btn--loading' : ''}`}
          onClick={() => { fireOptimistic('start'); startTask(loc); }}
        >
          {starting.loading ? <span className="quick-actions__spinner" /> : '\u25B6'} Start
        </button>
      )}
      {!isTerminal && showAdvance && (
        <button
          type="button"
          aria-label="Advance task"
          disabled={isDisabled}
          className={`quick-actions__btn quick-actions__btn--advance${advancing.loading ? ' quick-actions__btn--loading' : ''}`}
          onClick={() => { fireOptimistic('advance'); advanceTask(loc, undefined); }}
        >
          {advancing.loading ? <span className="quick-actions__spinner" /> : '\u23E9'} Advance
        </button>
      )}
      {!isTerminal && showBlock && (
        <button
          type="button"
          aria-label="Block task"
          disabled={isDisabled}
          className={`quick-actions__btn quick-actions__btn--block${blocking.loading ? ' quick-actions__btn--loading' : ''}`}
          onClick={() => { fireOptimistic('block'); blockTask(loc); }}
        >
          {blocking.loading ? <span className="quick-actions__spinner" /> : '\u26D4'} Block
        </button>
      )}
    </div>
  );
}
