"use client";

import { useState, useCallback, useRef } from 'react';
import { saveFile, uuidFilename } from '@orchestra-mcp/widgets';
import { tokenizeLine } from './highlighter';
import './CodeBlock.css';

export interface CodeBlockProps {
  /** Code string to display */
  code: string;
  /** Language name shown in header badge */
  language?: string;
  /** Show line numbers gutter (default true) */
  showLineNumbers?: boolean;
  /** 1-indexed line numbers to highlight */
  highlightLines?: number[];
  /** Show copy button (default true) */
  copyable?: boolean;
  /** Show export/download code as text file */
  exportable?: boolean;
  /** Show export-to-image button */
  exportImage?: boolean;
  /** Filename for download (defaults to code.{language}) */
  filename?: string;
  /** Max height in px before scrolling */
  maxHeight?: number;
  /** Enable word wrap (initial state) */
  wrapLines?: boolean;
  /** Show macOS-style window dots in header */
  showWindowDots?: boolean;
  /** Additional CSS class */
  className?: string;
}

const LANGUAGE_EXTENSIONS: Record<string, string> = {
  javascript: 'js', typescript: 'ts', python: 'py',
  ruby: 'rb', rust: 'rs', go: 'go', java: 'java',
  css: 'css', html: 'html', json: 'json', yaml: 'yml',
  bash: 'sh', shell: 'sh', sql: 'sql', markdown: 'md',
  php: 'php', csharp: 'cs', swift: 'swift', kotlin: 'kt',
};

/* Small SVG icons for action buttons */
const WrapIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 4h12M2 8h8a2 2 0 0 1 0 4H8l1.5-1.5M9.5 12L8 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CopyIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="5" y="5" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
    <path d="M11 3H4.5A1.5 1.5 0 0 0 3 4.5V11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3.5 8.5L6.5 11.5L12.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const DownloadIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 2v8m0 0L5 7m3 3l3-3M3 12h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ImageIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="6" cy="6" r="1.5" fill="currentColor" />
    <path d="M2 11l3-3 2 2 3-3 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const CodeBlock = ({
  code,
  language,
  showLineNumbers = false,
  highlightLines = [],
  copyable = true,
  exportable = false,
  exportImage = false,
  filename,
  maxHeight,
  wrapLines = false,
  showWindowDots = true,
  className,
}: CodeBlockProps) => {
  const [copied, setCopied] = useState(false);
  const [wrapped, setWrapped] = useState(wrapLines);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);
  const blockRef = useRef<HTMLDivElement>(null);

  const lines = code.split('\n');
  const highlightSet = new Set(highlightLines);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setCopied(false), 2000);
    });
  }, [code]);

  const handleExport = useCallback(async () => {
    const ext = language ? (LANGUAGE_EXTENSIONS[language] ?? language) : 'txt';
    const name = filename ?? uuidFilename('code', ext);
    await saveFile(code, name, 'text/plain');
  }, [code, language, filename]);

  const handleExportImage = useCallback(async () => {
    if (!blockRef.current) return;
    const { exportToImage } = await import('../utils/exportToImage');
    const name = filename ?? `code-${language ?? 'snippet'}`;
    await exportToImage(blockRef.current, name);
  }, [filename, language]);

  const handleToggleWrap = useCallback(() => {
    setWrapped((prev) => !prev);
  }, []);

  const showHeader = language || copyable || exportable || exportImage;
  const bodyStyle = maxHeight ? { maxHeight: `${maxHeight}px` } : undefined;
  const wrapperClass = ['code-block', className].filter(Boolean).join(' ');

  return (
    <div className={wrapperClass} ref={blockRef}>
      {showHeader && (
        <div className="code-block__header">
          <div className="code-block__header-left">
            {showWindowDots && (
              <div className="code-block__dots" aria-hidden="true">
                <span className="code-block__dot code-block__dot--red" />
                <span className="code-block__dot code-block__dot--yellow" />
                <span className="code-block__dot code-block__dot--green" />
              </div>
            )}
            {language && (
              <span className="code-block__badge">{language}</span>
            )}
          </div>
          <div className="code-block__actions">
            <button
              type="button"
              className="code-block__btn"
              onClick={handleToggleWrap}
              title={wrapped ? 'Disable word wrap' : 'Enable word wrap'}
              aria-label="Toggle word wrap"
            >
              <WrapIcon />
            </button>
            {copyable && (
              <button
                type="button"
                className={`code-block__btn ${copied ? 'code-block__btn--copied' : ''}`}
                onClick={handleCopy}
                aria-label="Copy code"
              >
                {copied ? <CheckIcon /> : <CopyIcon />}
              </button>
            )}
            {exportable && (
              <button
                type="button"
                className="code-block__btn"
                onClick={handleExport}
                aria-label="Download code"
              >
                <DownloadIcon />
              </button>
            )}
            {exportImage && (
              <button
                type="button"
                className="code-block__btn"
                onClick={handleExportImage}
                aria-label="Export as image"
              >
                <ImageIcon />
              </button>
            )}
          </div>
        </div>
      )}
      <div
        className={[
          'code-block__body',
          maxHeight ? 'code-block__body--scrollable' : '',
        ].filter(Boolean).join(' ')}
        style={bodyStyle}
      >
        {showLineNumbers && (
          <div className="code-block__gutter" aria-hidden="true">
            {lines.map((_, i) => (
              <div key={i} className="code-block__line-number">
                {i + 1}
              </div>
            ))}
          </div>
        )}
        <pre className={`code-block__code ${wrapped ? 'code-block__code--wrapped' : ''}`}>
          <code>
            {lines.map((line, i) => (
              <div
                key={i}
                className={[
                  'code-block__line',
                  highlightSet.has(i + 1) ? 'code-block__line--highlighted' : '',
                ].filter(Boolean).join(' ')}
              >
                {language
                  ? tokenizeLine(line, language).map((tok, j) =>
                      tok.className
                        ? <span key={j} className={tok.className}>{tok.text}</span>
                        : <span key={j}>{tok.text}</span>
                    )
                  : (line || '\n')
                }
              </div>
            ))}
          </code>
        </pre>
      </div>
    </div>
  );
};
