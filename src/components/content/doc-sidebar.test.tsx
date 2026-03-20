import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

import { DocSidebar } from './doc-sidebar'

const mockDocs = [
  { id: 1, slug: 'getting-started', title: 'Getting Started', entity_type: 'doc', description: 'A quick intro to the platform', updated_at: '2026-03-20T10:00:00Z' },
  { id: 2, slug: 'api-reference', title: 'API Reference', entity_type: 'doc', description: 'Complete API documentation', updated_at: '2026-03-20T09:00:00Z' },
  { id: 3, slug: 'deployment', title: 'Deployment Guide', entity_type: 'doc', description: '', updated_at: '2026-03-20T08:00:00Z' },
]

describe('DocSidebar', () => {
  it('renders all docs', () => {
    render(<DocSidebar docs={mockDocs} handle="alice" />)
    expect(screen.getByText('Getting Started')).toBeInTheDocument()
    expect(screen.getByText('API Reference')).toBeInTheDocument()
    expect(screen.getByText('Deployment Guide')).toBeInTheDocument()
  })

  it('shows descriptions when available', () => {
    render(<DocSidebar docs={mockDocs} handle="alice" />)
    expect(screen.getByText('A quick intro to the platform')).toBeInTheDocument()
    expect(screen.getByText('Complete API documentation')).toBeInTheDocument()
  })

  it('highlights active doc', () => {
    render(<DocSidebar docs={mockDocs} handle="alice" activeSlug="api-reference" />)
    const activeLink = screen.getByText('API Reference').closest('a')
    expect(activeLink?.style.borderLeft).toContain('2px solid')
  })

  it('links to doc detail pages', () => {
    render(<DocSidebar docs={mockDocs} handle="alice" />)
    const link = screen.getByText('Getting Started').closest('a')
    expect(link).toHaveAttribute('href', '/@alice/docs/getting-started')
  })

  it('filters docs on search', () => {
    render(<DocSidebar docs={mockDocs} handle="alice" />)
    const input = screen.getByPlaceholderText('Search docs...')
    fireEvent.change(input, { target: { value: 'deploy' } })

    expect(screen.getByText('Deployment Guide')).toBeInTheDocument()
    expect(screen.queryByText('Getting Started')).not.toBeInTheDocument()
    expect(screen.queryByText('API Reference')).not.toBeInTheDocument()
  })

  it('shows empty state when search has no results', () => {
    render(<DocSidebar docs={mockDocs} handle="alice" />)
    const input = screen.getByPlaceholderText('Search docs...')
    fireEvent.change(input, { target: { value: 'nonexistent' } })

    expect(screen.getByText('No matching docs')).toBeInTheDocument()
  })

  it('shows empty state when no docs', () => {
    render(<DocSidebar docs={[]} handle="alice" />)
    expect(screen.getByText('No docs')).toBeInTheDocument()
  })

  it('truncates long descriptions', () => {
    const longDesc = 'A'.repeat(100)
    const docs = [{ id: 1, slug: 'long', title: 'Long Doc', entity_type: 'doc', description: longDesc, updated_at: '2026-03-20T10:00:00Z' }]
    render(<DocSidebar docs={docs} handle="alice" />)
    expect(screen.getByText(longDesc.slice(0, 60) + '...')).toBeInTheDocument()
  })
})
