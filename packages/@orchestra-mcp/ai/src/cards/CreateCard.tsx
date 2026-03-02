import { useState, useCallback } from 'react';
import type { CreateEvent } from '../types/events';
import { CardBase } from './CardBase';
import { CodeEditor, languageFromFilename } from '@orchestra-mcp/editor';
import { BoxIcon } from '@orchestra-mcp/icons';
import './CreateCard.css';

export interface CreateCardProps {
  event: CreateEvent;
  defaultCollapsed?: boolean;
  onOpenInWindow?: () => void;
  onContentChange?: (filePath: string, content: string) => void;
  className?: string;
}

export const CreateCard = ({
  event,
  defaultCollapsed,
  onOpenInWindow,
  onContentChange,
  className,
}: CreateCardProps) => {
  const language = event.language || languageFromFilename(event.filePath);
  const [editing, setEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(event.content);

  const handleChange = useCallback(
    (value: string) => {
      setEditedContent(value);
      onContentChange?.(event.filePath, value);
    },
    [event.filePath, onContentChange],
  );

  const lineCount = (editing ? editedContent : event.content).split('\n').length;
  const editorHeight = Math.min(Math.max(lineCount * 20, 80), 300);

  return (
    <CardBase
      title={event.filePath}
      icon={<BoxIcon name="bx-file-blank" size={16} />}
      badge={language}
      badgeColor="success"
      status={event.status}
      defaultCollapsed={defaultCollapsed}
      timestamp={event.timestamp}
      headerActions={
        <span className="create-card__header-actions">
          {onContentChange && event.status === 'done' && (
            <button
              type="button"
              className={`card-base__action-btn${editing ? ' card-base__action-btn--active' : ''}`}
              onClick={() => setEditing((e) => !e)}
              title={editing ? 'Lock editing' : 'Edit inline'}
            >
              <BoxIcon name={editing ? 'bx-lock-open-alt' : 'bx-edit-alt'} size={14} />
            </button>
          )}
          {onOpenInWindow && (
            <button
              type="button"
              className="card-base__action-btn"
              onClick={onOpenInWindow}
              title="Open in Window"
            >
              <BoxIcon name="bx-link-external" size={14} />
            </button>
          )}
        </span>
      }
      className={`create-card${className ? ` ${className}` : ''}`}
    >
      <div className="create-card__body" title={event.filePath}>
        <CodeEditor
          value={editing ? editedContent : event.content}
          language={language}
          readOnly={!editing}
          height={editorHeight}
          minimap={false}
          lineNumbers
          fileName={event.filePath}
          onChange={editing ? handleChange : undefined}
        />
      </div>
    </CardBase>
  );
};
