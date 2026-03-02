"use client";

import { useRef, useState, useCallback, useEffect } from 'react';

const BOTTOM_THRESHOLD = 40;

export function useAutoScroll(deps: unknown[] = []) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const isAtBottomRef = useRef(true);

  const checkBottom = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < BOTTOM_THRESHOLD;
    isAtBottomRef.current = atBottom;
    setIsAtBottom(atBottom);
  }, []);

  const scrollToBottom = useCallback((smooth = true) => {
    const el = containerRef.current;
    if (!el) return;
    el.scrollTo({
      top: el.scrollHeight,
      behavior: smooth ? 'smooth' : 'instant',
    });
    isAtBottomRef.current = true;
    setIsAtBottom(true);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener('scroll', checkBottom, { passive: true });
    return () => el.removeEventListener('scroll', checkBottom);
  }, [checkBottom]);

  // Initial scroll to bottom on mount
  useEffect(() => {
    // Use double requestAnimationFrame to ensure DOM is fully painted
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        scrollToBottom(false);
      });
    });
    // Only run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-scroll when deps change, only if user is at bottom
  useEffect(() => {
    if (isAtBottom) scrollToBottom();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  // MutationObserver: auto-scroll when content inside the container changes
  // This catches streaming text being added char-by-char to existing messages
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new MutationObserver(() => {
      if (isAtBottomRef.current) {
        el.scrollTop = el.scrollHeight;
      }
    });

    observer.observe(el, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    return () => observer.disconnect();
  }, []);

  return { containerRef, isAtBottom, scrollToBottom };
}
