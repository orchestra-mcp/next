import type { McpUsageResult } from './parseMcpResponse';
import { CardBase } from './CardBase';
import { BoxIcon } from '@orchestra-mcp/icons';
import './UsageCard.css';

export interface UsageCardProps {
  data: McpUsageResult;
  className?: string;
}

function formatTokens(n?: number): string {
  if (n === undefined || n === null) return '—';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function formatCost(n?: number): string {
  if (n === undefined || n === null) return '—';
  return `$${n.toFixed(4)}`;
}

export const UsageCard = ({ data, className }: UsageCardProps) => {
  const sessions = data.sessions ?? [];

  return (
    <CardBase
      title="Usage"
      icon={<BoxIcon name="bx-bar-chart" size={16} />}
      badge={data.total_cost !== undefined ? formatCost(data.total_cost) : undefined}
      badgeColor="info"
      defaultCollapsed={false}
      className={`usage-card${className ? ` ${className}` : ''}`}
    >
      <div className="usage-card__stats">
        <div className="usage-card__stat">
          <span className="usage-card__stat-value">{formatTokens(data.total_input_tokens)}</span>
          <span className="usage-card__stat-label">Input tokens</span>
        </div>
        <div className="usage-card__stat">
          <span className="usage-card__stat-value">{formatTokens(data.total_output_tokens)}</span>
          <span className="usage-card__stat-label">Output tokens</span>
        </div>
        <div className="usage-card__stat">
          <span className="usage-card__stat-value">{formatCost(data.total_cost)}</span>
          <span className="usage-card__stat-label">Total cost</span>
        </div>
      </div>

      {sessions.length > 0 && (
        <>
          <div className="usage-card__section-title">Recent sessions</div>
          <div className="usage-card__sessions">
            {sessions.slice(0, 10).map((s, i) => (
              <div key={s.session_id ?? i} className="usage-card__session">
                <span className="usage-card__session-id">{s.session_id}</span>
                {s.model && (
                  <span className="usage-card__session-model">{s.model}</span>
                )}
                {s.cost !== undefined && (
                  <span className="usage-card__session-cost">{formatCost(s.cost)}</span>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </CardBase>
  );
};
