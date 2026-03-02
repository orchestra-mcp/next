"use client";

import { useState, useCallback, useMemo } from 'react';
import { CodeEditor, CodeDiffEditor, languageFromFilename } from '@orchestra-mcp/editor';
import { BoxIcon } from '@orchestra-mcp/icons';
import './FileEditorPage.css';

export interface FileTab {
  id: string;
  filePath: string;
  content: string;
  originalContent?: string;
  language?: string;
  readOnly?: boolean;
  isDirty?: boolean;
}

export interface FileEditorPageProps {
  /** Open file tabs */
  tabs: FileTab[];
  /** Currently active tab ID */
  activeTabId: string;
  /** Called when user switches tabs */
  onSelectTab?: (tabId: string) => void;
  /** Called when user closes a tab */
  onCloseTab?: (tabId: string) => void;
  /** Called when file content changes */
  onChange?: (tabId: string, content: string) => void;
  /** Called when user clicks Save */
  onSave?: (tabId: string, content: string) => void;
  /** Called when user clicks Discard */
  onDiscard?: (tabId: string) => void;
  /** Called when user clicks back */
  onBack?: () => void;
  /** Show diff view for files with originalContent */
  diffMode?: boolean;
  className?: string;
}

function getFileName(filePath: string): string {
  const idx = filePath.lastIndexOf('/');
  return idx >= 0 ? filePath.substring(idx + 1) : filePath;
}

function fileIcon(path: string): string {
  const ext = path.split('.').pop()?.toLowerCase() ?? '';
  const map: Record<string, string> = {
    ts: 'bxl-typescript', tsx: 'bxl-typescript',
    js: 'bxl-javascript', jsx: 'bxl-javascript',
    go: 'bxl-go-lang', rs: 'bx-cog',
    py: 'bxl-python', css: 'bxl-css3',
    html: 'bxl-html5', json: 'bx-code-curly',
    md: 'bx-file', sql: 'bx-data',
  };
  return map[ext] ?? 'bx-file';
}

export const FileEditorPage = ({
  tabs,
  activeTabId,
  onSelectTab,
  onCloseTab,
  onChange,
  onSave,
  onDiscard,
  onBack,
  diffMode = false,
  className,
}: FileEditorPageProps) => {
  const [localDiff, setLocalDiff] = useState(diffMode);
  const activeTab = useMemo(() => tabs.find((t) => t.id === activeTabId), [tabs, activeTabId]);

  const handleChange = useCallback(
    (value: string) => {
      if (activeTab) onChange?.(activeTab.id, value);
    },
    [activeTab, onChange],
  );

  const handleSave = useCallback(() => {
    if (activeTab) onSave?.(activeTab.id, activeTab.content);
  }, [activeTab, onSave]);

  const handleDiscard = useCallback(() => {
    if (activeTab) onDiscard?.(activeTab.id);
  }, [activeTab, onDiscard]);

  const language = activeTab
    ? activeTab.language || languageFromFilename(activeTab.filePath)
    : undefined;

  const canDiff = activeTab?.originalContent !== undefined;
  const showDiff = localDiff && canDiff;

  return (
    <div className={`file-editor-page${className ? ` ${className}` : ''}`}>
      {/* Header with tabs */}
      <div className="file-editor-page__header">
        {onBack && (
          <button type="button" className="file-editor-page__back-btn" onClick={onBack}>
            <BoxIcon name="bx-arrow-back" size={16} />
          </button>
        )}

        <div className="file-editor-page__tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`file-editor-page__tab${tab.id === activeTabId ? ' file-editor-page__tab--active' : ''}`}
              onClick={() => onSelectTab?.(tab.id)}
              title={tab.filePath}
            >
              <BoxIcon name={fileIcon(tab.filePath)} size={12} />
              <span className="file-editor-page__tab-name">{getFileName(tab.filePath)}</span>
              {tab.isDirty && <span className="file-editor-page__tab-dirty" />}
              {onCloseTab && (
                <span
                  className="file-editor-page__tab-close"
                  onClick={(e) => { e.stopPropagation(); onCloseTab(tab.id); }}
                  role="button"
                  tabIndex={0}
                >
                  <BoxIcon name="bx-x" size={12} />
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="file-editor-page__actions">
          {canDiff && (
            <button
              type="button"
              className={`file-editor-page__action-btn${showDiff ? ' file-editor-page__action-btn--active' : ''}`}
              onClick={() => setLocalDiff((d) => !d)}
              title={showDiff ? 'Hide diff' : 'Show diff'}
            >
              <BoxIcon name="bx-git-compare" size={14} />
            </button>
          )}
          {onDiscard && activeTab?.isDirty && (
            <button type="button" className="file-editor-page__discard-btn" onClick={handleDiscard}>
              Discard
            </button>
          )}
          {onSave && (
            <button
              type="button"
              className="file-editor-page__save-btn"
              onClick={handleSave}
              disabled={!activeTab?.isDirty}
            >
              Save
            </button>
          )}
        </div>
      </div>

      {/* Breadcrumb */}
      {activeTab && (
        <div className="file-editor-page__breadcrumb">
          <span className="file-editor-page__path">{activeTab.filePath}</span>
          {language && <span className="file-editor-page__lang-badge">{language}</span>}
          {activeTab.readOnly && <span className="file-editor-page__readonly-badge">Read Only</span>}
        </div>
      )}

      {/* Editor area */}
      <div className="file-editor-page__editor">
        {activeTab ? (
          showDiff && activeTab.originalContent !== undefined ? (
            <CodeDiffEditor
              original={activeTab.originalContent}
              modified={activeTab.content}
              language={language}
              fileName={activeTab.filePath}
              height="100%"
              readOnly={activeTab.readOnly}
            />
          ) : (
            <CodeEditor
              value={activeTab.content}
              language={language}
              onChange={activeTab.readOnly ? undefined : handleChange}
              readOnly={activeTab.readOnly}
              height="100%"
              fileName={activeTab.filePath}
              minimap
              lineNumbers
            />
          )
        ) : (
          <div className="file-editor-page__empty">
            <BoxIcon name="bx-file" size={32} />
            <span>No file open</span>
          </div>
        )}
      </div>
    </div>
  );
};
