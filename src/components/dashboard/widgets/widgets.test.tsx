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
  it('has all widget types including new ones', () => {
    const types: WidgetType[] = ['stats', 'recent_projects', 'recent_notes', 'quick_actions', 'api_collections', 'presentations', 'docs']
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

describe('ApiCollectionsWidget', () => {
  it('renders collection list with endpoint counts', () => {
    const Widget = WIDGET_COMPONENTS.api_collections
    const collections = [
      { id: '1', name: 'Auth API', slug: 'auth-api', description: 'Authentication endpoints', base_url: 'https://api.example.com', endpoint_count: 5, auth_type: 'bearer', updated_at: '2026-03-20' },
      { id: '2', name: 'Payment API', slug: 'payment-api', base_url: 'https://pay.example.com', endpoint_count: 3, auth_type: 'api_key', updated_at: '2026-03-19' },
    ]
    render(<Widget collections={collections} />)
    expect(screen.getByText('Auth API')).toBeInTheDocument()
    expect(screen.getByText('Payment API')).toBeInTheDocument()
    expect(screen.getByText('Authentication endpoints')).toBeInTheDocument()
    expect(screen.getByText('5 endpoints')).toBeInTheDocument()
    expect(screen.getByText('3 endpoints')).toBeInTheDocument()
  })

  it('shows singular endpoint text', () => {
    const Widget = WIDGET_COMPONENTS.api_collections
    const collections = [
      { id: '1', name: 'Single', slug: 'single', endpoint_count: 1, auth_type: 'none', updated_at: '2026-03-20' },
    ]
    render(<Widget collections={collections} />)
    expect(screen.getByText('1 endpoint')).toBeInTheDocument()
  })

  it('shows empty state when no collections', () => {
    const Widget = WIDGET_COMPONENTS.api_collections
    render(<Widget collections={[]} />)
    expect(screen.getByText('noCollectionsYet')).toBeInTheDocument()
  })

  it('links to correct collection pages', () => {
    const Widget = WIDGET_COMPONENTS.api_collections
    const collections = [
      { id: '1', name: 'Test', slug: 'test-api', endpoint_count: 2, auth_type: 'none', updated_at: '2026-03-20' },
    ]
    render(<Widget collections={collections} />)
    const link = screen.getByRole('link')
    expect(link.getAttribute('href')).toBe('/api-collections/test-api')
  })
})

describe('PresentationsWidget', () => {
  it('renders presentation list with slide counts', () => {
    const Widget = WIDGET_COMPONENTS.presentations
    const presentations = [
      { id: '1', title: 'Q1 Review', slug: 'q1-review', description: 'Quarterly review', slide_count: 12, visibility: 'team', updated_at: '2026-03-20' },
      { id: '2', title: 'Product Demo', slug: 'product-demo', slide_count: 8, visibility: 'public', updated_at: '2026-03-19' },
    ]
    render(<Widget presentations={presentations} />)
    expect(screen.getByText('Q1 Review')).toBeInTheDocument()
    expect(screen.getByText('Product Demo')).toBeInTheDocument()
    expect(screen.getByText('Quarterly review')).toBeInTheDocument()
    expect(screen.getByText('12 slides')).toBeInTheDocument()
    expect(screen.getByText('8 slides')).toBeInTheDocument()
  })

  it('shows singular slide text', () => {
    const Widget = WIDGET_COMPONENTS.presentations
    const presentations = [
      { id: '1', title: 'Single Slide', slug: 'single', slide_count: 1, visibility: 'private', updated_at: '2026-03-20' },
    ]
    render(<Widget presentations={presentations} />)
    expect(screen.getByText('1 slide')).toBeInTheDocument()
  })

  it('shows empty state when no presentations', () => {
    const Widget = WIDGET_COMPONENTS.presentations
    render(<Widget presentations={[]} />)
    expect(screen.getByText('noPresentationsYet')).toBeInTheDocument()
  })

  it('links to correct presentation pages', () => {
    const Widget = WIDGET_COMPONENTS.presentations
    const presentations = [
      { id: '1', title: 'Test', slug: 'test-pres', slide_count: 5, visibility: 'private', updated_at: '2026-03-20' },
    ]
    render(<Widget presentations={presentations} />)
    const link = screen.getByRole('link')
    expect(link.getAttribute('href')).toBe('/presentations/test-pres')
  })
})

describe('DocsWidget', () => {
  it('renders docs list with word counts', () => {
    const Widget = WIDGET_COMPONENTS.docs
    const docs = [
      { id: '1', title: 'Getting Started', doc_id: 'getting-started', category: 'Guides', published: true, updated_at: '2026-03-20', word_count: 1500 },
      { id: '2', title: 'API Reference', doc_id: 'api-ref', category: 'Reference', published: false, updated_at: '2026-03-19', word_count: 3200 },
    ]
    render(<Widget docs={docs} />)
    expect(screen.getByText('Getting Started')).toBeInTheDocument()
    expect(screen.getByText('API Reference')).toBeInTheDocument()
    expect(screen.getByText('Guides')).toBeInTheDocument()
    expect(screen.getByText('Reference')).toBeInTheDocument()
    expect(screen.getByText('1500 words')).toBeInTheDocument()
    expect(screen.getByText('3200 words')).toBeInTheDocument()
  })

  it('shows singular word text', () => {
    const Widget = WIDGET_COMPONENTS.docs
    const docs = [
      { id: '1', title: 'Empty', doc_id: 'empty', published: true, updated_at: '2026-03-20', word_count: 1 },
    ]
    render(<Widget docs={docs} />)
    expect(screen.getByText('1 word')).toBeInTheDocument()
  })

  it('shows empty state when no docs', () => {
    const Widget = WIDGET_COMPONENTS.docs
    render(<Widget docs={[]} />)
    expect(screen.getByText('noDocsYet')).toBeInTheDocument()
  })

  it('links to correct doc pages', () => {
    const Widget = WIDGET_COMPONENTS.docs
    const docs = [
      { id: '1', title: 'Test', doc_id: 'test-doc', published: true, updated_at: '2026-03-20', word_count: 100 },
    ]
    render(<Widget docs={docs} />)
    const link = screen.getByRole('link')
    expect(link.getAttribute('href')).toBe('/docs/test-doc')
  })
})
