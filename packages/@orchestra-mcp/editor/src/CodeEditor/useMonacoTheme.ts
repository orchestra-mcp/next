"use client";

import { useEffect, useState, useRef } from 'react';
import { useMonaco } from '@monaco-editor/react';
import { THEMES, getColorTheme, onColorThemeChange } from '@orchestra-mcp/theme';
import { orchestraToMonacoTheme, getMonacoThemeId } from './theme-bridge';

/**
 * Registers all 26 Orchestra themes with Monaco and keeps the active
 * theme in sync when the user switches via setColorTheme().
 *
 * @param overrideTheme - Skip auto-sync and use this Monaco theme ID instead
 * @returns The current Monaco theme ID string
 */
export function useMonacoTheme(overrideTheme?: string): string {
  const monaco = useMonaco();
  const registered = useRef(false);
  const [themeId, setThemeId] = useState(
    () => overrideTheme ?? getMonacoThemeId(getColorTheme()),
  );

  // Register all Orchestra themes once Monaco is ready
  useEffect(() => {
    if (!monaco || registered.current) return;
    registered.current = true;

    for (const theme of THEMES) {
      monaco.editor.defineTheme(
        getMonacoThemeId(theme.id),
        orchestraToMonacoTheme(theme),
      );
    }

    const currentId = overrideTheme ?? getMonacoThemeId(getColorTheme());
    monaco.editor.setTheme(currentId);
    setThemeId(currentId);
  }, [monaco, overrideTheme]);

  // Listen for Orchestra theme changes and sync to Monaco
  useEffect(() => {
    if (overrideTheme || !monaco) return;

    const unsubscribe = onColorThemeChange((newId: string) => {
      const monacoId = getMonacoThemeId(newId);
      monaco.editor.setTheme(monacoId);
      setThemeId(monacoId);
    });

    return unsubscribe;
  }, [monaco, overrideTheme]);

  return themeId;
}
