import { CardBase } from './CardBase';
import { BoxIcon } from '@orchestra-mcp/icons';
import './WipLimitCard.css';

export interface WipLimitData {
  max_in_progress?: number;
  max_per_assignee?: number;
  max_per_sprint?: number;
  current_in_progress?: number;
  current_per_assignee?: Record<string, number>;
}

export interface WipLimitCardProps {
  data: WipLimitData;
  className?: string;
}

function isOver(current: number, max: number): boolean {
  return current > max;
}

export const WipLimitCard = ({ data, className }: WipLimitCardProps) => {
  const inProgressOver =
    data.max_in_progress != null &&
    data.current_in_progress != null &&
    data.current_in_progress > data.max_in_progress;

  const anyAssigneeOver =
    data.max_per_assignee != null &&
    data.current_per_assignee != null &&
    Object.values(data.current_per_assignee).some((v) => v > data.max_per_assignee!);

  const overLimit = inProgressOver || anyAssigneeOver;

  return (
    <CardBase
      title="WIP Limits"
      icon={<BoxIcon name="bx-slider-alt" size={16} />}
      badge={overLimit ? 'Over' : 'OK'}
      badgeColor={overLimit ? 'danger' : 'success'}
      defaultCollapsed={false}
      className={`wip-card${className ? ` ${className}` : ''}`}
    >
      {data.max_in_progress != null && (
        <GaugeRow
          label="In Progress"
          current={data.current_in_progress ?? 0}
          max={data.max_in_progress}
        />
      )}

      {data.max_per_assignee != null && (
        <>
          <div className="wip-card__row">
            <div className="wip-card__row-header">
              <span className="wip-card__row-label">Per Assignee Limit</span>
              <span className="wip-card__row-value">{data.max_per_assignee}</span>
            </div>
          </div>
          {data.current_per_assignee &&
            Object.entries(data.current_per_assignee).map(([name, count]) => (
              <GaugeRow key={name} label={name} current={count} max={data.max_per_assignee!} />
            ))}
        </>
      )}

      {data.max_per_sprint != null && (
        <div className="wip-card__row">
          <div className="wip-card__row-header">
            <span className="wip-card__row-label">Per Sprint</span>
            <span className="wip-card__row-value">{data.max_per_sprint}</span>
          </div>
        </div>
      )}
    </CardBase>
  );
};

function GaugeRow({ label, current, max }: { label: string; current: number; max: number }) {
  const pct = Math.min((current / Math.max(max, 1)) * 100, 100);
  const over = isOver(current, max);

  return (
    <div className="wip-card__row">
      <div className="wip-card__row-header">
        <span className="wip-card__row-label">{label}</span>
        <span className="wip-card__row-value">
          {current} / {max}
        </span>
      </div>
      <div className="wip-card__bar">
        <div
          className={`wip-card__bar-fill${over ? ' wip-card__bar-fill--over' : ''}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
