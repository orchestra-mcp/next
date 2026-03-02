"use client";

'use client';

import { useEffect, useRef, useState } from 'react';
import { useThemeStore } from '../stores/useThemeStore';

interface ThemeUpdatePayload {
  themeId: string;
  variant: string;
}

interface UseThemeSyncOptions {
  subscribe: (type: string, handler: (payload: unknown) => void) => () => void;
  send: (type: string, payload: unknown) => void;
  enabled?: boolean;
}

function isThemePayload(v: unknown): v is ThemeUpdatePayload {
  return (
    typeof v === 'object' &&
    v !== null &&
    typeof (v as ThemeUpdatePayload).themeId === 'string' &&
    typeof (v as ThemeUpdatePayload).variant === 'string'
  );
}

function getWailsEvents() {
  const w = window as Window & {
    wails?: {
      Events?: {
        Emit: (name: string, data: unknown) => void;
        On: (name: string, cb: (data: unknown) => void) => () => void;
      };
    };
  };
  return w.wails?.Events ?? null;
}

export function useThemeSync(options: UseThemeSyncOptions): { syncing: boolean } {
  const { subscribe, send, enabled = true } = options;
  const [syncing, setSyncing] = useState(false);
  const skipNextRef = useRef(false);

  // Subscribe to remote updates (WebSocket + Wails cross-window)
  useEffect(() => {
    if (!enabled) return;

    const handleRemoteUpdate = (payload: unknown) => {
      if (skipNextRef.current) {
        skipNextRef.current = false;
        return;
      }
      if (!isThemePayload(payload)) return;

      setSyncing(true);
      const { setColorTheme, setComponentVariant } = useThemeStore.getState();
      setColorTheme(payload.themeId);
      setComponentVariant(payload.variant as 'compact' | 'modern' | 'default');
      setSyncing(false);
    };

    const unsubWs = subscribe('theme.update', handleRemoteUpdate);

    const events = getWailsEvents();
    const unsubWails = events?.On('theme:update', handleRemoteUpdate);

    return () => {
      unsubWs();
      unsubWails?.();
    };
  }, [subscribe, enabled]);

  // Broadcast local changes to Wails + WebSocket
  useEffect(() => {
    if (!enabled) return;

    return useThemeStore.subscribe((state, prev) => {
      const changed =
        state.colorTheme !== prev.colorTheme ||
        state.componentVariant !== prev.componentVariant;
      if (!changed) return;

      const payload: ThemeUpdatePayload = {
        themeId: state.colorTheme,
        variant: state.componentVariant,
      };

      skipNextRef.current = true;
      send('theme.update', payload);

      const events = getWailsEvents();
      events?.Emit('theme:update', payload);
    });
  }, [send, enabled]);

  return { syncing };
}
