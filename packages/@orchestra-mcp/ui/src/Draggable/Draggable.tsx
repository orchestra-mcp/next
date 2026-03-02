"use client";

import { createContext, useContext, useCallback, useState, useRef } from 'react';
import type { ReactNode, DragEvent, KeyboardEvent } from 'react';
import './Draggable.css';

export interface DragProviderProps {
  onReorder: (result: { fromIndex: number; toIndex: number }) => void;
  direction?: 'vertical' | 'horizontal' | 'grid';
  children: ReactNode;
}

export interface DragItemProps {
  id: string;
  index: number;
  disabled?: boolean;
  handle?: boolean;
  children: ReactNode | ((state: DragRenderProps) => ReactNode);
}

export interface DropZoneProps {
  index: number;
  children?: ReactNode;
}

interface DragRenderProps {
  isDragging: boolean;
  dragHandleProps: {
    draggable: true;
    onDragStart: (e: DragEvent) => void;
    'data-drag-handle': true;
  };
}

export interface DragContextValue {
  direction: 'vertical' | 'horizontal' | 'grid';
  dragIndex: number | null;
  overIndex: number | null;
  onDragStart: (index: number, e: DragEvent) => void;
  onDragOver: (index: number, e: DragEvent) => void;
  onDragEnd: () => void;
  onDrop: (index: number) => void;
  onKeyReorder: (fromIndex: number, direction: 'prev' | 'next') => void;
}

export const DragContext = createContext<DragContextValue | null>(null);

const useDragContext = () => {
  const ctx = useContext(DragContext);
  if (!ctx) throw new Error('DragItem/DropZone must be inside DragProvider');
  return ctx;
};

export const DragProvider = ({
  onReorder,
  direction = 'vertical',
  children,
}: DragProviderProps) => {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const dragRef = useRef<number | null>(null);

  const handleDragStart = useCallback((index: number, e: DragEvent) => {
    dragRef.current = index;
    setDragIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(index));
  }, []);

  const handleDragOver = useCallback((index: number, e: DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setOverIndex(index);
  }, []);

  const handleDrop = useCallback(
    (toIndex: number) => {
      const fromIndex = dragRef.current;
      if (fromIndex !== null && fromIndex !== toIndex) {
        onReorder({ fromIndex, toIndex });
      }
      setDragIndex(null);
      setOverIndex(null);
      dragRef.current = null;
    },
    [onReorder],
  );

  const handleDragEnd = useCallback(() => {
    setDragIndex(null);
    setOverIndex(null);
    dragRef.current = null;
  }, []);

  const handleKeyReorder = useCallback(
    (fromIndex: number, dir: 'prev' | 'next') => {
      const toIndex = dir === 'prev' ? fromIndex - 1 : fromIndex + 1;
      if (toIndex >= 0) onReorder({ fromIndex, toIndex });
    },
    [onReorder],
  );

  return (
    <DragContext.Provider
      value={{
        direction,
        dragIndex,
        overIndex,
        onDragStart: handleDragStart,
        onDragOver: handleDragOver,
        onDragEnd: handleDragEnd,
        onDrop: handleDrop,
        onKeyReorder: handleKeyReorder,
      }}
    >
      <div className={`drag-list drag-list--${direction}`} role="list">
        {children}
      </div>
    </DragContext.Provider>
  );
};

export const DragItem = ({
  id,
  index,
  disabled = false,
  handle = false,
  children,
}: DragItemProps) => {
  const ctx = useDragContext();
  const isDragging = ctx.dragIndex === index;
  const isOver = ctx.overIndex === index && ctx.dragIndex !== index;

  const dragStartHandler = (e: DragEvent) => ctx.onDragStart(index, e);
  const dragOverHandler = (e: DragEvent) => ctx.onDragOver(index, e);
  const dropHandler = () => ctx.onDrop(index);

  const keyHandler = (e: KeyboardEvent) => {
    if (disabled) return;
    const isVert = ctx.direction === 'vertical';
    const prevKey = isVert ? 'ArrowUp' : 'ArrowLeft';
    const nextKey = isVert ? 'ArrowDown' : 'ArrowRight';
    if (e.key === ' ') e.preventDefault();
    if (e.key === prevKey) ctx.onKeyReorder(index, 'prev');
    if (e.key === nextKey) ctx.onKeyReorder(index, 'next');
  };

  const dragHandleProps = {
    draggable: true as const,
    onDragStart: dragStartHandler,
    'data-drag-handle': true as const,
  };

  const itemClasses = [
    'drag-item',
    isDragging && 'drag-item--dragging',
    isOver && 'drag-item--over',
    disabled && 'drag-item--disabled',
  ]
    .filter(Boolean)
    .join(' ');

  const renderProps: DragRenderProps = { isDragging, dragHandleProps };
  const content = typeof children === 'function' ? children(renderProps) : children;

  return (
    <div
      className={itemClasses}
      role="listitem"
      data-drag-id={id}
      data-drag-index={index}
      draggable={!disabled && !handle}
      onDragStart={!handle ? dragStartHandler : undefined}
      onDragOver={dragOverHandler}
      onDragEnd={ctx.onDragEnd}
      onDrop={dropHandler}
      onKeyDown={keyHandler}
      tabIndex={disabled ? -1 : 0}
      aria-grabbed={isDragging}
      aria-disabled={disabled}
    >
      {content}
    </div>
  );
};

export const DropZone = ({ index, children }: DropZoneProps) => {
  const ctx = useDragContext();
  const isOver = ctx.overIndex === index && ctx.dragIndex !== null;

  return (
    <div
      className={`drop-zone ${isOver ? 'drop-zone--active' : ''}`}
      data-drop-index={index}
      onDragOver={(e: DragEvent) => ctx.onDragOver(index, e)}
      onDrop={() => ctx.onDrop(index)}
      role="listitem"
    >
      {children}
    </div>
  );
};
