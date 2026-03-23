'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

/* ── Types ──────────────────────────────────────────────── */

interface AnalyticsCardProps {
  contentId: number
  period?: '7d' | '30d' | '90d'
}

interface AnalyticsData {
  content_id: number
  period: string
  total_views: number
  unique_visitors: number
  all_time_views: number
  all_time_unique: number
  daily_views: Array<{ date: string; views: number }>
  top_referers: Array<{ referer: string; count: number }>
}

type Period = '7d' | '30d' | '90d'

/* ── Styles ─────────────────────────────────────────────── */

const containerSt: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 18,
}

const periodRowSt: React.CSSProperties = {
  display: 'flex',
  gap: 6,
}

const pillBaseSt: React.CSSProperties = {
  padding: '5px 14px',
  borderRadius: 20,
  fontSize: 12,
  fontWeight: 600,
  border: '1px solid var(--color-border)',
  background: 'transparent',
  color: 'var(--color-fg-dim)',
  cursor: 'pointer',
  transition: 'all 0.15s ease',
}

const pillActiveSt: React.CSSProperties = {
  ...pillBaseSt,
  background: 'rgba(0, 229, 255, 0.1)',
  borderColor: 'rgba(0, 229, 255, 0.3)',
  color: '#00e5ff',
}

const statsRowSt: React.CSSProperties = {
  display: 'flex',
  gap: 10,
}

const statCardSt: React.CSSProperties = {
  flex: 1,
  borderRadius: 10,
  border: '1px solid var(--color-border)',
  background: 'var(--color-bg-alt)',
  padding: 14,
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
}

const iconCircleSt = (color: string): React.CSSProperties => ({
  width: 32,
  height: 32,
  borderRadius: '50%',
  background: `${color}18`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
})

const statValueSt: React.CSSProperties = {
  fontSize: 20,
  fontWeight: 600,
  color: 'var(--color-fg)',
  lineHeight: 1,
}

const statLabelSt: React.CSSProperties = {
  fontSize: 11,
  color: 'var(--color-fg-dim)',
}

const tooltipSt: React.CSSProperties = {
  background: '#1a1520',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 8,
  padding: '8px 12px',
  fontSize: 12,
  color: '#ffffff',
}

const referersSectionSt: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
}

const refererHeaderSt: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 600,
  color: 'var(--color-fg)',
}

const refererRowSt: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '6px 0',
  borderBottom: '1px solid var(--color-border)',
}

const refererNameSt: React.CSSProperties = {
  fontSize: 12,
  color: 'var(--color-fg)',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  maxWidth: '70%',
}

const refererCountSt: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  color: 'var(--color-fg-dim)',
  flexShrink: 0,
}

const loadingSt: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: 200,
  fontSize: 13,
  color: 'var(--color-fg-dim)',
}

/* ── Helpers ────────────────────────────────────────────── */

function formatDateTick(value: string): string {
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

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}

const PERIODS: Period[] = ['7d', '30d', '90d']

const STAT_CARDS = [
  { key: 'total_views' as const, label: 'Total Views', icon: 'bx-show', color: '#00e5ff' },
  { key: 'unique_visitors' as const, label: 'Unique Visitors', icon: 'bx-user', color: '#a855f7' },
  { key: 'all_time_views' as const, label: 'All-Time Views', icon: 'bx-bar-chart-alt-2', color: '#22c55e' },
]

/* ── Tooltip ────────────────────────────────────────────── */

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload || payload.length === 0) return null

  return (
    <div style={tooltipSt}>
      <div style={{ marginBottom: 4, fontWeight: 600 }}>{label}</div>
      {payload.map((entry: any) => (
        <div key={entry.dataKey} style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: entry.color || '#00e5ff',
              flexShrink: 0,
            }}
          />
          <span>Views: {entry.value}</span>
        </div>
      ))}
    </div>
  )
}

/* ── Component ──────────────────────────────────────────── */

export default function AnalyticsCard({ contentId, period: initialPeriod = '30d' }: AnalyticsCardProps) {
  const [period, setPeriod] = useState<Period>(initialPeriod)
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const fetchAnalytics = useCallback(async (p: Period) => {
    setLoading(true)
    setError(false)
    try {
      const sb = createClient()
      const { data: result, error: err } = await sb.rpc('get_share_analytics', { p_content_id: contentId, p_period: p })
      if (err) throw err
      setData(result as unknown as AnalyticsData)
    } catch {
      setError(true)
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [contentId])

  useEffect(() => {
    fetchAnalytics(period)
  }, [period, fetchAnalytics])

  const handlePeriodChange = (p: Period) => {
    setPeriod(p)
  }

  if (error) return <div />

  if (loading) {
    return <div style={loadingSt}>Loading analytics...</div>
  }

  if (!data) return <div />

  const chartData = (data.daily_views || []).map((d) => ({
    ...d,
    date: formatDateTick(d.date),
  }))

  const topReferers = (data.top_referers || []).slice(0, 5)

  return (
    <div style={containerSt}>
      {/* Period selector */}
      <div style={periodRowSt}>
        {PERIODS.map((p) => (
          <button
            key={p}
            onClick={() => handlePeriodChange(p)}
            style={p === period ? pillActiveSt : pillBaseSt}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Stat cards */}
      <div style={statsRowSt}>
        {STAT_CARDS.map((stat) => (
          <div key={stat.key} style={statCardSt}>
            <div style={iconCircleSt(stat.color)}>
              <i className={`bx ${stat.icon}`} style={{ fontSize: 16, color: stat.color }} />
            </div>
            <div style={statValueSt}>{formatNumber(data[stat.key])}</div>
            <div style={statLabelSt}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Line chart */}
      {chartData.length > 0 && (
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis
              dataKey="date"
              type="category"
              tick={{ fontSize: 10, fill: 'var(--color-fg-dim)' }}
              stroke="var(--color-fg-dim)"
            />
            <YAxis
              tick={{ fontSize: 10, fill: 'var(--color-fg-dim)' }}
              stroke="var(--color-fg-dim)"
              allowDecimals={false}
            />
            <Tooltip content={<ChartTooltip />} />
            <Line
              type="monotone"
              dataKey="views"
              stroke="#00e5ff"
              strokeWidth={2}
              dot={{ r: 3, fill: '#00e5ff', strokeWidth: 0 }}
              activeDot={{ r: 5, fill: '#00e5ff', strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}

      {/* Top referers */}
      {topReferers.length > 0 && (
        <div style={referersSectionSt}>
          <div style={refererHeaderSt}>Top Referers</div>
          {topReferers.map((ref, idx) => (
            <div key={idx} style={refererRowSt}>
              <span style={refererNameSt}>{ref.referer || 'Direct'}</span>
              <span style={refererCountSt}>{formatNumber(ref.count)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
