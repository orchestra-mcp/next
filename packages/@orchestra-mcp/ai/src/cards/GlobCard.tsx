"use client";

import { useState, useMemo } from 'react';
import type { GlobEvent } from '../types/events';
import { CardBase } from './CardBase';
import { BoxIcon } from '@orchestra-mcp/icons';
import './GlobCard.css';

export interface GlobCardProps {
  event: GlobEvent;
  defaultCollapsed?: boolean;
  onFileClick?: (filePath: string) => void;
  className?: string;
}

/** Get a file-type icon name based on file extension. */
function fileIcon(path: string): string {
  const ext = path.split('.').pop()?.toLowerCase() ?? '';
  const map: Record<string, string> = {
    ts: 'bxl-typescript', tsx: 'bxl-typescript',
    js: 'bxl-javascript', jsx: 'bxl-javascript',
    go: 'bxl-go-lang', rs: 'bx-cog',
    py: 'bxl-python', css: 'bxl-css3',
    html: 'bxl-html5', json: 'bx-code-curly',
    md: 'bx-file', sql: 'bx-data',
    proto: 'bx-transfer', sh: 'bx-terminal',
    svg: 'bx-image', png: 'bx-image', jpg: 'bx-image',
  };
  return map[ext] ?? 'bx-file';
}

interface DirGroup {
  dir: string;
  files: string[];
}

function groupByDir(paths: string[]): DirGroup[] {
  const map = new Map<string, string[]>();
  for (const p of paths) {
    const idx = p.lastIndexOf('/');
    const dir = idx >= 0 ? p.substring(0, idx) : '.';
    const arr = map.get(dir);
    if (arr) arr.push(p);
    else map.set(dir, [p]);
  }
  return Array.from(map.entries()).map(([dir, files]) => ({ dir, files }));
}

function DirSection({
  group,
  onFileClick,
}: {
  group: DirGroup;
  onFileClick?: (filePath: string) => void;
}) {
  const [open, setOpen] = useState(true);

  return (
    <div className="glob-card__dir">
      <button
        type="button"
        className="glob-card__dir-header"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <BoxIcon name={open ? 'bx-folder-open' : 'bx-folder'} size={14} />
        <span className="glob-card__dir-name">{group.dir}</span>
        <span className="glob-card__dir-count">{group.files.length}</span>
      </button>
      {open && (
        <div className="glob-card__dir-files">
          {group.files.map((path, idx) => {
            const fileName = path.substring(path.lastIndexOf('/') + 1);
            return (
              <button
                key={idx}
                className="glob-card__match"
                onClick={() => onFileClick?.(path)}
                title={path}
              >
                <BoxIcon name={fileIcon(path)} size={14} />
                <span className="glob-card__filename">{fileName}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export const GlobCard = ({
  event,
  defaultCollapsed = true,
  onFileClick,
  className,
}: GlobCardProps) => {
  const matchCount = event.totalMatches ?? event.matches?.length ?? 0;
  const badgeText = matchCount > 0 ? `${matchCount} files` : undefined;
  const groups = useMemo(
    () => groupByDir(event.matches ?? []),
    [event.matches],
  );

  return (
    <CardBase
      title={`Glob: ${event.pattern}`}
      icon={<BoxIcon name="bx-search" size={16} />}
      badge={badgeText}
      badgeColor={matchCount > 0 ? 'success' : 'gray'}
      status={event.status}
      defaultCollapsed={defaultCollapsed}
      timestamp={event.timestamp}
      className={`glob-card${className ? ` ${className}` : ''}`}
    >
      {groups.length > 0 ? (
        <div className="glob-card__tree">
          {groups.map((group) => (
            <DirSection
              key={group.dir}
              group={group}
              onFileClick={onFileClick}
            />
          ))}
        </div>
      ) : event.status === 'running' ? (
        <div className="glob-card__loading">Searching...</div>
      ) : (
        <div className="glob-card__empty">No files found</div>
      )}
    </CardBase>
  );
};
