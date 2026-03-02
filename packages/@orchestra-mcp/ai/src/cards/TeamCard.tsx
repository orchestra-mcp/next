import type { McpTeamResult } from './parseMcpResponse';
import { CardBase } from './CardBase';
import { BoxIcon } from '@orchestra-mcp/icons';
import './TeamCard.css';

export interface TeamCardProps {
  data: McpTeamResult;
  className?: string;
}

function initials(name?: string): string {
  if (!name) return '?';
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

export const TeamCard = ({ data, className }: TeamCardProps) => {
  const members = data.members ?? [];

  return (
    <CardBase
      title={data.name}
      icon={<BoxIcon name="bx-group" size={16} />}
      badge={members.length > 0 ? String(members.length) : undefined}
      badgeColor="info"
      defaultCollapsed={false}
      className={`team-card${className ? ` ${className}` : ''}`}
    >
      {data.description && (
        <div className="team-card__description">{data.description}</div>
      )}
      {members.length === 0 ? (
        <div className="team-card__empty">No members</div>
      ) : (
        <div className="team-card__members">
          {members.map((m) => (
            <div key={m.id} className="team-card__member">
              <div className="team-card__member-avatar">
                {initials(m.name ?? m.email)}
              </div>
              <span className="team-card__member-name">{m.name ?? m.email ?? m.id}</span>
              {m.role && <span className="team-card__member-role">{m.role}</span>}
            </div>
          ))}
        </div>
      )}
    </CardBase>
  );
};
