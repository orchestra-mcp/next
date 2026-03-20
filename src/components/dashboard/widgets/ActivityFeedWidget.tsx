'use client'

import { useState } from 'react'
import Link from 'next/link'
import { relativeTime } from '@/lib/mcp-parsers'

interface Activity {
  id: string
  timestamp: string
  featureId: string
  featureTitle: string
  projectId: string
  projectName: string
  action: 'created' | 'advanced' | 'completed' | 'blocked' | 'assigned'
  fromStatus?: string
  toStatus?: string
  actor?: string
}

interface ActivityFeedWidgetProps {
  activities: Activity[]
}

const MAX_VISIBLE = 15

const ACTION_COLORS: Record<Activity['action'], string> = {
  created: '#22c55e',
  advanced: '#a900ff',
  completed: '#00e5ff',
  blocked: '#ef4444',
  assigned: '#eab308',
}

function getActionDescription(activity: Activity): string {
  switch (activity.action) {
    case 'created':
      return `Created in ${activity.projectName}`
    case 'advanced':
      return `${activity.fromStatus || '?'} \u2192 ${activity.toStatus || '?'}`
    case 'completed':
      return 'Completed'
    case 'blocked':
      return 'Blocked'
    case 'assigned':
      return `Assigned to ${activity.actor || 'unknown'}`
  }
}

const viewAllLinkSt: React.CSSProperties = {
  display: 'block',
  textAlign: 'center',
  padding: '12px 0 4px',
  fontSize: 12,
  fontWeight: 500,
  color: 'var(--color-fg-muted)',
  textDecoration: 'none',
}

function ActivityRow({
  activity,
  isLast,
}: {
  activity: Activity
  isLast: boolean
}) {
  const [hovered, setHovered] = useState(false)
  const dotColor = ACTION_COLORS[activity.action]

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
          {activity.featureTitle}
        </span>
        <span
          style={{
            fontSize: 12,
            color: 'var(--color-fg-muted)',
          }}
        >
          {getActionDescription(activity)}
        </span>
        <span
          style={{
            fontSize: 11,
            color: 'var(--color-fg-dim)',
          }}
        >
          {relativeTime(activity.timestamp)}
        </span>
      </div>
    </div>
  )
}

export function ActivityFeedWidget({ activities }: ActivityFeedWidgetProps) {
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
        No recent activity
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
      {activities.length > MAX_VISIBLE && (
        <Link href="/activity" style={viewAllLinkSt}>
          View all
        </Link>
      )}
    </div>
  )
}
