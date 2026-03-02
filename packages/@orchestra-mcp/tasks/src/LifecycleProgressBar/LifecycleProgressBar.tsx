import React from 'react';
import './LifecycleProgressBar.css';

const LIFECYCLE_STEPS = [
  { key: 'backlog', label: 'Backlog', color: '#6b7280' },
  { key: 'todo', label: 'To Do', color: '#3b82f6' },
  { key: 'in-progress', label: 'In Progress', color: '#8b5cf6' },
  { key: 'ready-for-testing', label: 'Ready for Testing', color: '#f59e0b' },
  { key: 'in-testing', label: 'In Testing', color: '#f97316' },
  { key: 'ready-for-docs', label: 'Ready for Docs', color: '#06b6d4' },
  { key: 'in-docs', label: 'In Docs', color: '#0ea5e9' },
  { key: 'documented', label: 'Documented', color: '#14b8a6' },
  { key: 'in-review', label: 'In Review', color: '#a855f7' },
  { key: 'done', label: 'Done', color: '#22c55e' },
] as const;

const SPECIAL_STATUSES: Record<string, { label: string; color: string }> = {
  blocked: { label: 'Blocked', color: '#ef4444' },
  rejected: { label: 'Rejected', color: '#ef4444' },
  cancelled: { label: 'Cancelled', color: '#6b7280' },
};

export interface LifecycleProgressBarProps {
  status: string;
  size?: 'sm' | 'md';
}

type DotState = 'past' | 'current' | 'future';

function getDotState(stepIndex: number, currentIndex: number, isSpecial: boolean): DotState {
  if (isSpecial) return 'future';
  if (stepIndex < currentIndex) return 'past';
  if (stepIndex === currentIndex) return 'current';
  return 'future';
}

function getLineState(lineIndex: number, currentIndex: number, isSpecial: boolean): 'past' | 'future' {
  if (isSpecial) return 'future';
  // Line at index i connects dot i to dot i+1.
  // It is "past" if both dots it connects are past or current (i.e. lineIndex < currentIndex).
  if (lineIndex < currentIndex) return 'past';
  return 'future';
}

export function LifecycleProgressBar({ status, size = 'sm' }: LifecycleProgressBarProps) {
  const isSpecial = status in SPECIAL_STATUSES;
  const specialInfo = isSpecial ? SPECIAL_STATUSES[status] : null;
  const currentIndex = LIFECYCLE_STEPS.findIndex((s) => s.key === status);

  return (
    <div className={`lifecycle-bar lifecycle-bar--${size}`} data-testid="lifecycle-bar">
      <div className="lifecycle-bar__track">
        {LIFECYCLE_STEPS.map((step, i) => {
          const dotState = getDotState(i, currentIndex, isSpecial);
          const dotColor = dotState === 'future' ? undefined : step.color;

          return (
            <React.Fragment key={step.key}>
              {i > 0 && (
                <div
                  className={`lifecycle-bar__line lifecycle-bar__line--${getLineState(i, currentIndex, isSpecial)}`}
                  data-testid={`line-${i}`}
                />
              )}
              <div
                className={`lifecycle-bar__dot lifecycle-bar__dot--${dotState}`}
                style={dotColor ? { backgroundColor: dotColor, color: dotColor } : undefined}
                title={step.label}
                data-testid={`step-${step.key}`}
              />
            </React.Fragment>
          );
        })}
      </div>
      {isSpecial && specialInfo && (
        <div
          className="lifecycle-bar__special"
          style={{ color: specialInfo.color }}
          data-testid="special-status"
        >
          {specialInfo.label}
        </div>
      )}
    </div>
  );
}
