'use client'

import { useState } from 'react'
import { uploadUrl } from '@/lib/api'
import { relativeTime } from '@/lib/mcp-parsers'

export interface TeamActivity {
  id: number
  title: string
  entity_type: string
  slug: string
  author_name: string
  author_avatar: string
  user_id: number
  updated_at: string
}

interface TeamActivityWidgetProps {
  activities: TeamActivity[]
}

const MAX_VISIBLE = 10

const ENTITY_TYPE_COLORS: Record<string, string> = {
  note: '#22c55e',
  skill: '#3b82f6',
  agent: '#a855f7',
  workflow: '#f59e0b',
  prompt: '#ec4899',
  api_collection: '#7c4dff',
  presentation: '#ff6d00',
  doc: '#00c853',
}

function ActivityRow({
  activity,
  isLast,
}: {
  activity: TeamActivity
  isLast: boolean
}) {
  const [hovered, setHovered] = useState(false)
  const dotColor = ENTITY_TYPE_COLORS[activity.entity_type] || 'var(--color-fg-dim)'

  const rowStyle: React.CSSProperties = {
    display: 'flex',
    gap: 12,
    padding: '8px 0',
    borderBottom: isLast ? 'none' : '1px solid var(--color-border)',
    background: hovered ? 'var(--color-bg-active)' : 'transparent',
    borderRadius: hovered ? 6 : 0,
    cursor: 'default',
    transition: 'background 0.15s ease',
  }

  return (
    <div
      style={rowStyle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Left: dot + vertical line */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: 16,
          flexShrink: 0,
          paddingTop: 4,
        }}
      >
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: dotColor,
            flexShrink: 0,
          }}
        />
        {!isLast && (
          <span
            style={{
              width: 2,
              flex: 1,
              marginTop: 4,
              background: 'var(--color-border)',
              borderRadius: 1,
            }}
          />
        )}
      </div>

      {/* Right: content */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          flex: 1,
          overflow: 'hidden',
        }}
      >
        <span
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: 'var(--color-fg)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {activity.title}
        </span>
        <span
          style={{
            fontSize: 12,
            color: 'var(--color-fg-muted)',
          }}
        >
          {activity.author_name}
        </span>
        <span
          style={{
            fontSize: 11,
            color: 'var(--color-fg-dim)',
          }}
        >
          {relativeTime(activity.updated_at)}
        </span>
      </div>
    </div>
  )
}

export function TeamActivityWidget({ activities }: TeamActivityWidgetProps) {
  if (!activities || activities.length === 0) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: 120,
          fontSize: 13,
          color: 'var(--color-fg-dim)',
        }}
      >
        No team activity
      </div>
    )
  }

  const visible = activities.slice(0, MAX_VISIBLE)

  return (
    <div>
      {visible.map((activity, idx) => (
        <ActivityRow
          key={activity.id}
          activity={activity}
          isLast={idx === visible.length - 1}
        />
      ))}
    </div>
  )
}
