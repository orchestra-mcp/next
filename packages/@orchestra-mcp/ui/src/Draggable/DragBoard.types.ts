import type { ReactNode, DragEvent } from 'react';

/** Result passed to DragBoard.onMove when an item moves between groups */
export interface DragMoveResult {
  itemId: string;
  fromGroupId: string;
  fromIndex: number;
  toGroupId: string;
  toIndex: number;
}

/** Internal state tracked by DragBoard during a cross-group drag */
export interface BoardDragState {
  sourceGroupId: string;
  sourceIndex: number;
  itemId: string;
  targetGroupId: string | null;
  targetIndex: number | null;
}

/** Context value shared by DragBoard to DragGroups */
export interface BoardContextValue {
  boardDragState: BoardDragState | null;
  onGroupDragStart: (groupId: string, index: number, itemId: string, e: DragEvent) => void;
  onGroupDragOver: (groupId: string, index: number, e: DragEvent) => void;
  onGroupDrop: (groupId: string, index: number) => void;
  onGroupDragEnd: () => void;
  lastDroppedId: string | null;
}

/** DragBoard component props */
export interface DragBoardProps {
  onMove: (result: DragMoveResult) => void;
  children: ReactNode;
  className?: string;
}

/** DragGroup component props */
export interface DragGroupProps {
  groupId: string;
  onReorder?: (result: { fromIndex: number; toIndex: number }) => void;
  direction?: 'vertical' | 'horizontal' | 'grid';
  children: ReactNode;
  className?: string;
  emptyContent?: ReactNode;
}
