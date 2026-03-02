import { useState, useCallback, useRef } from 'react';
import type { MentionReference, MentionGroup } from '../types/message';

export interface MentionTokenItem {
  id: string;
  label: string;
  group: MentionGroup;
}

export interface UseMentionTokensResult {
  /** Current tracked mentions with positions */
  mentions: MentionReference[];
  /** Register a new mention after accept */
  addMention: (item: MentionTokenItem, startIndex: number, endIndex: number) => void;
  /** Remove a mention by id */
  removeMention: (id: string) => void;
  /** Clear all mentions (on send) */
  clearMentions: () => void;
  /** Adjust positions when text changes. Call BEFORE updating value. */
  adjustForChange: (oldValue: string, newValue: string) => void;
  /** Check if backspace at cursor would hit a mention boundary */
  getMentionAtBoundary: (cursorPos: number) => MentionReference | null;
}

/**
 * Tracks MentionReference positions within the chat input text.
 * Adjusts indices when text is inserted or deleted before existing mentions.
 */
export function useMentionTokens(): UseMentionTokensResult {
  const [mentions, setMentions] = useState<MentionReference[]>([]);
  const mentionsRef = useRef(mentions);
  mentionsRef.current = mentions;

  const addMention = useCallback(
    (item: MentionTokenItem, startIndex: number, endIndex: number) => {
      const ref: MentionReference = {
        id: item.id,
        label: item.label,
        group: item.group,
        startIndex,
        endIndex,
      };
      setMentions((prev) => [...prev, ref]);
    },
    [],
  );

  const removeMention = useCallback((id: string) => {
    setMentions((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const clearMentions = useCallback(() => {
    setMentions([]);
  }, []);

  /**
   * Computes a simple diff between old and new values to shift mention positions.
   * Finds the first and last differing characters to determine the edit range.
   */
  const adjustForChange = useCallback((oldValue: string, newValue: string) => {
    if (oldValue === newValue) return;

    // Find common prefix length
    let prefixLen = 0;
    const minLen = Math.min(oldValue.length, newValue.length);
    while (prefixLen < minLen && oldValue[prefixLen] === newValue[prefixLen]) {
      prefixLen++;
    }

    // Find common suffix length (not overlapping prefix)
    let suffixLen = 0;
    while (
      suffixLen < minLen - prefixLen &&
      oldValue[oldValue.length - 1 - suffixLen] === newValue[newValue.length - 1 - suffixLen]
    ) {
      suffixLen++;
    }

    const editStart = prefixLen;
    const oldEditEnd = oldValue.length - suffixLen;
    const delta = newValue.length - oldValue.length;

    setMentions((prev) => {
      const updated: MentionReference[] = [];
      for (const m of prev) {
        // Mention entirely before the edit -- keep as-is
        if (m.endIndex <= editStart) {
          updated.push(m);
          continue;
        }
        // Mention entirely after the edit -- shift
        if (m.startIndex >= oldEditEnd) {
          updated.push({ ...m, startIndex: m.startIndex + delta, endIndex: m.endIndex + delta });
          continue;
        }
        // Edit overlaps the mention -- remove it (mention was broken)
      }
      return updated;
    });
  }, []);

  const getMentionAtBoundary = useCallback(
    (cursorPos: number): MentionReference | null => {
      for (const m of mentionsRef.current) {
        // Cursor is right at or inside the mention span
        if (cursorPos > m.startIndex && cursorPos <= m.endIndex) {
          return m;
        }
      }
      return null;
    },
    [],
  );

  return { mentions, addMention, removeMention, clearMentions, adjustForChange, getMentionAtBoundary };
}
