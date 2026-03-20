'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface WorkloadWidgetProps {
  data: Array<{
    person: string
    statusCounts: Record<string, number>
    total: number
  }>
}

const STATUS_COLORS: Record<string, string> = {
  done: '#22c55e',
  'in-progress': '#00e5ff',
  'in-review': '#a900ff',
  'in-testing': '#eab308',
  todo: '#6b7280',
  backlog: '#374151',
}

const STATUS_KEYS = ['done', 'in-progress', 'in-review', 'in-testing', 'todo', 'backlog'] as const

const tooltipWrapperSt: React.CSSProperties = {
  background: '#1a1520',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 8,
  padding: '8px 12px',
  fontSize: 12,
  color: '#ffffff',
}

const legendContainerSt: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 14,
  marginTop: 10,
  flexWrap: 'wrap',
}

const legendItemSt: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 5,
  fontSize: 10,
  color: 'var(--color-fg-muted)',
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload || payload.length === 0) return null

  return (
    <div style={tooltipWrapperSt}>
      <div style={{ marginBottom: 4, fontWeight: 600 }}>{label}</div>
      {payload
        .filter((entry: any) => entry.value > 0)
        .map((entry: any) => (
          <div
            key={entry.dataKey}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              marginTop: 2,
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: entry.color,
                flexShrink: 0,
              }}
            />
            <span>
              {entry.dataKey}: {entry.value}
            </span>
          </div>
        ))}
    </div>
  )
}

export function WorkloadWidget({ data }: WorkloadWidgetProps) {
  if (!data || data.length === 0) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: 180,
          fontSize: 13,
          color: 'var(--color-fg-dim)',
        }}
      >
        No workload data
      </div>
    )
  }

  const chartData = data.map((d) => ({
    person: d.person,
    done: d.statusCounts['done'] || 0,
    'in-progress': d.statusCounts['in-progress'] || 0,
    'in-review': d.statusCounts['in-review'] || 0,
    'in-testing': d.statusCounts['in-testing'] || 0,
    todo: d.statusCounts['todo'] || 0,
    backlog: d.statusCounts['backlog'] || 0,
  }))

  const chartHeight = Math.max(180, data.length * 40)

  return (
    <div>
      <ResponsiveContainer width="100%" height={chartHeight}>
        <BarChart data={chartData} layout="vertical">
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(255,255,255,0.06)"
          />
          <YAxis
            dataKey="person"
            type="category"
            width={80}
            tick={{ fontSize: 11 }}
            stroke="var(--color-fg-dim)"
          />
          <XAxis
            type="number"
            tick={{ fontSize: 10 }}
            stroke="var(--color-fg-dim)"
            allowDecimals={false}
          />
          <Tooltip content={<CustomTooltip />} />
          {STATUS_KEYS.map((status) => (
            <Bar
              key={status}
              dataKey={status}
              stackId="workload"
              fill={STATUS_COLORS[status]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>

      <div style={legendContainerSt}>
        {STATUS_KEYS.map((status) => (
          <div key={status} style={legendItemSt}>
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: STATUS_COLORS[status],
                flexShrink: 0,
              }}
            />
            <span>{status}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
