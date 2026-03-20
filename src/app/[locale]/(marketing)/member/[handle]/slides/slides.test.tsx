import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import { Suspense } from 'react'

const mockApiFetch = vi.fn()
vi.mock('@/lib/api', () => ({
  apiFetch: (...args: any[]) => mockApiFetch(...args),
  uploadUrl: (path: string) => (path ? `/uploads/${path}` : ''),
}))

vi.mock('@/lib/mcp-parsers', () => ({
  relativeTime: (ts: string) => '1d ago',
}))

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

import PublicSlidesPage from './page'
import PublicSlideDetailPage from './[slug]/page'

function renderWithSuspense(ui: React.ReactElement) {
  return render(<Suspense fallback={<div>Suspense loading</div>}>{ui}</Suspense>)
}

const mockPresentations = {
  presentations: [
    {
      id: 'p1',
      title: 'Product Launch',
      slug: 'product-launch',
      description: 'Q1 product launch deck',
      slide_count: 15,
      visibility: 'public',
      updated_at: '2026-03-20T10:00:00Z',
    },
    {
      id: 'p2',
      title: 'Architecture Overview',
      slug: 'architecture',
      description: '',
      slide_count: 8,
      visibility: 'public',
      updated_at: '2026-03-19T10:00:00Z',
    },
  ],
}

describe('PublicSlidesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders presentations after fetch', async () => {
    mockApiFetch.mockResolvedValue(mockPresentations)
    await act(async () => {
      renderWithSuspense(
        <PublicSlidesPage params={Promise.resolve({ handle: 'alice' })} />
      )
    })
    await waitFor(() => {
      expect(screen.getByText('Product Launch')).toBeInTheDocument()
      expect(screen.getByText('Architecture Overview')).toBeInTheDocument()
    })
  })

  it('shows slide counts', async () => {
    mockApiFetch.mockResolvedValue(mockPresentations)
    await act(async () => {
      renderWithSuspense(
        <PublicSlidesPage params={Promise.resolve({ handle: 'alice' })} />
      )
    })
    await waitFor(() => {
      expect(screen.getByText('15 slides')).toBeInTheDocument()
      expect(screen.getByText('8 slides')).toBeInTheDocument()
    })
  })

  it('shows description when available', async () => {
    mockApiFetch.mockResolvedValue(mockPresentations)
    await act(async () => {
      renderWithSuspense(
        <PublicSlidesPage params={Promise.resolve({ handle: 'alice' })} />
      )
    })
    await waitFor(() => {
      expect(screen.getByText('Q1 product launch deck')).toBeInTheDocument()
    })
  })

  it('shows count badge', async () => {
    mockApiFetch.mockResolvedValue(mockPresentations)
    await act(async () => {
      renderWithSuspense(
        <PublicSlidesPage params={Promise.resolve({ handle: 'alice' })} />
      )
    })
    await waitFor(() => {
      expect(screen.getByText('2')).toBeInTheDocument()
    })
  })

  it('shows empty state when no presentations', async () => {
    mockApiFetch.mockResolvedValue({ presentations: [] })
    await act(async () => {
      renderWithSuspense(
        <PublicSlidesPage params={Promise.resolve({ handle: 'alice' })} />
      )
    })
    await waitFor(() => {
      expect(screen.getByText('No public presentations')).toBeInTheDocument()
    })
  })

  it('shows empty state on error', async () => {
    mockApiFetch.mockRejectedValue(new Error('fail'))
    await act(async () => {
      renderWithSuspense(
        <PublicSlidesPage params={Promise.resolve({ handle: 'alice' })} />
      )
    })
    await waitFor(() => {
      expect(screen.getByText('No public presentations')).toBeInTheDocument()
    })
  })

  it('links to detail page', async () => {
    mockApiFetch.mockResolvedValue(mockPresentations)
    await act(async () => {
      renderWithSuspense(
        <PublicSlidesPage params={Promise.resolve({ handle: 'alice' })} />
      )
    })
    await waitFor(() => {
      const link = screen.getByText('Product Launch').closest('a')
      expect(link).toHaveAttribute('href', '/@alice/slides/product-launch')
    })
  })

  it('uses correct API path', async () => {
    mockApiFetch.mockResolvedValue(mockPresentations)
    await act(async () => {
      renderWithSuspense(
        <PublicSlidesPage params={Promise.resolve({ handle: 'bob' })} />
      )
    })
    await waitFor(() => {
      expect(mockApiFetch).toHaveBeenCalledWith('/api/public/presentations/bob')
    })
  })
})

/* ── Detail Page ──────────────────────────────────── */

const mockDetail = {
  presentation: {
    id: 'p1',
    title: 'Product Launch',
    slug: 'product-launch',
    description: 'Q1 product launch deck',
    slide_count: 2,
    visibility: 'public',
    updated_at: '2026-03-20T10:00:00Z',
  },
  slides: [
    {
      id: 's1',
      slide_number: 1,
      layout: 'title',
      title: 'Welcome',
      content: 'Opening slide content',
      notes: '',
      properties: null,
    },
    {
      id: 's2',
      slide_number: 2,
      layout: 'title-content',
      title: 'Agenda',
      content: '- Item 1\n- Item 2',
      notes: '',
      properties: null,
    },
  ],
}

describe('PublicSlideDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders presentation title', async () => {
    mockApiFetch.mockResolvedValue(mockDetail)
    await act(async () => {
      renderWithSuspense(
        <PublicSlideDetailPage
          params={Promise.resolve({ handle: 'alice', slug: 'product-launch' })}
        />
      )
    })
    await waitFor(() => {
      // Title in breadcrumb + header + slide renderer controls
      expect(screen.getAllByText('Product Launch').length).toBeGreaterThanOrEqual(2)
    })
  })

  it('shows breadcrumb', async () => {
    mockApiFetch.mockResolvedValue(mockDetail)
    await act(async () => {
      renderWithSuspense(
        <PublicSlideDetailPage
          params={Promise.resolve({ handle: 'alice', slug: 'product-launch' })}
        />
      )
    })
    await waitFor(() => {
      const backLink = screen.getByText('Presentations')
      expect(backLink.closest('a')).toHaveAttribute('href', '/@alice/slides')
    })
  })

  it('shows description', async () => {
    mockApiFetch.mockResolvedValue(mockDetail)
    await act(async () => {
      renderWithSuspense(
        <PublicSlideDetailPage
          params={Promise.resolve({ handle: 'alice', slug: 'product-launch' })}
        />
      )
    })
    await waitFor(() => {
      expect(screen.getByText('Q1 product launch deck')).toBeInTheDocument()
    })
  })

  it('shows slide count', async () => {
    mockApiFetch.mockResolvedValue(mockDetail)
    await act(async () => {
      renderWithSuspense(
        <PublicSlideDetailPage
          params={Promise.resolve({ handle: 'alice', slug: 'product-launch' })}
        />
      )
    })
    await waitFor(() => {
      expect(screen.getByText('2 slides')).toBeInTheDocument()
    })
  })

  it('renders first slide in renderer', async () => {
    mockApiFetch.mockResolvedValue(mockDetail)
    await act(async () => {
      renderWithSuspense(
        <PublicSlideDetailPage
          params={Promise.resolve({ handle: 'alice', slug: 'product-launch' })}
        />
      )
    })
    await waitFor(() => {
      expect(screen.getByText('Welcome')).toBeInTheDocument()
      expect(screen.getByText('1 / 2')).toBeInTheDocument()
    })
  })

  it('shows not found state on error', async () => {
    mockApiFetch.mockRejectedValue(new Error('404'))
    await act(async () => {
      renderWithSuspense(
        <PublicSlideDetailPage
          params={Promise.resolve({ handle: 'alice', slug: 'bad' })}
        />
      )
    })
    await waitFor(() => {
      expect(screen.getByText('Presentation not found')).toBeInTheDocument()
    })
  })

  it('has back link in not found state', async () => {
    mockApiFetch.mockRejectedValue(new Error('404'))
    await act(async () => {
      renderWithSuspense(
        <PublicSlideDetailPage
          params={Promise.resolve({ handle: 'alice', slug: 'bad' })}
        />
      )
    })
    await waitFor(() => {
      const backLink = screen.getByText('Back to Presentations')
      expect(backLink.closest('a')).toHaveAttribute('href', '/@alice/slides')
    })
  })

  it('uses correct API path', async () => {
    mockApiFetch.mockResolvedValue(mockDetail)
    await act(async () => {
      renderWithSuspense(
        <PublicSlideDetailPage
          params={Promise.resolve({ handle: 'bob', slug: 'my-deck' })}
        />
      )
    })
    await waitFor(() => {
      expect(mockApiFetch).toHaveBeenCalledWith('/api/public/presentations/bob/my-deck')
    })
  })
})
