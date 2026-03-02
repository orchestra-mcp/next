import type { McpWorkflowResult } from './parseMcpResponse';
import { CardBase } from './CardBase';
import { BoxIcon } from '@orchestra-mcp/icons';
import './WorkflowStatusCard.css';

export interface WorkflowStatusCardProps {
  data: McpWorkflowResult;
  className?: string;
}

const STATE_COLORS: Record<string, string> = {
  backlog: '#6b7280',
  todo: '#8b5cf6',
  'in-progress': '#6366f1',
  'ready-for-testing': '#f59e0b',
  'in-testing': '#eab308',
  'ready-for-docs': '#06b6d4',
  'in-docs': '#0891b2',
  documented: '#10b981',
  'in-review': '#22c55e',
  done: '#16a34a',
  blocked: '#ef4444',
  rejected: '#dc2626',
  cancelled: '#9ca3af',
};

const R = 40;
const CX = 50;
const CY = 50;
const CIRC = 2 * Math.PI * R;

export const WorkflowStatusCard = ({ data, className }: WorkflowStatusCardProps) => {
  const entries = Object.entries(data).filter(([, v]) => v > 0);
  const total = entries.reduce((s, [, v]) => s + v, 0);
  const done = data.done ?? 0;
  const blocked = data.blocked ?? 0;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  // Build donut segments
  let offset = 0;
  const segments = entries.map(([state, count]) => {
    const len = (count / Math.max(total, 1)) * CIRC;
    const seg = { state, count, len, offset, color: STATE_COLORS[state] ?? '#6b7280' };
    offset += len;
    return seg;
  });

  return (
    <CardBase
      title="Workflow Status"
      icon={<BoxIcon name="bx-pie-chart-alt-2" size={16} />}
      badge={`${pct}%`}
      badgeColor={pct === 100 ? 'success' : 'info'}
      defaultCollapsed={false}
      className={`workflow-card${className ? ` ${className}` : ''}`}
    >
      <div className="workflow-card__layout">
        <svg className="workflow-card__donut" viewBox="0 0 100 100">
          {segments.map((s) => (
            <circle
              key={s.state}
              cx={CX}
              cy={CY}
              r={R}
              fill="none"
              stroke={s.color}
              strokeWidth="12"
              strokeDasharray={`${s.len} ${CIRC - s.len}`}
              strokeDashoffset={-s.offset}
              transform={`rotate(-90 ${CX} ${CY})`}
            />
          ))}
          <text x={CX} y={CY + 4} textAnchor="middle" className="workflow-card__pct-label">
            {pct}%
          </text>
        </svg>

        <div className="workflow-card__legend">
          {entries.map(([state, count]) => (
            <div key={state} className="workflow-card__legend-row">
              <span
                className="workflow-card__legend-dot"
                style={{ background: STATE_COLORS[state] ?? '#6b7280' }}
              />
              <span className="workflow-card__legend-name">{state}</span>
              <span className="workflow-card__legend-count">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {blocked > 0 && (
        <div className="workflow-card__blocked">
          <BoxIcon name="bx-error" size={14} />
          <span>{blocked} blocked</span>
        </div>
      )}

      <div className="workflow-card__bar">
        <div className="workflow-card__bar-fill" style={{ width: `${pct}%` }} />
      </div>
    </CardBase>
  );
};
