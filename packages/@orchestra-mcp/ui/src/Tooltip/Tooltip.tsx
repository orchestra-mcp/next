"use client";

import { useState, useRef, useCallback } from 'react';
import type { ReactNode } from 'react';
import './Tooltip.css';

export interface TooltipProps {
  /** Tooltip content — text or rich JSX */
  content: ReactNode;
  /** Placement relative to trigger */
  placement?: 'top' | 'bottom' | 'left' | 'right';
  /** Delay before showing in ms */
  delay?: number;
  /** Max width of tooltip */
  maxWidth?: string;
  /** Show arrow pointing at trigger */
  arrow?: boolean;
  /** Keyboard shortcut to display (e.g. "Cmd+K") */
  shortcut?: string;
  /** Trigger element */
  children: ReactNode;
}

export const Tooltip = ({
  content,
  placement = 'top',
  delay = 200,
  maxWidth = '250px',
  arrow = true,
  shortcut,
  children,
}: TooltipProps) => {
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback(() => {
    timerRef.current = setTimeout(() => setVisible(true), delay);
  }, [delay]);

  const hide = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setVisible(false);
  }, []);

  return (
    <span
      className="tooltip-wrapper"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}
      {visible && (
        <span
          className={`tooltip tooltip--${placement}`}
          role="tooltip"
          style={{ maxWidth }}
        >
          <span className="tooltip__content">
            {content}
            {shortcut && <kbd className="tooltip__shortcut">{shortcut}</kbd>}
          </span>
          {arrow && <span className="tooltip__arrow" data-testid="tooltip-arrow" />}
        </span>
      )}
    </span>
  );
};
