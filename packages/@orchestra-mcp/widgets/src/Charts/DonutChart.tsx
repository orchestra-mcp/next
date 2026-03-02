import './Charts.css';
import type { ChartProps } from './types';

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#f97316'];

function polarToCartesian(cx: number, cy: number, r: number, angle: number) {
  const rad = ((angle - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function donutArc(cx: number, cy: number, outer: number, inner: number, start: number, end: number) {
  const oStart = polarToCartesian(cx, cy, outer, end);
  const oEnd = polarToCartesian(cx, cy, outer, start);
  const iStart = polarToCartesian(cx, cy, inner, start);
  const iEnd = polarToCartesian(cx, cy, inner, end);
  const large = end - start > 180 ? 1 : 0;
  return [
    `M ${oStart.x} ${oStart.y}`,
    `A ${outer} ${outer} 0 ${large} 0 ${oEnd.x} ${oEnd.y}`,
    `L ${iStart.x} ${iStart.y}`,
    `A ${inner} ${inner} 0 ${large} 1 ${iEnd.x} ${iEnd.y}`,
    'Z',
  ].join(' ');
}

export interface DonutChartProps extends ChartProps {
  /** Inner radius ratio 0-1 (default 0.6) */
  innerRatio?: number;
  /** Center label */
  centerLabel?: string;
}

export const DonutChart = ({
  data,
  width = 300,
  height = 300,
  showLegend = true,
  title,
  className,
  innerRatio = 0.6,
  centerLabel,
}: DonutChartProps) => {
  if (!data.length) {
    return <div className={`chart__empty ${className ?? ''}`} style={{ width, height }}>No data</div>;
  }

  const total = data.reduce((sum, d) => sum + d.value, 0);
  const cx = width / 2;
  const cy = height / 2;
  const outer = Math.min(cx, cy) - 10;
  const inner = outer * innerRatio;

  let startAngle = 0;
  const slices = data.map((d, i) => {
    const sweep = total > 0 ? (d.value / total) * 360 : 0;
    const path = donutArc(cx, cy, outer, inner, startAngle, startAngle + sweep);
    startAngle += sweep;
    return { path, color: d.color ?? COLORS[i % COLORS.length] };
  });

  return (
    <div className={`chart ${className ?? ''}`}>
      {title && <p className="chart__title">{title}</p>}
      <svg className="chart__svg" width={width} height={height}>
        {slices.map((s, i) => (
          <path key={i} className="chart__slice" d={s.path} fill={s.color} />
        ))}
        {centerLabel && (
          <text className="chart__donut-label" x={cx} y={cy}>
            {centerLabel}
          </text>
        )}
      </svg>
      {showLegend && (
        <div className="chart__legend">
          {data.map((d, i) => (
            <span key={i} className="chart__legend-item">
              <span className="chart__legend-dot" style={{ background: d.color ?? COLORS[i % COLORS.length] }} />
              {d.label}: {d.value}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
