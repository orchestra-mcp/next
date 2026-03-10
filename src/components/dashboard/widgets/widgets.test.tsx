import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { WIDGET_COMPONENTS } from './index'
import type { WidgetType } from '@/types/dashboard'

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => <a href={href} {...props}>{children}</a>,
}))

describe('WIDGET_COMPONENTS registry', () => {
  it('has all 4 widget types', () => {
    const types: WidgetType[] = ['stats', 'recent_projects', 'recent_notes', 'quick_actions']
    for (const t of types) {
      expect(WIDGET_COMPONENTS[t]).toBeDefined()
      expect(typeof WIDGET_COMPONENTS[t]).toBe('function')
    }
  })
})

describe('StatsWidget', () => {
  it('renders 4 stat cards', () => {
    const Stats = WIDGET_COMPONENTS.stats
    render(<Stats projectCount={3} noteCount={5} toolCount={10} connStatus="connected" />)
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
    expect(screen.getByText('10')).toBeInTheDocument()
    expect(screen.getByText('connected')).toBeInTheDocument()
  })

  it('shows offline when disconnected', () => {
    const Stats = WIDGET_COMPONENTS.stats
    render(<Stats projectCount={0} noteCount={0} toolCount={0} connStatus="disconnected" />)
    expect(screen.getByText('offline')).toBeInTheDocument()
  })
})

describe('RecentProjectsWidget', () => {
  it('renders project list', () => {
    const Projects = WIDGET_COMPONENTS.recent_projects
    const projects = [
      { id: '1', name: 'Project A', description: 'Desc A', created_at: '2026-01-01' },
      { id: '2', name: 'Project B', created_at: '2026-01-02' },
    ]
    render(<Projects projects={projects} />)
    expect(screen.getByText('Project A')).toBeInTheDocument()
    expect(screen.getByText('Project B')).toBeInTheDocument()
    expect(screen.getByText('Desc A')).toBeInTheDocument()
  })

  it('shows empty state when no projects', () => {
    const Projects = WIDGET_COMPONENTS.recent_projects
    render(<Projects projects={[]} />)
    expect(screen.getByText('noProjectsYet')).toBeInTheDocument()
  })
})

describe('RecentNotesWidget', () => {
  it('renders notes list', () => {
    const Notes = WIDGET_COMPONENTS.recent_notes
    const notes = [
      { id: '1', title: 'Note A', updated_at: '2026-01-01' },
      { id: '2', title: 'Note B', updated_at: '2026-01-02' },
    ]
    render(<Notes notes={notes} />)
    expect(screen.getByText('Note A')).toBeInTheDocument()
    expect(screen.getByText('Note B')).toBeInTheDocument()
  })

  it('shows empty state when no notes', () => {
    const Notes = WIDGET_COMPONENTS.recent_notes
    render(<Notes notes={[]} />)
    expect(screen.getByText('noNotesYet')).toBeInTheDocument()
  })
})

describe('QuickActionsWidget', () => {
  it('renders action links', () => {
    const Actions = WIDGET_COMPONENTS.quick_actions
    render(<Actions />)
    expect(screen.getByText('newProject')).toBeInTheDocument()
    expect(screen.getByText('newNote')).toBeInTheDocument()
    expect(screen.getByText('settings')).toBeInTheDocument()
  })

  it('links to correct pages', () => {
    const Actions = WIDGET_COMPONENTS.quick_actions
    render(<Actions />)
    const links = screen.getAllByRole('link')
    const hrefs = links.map(l => l.getAttribute('href'))
    expect(hrefs).toContain('/projects/new')
    expect(hrefs).toContain('/notes/new')
    expect(hrefs).toContain('/settings')
  })
})
