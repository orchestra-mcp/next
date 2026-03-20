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

function makePost(id: number, title = `Post ${id}`, content = `Content ${id}`) {
  return {
    id, author_id: 1, author_name: 'Test', author_handle: 'test',
    author_avatar: '', title, content,
    created_at: new Date().toISOString(), likes_count: 0, comments_count: 0,
    tags: [], liked_by_me: false,
  }
}

describe('community updatePost', () => {
  it('calls PUT /api/community/posts/:id with title and content', async () => {
    const existing = makePost(5)
    useCommunityStore.setState({ posts: [existing] })
    const updated = { ...existing, title: 'Edited', content: 'New content' }
    mockApiFetch.mockResolvedValueOnce({ post: updated })

    await useCommunityStore.getState().updatePost(5, { title: 'Edited', content: 'New content' })
    expect(mockApiFetch).toHaveBeenCalledWith('/api/community/posts/5', {
      method: 'PUT',
      body: JSON.stringify({ title: 'Edited', content: 'New content' }),
    })
  })

  it('updates the post in the store posts array', async () => {
    const posts = [makePost(1), makePost(2), makePost(3)]
    useCommunityStore.setState({ posts })
    const updated = { ...posts[1], title: 'Updated Title', content: 'Updated Body' }
    mockApiFetch.mockResolvedValueOnce({ post: updated })

    await useCommunityStore.getState().updatePost(2, { title: 'Updated Title', content: 'Updated Body' })
    const storePosts = useCommunityStore.getState().posts
    expect(storePosts).toHaveLength(3)
    expect(storePosts[1].title).toBe('Updated Title')
    expect(storePosts[1].content).toBe('Updated Body')
    // Other posts unchanged
    expect(storePosts[0].title).toBe('Post 1')
    expect(storePosts[2].title).toBe('Post 3')
  })

  it('updates currentPost if it matches the edited post', async () => {
    const post = makePost(7)
    useCommunityStore.setState({ posts: [post], currentPost: post })
    const updated = { ...post, title: 'New Title', content: 'New Content' }
    mockApiFetch.mockResolvedValueOnce({ post: updated })

    await useCommunityStore.getState().updatePost(7, { title: 'New Title', content: 'New Content' })
    expect(useCommunityStore.getState().currentPost.title).toBe('New Title')
  })

  it('does not update currentPost if it is a different post', async () => {
    const post = makePost(7)
    const other = makePost(99)
    useCommunityStore.setState({ posts: [post], currentPost: other })
    const updated = { ...post, title: 'Changed' }
    mockApiFetch.mockResolvedValueOnce({ post: updated })

    await useCommunityStore.getState().updatePost(7, { title: 'Changed', content: 'Body' })
    expect(useCommunityStore.getState().currentPost.title).toBe('Post 99')
  })

  it('throws on API error so caller can show feedback', async () => {
    useCommunityStore.setState({ posts: [makePost(1)] })
    mockApiFetch.mockRejectedValueOnce(new Error('you can only edit your own posts'))

    await expect(
      useCommunityStore.getState().updatePost(1, { title: 'T', content: 'C' })
    ).rejects.toThrow('you can only edit your own posts')
    expect(useCommunityStore.getState().error).toBe('you can only edit your own posts')
  })

  it('sets error in store on failure', async () => {
    useCommunityStore.setState({ posts: [makePost(1)] })
    mockApiFetch.mockRejectedValueOnce(new Error('invalid or expired token'))

    try { await useCommunityStore.getState().updatePost(1, { title: 'T', content: 'C' }) } catch {}
    expect(useCommunityStore.getState().error).toBe('invalid or expired token')
  })

  it('preserves other post fields (likes, comments) after update', async () => {
    const post = { ...makePost(1), likes_count: 10, comments_count: 5, liked_by_me: true }
    useCommunityStore.setState({ posts: [post] })
    const updated = { ...post, title: 'Edited', content: 'New' }
    mockApiFetch.mockResolvedValueOnce({ post: updated })

    await useCommunityStore.getState().updatePost(1, { title: 'Edited', content: 'New' })
    const result = useCommunityStore.getState().posts[0]
    expect(result.likes_count).toBe(10)
    expect(result.comments_count).toBe(5)
    expect(result.liked_by_me).toBe(true)
  })
})
