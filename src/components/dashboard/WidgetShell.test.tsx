import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { WidgetShell } from './WidgetShell'
import type { WidgetLayout, WidgetDefinition } from '@/types/dashboard'

const widget: WidgetLayout = {
  id: 'test-1',
  type: 'stats',
  colSpan: 6,
  order: 0,
  hidden: false,
  locked: false,
}

const definition: WidgetDefinition = {
  type: 'stats',
  label: 'Test Widget',
  icon: 'bx-bar-chart',
  defaultColSpan: 12,
  minColSpan: 4,
  maxColSpan: 12,
}

describe('WidgetShell', () => {
  it('renders children in normal mode', () => {
    render(
      <WidgetShell widget={widget} definition={definition} editMode={false} onResize={vi.fn()} onToggle={vi.fn()} onLock={vi.fn()}>
        <div>Content</div>
      </WidgetShell>
    )
    expect(screen.getByText('Content')).toBeInTheDocument()
    expect(screen.getByText('Test Widget')).toBeInTheDocument()
  })

  it('returns null for hidden widget in normal mode', () => {
    const { container } = render(
      <WidgetShell widget={{ ...widget, hidden: true }} definition={definition} editMode={false} onResize={vi.fn()} onToggle={vi.fn()} onLock={vi.fn()}>
        <div>Content</div>
      </WidgetShell>
    )
    expect(container.innerHTML).toBe('')
  })

  it('shows hidden widget at reduced opacity in edit mode', () => {
    render(
      <WidgetShell widget={{ ...widget, hidden: true }} definition={definition} editMode={true} onResize={vi.fn()} onToggle={vi.fn()} onLock={vi.fn()}>
        <div>Content</div>
      </WidgetShell>
    )
    expect(screen.getByText('Content')).toBeInTheDocument()
  })

  it('shows edit controls only in edit mode', () => {
    const { rerender } = render(
      <WidgetShell widget={widget} definition={definition} editMode={false} onResize={vi.fn()} onToggle={vi.fn()} onLock={vi.fn()}>
        <div>Content</div>
      </WidgetShell>
    )
    expect(screen.queryByTitle('Resize')).toBeNull()

    rerender(
      <WidgetShell widget={widget} definition={definition} editMode={true} onResize={vi.fn()} onToggle={vi.fn()} onLock={vi.fn()}>
        <div>Content</div>
      </WidgetShell>
    )
    expect(screen.getByTitle('Resize')).toBeInTheDocument()
    expect(screen.getByTitle('Lock')).toBeInTheDocument()
    expect(screen.getByTitle('Hide')).toBeInTheDocument()
  })

  it('shows loading shimmer when loading', () => {
    const { container } = render(
      <WidgetShell widget={widget} definition={definition} editMode={false} onResize={vi.fn()} onToggle={vi.fn()} onLock={vi.fn()} loading>
        <div>Content</div>
      </WidgetShell>
    )
    expect(screen.queryByText('Content')).toBeNull()
    expect(container.querySelector('style')).toBeTruthy()
  })
})
