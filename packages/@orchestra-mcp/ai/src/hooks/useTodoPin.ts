import { useState, useCallback, useRef, useEffect } from 'react';
import type { TodoListEvent } from '../types/events';

export interface UseTodoPinResult {
  /** Whether the todo overlay is pinned. */
  pinned: boolean;
  /** Toggle or set pin state. */
  setPinned: (pinned: boolean) => void;
  /** The latest todo event (updates automatically). */
  latestEvent: TodoListEvent | null;
  /** Call this whenever a new TodoListEvent arrives. */
  onTodoEvent: (event: TodoListEvent) => void;
}

/**
 * Manages pinned todo overlay state. Tracks the latest TodoListEvent
 * and provides pin toggle. Auto-pins on first todo event if `autoPin`
 * is true.
 */
export function useTodoPin(autoPin = false): UseTodoPinResult {
  const [pinned, setPinned] = useState(false);
  const [latestEvent, setLatestEvent] = useState<TodoListEvent | null>(null);
  const autoPinDone = useRef(false);

  const onTodoEvent = useCallback(
    (event: TodoListEvent) => {
      setLatestEvent(event);
      // Auto-pin on first todo event
      if (autoPin && !autoPinDone.current) {
        autoPinDone.current = true;
        setPinned(true);
      }
    },
    [autoPin],
  );

  // Reset auto-pin ref when autoPin changes
  useEffect(() => {
    if (!autoPin) autoPinDone.current = false;
  }, [autoPin]);

  return { pinned, setPinned, latestEvent, onTodoEvent };
}
