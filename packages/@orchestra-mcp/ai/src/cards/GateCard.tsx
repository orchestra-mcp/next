import { CardBase } from './CardBase';
import { BoxIcon } from '@orchestra-mcp/icons';
import './GateCard.css';

export interface GateTransitionData {
  from: string;
  to: string;
  task: { id: string; title: string; status: string };
  gate?: string;
  evidence?: string;
}

export interface GateCardProps {
  data: GateTransitionData;
  className?: string;
}

const STATES = [
  'backlog', 'todo', 'in-progress', 'ready-for-testing', 'in-testing',
  'ready-for-docs', 'in-docs', 'documented', 'in-review', 'done',
];

const LABELS = ['BL', 'TD', 'IP', 'RT', 'IT', 'RD', 'ID', 'DC', 'IR', 'DN'];

function pillColor(state: string): string {
  if (state === 'done') return 'success';
  if (state === 'rejected' || state === 'cancelled') return 'danger';
  return 'info';
}

export const GateCard = ({ data, className }: GateCardProps) => {
  const currentIdx = STATES.indexOf(data.to);
  const badgeColor = pillColor(data.to);

  return (
    <CardBase
      title={data.task.title}
      icon={<BoxIcon name="bx-transfer-alt" size={16} />}
      badge={`${data.from} → ${data.to}`}
      badgeColor={badgeColor as any}
      defaultCollapsed={false}
      className={`gate-card${className ? ` ${className}` : ''}`}
    >
      <div className="gate-card__transition">
        <span className="gate-card__pill gate-card__pill--from">{data.from}</span>
        <span className="gate-card__arrow">&rarr;</span>
        <span className={`gate-card__pill gate-card__pill--${pillColor(data.to)}`}>{data.to}</span>
      </div>

      {data.gate && (
        <span className="gate-card__gate-label">{data.gate}</span>
      )}

      {data.evidence && (
        <blockquote className="gate-card__evidence">{data.evidence}</blockquote>
      )}

      <div className="gate-card__states">
        {STATES.map((s, i) => (
          <div key={s} className="gate-card__state-col">
            <span
              className={`gate-card__state${
                i < currentIdx ? ' gate-card__state--past' :
                i === currentIdx ? ' gate-card__state--current' :
                ' gate-card__state--future'
              }`}
            />
            <span className="gate-card__state-label">{LABELS[i]}</span>
          </div>
        ))}
      </div>
    </CardBase>
  );
};
