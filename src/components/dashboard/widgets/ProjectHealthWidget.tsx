'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'

type HealthStatus = 'green' | 'yellow' | 'red'

interface ProjectHealthProject {
  id: string
  slug?: string
  name: string
  health: HealthStatus
  completionPct: number
  totalFeatures: number
  doneFeatures: number
  inProgressCount: number
  blockedCount: number
  reviewQueueCount: number
}

interface ProjectHealthWidgetProps {
  projects: ProjectHealthProject[]
}

const HEALTH_COLORS: Record<HealthStatus, string> = {
  green: '#22c55e',
  yellow: '#eab308',
  red: '#ef4444',
}

const RING_SIZE = 60
const RING_STROKE = 5
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS

const cardBaseSt: React.CSSProperties = {
  background: 'var(--color-bg-alt)',
  border: '1px solid var(--color-border)',
  borderRadius: 14,
  padding: '16px 20px',
  textDecoration: 'none',
  display: 'block',
  transition: 'border-color 0.2s ease',
}

const chipBaseSt: React.CSSProperties = {
  fontSize: 11,
  padding: '2px 8px',
  borderRadius: 100,
  border: '1px solid var(--color-border)',
  color: 'var(--color-fg-muted)',
  whiteSpace: 'nowrap',
}

function ProgressRing({ pct, color }: { pct: number; color: string }) {
  const offset = RING_CIRCUMFERENCE - (pct / 100) * RING_CIRCUMFERENCE

  return (
    <svg width={RING_SIZE} height={RING_SIZE} style={{ display: 'block' }}>
      <circle
        cx={RING_SIZE / 2}
        cy={RING_SIZE / 2}
        r={RING_RADIUS}
        fill="none"
        stroke="var(--color-border)"
        strokeWidth={RING_STROKE}
      />
      <circle
        cx={RING_SIZE / 2}
        cy={RING_SIZE / 2}
        r={RING_RADIUS}
        fill="none"
        stroke={color}
        strokeWidth={RING_STROKE}
        strokeLinecap="round"
        strokeDasharray={RING_CIRCUMFERENCE}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${RING_SIZE / 2} ${RING_SIZE / 2})`}
      />
      <text
        x={RING_SIZE / 2}
        y={RING_SIZE / 2}
        textAnchor="middle"
        dominantBaseline="central"
        style={{ fontSize: 14, fontWeight: 700, fill: 'var(--color-fg)' }}
      >
        {pct}%
      </text>
    </svg>
  )
}

function HealthCard({ project }: { project: ProjectHealthProject }) {
  const [hovered, setHovered] = useState(false)
  const t = useTranslations('dashboard')
  const healthColor = HEALTH_COLORS[project.health]

  const cardStyle: React.CSSProperties = {
    ...cardBaseSt,
    borderColor: hovered ? `${healthColor}66` : 'var(--color-border)',
  }

  const blockedChipStyle: React.CSSProperties =
    project.blockedCount > 0
      ? {
          ...chipBaseSt,
          borderColor: '#ef4444',
          color: '#ef4444',
          background: '#ef444410',
        }
      : chipBaseSt

  let doneLabel: string
  try {
    doneLabel = t('done')
  } catch {
    doneLabel = 'done'
  }

  let blockedLabel: string
  try {
    blockedLabel = t('blocked')
  } catch {
    blockedLabel = 'blocked'
  }

  let reviewLabel: string
  try {
    reviewLabel = t('review')
  } catch {
    reviewLabel = 'review'
  }

  return (
    <Link
      href={`/projects/${project.slug || project.id}`}
      style={cardStyle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Top row: name + health dot */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 12,
        }}
      >
        <span
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: 'var(--color-fg)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            marginRight: 8,
          }}
        >
          {project.name}
        </span>
        <span
          style={{
            width: 12,
            height: 12,
            borderRadius: '50%',
            background: healthColor,
            flexShrink: 0,
          }}
        />
      </div>

      {/* Center: progress ring */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: 14,
        }}
      >
        <ProgressRing pct={project.completionPct} color={healthColor} />
      </div>

      {/* Bottom row: stat chips */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          flexWrap: 'wrap',
        }}
      >
        <span style={chipBaseSt}>
          {project.doneFeatures}/{project.totalFeatures} {doneLabel}
        </span>
        <span style={blockedChipStyle}>
          {project.blockedCount} {blockedLabel}
        </span>
        <span style={chipBaseSt}>
          {project.reviewQueueCount} {reviewLabel}
        </span>
      </div>
    </Link>
  )
}

export function ProjectHealthWidget({ projects }: ProjectHealthWidgetProps) {
  const t = useTranslations('dashboard')

  if (projects.length === 0) {
    let emptyText: string
    try {
      emptyText = t('noProjectsYet')
    } catch {
      emptyText = 'No projects yet'
    }

    return (
      <div
        style={{
          textAlign: 'center',
          padding: '28px 0',
          color: 'var(--color-fg-dim)',
          fontSize: 13,
        }}
      >
        {emptyText}
      </div>
    )
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: 14,
      }}
    >
      {projects.map((project) => (
        <HealthCard key={project.id} project={project} />
      ))}
    </div>
  )
}
