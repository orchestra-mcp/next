import type { McpPrdPhasesResult } from './parseMcpResponse';
import { CardBase } from './CardBase';
import { BoxIcon } from '@orchestra-mcp/icons';
import './PrdPhasesCard.css';

export interface PrdPhasesCardProps {
  data: McpPrdPhasesResult;
  className?: string;
}

export const PrdPhasesCard = ({ data, className }: PrdPhasesCardProps) => {
  const phases = data.phases ?? [];

  return (
    <CardBase
      title="PRD Phases"
      icon={<BoxIcon name="bx-layer" size={16} />}
      badge={String(phases.length)}
      badgeColor="info"
      defaultCollapsed={false}
      className={`prd-phases-card${className ? ` ${className}` : ''}`}
    >
      {phases.length === 0 ? (
        <div className="prd-phases-card__empty">No phases defined</div>
      ) : (
        <div className="prd-phases-card__phases">
          {phases.map((phase, i) => (
            <div key={phase.id ?? i} className="prd-phases-card__phase">
              <div className="prd-phases-card__phase-order">
                {phase.order ?? i + 1}
              </div>
              <span className="prd-phases-card__phase-name">{phase.name}</span>
              {phase.status && (
                <span className="prd-phases-card__phase-status">{phase.status}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </CardBase>
  );
};
