import { useState, useCallback, useEffect, useRef } from 'react';

export interface UseMentionTriggerOptions {
  /** The current textarea value */
  value: string;
  /** Ref to the textarea element */
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  /** Whether mentions are enabled */
  enabled?: boolean;
}

export interface UseMentionTriggerResult {
  /** Whether the popup should be open */
  open: boolean;
  /** The query text after @ */
  query: string;
  /** Position for the popup (relative to viewport) */
  position: { x: number; y: number };
  /** Call when popup is dismissed */
  dismiss: () => void;
  /** Call when an item is selected — replaces the @query with @label in the value */
  accept: (label: string) => string;
}

interface MentionState {
  open: boolean;
  query: string;
  /** The index of the @ character in the value */
  atIndex: number;
}

/**
 * Detects @mention triggers in a textarea and provides positioning + replacement logic.
 *
 * On every `value` change, scans backward from `selectionStart` to find a `@` that is
 * either at position 0 or preceded by a space/newline. Extracts query text between `@`
 * and cursor. The popup opens when a valid trigger is detected and the query contains
 * no spaces (single-word mentions).
 */
export function useMentionTrigger({
  value,
  textareaRef,
  enabled = true,
}: UseMentionTriggerOptions): UseMentionTriggerResult {
  const [state, setState] = useState<MentionState>({ open: false, query: '', atIndex: -1 });
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const dismissedAtRef = useRef<number>(-1);

  // Detect @ trigger on value changes
  useEffect(() => {
    if (!enabled) {
      if (state.open) setState({ open: false, query: '', atIndex: -1 });
      return;
    }

    const textarea = textareaRef.current;
    if (!textarea) return;

    const cursorPos = textarea.selectionStart;

    // Scan backward from cursor to find @
    let atIndex = -1;
    for (let i = cursorPos - 1; i >= 0; i--) {
      const ch = value[i];
      // If we hit a space or newline before finding @, no trigger
      if (ch === ' ' || ch === '\n' || ch === '\r') break;
      if (ch === '@') {
        // Valid trigger: @ at position 0 or preceded by space/newline
        if (i === 0 || value[i - 1] === ' ' || value[i - 1] === '\n' || value[i - 1] === '\r') {
          atIndex = i;
        }
        break;
      }
    }

    if (atIndex === -1) {
      if (state.open) setState({ open: false, query: '', atIndex: -1 });
      return;
    }

    // If the user previously dismissed the popup at this same @ position, stay closed
    if (dismissedAtRef.current === atIndex) {
      if (state.open) setState({ open: false, query: '', atIndex: -1 });
      return;
    }

    const query = value.slice(atIndex + 1, cursorPos);

    // Mentions are single-word: if query contains a space, close
    if (query.includes(' ')) {
      if (state.open) setState({ open: false, query: '', atIndex: -1 });
      return;
    }

    // Calculate position using textarea bounding rect
    const rect = textarea.getBoundingClientRect();
    setPosition({
      x: rect.left,
      y: rect.top,
    });

    setState({ open: true, query, atIndex });
  }, [value, enabled, textareaRef]);

  const dismiss = useCallback(() => {
    // Remember which @ position was dismissed so we don't re-open
    dismissedAtRef.current = state.atIndex;
    setState({ open: false, query: '', atIndex: -1 });
  }, [state.atIndex]);

  const accept = useCallback(
    (label: string): string => {
      if (state.atIndex < 0) return value;
      const textarea = textareaRef.current;
      const cursorPos = textarea ? textarea.selectionStart : state.atIndex + 1 + state.query.length;
      const before = value.slice(0, state.atIndex);
      const after = value.slice(cursorPos);
      const newValue = `${before}@${label} ${after}`;
      // Reset dismissed tracking so a new @ can trigger again
      dismissedAtRef.current = -1;
      setState({ open: false, query: '', atIndex: -1 });
      return newValue;
    },
    [value, state.atIndex, state.query, textareaRef],
  );

  return {
    open: state.open,
    query: state.query,
    position,
    dismiss,
    accept,
  };
}
