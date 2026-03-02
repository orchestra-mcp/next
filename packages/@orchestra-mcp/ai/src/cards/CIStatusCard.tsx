import { CardBase } from './CardBase';
import { BoxIcon } from '@orchestra-mcp/icons';
import './CIStatusCard.css';

export interface CIStatusData {
  state: string;
  statuses: Array<{
    context: string;
    state: string;
    description?: string;
    target_url?: string;
  }>;
  ref: string;
  sha?: string;
}

export interface CIStatusCardProps {
  data: CIStatusData;
  className?: string;
}

const STATE_BADGE: Record<string, 'success' | 'danger' | 'warning' | 'gray'> = {
  success: 'success',
  failure: 'danger',
  error: 'danger',
  pending: 'warning',
};

const DOT_COLORS: Record<string, string> = {
  success: '#22c55e',
  failure: '#ef4444',
  error: '#ef4444',
  pending: '#eab308',
};

export const CIStatusCard = ({ data, className }: CIStatusCardProps) => {
  const badgeColor = STATE_BADGE[data.state] ?? 'gray';

  return (
    <CardBase
      title="CI Status"
      icon={<BoxIcon name="bx-check-shield" size={16} />}
      badge={data.state}
      badgeColor={badgeColor}
      defaultCollapsed={false}
      className={`ci-status-card${className ? ` ${className}` : ''}`}
    >
      <div className="ci-status-card__ref">
        <code>{data.ref}</code>
        {data.sha && <code className="ci-status-card__sha">{data.sha.slice(0, 7)}</code>}
      </div>

      <div className="ci-status-card__checks">
        {data.statuses.map((s, i) => (
          <div key={i} className="ci-status-card__check">
            <span
              className="ci-status-card__dot"
              style={{ background: DOT_COLORS[s.state] ?? 'var(--color-border)' }}
            />
            <span className="ci-status-card__context">{s.context}</span>
            {s.description && (
              <span className="ci-status-card__desc">{s.description}</span>
            )}
            {s.target_url && (
              <a
                className="ci-status-card__link"
                href={s.target_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                Details
              </a>
            )}
          </div>
        ))}
      </div>
    </CardBase>
  );
};
