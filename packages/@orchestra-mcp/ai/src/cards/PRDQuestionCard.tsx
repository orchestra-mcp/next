import type { McpPrdSessionResult } from './parseMcpResponse';
import { CardBase } from './CardBase';
import { BoxIcon } from '@orchestra-mcp/icons';
import './PRDQuestionCard.css';

export interface PRDQuestionCardProps {
  data: McpPrdSessionResult;
  className?: string;
}

function humanizeKey(key: string): string {
  const spaced = key.replace(/_/g, ' ');
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

export const PRDQuestionCard = ({ data, className }: PRDQuestionCardProps) => {
  return (
    <CardBase
      title={humanizeKey(data.key)}
      icon={<BoxIcon name="bx-help-circle" size={16} />}
      badge={data.required ? 'required' : 'optional'}
      badgeColor={data.required ? 'warning' : 'gray'}
      defaultCollapsed={false}
      className={`prd-question${className ? ` ${className}` : ''}`}
    >
      <p className="prd-question__text">{data.question}</p>

      {data.options && data.options.length > 0 && (
        <div className="prd-question__options">
          {data.options.map((opt) => (
            <span key={opt} className="prd-question__option">{opt}</span>
          ))}
        </div>
      )}

      {data.status === 'answered' && (
        <span className="prd-question__status--answered">
          <BoxIcon name="bx-check" size={14} /> Answered
        </span>
      )}

      {data.status === 'skipped' && (
        <span className="prd-question__status--skipped">Skipped</span>
      )}
    </CardBase>
  );
};
