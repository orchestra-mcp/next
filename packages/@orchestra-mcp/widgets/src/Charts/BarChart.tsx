import './Charts.css';
import type { ChartProps } from './types';

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#f97316'];

export const BarChart = ({
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
  const barW = (w / data.length) * 0.7;
  const gap = (w / data.length) * 0.3;

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
        {data.map((d, i) => {
          const barH = (d.value / (max || 1)) * h;
          const x = pad.left + i * (barW + gap) + gap / 2;
          return (
            <g key={i}>
              <rect
                className="chart__bar"
                x={x}
                y={pad.top + h - barH}
                width={barW}
                height={barH}
                rx={3}
                fill={d.color ?? COLORS[i % COLORS.length]}
              />
              <text className="chart__axis-label" x={x + barW / 2} y={height - 8} textAnchor="middle">
                {d.label}
              </text>
            </g>
          );
        })}
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
