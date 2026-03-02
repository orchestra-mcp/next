"use client";

import { MonacoSuspense, MonacoDiffEditor } from './MonacoLoader';
import { useMonacoTheme } from './useMonacoTheme';
import { resolveLanguage, languageFromFilename } from './language-map';
import './CodeEditor.css';

export interface CodeDiffEditorProps {
  original: string;
  modified: string;
  language?: string;
  fileName?: string;
  height?: number | string;
  readOnly?: boolean;
  renderSideBySide?: boolean;
  className?: string;
  loading?: React.ReactNode;
}

export const CodeDiffEditor = ({
  original,
  modified,
  language,
  fileName,
  height = 300,
  readOnly = true,
  renderSideBySide = false,
  className,
  loading,
}: CodeDiffEditorProps) => {
  const monacoTheme = useMonacoTheme();

  const resolvedLang = language
    ? resolveLanguage(language)
    : fileName
      ? languageFromFilename(fileName)
      : undefined;

  const heightStyle = typeof height === 'number' ? `${height}px` : height;
  const cls = ['code-editor', className].filter(Boolean).join(' ');

  return (
    <div className={cls}>
      <MonacoSuspense loading={loading}>
        <MonacoDiffEditor
          height={heightStyle}
          language={resolvedLang}
          original={original}
          modified={modified}
          theme={monacoTheme}
          options={{
            readOnly,
            renderSideBySide,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            lineNumbers: 'on',
            automaticLayout: true,
            padding: { top: 8, bottom: 8 },
          }}
        />
      </MonacoSuspense>
    </div>
  );
};
