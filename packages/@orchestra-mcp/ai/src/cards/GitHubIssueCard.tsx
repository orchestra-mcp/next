import type { McpGitHubIssueResult } from './parseMcpResponse';
import { CardBase } from './CardBase';
import { BoxIcon } from '@orchestra-mcp/icons';
import './GitHubIssueCard.css';

export interface GitHubIssueCardProps {
  data: McpGitHubIssueResult;
  className?: string;
}

const STATE_BADGE: Record<string, 'success' | 'danger'> = {
  open: 'success',
  closed: 'danger',
};

export const GitHubIssueCard = ({ data, className }: GitHubIssueCardProps) => {
  const badgeColor = STATE_BADGE[data.state] ?? 'gray';

  return (
    <CardBase
      title={`#${data.number} ${data.title}`}
      icon={<BoxIcon name="bx-error-circle" size={16} />}
      badge={data.state}
      badgeColor={badgeColor as any}
      defaultCollapsed={false}
      className={`gh-issue-card${className ? ` ${className}` : ''}`}
    >
      {data.labels && data.labels.length > 0 && (
        <div className="gh-issue-card__labels">
          {data.labels.map((label) => (
            <span key={label} className="gh-issue-card__label">{label}</span>
          ))}
        </div>
      )}

      {data.assignees && data.assignees.length > 0 && (
        <div className="gh-issue-card__assignees">
          <BoxIcon name="bx-user" size={12} />
          <span>{data.assignees.join(', ')}</span>
        </div>
      )}

      {data.url && (
        <a
          className="gh-issue-card__link"
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
