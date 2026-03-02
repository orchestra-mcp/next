import { useRef, useCallback, useState, useMemo, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { WidgetLayout } from '../stores/useDashboardStore';
import './DashboardGrid.css';

const HOLD_DELAY = 200;

export interface DashboardGridProps {
  widgets: WidgetLayout[];
  /** Actual column count of this grid (1/2/4/6/12) */
  columns: number;
  onMove?: (widgetId: string, col: number, row: number) => void;
  onMoveToIndex?: (widgetId: string, newIndex: number) => void;
  onWidgetContextMenu?: (widgetId: string, e: React.MouseEvent) => void;
  renderWidget: (widget: WidgetLayout) => ReactNode;
  className?: string;
}

interface DragState {
  widgetId: string;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  offsetX: number;
  offsetY: number;
  hoverIndex: number; // Index in the array where widget should be inserted
}

/**
 * Calculate which index the dragged widget should be inserted at
 * based on mouse position over actual widget DOM elements
 */
function calculateHoverIndex(
  widgets: WidgetLayout[],
  draggedId: string,
  mouseX: number,
  mouseY: number,
  gridElement: HTMLElement,
): number {
  // Get all widget elements (excluding the dragged one)
  const items = Array.from(gridElement.querySelectorAll('.dashboard-grid__item:not(.dashboard-grid__item--dragging)'));

  if (items.length === 0) return 0;

  // Find closest widget based on center point
  let closestIndex = 0;
  let closestDistance = Infinity;

  items.forEach((item, index) => {
    const rect = item.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const distance = Math.sqrt(
      Math.pow(mouseX - centerX, 2) + Math.pow(mouseY - centerY, 2)
    );

    if (distance < closestDistance) {
      closestDistance = distance;
      closestIndex = index;
    }
  });

  // Determine if we should insert before or after the closest widget
  const closestRect = items[closestIndex].getBoundingClientRect();
  const centerX = closestRect.left + closestRect.width / 2;
  const centerY = closestRect.top + closestRect.height / 2;

  // If mouse is to the right or below center, insert after
  if (mouseX > centerX || mouseY > centerY) {
    return Math.min(closestIndex + 1, items.length);
  }

  return closestIndex;
}

export const DashboardGrid = ({
  widgets,
  columns,
  onMove,
  onMoveToIndex,
  onWidgetContextMenu,
  renderWidget,
  className,
}: DashboardGridProps) => {
  const gridRef = useRef<HTMLDivElement>(null);
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dragHandlersRef = useRef<{ cleanup: () => void } | null>(null);
  const [dragState, setDragState] = useState<DragState | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
      if (dragHandlersRef.current) dragHandlersRef.current.cleanup();
    };
  }, []);

  // Compute reordered layout during drag for live preview
  const displayWidgets = useMemo(() => {
    if (!dragState) return widgets;

    const draggedWidget = widgets.find((w) => w.id === dragState.widgetId);
    if (!draggedWidget) return widgets;

    const otherWidgets = widgets.filter((w) => w.id !== dragState.widgetId);

    // Insert at hover index
    const reordered = [
      ...otherWidgets.slice(0, dragState.hoverIndex),
      draggedWidget,
      ...otherWidgets.slice(dragState.hoverIndex),
    ];

    return reordered;
  }, [widgets, dragState]);

  const handleDragStart = useCallback(
    (widgetId: string, colSpan: number, locked?: boolean) => (e: React.MouseEvent) => {
      if (locked || !onMoveToIndex) return;
      e.preventDefault();
      e.stopPropagation();

      const item = (e.currentTarget as HTMLElement).closest('.dashboard-grid__item') as HTMLElement;
      if (!item) return;

      const rect = item.getBoundingClientRect();
      const offsetX = e.clientX - rect.left;
      const offsetY = e.clientY - rect.top;
      const startX = e.clientX;
      const startY = e.clientY;

      // Clear any previous drag
      if (holdTimerRef.current) {
        clearTimeout(holdTimerRef.current);
      }
      if (dragHandlersRef.current) {
        dragHandlersRef.current.cleanup();
      }

      let isHolding = true;
      let isDragging = false;

      const handleMove = (moveEvent: globalThis.MouseEvent) => {
        if (!isHolding && !isDragging) return;

        // Check if moved enough to cancel hold
        if (isHolding) {
          const dx = Math.abs(moveEvent.clientX - startX);
          const dy = Math.abs(moveEvent.clientY - startY);
          if (dx > 5 || dy > 5) {
            cleanup();
            return;
          }
        }

        if (!isDragging) return;

        moveEvent.preventDefault();
        const grid = gridRef.current;
        if (!grid) return;

        const hoverIndex = calculateHoverIndex(
          widgets,
          widgetId,
          moveEvent.clientX,
          moveEvent.clientY,
          grid,
        );

        setDragState((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            currentX: moveEvent.clientX,
            currentY: moveEvent.clientY,
            hoverIndex,
          };
        });
      };

      const handleUp = (upEvent: globalThis.MouseEvent) => {
        upEvent.preventDefault();
        upEvent.stopPropagation();

        if (isDragging) {
          const grid = gridRef.current;
          if (grid) {
            const finalIndex = calculateHoverIndex(
              widgets,
              widgetId,
              upEvent.clientX,
              upEvent.clientY,
              grid,
            );

            // Call move before cleanup to ensure state updates
            if (onMoveToIndex) {
              onMoveToIndex(widgetId, finalIndex);
            }
          }
        }

        // Always cleanup regardless of drag state
        cleanup();
      };

      const cleanup = () => {
        // Clear flags first
        isHolding = false;

        // Clear timer
        if (holdTimerRef.current) {
          clearTimeout(holdTimerRef.current);
          holdTimerRef.current = null;
        }

        // Remove event listeners
        document.removeEventListener('mousemove', handleMove);
        document.removeEventListener('mouseup', handleUp);

        // Clean up drag state
        if (isDragging) {
          item.classList.remove('dashboard-grid__item--dragging');
          isDragging = false;

          // Use setTimeout to ensure React state update happens after move
          setTimeout(() => {
            setDragState(null);
          }, 0);
        }

        // Clear ref
        dragHandlersRef.current = null;
      };

      dragHandlersRef.current = { cleanup };

      // Start hold timer
      holdTimerRef.current = setTimeout(() => {
        if (!isHolding) return;

        isHolding = false;
        isDragging = true;
        holdTimerRef.current = null;

        item.classList.add('dashboard-grid__item--dragging');
        const initialIndex = widgets.findIndex((w) => w.id === widgetId);

        setDragState({
          widgetId,
          startX,
          startY,
          currentX: startX,
          currentY: startY,
          offsetX,
          offsetY,
          hoverIndex: initialIndex,
        });
      }, HOLD_DELAY);

      document.addEventListener('mousemove', handleMove);
      document.addEventListener('mouseup', handleUp);
    },
    [onMoveToIndex, columns, widgets],
  );

  const draggingWidget = dragState ? widgets.find((w) => w.id === dragState.widgetId) : null;

  return (
    <>
      <div
        ref={gridRef}
        className={`dashboard-grid ${className || ''}`}
        data-testid="dashboard-grid"
      >
        {displayWidgets.map((widget) => {
          const clampedSpan = Math.min(widget.colSpan, columns);
          const isDragging = dragState?.widgetId === widget.id;

          return (
            <div
              key={widget.id}
              className={`dashboard-grid__item${widget.collapsed ? ' dashboard-grid__item--collapsed' : ''}${isDragging ? ' dashboard-grid__item--dragging' : ''}`}
              data-testid={`widget-${widget.id}`}
              onContextMenu={onWidgetContextMenu ? (e) => onWidgetContextMenu(widget.id, e) : undefined}
              style={{
                gridColumn: `span ${clampedSpan}`,
              }}
            >
              <div
                className="dashboard-grid__drag-handle"
                onMouseDown={handleDragStart(widget.id, clampedSpan, widget.locked)}
                style={{ cursor: widget.locked ? 'default' : 'grab' }}
              />
              {renderWidget(widget)}
            </div>
          );
        })}
      </div>

      {/* Floating ghost element */}
      {dragState && draggingWidget && (
        <div
          className="dashboard-grid__ghost"
          style={{
            position: 'fixed',
            left: dragState.currentX - dragState.offsetX,
            top: dragState.currentY - dragState.offsetY,
            width: `${(100 / columns) * Math.min(draggingWidget.colSpan, columns)}%`,
            maxWidth: '600px',
            pointerEvents: 'none',
            zIndex: 9999,
          }}
        >
          {renderWidget(draggingWidget)}
        </div>
      )}
    </>
  );
};
