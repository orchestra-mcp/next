"use client";

import { useState, useEffect, useCallback } from 'react';
import type { TodoListEvent, TodoItem } from '../types/events';
import { CardBase } from './CardBase';
import { BoxIcon } from '@orchestra-mcp/icons';
import './TodoListCard.css';

export interface TodoListCardProps {
  event: TodoListEvent;
  /** When true, render as floating pinned overlay instead of inline card. */
  pinned?: boolean;
  /** Callback when user toggles pin state. */
  onPinChange?: (pinned: boolean) => void;
  /** Auto-dismiss delay in ms after all items complete (0 = disabled). */
  autoDismissMs?: number;
  className?: string;
}

const ItemStatus = ({ status }: { status: TodoItem['status'] }) => {
  if (status === 'completed') {
    return (
      <svg className="todo-card__status todo-card__status--done" width="14" height="14" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
        <path d="M5 8l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (status === 'in_progress') {
    return (
      <svg className="todo-card__status todo-card__status--active todo-card__spin" width="14" height="14" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="7" stroke="var(--color-border)" strokeWidth="1.5" />
        <path d="M8 1a7 7 0 0 1 7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <svg className="todo-card__status todo-card__status--pending" width="14" height="14" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
};

export const TodoListCard = ({
  event,
  pinned = false,
  onPinChange,
  autoDismissMs = 3000,
  className,
}: TodoListCardProps) => {
  const [minimized, setMinimized] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const completed = event.items.filter((t) => t.status === 'completed').length;
  const total = event.items.length;
  const allDone = total > 0 && completed === total;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Auto-dismiss when all items complete (pinned mode only)
  useEffect(() => {
    if (!pinned || !allDone || autoDismissMs <= 0) return;
    const timer = setTimeout(() => setDismissed(true), autoDismissMs);
    return () => clearTimeout(timer);
  }, [pinned, allDone, autoDismissMs]);

  const handlePin = useCallback(() => {
    onPinChange?.(!pinned);
  }, [pinned, onPinChange]);

  if (dismissed && pinned) return null;

  const activeItem = event.items.find((t) => t.status === 'in_progress');

  // Pinned overlay header actions
  const headerActions = (
    <span className="todo-card__header-actions">
      {onPinChange && (
        <button
          type="button"
          className={`todo-card__pin-btn${pinned ? ' todo-card__pin-btn--active' : ''}`}
          onClick={handlePin}
          title={pinned ? 'Unpin' : 'Pin to overlay'}
          aria-label={pinned ? 'Unpin todo list' : 'Pin todo list as overlay'}
        >
          <BoxIcon name={pinned ? 'bxs-pin' : 'bx-pin'} size={14} />
        </button>
      )}
      {pinned && (
        <button
          type="button"
          className="todo-card__minimize-btn"
          onClick={() => setMinimized((m) => !m)}
          title={minimized ? 'Expand' : 'Minimize'}
          aria-label={minimized ? 'Expand todo list' : 'Minimize todo list'}
        >
          <BoxIcon name={minimized ? 'bx-expand-alt' : 'bx-collapse-alt'} size={14} />
        </button>
      )}
    </span>
  );

  const wrapperClass = [
    'todo-card',
    pinned && 'todo-card--pinned',
    minimized && 'todo-card--minimized',
    allDone && 'todo-card--all-done',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={wrapperClass}>
      <CardBase
        title="Todo List"
        icon={<BoxIcon name="bx-list-check" size={16} />}
        badge={`${completed}/${total}`}
        badgeColor={allDone ? 'success' : 'info'}
        status={event.status}
        timestamp={event.timestamp}
        defaultCollapsed={false}
        headerActions={headerActions}
        className="todo-card__inner"
      >
        {/* Progress bar */}
        <div className="todo-card__progress">
          <div className="todo-card__progress-track">
            <div
              className="todo-card__progress-fill"
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="todo-card__progress-label">{pct}%</span>
        </div>

        {/* Minimized: show only active item */}
        {minimized ? (
          activeItem ? (
            <div className="todo-card__mini-active">
              <ItemStatus status="in_progress" />
              <span className="todo-card__text">{activeItem.content}</span>
            </div>
          ) : allDone ? (
            <div className="todo-card__mini-done">All tasks completed</div>
          ) : null
        ) : (
          <ul className="todo-card__list">
            {event.items.map((item, i) => (
              <li
                key={i}
                className={`todo-card__item${item.status === 'completed' ? ' todo-card__item--done' : ''}${item.status === 'in_progress' ? ' todo-card__item--active' : ''}`}
              >
                <ItemStatus status={item.status} />
                <span className="todo-card__text">{item.content}</span>
              </li>
            ))}
          </ul>
        )}
      </CardBase>
    </div>
  );
};
