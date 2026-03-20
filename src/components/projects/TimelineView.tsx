'use client'

import { useMemo } from 'react'

interface TimelineViewProps {
  features: Array<{
    id: string
    title: string
    status: string
    priority: string
    assignee: string
    startDate?: string
    endDate?: string
    dependsOn?: string[]
  }>
  onFeatureClick?: (featureId: string) => void
}

const STATUS_COLORS: Record<string, string> = {
  'backlog': '#374151',
  'todo': '#6b7280',
  'in-progress': '#00e5ff',
  'in-testing': '#eab308',
  'in-docs': '#6366f1',
  'in-review': '#a900ff',
  'needs-edits': '#f97316',
  'done': '#22c55e',
}

const DAY_WIDTH = 32
const LABEL_COLUMN_WIDTH = 200
const ROW_HEIGHT = 36
const HEADER_HEIGHT = 36
const BAR_HEIGHT = 20
const BAR_MARGIN_TOP = 8
const BUFFER_DAYS = 7

function toStartOfDay(date: Date): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

function daysBetween(a: Date, b: Date): number {
  const msPerDay = 86400000
  return Math.round((b.getTime() - a.getTime()) / msPerDay)
}

function formatDateLabel(date: Date): string {
  return `${date.getMonth() + 1}/${date.getDate()}`
}

export function TimelineView({ features, onFeatureClick }: TimelineViewProps) {
  const today = useMemo(() => toStartOfDay(new Date()), [])

  const processedFeatures = useMemo(() => {
    return features.map((f) => {
      const hasStart = !!f.startDate
      const hasEnd = !!f.endDate
      const start = f.startDate ? toStartOfDay(new Date(f.startDate)) : today
      const end = f.endDate ? toStartOfDay(new Date(f.endDate)) : addDays(start, 7)
      const isEstimated = !hasStart || !hasEnd

      return {
        ...f,
        start,
        end,
        isEstimated,
      }
    })
  }, [features, today])

  const { rangeStart, rangeEnd, totalDays } = useMemo(() => {
    if (processedFeatures.length === 0) {
      const rs = addDays(today, -BUFFER_DAYS)
      const re = addDays(today, BUFFER_DAYS)
      return { rangeStart: rs, rangeEnd: re, totalDays: daysBetween(rs, re) }
    }

    let minDate = processedFeatures[0].start
    let maxDate = processedFeatures[0].end

    for (const f of processedFeatures) {
      if (f.start < minDate) minDate = f.start
      if (f.end > maxDate) maxDate = f.end
    }

    const rs = addDays(minDate, -BUFFER_DAYS)
    const re = addDays(maxDate, BUFFER_DAYS)

    return { rangeStart: rs, rangeEnd: re, totalDays: daysBetween(rs, re) }
  }, [processedFeatures, today])

  const dateColumns = useMemo(() => {
    const columns: Array<{ date: Date; showLabel: boolean }> = []
    for (let i = 0; i <= totalDays; i++) {
      const date = addDays(rangeStart, i)
      columns.push({ date, showLabel: i % 7 === 0 })
    }
    return columns
  }, [rangeStart, totalDays])

  const todayOffset = useMemo(() => {
    const diff = daysBetween(rangeStart, today)
    if (diff < 0 || diff > totalDays) return null
    return diff * DAY_WIDTH
  }, [rangeStart, today, totalDays])

  const timelineWidth = (totalDays + 1) * DAY_WIDTH

  if (features.length === 0) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 48,
        }}
      >
        <span style={{ fontSize: 13, color: 'var(--color-fg-dim)' }}>
          No features to display
        </span>
      </div>
    )
  }

  return (
    <div
      style={{
        overflowX: 'auto',
        padding: '16px 0',
        position: 'relative',
      }}
    >
      <div
        style={{
          display: 'flex',
          minWidth: LABEL_COLUMN_WIDTH + timelineWidth,
          position: 'relative',
        }}
      >
        {/* Label column */}
        <div
          style={{
            width: LABEL_COLUMN_WIDTH,
            minWidth: LABEL_COLUMN_WIDTH,
            flexShrink: 0,
            position: 'sticky',
            left: 0,
            zIndex: 2,
            background: 'var(--color-bg)',
          }}
        >
          {/* Header spacer for label column */}
          <div
            style={{
              height: HEADER_HEIGHT,
              background: 'var(--color-bg-alt)',
              borderBottom: '1px solid var(--color-border)',
              borderRight: '1px solid var(--color-border)',
            }}
          />

          {/* Feature labels */}
          {processedFeatures.map((feature) => (
            <div
              key={feature.id}
              style={{
                height: ROW_HEIGHT,
                borderBottom: '1px solid var(--color-border)',
                borderRight: '1px solid var(--color-border)',
                padding: '4px 12px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                cursor: onFeatureClick ? 'pointer' : 'default',
                overflow: 'hidden',
              }}
              onClick={() => onFeatureClick?.(feature.id)}
            >
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  color: 'var(--color-fg)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {feature.title}
              </div>
              {feature.assignee && (
                <div
                  style={{
                    fontSize: 10,
                    color: 'var(--color-fg-dim)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {feature.assignee}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Timeline area */}
        <div
          style={{
            flex: 1,
            position: 'relative',
            minWidth: timelineWidth,
          }}
        >
          {/* Date header row */}
          <div
            style={{
              height: HEADER_HEIGHT,
              background: 'var(--color-bg-alt)',
              borderBottom: '1px solid var(--color-border)',
              position: 'relative',
              display: 'flex',
            }}
          >
            {dateColumns.map((col, i) => (
              <div
                key={i}
                style={{
                  width: DAY_WIDTH,
                  minWidth: DAY_WIDTH,
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'center',
                  paddingBottom: 4,
                }}
              >
                {col.showLabel && (
                  <span
                    style={{
                      fontSize: 10,
                      color: 'var(--color-fg-dim)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {formatDateLabel(col.date)}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Feature rows */}
          {processedFeatures.map((feature) => {
            const startOffset = daysBetween(rangeStart, feature.start)
            const duration = daysBetween(feature.start, feature.end)
            const barLeft = startOffset * DAY_WIDTH
            const barWidth = Math.max(duration * DAY_WIDTH, DAY_WIDTH)
            const statusColor = STATUS_COLORS[feature.status] ?? '#6b7280'

            const tooltipText = [
              feature.id,
              feature.status,
              feature.priority,
              `${formatDateLabel(feature.start)} \u2192 ${formatDateLabel(feature.end)}`,
            ].join(' | ')

            return (
              <div
                key={feature.id}
                style={{
                  height: ROW_HEIGHT,
                  borderBottom: '1px solid var(--color-border)',
                  position: 'relative',
                }}
              >
                <div
                  title={tooltipText}
                  onClick={() => onFeatureClick?.(feature.id)}
                  style={{
                    position: 'absolute',
                    left: barLeft,
                    top: BAR_MARGIN_TOP,
                    width: barWidth,
                    height: BAR_HEIGHT,
                    borderRadius: 4,
                    backgroundColor: statusColor,
                    opacity: feature.isEstimated ? 0.5 : 1,
                    borderStyle: feature.isEstimated ? 'dashed' : 'solid',
                    borderWidth: feature.isEstimated ? 1 : 0,
                    borderColor: feature.isEstimated ? statusColor : 'transparent',
                    cursor: onFeatureClick ? 'pointer' : 'default',
                    transition: 'opacity 0.15s ease',
                  }}
                />
              </div>
            )
          })}

          {/* Today marker */}
          {todayOffset !== null && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: todayOffset + DAY_WIDTH / 2,
                width: 2,
                height: HEADER_HEIGHT + processedFeatures.length * ROW_HEIGHT,
                backgroundColor: '#00e5ff',
                opacity: 0.5,
                pointerEvents: 'none',
                zIndex: 1,
              }}
            />
          )}
        </div>
      </div>
    </div>
  )
}
