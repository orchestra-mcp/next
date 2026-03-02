"use client";

import { useState } from 'react';
import type { McpTaskResult } from './parseMcpResponse';
import { CardBase } from './CardBase';
import { BoxIcon } from '@orchestra-mcp/icons';
import './TaskDetailCard.css';

export interface TaskDetailCardProps {
  data: McpTaskResult;
  className?: string;
}

// -- 13-state lifecycle (ordered) -----------------------------------------------

const LIFECYCLE_STATES = [
  'backlog',
  'todo',
  'in-progress',
  'ready-for-testing',
  'in-testing',
  'ready-for-docs',
  'in-docs',
  'documented',
  'in-review',
  'done',
] as const;

type LifecycleState = (typeof LIFECYCLE_STATES)[number];

/** Abbreviated labels shown under active/current dots only. */
const STATE_LABELS: Record<LifecycleState, string> = {
  'backlog': 'Backlog',
  'todo': 'Todo',
  'in-progress': 'In Prog',
  'ready-for-testing': 'Test Rdy',
  'in-testing': 'Testing',
  'ready-for-docs': 'Docs Rdy',
  'in-docs': 'In Docs',
  'documented': "Doc'd",
  'in-review': 'Review',
  'done': 'Done',
};

// -- Type / Priority config -----------------------------------------------------

const TYPE_ICONS: Record<McpTaskResult['type'], string> = {
  task: 'bx-task',
  bug: 'bx-bug',
  hotfix: 'bx-flame',
};

const TYPE_BADGE_COLORS: Record<McpTaskResult['type'], 'info' | 'danger' | 'warning'> = {
  task: 'info',
  bug: 'danger',
  hotfix: 'warning',
};

const PRIORITY_COLORS: Record<string, string> = {
  low: '#22c55e',
  medium: '#eab308',
  high: '#f97316',
  critical: '#ef4444',
};

// -- Normalize status -----------------------------------------------------------

/** Normalizes status strings (e.g. "in_progress" -> "in-progress") */
function normalizeStatus(status: string): string {
  return status.replace(/_/g, '-');
}

// -- Lifecycle bar component ----------------------------------------------------

function LifecycleBar({ status }: { status: string }) {
  const normalized = normalizeStatus(status);
  const currentIndex = LIFECYCLE_STATES.indexOf(normalized as LifecycleState);

  return (
    <div className="task-detail__lifecycle" role="img" aria-label={`Task lifecycle: ${normalized}`}>
      {LIFECYCLE_STATES.map((state, i) => {
        const isCurrent = i === currentIndex;
        const isDone = currentIndex >= 0 && i < currentIndex;
        const isCompleted = normalized === 'done' && i === LIFECYCLE_STATES.length - 1;

        let modifier = '';
        if (isCurrent || isCompleted) modifier = ' task-detail__state--current';
        else if (isDone) modifier = ' task-detail__state--done';

        return (
          <div key={state} className="task-detail__state-group">
            {i > 0 && (
              <div
                className={`task-detail__state-line${isDone || isCurrent ? ' task-detail__state-line--filled' : ''}`}
              />
            )}
            <div className={`task-detail__state${modifier}`}>
              <div className="task-detail__state-dot" />
              {(isCurrent || isCompleted) && (
                <span className="task-detail__state-label">
                  {STATE_LABELS[state]}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// -- Description with expand toggle ---------------------------------------------

function Description({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="task-detail__desc-wrap">
      <p className={`task-detail__desc${expanded ? ' task-detail__desc--expanded' : ''}`}>
        {text}
      </p>
      {text.length > 180 && (
        <button
          type="button"
          className="task-detail__desc-toggle"
          onClick={() => setExpanded((e) => !e)}
        >
          {expanded ? 'Show less' : 'Show more'}
        </button>
      )}
    </div>
  );
}

// -- Main component -------------------------------------------------------------

export const TaskDetailCard = ({ data, className }: TaskDetailCardProps) => {
  const iconName = TYPE_ICONS[data.type] ?? 'bx-task';
  const badgeColor = TYPE_BADGE_COLORS[data.type] ?? 'info';
  const normalized = normalizeStatus(data.status);
  const isRunning = normalized === 'in-progress';

  return (
    <CardBase
      title={data.title}
      icon={<BoxIcon name={iconName} size={16} />}
      badge={data.id}
      badgeColor={badgeColor}
      status={isRunning ? 'running' : normalized === 'done' ? 'done' : undefined}
      defaultCollapsed={false}
      className={`task-detail-card${className ? ` ${className}` : ''}`}
    >
      {/* 1. Lifecycle bar */}
      <LifecycleBar status={data.status} />

      {/* 2. Metadata row */}
      <div className="task-detail__meta">
        {data.priority && (
          <span
            className="task-detail__pill task-detail__pill--priority"
            style={{
              background: `color-mix(in srgb, ${PRIORITY_COLORS[data.priority] ?? 'var(--color-border)'} 18%, transparent)`,
              color: PRIORITY_COLORS[data.priority] ?? 'var(--color-fg-muted)',
            }}
          >
            {data.priority}
          </span>
        )}

        {data.assignee && (
          <span className="task-detail__assignee">
            <span className="task-detail__avatar" aria-hidden="true">
              {data.assignee.charAt(0).toUpperCase()}
            </span>
            {data.assignee}
          </span>
        )}

        {data.estimate != null && (
          <span className="task-detail__pill task-detail__pill--estimate">
            {data.estimate} pts
          </span>
        )}

        {data.labels && data.labels.length > 0 && data.labels.map((label) => (
          <span key={label} className="task-detail__pill task-detail__pill--label">
            {label}
          </span>
        ))}
      </div>

      {/* 3. Dependencies */}
      {data.depends_on && data.depends_on.length > 0 && (
        <div className="task-detail__deps">
          <span className="task-detail__deps-label">Depends on:</span>
          {data.depends_on.map((dep, i) => (
            <span key={dep}>
              <span className="task-detail__dep-id">{dep}</span>
              {i < data.depends_on!.length - 1 && ', '}
            </span>
          ))}
        </div>
      )}

      {/* 4. Description */}
      {data.description && (
        <Description text={data.description} />
      )}

      {/* 5. Evidence gates (if any) */}
      {data.evidence && data.evidence.length > 0 && (
        <div className="task-detail__evidence">
          <span className="task-detail__evidence-title">Evidence</span>
          {data.evidence.map((ev, i) => (
            <div key={i} className="task-detail__evidence-item">
              <span className="task-detail__evidence-gate">{ev.gate}</span>
              <span className="task-detail__evidence-desc">{ev.description}</span>
            </div>
          ))}
        </div>
      )}
    </CardBase>
  );
};
