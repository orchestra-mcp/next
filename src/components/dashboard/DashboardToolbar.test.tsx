import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { DashboardToolbar } from './DashboardToolbar'
import type { WidgetLayout } from '@/types/dashboard'

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

const widgets: WidgetLayout[] = [
  { id: 'a', type: 'stats', colSpan: 12, order: 0, hidden: false, locked: false },
  { id: 'b', type: 'recent_projects', colSpan: 6, order: 1, hidden: true, locked: false },
]

const defaultProps = {
  editMode: false,
  onToggleEdit: vi.fn(),
  onReset: vi.fn(),
  widgets,
  onToggleWidget: vi.fn(),
}

describe('DashboardToolbar', () => {
  it('shows Customize button in normal mode', () => {
    render(<DashboardToolbar {...defaultProps} />)
    expect(screen.getByText('editDashboard')).toBeInTheDocument()
  })

  it('shows Done, Widgets, and Reset in edit mode', () => {
    render(<DashboardToolbar {...defaultProps} editMode={true} />)
    expect(screen.getByText('doneEditing')).toBeInTheDocument()
    expect(screen.getByText('widgets')).toBeInTheDocument()
    expect(screen.getByText('resetLayout')).toBeInTheDocument()
  })

  it('calls onToggleEdit when clicking customize', () => {
    const onToggle = vi.fn()
    render(<DashboardToolbar {...defaultProps} onToggleEdit={onToggle} />)
    fireEvent.click(screen.getByText('editDashboard'))
    expect(onToggle).toHaveBeenCalledOnce()
  })

  it('calls onReset when clicking reset', () => {
    const onReset = vi.fn()
    render(<DashboardToolbar {...defaultProps} editMode={true} onReset={onReset} />)
    fireEvent.click(screen.getByText('resetLayout'))
    expect(onReset).toHaveBeenCalledOnce()
  })
})
