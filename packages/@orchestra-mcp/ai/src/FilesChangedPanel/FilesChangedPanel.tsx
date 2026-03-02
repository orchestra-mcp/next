import { useState, useMemo, useCallback } from 'react';
import type { EditEvent, CreateEvent, ClaudeCodeEvent } from '../types/events';
import { CodeDiffEditor, languageFromFilename } from '@orchestra-mcp/editor';
import { BoxIcon } from '@orchestra-mcp/icons';
import './FilesChangedPanel.css';

export interface FileChange {
  id: string;
  filePath: string;
  type: 'edit' | 'create';
  language?: string;
  /** For edits: original content */
  original?: string;
  /** For edits: modified content */
  modified?: string;
  /** For creates: new file content */
  content?: string;
  /** Lines added */
  additions: number;
  /** Lines removed */
  deletions: number;
  status?: string;
}

export interface FilesChangedPanelProps {
  /** All events from the current session messages */
  events: ClaudeCodeEvent[];
  /** Called when user accepts a single file change */
  onAccept?: (fileChange: FileChange) => void;
  /** Called when user rejects a single file change */
  onReject?: (fileChange: FileChange) => void;
  /** Called when user accepts all changes */
  onAcceptAll?: () => void;
  /** Called when user dismisses/closes the panel */
  onDismiss?: () => void;
  className?: string;
}

/** Count added/removed lines from a diff */
function countChanges(original: string, modified: string): { additions: number; deletions: number } {
  const origLines = original.split('\n');
  const modLines = modified.split('\n');
  const origSet = new Set(origLines);
  const modSet = new Set(modLines);
  let additions = 0;
  let deletions = 0;
  for (const line of modLines) {
    if (!origSet.has(line)) additions++;
  }
  for (const line of origLines) {
    if (!modSet.has(line)) deletions++;
  }
  return { additions, deletions };
}

/** Extract file changes from a flat list of events */
function extractFileChanges(events: ClaudeCodeEvent[]): FileChange[] {
  const changes: FileChange[] = [];
  const seen = new Set<string>();

  for (const event of events) {
    if (event.type === 'edit') {
      const edit = event as EditEvent;
      if (edit.status !== 'done') continue;
      const key = `edit:${edit.filePath}:${edit.id}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const { additions, deletions } = countChanges(edit.original, edit.modified);
      changes.push({
        id: edit.id,
        filePath: edit.filePath,
        type: 'edit',
        language: edit.language || languageFromFilename(edit.filePath),
        original: edit.original,
        modified: edit.modified,
        additions,
        deletions,
        status: edit.status,
      });
    } else if (event.type === 'create') {
      const create = event as CreateEvent;
      if (create.status !== 'done') continue;
      const key = `create:${create.filePath}:${create.id}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const lineCount = create.content.split('\n').length;
      changes.push({
        id: create.id,
        filePath: create.filePath,
        type: 'create',
        language: create.language || languageFromFilename(create.filePath),
        content: create.content,
        additions: lineCount,
        deletions: 0,
        status: create.status,
      });
    }
  }

  return changes;
}

/** Single file entry in the panel */
function FileEntry({
  change,
  decision,
  onAccept,
  onReject,
}: {
  change: FileChange;
  decision: 'accepted' | 'rejected' | null;
  onAccept?: () => void;
  onReject?: () => void;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const fileName = change.filePath.split('/').pop() || change.filePath;
  const dirPath = change.filePath.split('/').slice(0, -1).join('/');

  return (
    <div
      className={`fcp-file${decision ? ` fcp-file--${decision}` : ''}`}
      data-testid="fcp-file"
    >
      <div className="fcp-file__header" onClick={() => setCollapsed(!collapsed)}>
        <span className={`fcp-file__chevron${collapsed ? '' : ' fcp-file__chevron--open'}`}>
          <BoxIcon name="bx-chevron-right" size={14} />
        </span>
        <span className="fcp-file__name" title={change.filePath}>
          {dirPath && <span className="fcp-file__dir">{dirPath}/</span>}
          {fileName}
        </span>
        <span className="fcp-file__stats">
          {change.additions > 0 && (
            <span className="fcp-file__stat fcp-file__stat--add">+{change.additions}</span>
          )}
          {change.deletions > 0 && (
            <span className="fcp-file__stat fcp-file__stat--del">-{change.deletions}</span>
          )}
        </span>
        {!decision && (
          <span className="fcp-file__actions" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="fcp-file__btn fcp-file__btn--reject"
              onClick={onReject}
              title="Reject change"
            >
              <BoxIcon name="bx-x" size={16} />
            </button>
            <button
              type="button"
              className="fcp-file__btn fcp-file__btn--accept"
              onClick={onAccept}
              title="Accept change"
            >
              <BoxIcon name="bx-check" size={16} />
            </button>
          </span>
        )}
        {decision && (
          <span className={`fcp-file__decision fcp-file__decision--${decision}`}>
            <BoxIcon name={decision === 'accepted' ? 'bx-check' : 'bx-x'} size={14} />
          </span>
        )}
      </div>

      {!collapsed && (
        <div className="fcp-file__diff">
          {change.type === 'edit' && change.original != null && change.modified != null ? (
            <CodeDiffEditor
              original={change.original}
              modified={change.modified}
              language={change.language}
              fileName={change.filePath}
              height={Math.min(Math.max((change.additions + change.deletions) * 22, 80), 400)}
              readOnly
              renderSideBySide={false}
            />
          ) : change.type === 'create' && change.content ? (
            <pre className="fcp-file__new-content">
              {change.content.split('\n').map((line, i) => (
                <div key={i} className="fcp-file__line fcp-file__line--add">
                  <span className="fcp-file__line-num">{i + 1}</span>
                  <span className="fcp-file__line-prefix">+</span>
                  <span className="fcp-file__line-text">{line}</span>
                </div>
              ))}
            </pre>
          ) : null}
        </div>
      )}
    </div>
  );
}

export const FilesChangedPanel = ({
  events,
  onAccept,
  onReject,
  onAcceptAll,
  onDismiss,
  className,
}: FilesChangedPanelProps) => {
  const changes = useMemo(() => extractFileChanges(events), [events]);
  const [decisions, setDecisions] = useState<Record<string, 'accepted' | 'rejected'>>({});

  const totalAdditions = useMemo(
    () => changes.reduce((sum, c) => sum + c.additions, 0),
    [changes],
  );
  const totalDeletions = useMemo(
    () => changes.reduce((sum, c) => sum + c.deletions, 0),
    [changes],
  );

  const handleAccept = useCallback(
    (change: FileChange) => {
      setDecisions((prev) => ({ ...prev, [change.id]: 'accepted' }));
      onAccept?.(change);
    },
    [onAccept],
  );

  const handleReject = useCallback(
    (change: FileChange) => {
      setDecisions((prev) => ({ ...prev, [change.id]: 'rejected' }));
      onReject?.(change);
    },
    [onReject],
  );

  const handleAcceptAll = useCallback(() => {
    const all: Record<string, 'accepted'> = {};
    for (const c of changes) {
      if (!decisions[c.id]) all[c.id] = 'accepted';
    }
    setDecisions((prev) => ({ ...prev, ...all }));
    onAcceptAll?.();
  }, [changes, decisions, onAcceptAll]);

  if (changes.length === 0) return null;

  const cls = ['fcp', className].filter(Boolean).join(' ');
  const undecidedCount = changes.filter((c) => !decisions[c.id]).length;

  return (
    <div className={cls} data-testid="files-changed-panel">
      <div className="fcp__header">
        <span className="fcp__title">
          {changes.length} file{changes.length !== 1 ? 's' : ''} changed
        </span>
        <span className="fcp__stats">
          {totalAdditions > 0 && (
            <span className="fcp__stat fcp__stat--add">+{totalAdditions}</span>
          )}
          {totalDeletions > 0 && (
            <span className="fcp__stat fcp__stat--del">-{totalDeletions}</span>
          )}
        </span>
        <span className="fcp__header-actions">
          {undecidedCount > 0 && (
            <button
              type="button"
              className="fcp__btn fcp__btn--dismiss"
              onClick={onDismiss}
              title="Dismiss all"
            >
              <BoxIcon name="bx-x" size={18} />
            </button>
          )}
          {undecidedCount > 0 && (
            <button
              type="button"
              className="fcp__btn fcp__btn--accept-all"
              onClick={handleAcceptAll}
              title="Accept all"
            >
              <BoxIcon name="bx-check" size={18} />
            </button>
          )}
        </span>
      </div>

      <div className="fcp__list">
        {changes.map((change) => (
          <FileEntry
            key={change.id}
            change={change}
            decision={decisions[change.id] || null}
            onAccept={() => handleAccept(change)}
            onReject={() => handleReject(change)}
          />
        ))}
      </div>
    </div>
  );
};
