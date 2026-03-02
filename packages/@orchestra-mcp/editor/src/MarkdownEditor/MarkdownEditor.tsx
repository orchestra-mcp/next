"use client";

import { useRef, useCallback, useMemo } from 'react';
import { MarkdownRenderer } from '../MarkdownRenderer';
import './MarkdownEditor.css';

export interface MarkdownEditorProps {
  /** Current markdown text */
  value: string;
  /** Called when text changes */
  onChange: (value: string) => void;
  /** Placeholder for empty textarea */
  placeholder?: string;
  /** Disable editing */
  readOnly?: boolean;
  /** Hide the live preview pane (show source only) */
  hidePreview?: boolean;
  /** Additional CSS class */
  className?: string;
}

interface ToolbarAction {
  label: string;
  title: string;
  action: () => void;
}

export const MarkdownEditor = ({
  value,
  onChange,
  placeholder,
  readOnly = false,
  hidePreview = false,
  className,
}: MarkdownEditorProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const wrapSelection = useCallback(
    (before: string, after: string) => {
      const ta = textareaRef.current;
      if (!ta) return;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const selected = value.slice(start, end);
      const newValue =
        value.slice(0, start) + before + selected + after + value.slice(end);
      onChange(newValue);
      requestAnimationFrame(() => {
        ta.focus();
        ta.selectionStart = start + before.length;
        ta.selectionEnd = end + before.length;
      });
    },
    [value, onChange]
  );

  const insertLinePrefix = useCallback(
    (prefix: string) => {
      const ta = textareaRef.current;
      if (!ta) return;
      const pos = ta.selectionStart;
      const lineStart = value.lastIndexOf('\n', pos - 1) + 1;
      const newValue =
        value.slice(0, lineStart) + prefix + value.slice(lineStart);
      onChange(newValue);
      requestAnimationFrame(() => {
        ta.focus();
        ta.selectionStart = pos + prefix.length;
        ta.selectionEnd = pos + prefix.length;
      });
    },
    [value, onChange]
  );

  const handleBold = useCallback(() => wrapSelection('**', '**'), [wrapSelection]);
  const handleItalic = useCallback(() => wrapSelection('*', '*'), [wrapSelection]);
  const handleLink = useCallback(() => wrapSelection('[', '](url)'), [wrapSelection]);
  const handleHeading = useCallback(() => insertLinePrefix('## '), [insertLinePrefix]);
  const handleUl = useCallback(() => insertLinePrefix('- '), [insertLinePrefix]);
  const handleOl = useCallback(() => insertLinePrefix('1. '), [insertLinePrefix]);

  const handleCode = useCallback(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    const selected = value.slice(ta.selectionStart, ta.selectionEnd);
    if (selected.includes('\n')) {
      wrapSelection('```\n', '\n```');
    } else {
      wrapSelection('`', '`');
    }
  }, [value, wrapSelection]);

  const toolbarActions: ToolbarAction[] = useMemo(
    () => [
      { label: 'B', title: 'Bold (Ctrl+B)', action: handleBold },
      { label: 'I', title: 'Italic (Ctrl+I)', action: handleItalic },
      { label: 'H', title: 'Heading', action: handleHeading },
      { label: 'UL', title: 'Unordered list', action: handleUl },
      { label: 'OL', title: 'Ordered list', action: handleOl },
      { label: '<>', title: 'Code', action: handleCode },
      { label: 'Link', title: 'Link (Ctrl+K)', action: handleLink },
    ],
    [handleBold, handleItalic, handleHeading, handleUl, handleOl, handleCode, handleLink]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      const mod = e.metaKey || e.ctrlKey;
      if (!mod) return;
      if (e.key === 'b') { e.preventDefault(); handleBold(); }
      else if (e.key === 'i') { e.preventDefault(); handleItalic(); }
      else if (e.key === 'k') { e.preventDefault(); handleLink(); }
    },
    [handleBold, handleItalic, handleLink]
  );

  const wordCount = useMemo(() => {
    return value.trim().split(/\s+/).filter(Boolean).length;
  }, [value]);

  const readingTime = useMemo(() => {
    return Math.max(1, Math.ceil(wordCount / 200));
  }, [wordCount]);

  const wrapperClass = ['md-editor', className].filter(Boolean).join(' ');

  return (
    <div className={wrapperClass}>
      <div className="md-editor__toolbar" role="toolbar" aria-label="Formatting">
        {toolbarActions.map((btn) => (
          <button
            key={btn.label}
            type="button"
            className="md-editor__toolbar-btn"
            title={btn.title}
            disabled={readOnly}
            onClick={btn.action}
          >
            {btn.label}
          </button>
        ))}
      </div>
      <div className="md-editor__body">
        <div className="md-editor__source">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            readOnly={readOnly}
            aria-label="Markdown source"
          />
        </div>
        {!hidePreview && (
          <>
            <div className="md-editor__divider" />
            <div className="md-editor__preview">
              <MarkdownRenderer content={value} />
            </div>
          </>
        )}
      </div>
      <div className="md-editor__footer">
        <span data-testid="word-count">{wordCount} words</span>
        <span data-testid="reading-time">{readingTime} min read</span>
      </div>
    </div>
  );
};
