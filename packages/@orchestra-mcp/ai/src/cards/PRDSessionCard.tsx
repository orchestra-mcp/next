import type { McpPrdSessionResult } from './parseMcpResponse';
import { CardBase } from './CardBase';
import { BoxIcon } from '@orchestra-mcp/icons';
import './PRDSessionCard.css';

export interface PRDSessionCardProps {
  data: McpPrdSessionResult;
  className?: string;
}

function mapStatus(status: string): string | undefined {
  if (status === 'active') return 'running';
  if (status === 'answered') return 'done';
  return undefined;
}

export const PRDSessionCard = ({ data, className }: PRDSessionCardProps) => {
  return (
    <CardBase
      title="PRD Session"
      icon={<BoxIcon name="bx-file" size={16} />}
      badge={`Q${data.index + 1}`}
      badgeColor={data.required ? 'warning' : 'gray'}
      status={mapStatus(data.status)}
      defaultCollapsed={false}
      className={`prd-session${className ? ` ${className}` : ''}`}
    >
      <p className="prd-session__question">{data.question}</p>

      {data.required && (
        <span className="prd-session__required">Required</span>
      )}

      <span className="prd-session__key">{data.key}</span>
    </CardBase>
  );
};
