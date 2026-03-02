"use client";

import { useEffect } from 'react';
import type * as monacoNs from 'monaco-editor';
import { applyJetBrainsKeymap } from './jetbrains-keymap';
import type { KeybindingEntry } from './types';

/**
 * Applies keybinding presets or custom keybindings to a Monaco editor.
 * Runs once when editor/monaco refs become available.
 */
export function useMonacoKeybindings(
  editor: monacoNs.editor.IStandaloneCodeEditor | null,
  monaco: typeof monacoNs | null,
  keymap?: 'default' | 'jetbrains' | KeybindingEntry[],
): void {
  useEffect(() => {
    if (!editor || !monaco || !keymap || keymap === 'default') return;

    if (keymap === 'jetbrains') {
      applyJetBrainsKeymap(editor, monaco);
      return;
    }

    if (Array.isArray(keymap)) {
      for (const entry of keymap) {
        editor.addAction({
          id: entry.id,
          label: entry.label,
          keybindings: [entry.keybinding],
          run: entry.handler,
        });
      }
    }
  }, [editor, monaco, keymap]);
}
