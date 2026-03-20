'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'

interface VelocityWidgetProps {
  data: Array<{ week: string; completed: number }>
  average: number
}

const tooltipWrapperSt: React.CSSProperties = {
  background: '#1a1520',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 8,
  padding: '8px 12px',
  fontSize: 12,
  color: '#ffffff',
}

function formatWeekTick(value: string): string {
  const d = new Date(value)
  if (isNaN(d.getTime())) {
    const parts = value.split('-')
    if (parts.length === 3) {
      return `${parseInt(parts[1], 10)}/${parseInt(parts[2], 10)}`
    }
    return value
  }
  return `${d.getMonth() + 1}/${d.getDate()}`
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload || payload.length === 0) return null

  return (
    <div style={tooltipWrapperSt}>
      <div style={{ marginBottom: 4, fontWeight: 600 }}>{label}</div>
      {payload.map((entry: any) => (
        <div key={entry.dataKey} style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: entry.color || '#a900ff',
              flexShrink: 0,
            }}
          />
          <span>Completed: {entry.value}</span>
        </div>
      ))}
    </div>
  )
}

export function VelocityWidget({ data, average }: VelocityWidgetProps) {
  if (!data || data.length === 0) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: 220,
          fontSize: 13,
          color: 'var(--color-fg-dim)',
        }}
      >
        No velocity data yet
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
        <XAxis
          dataKey="week"
          type="category"
          tick={{ fontSize: 10, fill: 'var(--color-fg-dim)' }}
          stroke="var(--color-fg-dim)"
          tickFormatter={formatWeekTick}
        />
        <YAxis
          tick={{ fontSize: 10, fill: 'var(--color-fg-dim)' }}
          stroke="var(--color-fg-dim)"
          allowDecimals={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <ReferenceLine
          y={average}
          stroke="#00e5ff"
          strokeDasharray="6 4"
          strokeWidth={1.5}
          label={{
            value: `Avg: ${average}`,
            position: 'right',
            fontSize: 11,
            fill: '#00e5ff',
          }}
        />
        <Bar
          dataKey="completed"
          fill="#a900ff"
          radius={[4, 4, 0, 0]}
          maxBarSize={40}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}
