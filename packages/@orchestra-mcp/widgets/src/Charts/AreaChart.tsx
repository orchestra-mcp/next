import './Charts.css';
import type { ChartProps } from './types';

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#f97316'];

export const AreaChart = ({
  data,
  width = 400,
  height = 300,
  showLegend = false,
  title,
  className,
}: ChartProps) => {
  if (!data.length) {
    return <div className={`chart__empty ${className ?? ''}`} style={{ width, height }}>No data</div>;
  }

  const pad = { top: 20, right: 20, bottom: 40, left: 50 };
  const w = width - pad.left - pad.right;
  const h = height - pad.top - pad.bottom;
  const max = Math.max(...data.map((d) => d.value));
  const step = w / Math.max(data.length - 1, 1);

  const points = data.map((d, i) => ({
    x: pad.left + i * step,
    y: pad.top + h - (d.value / (max || 1)) * h,
  }));

  const lineD = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  const areaD = `${lineD} L${points[points.length - 1].x},${pad.top + h} L${points[0].x},${pad.top + h} Z`;

  return (
    <div className={`chart ${className ?? ''}`}>
      {title && <p className="chart__title">{title}</p>}
      <svg className="chart__svg" width={width} height={height}>
        {[0, 0.25, 0.5, 0.75, 1].map((t) => (
          <line
            key={t}
            className="chart__grid-line"
            x1={pad.left}
            x2={width - pad.right}
            y1={pad.top + h * (1 - t)}
            y2={pad.top + h * (1 - t)}
          />
        ))}
        <path className="chart__area" d={areaD} fill={COLORS[0]} />
        <path className="chart__line" d={lineD} stroke={COLORS[0]} />
        {points.map((p, i) => (
          <circle
            key={i}
            className="chart__dot"
            cx={p.x}
            cy={p.y}
            r={4}
            fill={data[i].color ?? COLORS[0]}
          />
        ))}
        {data.map((d, i) => (
          <text key={i} className="chart__axis-label" x={points[i].x} y={height - 8} textAnchor="middle">
            {d.label}
          </text>
        ))}
      </svg>
      {showLegend && (
        <div className="chart__legend">
          {data.map((d, i) => (
            <span key={i} className="chart__legend-item">
              <span className="chart__legend-dot" style={{ background: d.color ?? COLORS[i % COLORS.length] }} />
              {d.label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
