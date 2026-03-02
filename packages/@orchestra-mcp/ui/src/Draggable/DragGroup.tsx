"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import type { DragEvent, KeyboardEvent } from 'react';
import { DragContext } from './Draggable';
import type { DragContextValue } from './Draggable';
import { useBoardContext } from './DragBoard';
import type { DragGroupProps } from './DragBoard.types';

export const DragGroup = ({
  groupId,
  onReorder,
  direction = 'vertical',
  children,
  className,
  emptyContent,
}: DragGroupProps) => {
  const board = useBoardContext();
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const dragRef = useRef<number | null>(null);
  const itemIdRef = useRef<string | null>(null);

  // Clear local state when board drag ends (e.g. dragEnd fired on another group)
  useEffect(() => {
    if (!board?.boardDragState) {
      setDragIndex(null);
      setOverIndex(null);
      dragRef.current = null;
      itemIdRef.current = null;
    }
  }, [board?.boardDragState]);

  const isForeignHover =
    board?.boardDragState?.targetGroupId === groupId &&
    board?.boardDragState?.sourceGroupId !== groupId;

  const handleDragStart = useCallback(
    (index: number, e: DragEvent) => {
      dragRef.current = index;
      setDragIndex(index);
      e.dataTransfer.effectAllowed = 'move';
      const itemEl = (e.target as HTMLElement).closest('[data-drag-id]');
      const itemId = itemEl?.getAttribute('data-drag-id') ?? String(index);
      itemIdRef.current = itemId;
      board?.onGroupDragStart(groupId, index, itemId, e);
      if (!board) e.dataTransfer.setData('text/plain', String(index));
    },
    [board, groupId],
  );

  const handleDragOver = useCallback(
    (index: number, e: DragEvent) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      setOverIndex(index);
      board?.onGroupDragOver(groupId, index, e);
    },
    [board, groupId],
  );

  const handleDrop = useCallback(
    (toIndex: number) => {
      const fromIndex = dragRef.current;
      if (fromIndex !== null && fromIndex !== toIndex) {
        onReorder?.({ fromIndex, toIndex });
      }
      board?.onGroupDrop(groupId, toIndex);
      setDragIndex(null);
      setOverIndex(null);
      dragRef.current = null;
      itemIdRef.current = null;
    },
    [onReorder, board, groupId],
  );

  const handleDragEnd = useCallback(() => {
    setDragIndex(null);
    setOverIndex(null);
    dragRef.current = null;
    itemIdRef.current = null;
    board?.onGroupDragEnd();
  }, [board]);

  const handleKeyReorder = useCallback(
    (fromIndex: number, dir: 'prev' | 'next') => {
      const toIndex = dir === 'prev' ? fromIndex - 1 : fromIndex + 1;
      if (toIndex >= 0) onReorder?.({ fromIndex, toIndex });
    },
    [onReorder],
  );

  const ctxValue: DragContextValue = {
    direction,
    dragIndex,
    overIndex,
    onDragStart: handleDragStart,
    onDragOver: handleDragOver,
    onDragEnd: handleDragEnd,
    onDrop: handleDrop,
    onKeyReorder: handleKeyReorder,
  };

  const hasChildren =
    Array.isArray(children) ? children.filter(Boolean).length > 0 : !!children;

  const groupClasses = [
    'drag-group',
    `drag-group--${direction}`,
    isForeignHover && 'drag-group--foreign-hover',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const handleEmptyDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    board?.onGroupDragOver(groupId, 0, e);
  };

  const handleEmptyDrop = () => {
    board?.onGroupDrop(groupId, 0);
  };

  return (
    <DragContext.Provider value={ctxValue}>
      <div className={groupClasses} data-group-id={groupId}>
        <div className={`drag-list drag-list--${direction}`} role="list">
          {children}
        </div>
        {!hasChildren && (
          <div
            className="drag-group__empty"
            onDragOver={handleEmptyDragOver}
            onDrop={handleEmptyDrop}
          >
            {emptyContent ?? 'Drop items here'}
          </div>
        )}
      </div>
    </DragContext.Provider>
  );
};
