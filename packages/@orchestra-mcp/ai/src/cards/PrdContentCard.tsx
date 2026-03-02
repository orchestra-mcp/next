import type { McpPrdContentResult } from './parseMcpResponse';
import { CardBase } from './CardBase';
import { BoxIcon } from '@orchestra-mcp/icons';
import { ChatMarkdown } from '../ChatMarkdown/ChatMarkdown';
import './PrdContentCard.css';

export interface PrdContentCardProps {
  data: McpPrdContentResult;
  className?: string;
}

export const PrdContentCard = ({ data, className }: PrdContentCardProps) => {
  return (
    <CardBase
      title={data.title ?? 'PRD'}
      icon={<BoxIcon name="bx-book-content" size={16} />}
      badge={data.project ?? undefined}
      badgeColor="info"
      defaultCollapsed={false}
      className={`prd-content-card${className ? ` ${className}` : ''}`}
    >
      <div className="prd-content-card__body">
        <ChatMarkdown content={data.content} />
      </div>
    </CardBase>
  );
};
