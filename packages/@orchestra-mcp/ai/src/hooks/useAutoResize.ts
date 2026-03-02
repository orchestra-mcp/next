"use client";

import { useRef, useCallback, useEffect } from 'react';

export interface AutoResizeOptions {
  maxRows?: number;
  lineHeight?: number;
}

export function useAutoResize(options: AutoResizeOptions = {}) {
  const { maxRows = 6, lineHeight = 22 } = options;
  const ref = useRef<HTMLTextAreaElement>(null);

  const resize = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    const maxHeight = maxRows * lineHeight;
    const scrollH = el.scrollHeight;
    el.style.height = `${Math.min(scrollH, maxHeight)}px`;
    el.style.overflowY = scrollH > maxHeight ? 'auto' : 'hidden';
  }, [maxRows, lineHeight]);

  useEffect(() => {
    resize();
  });

  return { ref, resize };
}
