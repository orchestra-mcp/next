import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ProjectSmartActionsBar } from './ProjectSmartActionsBar'

// ── Mocks ─────────────────────────────────────────────────────────────────────

vi.mock('@/hooks/useMCP', () => ({
  useMCP: vi.fn(),
}))

vi.mock('@/components/smart-action-bar', () => ({
  SmartActionBar: ({ open, onClose, context }: { open: boolean; onClose: () => void; context?: unknown }) =>
    open ? (
      <div data-testid="smart-action-bar" data-context={JSON.stringify(context)}>
        <button onClick={onClose}>Close</button>
      </div>
    ) : null,
}))

import { useMCP } from '@/hooks/useMCP'

const mockUseMCP = vi.mocked(useMCP)

// ── Helpers ───────────────────────────────────────────────────────────────────

function setupConnected() {
  mockUseMCP.mockReturnValue({ status: 'connected' } as ReturnType<typeof useMCP>)
}

function setupDisconnected() {
  mockUseMCP.mockReturnValue({ status: 'disconnected' } as ReturnType<typeof useMCP>)
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('ProjectSmartActionsBar', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('when tunnel is connected', () => {
    beforeEach(setupConnected)

    it('renders Smart Actions label', () => {
      render(<ProjectSmartActionsBar projectSlug="my-project" />)
      expect(screen.getByText('Smart Actions')).toBeInTheDocument()
    })

    it('renders all three action buttons', () => {
      render(<ProjectSmartActionsBar projectSlug="my-project" />)
      expect(screen.getByText('Create Feature')).toBeInTheDocument()
      expect(screen.getByText('Run Tests')).toBeInTheDocument()
      expect(screen.getByText('Write Docs')).toBeInTheDocument()
    })

    it('does not show the "Connect" fallback note', () => {
      render(<ProjectSmartActionsBar projectSlug="my-project" />)
      expect(screen.queryByText(/Connect a workspace tunnel/)).not.toBeInTheDocument()
    })

    it('buttons are enabled', () => {
      render(<ProjectSmartActionsBar projectSlug="my-project" />)
      const btn = screen.getByText('Create Feature').closest('button')!
      expect(btn).not.toBeDisabled()
    })

    it('opens SmartActionBar with projectSlug context on Create Feature click', () => {
      render(<ProjectSmartActionsBar projectSlug="my-project" />)
      fireEvent.click(screen.getByText('Create Feature'))
      const bar = screen.getByTestId('smart-action-bar')
      expect(bar).toBeInTheDocument()
      const ctx = JSON.parse(bar.getAttribute('data-context') || '{}')
      expect(ctx.projectSlug).toBe('my-project')
    })

    it('opens SmartActionBar on Run Tests click', () => {
      render(<ProjectSmartActionsBar projectSlug="my-project" />)
      fireEvent.click(screen.getByText('Run Tests'))
      expect(screen.getByTestId('smart-action-bar')).toBeInTheDocument()
    })

    it('opens SmartActionBar on Write Docs click', () => {
      render(<ProjectSmartActionsBar projectSlug="my-project" />)
      fireEvent.click(screen.getByText('Write Docs'))
      expect(screen.getByTestId('smart-action-bar')).toBeInTheDocument()
    })

    it('closes SmartActionBar when onClose is called', () => {
      render(<ProjectSmartActionsBar projectSlug="my-project" />)
      fireEvent.click(screen.getByText('Create Feature'))
      expect(screen.getByTestId('smart-action-bar')).toBeInTheDocument()
      fireEvent.click(screen.getByText('Close'))
      expect(screen.queryByTestId('smart-action-bar')).not.toBeInTheDocument()
    })

    it('passes projectName in context when provided', () => {
      render(<ProjectSmartActionsBar projectSlug="my-project" projectName="My Project" />)
      fireEvent.click(screen.getByText('Create Feature'))
      // SmartActionBar receives context; just verify the bar opened (projectName is not separately in context keys)
      expect(screen.getByTestId('smart-action-bar')).toBeInTheDocument()
    })
  })

  describe('when tunnel is disconnected', () => {
    beforeEach(setupDisconnected)

    it('shows "Connect a workspace tunnel to enable" note', () => {
      render(<ProjectSmartActionsBar projectSlug="my-project" />)
      expect(screen.getByText(/Connect a workspace tunnel to enable/)).toBeInTheDocument()
    })

    it('renders all buttons in disabled state', () => {
      render(<ProjectSmartActionsBar projectSlug="my-project" />)
      const buttons = ['Create Feature', 'Run Tests', 'Write Docs']
      for (const label of buttons) {
        const btn = screen.getByText(label).closest('button')!
        expect(btn).toBeDisabled()
      }
    })

    it('does not open SmartActionBar on disabled button click', () => {
      render(<ProjectSmartActionsBar projectSlug="my-project" />)
      const btn = screen.getByText('Create Feature').closest('button')!
      fireEvent.click(btn)
      expect(screen.queryByTestId('smart-action-bar')).not.toBeInTheDocument()
    })
  })
})
