"use client";

import { useState, useRef, useCallback, useEffect } from 'react';

export interface DragPositionOptions {
  initialX?: number;
  initialY?: number;
  constrain?: boolean;
  snapToEdge?: boolean;
  edgeMargin?: number;
}

export interface DragPositionResult {
  position: { x: number; y: number };
  isDragging: boolean;
  wasDragged: boolean;
  handlers: {
    onPointerDown: (e: React.PointerEvent) => void;
  };
}

const DRAG_THRESHOLD = 5;

export function useDragPosition(options: DragPositionOptions = {}): DragPositionResult {
  const {
    initialX = window.innerWidth - 80,
    initialY = window.innerHeight - 80,
    constrain = true,
    snapToEdge = true,
    edgeMargin = 16,
  } = options;

  const [position, setPosition] = useState({ x: initialX, y: initialY });
  const [isDragging, setIsDragging] = useState(false);
  const wasDraggedRef = useRef(false);
  const [wasDragged, setWasDragged] = useState(false);
  const startRef = useRef({ x: 0, y: 0, px: 0, py: 0 });

  const clamp = useCallback(
    (x: number, y: number, elW: number, elH: number) => {
      if (!constrain) return { x, y };
      const maxX = window.innerWidth - elW - edgeMargin;
      const maxY = window.innerHeight - elH - edgeMargin;
      return {
        x: Math.max(edgeMargin, Math.min(x, maxX)),
        y: Math.max(edgeMargin, Math.min(y, maxY)),
      };
    },
    [constrain, edgeMargin],
  );

  const snapX = useCallback(
    (x: number, elW: number) => {
      if (!snapToEdge) return x;
      const mid = window.innerWidth / 2;
      return x + elW / 2 < mid ? edgeMargin : window.innerWidth - elW - edgeMargin;
    },
    [snapToEdge, edgeMargin],
  );

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      const el = (e.currentTarget as HTMLElement);
      el.setPointerCapture(e.pointerId);
      wasDraggedRef.current = false;
      setWasDragged(false);
      startRef.current = { x: position.x, y: position.y, px: e.clientX, py: e.clientY };

      const onMove = (ev: PointerEvent) => {
        const dx = ev.clientX - startRef.current.px;
        const dy = ev.clientY - startRef.current.py;
        if (!wasDraggedRef.current && Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
        wasDraggedRef.current = true;
        setIsDragging(true);
        const rect = el.getBoundingClientRect();
        const next = clamp(startRef.current.x + dx, startRef.current.y + dy, rect.width, rect.height);
        setPosition(next);
      };

      const onUp = () => {
        el.removeEventListener('pointermove', onMove);
        el.removeEventListener('pointerup', onUp);
        setIsDragging(false);
        setWasDragged(wasDraggedRef.current);
        if (wasDraggedRef.current && snapToEdge) {
          const rect = el.getBoundingClientRect();
          setPosition(prev => ({
            x: snapX(prev.x, rect.width),
            y: prev.y,
          }));
        }
      };

      el.addEventListener('pointermove', onMove);
      el.addEventListener('pointerup', onUp);
    },
    [position.x, position.y, clamp, snapToEdge, snapX],
  );

  useEffect(() => {
    const onResize = () => {
      setPosition(prev => clamp(prev.x, prev.y, 56, 56));
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [clamp]);

  return { position, isDragging, wasDragged, handlers: { onPointerDown } };
}
