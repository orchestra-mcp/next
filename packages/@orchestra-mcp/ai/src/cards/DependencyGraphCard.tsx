import type { McpDependencyGraphResult } from './parseMcpResponse';
import { CardBase } from './CardBase';
import { BoxIcon } from '@orchestra-mcp/icons';
import './DependencyGraphCard.css';

export interface DependencyGraphCardProps {
  data: McpDependencyGraphResult;
  className?: string;
}

export const DependencyGraphCard = ({ data, className }: DependencyGraphCardProps) => {
  const nodes = data.nodes ?? [];
  const edges = data.edges ?? [];
  const cycles = data.cycles ?? [];
  const hasCycles = cycles.length > 0;

  return (
    <CardBase
      title="Dependency Graph"
      icon={<BoxIcon name="bx-git-branch" size={16} />}
      badge={hasCycles ? 'Cycle!' : `${nodes.length} tasks`}
      badgeColor={hasCycles ? 'danger' : 'info'}
      defaultCollapsed={false}
      className={`dep-graph-card${className ? ` ${className}` : ''}`}
    >
      {nodes.length === 0 && edges.length === 0 ? (
        <div className="dep-graph-card__empty">No dependencies found</div>
      ) : (
        <>
          <div className="dep-graph-card__stats">
            <div className="dep-graph-card__stat">
              <span className="dep-graph-card__stat-value">{nodes.length}</span>
              <span className="dep-graph-card__stat-label">Tasks</span>
            </div>
            <div className="dep-graph-card__stat">
              <span className="dep-graph-card__stat-value">{edges.length}</span>
              <span className="dep-graph-card__stat-label">Dependencies</span>
            </div>
            {hasCycles && (
              <div className="dep-graph-card__stat">
                <span className="dep-graph-card__stat-value" style={{ color: '#ef4444' }}>
                  {cycles.length}
                </span>
                <span className="dep-graph-card__stat-label">Cycles</span>
              </div>
            )}
          </div>

          {edges.length > 0 && (
            <>
              <div className="dep-graph-card__section-title">Dependencies</div>
              <div className="dep-graph-card__edges">
                {edges.map((e, i) => (
                  <div key={i} className="dep-graph-card__edge">
                    <span className="dep-graph-card__edge-id">{e.from}</span>
                    <span className="dep-graph-card__edge-arrow">→</span>
                    <span className="dep-graph-card__edge-id">{e.to}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {nodes.length > 0 && (
            <>
              <div className="dep-graph-card__section-title">Tasks</div>
              <div className="dep-graph-card__nodes">
                {nodes.map((n) => (
                  <div key={n.id} className="dep-graph-card__node">
                    <span className="dep-graph-card__node-id">{n.id}</span>
                    <span className="dep-graph-card__node-title">{n.title}</span>
                    {n.status && (
                      <span className="dep-graph-card__node-status">{n.status}</span>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

          {hasCycles && (
            <div className="dep-graph-card__cycle-warning">
              <BoxIcon name="bx-error" size={13} />
              Circular dependency detected — review the dependency chain
            </div>
          )}
        </>
      )}
    </CardBase>
  );
};
