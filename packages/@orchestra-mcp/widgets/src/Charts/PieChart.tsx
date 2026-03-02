import './Charts.css';
import type { ChartProps } from './types';

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#f97316'];

function polarToCartesian(cx: number, cy: number, r: number, angle: number) {
  const rad = ((angle - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arcPath(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const large = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${large} 0 ${end.x} ${end.y} L ${cx} ${cy} Z`;
}

export const PieChart = ({
  data,
  width = 300,
  height = 300,
  showLegend = true,
  title,
  className,
}: ChartProps) => {
  if (!data.length) {
    return <div className={`chart__empty ${className ?? ''}`} style={{ width, height }}>No data</div>;
  }

  const total = data.reduce((sum, d) => sum + d.value, 0);
  const cx = width / 2;
  const cy = height / 2;
  const r = Math.min(cx, cy) - 10;

  let startAngle = 0;
  const slices = data.map((d, i) => {
    const sweep = total > 0 ? (d.value / total) * 360 : 0;
    const path = arcPath(cx, cy, r, startAngle, startAngle + sweep);
    startAngle += sweep;
    return { path, color: d.color ?? COLORS[i % COLORS.length], label: d.label };
  });

  return (
    <div className={`chart ${className ?? ''}`}>
      {title && <p className="chart__title">{title}</p>}
      <svg className="chart__svg" width={width} height={height}>
        {slices.map((s, i) => (
          <path key={i} className="chart__slice" d={s.path} fill={s.color} />
        ))}
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
