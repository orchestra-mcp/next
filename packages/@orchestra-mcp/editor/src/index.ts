// @orchestra-mcp/editor — Code editing components

export { CodeEditor, LegacyCodeEditor, CodeDiffEditor } from './CodeEditor';
export type {
  CodeEditorProps,
  CodeEditorBaseProps,
  MonacoEditorProps,
  KeybindingEntry,
  CodeDiffEditorProps,
} from './CodeEditor';

export { CodeBlock } from './CodeBlock';
export type { CodeBlockProps } from './CodeBlock';

export { GitDiffView, computeDiff } from './GitDiffView';
export type { GitDiffViewProps, DiffLine } from './GitDiffView';

export { MarkdownEditor } from './MarkdownEditor';
export type { MarkdownEditorProps } from './MarkdownEditor';

export { MarkdownRenderer } from './MarkdownRenderer';
export type { MarkdownRendererProps } from './MarkdownRenderer';

export { exportToImage } from './utils/exportToImage';

// Re-export utilities for advanced usage
export { resolveLanguage, languageFromFilename } from './CodeEditor/language-map';
export { orchestraToMonacoTheme, getMonacoThemeId } from './CodeEditor/theme-bridge';
// LSP types only — runtime exports not re-exported from barrel to avoid
// pulling monaco-languageclient into every consumer.
export type { LspConnection } from './CodeEditor/lsp-bridge';
export type { LspStatus, UseLspOptions, UseLspResult } from './CodeEditor/useLsp';
