import { useCallback, useRef } from 'react';
import './ResizeHandle.css';

export interface ResizeHandleProps {
  /** Called when resize completes with new span values */
  onResize: (colSpan: number, rowSpan: number) => void;
  /** Minimum column span (default 2) */
  minColSpan?: number;
  /** Minimum row span (default 1) */
  minRowSpan?: number;
}

export const ResizeHandle = ({
  onResize,
  minColSpan = 2,
  minRowSpan = 1,
}: ResizeHandleProps) => {
  const startRef = useRef({ x: 0, y: 0 });

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();
      startRef.current = { x: e.clientX, y: e.clientY };

      const target = e.currentTarget as HTMLElement;
      target.setPointerCapture(e.pointerId);

      const handleUp = (upEvent: PointerEvent) => {
        target.releasePointerCapture(upEvent.pointerId);
        target.removeEventListener('pointerup', handleUp);

        const dx = upEvent.clientX - startRef.current.x;
        const dy = upEvent.clientY - startRef.current.y;

        const colDelta = Math.round(dx / 100);
        const rowDelta = Math.round(dy / 80);

        const newColSpan = Math.max(minColSpan, minColSpan + colDelta);
        const newRowSpan = Math.max(minRowSpan, minRowSpan + rowDelta);

        onResize(newColSpan, newRowSpan);
      };

      target.addEventListener('pointerup', handleUp);
    },
    [onResize, minColSpan, minRowSpan]
  );

  return (
    <div
      className="resize-handle"
      data-testid="resize-handle"
      onPointerDown={handlePointerDown}
      aria-label="Resize widget"
      role="separator"
    />
  );
};
