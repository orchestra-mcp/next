"use client";

import { useRef, useEffect, useCallback, useState } from 'react';
import type { CodeEditorBaseProps } from './types';
import './CodeEditor.css';

export interface LegacyCodeEditorProps extends CodeEditorBaseProps {
  onMount?: (editor: HTMLTextAreaElement) => void;
}

/** Lightweight textarea-based code editor (legacy fallback) */
export const LegacyCodeEditor = ({
  value,
  language,
  onChange,
  readOnly = false,
  lineNumbers = true,
  height = 400,
  tabSize = 2,
  fontSize = 14,
  placeholder,
  fileName,
  className,
  onMount,
}: LegacyCodeEditorProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineCountRef = useRef<HTMLDivElement>(null);
  const [lineCount, setLineCount] = useState(1);
  const [cursorInfo, setCursorInfo] = useState({ line: 1, col: 1 });

  useEffect(() => {
    const count = (value || '').split('\n').length;
    setLineCount(count);
  }, [value]);

  useEffect(() => {
    if (textareaRef.current && onMount) {
      onMount(textareaRef.current);
    }
  }, [onMount]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChange?.(e.target.value);
    },
    [onChange],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        const textarea = e.currentTarget;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const spaces = ' '.repeat(tabSize);
        const newValue = value.substring(0, start) + spaces + value.substring(end);
        onChange?.(newValue);
        requestAnimationFrame(() => {
          textarea.selectionStart = textarea.selectionEnd = start + tabSize;
        });
      }
    },
    [value, onChange, tabSize],
  );

  const handleSelect = useCallback(() => {
    if (!textareaRef.current) return;
    const pos = textareaRef.current.selectionStart;
    const textBefore = value.substring(0, pos);
    const line = textBefore.split('\n').length;
    const col = pos - textBefore.lastIndexOf('\n');
    setCursorInfo({ line, col });
  }, [value]);

  const handleScroll = useCallback(() => {
    if (textareaRef.current && lineCountRef.current) {
      lineCountRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  }, []);

  const heightStyle = typeof height === 'number' ? `${height}px` : height;
  const cls = ['code-editor', 'code-editor--legacy', className].filter(Boolean).join(' ');

  return (
    <div className={cls} style={{ '--editor-height': heightStyle, '--editor-font-size': `${fontSize}px` } as React.CSSProperties}>
      {fileName && (
        <div className="code-editor__header">
          <span className="code-editor__filename">{fileName}</span>
          {language && <span className="code-editor__badge">{language}</span>}
        </div>
      )}
      <div className="code-editor__body">
        {lineNumbers && (
          <div className="code-editor__gutter" ref={lineCountRef} aria-hidden="true">
            {Array.from({ length: lineCount }, (_, i) => (
              <div key={i} className="code-editor__line-number">
                {i + 1}
              </div>
            ))}
          </div>
        )}
        <textarea
          ref={textareaRef}
          className="code-editor__textarea"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onSelect={handleSelect}
          onScroll={handleScroll}
          readOnly={readOnly}
          placeholder={placeholder}
          spellCheck={false}
          autoCapitalize="off"
          autoComplete="off"
          autoCorrect="off"
          data-language={language}
        />
      </div>
      <div className="code-editor__footer">
        <span className="code-editor__cursor-info">
          Ln {cursorInfo.line}, Col {cursorInfo.col}
        </span>
        {language && <span className="code-editor__language">{language}</span>}
        {readOnly && <span className="code-editor__readonly">Read Only</span>}
      </div>
    </div>
  );
};
