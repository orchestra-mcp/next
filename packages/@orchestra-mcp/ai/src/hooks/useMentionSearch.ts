import { useState, useEffect, useRef, useCallback } from 'react';
import type { MentionItem } from '../MentionPopup';

/* ── Public types ── */

export interface UseMentionSearchOptions {
  /** Text typed after @ */
  query: string;
  /** Whether the mention popup is open */
  open: boolean;
  /** Static items that never need a backend call (agents, skills) */
  staticItems: MentionItem[];
  /** Project slug — enables backend search for files, tasks, epics */
  project?: string;
  /** Search endpoint (default: http://127.0.0.1:19191/api/search/mentions) */
  searchEndpoint?: string;
}

export interface UseMentionSearchResult {
  /** Merged items: static first, then search results */
  items: MentionItem[];
  /** Whether a backend search is in-flight */
  loading: boolean;
}

/* ── Constants ── */

const DEBOUNCE_MS = 250;
const DEFAULT_ENDPOINT = 'http://127.0.0.1:19191/api/search/mentions';

/* ── Hook ── */

/**
 * Async mention search hook that calls the combined search endpoint.
 *
 * Fetches matching files, tasks, and epics from the backend. Results
 * are merged with the provided static items (agents, skills) which
 * are always client-side filtered.
 *
 * When the query is empty the hook returns the static items without
 * a backend call. On errors it silently falls back to static items.
 */
export function useMentionSearch({
  query,
  open,
  staticItems,
  project,
  searchEndpoint,
}: UseMentionSearchOptions): UseMentionSearchResult {
  const [searchResults, setSearchResults] = useState<MentionItem[]>([]);
  const [loading, setLoading] = useState(false);

  const mountedRef = useRef(true);
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  // Filter static items client-side by query
  const filterStatic = useCallback(
    (q: string): MentionItem[] => {
      if (!q) return staticItems;
      const lower = q.toLowerCase();
      return staticItems.filter(
        (item) =>
          item.label.toLowerCase().includes(lower) ||
          (item.description && item.description.toLowerCase().includes(lower)),
      );
    },
    [staticItems],
  );

  // Backend search (debounced)
  useEffect(() => {
    if (controllerRef.current) {
      controllerRef.current.abort();
      controllerRef.current = null;
    }

    if (!open || !query) {
      setSearchResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const controller = new AbortController();
    controllerRef.current = controller;

    const endpoint = searchEndpoint || DEFAULT_ENDPOINT;

    const timer = setTimeout(async () => {
      try {
        const resp = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query, limit: 15 }),
          signal: controller.signal,
        });

        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

        const data: { items?: MentionItem[] } = await resp.json();

        if (mountedRef.current) {
          setSearchResults(data.items || []);
          setLoading(false);
        }
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        if (mountedRef.current) {
          setSearchResults([]);
          setLoading(false);
        }
      }
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, open, project, searchEndpoint]);

  // Merge: filtered static items first, then backend results
  const filteredStatic = filterStatic(query);
  const items = searchResults.length > 0
    ? [...filteredStatic, ...searchResults]
    : filteredStatic;

  return { items, loading };
}
