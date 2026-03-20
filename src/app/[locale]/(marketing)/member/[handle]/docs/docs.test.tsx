import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import { Suspense } from 'react'

const mockApiFetch = vi.fn()
vi.mock('@/lib/api', () => ({
  apiFetch: (...args: any[]) => mockApiFetch(...args),
  uploadUrl: (path: string) => (path ? `/uploads/${path}` : ''),
}))

vi.mock('@/lib/mcp-parsers', () => ({
  relativeTime: (ts: string) => '3h ago',
}))

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

import PublicDocsPage from './page'
import PublicDocDetailPage from './[slug]/page'

function renderWithSuspense(ui: React.ReactElement) {
  return render(<Suspense fallback={<div>Suspense loading</div>}>{ui}</Suspense>)
}

const mockDocs = {
  shares: [
    {
      id: 1,
      slug: 'getting-started',
      title: 'Getting Started',
      description: 'Quick intro guide',
      entity_type: 'doc',
      updated_at: '2026-03-20T10:00:00Z',
    },
    {
      id: 2,
      slug: 'api-reference',
      title: 'API Reference',
      description: '',
      entity_type: 'doc',
      updated_at: '2026-03-20T09:00:00Z',
    },
  ],
}

describe('PublicDocsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders doc list after fetch', async () => {
    mockApiFetch.mockResolvedValue(mockDocs)
    await act(async () => {
      renderWithSuspense(
        <PublicDocsPage params={Promise.resolve({ handle: 'alice' })} />
      )
    })
    await waitFor(() => {
      expect(screen.getByText('Getting Started')).toBeInTheDocument()
      expect(screen.getByText('API Reference')).toBeInTheDocument()
    })
  })

  it('shows description when available', async () => {
    mockApiFetch.mockResolvedValue(mockDocs)
    await act(async () => {
      renderWithSuspense(
        <PublicDocsPage params={Promise.resolve({ handle: 'alice' })} />
      )
    })
    await waitFor(() => {
      expect(screen.getByText('Quick intro guide')).toBeInTheDocument()
    })
  })

  it('shows doc count badge', async () => {
    mockApiFetch.mockResolvedValue(mockDocs)
    await act(async () => {
      renderWithSuspense(
        <PublicDocsPage params={Promise.resolve({ handle: 'alice' })} />
      )
    })
    await waitFor(() => {
      expect(screen.getByText('2')).toBeInTheDocument()
    })
  })

  it('shows relative timestamps', async () => {
    mockApiFetch.mockResolvedValue(mockDocs)
    await act(async () => {
      renderWithSuspense(
        <PublicDocsPage params={Promise.resolve({ handle: 'alice' })} />
      )
    })
    await waitFor(() => {
      const timestamps = screen.getAllByText(/3h ago/)
      expect(timestamps.length).toBe(2)
    })
  })

  it('shows empty state when no docs', async () => {
    mockApiFetch.mockResolvedValue({ shares: [] })
    await act(async () => {
      renderWithSuspense(
        <PublicDocsPage params={Promise.resolve({ handle: 'alice' })} />
      )
    })
    await waitFor(() => {
      expect(screen.getByText('No public documentation')).toBeInTheDocument()
    })
  })

  it('shows empty state on error', async () => {
    mockApiFetch.mockRejectedValue(new Error('fail'))
    await act(async () => {
      renderWithSuspense(
        <PublicDocsPage params={Promise.resolve({ handle: 'alice' })} />
      )
    })
    await waitFor(() => {
      expect(screen.getByText('No public documentation')).toBeInTheDocument()
    })
  })

  it('links to doc detail page', async () => {
    mockApiFetch.mockResolvedValue(mockDocs)
    await act(async () => {
      renderWithSuspense(
        <PublicDocsPage params={Promise.resolve({ handle: 'alice' })} />
      )
    })
    await waitFor(() => {
      const link = screen.getByText('Getting Started').closest('a')
      expect(link).toHaveAttribute('href', '/@alice/docs/getting-started')
    })
  })

  it('uses correct API path', async () => {
    mockApiFetch.mockResolvedValue(mockDocs)
    await act(async () => {
      renderWithSuspense(
        <PublicDocsPage params={Promise.resolve({ handle: 'bob' })} />
      )
    })
    await waitFor(() => {
      expect(mockApiFetch).toHaveBeenCalledWith('/api/public/community/shares/bob?entity_type=doc')
    })
  })
})

/* ── Detail Page ──────────────────────────────────── */

const mockDocDetail = {
  id: 1,
  slug: 'getting-started',
  title: 'Getting Started',
  description: 'Quick intro guide',
  content: '# Hello World\n\nThis is a **test** document.',
  entity_type: 'doc',
  updated_at: '2026-03-20T10:00:00Z',
  views_count: 42,
}

describe('PublicDocDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders doc title after fetch', async () => {
    mockApiFetch.mockImplementation((url: string) => {
      if (url.includes('/doc/getting-started')) return Promise.resolve(mockDocDetail)
      return Promise.resolve(mockDocs)
    })
    await act(async () => {
      renderWithSuspense(
        <PublicDocDetailPage
          params={Promise.resolve({ handle: 'alice', slug: 'getting-started' })}
        />
      )
    })
    await waitFor(() => {
      // Title appears in breadcrumb + h1
      expect(screen.getAllByText('Getting Started').length).toBeGreaterThanOrEqual(1)
    })
  })

  it('shows breadcrumb with back link', async () => {
    mockApiFetch.mockImplementation((url: string) => {
      if (url.includes('/doc/getting-started')) return Promise.resolve(mockDocDetail)
      return Promise.resolve(mockDocs)
    })
    await act(async () => {
      renderWithSuspense(
        <PublicDocDetailPage
          params={Promise.resolve({ handle: 'alice', slug: 'getting-started' })}
        />
      )
    })
    await waitFor(() => {
      // "Documentation" appears in sidebar header + breadcrumb link
      const docLinks = screen.getAllByText('Documentation')
      const breadcrumbLink = docLinks.find((el) => el.closest('a'))
      expect(breadcrumbLink?.closest('a')).toHaveAttribute('href', '/@alice/docs')
    })
  })

  it('renders markdown content', async () => {
    mockApiFetch.mockImplementation((url: string) => {
      if (url.includes('/doc/getting-started')) return Promise.resolve(mockDocDetail)
      return Promise.resolve(mockDocs)
    })
    await act(async () => {
      renderWithSuspense(
        <PublicDocDetailPage
          params={Promise.resolve({ handle: 'alice', slug: 'getting-started' })}
        />
      )
    })
    await waitFor(() => {
      expect(screen.getByText('Hello World')).toBeInTheDocument()
    })
  })

  it('shows description', async () => {
    mockApiFetch.mockImplementation((url: string) => {
      if (url.includes('/doc/getting-started')) return Promise.resolve(mockDocDetail)
      return Promise.resolve(mockDocs)
    })
    await act(async () => {
      renderWithSuspense(
        <PublicDocDetailPage
          params={Promise.resolve({ handle: 'alice', slug: 'getting-started' })}
        />
      )
    })
    await waitFor(() => {
      expect(screen.getByText('Quick intro guide')).toBeInTheDocument()
    })
  })

  it('shows views count', async () => {
    mockApiFetch.mockImplementation((url: string) => {
      if (url.includes('/doc/getting-started')) return Promise.resolve(mockDocDetail)
      return Promise.resolve(mockDocs)
    })
    await act(async () => {
      renderWithSuspense(
        <PublicDocDetailPage
          params={Promise.resolve({ handle: 'alice', slug: 'getting-started' })}
        />
      )
    })
    await waitFor(() => {
      expect(screen.getByText('42 views')).toBeInTheDocument()
    })
  })

  it('shows not found state on error', async () => {
    mockApiFetch.mockRejectedValue(new Error('404'))
    await act(async () => {
      renderWithSuspense(
        <PublicDocDetailPage
          params={Promise.resolve({ handle: 'alice', slug: 'bad-slug' })}
        />
      )
    })
    await waitFor(() => {
      expect(screen.getByText('Document not found')).toBeInTheDocument()
    })
  })

  it('has back link in not found state', async () => {
    mockApiFetch.mockRejectedValue(new Error('404'))
    await act(async () => {
      renderWithSuspense(
        <PublicDocDetailPage
          params={Promise.resolve({ handle: 'alice', slug: 'bad-slug' })}
        />
      )
    })
    await waitFor(() => {
      const backLink = screen.getByText('Back to Documentation')
      expect(backLink.closest('a')).toHaveAttribute('href', '/@alice/docs')
    })
  })

  it('shows sidebar with all docs', async () => {
    mockApiFetch.mockImplementation((url: string) => {
      if (url.includes('/doc/getting-started')) return Promise.resolve(mockDocDetail)
      return Promise.resolve(mockDocs)
    })
    await act(async () => {
      renderWithSuspense(
        <PublicDocDetailPage
          params={Promise.resolve({ handle: 'alice', slug: 'getting-started' })}
        />
      )
    })
    await waitFor(() => {
      // Sidebar shows API Reference (the other doc)
      expect(screen.getByText('API Reference')).toBeInTheDocument()
    })
  })
})
