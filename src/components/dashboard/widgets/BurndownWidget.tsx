'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { SearchableSelect } from '@/components/ui/searchable-select'

interface BurndownWidgetProps {
  data: Array<{ date: string; remaining: number; ideal: number }>
  projects?: Array<{ id: string; name: string }>
  activeProjectId?: string | null
  onSelectProject?: (id: string) => void
}

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
  gap: 18,
  marginTop: 10,
}

const legendItemSt: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  fontSize: 11,
  color: 'var(--color-fg-muted)',
}

const selectSt: React.CSSProperties = {
  background: '#1a1520',
  color: '#ffffff',
  border: '1px solid rgba(255,255,255,0.15)',
  borderRadius: 6,
  padding: '4px 8px',
  fontSize: 12,
  outline: 'none',
  cursor: 'pointer',
  marginBottom: 10,
}

function formatDateTick(value: string): string {
  const d = new Date(value)
  if (isNaN(d.getTime())) {
    // Fallback: try to extract month/day from a string like "2026-03-15"
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
              background: entry.color,
              flexShrink: 0,
            }}
          />
          <span>{entry.name}: {entry.value}</span>
        </div>
      ))}
    </div>
  )
}

export function BurndownWidget({
  data,
  projects,
  activeProjectId,
  onSelectProject,
}: BurndownWidgetProps) {
  if (!data || data.length <= 1) {
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
        No burndown data yet
      </div>
    )
  }

  return (
    <div>
      {projects && projects.length > 0 && (
        <SearchableSelect
          style={selectSt}
          value={activeProjectId ?? ''}
          onChange={(val) => onSelectProject?.(val)}
          options={projects.map((p) => ({ value: p.id, label: p.name }))}
          placeholder="Select project"
        />
      )}

      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="burndownGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#a900ff" stopOpacity={0.2} />
              <stop offset="100%" stopColor="#a900ff" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
          <XAxis
            dataKey="date"
            type="category"
            tick={{ fontSize: 10, fill: 'var(--color-fg-dim)' }}
            stroke="var(--color-fg-dim)"
            tickFormatter={formatDateTick}
          />
          <YAxis
            tick={{ fontSize: 10, fill: 'var(--color-fg-dim)' }}
            stroke="var(--color-fg-dim)"
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="remaining"
            name="Remaining"
            stroke="#a900ff"
            strokeWidth={2}
            fill="url(#burndownGradient)"
          />
          <Area
            type="monotone"
            dataKey="ideal"
            name="Ideal"
            stroke="#6b7280"
            strokeWidth={1}
            strokeDasharray="6 4"
            fill="none"
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>

      <div style={legendContainerSt}>
        <div style={legendItemSt}>
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: '#a900ff',
              flexShrink: 0,
            }}
          />
          <span>Remaining</span>
        </div>
        <div style={legendItemSt}>
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: '#6b7280',
              flexShrink: 0,
            }}
          />
          <span>Ideal</span>
        </div>
      </div>
    </div>
  )
}
