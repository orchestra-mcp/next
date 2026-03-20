import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('@/lib/mcp-parsers', () => ({
  relativeTime: (ts: string) => '5m ago',
}))

vi.mock('@/lib/api', () => ({
  uploadUrl: (path: string) => path ? `/uploads/${path}` : '',
}))

import { TeamActivityWidget } from './TeamActivityWidget'

const mockActivities = [
  {
    id: 1,
    title: 'API Design Guide',
    entity_type: 'doc',
    slug: 'api-design-guide',
    author_name: 'Alice',
    author_avatar: 'alice.jpg',
    user_id: 1,
    updated_at: '2026-03-20T10:00:00Z',
  },
  {
    id: 2,
    title: 'Deploy Script',
    entity_type: 'prompt',
    slug: 'deploy-script',
    author_name: 'Bob',
    author_avatar: '',
    user_id: 2,
    updated_at: '2026-03-20T09:00:00Z',
  },
  {
    id: 3,
    title: 'Auth Workflow',
    entity_type: 'workflow',
    slug: 'auth-workflow',
    author_name: 'Charlie',
    author_avatar: 'charlie.jpg',
    user_id: 3,
    updated_at: '2026-03-20T08:00:00Z',
  },
]

describe('TeamActivityWidget', () => {
  it('renders activity items', () => {
    render(<TeamActivityWidget activities={mockActivities} />)
    expect(screen.getByText('API Design Guide')).toBeInTheDocument()
    expect(screen.getByText('Deploy Script')).toBeInTheDocument()
    expect(screen.getByText('Auth Workflow')).toBeInTheDocument()
  })

  it('shows author names', () => {
    render(<TeamActivityWidget activities={mockActivities} />)
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('Bob')).toBeInTheDocument()
    expect(screen.getByText('Charlie')).toBeInTheDocument()
  })

  it('shows relative timestamps', () => {
    render(<TeamActivityWidget activities={mockActivities} />)
    const timestamps = screen.getAllByText('5m ago')
    expect(timestamps.length).toBe(3)
  })

  it('shows empty state when no activities', () => {
    render(<TeamActivityWidget activities={[]} />)
    expect(screen.getByText('No team activity')).toBeInTheDocument()
  })

  it('shows empty state when activities is undefined', () => {
    render(<TeamActivityWidget activities={undefined as any} />)
    expect(screen.getByText('No team activity')).toBeInTheDocument()
  })

  it('limits to 10 visible items', () => {
    const manyActivities = Array.from({ length: 15 }, (_, i) => ({
      id: i + 1,
      title: `Activity ${i + 1}`,
      entity_type: 'note',
      slug: `activity-${i + 1}`,
      author_name: 'User',
      author_avatar: '',
      user_id: 1,
      updated_at: '2026-03-20T10:00:00Z',
    }))

    render(<TeamActivityWidget activities={manyActivities} />)

    // Should show first 10
    expect(screen.getByText('Activity 1')).toBeInTheDocument()
    expect(screen.getByText('Activity 10')).toBeInTheDocument()
    // Should NOT show 11th
    expect(screen.queryByText('Activity 11')).not.toBeInTheDocument()
  })
})
