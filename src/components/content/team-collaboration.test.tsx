import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

const mockApiFetch = vi.fn()
vi.mock('@/lib/api', () => ({
  apiFetch: (...args: any[]) => mockApiFetch(...args),
  uploadUrl: (path: string) => path ? `/uploads/${path}` : '',
}))

vi.mock('@/lib/mcp-parsers', () => ({
  relativeTime: (ts: string) => '2h ago',
}))

import { TeamSharingDialog } from './team-sharing-dialog'
import { InlineComments } from './inline-comments'

/* ── TeamSharingDialog ──────────────────────────────── */

const mockTeams = {
  teams: [
    { id: 1, name: 'Engineering', avatar_url: 'team1.jpg' },
    { id: 2, name: 'Design', avatar_url: '' },
  ],
}

describe('TeamSharingDialog', () => {
  const onClose = vi.fn()
  const onShared = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockApiFetch.mockResolvedValue(mockTeams)
  })

  it('renders dialog title', async () => {
    render(<TeamSharingDialog contentId={1} onClose={onClose} onShared={onShared} />)
    expect(screen.getByText('Share with Team')).toBeInTheDocument()
  })

  it('fetches and displays teams', async () => {
    render(<TeamSharingDialog contentId={1} onClose={onClose} onShared={onShared} />)
    await waitFor(() => {
      expect(screen.getByText('Engineering')).toBeInTheDocument()
      expect(screen.getByText('Design')).toBeInTheDocument()
    })
  })

  it('shows loading state', () => {
    mockApiFetch.mockReturnValue(new Promise(() => {}))
    render(<TeamSharingDialog contentId={1} onClose={onClose} onShared={onShared} />)
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it('calls onClose when close button clicked', async () => {
    render(<TeamSharingDialog contentId={1} onClose={onClose} onShared={onShared} />)
    await waitFor(() => expect(screen.getByText('Engineering')).toBeInTheDocument())

    // Find close button (the bx-x icon button)
    const closeButtons = screen.getAllByRole('button')
    const closeBtn = closeButtons.find(b => b.querySelector('.bx-x'))
    if (closeBtn) fireEvent.click(closeBtn)

    expect(onClose).toHaveBeenCalled()
  })

  it('shows remove button when currentTeamId is set', async () => {
    render(<TeamSharingDialog contentId={1} currentTeamId={1} onClose={onClose} onShared={onShared} />)
    await waitFor(() => expect(screen.getByText('Engineering')).toBeInTheDocument())

    expect(screen.getByText(/remove/i)).toBeInTheDocument()
  })
})

/* ── InlineComments ─────────────────────────────────── */

const mockComments = {
  comments: [
    {
      id: 1,
      body: 'Great work on this!',
      kind: 'comment',
      author_name: 'Alice',
      avatar_url: 'alice.jpg',
      user_id: 1,
      created_at: '2026-03-20T10:00:00Z',
    },
    {
      id: 2,
      body: 'Please update the API docs',
      kind: 'change_request',
      author_name: 'Bob',
      avatar_url: '',
      user_id: 2,
      created_at: '2026-03-20T11:00:00Z',
    },
  ],
  count: 2,
}

describe('InlineComments', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockApiFetch.mockResolvedValue(mockComments)
  })

  it('fetches and displays comments', async () => {
    render(<InlineComments contentId={1} />)
    await waitFor(() => {
      expect(screen.getByText('Great work on this!')).toBeInTheDocument()
      expect(screen.getByText('Please update the API docs')).toBeInTheDocument()
    })
  })

  it('shows author names', async () => {
    render(<InlineComments contentId={1} />)
    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeInTheDocument()
      expect(screen.getByText('Bob')).toBeInTheDocument()
    })
  })

  it('shows comment count in header', async () => {
    render(<InlineComments contentId={1} />)
    await waitFor(() => {
      expect(screen.getByText(/Comments \(2\)/)).toBeInTheDocument()
    })
  })

  it('shows empty state when no comments', async () => {
    mockApiFetch.mockResolvedValue({ comments: [], count: 0 })
    render(<InlineComments contentId={1} />)
    await waitFor(() => {
      expect(screen.getByText('No comments yet')).toBeInTheDocument()
    })
  })

  it('has a comment textarea', async () => {
    render(<InlineComments contentId={1} />)
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/comment/i)).toBeInTheDocument()
    })
  })

  it('submits new comment', async () => {
    mockApiFetch
      .mockResolvedValueOnce(mockComments) // initial fetch
      .mockResolvedValueOnce({ comment: { id: 3 } }) // submit
      .mockResolvedValueOnce({ ...mockComments, count: 3 }) // re-fetch

    render(<InlineComments contentId={1} />)
    await waitFor(() => expect(screen.getByText('Alice')).toBeInTheDocument())

    const textarea = screen.getByPlaceholderText(/comment/i)
    fireEvent.change(textarea, { target: { value: 'New comment text' } })

    const submitBtn = screen.getByText(/submit|send|post/i)
    fireEvent.click(submitBtn)

    await waitFor(() => {
      // Should have called apiFetch for the POST
      const postCall = mockApiFetch.mock.calls.find(
        (c: any[]) => typeof c[0] === 'string' && c[0].includes('inline-comments') && c[1]?.method === 'POST'
      )
      expect(postCall).toBeTruthy()
    })
  })
})
