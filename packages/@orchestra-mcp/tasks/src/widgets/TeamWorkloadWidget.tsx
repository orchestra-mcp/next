import { Widget } from '@orchestra-mcp/widgets';
import { BoxIcon } from '@orchestra-mcp/icons';
import './TeamWorkloadWidget.css';

export interface TeamMember {
  name: string;
  avatar?: string;
  assigned: number;
  inProgress: number;
  completed: number;
}

export interface TeamWorkloadWidgetProps {
  /** Team members with workload data */
  members: TeamMember[];
  /** Called when a member row is clicked */
  onMemberClick?: (name: string) => void;
  /** Show loading shimmer */
  loading?: boolean;
  /** Called when refresh button is clicked */
  onRefresh?: () => void;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function segmentPercent(value: number, total: number): number {
  if (total === 0) return 0;
  return (value / total) * 100;
}

export const TeamWorkloadWidget = ({
  members,
  onMemberClick,
  loading,
  onRefresh,
}: TeamWorkloadWidgetProps) => {
  return (
    <Widget
      title="Team Workload"
      icon={<BoxIcon name="bx-group" size={16} />}
      collapsible
      size="medium"
      loading={loading}
      onRefresh={onRefresh}
    >
      {members.length === 0 ? (
        <div className="team-workload__empty" data-testid="team-workload-empty">
          No team members
        </div>
      ) : (
        <div className="team-workload" data-testid="team-workload-widget">
          {members.map((member) => {
            const total = member.assigned + member.inProgress + member.completed;
            return (
              <button
                key={member.name}
                type="button"
                className="team-workload__row"
                data-testid={`member-${member.name}`}
                onClick={() => onMemberClick?.(member.name)}
              >
                <div className="team-workload__avatar">
                  {member.avatar
                    ? <img src={member.avatar} alt={member.name} />
                    : getInitials(member.name)
                  }
                </div>
                <div className="team-workload__info">
                  <span className="team-workload__name">{member.name}</span>
                  <div className="team-workload__bar-track">
                    <div
                      className="team-workload__segment team-workload__segment--completed"
                      style={{ width: `${segmentPercent(member.completed, total)}%` }}
                    />
                    <div
                      className="team-workload__segment team-workload__segment--in-progress"
                      style={{ width: `${segmentPercent(member.inProgress, total)}%` }}
                    />
                    <div
                      className="team-workload__segment team-workload__segment--assigned"
                      style={{ width: `${segmentPercent(member.assigned, total)}%` }}
                    />
                  </div>
                </div>
                <span className="team-workload__count">{total}</span>
              </button>
            );
          })}
          <div className="team-workload__legend" data-testid="team-workload-legend">
            <span className="team-workload__legend-item">
              <span className="team-workload__legend-dot" style={{ background: '#22c55e' }} />
              Done
            </span>
            <span className="team-workload__legend-item">
              <span className="team-workload__legend-dot" style={{ background: '#3b82f6' }} />
              In Progress
            </span>
            <span className="team-workload__legend-item">
              <span className="team-workload__legend-dot" style={{ background: '#888', opacity: 0.4 }} />
              Assigned
            </span>
          </div>
        </div>
      )}
    </Widget>
  );
};
