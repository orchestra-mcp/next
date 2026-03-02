"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import type { DragEvent } from 'react';
import type { BoardContextValue, BoardDragState, DragBoardProps } from './DragBoard.types';
import './DragBoard.css';

export const BoardContext = createContext<BoardContextValue | null>(null);

export const useBoardContext = () => useContext(BoardContext);

export const DragBoard = ({ onMove, children, className }: DragBoardProps) => {
  const [boardDragState, setBoardDragState] = useState<BoardDragState | null>(null);
  const [lastDroppedId, setLastDroppedId] = useState<string | null>(null);
  const dragRef = useRef<BoardDragState | null>(null);
  const dropTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (dropTimerRef.current) clearTimeout(dropTimerRef.current);
    };
  }, []);

  const onGroupDragStart = useCallback(
    (groupId: string, index: number, itemId: string, e: DragEvent) => {
      const state: BoardDragState = {
        sourceGroupId: groupId,
        sourceIndex: index,
        itemId,
        targetGroupId: null,
        targetIndex: null,
      };
      dragRef.current = state;
      setBoardDragState(state);
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', `${groupId}:${index}`);
    },
    [],
  );

  const onGroupDragOver = useCallback((groupId: string, index: number, e: DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setBoardDragState((prev) => {
      if (!prev || (prev.targetGroupId === groupId && prev.targetIndex === index)) return prev;
      return { ...prev, targetGroupId: groupId, targetIndex: index };
    });
  }, []);

  const onGroupDrop = useCallback(
    (groupId: string, index: number) => {
      const source = dragRef.current;
      if (source && source.sourceGroupId !== groupId) {
        onMove({
          itemId: source.itemId,
          fromGroupId: source.sourceGroupId,
          fromIndex: source.sourceIndex,
          toGroupId: groupId,
          toIndex: index,
        });
        setLastDroppedId(source.itemId);
        if (dropTimerRef.current) clearTimeout(dropTimerRef.current);
        dropTimerRef.current = setTimeout(() => setLastDroppedId(null), 300);
      }
      setBoardDragState(null);
      dragRef.current = null;
    },
    [onMove],
  );

  const onGroupDragEnd = useCallback(() => {
    setBoardDragState(null);
    dragRef.current = null;
  }, []);

  return (
    <BoardContext.Provider
      value={{ boardDragState, onGroupDragStart, onGroupDragOver, onGroupDrop, onGroupDragEnd, lastDroppedId }}
    >
      <div className={['drag-board', className].filter(Boolean).join(' ')}>{children}</div>
    </BoardContext.Provider>
  );
};
