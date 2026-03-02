import type { McpListResult } from './parseMcpResponse';
import { CardBase } from './CardBase';
import { BoxIcon } from '@orchestra-mcp/icons';
import './ListCard.css';

export interface ListCardProps {
  data: McpListResult;
  className?: string;
}

const TYPE_META: Record<McpListResult['type'], { label: string; icon: string; idField?: string }> = {
  epics:       { label: 'Epics',       icon: 'bx-layer',        idField: 'id' },
  stories:     { label: 'Stories',     icon: 'bx-book-open',    idField: 'id' },
  tasks:       { label: 'Tasks',       icon: 'bx-task',         idField: 'id' },
  sprints:     { label: 'Sprints',     icon: 'bx-run',          idField: 'id' },
  sessions:    { label: 'Sessions',    icon: 'bx-history',      idField: 'session_id' },
  plans:       { label: 'Plans',       icon: 'bx-map',          idField: 'id' },
  templates:   { label: 'Templates',   icon: 'bx-copy-alt',     idField: 'id' },
  projects:    { label: 'Projects',    icon: 'bx-folder',       idField: 'slug' },
  teams:       { label: 'Teams',       icon: 'bx-group',        idField: 'id' },
  agents:      { label: 'Agents',      icon: 'bx-bot',          idField: 'name' },
  skills:      { label: 'Skills',      icon: 'bx-code-curly',   idField: 'name' },
  notes:       { label: 'Notes',       icon: 'bx-note',         idField: 'id' },
  hook_events: { label: 'Hook Events', icon: 'bx-broadcast',    idField: 'id' },
};

const STATUS_COLOR: Record<string, string> = {
  done: 'success',
  completed: 'success',
  active: 'info',
  'in-progress': 'warning',
  'in_progress': 'warning',
  blocked: 'danger',
  cancelled: 'muted',
};

function statusColor(status: unknown): string {
  if (typeof status !== 'string') return 'muted';
  return STATUS_COLOR[status.toLowerCase()] ?? 'muted';
}

export const ListCard = ({ data, className }: ListCardProps) => {
  const meta = TYPE_META[data.type] ?? { label: data.type, icon: 'bx-list-ul' };
  const items = data.items ?? [];

  return (
    <CardBase
      title={meta.label}
      icon={<BoxIcon name={meta.icon as 'bx-layer'} size={16} />}
      badge={String(items.length)}
      badgeColor="info"
      defaultCollapsed={items.length > 8}
      className={`list-card${className ? ` ${className}` : ''}`}
    >
      {items.length === 0 ? (
        <div className="list-card__empty">No {meta.label.toLowerCase()} found</div>
      ) : (
        <div className="list-card__items">
          {items.map((item, idx) => {
            const id = meta.idField ? String(item[meta.idField] ?? '') : String(item.id ?? idx);
            const title = String(item.title ?? item.name ?? item.summary ?? id);
            const status = item.status as string | undefined;
            const priority = item.priority as string | undefined;
            return (
              <div key={id || idx} className="list-card__item">
                <div className="list-card__item-row">
                  {id && <span className="list-card__item-id">{id}</span>}
                  <span className="list-card__item-title">{title}</span>
                </div>
                {(status || priority) && (
                  <div className="list-card__item-meta">
                    {status && (
                      <span className={`list-card__badge list-card__badge--${statusColor(status)}`}>
                        {status}
                      </span>
                    )}
                    {priority && (
                      <span className="list-card__badge list-card__badge--muted">{priority}</span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </CardBase>
  );
};
