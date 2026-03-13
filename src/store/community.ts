'use client'
import { create } from 'zustand'
import { apiFetch } from '@/lib/api'

export interface CommunityMember {
  id: number
  name: string
  handle: string
  avatar_url: string
  bio: string
  role: string
  location: string
  joined_at: string
  post_count: number
  is_public: boolean
}

export interface CommunityPost {
  id: number
  author_id: number
  author_name: string
  author_handle: string
  author_avatar: string
  title: string
  content: string
  created_at: string
  likes_count: number
  comments_count: number
  tags: string[]
  liked_by_me?: boolean
}

export interface PostComment {
  id: number
  user_id: number
  user_name: string
  user_avatar: string
  content: string
  created_at: string
}

export interface PublicProfile {
  id: number
  name: string
  handle: string
  avatar_url: string
  cover_url: string
  bio: string
  role: string
  location: string
  joined_at: string
  social_links: { platform: string; url: string }[]
  stats: { posts: number; contributions: number; profile_completeness: number }
  recent_posts: CommunityPost[]
}

// ── Dev seed data ──

const devSeedMembers: CommunityMember[] = [
  { id: 1, name: 'Fady Mondy', handle: 'fadymondy', avatar_url: '', bio: 'Creator of Orchestra MCP. AI Expert, Tech Lead.', role: 'Core Member', location: 'Cairo, Egypt', joined_at: '2025-10-01T00:00:00Z', post_count: 5, is_public: true },
  { id: 2, name: 'Alice Chen', handle: 'alice', avatar_url: '', bio: 'Full-stack developer. Open source enthusiast.', role: 'Member', location: 'San Francisco, CA', joined_at: '2025-11-15T00:00:00Z', post_count: 3, is_public: true },
  { id: 3, name: 'Bob Martinez', handle: 'bobm', avatar_url: '', bio: 'Rust engineer and systems programmer.', role: 'Member', location: 'Austin, TX', joined_at: '2025-12-01T00:00:00Z', post_count: 2, is_public: true },
  { id: 4, name: 'Sara Kim', handle: 'sarak', avatar_url: '', bio: 'Mobile developer specializing in React Native.', role: 'Member', location: 'Seoul, Korea', joined_at: '2025-12-20T00:00:00Z', post_count: 1, is_public: true },
  { id: 5, name: 'Omar Hassan', handle: 'omarh', avatar_url: '', bio: 'DevOps engineer. Kubernetes and cloud native.', role: 'Member', location: 'Dubai, UAE', joined_at: '2026-01-10T00:00:00Z', post_count: 0, is_public: true },
  { id: 6, name: 'Lisa Wang', handle: 'lisaw', avatar_url: '', bio: 'UI/UX designer with a passion for accessibility.', role: 'Member', location: 'Toronto, Canada', joined_at: '2026-02-01T00:00:00Z', post_count: 0, is_public: true },
]

const devSeedProfile: PublicProfile = {
  id: 1, name: 'Fady Mondy', handle: 'fadymondy', avatar_url: '', cover_url: '',
  bio: 'Creator of Orchestra MCP. AI Expert, Tech Lead. Building the future of AI-native development.',
  role: 'Core Member', location: 'Cairo, Egypt', joined_at: '2025-10-01T00:00:00Z',
  social_links: [
    { platform: 'github', url: 'https://github.com/fadymondy' },
    { platform: 'twitter', url: 'https://twitter.com/fadymondy' },
    { platform: 'website', url: 'https://orchestra.dev' },
  ],
  stats: { posts: 5, contributions: 42, profile_completeness: 87 },
  recent_posts: [
    { id: 1, author_id: 1, author_name: 'Fady Mondy', author_handle: 'fadymondy', author_avatar: '', title: 'Getting started with Orchestra MCP', content: 'A walkthrough of the plugin architecture and how to build your first extension.', created_at: '2025-10-15T10:00:00Z', likes_count: 12, comments_count: 3, tags: ['tutorial', 'plugins'] },
    { id: 2, author_id: 1, author_name: 'Fady Mondy', author_handle: 'fadymondy', author_avatar: '', title: 'The future of AI-native IDEs', content: 'Why we built Orchestra and where AI development tools are headed.', created_at: '2025-11-01T14:00:00Z', likes_count: 24, comments_count: 7, tags: ['ai', 'vision'] },
  ],
}

const devSeedComments: PostComment[] = [
  { id: 1, user_id: 2, user_name: 'Alice Chen', user_avatar: '', content: 'Great introduction! The plugin system is really well designed.', created_at: '2025-10-16T08:00:00Z' },
  { id: 2, user_id: 3, user_name: 'Bob Martinez', user_avatar: '', content: 'Would love to see more examples with Rust plugins.', created_at: '2025-10-16T12:00:00Z' },
  { id: 3, user_id: 4, user_name: 'Sara Kim', user_avatar: '', content: 'This is exactly what I was looking for. Thanks!', created_at: '2025-10-17T09:00:00Z' },
]

// ── Store ──

interface CommunityState {
  members: CommunityMember[]
  membersTotal: number
  profile: PublicProfile | null
  posts: CommunityPost[]
  comments: PostComment[]
  relatedPosts: CommunityPost[]
  currentPost: CommunityPost | null
  loading: boolean
  error: string | null
}

interface CommunityActions {
  fetchMembers: (page?: number, search?: string) => Promise<void>
  fetchMemberProfile: (handle: string) => Promise<void>
  fetchPosts: (handle: string, page?: number) => Promise<void>
  fetchPost: (id: number) => Promise<void>
  fetchComments: (postId: number) => Promise<void>
  addComment: (postId: number, content: string) => Promise<void>
  likePost: (postId: number) => Promise<void>
  fetchRelatedPosts: (postId: number) => Promise<void>
  createPost: (data: { title: string; content: string; tags?: string[] }) => Promise<void>
  clearProfile: () => void
  clearError: () => void
}

export const useCommunityStore = create<CommunityState & CommunityActions>()((set, get) => ({
  members: [],
  membersTotal: 0,
  profile: null,
  posts: [],
  comments: [],
  relatedPosts: [],
  currentPost: null,
  loading: false,
  error: null,

  fetchMembers: async (page = 1, search = '') => {
    set({ loading: true, error: null })
    try {
      const q = new URLSearchParams({ page: String(page), search })
      const res = await apiFetch<{ members: CommunityMember[]; total: number }>(`/api/public/community/members?${q}`, { skipAuth: true })
      set({ members: res.members, membersTotal: res.total, loading: false })
    } catch (e) {
      if ((e as any).devSeed) {
        const filtered = search ? devSeedMembers.filter(m => m.name.toLowerCase().includes(search.toLowerCase()) || m.handle.toLowerCase().includes(search.toLowerCase())) : devSeedMembers
        set({ members: filtered, membersTotal: filtered.length, loading: false })
        return
      }
      set({ error: (e as Error).message, loading: false })
    }
  },

  fetchMemberProfile: async (handle) => {
    set({ loading: true, error: null, profile: null })
    try {
      const res = await apiFetch<{ profile: PublicProfile }>(`/api/public/community/members/${handle}`, { skipAuth: true })
      set({ profile: res.profile, loading: false })
    } catch (e) {
      if ((e as any).devSeed) {
        const member = devSeedMembers.find(m => m.handle === handle)
        if (member) {
          set({
            profile: { ...devSeedProfile, id: member.id, name: member.name, handle: member.handle, bio: member.bio, role: member.role, location: member.location, joined_at: member.joined_at },
            loading: false,
          })
        } else {
          set({ error: 'Profile not found', loading: false })
        }
        return
      }
      set({ error: (e as Error).message, loading: false })
    }
  },

  fetchPosts: async (handle, page = 1) => {
    set({ loading: true, error: null })
    try {
      const res = await apiFetch<{ posts: CommunityPost[] }>(`/api/public/community/members/${handle}/posts?page=${page}`, { skipAuth: true })
      set({ posts: res.posts, loading: false })
    } catch (e) {
      if ((e as any).devSeed) {
        set({ posts: devSeedProfile.recent_posts, loading: false })
        return
      }
      set({ error: (e as Error).message, loading: false })
    }
  },

  fetchPost: async (id) => {
    set({ loading: true, error: null, currentPost: null })
    try {
      const res = await apiFetch<{ post: CommunityPost }>(`/api/public/community/posts/${id}`, { skipAuth: true })
      set({ currentPost: res.post, loading: false })
    } catch (e) {
      if ((e as any).devSeed) {
        const post = devSeedProfile.recent_posts.find(p => p.id === id)
        set({ currentPost: post || null, loading: false })
        return
      }
      set({ error: (e as Error).message, loading: false })
    }
  },

  fetchComments: async (postId) => {
    try {
      const res = await apiFetch<{ comments: PostComment[] }>(`/api/public/community/posts/${postId}/comments`, { skipAuth: true })
      set({ comments: res.comments })
    } catch (e) {
      if ((e as any).devSeed) {
        set({ comments: devSeedComments })
        return
      }
      set({ error: (e as Error).message })
    }
  },

  addComment: async (postId, content) => {
    try {
      const res = await apiFetch<{ comment: PostComment }>(`/api/community/posts/${postId}/comments`, {
        method: 'POST',
        body: JSON.stringify({ content }),
      })
      set(s => ({ comments: [...s.comments, res.comment] }))
    } catch (e) {
      if ((e as any).devSeed) return
      set({ error: (e as Error).message })
      throw e
    }
  },

  likePost: async (postId) => {
    try {
      await apiFetch(`/api/community/posts/${postId}/like`, { method: 'POST' })
      set(s => ({
        posts: s.posts.map(p => p.id === postId ? { ...p, likes_count: p.liked_by_me ? p.likes_count - 1 : p.likes_count + 1, liked_by_me: !p.liked_by_me } : p),
        currentPost: s.currentPost?.id === postId ? { ...s.currentPost, likes_count: s.currentPost.liked_by_me ? s.currentPost.likes_count - 1 : s.currentPost.likes_count + 1, liked_by_me: !s.currentPost.liked_by_me } : s.currentPost,
      }))
    } catch (e) {
      if ((e as any).devSeed) return
      set({ error: (e as Error).message })
    }
  },

  fetchRelatedPosts: async (postId) => {
    try {
      const res = await apiFetch<{ posts: CommunityPost[] }>(`/api/public/community/posts/${postId}/related`, { skipAuth: true })
      set({ relatedPosts: res.posts })
    } catch (e) {
      if ((e as any).devSeed) {
        set({ relatedPosts: devSeedProfile.recent_posts.filter(p => p.id !== postId) })
        return
      }
      set({ error: (e as Error).message })
    }
  },

  createPost: async (data) => {
    try {
      const res = await apiFetch<{ post: CommunityPost }>('/api/community/posts', {
        method: 'POST',
        body: JSON.stringify(data),
      })
      set(s => ({ posts: [res.post, ...s.posts] }))
    } catch (e) {
      if ((e as any).devSeed) return
      set({ error: (e as Error).message })
      throw e
    }
  },

  clearProfile: () => set({ profile: null, posts: [], comments: [], relatedPosts: [], currentPost: null }),
  clearError: () => set({ error: null }),
}))
