import { CardBase } from './CardBase';
import { BoxIcon } from '@orchestra-mcp/icons';
import { ChatMarkdown } from '../ChatMarkdown/ChatMarkdown';
import './PRDPreviewCard.css';

export interface PrdPreviewData {
  content: string;
  title?: string;
  completeness?: number;
}

export interface PRDPreviewCardProps {
  data: PrdPreviewData;
  className?: string;
}

function scoreColor(score?: number): 'success' | 'warning' | 'danger' | 'gray' {
  if (score === undefined) return 'gray';
  if (score >= 80) return 'success';
  if (score >= 50) return 'warning';
  return 'danger';
}

export const PRDPreviewCard = ({ data, className }: PRDPreviewCardProps) => {
  const badge = data.completeness !== undefined
    ? `${data.completeness}%`
    : undefined;

  return (
    <CardBase
      title={data.title ?? 'PRD Preview'}
      icon={<BoxIcon name="bx-book-content" size={16} />}
      badge={badge}
      badgeColor={scoreColor(data.completeness)}
      defaultCollapsed={false}
      className={`prd-preview${className ? ` ${className}` : ''}`}
    >
      <div className="prd-preview__content">
        <ChatMarkdown content={data.content} />
      </div>
    </CardBase>
  );
};
