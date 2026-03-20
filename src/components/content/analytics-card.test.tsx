import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

// Mock recharts to avoid canvas/svg rendering issues in jsdom
vi.mock('recharts', () => ({
  LineChart: ({ children }: any) => <div data-testid="line-chart">{children}</div>,
  Line: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
}))

const mockApiFetch = vi.fn()
vi.mock('@/lib/api', () => ({
  apiFetch: (...args: any[]) => mockApiFetch(...args),
}))

import AnalyticsCard from './analytics-card'

const mockAnalytics = {
  content_id: 1,
  period: '30d',
  total_views: 1500,
  unique_visitors: 450,
  all_time_views: 3200,
  all_time_unique: 1100,
  daily_views: [
    { date: '2026-03-10', views: 50 },
    { date: '2026-03-11', views: 65 },
    { date: '2026-03-12', views: 40 },
  ],
  top_referers: [
    { referer: 'https://google.com', count: 120 },
    { referer: 'https://twitter.com', count: 85 },
    { referer: '(direct)', count: 200 },
  ],
}

describe('AnalyticsCard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockApiFetch.mockResolvedValue(mockAnalytics)
  })

  it('shows loading state initially', () => {
    mockApiFetch.mockReturnValue(new Promise(() => {}))
    render(<AnalyticsCard contentId={1} />)
    expect(screen.getByText('Loading analytics...')).toBeInTheDocument()
  })

  it('fetches analytics on mount with default 30d period', async () => {
    render(<AnalyticsCard contentId={1} />)
    await waitFor(() => {
      expect(mockApiFetch).toHaveBeenCalledWith(
        '/api/community/shares/1/analytics?period=30d'
      )
    })
  })

  it('renders stat cards with formatted numbers', async () => {
    render(<AnalyticsCard contentId={1} />)
    await waitFor(() => {
      expect(screen.getByText('1.5K')).toBeInTheDocument() // total_views
      expect(screen.getByText('450')).toBeInTheDocument() // unique_visitors
      expect(screen.getByText('3.2K')).toBeInTheDocument() // all_time_views
    })
  })

  it('renders stat labels', async () => {
    render(<AnalyticsCard contentId={1} />)
    await waitFor(() => {
      expect(screen.getByText('Total Views')).toBeInTheDocument()
      expect(screen.getByText('Unique Visitors')).toBeInTheDocument()
      expect(screen.getByText('All-Time Views')).toBeInTheDocument()
    })
  })

  it('renders period selector pills', async () => {
    render(<AnalyticsCard contentId={1} />)
    await waitFor(() => {
      expect(screen.getByText('7d')).toBeInTheDocument()
      expect(screen.getByText('30d')).toBeInTheDocument()
      expect(screen.getByText('90d')).toBeInTheDocument()
    })
  })

  it('changes period when pill clicked', async () => {
    render(<AnalyticsCard contentId={1} />)
    await waitFor(() => {
      expect(screen.getByText('7d')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('7d'))

    await waitFor(() => {
      expect(mockApiFetch).toHaveBeenCalledWith(
        '/api/community/shares/1/analytics?period=7d'
      )
    })
  })

  it('renders chart when daily_views exist', async () => {
    render(<AnalyticsCard contentId={1} />)
    await waitFor(() => {
      expect(screen.getByTestId('responsive-container')).toBeInTheDocument()
      expect(screen.getByTestId('line-chart')).toBeInTheDocument()
    })
  })

  it('renders top referers', async () => {
    render(<AnalyticsCard contentId={1} />)
    await waitFor(() => {
      expect(screen.getByText('Top Referers')).toBeInTheDocument()
      expect(screen.getByText('https://google.com')).toBeInTheDocument()
      expect(screen.getByText('https://twitter.com')).toBeInTheDocument()
      expect(screen.getByText('(direct)')).toBeInTheDocument()
    })
  })

  it('renders empty div on error', async () => {
    mockApiFetch.mockRejectedValue(new Error('fail'))
    const { container } = render(<AnalyticsCard contentId={1} />)
    await waitFor(() => {
      // Should render an empty div (no loading, no content)
      expect(screen.queryByText('Loading analytics...')).not.toBeInTheDocument()
      expect(screen.queryByText('Total Views')).not.toBeInTheDocument()
    })
    expect(container.firstChild).toBeTruthy()
  })

  it('supports custom initial period', async () => {
    render(<AnalyticsCard contentId={5} period="7d" />)
    await waitFor(() => {
      expect(mockApiFetch).toHaveBeenCalledWith(
        '/api/community/shares/5/analytics?period=7d'
      )
    })
  })

  it('hides chart when no daily views', async () => {
    mockApiFetch.mockResolvedValue({ ...mockAnalytics, daily_views: [] })
    render(<AnalyticsCard contentId={1} />)
    await waitFor(() => {
      expect(screen.getByText('Total Views')).toBeInTheDocument()
    })
    expect(screen.queryByTestId('responsive-container')).not.toBeInTheDocument()
  })

  it('hides referers section when no referers', async () => {
    mockApiFetch.mockResolvedValue({ ...mockAnalytics, top_referers: [] })
    render(<AnalyticsCard contentId={1} />)
    await waitFor(() => {
      expect(screen.getByText('Total Views')).toBeInTheDocument()
    })
    expect(screen.queryByText('Top Referers')).not.toBeInTheDocument()
  })
})
