"use client";

import { useState, useEffect, useRef, useCallback, useLayoutEffect } from 'react';
import type { ReactNode, CSSProperties } from 'react';
import './Popover.css';

export interface PopoverProps {
  trigger: ReactNode;
  content: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
}

export const Popover = ({
  trigger,
  content,
  position = 'bottom',
  open,
  onOpenChange,
  className,
}: PopoverProps) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<CSSProperties>({});

  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;

  const setOpen = useCallback(
    (next: boolean) => {
      if (!isControlled) setInternalOpen(next);
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange],
  );

  const handleTriggerClick = () => {
    setOpen(!isOpen);
  };

  // Position the popover using fixed coordinates
  useLayoutEffect(() => {
    if (!isOpen || !triggerRef.current) return;

    const rect = triggerRef.current.getBoundingClientRect();
    const gap = 8;

    const pos: CSSProperties = { position: 'fixed' };

    switch (position) {
      case 'top':
        pos.bottom = window.innerHeight - rect.top + gap;
        pos.left = rect.left;
        break;
      case 'bottom':
        pos.top = rect.bottom + gap;
        pos.left = rect.left;
        break;
      case 'left':
        pos.right = window.innerWidth - rect.left + gap;
        pos.top = rect.top;
        break;
      case 'right':
        pos.left = rect.right + gap;
        pos.top = rect.top;
        break;
    }

    setStyle(pos);
  }, [isOpen, position]);

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node) &&
        contentRef.current &&
        !contentRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, setOpen]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, setOpen]);

  const wrapperClass = ['popover', className].filter(Boolean).join(' ');
  const contentClass = [
    'popover__content',
    isOpen ? 'popover__content--open' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div ref={wrapperRef} className={wrapperClass} data-testid="popover">
      <button
        ref={triggerRef}
        type="button"
        className="popover__trigger"
        onClick={handleTriggerClick}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {trigger}
      </button>
      <div
        ref={contentRef}
        className={contentClass}
        role="dialog"
        style={style}
        data-testid="popover-content"
      >
        {content}
      </div>
    </div>
  );
};
