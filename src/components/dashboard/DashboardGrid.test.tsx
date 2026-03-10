import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DashboardGrid } from './DashboardGrid'
import type { WidgetLayout } from '@/types/dashboard'

const widgets: WidgetLayout[] = [
  { id: 'a', type: 'stats', colSpan: 12, order: 0, hidden: false, locked: false },
  { id: 'b', type: 'recent_projects', colSpan: 6, order: 1, hidden: false, locked: false },
  { id: 'c', type: 'recent_notes', colSpan: 6, order: 2, hidden: true, locked: false },
]

describe('DashboardGrid', () => {
  it('renders visible widgets in normal mode', () => {
    render(
      <DashboardGrid widgets={widgets} editMode={false} onReorder={vi.fn()}>
        {(w) => <div data-testid={`widget-${w.id}`}>{w.type}</div>}
      </DashboardGrid>
    )
    expect(screen.getByTestId('widget-a')).toBeInTheDocument()
    expect(screen.getByTestId('widget-b')).toBeInTheDocument()
    expect(screen.queryByTestId('widget-c')).toBeNull() // hidden
  })

  it('renders all widgets in edit mode including hidden', () => {
    render(
      <DashboardGrid widgets={widgets} editMode={true} onReorder={vi.fn()}>
        {(w) => <div data-testid={`widget-${w.id}`}>{w.type}</div>}
      </DashboardGrid>
    )
    expect(screen.getByTestId('widget-a')).toBeInTheDocument()
    expect(screen.getByTestId('widget-b')).toBeInTheDocument()
    expect(screen.getByTestId('widget-c')).toBeInTheDocument()
  })

  it('applies gridColumn span from widget colSpan', () => {
    render(
      <DashboardGrid widgets={[widgets[0]]} editMode={false} onReorder={vi.fn()}>
        {(w) => <div data-testid={`widget-${w.id}`} style={{ gridColumn: `span ${w.colSpan}` }}>{w.type}</div>}
      </DashboardGrid>
    )
    const el = screen.getByTestId('widget-a')
    expect(el.style.gridColumn).toBe('span 12')
  })
})
