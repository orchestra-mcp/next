import type { ReadEvent } from '../types/events';
import { CardBase } from './CardBase';
import { CodeEditor, languageFromFilename } from '@orchestra-mcp/editor';
import { BoxIcon } from '@orchestra-mcp/icons';
import './ReadCard.css';

export interface ReadCardProps {
  event: ReadEvent;
  defaultCollapsed?: boolean;
  onFileClick?: (filePath: string, line?: number) => void;
  onOpenInWindow?: () => void;
  className?: string;
}

export const ReadCard = ({
  event,
  defaultCollapsed = true,
  onFileClick,
  onOpenInWindow,
  className,
}: ReadCardProps) => {
  const language = languageFromFilename(event.filePath);
  const lineRange = event.offset && event.limit
    ? `${event.offset}-${event.offset + event.limit}`
    : event.lineCount
    ? `${event.lineCount} lines`
    : undefined;

  const lineCount = event.content ? event.content.split('\n').length : 0;
  const editorHeight = Math.min(Math.max(lineCount * 20, 80), 300);

  return (
    <CardBase
      title={`Read: ${event.filePath}`}
      icon={<BoxIcon name="bx-file" size={16} />}
      badge={lineRange || language}
      badgeColor="info"
      status={event.status}
      defaultCollapsed={defaultCollapsed}
      timestamp={event.timestamp}
      headerActions={
        onOpenInWindow && (
          <button
            type="button"
            className="card-base__action-btn"
            onClick={onOpenInWindow}
            title="Open in Window"
          >
            <BoxIcon name="bx-link-external" size={14} />
          </button>
        )
      }
      className={`read-card${className ? ` ${className}` : ''}`}
    >
      {event.content && (
        <div className="read-card__editor">
          <CodeEditor
            value={event.content}
            language={language}
            readOnly
            height={editorHeight}
            minimap={false}
            lineNumbers
            fileName={event.filePath}
          />
        </div>
      )}
      {!event.content && event.status === 'running' && (
        <div className="read-card__loading">Reading file...</div>
      )}
    </CardBase>
  );
};
