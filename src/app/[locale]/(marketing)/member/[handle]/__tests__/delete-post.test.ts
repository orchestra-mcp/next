import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockApiFetch = vi.fn()
vi.mock('@/lib/api', () => ({
  apiFetch: (...args: any[]) => mockApiFetch(...args),
  isDevSeed: () => false,
}))

let useCommunityStore: any

beforeEach(async () => {
  vi.resetModules()
  vi.clearAllMocks()

  vi.doMock('@/lib/api', () => ({
    apiFetch: (...args: any[]) => mockApiFetch(...args),
    isDevSeed: () => false,
  }))

  const mod = await import('../../../../../../store/community')
  useCommunityStore = mod.useCommunityStore
})

function makePost(id: number) {
  return {
    id, author_id: 1, author_name: 'Test', author_handle: 'test',
    author_avatar: '', title: `Post ${id}`, content: `Content ${id}`,
    created_at: new Date().toISOString(), likes_count: 0, comments_count: 0,
    tags: [], liked_by_me: false,
  }
}

describe('community deletePost', () => {
  it('calls DELETE /api/community/posts/:id', async () => {
    useCommunityStore.setState({ posts: [makePost(5)] })
    mockApiFetch.mockResolvedValueOnce({ ok: true })
    await useCommunityStore.getState().deletePost(5)
    expect(mockApiFetch).toHaveBeenCalledWith('/api/community/posts/5', { method: 'DELETE' })
  })

  it('removes the post from store posts array', async () => {
    const posts = [makePost(1), makePost(2), makePost(3)]
    useCommunityStore.setState({ posts })
    mockApiFetch.mockResolvedValueOnce({ ok: true })
    await useCommunityStore.getState().deletePost(2)
    const remaining = useCommunityStore.getState().posts
    expect(remaining).toHaveLength(2)
    expect(remaining.map((p: any) => p.id)).toEqual([1, 3])
  })

  it('clears currentPost if it matches the deleted post', async () => {
    const post = makePost(7)
    useCommunityStore.setState({ posts: [post], currentPost: post })
    mockApiFetch.mockResolvedValueOnce({ ok: true })
    await useCommunityStore.getState().deletePost(7)
    expect(useCommunityStore.getState().currentPost).toBeNull()
  })

  it('does not clear currentPost if it is a different post', async () => {
    const post = makePost(7)
    const other = makePost(99)
    useCommunityStore.setState({ posts: [post, other], currentPost: other })
    mockApiFetch.mockResolvedValueOnce({ ok: true })
    await useCommunityStore.getState().deletePost(7)
    expect(useCommunityStore.getState().currentPost?.id).toBe(99)
  })

  it('throws on API error so caller can handle', async () => {
    useCommunityStore.setState({ posts: [makePost(1)] })
    mockApiFetch.mockRejectedValueOnce(new Error('you can only delete your own posts'))
    await expect(
      useCommunityStore.getState().deletePost(1)
    ).rejects.toThrow('you can only delete your own posts')
    expect(useCommunityStore.getState().error).toBe('you can only delete your own posts')
  })

  it('preserves posts on failure', async () => {
    const posts = [makePost(1), makePost(2)]
    useCommunityStore.setState({ posts })
    mockApiFetch.mockRejectedValueOnce(new Error('forbidden'))
    try { await useCommunityStore.getState().deletePost(1) } catch {}
    expect(useCommunityStore.getState().posts).toHaveLength(2)
  })
})
