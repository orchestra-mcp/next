import type { McpGitHubPRResult } from './parseMcpResponse';
import { CardBase } from './CardBase';
import { BoxIcon } from '@orchestra-mcp/icons';
import './GitHubPRCard.css';

export interface GitHubPRCardProps {
  data: McpGitHubPRResult;
  className?: string;
}

const STATE_BADGE: Record<string, 'success' | 'info' | 'danger'> = {
  open: 'success',
  merged: 'info',
  closed: 'danger',
};

export const GitHubPRCard = ({ data, className }: GitHubPRCardProps) => {
  const badgeColor = STATE_BADGE[data.state] ?? 'gray';

  return (
    <CardBase
      title={`#${data.number} ${data.title}`}
      icon={<BoxIcon name="bx-git-pull-request" size={16} />}
      badge={data.state}
      badgeColor={badgeColor as any}
      defaultCollapsed={false}
      className={`gh-pr-card${className ? ` ${className}` : ''}`}
    >
      <div className="gh-pr-card__branch">
        <code>{data.head}</code>
        <span className="gh-pr-card__arrow">&rarr;</span>
        <code>{data.base}</code>
      </div>

      {data.author && (
        <span className="gh-pr-card__author">
          <BoxIcon name="bx-user" size={12} />
          {data.author}
        </span>
      )}

      {data.draft && (
        <span className="gh-pr-card__draft">Draft</span>
      )}

      {data.url && (
        <a
          className="gh-pr-card__link"
          href={data.url}
          target="_blank"
          rel="noopener noreferrer"
        >
          {data.url}
        </a>
      )}
    </CardBase>
  );
};
