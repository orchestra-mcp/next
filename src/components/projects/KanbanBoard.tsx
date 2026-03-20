'use client'

import { useState, useCallback } from 'react'

interface KanbanBoardProps {
  features: Array<{
    id: string
    title: string
    status: string
    priority: string
    kind: string
    assignee: string
    estimate?: string
  }>
  projectId: string
  onStatusChange?: (featureId: string, newStatus: string) => void
  onFeatureClick?: (featureId: string) => void
}

const COLUMN_ORDER = [
  'backlog',
  'todo',
  'in-progress',
  'in-testing',
  'in-docs',
  'in-review',
  'needs-edits',
  'done',
] as const

const KEY_STATUSES = new Set(['todo', 'in-progress', 'done'])

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

const PRIORITY_COLORS: Record<string, string> = {
  'P0': '#ef4444',
  'P1': '#f97316',
  'P2': '#eab308',
  'P3': '#6b7280',
}

function getNextStatus(current: string): string | null {
  const idx = COLUMN_ORDER.indexOf(current as typeof COLUMN_ORDER[number])
  if (idx === -1 || idx >= COLUMN_ORDER.length - 1) return null
  return COLUMN_ORDER[idx + 1]
}

function formatStatusLabel(status: string): string {
  return status.replace(/-/g, ' ')
}

export function KanbanBoard({
  features,
  projectId,
  onStatusChange,
  onFeatureClick,
}: KanbanBoardProps) {
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null)
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)

  const featuresByStatus = new Map<string, typeof features>()
  for (const feature of features) {
    const list = featuresByStatus.get(feature.status)
    if (list) {
      list.push(feature)
    } else {
      featuresByStatus.set(feature.status, [feature])
    }
  }

  const visibleColumns = COLUMN_ORDER.filter(
    (status) => KEY_STATUSES.has(status) || featuresByStatus.has(status)
  )

  const handleDragStart = useCallback(
    (e: React.DragEvent<HTMLDivElement>, featureId: string) => {
      e.dataTransfer.setData('text/plain', featureId)
      e.dataTransfer.effectAllowed = 'move'
    },
    []
  )

  const handleDragOver = useCallback(
    (e: React.DragEvent<HTMLDivElement>, status: string) => {
      e.preventDefault()
      e.dataTransfer.dropEffect = 'move'
      setDragOverColumn(status)
    },
    []
  )

  const handleDragLeave = useCallback(
    (e: React.DragEvent<HTMLDivElement>, status: string) => {
      const relatedTarget = e.relatedTarget as HTMLElement | null
      const currentTarget = e.currentTarget as HTMLElement
      if (relatedTarget && currentTarget.contains(relatedTarget)) return
      setDragOverColumn((prev) => (prev === status ? null : prev))
    },
    []
  )

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>, targetStatus: string) => {
      e.preventDefault()
      setDragOverColumn(null)
      const featureId = e.dataTransfer.getData('text/plain')
      if (featureId && onStatusChange) {
        onStatusChange(featureId, targetStatus)
      }
    },
    [onStatusChange]
  )

  const handleAdvance = useCallback(
    (e: React.MouseEvent, featureId: string, currentStatus: string) => {
      e.stopPropagation()
      const next = getNextStatus(currentStatus)
      if (next && onStatusChange) {
        onStatusChange(featureId, next)
      }
    },
    [onStatusChange]
  )

  return (
    <div
      style={{
        display: 'flex',
        gap: 14,
        overflowX: 'auto',
        paddingBottom: 12,
      }}
    >
      {visibleColumns.map((status) => {
        const columnFeatures = featuresByStatus.get(status) ?? []
        const statusColor = STATUS_COLORS[status] ?? '#6b7280'
        const isDragOver = dragOverColumn === status

        return (
          <div
            key={status}
            style={{
              minWidth: 260,
              maxWidth: 300,
              flexShrink: 0,
            }}
          >
            {/* Column Header */}
            <div
              style={{
                background: 'var(--color-bg-alt)',
                borderRadius: '10px 10px 0 0',
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: statusColor,
                    display: 'inline-block',
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    textTransform: 'capitalize',
                    color: 'var(--color-fg)',
                  }}
                >
                  {formatStatusLabel(status)}
                </span>
              </div>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 500,
                  background: 'var(--color-bg-active)',
                  borderRadius: 100,
                  padding: '2px 8px',
                  color: 'var(--color-fg)',
                }}
              >
                {columnFeatures.length}
              </span>
            </div>

            {/* Column Body */}
            <div
              onDragOver={(e) => handleDragOver(e, status)}
              onDragLeave={(e) => handleDragLeave(e, status)}
              onDrop={(e) => handleDrop(e, status)}
              style={{
                background: 'var(--color-bg)',
                borderRadius: '0 0 10px 10px',
                border: `1px solid ${isDragOver ? statusColor : 'var(--color-border)'}`,
                borderTop: 'none',
                padding: 8,
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                minHeight: 120,
                transition: 'border-color 0.15s ease',
              }}
            >
              {columnFeatures.length === 0 ? (
                <div
                  style={{
                    border: '1px dashed var(--color-border)',
                    borderRadius: 8,
                    padding: 16,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: 80,
                  }}
                >
                  <span
                    style={{
                      fontSize: 12,
                      color: 'var(--color-fg-dim)',
                    }}
                  >
                    Drop here
                  </span>
                </div>
              ) : (
                columnFeatures.map((feature) => {
                  const isHovered = hoveredCard === feature.id
                  const priorityColor =
                    PRIORITY_COLORS[feature.priority] ?? '#6b7280'
                  const nextStatus = getNextStatus(feature.status)

                  return (
                    <div
                      key={feature.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, feature.id)}
                      onClick={() => onFeatureClick?.(feature.id)}
                      onMouseEnter={() => setHoveredCard(feature.id)}
                      onMouseLeave={() => setHoveredCard(null)}
                      style={{
                        background: 'var(--color-bg-alt)',
                        border: `1px solid ${isHovered ? statusColor + '66' : 'var(--color-border)'}`,
                        borderRadius: 10,
                        padding: '12px 14px',
                        cursor: 'pointer',
                        transition: 'border-color 0.15s ease',
                      }}
                    >
                      {/* Title */}
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 500,
                          color: 'var(--color-fg)',
                          overflow: 'hidden',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                        }}
                      >
                        {feature.title}
                      </div>

                      {/* ID */}
                      <div
                        style={{
                          fontSize: 11,
                          color: 'var(--color-fg-dim)',
                          marginTop: 4,
                        }}
                      >
                        {feature.id}
                      </div>

                      {/* Bottom row */}
                      <div
                        style={{
                          display: 'flex',
                          gap: 6,
                          marginTop: 8,
                          alignItems: 'center',
                        }}
                      >
                        {/* Priority badge */}
                        <span
                          style={{
                            fontSize: 10,
                            padding: '1px 6px',
                            borderRadius: 4,
                            background: `${priorityColor}15`,
                            border: `1px solid ${priorityColor}30`,
                            color: priorityColor,
                          }}
                        >
                          {feature.priority}
                        </span>

                        {/* Kind badge */}
                        <span
                          style={{
                            fontSize: 10,
                            padding: '1px 6px',
                            borderRadius: 4,
                            background: 'var(--color-bg-active)',
                            border: '1px solid var(--color-border)',
                            color: 'var(--color-fg-muted)',
                            textTransform: 'capitalize',
                          }}
                        >
                          {feature.kind}
                        </span>

                        {/* Spacer */}
                        <span style={{ flex: 1 }} />

                        {/* Assignee */}
                        {feature.assignee && (
                          <span
                            style={{
                              fontSize: 11,
                              color: 'var(--color-fg-muted)',
                            }}
                          >
                            {feature.assignee.slice(0, 8)}
                          </span>
                        )}

                        {/* Advance button */}
                        {isHovered && nextStatus && onStatusChange && (
                          <button
                            onClick={(e) =>
                              handleAdvance(e, feature.id, feature.status)
                            }
                            title={`Move to ${formatStatusLabel(nextStatus)}`}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              padding: 0,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'var(--color-fg-muted)',
                              fontSize: 16,
                              lineHeight: 1,
                              transition: 'color 0.15s ease',
                            }}
                            onMouseEnter={(e) => {
                              ;(e.currentTarget as HTMLElement).style.color =
                                statusColor
                            }}
                            onMouseLeave={(e) => {
                              ;(e.currentTarget as HTMLElement).style.color =
                                'var(--color-fg-muted)'
                            }}
                          >
                            <i className="bx bx-right-arrow-alt" />
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
