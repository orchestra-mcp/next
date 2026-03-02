import { useRef, useState, useCallback, useEffect } from 'react';
import type { FC, MouseEvent as ReactMouseEvent } from 'react';
import type { QuickAction } from '../types/message';
import './ChatQuickActions.css';

export interface ChatQuickActionsProps {
  /** List of quick action chips */
  actions: QuickAction[];
  /** Fires when a chip is clicked */
  onSelect: (prompt: string) => void;
  /** Additional CSS class */
  className?: string;
}

/** Minimum drag distance (px) before a mousedown is treated as a drag */
const DRAG_THRESHOLD = 5;
/** Velocity multiplier each animation frame (deceleration) */
const MOMENTUM_FRICTION = 0.95;
/** Stop momentum when velocity drops below this value */
const MOMENTUM_MIN_VELOCITY = 0.5;

export const ChatQuickActions: FC<ChatQuickActionsProps> = ({
  actions,
  onSelect,
  className,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  /* ---- scroll-position state for fade masks ---- */
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollFlags = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    updateScrollFlags();

    el.addEventListener('scroll', updateScrollFlags, { passive: true });
    const ro = new ResizeObserver(updateScrollFlags);
    ro.observe(el);

    return () => {
      el.removeEventListener('scroll', updateScrollFlags);
      ro.disconnect();
    };
  }, [updateScrollFlags, actions]);

  /* ---- drag-to-scroll state (refs to avoid re-renders) ---- */
  const isDragging = useRef(false);
  const wasDragging = useRef(false);
  const startX = useRef(0);
  const startScrollLeft = useRef(0);
  const velocityRef = useRef(0);
  const lastMoveX = useRef(0);
  const lastMoveTime = useRef(0);
  const animFrameRef = useRef(0);

  /* visual dragging class (needs re-render so it is state) */
  const [dragging, setDragging] = useState(false);

  const stopMomentum = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = 0;
    }
  }, []);

  const startMomentum = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    let velocity = velocityRef.current;

    const tick = () => {
      velocity *= MOMENTUM_FRICTION;
      if (Math.abs(velocity) < MOMENTUM_MIN_VELOCITY) {
        animFrameRef.current = 0;
        return;
      }
      el.scrollLeft -= velocity;
      animFrameRef.current = requestAnimationFrame(tick);
    };

    animFrameRef.current = requestAnimationFrame(tick);
  }, []);

  const handleMouseDown = useCallback(
    (e: ReactMouseEvent) => {
      const el = scrollRef.current;
      if (!el) return;

      stopMomentum();
      isDragging.current = true;
      wasDragging.current = false;
      startX.current = e.clientX;
      startScrollLeft.current = el.scrollLeft;
      lastMoveX.current = e.clientX;
      lastMoveTime.current = performance.now();
      velocityRef.current = 0;
    },
    [stopMomentum],
  );

  const handleMouseMove = useCallback(
    (e: ReactMouseEvent) => {
      if (!isDragging.current) return;
      const el = scrollRef.current;
      if (!el) return;

      const dx = e.clientX - startX.current;

      if (!wasDragging.current && Math.abs(dx) > DRAG_THRESHOLD) {
        wasDragging.current = true;
        setDragging(true);
      }

      if (wasDragging.current) {
        e.preventDefault();
        const now = performance.now();
        const dt = now - lastMoveTime.current;
        if (dt > 0) {
          velocityRef.current = (e.clientX - lastMoveX.current) / dt * 16;
        }
        lastMoveX.current = e.clientX;
        lastMoveTime.current = now;

        el.scrollLeft = startScrollLeft.current - dx;
      }
    },
    [],
  );

  const handleMouseUp = useCallback(() => {
    if (!isDragging.current) return;
    isDragging.current = false;
    setDragging(false);

    if (wasDragging.current) {
      startMomentum();
      /* Reset wasDragging on the next frame so the pending click
         on the chip (which fires after mouseup) is still suppressed,
         but subsequent real clicks work. */
      requestAnimationFrame(() => {
        wasDragging.current = false;
      });
    }
  }, [startMomentum]);

  const handleMouseLeave = useCallback(() => {
    if (isDragging.current) {
      isDragging.current = false;
      setDragging(false);
      if (wasDragging.current) {
        startMomentum();
        requestAnimationFrame(() => {
          wasDragging.current = false;
        });
      }
    }
  }, [startMomentum]);

  /* ---- chip click guard ---- */
  const handleChipClick = useCallback(
    (prompt: string) => {
      if (wasDragging.current) return;
      onSelect(prompt);
    },
    [onSelect],
  );

  /* ---- cleanup on unmount ---- */
  useEffect(() => {
    return () => stopMomentum();
  }, [stopMomentum]);

  if (actions.length === 0) return null;

  /* Build wrapper className */
  const wrapperCls = [
    'quick-actions',
    canScrollLeft && 'quick-actions--can-scroll-left',
    canScrollRight && 'quick-actions--can-scroll-right',
    dragging && 'quick-actions--dragging',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={wrapperCls}
      data-testid="quick-actions"
      role="toolbar"
      aria-label="Quick actions"
    >
      <div
        ref={scrollRef}
        className="quick-actions__scroll"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        {actions.map((action) => (
          <button
            key={action.id}
            type="button"
            className="quick-actions__chip"
            style={
              action.color
                ? ({ '--chip-accent': action.color } as React.CSSProperties)
                : undefined
            }
            onClick={() => handleChipClick(action.prompt)}
            data-testid={`quick-action-${action.id}`}
          >
            {action.icon && (
              <span className="quick-actions__chip-icon">{action.icon}</span>
            )}
            <span className="quick-actions__chip-label">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
