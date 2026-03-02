"use client";

import { useState, useCallback, useRef } from 'react';
import type { FC, ReactElement } from 'react';
import { CardBase } from './CardBase';
import { buildSrcdoc } from '../Preview/PreviewFrame';
import { PreviewFrame } from '../Preview/PreviewFrame';
import type { PreviewCode } from '../Preview/PreviewFrame';
import { CodeEditor } from '@orchestra-mcp/editor';
import './SmartComponentCard.css';

export interface SmartComponentCardData {
  id: string;
  name: string;
  framework: string;
  description?: string;
  html?: string;
  css?: string;
  js?: string;
  jsx?: string;
  tags?: string[];
  version?: number;
}

export interface SmartComponentCardProps {
  data: SmartComponentCardData;
  className?: string;
  onEdit?: (id: string) => void;
  onExport?: (id: string) => void;
  onSave?: (id: string, code: { html?: string; css?: string; js?: string; jsx?: string }) => void;
}

function normalizeFramework(framework: string): PreviewCode['framework'] {
  const map: Record<string, PreviewCode['framework']> = {
    html: 'html',
    react: 'react',
    vue: 'vue',
    svelte: 'svelte',
    angular: 'angular',
  };
  return map[framework?.toLowerCase()] ?? 'html';
}

function getFrameworkBadgeColor(
  framework: string,
): 'info' | 'success' | 'gray' | 'warning' | 'danger' {
  const map: Record<string, 'info' | 'success' | 'gray' | 'warning' | 'danger'> = {
    react: 'info',
    vue: 'success',
    html: 'gray',
    svelte: 'warning',
    angular: 'danger',
  };
  return map[framework?.toLowerCase()] ?? 'gray';
}

function PaletteIcon(): ReactElement {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="5.5" cy="7" r="1" fill="currentColor" />
      <circle cx="8" cy="5.5" r="1" fill="currentColor" />
      <circle cx="10.5" cy="7" r="1" fill="currentColor" />
      <path
        d="M5.5 10.5c.5 1 4.5 1 5 0"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PencilIcon(): ReactElement {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M11.5 2.5a1.414 1.414 0 0 1 2 2L5 13H3v-2L11.5 2.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DownloadIcon(): ReactElement {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M8 2v8M5 7l3 3 3-3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3 12h10"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ExternalLinkIcon(): ReactElement {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M6 3H3a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1v-3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M10 2h4m0 0v4m0-4L8 8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CodeIcon(): ReactElement {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M5 4L1 8l4 4M11 4l4 4-4 4M9 2l-2 12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

type EditTab = 'html' | 'css' | 'js' | 'jsx';

export const SmartComponentCard: FC<SmartComponentCardProps> = ({
  data,
  className,
  onEdit,
  onExport,
  onSave,
}) => {
  const [srcdoc] = useState<string>(() => {
    const previewCode: PreviewCode = {
      framework: normalizeFramework(data.framework),
      html: data.html,
      css: data.css,
      js: data.js,
      jsx: data.jsx,
    };
    return buildSrcdoc(previewCode);
  });

  // Editor open/close state
  const [editorOpen, setEditorOpen] = useState(false);

  // Edit state for each code type
  const [editHtml, setEditHtml] = useState(data.html ?? '');
  const [editCss, setEditCss] = useState(data.css ?? '');
  const [editJs, setEditJs] = useState(data.js ?? '');
  const [editJsx, setEditJsx] = useState(data.jsx ?? '');

  // Refs mirror state so the debounced callback always reads current values
  const editHtmlRef = useRef(data.html ?? '');
  const editCssRef = useRef(data.css ?? '');
  const editJsRef = useRef(data.js ?? '');
  const editJsxRef = useRef(data.jsx ?? '');

  const [activeEditTab, setActiveEditTab] = useState<EditTab>(() => {
    if (data.framework === 'react' || data.jsx) return 'jsx';
    if (data.html) return 'html';
    return 'js';
  });

  const [previewCode, setPreviewCode] = useState<PreviewCode>(() => ({
    framework: normalizeFramework(data.framework),
    html: data.html,
    css: data.css,
    js: data.js,
    jsx: data.jsx,
  }));

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Determine which tabs to show
  const isReact = data.framework?.toLowerCase() === 'react' || Boolean(data.jsx);
  const showJsx = isReact;
  const showHtml = !isReact && Boolean(data.html != null || data.framework?.toLowerCase() === 'html');
  const showCss = true;
  const showJs = !isReact;

  const handleCodeChange = useCallback(
    (val: string) => {
      // Update both state and ref for the active tab
      if (activeEditTab === 'jsx') {
        setEditJsx(val);
        editJsxRef.current = val;
      } else if (activeEditTab === 'html') {
        setEditHtml(val);
        editHtmlRef.current = val;
      } else if (activeEditTab === 'css') {
        setEditCss(val);
        editCssRef.current = val;
      } else {
        setEditJs(val);
        editJsRef.current = val;
      }

      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        setPreviewCode({
          framework: normalizeFramework(data.framework),
          html: editHtmlRef.current || undefined,
          css: editCssRef.current || undefined,
          js: editJsRef.current || undefined,
          jsx: editJsxRef.current || undefined,
        });
      }, 300);
    },
    [activeEditTab, data.framework],
  );

  const handleCancel = useCallback(() => {
    setEditHtml(data.html ?? '');
    setEditCss(data.css ?? '');
    setEditJs(data.js ?? '');
    setEditJsx(data.jsx ?? '');
    editHtmlRef.current = data.html ?? '';
    editCssRef.current = data.css ?? '';
    editJsRef.current = data.js ?? '';
    editJsxRef.current = data.jsx ?? '';
    setPreviewCode({
      framework: normalizeFramework(data.framework),
      html: data.html,
      css: data.css,
      js: data.js,
      jsx: data.jsx,
    });
    setEditorOpen(false);
  }, [data]);

  const handleSave = useCallback(() => {
    onSave?.(data.id, {
      html: editHtml || undefined,
      css: editCss || undefined,
      js: editJs || undefined,
      jsx: editJsx || undefined,
    });
    setEditorOpen(false);
  }, [onSave, data.id, editHtml, editCss, editJs, editJsx]);

  const frameworkLabel =
    data.framework.charAt(0).toUpperCase() + data.framework.slice(1);
  const badgeColor = getFrameworkBadgeColor(data.framework);

  const handleEdit = useCallback(() => {
    if (onEdit) {
      onEdit(data.id);
    } else {
      window.location.href = `/panels/component-editor?id=${data.id}`;
    }
  }, [onEdit, data.id]);

  const handleExport = useCallback(() => {
    onExport?.(data.id);
  }, [onExport, data.id]);

  const handleOpenInBrowser = useCallback(() => {
    const blob = new Blob([srcdoc], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank', 'noopener,noreferrer');
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  }, [srcdoc]);

  // Derive editor value for active tab
  const editorValue =
    activeEditTab === 'jsx' ? editJsx
    : activeEditTab === 'html' ? editHtml
    : activeEditTab === 'css' ? editCss
    : editJs;

  const editorLanguage =
    activeEditTab === 'jsx' ? 'typescript'
    : activeEditTab === 'css' ? 'css'
    : activeEditTab === 'html' ? 'html'
    : 'javascript';

  const headerActions = (
    <div className="smart-component-card__header-actions">
      <button
        type="button"
        className="card-base__action-btn"
        onClick={handleEdit}
        title="Edit component"
        aria-label="Edit component"
      >
        <PencilIcon />
      </button>
      <button
        type="button"
        className="card-base__action-btn"
        onClick={handleExport}
        title="Export component"
        aria-label="Export component"
      >
        <DownloadIcon />
      </button>
      <button
        type="button"
        className={`card-base__action-btn${editorOpen ? ' card-base__action-btn--active' : ''}`}
        onClick={() => setEditorOpen((o) => !o)}
        title={editorOpen ? 'Close editor' : 'Edit inline'}
        aria-label={editorOpen ? 'Close inline editor' : 'Edit inline'}
        aria-pressed={editorOpen}
      >
        <CodeIcon />
      </button>
      <button
        type="button"
        className="card-base__action-btn"
        onClick={handleOpenInBrowser}
        title="Open in browser"
        aria-label="Open component in browser"
      >
        <ExternalLinkIcon />
      </button>
    </div>
  );

  return (
    <CardBase
      title={data.name}
      icon={<PaletteIcon />}
      badge={frameworkLabel}
      badgeColor={badgeColor}
      defaultCollapsed={false}
      headerActions={headerActions}
      className={`smart-component-card${className ? ` ${className}` : ''}`}
    >
      <div className="smart-component-card__body">
        <div className="smart-component-card__thumbnail">
          <iframe
            srcDoc={srcdoc}
            sandbox="allow-scripts"
            title={`${data.name} thumbnail`}
            aria-hidden="true"
            tabIndex={-1}
          />
        </div>
        <div className="smart-component-card__info">
          <h3 className="smart-component-card__name">{data.name}</h3>
          {data.description && (
            <p className="smart-component-card__description">{data.description}</p>
          )}
          {data.tags && data.tags.length > 0 && (
            <div className="smart-component-card__tags">
              {data.tags.map((tag) => (
                <span key={tag} className="smart-component-card__tag">
                  {tag}
                </span>
              ))}
            </div>
          )}
          <div className="smart-component-card__meta">
            {data.version != null && <span>v{data.version}</span>}
            {data.version != null && <span className="smart-component-card__meta-sep"> · </span>}
            <span>ID: {data.id.slice(0, 8)}</span>
          </div>
        </div>
      </div>

      {editorOpen && (
        <div className="smart-component-card__editor-pane">
          <div className="smart-component-card__editor-tabs">
            {showJsx && (
              <button
                type="button"
                className={activeEditTab === 'jsx' ? 'active' : ''}
                onClick={() => setActiveEditTab('jsx')}
              >
                JSX
              </button>
            )}
            {showHtml && (
              <button
                type="button"
                className={activeEditTab === 'html' ? 'active' : ''}
                onClick={() => setActiveEditTab('html')}
              >
                HTML
              </button>
            )}
            {showCss && (
              <button
                type="button"
                className={activeEditTab === 'css' ? 'active' : ''}
                onClick={() => setActiveEditTab('css')}
              >
                CSS
              </button>
            )}
            {showJs && (
              <button
                type="button"
                className={activeEditTab === 'js' ? 'active' : ''}
                onClick={() => setActiveEditTab('js')}
              >
                JS
              </button>
            )}
          </div>
          <div className="smart-component-card__editor-split">
            <div className="smart-component-card__editor-monaco">
              <CodeEditor
                key={activeEditTab}
                value={editorValue}
                language={editorLanguage}
                onChange={handleCodeChange}
                height={240}
                lineNumbers={false}
                minimap={false}
                fontSize={12}
              />
            </div>
            <div className="smart-component-card__editor-preview">
              <PreviewFrame
                code={previewCode}
                className="smart-component-card__editor-frame"
              />
            </div>
          </div>
          <div className="smart-component-card__editor-actions">
            <button
              type="button"
              className="smart-component-card__save-btn"
              onClick={handleSave}
            >
              Save changes
            </button>
            <button
              type="button"
              className="smart-component-card__cancel-btn"
              onClick={handleCancel}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </CardBase>
  );
};
