import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import { Suspense } from 'react'

const mockApiFetch = vi.fn()
vi.mock('@/lib/api', () => ({
  apiFetch: (...args: any[]) => mockApiFetch(...args),
  uploadUrl: (path: string) => (path ? `/uploads/${path}` : ''),
}))

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

import PublicApiCollectionsPage from './page'
import PublicApiCollectionDetailPage from './[slug]/page'

function renderWithSuspense(ui: React.ReactElement) {
  return render(<Suspense fallback={<div>Suspense loading</div>}>{ui}</Suspense>)
}

const mockCollections = {
  collections: [
    {
      id: 1,
      name: 'Payment API',
      slug: 'payment-api',
      description: 'Handle payments and subscriptions',
      base_url: 'https://api.pay.com/v1',
      auth_type: 'bearer',
      visibility: 'public',
      version: 'v2.1',
      endpoint_count: 12,
    },
    {
      id: 2,
      name: 'Auth API',
      slug: 'auth-api',
      description: '',
      base_url: '',
      auth_type: 'oauth2',
      visibility: 'public',
      version: '',
      endpoint_count: 0,
    },
  ],
}

describe('PublicApiCollectionsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders collections after fetch', async () => {
    mockApiFetch.mockResolvedValue(mockCollections)
    await act(async () => {
      renderWithSuspense(
        <PublicApiCollectionsPage params={Promise.resolve({ handle: 'alice' })} />
      )
    })
    await waitFor(() => {
      expect(screen.getByText('Payment API')).toBeInTheDocument()
      expect(screen.getByText('Auth API')).toBeInTheDocument()
    })
  })

  it('shows version badge when present', async () => {
    mockApiFetch.mockResolvedValue(mockCollections)
    await act(async () => {
      renderWithSuspense(
        <PublicApiCollectionsPage params={Promise.resolve({ handle: 'alice' })} />
      )
    })
    await waitFor(() => {
      expect(screen.getByText('v2.1')).toBeInTheDocument()
    })
  })

  it('shows auth type badges', async () => {
    mockApiFetch.mockResolvedValue(mockCollections)
    await act(async () => {
      renderWithSuspense(
        <PublicApiCollectionsPage params={Promise.resolve({ handle: 'alice' })} />
      )
    })
    await waitFor(() => {
      expect(screen.getByText('bearer')).toBeInTheDocument()
      expect(screen.getByText('oauth2')).toBeInTheDocument()
    })
  })

  it('shows endpoint count', async () => {
    mockApiFetch.mockResolvedValue(mockCollections)
    await act(async () => {
      renderWithSuspense(
        <PublicApiCollectionsPage params={Promise.resolve({ handle: 'alice' })} />
      )
    })
    await waitFor(() => {
      expect(screen.getByText('12 endpoints')).toBeInTheDocument()
    })
  })

  it('shows description', async () => {
    mockApiFetch.mockResolvedValue(mockCollections)
    await act(async () => {
      renderWithSuspense(
        <PublicApiCollectionsPage params={Promise.resolve({ handle: 'alice' })} />
      )
    })
    await waitFor(() => {
      expect(screen.getByText('Handle payments and subscriptions')).toBeInTheDocument()
    })
  })

  it('shows base URL', async () => {
    mockApiFetch.mockResolvedValue(mockCollections)
    await act(async () => {
      renderWithSuspense(
        <PublicApiCollectionsPage params={Promise.resolve({ handle: 'alice' })} />
      )
    })
    await waitFor(() => {
      expect(screen.getByText('https://api.pay.com/v1')).toBeInTheDocument()
    })
  })

  it('shows empty state when no collections', async () => {
    mockApiFetch.mockResolvedValue({ collections: [] })
    await act(async () => {
      renderWithSuspense(
        <PublicApiCollectionsPage params={Promise.resolve({ handle: 'alice' })} />
      )
    })
    await waitFor(() => {
      expect(screen.getByText('No public API collections')).toBeInTheDocument()
    })
  })

  it('shows empty state on fetch error', async () => {
    mockApiFetch.mockRejectedValue(new Error('Network error'))
    await act(async () => {
      renderWithSuspense(
        <PublicApiCollectionsPage params={Promise.resolve({ handle: 'alice' })} />
      )
    })
    await waitFor(() => {
      expect(screen.getByText('No public API collections')).toBeInTheDocument()
    })
  })

  it('uses correct API path with handle', async () => {
    mockApiFetch.mockResolvedValue(mockCollections)
    await act(async () => {
      renderWithSuspense(
        <PublicApiCollectionsPage params={Promise.resolve({ handle: 'bob' })} />
      )
    })
    await waitFor(() => {
      expect(mockApiFetch).toHaveBeenCalledWith('/api/public/api-collections/bob')
    })
  })

  it('links to collection detail page', async () => {
    mockApiFetch.mockResolvedValue(mockCollections)
    await act(async () => {
      renderWithSuspense(
        <PublicApiCollectionsPage params={Promise.resolve({ handle: 'alice' })} />
      )
    })
    await waitFor(() => {
      const link = screen.getByText('Payment API').closest('a')
      expect(link).toHaveAttribute('href', '/@alice/apis/payment-api')
    })
  })
})

/* ── Detail Page ──────────────────────────────────── */

const mockDetail = {
  collection: {
    id: 1,
    name: 'Payment API',
    slug: 'payment-api',
    description: 'Handle payments and subscriptions',
    base_url: 'https://api.pay.com/v1',
    auth_type: 'bearer',
    visibility: 'public',
    version: 'v2.1',
  },
  endpoints: [
    {
      id: '1',
      name: 'List Payments',
      method: 'GET',
      path: '/payments',
      headers: null,
      query_params: null,
      body: '',
      body_type: 'none',
      description: 'List all payments',
      sort_order: 1,
      folder_path: '',
    },
  ],
}

describe('PublicApiCollectionDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders collection header after fetch', async () => {
    mockApiFetch.mockResolvedValue(mockDetail)
    await act(async () => {
      renderWithSuspense(
        <PublicApiCollectionDetailPage
          params={Promise.resolve({ handle: 'alice', slug: 'payment-api' })}
        />
      )
    })
    await waitFor(() => {
      // "Payment API" appears in breadcrumb + h1
      expect(screen.getAllByText('Payment API').length).toBe(2)
      expect(screen.getByText('v2.1')).toBeInTheDocument()
      expect(screen.getByText('bearer')).toBeInTheDocument()
    })
  })

  it('shows breadcrumb with back link', async () => {
    mockApiFetch.mockResolvedValue(mockDetail)
    await act(async () => {
      renderWithSuspense(
        <PublicApiCollectionDetailPage
          params={Promise.resolve({ handle: 'alice', slug: 'payment-api' })}
        />
      )
    })
    await waitFor(() => {
      const backLink = screen.getByText('API Collections')
      expect(backLink.closest('a')).toHaveAttribute('href', '/@alice/apis')
    })
  })

  it('shows collection description', async () => {
    mockApiFetch.mockResolvedValue(mockDetail)
    await act(async () => {
      renderWithSuspense(
        <PublicApiCollectionDetailPage
          params={Promise.resolve({ handle: 'alice', slug: 'payment-api' })}
        />
      )
    })
    await waitFor(() => {
      expect(screen.getByText('Handle payments and subscriptions')).toBeInTheDocument()
    })
  })

  it('shows base URL', async () => {
    mockApiFetch.mockResolvedValue(mockDetail)
    await act(async () => {
      renderWithSuspense(
        <PublicApiCollectionDetailPage
          params={Promise.resolve({ handle: 'alice', slug: 'payment-api' })}
        />
      )
    })
    await waitFor(() => {
      expect(screen.getByText('https://api.pay.com/v1')).toBeInTheDocument()
    })
  })

  it('renders endpoints via ApiDocRenderer', async () => {
    mockApiFetch.mockResolvedValue(mockDetail)
    await act(async () => {
      renderWithSuspense(
        <PublicApiCollectionDetailPage
          params={Promise.resolve({ handle: 'alice', slug: 'payment-api' })}
        />
      )
    })
    await waitFor(() => {
      expect(screen.getByText('List Payments')).toBeInTheDocument()
      expect(screen.getByText('GET')).toBeInTheDocument()
      expect(screen.getByText('/payments')).toBeInTheDocument()
    })
  })

  it('shows not found state on error', async () => {
    mockApiFetch.mockRejectedValue(new Error('404'))
    await act(async () => {
      renderWithSuspense(
        <PublicApiCollectionDetailPage
          params={Promise.resolve({ handle: 'alice', slug: 'bad-slug' })}
        />
      )
    })
    await waitFor(() => {
      expect(screen.getByText('Collection not found')).toBeInTheDocument()
    })
  })

  it('has back link in not found state', async () => {
    mockApiFetch.mockRejectedValue(new Error('404'))
    await act(async () => {
      renderWithSuspense(
        <PublicApiCollectionDetailPage
          params={Promise.resolve({ handle: 'alice', slug: 'bad-slug' })}
        />
      )
    })
    await waitFor(() => {
      const backLink = screen.getByText('Back to API Collections')
      expect(backLink.closest('a')).toHaveAttribute('href', '/@alice/apis')
    })
  })

  it('uses correct API path', async () => {
    mockApiFetch.mockResolvedValue(mockDetail)
    await act(async () => {
      renderWithSuspense(
        <PublicApiCollectionDetailPage
          params={Promise.resolve({ handle: 'bob', slug: 'my-api' })}
        />
      )
    })
    await waitFor(() => {
      expect(mockApiFetch).toHaveBeenCalledWith('/api/public/api-collections/bob/my-api')
    })
  })
})
