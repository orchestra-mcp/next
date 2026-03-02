import { useState, useCallback } from 'react';
import { mcpCall } from '../mcp/client';
import './LinksSection.css';

export interface LinkItem {
  type: string;
  url: string;
  title?: string;
}

export interface LinksSectionProps {
  links: LinkItem[];
  project: string;
  epicId: string;
  storyId: string;
  taskId: string;
  onUpdate?: () => void;
}

const TYPE_ICONS: Record<string, string> = {
  pr: 'PR',
  commit: 'C',
  issue: '#',
};

function typeIcon(type: string): string {
  return TYPE_ICONS[type] ?? '\u{1F517}';
}

const LINK_TYPES = ['pr', 'commit', 'url', 'issue'] as const;

export function LinksSection({ links, project, epicId, storyId, taskId, onUpdate }: LinksSectionProps) {
  const [adding, setAdding] = useState(false);
  const [type, setType] = useState<string>('url');
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');

  const resetForm = useCallback(() => {
    setAdding(false);
    setType('url');
    setUrl('');
    setTitle('');
  }, []);

  const handleSave = useCallback(async () => {
    const trimmedUrl = url.trim();
    if (!trimmedUrl) return;
    try {
      await mcpCall('add_link', {
        project,
        epic_id: epicId,
        story_id: storyId,
        task_id: taskId,
        type,
        url: trimmedUrl,
        title: title.trim() || undefined,
      });
      onUpdate?.();
    } catch { /* silently fail, next refresh will restore */ }
    resetForm();
  }, [project, epicId, storyId, taskId, type, url, title, onUpdate, resetForm]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      resetForm();
    }
  }, [resetForm]);

  return (
    <section className="links-section">
      <h3 className="task-detail__section-title">Links</h3>
      {links.length === 0 && !adding && (
        <span className="links-section__empty">
          No links
          <button
            className="links-section__add"
            onClick={() => setAdding(true)}
            aria-label="Add link"
          >
            +
          </button>
        </span>
      )}
      {links.length > 0 && (
        <ul className="links-section__list">
          {links.map((link, i) => (
            <li key={i} className="links-section__item">
              <span className="links-section__type-badge">{typeIcon(link.type)}</span>
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="links-section__link"
              >
                {link.title || link.url}
              </a>
            </li>
          ))}
        </ul>
      )}
      {adding ? (
        <div className="links-section__form" onKeyDown={handleKeyDown}>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            aria-label="Link type"
          >
            {LINK_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <input
            placeholder="URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            autoFocus
          />
          <input
            placeholder="Title (optional)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <button className="links-section__save" onClick={handleSave}>Save</button>
          <button className="links-section__cancel" onClick={resetForm}>Cancel</button>
        </div>
      ) : links.length > 0 ? (
        <button
          className="links-section__add"
          onClick={() => setAdding(true)}
          aria-label="Add link"
        >
          + Add link
        </button>
      ) : null}
    </section>
  );
}
