"use client";

import type { ReactNode } from 'react';

export interface TimelineNodeProps {
  /** Status affects the dot color */
  status?: 'running' | 'done' | 'error' | 'pending';
  /** Node type affects the dot size */
  nodeType?: 'tool' | 'message' | 'system';
  children: ReactNode;
  className?: string;
}

export const TimelineNode = ({
  status,
  nodeType = 'tool',
  children,
  className,
}: TimelineNodeProps) => {
  const rootCls = [
    'timeline-node',
    nodeType !== 'tool' && `timeline-node--${nodeType}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const dotCls = [
    'timeline-node__dot',
    status && `timeline-node__dot--${status}`,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={rootCls} data-testid="timeline-node">
      {/* Rail: top connector line + status dot + bottom connector line */}
      <div className="timeline-node__rail" aria-hidden="true">
        <div className="timeline-node__line-top" />
        <span className={dotCls} />
        <div className="timeline-node__line-bot" />
      </div>
      {/* Card content */}
      <div className="timeline-node__content">
        {children}
      </div>
    </div>
  );
};
