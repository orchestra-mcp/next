"use client";

import type { ReactNode } from 'react';
import './TimelineLayout.css';

export interface TimelineLayoutProps {
  children: ReactNode;
  className?: string;
}

export const TimelineLayout = ({ children, className }: TimelineLayoutProps) => {
  const cls = ['timeline-layout', className].filter(Boolean).join(' ');

  return (
    <div className={cls} data-testid="timeline-layout">
      {children}
    </div>
  );
};
