import type { McpPrdValidationResult } from './parseMcpResponse';
import { CardBase } from './CardBase';
import { BoxIcon } from '@orchestra-mcp/icons';
import './PrdValidationCard.css';

export interface PrdValidationCardProps {
  data: McpPrdValidationResult;
  className?: string;
}

function scoreColor(score?: number): 'success' | 'warning' | 'danger' {
  if (!score) return 'danger';
  if (score >= 80) return 'success';
  if (score >= 50) return 'warning';
  return 'danger';
}

export const PrdValidationCard = ({ data, className }: PrdValidationCardProps) => {
  const missing = data.missing ?? [];
  const warnings = data.warnings ?? [];
  const color = scoreColor(data.completeness);

  return (
    <CardBase
      title="PRD Validation"
      icon={<BoxIcon name="bx-check-shield" size={16} />}
      badge={data.valid ? 'Valid' : 'Issues'}
      badgeColor={data.valid ? 'success' : 'danger'}
      defaultCollapsed={false}
      className={`prd-validation-card${className ? ` ${className}` : ''}`}
    >
      {data.completeness !== undefined && (
        <div className="prd-validation-card__score">
          <div className="prd-validation-card__score-bar-track">
            <div
              className={`prd-validation-card__score-bar prd-validation-card__score-bar--${color}`}
              style={{ width: `${data.completeness}%` }}
            />
          </div>
          <span className="prd-validation-card__score-value">{data.completeness}%</span>
        </div>
      )}

      {missing.length > 0 && (
        <div className="prd-validation-card__section">
          <div className="prd-validation-card__section-title">Missing</div>
          <div className="prd-validation-card__items">
            {missing.map((item, i) => (
              <div key={i} className="prd-validation-card__item prd-validation-card__item--missing">
                <div className="prd-validation-card__dot" />
                {item}
              </div>
            ))}
          </div>
        </div>
      )}

      {warnings.length > 0 && (
        <div className="prd-validation-card__section">
          <div className="prd-validation-card__section-title">Warnings</div>
          <div className="prd-validation-card__items">
            {warnings.map((w, i) => (
              <div key={i} className="prd-validation-card__item prd-validation-card__item--warning">
                <div className="prd-validation-card__dot" />
                {w}
              </div>
            ))}
          </div>
        </div>
      )}
    </CardBase>
  );
};
