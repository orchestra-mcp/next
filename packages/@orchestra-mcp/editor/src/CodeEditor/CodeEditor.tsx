"use client";

import { useRef, useCallback, useState } from 'react';
import { MonacoSuspense, MonacoEditor } from './MonacoLoader';
import { LegacyCodeEditor } from './LegacyCodeEditor';
import { useMonacoTheme } from './useMonacoTheme';
import { useMonacoKeybindings } from './useMonacoKeybindings';
import { useLsp } from './useLsp';
import { resolveLanguage, languageFromFilename } from './language-map';
import type { CodeEditorProps } from './types';
import type * as monacoNs from 'monaco-editor';
import './CodeEditor.css';

// Inner component that always calls hooks unconditionally
function MonacoCodeEditor(props: CodeEditorProps) {
  const {
    value,
    language,
    onChange,
    readOnly = false,
    lineNumbers = true,
    minimap = false,
    wordWrap = 'off',
    height = 400,
    tabSize = 2,
    fontSize = 14,
    fileName,
    className,
    onMount,
    beforeMount,
    options,
    keymap,
    lspUrl,
    onLspStatusChange,
    theme: themeOverride,
    loading,
  } = props;

  const editorRef = useRef<monacoNs.editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<typeof monacoNs | null>(null);
  const [cursorInfo, setCursorInfo] = useState({ line: 1, col: 1 });

  const monacoTheme = useMonacoTheme(themeOverride);
  useMonacoKeybindings(editorRef.current, monacoRef.current, keymap);

  const resolvedLang = language
    ? resolveLanguage(language)
    : fileName
      ? languageFromFilename(fileName)
      : undefined;

  const { status: lspStatus } = useLsp({
    monaco: monacoRef.current,
    editor: editorRef.current,
    languageId: resolvedLang,
    lspUrl,
    onStatusChange: onLspStatusChange,
  });

  const handleMount = useCallback(
    (editor: monacoNs.editor.IStandaloneCodeEditor, monaco: typeof monacoNs) => {
      editorRef.current = editor;
      monacoRef.current = monaco;

      editor.onDidChangeCursorPosition((e) => {
        setCursorInfo({ line: e.position.lineNumber, col: e.position.column });
      });

      onMount?.(editor, monaco);
    },
    [onMount],
  );

  const handleChange = useCallback(
    (val: string | undefined) => {
      onChange?.(val ?? '');
    },
    [onChange],
  );

  const heightStyle = typeof height === 'number' ? `${height}px` : height;
  const cls = ['code-editor', className].filter(Boolean).join(' ');

  const mergedOptions: monacoNs.editor.IStandaloneEditorConstructionOptions = {
    readOnly,
    lineNumbers: lineNumbers ? 'on' : 'off',
    minimap: { enabled: minimap },
    wordWrap,
    tabSize,
    fontSize,
    scrollBeyondLastLine: false,
    automaticLayout: true,
    padding: { top: 8, bottom: 8 },
    contextmenu: true,
    find: { addExtraSpaceOnTop: false, autoFindInSelection: 'multiline' },
    suggest: { showMethods: true, showFunctions: true, showSnippets: true },
    ...options,
  };

  return (
    <div className={cls}>
      {fileName && (
        <div className="code-editor__header">
          <span className="code-editor__filename">{fileName}</span>
          {resolvedLang && <span className="code-editor__badge">{resolvedLang}</span>}
        </div>
      )}
      <MonacoSuspense loading={loading}>
        <MonacoEditor
          height={heightStyle}
          language={resolvedLang}
          value={value}
          theme={monacoTheme}
          options={mergedOptions}
          onChange={handleChange}
          onMount={handleMount}
          beforeMount={beforeMount}
        />
      </MonacoSuspense>
      <div className="code-editor__footer">
        <span className="code-editor__cursor-info">
          Ln {cursorInfo.line}, Col {cursorInfo.col}
        </span>
        {resolvedLang && <span className="code-editor__language">{resolvedLang}</span>}
        {readOnly && <span className="code-editor__readonly">Read Only</span>}
        {lspUrl && (
          <span className={`code-editor__lsp code-editor__lsp--${lspStatus}`}>
            {lspStatus === 'connected' ? 'LSP' : lspStatus === 'connecting' ? 'LSP...' : lspStatus === 'error' ? 'LSP ✗' : ''}
          </span>
        )}
      </div>
    </div>
  );
}

export const CodeEditor = (props: CodeEditorProps) => {
  if (props.useLegacy) {
    const {
      onMount: _onMount,
      beforeMount: _beforeMount,
      options: _options,
      keymap: _keymap,
      lspUrl: _lspUrl,
      onLspStatusChange: _onLspStatusChange,
      theme: _theme,
      loading: _loading,
      useLegacy: _,
      ...legacyProps
    } = props;
    return <LegacyCodeEditor {...legacyProps} />;
  }

  return <MonacoCodeEditor {...props} />;
};
