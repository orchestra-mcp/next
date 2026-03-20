import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock apiFetch
const mockApiFetch = vi.fn()
vi.mock('@/lib/api', () => ({
  apiFetch: (...args: any[]) => mockApiFetch(...args),
}))

let useAdminStore: any

beforeEach(async () => {
  vi.resetModules()
  vi.clearAllMocks()

  vi.doMock('@/lib/api', () => ({
    apiFetch: (...args: any[]) => mockApiFetch(...args),
  }))

  const mod = await import('../store/admin')
  useAdminStore = mod.useAdminStore
})

function makeNotification(id: number) {
  return { id, title: `Notif ${id}`, message: `Message ${id}`, type: 'info', target: 'all' as const, created_at: new Date().toISOString() }
}

describe('admin notifications pagination', () => {
  it('fetchNotificationsSent passes limit and offset to API', async () => {
    mockApiFetch.mockResolvedValueOnce({ notifications: [] })
    await useAdminStore.getState().fetchNotificationsSent(10, 5)
    expect(mockApiFetch).toHaveBeenCalledWith('/api/admin/notifications?limit=10&offset=5')
  })

  it('fetchNotificationsSent defaults to limit=20 offset=0', async () => {
    mockApiFetch.mockResolvedValueOnce({ notifications: [] })
    await useAdminStore.getState().fetchNotificationsSent()
    expect(mockApiFetch).toHaveBeenCalledWith('/api/admin/notifications?limit=20&offset=0')
  })

  it('sets notificationsHasMore=true when returned count equals limit', async () => {
    const items = Array.from({ length: 20 }, (_, i) => makeNotification(i + 1))
    mockApiFetch.mockResolvedValueOnce({ notifications: items })
    await useAdminStore.getState().fetchNotificationsSent()
    expect(useAdminStore.getState().notificationsHasMore).toBe(true)
    expect(useAdminStore.getState().notifications).toHaveLength(20)
  })

  it('sets notificationsHasMore=false when returned count < limit', async () => {
    const items = Array.from({ length: 5 }, (_, i) => makeNotification(i + 1))
    mockApiFetch.mockResolvedValueOnce({ notifications: items })
    await useAdminStore.getState().fetchNotificationsSent()
    expect(useAdminStore.getState().notificationsHasMore).toBe(false)
    expect(useAdminStore.getState().notifications).toHaveLength(5)
  })

  it('fetchMoreNotifications appends to existing and deduplicates', async () => {
    // Initial fetch
    const page1 = Array.from({ length: 20 }, (_, i) => makeNotification(i + 1))
    mockApiFetch.mockResolvedValueOnce({ notifications: page1 })
    await useAdminStore.getState().fetchNotificationsSent()
    expect(useAdminStore.getState().notifications).toHaveLength(20)

    // Second page with one overlap (id=20)
    const page2 = Array.from({ length: 20 }, (_, i) => makeNotification(i + 20))
    mockApiFetch.mockResolvedValueOnce({ notifications: page2 })
    await useAdminStore.getState().fetchMoreNotifications()

    // Should have 39 unique items (1-39), not 40 — id=20 is deduped
    expect(useAdminStore.getState().notifications).toHaveLength(39)
    expect(mockApiFetch).toHaveBeenLastCalledWith('/api/admin/notifications?limit=20&offset=20')
  })

  it('fetchMoreNotifications does nothing when hasMore is false', async () => {
    // Return less than limit to set hasMore=false
    mockApiFetch.mockResolvedValueOnce({ notifications: [makeNotification(1)] })
    await useAdminStore.getState().fetchNotificationsSent()
    expect(useAdminStore.getState().notificationsHasMore).toBe(false)

    mockApiFetch.mockClear()
    await useAdminStore.getState().fetchMoreNotifications()
    expect(mockApiFetch).not.toHaveBeenCalled()
  })

  it('fetchMoreNotifications does nothing when already loading', async () => {
    // Manually set loading state
    useAdminStore.setState({ notificationsLoading: true, notificationsHasMore: true })
    await useAdminStore.getState().fetchMoreNotifications()
    expect(mockApiFetch).not.toHaveBeenCalled()
  })

  it('sendNotification refreshes the list after sending', async () => {
    mockApiFetch.mockResolvedValueOnce({}) // POST
    mockApiFetch.mockResolvedValueOnce({ notifications: [makeNotification(99)] }) // GET refresh
    await useAdminStore.getState().sendNotification({ title: 'Test', message: 'Hello', type: 'info' })
    expect(mockApiFetch).toHaveBeenCalledWith('/api/admin/notifications', {
      method: 'POST',
      body: JSON.stringify({ title: 'Test', message: 'Hello', type: 'info' }),
    })
    expect(useAdminStore.getState().notifications).toHaveLength(1)
    expect(useAdminStore.getState().notifications[0].id).toBe(99)
  })

  it('handles API errors gracefully in fetchNotificationsSent', async () => {
    mockApiFetch.mockRejectedValueOnce(new Error('Network error'))
    await useAdminStore.getState().fetchNotificationsSent()
    expect(useAdminStore.getState().error).toBe('Network error')
    expect(useAdminStore.getState().notificationsLoading).toBe(false)
  })

  it('handles API errors gracefully in fetchMoreNotifications', async () => {
    // Set up initial state with items
    useAdminStore.setState({ notifications: [makeNotification(1)], notificationsHasMore: true, notificationsLoading: false })
    mockApiFetch.mockRejectedValueOnce(new Error('Timeout'))
    await useAdminStore.getState().fetchMoreNotifications()
    expect(useAdminStore.getState().error).toBe('Timeout')
    expect(useAdminStore.getState().notificationsLoading).toBe(false)
    // Original items preserved
    expect(useAdminStore.getState().notifications).toHaveLength(1)
  })
})
