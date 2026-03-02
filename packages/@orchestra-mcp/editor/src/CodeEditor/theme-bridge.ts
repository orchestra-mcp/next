import type { Theme, ThemeColors, SyntaxColors } from '@orchestra-mcp/theme';
import type * as monacoNs from 'monaco-editor';

/** Convert an Orchestra Theme to a Monaco IStandaloneThemeData */
export function orchestraToMonacoTheme(
  theme: Theme,
): monacoNs.editor.IStandaloneThemeData {
  return {
    base: theme.isLight ? 'vs' : 'vs-dark',
    inherit: true,
    rules: buildTokenRules(theme.syntax),
    colors: buildEditorColors(theme.colors),
  };
}

function buildTokenRules(
  s: SyntaxColors,
): monacoNs.editor.ITokenThemeRule[] {
  return [
    { token: 'keyword', foreground: strip(s.purple) },
    { token: 'keyword.control', foreground: strip(s.purple) },
    { token: 'storage.type', foreground: strip(s.purple) },
    { token: 'string', foreground: strip(s.green) },
    { token: 'string.quoted', foreground: strip(s.green) },
    { token: 'string.escape', foreground: strip(s.orange) },
    { token: 'constant.numeric', foreground: strip(s.orange) },
    { token: 'constant.language', foreground: strip(s.orange) },
    { token: 'number', foreground: strip(s.orange) },
    { token: 'entity.name.function', foreground: strip(s.blue) },
    { token: 'support.function', foreground: strip(s.blue) },
    { token: 'variable.parameter', foreground: strip(s.cyan) },
    { token: 'punctuation', foreground: strip(s.cyan) },
    { token: 'delimiter', foreground: strip(s.cyan) },
    { token: 'entity.name.type', foreground: strip(s.yellow) },
    { token: 'entity.name.class', foreground: strip(s.yellow) },
    { token: 'support.type', foreground: strip(s.yellow) },
    { token: 'type', foreground: strip(s.yellow) },
    { token: 'attribute.name', foreground: strip(s.yellow) },
    { token: 'attribute.value', foreground: strip(s.green) },
    { token: 'tag', foreground: strip(s.red) },
    { token: 'invalid', foreground: strip(s.red) },
    { token: 'invalid.illegal', foreground: strip(s.red) },
    { token: 'variable.language', foreground: strip(s.red) },
    { token: 'regexp', foreground: strip(s.red) },
    { token: 'comment', foreground: strip(s.teal), fontStyle: 'italic' },
    { token: 'entity.other.attribute-name', foreground: strip(s.teal) },
    { token: 'invalid.deprecated', foreground: strip(s.error) },
  ];
}

function buildEditorColors(c: ThemeColors): Record<string, string> {
  return {
    'editor.background': c.bg,
    'editor.foreground': c.fg,
    'editor.lineHighlightBackground': c.bgActive,
    'editor.selectionBackground': c.bgSelection,
    'editorCursor.foreground': c.accent,
    'editorLineNumber.foreground': c.fgMuted,
    'editorLineNumber.activeForeground': c.fgBright,
    'editorGutter.background': c.bgAlt,
    'editorWidget.background': c.bgAlt,
    'editorWidget.border': c.border,
    'editorGroup.border': c.border,
    'focusBorder': c.accent,
    'input.background': c.bgContrast,
    'input.foreground': c.fg,
    'input.border': c.border,
    'dropdown.background': c.bgAlt,
    'dropdown.border': c.border,
    'list.hoverBackground': c.bgActive,
    'list.activeSelectionBackground': c.bgSelection,
    'minimap.background': c.bgAlt,
    'scrollbarSlider.background': c.bgActive + '80',
    'scrollbarSlider.hoverBackground': c.bgActive,
  };
}

/** Strip '#' prefix for Monaco hex format */
function strip(hex: string): string {
  return hex.replace(/^#/, '');
}

/** Get Monaco theme ID from Orchestra theme ID */
export function getMonacoThemeId(orchestraId: string): string {
  return `orchestra-${orchestraId}`;
}
