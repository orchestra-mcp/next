import type { TaskEvent } from '../types/events';
import './TaskCard.css';

export interface TaskCardProps {
  event: TaskEvent;
  className?: string;
}

const STATUS_CONFIG = {
  pending: { label: 'Pending', color: 'gray' as const },
  in_progress: { label: 'In Progress', color: 'info' as const },
  completed: { label: 'Done', color: 'success' as const },
};

const StatusIcon = ({ status }: { status: TaskEvent['status'] }) => {
  if (status === 'completed') {
    return (
      <svg className="task-card__icon task-card__icon--success" width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
        <path d="M5 8l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (status === 'in_progress') {
    return (
      <svg className="task-card__icon task-card__icon--info task-card__spinner" width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="7" stroke="var(--color-border)" strokeWidth="1.5" />
        <path d="M8 1a7 7 0 0 1 7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <svg className="task-card__icon task-card__icon--gray" width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
};

export const TaskCard = ({ event, className }: TaskCardProps) => {
  const config = STATUS_CONFIG[event.status];

  return (
    <div
      className={`task-card${className ? ` ${className}` : ''}`}
      data-status={event.status === 'in_progress' ? 'running' : undefined}
      data-testid="task-card"
    >
      <StatusIcon status={event.status} />
      <span className="task-card__title">{event.title}</span>
      <span className={`task-card__badge task-card__badge--${config.color}`}>
        {config.label}
      </span>
    </div>
  );
};
