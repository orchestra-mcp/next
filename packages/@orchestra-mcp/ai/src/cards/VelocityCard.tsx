import type { McpVelocityResult } from './parseMcpResponse';
import { CardBase } from './CardBase';
import { BoxIcon } from '@orchestra-mcp/icons';
import './VelocityCard.css';

export interface VelocityCardProps {
  data: McpVelocityResult;
  className?: string;
}

export const VelocityCard = ({ data, className }: VelocityCardProps) => {
  const sprints = data.sprints ?? [];
  const dataAny = data as unknown as Record<string, unknown>;
  const avg = data.average ?? dataAny.avg_velocity ?? dataAny.velocity;
  const avgDisplay = typeof avg === 'number' ? String(Math.round(avg)) : '—';
  const maxVel = Math.max(...sprints.map((s) => s.velocity), 1);

  return (
    <CardBase
      title="Team Velocity"
      icon={<BoxIcon name="bx-bar-chart-alt-2" size={16} />}
      badge={`avg ${avgDisplay}`}
      badgeColor="info"
      defaultCollapsed={false}
      className={`velocity-card${className ? ` ${className}` : ''}`}
    >
      <div className="velocity-card__chart">
        {/* Average line */}
        <div
          className="velocity-card__avg-line"
          style={{ left: `${(data.average / maxVel) * 100}%` }}
        />

        <div className="velocity-card__bars">
          {sprints.map((s) => {
            const pct = (s.velocity / maxVel) * 100;
            return (
              <div key={s.id} className="velocity-card__bar-row">
                <span className="velocity-card__bar-label" title={s.name}>
                  {s.name}
                </span>
                <div className="velocity-card__bar-track">
                  <div className="velocity-card__bar" style={{ width: `${pct}%` }} />
                </div>
                <span className="velocity-card__bar-value">{s.velocity}</span>
              </div>
            );
          })}
        </div>
      </div>
    </CardBase>
  );
};
