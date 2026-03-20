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

describe('community createPost', () => {
  it('calls POST /api/community/posts with title and content', async () => {
    const newPost = makePost(99)
    mockApiFetch.mockResolvedValueOnce({ post: newPost })
    await useCommunityStore.getState().createPost({ title: 'Hello', content: 'World' })
    expect(mockApiFetch).toHaveBeenCalledWith('/api/community/posts', {
      method: 'POST',
      body: JSON.stringify({ title: 'Hello', content: 'World' }),
    })
  })

  it('prepends new post to store posts', async () => {
    const existing = makePost(1)
    useCommunityStore.setState({ posts: [existing] })
    const newPost = makePost(2)
    mockApiFetch.mockResolvedValueOnce({ post: newPost })
    await useCommunityStore.getState().createPost({ title: 'New', content: 'Post' })
    const posts = useCommunityStore.getState().posts
    expect(posts).toHaveLength(2)
    expect(posts[0].id).toBe(2)
    expect(posts[1].id).toBe(1)
  })

  it('throws on API error so caller can catch', async () => {
    mockApiFetch.mockRejectedValueOnce(new Error('unauthorized'))
    await expect(useCommunityStore.getState().createPost({ title: 'T', content: 'C' }))
      .rejects.toThrow('unauthorized')
    expect(useCommunityStore.getState().error).toBe('unauthorized')
  })

  it('sets error in store on failure', async () => {
    mockApiFetch.mockRejectedValueOnce(new Error('server error'))
    try { await useCommunityStore.getState().createPost({ title: 'T', content: 'C' }) } catch {}
    expect(useCommunityStore.getState().error).toBe('server error')
  })

  it('fetchPosts replaces store posts with server response', async () => {
    useCommunityStore.setState({ posts: [makePost(1)] })
    const serverPosts = [makePost(3), makePost(2), makePost(1)]
    mockApiFetch.mockResolvedValueOnce({ posts: serverPosts })
    await useCommunityStore.getState().fetchPosts('testuser', 1)
    expect(useCommunityStore.getState().posts).toHaveLength(3)
    expect(useCommunityStore.getState().posts[0].id).toBe(3)
  })

  it('fetchPosts sets loading states correctly', async () => {
    const serverPosts = [makePost(1)]
    mockApiFetch.mockResolvedValueOnce({ posts: serverPosts })
    const promise = useCommunityStore.getState().fetchPosts('testuser', 1)
    expect(useCommunityStore.getState().loading).toBe(true)
    await promise
    expect(useCommunityStore.getState().loading).toBe(false)
  })
})
