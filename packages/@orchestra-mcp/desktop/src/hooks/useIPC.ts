"use client";

'use client';

import { useCallback } from 'react';

/**
 * Type-safe Wails IPC hook.
 * Calls Go-bound services via window.wails.Call.ByName().
 * Returns null if Wails runtime is unavailable (dev mode / browser).
 */
export function useIPC() {
  const call = useCallback(
    async <T>(service: string, method: string, ...args: unknown[]): Promise<T | null> => {
      try {
        const w = window as Window;
        if (w.wails?.Call?.ByName) {
          return await w.wails.Call.ByName(`${service}.${method}`, ...args) as T;
        }
        console.debug('[IPC] Wails runtime not available');
      } catch (e) {
        console.warn('[IPC] Call failed:', `${service}.${method}`, e);
      }
      return null;
    },
    []
  );

  const isAvailable = useCallback((): boolean => {
    const w = window as Window;
    return !!w.wails?.Call?.ByName;
  }, []);

  return { call, isAvailable };
}
