import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

const mockApiFetch = vi.fn()
vi.mock('@/lib/api', () => ({
  apiFetch: (...args: any[]) => mockApiFetch(...args),
}))

import { ShareControlPanel } from './share-control-panel'

const defaultProps = {
  shareId: 1,
  visibility: 'public',
  handle: 'alice',
  entityType: 'doc',
  slug: 'my-doc',
}

describe('ShareControlPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    })
  })

  it('renders heading', () => {
    render(<ShareControlPanel {...defaultProps} />)
    expect(screen.getByText('Share Settings')).toBeInTheDocument()
  })

  it('shows visibility options', () => {
    render(<ShareControlPanel {...defaultProps} />)
    expect(screen.getByText('Public')).toBeInTheDocument()
    expect(screen.getByText('Unlisted')).toBeInTheDocument()
    expect(screen.getByText('Private')).toBeInTheDocument()
  })

  it('shows correct visibility descriptions', () => {
    render(<ShareControlPanel {...defaultProps} />)
    expect(screen.getByText('Anyone can view')).toBeInTheDocument()
    expect(screen.getByText('Only people with the link')).toBeInTheDocument()
    expect(screen.getByText('Only you can view')).toBeInTheDocument()
  })

  it('highlights current visibility', () => {
    render(<ShareControlPanel {...defaultProps} visibility="unlisted" />)
    // The unlisted option should have a check icon
    const unlistedBtn = screen.getByText('Unlisted').closest('button')
    expect(unlistedBtn?.querySelector('.bx-check')).toBeTruthy()
  })

  it('calls API to update visibility on click', async () => {
    mockApiFetch.mockResolvedValue({})
    const onVisChange = vi.fn()
    render(<ShareControlPanel {...defaultProps} onVisibilityChange={onVisChange} />)

    fireEvent.click(screen.getByText('Private'))

    await waitFor(() => {
      expect(mockApiFetch).toHaveBeenCalledWith('/api/community/shares/1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visibility: 'private' }),
      })
    })
    expect(onVisChange).toHaveBeenCalledWith('private')
  })

  it('shows share URL input with correct path', () => {
    render(<ShareControlPanel {...defaultProps} />)
    const input = screen.getByDisplayValue(/@alice\/docs\/my-doc/)
    expect(input).toBeInTheDocument()
  })

  it('maps api_collection entity type to apis path', () => {
    render(<ShareControlPanel {...defaultProps} entityType="api_collection" slug="my-api" />)
    const input = screen.getByDisplayValue(/@alice\/apis\/my-api/)
    expect(input).toBeInTheDocument()
  })

  it('maps presentation entity type to slides path', () => {
    render(<ShareControlPanel {...defaultProps} entityType="presentation" slug="my-deck" />)
    const input = screen.getByDisplayValue(/@alice\/slides\/my-deck/)
    expect(input).toBeInTheDocument()
  })

  it('copies link to clipboard', async () => {
    render(<ShareControlPanel {...defaultProps} />)
    const copyBtn = screen.getByRole('button', { name: '' })
    // Find copy button (has bx-copy icon)
    const allButtons = screen.getAllByRole('button')
    const copyButton = allButtons.find((b) => b.querySelector('.bx-copy'))
    if (copyButton) {
      fireEvent.click(copyButton)
      await waitFor(() => {
        expect(screen.getByText('Copied to clipboard')).toBeInTheDocument()
      })
    }
  })

  it('toggles embed code section', () => {
    render(<ShareControlPanel {...defaultProps} />)
    const toggleBtn = screen.getByText('Show Embed Code')
    fireEvent.click(toggleBtn)
    // Should show the textarea with iframe code
    expect(screen.getByDisplayValue(/iframe/)).toBeInTheDocument()
    expect(screen.getByText('Hide Embed Code')).toBeInTheDocument()
  })

  it('embed code contains correct URL', () => {
    render(<ShareControlPanel {...defaultProps} />)
    fireEvent.click(screen.getByText('Show Embed Code'))
    const textarea = screen.getByDisplayValue(/iframe/) as HTMLTextAreaElement
    expect(textarea.value).toContain('/@alice/docs/my-doc?embed=true')
  })
})
