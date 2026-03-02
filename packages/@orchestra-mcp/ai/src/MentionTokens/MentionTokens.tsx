import { useMemo } from 'react';
import type { MentionRef } from '../types/message';
import './MentionTokens.css';

export interface MentionTokensProps {
  /** The raw text value (same as textarea value) */
  value: string;
  /** List of active mention references in the text */
  mentions: MentionRef[];
  /** Whether the overlay is visible (defaults to true) */
  visible?: boolean;
}

type Segment =
  | { type: 'text'; text: string }
  | { type: 'mention'; label: string; group: string; id: string };

/**
 * Mirror overlay that renders styled mention tokens on top of a textarea.
 *
 * The overlay renders the same text as the textarea but with `color: transparent`
 * for plain text and styled background highlights for `@mention` tokens. Because
 * the overlay has `pointer-events: none`, all interaction goes to the textarea
 * underneath.
 */
export function MentionTokens({ value, mentions, visible = true }: MentionTokensProps) {
  const segments = useMemo<Segment[]>(() => {
    if (mentions.length === 0) return [{ type: 'text', text: value }];

    // Build a list of match positions for each mention found in the text.
    // A mention matches as `@{label}` (case-sensitive).
    const matches: Array<{ start: number; end: number; label: string; group: string; id: string }> = [];

    for (const m of mentions) {
      const needle = `@${m.label}`;
      let searchFrom = 0;
      // Find all occurrences (a mention might appear more than once)
      while (searchFrom < value.length) {
        const idx = value.indexOf(needle, searchFrom);
        if (idx === -1) break;
        matches.push({
          start: idx,
          end: idx + needle.length,
          label: m.label,
          group: m.group,
          id: m.id,
        });
        searchFrom = idx + needle.length;
      }
    }

    if (matches.length === 0) return [{ type: 'text', text: value }];

    // Sort by start index and deduplicate overlapping ranges
    matches.sort((a, b) => a.start - b.start);
    const deduped: typeof matches = [];
    for (const m of matches) {
      const last = deduped[deduped.length - 1];
      if (last && m.start < last.end) continue; // overlapping, skip
      deduped.push(m);
    }

    // Build segments interleaving plain text and mention tokens
    const result: Segment[] = [];
    let cursor = 0;
    for (const m of deduped) {
      if (m.start > cursor) {
        result.push({ type: 'text', text: value.slice(cursor, m.start) });
      }
      result.push({ type: 'mention', label: m.label, group: m.group, id: m.id });
      cursor = m.end;
    }
    if (cursor < value.length) {
      result.push({ type: 'text', text: value.slice(cursor) });
    }
    return result;
  }, [value, mentions]);

  if (!visible) return null;

  return (
    <div className="mention-tokens" aria-hidden="true" data-testid="mention-tokens-overlay">
      {segments.map((seg, i) =>
        seg.type === 'text' ? (
          <span key={i}>{seg.text}</span>
        ) : (
          <span
            key={`${seg.id}-${i}`}
            className="mention-tokens__chip"
            data-group={seg.group}
          >
            @{seg.label}
          </span>
        ),
      )}
    </div>
  );
}
