import type * as monacoNs from 'monaco-editor';

interface JBKeybinding {
  id: string;
  label: string;
  keybinding: (KM: typeof monacoNs.KeyMod, KC: typeof monacoNs.KeyCode) => number;
  run: (editor: monacoNs.editor.IStandaloneCodeEditor) => void;
}

/** JetBrains-style keybindings mapped to Monaco actions */
export const JETBRAINS_KEYMAP: JBKeybinding[] = [
  {
    id: 'jb-duplicate-line',
    label: 'Duplicate Line',
    keybinding: (KM, KC) => KM.CtrlCmd | KC.KeyD,
    run: (ed) => { ed.getAction('editor.action.copyLinesDownAction')?.run(); },
  },
  {
    id: 'jb-delete-line',
    label: 'Delete Line',
    keybinding: (KM, KC) => KM.CtrlCmd | KC.KeyY,
    run: (ed) => { ed.getAction('editor.action.deleteLines')?.run(); },
  },
  {
    id: 'jb-move-line-up',
    label: 'Move Line Up',
    keybinding: (KM, KC) => KM.CtrlCmd | KM.Shift | KC.UpArrow,
    run: (ed) => { ed.getAction('editor.action.moveLinesUpAction')?.run(); },
  },
  {
    id: 'jb-move-line-down',
    label: 'Move Line Down',
    keybinding: (KM, KC) => KM.CtrlCmd | KM.Shift | KC.DownArrow,
    run: (ed) => { ed.getAction('editor.action.moveLinesDownAction')?.run(); },
  },
  {
    id: 'jb-toggle-comment',
    label: 'Toggle Line Comment',
    keybinding: (KM, KC) => KM.CtrlCmd | KC.Slash,
    run: (ed) => { ed.getAction('editor.action.commentLine')?.run(); },
  },
  {
    id: 'jb-block-comment',
    label: 'Toggle Block Comment',
    keybinding: (KM, KC) => KM.CtrlCmd | KM.Shift | KC.Slash,
    run: (ed) => { ed.getAction('editor.action.blockComment')?.run(); },
  },
  {
    id: 'jb-format',
    label: 'Reformat Code',
    keybinding: (KM, KC) => KM.CtrlCmd | KM.Alt | KC.KeyL,
    run: (ed) => { ed.getAction('editor.action.formatDocument')?.run(); },
  },
  {
    id: 'jb-quick-fix',
    label: 'Show Quick Fixes',
    keybinding: (KM, KC) => KM.Alt | KC.Enter,
    run: (ed) => { ed.getAction('editor.action.quickFix')?.run(); },
  },
  {
    id: 'jb-go-to-declaration',
    label: 'Go to Declaration',
    keybinding: (KM, KC) => KM.CtrlCmd | KC.KeyB,
    run: (ed) => { ed.getAction('editor.action.revealDefinition')?.run(); },
  },
  {
    id: 'jb-complete-statement',
    label: 'Complete Statement',
    keybinding: (KM, KC) => KM.CtrlCmd | KM.Shift | KC.Enter,
    run: (ed) => { ed.getAction('editor.action.insertLineAfter')?.run(); },
  },
  {
    id: 'jb-select-word',
    label: 'Extend Selection',
    keybinding: (KM, KC) => KM.CtrlCmd | KC.KeyW,
    run: (ed) => { ed.getAction('editor.action.smartSelect.expand')?.run(); },
  },
  {
    id: 'jb-shrink-selection',
    label: 'Shrink Selection',
    keybinding: (KM, KC) => KM.CtrlCmd | KM.Shift | KC.KeyW,
    run: (ed) => { ed.getAction('editor.action.smartSelect.shrink')?.run(); },
  },
];

/** Apply JetBrains keybindings to a Monaco editor instance */
export function applyJetBrainsKeymap(
  editor: monacoNs.editor.IStandaloneCodeEditor,
  monaco: typeof monacoNs,
): void {
  for (const kb of JETBRAINS_KEYMAP) {
    editor.addAction({
      id: kb.id,
      label: kb.label,
      keybindings: [kb.keybinding(monaco.KeyMod, monaco.KeyCode)],
      run: kb.run,
    });
  }
}
