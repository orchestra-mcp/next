import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'

// Mock apiFetch and uploadUrl
const mockApiFetch = vi.fn()
vi.mock('@/lib/api', () => ({
  apiFetch: (...args: any[]) => mockApiFetch(...args),
  uploadUrl: (path: string) => path ? `/uploads/${path}` : '',
}))

import { AdminContentTable } from './admin-content-table'

const mockItems = [
  {
    id: 1,
    title: 'Getting Started',
    description: 'Introduction guide',
    entity_type: 'doc',
    entity_id: 'getting-started',
    slug: 'getting-started',
    visibility: 'public' as const,
    views_count: 150,
    likes_count: 12,
    unique_views: 89,
    user_id: 1,
    author_name: 'John Doe',
    author_avatar: 'avatars/1.jpg',
    team_id: null,
    created_at: '2026-03-20T10:00:00Z',
    updated_at: '2026-03-20T12:00:00Z',
  },
  {
    id: 2,
    title: 'My API Endpoints',
    description: 'REST API docs',
    entity_type: 'api_collection',
    entity_id: 'api-col-1',
    slug: 'api-collection',
    visibility: 'private' as const,
    views_count: 30,
    likes_count: 5,
    unique_views: 20,
    user_id: 2,
    author_name: 'Jane Smith',
    author_avatar: '',
    team_id: null,
    created_at: '2026-03-19T08:00:00Z',
    updated_at: '2026-03-19T10:00:00Z',
  },
  {
    id: 3,
    title: 'Deploy Workflow',
    description: 'CI/CD prompt',
    entity_type: 'prompt',
    entity_id: 'deploy-wf',
    slug: 'deploy-workflow',
    visibility: 'unlisted' as const,
    views_count: 5,
    likes_count: 0,
    unique_views: 3,
    user_id: 1,
    author_name: 'John Doe',
    author_avatar: 'avatars/1.jpg',
    team_id: null,
    created_at: '2026-03-18T14:00:00Z',
    updated_at: '2026-03-18T16:00:00Z',
  },
]

function mockApiResponse(items = mockItems, total = mockItems.length) {
  return { items, total, page: 1, per_page: 20 }
}

describe('AdminContentTable', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockApiFetch.mockResolvedValue(mockApiResponse())
  })

  it('renders the table with content items', async () => {
    render(<AdminContentTable />)
    await waitFor(() => {
      expect(screen.getByText('Getting Started')).toBeInTheDocument()
      expect(screen.getByText('My API Endpoints')).toBeInTheDocument()
      expect(screen.getByText('Deploy Workflow')).toBeInTheDocument()
    })
  })

  it('shows entity type badges', async () => {
    render(<AdminContentTable />)
    await waitFor(() => {
      expect(screen.getByText('Doc')).toBeInTheDocument()
      expect(screen.getByText('API Collection')).toBeInTheDocument()
      expect(screen.getByText('Prompt')).toBeInTheDocument()
    })
  })

  it('shows visibility badges', async () => {
    render(<AdminContentTable />)
    await waitFor(() => {
      expect(screen.getByText('public')).toBeInTheDocument()
      expect(screen.getByText('private')).toBeInTheDocument()
      expect(screen.getByText('unlisted')).toBeInTheDocument()
    })
  })

  it('shows author names', async () => {
    render(<AdminContentTable />)
    await waitFor(() => {
      expect(screen.getAllByText('John Doe').length).toBeGreaterThanOrEqual(1)
      expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    })
  })

  it('shows view counts', async () => {
    render(<AdminContentTable />)
    await waitFor(() => {
      expect(screen.getByText('150')).toBeInTheDocument()
      expect(screen.getByText('30')).toBeInTheDocument()
    })
  })

  it('fetches data on mount', async () => {
    render(<AdminContentTable />)
    await waitFor(() => {
      expect(mockApiFetch).toHaveBeenCalledTimes(1)
    })
    expect(mockApiFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/admin/content')
    )
  })

  it('shows loading state', () => {
    mockApiFetch.mockReturnValue(new Promise(() => {})) // never resolves
    render(<AdminContentTable />)
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('shows empty state when no items', async () => {
    mockApiFetch.mockResolvedValue(mockApiResponse([], 0))
    render(<AdminContentTable />)
    await waitFor(() => {
      expect(screen.getByText('No content found.')).toBeInTheDocument()
    })
  })

  it('passes search parameter in API call', async () => {
    vi.useFakeTimers()
    render(<AdminContentTable />)

    // Wait for initial fetch with fake timers
    await act(async () => { await vi.runAllTimersAsync() })
    expect(mockApiFetch).toHaveBeenCalledTimes(1)

    const searchInput = screen.getByPlaceholderText('Search content...')
    await act(async () => {
      fireEvent.change(searchInput, { target: { value: 'test' } })
    })

    // Advance past the 300ms debounce
    await act(async () => { vi.advanceTimersByTime(350) })
    // Flush the re-render and async fetchData
    await act(async () => { await vi.runAllTimersAsync() })

    const calls = mockApiFetch.mock.calls
    const lastCall = calls[calls.length - 1][0] as string
    expect(lastCall).toContain('q=test')

    vi.useRealTimers()
  })

  it('shows pagination info', async () => {
    render(<AdminContentTable />)
    await waitFor(() => {
      expect(screen.getByText(/Page 1/)).toBeInTheDocument()
    })
  })

  it('supports custom apiBase prop', async () => {
    render(<AdminContentTable apiBase="/api/custom/content" />)
    await waitFor(() => {
      expect(mockApiFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/custom/content')
      )
    })
  })

  it('shows bulk action bar when items are selected', async () => {
    render(<AdminContentTable />)
    await waitFor(() => {
      expect(screen.getByText('Getting Started')).toBeInTheDocument()
    })

    // Click first row checkbox
    const checkboxes = screen.getAllByRole('checkbox')
    fireEvent.click(checkboxes[1]) // [0] is the select-all header

    expect(screen.getByText(/1 selected/)).toBeInTheDocument()
  })
})
