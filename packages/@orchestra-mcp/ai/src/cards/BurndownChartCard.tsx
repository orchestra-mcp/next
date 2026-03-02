import type { McpBurndownResult } from './parseMcpResponse';
import { CardBase } from './CardBase';
import { BoxIcon } from '@orchestra-mcp/icons';
import './BurndownChartCard.css';

export interface BurndownChartCardProps {
  data: McpBurndownResult;
  className?: string;
}

const W = 300;
const H = 160;
const PAD = { top: 10, right: 10, bottom: 30, left: 30 };

function formatLabel(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export const BurndownChartCard = ({ data, className }: BurndownChartCardProps) => {
  const points = data.data;
  if (!points.length) return null;

  const maxY = Math.max(...points.map((p) => Math.max(p.ideal, p.actual)), 1);
  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;

  const toX = (i: number) => PAD.left + (i / Math.max(points.length - 1, 1)) * plotW;
  const toY = (v: number) => PAD.top + plotH - (v / maxY) * plotH;

  const idealPts = points.map((p, i) => `${toX(i)},${toY(p.ideal)}`).join(' ');
  const actualPts = points.map((p, i) => `${toX(i)},${toY(p.actual)}`).join(' ');

  // Y-axis ticks (3 ticks)
  const yTicks = [0, Math.round(maxY / 2), maxY];

  return (
    <CardBase
      title="Sprint Burndown"
      icon={<BoxIcon name="bx-line-chart" size={16} />}
      badge={data.sprint_id}
      badgeColor="gray"
      defaultCollapsed={false}
      className={`burndown-chart${className ? ` ${className}` : ''}`}
    >
      <svg className="burndown-chart__svg" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
        {/* Y-axis ticks */}
        {yTicks.map((v) => (
          <text key={v} x={PAD.left - 4} y={toY(v) + 3} className="burndown-chart__label" textAnchor="end">
            {v}
          </text>
        ))}

        {/* X-axis date labels (first, mid, last) */}
        {[0, Math.floor(points.length / 2), points.length - 1]
          .filter((v, i, a) => a.indexOf(v) === i)
          .map((idx) => (
            <text key={idx} x={toX(idx)} y={H - 4} className="burndown-chart__label" textAnchor="middle">
              {formatLabel(points[idx].date)}
            </text>
          ))}

        {/* Lines */}
        <polyline points={idealPts} className="burndown-chart__line--ideal" fill="none" strokeWidth="1.5" />
        <polyline points={actualPts} className="burndown-chart__line--actual" fill="none" strokeWidth="2" />
      </svg>

      <div className="burndown-chart__legend">
        <span className="burndown-chart__legend-item burndown-chart__legend-item--ideal">Ideal</span>
        <span className="burndown-chart__legend-item burndown-chart__legend-item--actual">Actual</span>
      </div>
    </CardBase>
  );
};
