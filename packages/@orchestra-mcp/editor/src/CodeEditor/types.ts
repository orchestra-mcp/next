import type * as monacoNs from 'monaco-editor';

/** Backward-compatible base props (same shape as old textarea CodeEditor) */
export interface CodeEditorBaseProps {
  /** Code content */
  value: string;
  /** Programming language for syntax highlighting */
  language?: string;
  /** Called when content changes */
  onChange?: (value: string) => void;
  /** Read-only mode */
  readOnly?: boolean;
  /** Show line numbers (default true) */
  lineNumbers?: boolean;
  /** Show minimap (default false) */
  minimap?: boolean;
  /** Word wrap mode */
  wordWrap?: 'off' | 'on' | 'wordWrapColumn' | 'bounded';
  /** Editor height in pixels or CSS value */
  height?: number | string;
  /** Tab size (default 2) */
  tabSize?: number;
  /** Font size in pixels (default 14) */
  fontSize?: number;
  /** Placeholder text when empty */
  placeholder?: string;
  /** File name for display in header */
  fileName?: string;
  /** Additional CSS class */
  className?: string;
}

/** Custom keybinding entry */
export interface KeybindingEntry {
  id: string;
  label: string;
  keybinding: number;
  handler: (editor: monacoNs.editor.IStandaloneCodeEditor) => void;
}

/** Monaco-specific advanced props */
export interface MonacoEditorProps {
  /** Called when Monaco editor mounts */
  onMount?: (
    editor: monacoNs.editor.IStandaloneCodeEditor,
    monaco: typeof monacoNs,
  ) => void;
  /** Called before Monaco mounts (register languages, themes, etc.) */
  beforeMount?: (monaco: typeof monacoNs) => void;
  /** Raw Monaco editor options (merged with computed options) */
  options?: monacoNs.editor.IStandaloneEditorConstructionOptions;
  /** Keybinding preset or custom array */
  keymap?: 'default' | 'jetbrains' | KeybindingEntry[];
  /** WebSocket URL for LSP server connection */
  lspUrl?: string;
  /** Called when LSP connection status changes */
  onLspStatusChange?: (status: 'disconnected' | 'connecting' | 'connected' | 'error') => void;
  /** Override auto-synced theme (Monaco theme ID) */
  theme?: string;
  /** Custom loading fallback while Monaco loads */
  loading?: React.ReactNode;
  /** Force legacy textarea fallback */
  useLegacy?: boolean;
}

/** Combined props for the CodeEditor component */
export type CodeEditorProps = CodeEditorBaseProps & MonacoEditorProps;
