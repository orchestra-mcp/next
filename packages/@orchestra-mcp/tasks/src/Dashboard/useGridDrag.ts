import { useCallback, useRef, useState } from 'react';
import type { RefObject } from 'react';

interface UseGridDragOptions {
  /** Ref to the grid container element */
  gridRef: RefObject<HTMLDivElement | null>;
  /** Number of grid columns (default 12) */
  columns?: number;
  /** Called when a widget is dropped at a new position */
  onDrop: (col: number, row: number) => void;
}

interface UseGridDragReturn {
  isDragging: boolean;
  handlePointerDown: (e: React.PointerEvent) => void;
}

export const useGridDrag = ({
  gridRef,
  columns = 12,
  onDrop,
}: UseGridDragOptions): UseGridDragReturn => {
  const [isDragging, setIsDragging] = useState(false);
  const startPos = useRef({ x: 0, y: 0 });

  const snapToGrid = useCallback(
    (clientX: number, clientY: number): { col: number; row: number } => {
      const grid = gridRef.current;
      if (!grid) return { col: 1, row: 1 };

      const rect = grid.getBoundingClientRect();
      const colWidth = rect.width / columns;
      const rowHeight = 80;

      const relX = clientX - rect.left;
      const relY = clientY - rect.top;

      const col = Math.max(1, Math.min(columns, Math.ceil(relX / colWidth)));
      const row = Math.max(1, Math.ceil(relY / rowHeight));

      return { col, row };
    },
    [gridRef, columns]
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      setIsDragging(true);
      startPos.current = { x: e.clientX, y: e.clientY };

      const target = e.currentTarget as HTMLElement;
      target.setPointerCapture(e.pointerId);

      const handleMove = (_moveEvent: PointerEvent) => {
        // Movement tracked for visual feedback (handled by consumers)
      };

      const handleUp = (upEvent: PointerEvent) => {
        setIsDragging(false);
        target.releasePointerCapture(upEvent.pointerId);
        target.removeEventListener('pointermove', handleMove);
        target.removeEventListener('pointerup', handleUp);

        const { col, row } = snapToGrid(upEvent.clientX, upEvent.clientY);
        onDrop(col, row);
      };

      target.addEventListener('pointermove', handleMove);
      target.addEventListener('pointerup', handleUp);
    },
    [snapToGrid, onDrop]
  );

  return { isDragging, handlePointerDown };
};
