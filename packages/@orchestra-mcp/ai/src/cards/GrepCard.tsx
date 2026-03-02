"use client";

import { useState, useMemo } from 'react';
import type { GrepEvent, GrepMatch } from '../types/events';
import { CardBase } from './CardBase';
import { BoxIcon } from '@orchestra-mcp/icons';
import './GrepCard.css';

export interface GrepCardProps {
  event: GrepEvent;
  defaultCollapsed?: boolean;
  onFileClick?: (filePath: string, line: number) => void;
  className?: string;
}

interface FileGroup {
  file: string;
  matches: GrepMatch[];
}

function groupByFile(matches: GrepMatch[]): FileGroup[] {
  const map = new Map<string, GrepMatch[]>();
  for (const m of matches) {
    const arr = map.get(m.file);
    if (arr) arr.push(m);
    else map.set(m.file, [m]);
  }
  return Array.from(map.entries()).map(([file, ms]) => ({ file, matches: ms }));
}

function FileSection({
  group,
  onFileClick,
}: {
  group: FileGroup;
  onFileClick?: (filePath: string, line: number) => void;
}) {
  const [open, setOpen] = useState(true);
  const fileName = group.file.substring(group.file.lastIndexOf('/') + 1);

  return (
    <div className="grep-card__file-group">
      <button
        type="button"
        className="grep-card__file-header"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <BoxIcon name={open ? 'bx-chevron-down' : 'bx-chevron-right'} size={14} />
        <BoxIcon name="bx-file" size={14} />
        <span className="grep-card__file-name" title={group.file}>{fileName}</span>
        <span className="grep-card__file-path">{group.file}</span>
        <span className="grep-card__match-count">{group.matches.length}</span>
      </button>
      {open && (
        <div className="grep-card__file-matches">
          {group.matches.map((match, i) => (
            <div key={`${match.line}:${i}`} className="grep-card__row">
              {onFileClick ? (
                <button
                  type="button"
                  className="grep-card__line-link"
                  onClick={() => onFileClick(match.file, match.line)}
                >
                  {match.line}
                </button>
              ) : (
                <span className="grep-card__line-num">{match.line}</span>
              )}
              <code className="grep-card__content">{match.content}</code>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export const GrepCard = ({
  event,
  defaultCollapsed,
  onFileClick,
  className,
}: GrepCardProps) => {
  const count = event.totalMatches ?? event.matches.length;
  const groups = useMemo(
    () => groupByFile(event.matches),
    [event.matches],
  );

  return (
    <CardBase
      title={event.pattern}
      icon={<BoxIcon name="bx-search" size={16} />}
      badge={`${count} match${count !== 1 ? 'es' : ''} in ${groups.length} file${groups.length !== 1 ? 's' : ''}`}
      badgeColor="info"
      status={event.status}
      defaultCollapsed={defaultCollapsed}
      timestamp={event.timestamp}
      className={`grep-card${className ? ` ${className}` : ''}`}
    >
      {groups.length > 0 ? (
        <div className="grep-card__groups">
          {groups.map((group) => (
            <FileSection
              key={group.file}
              group={group}
              onFileClick={onFileClick}
            />
          ))}
        </div>
      ) : event.status === 'running' ? (
        <div className="grep-card__loading">Searching...</div>
      ) : (
        <div className="grep-card__empty">No matches found</div>
      )}
    </CardBase>
  );
};
