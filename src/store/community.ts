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
  slug?: string
  author_id: number
  author_name: string
  author_handle: string
  author_avatar: string
  title: string
  content: string
  icon?: string
  color?: string
  media?: string
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
  parent_id?: number | null
}

export interface BadgeItem {
  id: number
  slug: string
  name: string
  description: string
  icon: string
  color: string
  category: string
  awarded_at: string
}

export interface VerificationTier {
  slug: string
  name: string
  icon: string
  color: string
  badge_text: string
  verified_at: string
}

export interface WalletInfo {
  balance: number
  lifetime_earned: number
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
  stats: { posts: number; contributions: number; profile_completeness: number; points?: number }
  recent_posts: CommunityPost[]
  badges?: BadgeItem[]
  verifications?: VerificationTier[]
  wallet?: WalletInfo
  is_verified?: boolean
  show_badges?: boolean
  show_wallet?: boolean
  teams?: { name: string; slug: string; avatar_url?: string; role: string }[]
  sponsors?: { name: string; logo_url: string; url: string; order: number }[]
}

export interface SharedEntity {
  id: string
  entity_type: 'note' | 'skill' | 'agent' | 'workflow'
  entity_id: string
  title: string
  description: string
  content: string
  visibility: 'public' | 'team'
  tags: string[]
  icon: string
  color: string
  created_at: string
  author_handle?: string
  author_name?: string
  author_avatar?: string
}

// ── Store ──

export interface ActivityItem {
  type: string
  id: number
  title?: string
  excerpt: string
  parent_id?: number
  entity_type?: string
  slug?: string
  created_at: string
}

interface CommunityState {
  members: CommunityMember[]
  membersTotal: number
  profile: PublicProfile | null
  posts: CommunityPost[]
  comments: PostComment[]
  relatedPosts: CommunityPost[]
  currentPost: CommunityPost | null
  sharedEntities: SharedEntity[]
  activity: ActivityItem[]
  loading: boolean
  error: string | null
}

interface CommunityActions {
  fetchMembers: (page?: number, search?: string) => Promise<void>
  fetchMemberProfile: (handle: string) => Promise<void>
  fetchPosts: (handle: string, page?: number) => Promise<void>
  fetchPost: (id: number) => Promise<void>
  fetchComments: (postId: number) => Promise<void>
  addComment: (postId: number, content: string, parentId?: number) => Promise<void>
  likePost: (postId: number) => Promise<void>
  fetchRelatedPosts: (postId: number) => Promise<void>
  createPost: (data: { title: string; content: string; icon?: string; color?: string; media?: string; tags?: string[] }) => Promise<void>
  updatePost: (id: number, data: { title: string; content: string; icon?: string; color?: string; tags?: string[] }) => Promise<void>
  deletePost: (id: number) => Promise<void>
  fetchActivity: (handle: string) => Promise<void>
  fetchSharedEntities: (handle: string, type?: string) => Promise<void>
  shareEntity: (data: Omit<SharedEntity, 'id' | 'created_at' | 'author_handle' | 'author_name' | 'author_avatar'>) => Promise<void>
  unshareEntity: (id: string) => Promise<void>
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
  sharedEntities: [],
  activity: [],
  loading: false,
  error: null,

  fetchMembers: async (page = 1, search = '') => {
    set({ loading: true, error: null })
    try {
      const q = new URLSearchParams({ page: String(page), search })
      const res = await apiFetch<{ members: CommunityMember[]; total: number }>(`/api/public/community/members?${q}`, { skipAuth: true })
      set({ members: res.members || [], membersTotal: res.total || 0, loading: false })
    } catch (e) {
      set({ error: (e as Error).message, loading: false })
    }
  },

  fetchMemberProfile: async (handle) => {
    set({ loading: true, error: null, profile: null })
    try {
      const res = await apiFetch<{ profile: PublicProfile }>(`/api/public/community/members/${handle}`)
      let profile = res.profile

      // Merge seed gamification data if the API doesn't return it yet
      const seed = getSeedProfile(handle)
      if (profile && seed) {
        if (!profile.badges || profile.badges.length === 0) profile.badges = seed.badges
        if (!profile.verifications || profile.verifications.length === 0) profile.verifications = seed.verifications
        if (!profile.wallet) profile.wallet = seed.wallet
        if (profile.show_badges === undefined) profile.show_badges = seed.show_badges
        if (profile.show_wallet === undefined) profile.show_wallet = seed.show_wallet
        if (!profile.bio) profile.bio = seed.bio
        if (!profile.social_links || profile.social_links.length === 0) profile.social_links = seed.social_links
        // teams and sponsors come from real data only — no seed fallback
      }

      set({ profile, loading: false })
    } catch (e) {
      // Full seed fallback when API fails entirely
      const seedProfile = getSeedProfile(handle)
      if (seedProfile) {
        set({ profile: seedProfile, loading: false })
      } else {
        set({ error: (e as Error).message, loading: false })
      }
    }
  },

  fetchPosts: async (handle, page = 1) => {
    set({ loading: true, error: null })
    try {
      const res = await apiFetch<{ posts: CommunityPost[] }>(`/api/public/community/members/${handle}/posts?page=${page}`, { skipAuth: true })
      set({ posts: res.posts || [], loading: false })
    } catch (e) {
      set({ error: (e as Error).message, loading: false })
    }
  },

  fetchPost: async (id) => {
    set({ loading: true, error: null, currentPost: null })
    try {
      const res = await apiFetch<{ post: CommunityPost }>(`/api/public/community/posts/${id}`, { skipAuth: true })
      set({ currentPost: res.post, loading: false })
    } catch (e) {
      set({ error: (e as Error).message, loading: false })
    }
  },

  fetchComments: async (postId) => {
    try {
      const res = await apiFetch<{ comments: PostComment[] }>(`/api/public/community/posts/${postId}/comments`, { skipAuth: true })
      set({ comments: res.comments || [] })
    } catch (e) {
      set({ error: (e as Error).message })
    }
  },

  addComment: async (postId, content, parentId) => {
    try {
      const body: Record<string, unknown> = { content }
      if (parentId != null) body.parent_id = parentId
      const res = await apiFetch<{ comment: PostComment }>(`/api/community/posts/${postId}/comments`, {
        method: 'POST',
        body: JSON.stringify(body),
      })
      set(s => ({ comments: [...s.comments, res.comment] }))
    } catch (e) {
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
      set({ error: (e as Error).message })
    }
  },

  fetchRelatedPosts: async (postId) => {
    try {
      const res = await apiFetch<{ posts: CommunityPost[] }>(`/api/public/community/posts/${postId}/related`, { skipAuth: true })
      set({ relatedPosts: res.posts || [] })
    } catch (e) {
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
      set({ error: (e as Error).message })
      throw e
    }
  },

  updatePost: async (id, data) => {
    try {
      const res = await apiFetch<{ post: CommunityPost }>(`/api/community/posts/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      })
      set(s => ({
        posts: s.posts.map(p => p.id === id ? { ...p, ...res.post } : p),
        currentPost: s.currentPost?.id === id ? { ...s.currentPost, ...res.post } : s.currentPost,
      }))
    } catch (e) {
      set({ error: (e as Error).message })
      throw e
    }
  },

  deletePost: async (id) => {
    try {
      await apiFetch(`/api/community/posts/${id}`, { method: 'DELETE' })
      set(s => ({
        posts: s.posts.filter(p => p.id !== id),
        currentPost: s.currentPost?.id === id ? null : s.currentPost,
      }))
    } catch (e) {
      set({ error: (e as Error).message })
      throw e
    }
  },

  fetchActivity: async (handle) => {
    try {
      const res = await apiFetch<{ activity: ActivityItem[] }>(`/api/public/community/members/${handle}/activity`, { skipAuth: true })
      const items = (res.activity || []).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      set({ activity: items })
    } catch (e) {
      set({ error: (e as Error).message })
    }
  },

  fetchSharedEntities: async (handle, type) => {
    set({ loading: true, error: null })
    try {
      const q = type ? `?type=${encodeURIComponent(type)}` : ''
      const res = await apiFetch<{ data: SharedEntity[]; count: number }>(`/api/public/community/shared/${handle}${q}`, { skipAuth: true })
      set({ sharedEntities: res.data || [], loading: false })
    } catch (e) {
      set({ error: (e as Error).message, loading: false })
    }
  },

  shareEntity: async (data) => {
    try {
      await apiFetch<{ status: string }>('/api/community/share', {
        method: 'POST',
        body: JSON.stringify(data),
      })
    } catch (e) {
      set({ error: (e as Error).message })
      throw e
    }
  },

  unshareEntity: async (id) => {
    try {
      await apiFetch<{ status: string }>(`/api/community/share/${id}`, { method: 'DELETE' })
      set(s => ({ sharedEntities: s.sharedEntities.filter(e => e.id !== id) }))
    } catch (e) {
      set({ error: (e as Error).message })
      throw e
    }
  },

  clearProfile: () => set({ profile: null, posts: [], comments: [], relatedPosts: [], currentPost: null, sharedEntities: [], error: null }),
  clearError: () => set({ error: null }),
}))

// ── Seed profile for testing ──

function getSeedProfile(handle: string): PublicProfile | null {
  if (handle !== 'engfadymondy' && handle !== 'fadymondy') return null
  return {
    id: 17,
    name: 'Fady Mondy',
    handle: handle,
    avatar_url: '',
    cover_url: '',
    bio: 'Full-stack engineer building Orchestra MCP. Go, Rust, Swift, Flutter. Making AI-powered development accessible to everyone.',
    role: 'admin',
    location: 'Cairo, Egypt',
    joined_at: '2026-02-15T00:00:00Z',
    social_links: [
      { platform: 'github', url: 'https://github.com/engfadymondy' },
      { platform: 'twitter', url: 'https://twitter.com/engfadymondy' },
      { platform: 'website', url: 'https://orchestra-mcp.dev' },
    ],
    stats: { posts: 12, contributions: 87, profile_completeness: 100, points: 285 },
    recent_posts: [],
    is_verified: true,
    show_badges: true,
    show_wallet: true,
    verifications: [
      { slug: 'verified', name: 'Verified', icon: 'bxs-badge-check', color: '#00e5ff', badge_text: 'Verified', verified_at: '2026-02-15T00:00:00Z' },
    ],
    badges: [
      { id: 1, slug: 'first-feature', name: 'First Feature', description: 'Completed your first feature', icon: 'bx-check-circle', color: '#22c55e', category: 'achievement', awarded_at: '2026-03-02T14:30:00Z' },
      { id: 2, slug: 'ten-features', name: 'Feature Pro', description: 'Completed 10 features', icon: 'bx-trophy', color: '#f59e0b', category: 'achievement', awarded_at: '2026-03-15T10:00:00Z' },
      { id: 3, slug: 'first-review', name: 'Reviewer', description: 'First code review', icon: 'bx-search-alt', color: '#00e5ff', category: 'achievement', awarded_at: '2026-03-06T10:00:00Z' },
      { id: 4, slug: 'bug-hunter', name: 'Bug Hunter', description: 'Reported 5 bugs that were fixed', icon: 'bx-bug', color: '#ef4444', category: 'achievement', awarded_at: '2026-03-10T12:00:00Z' },
      { id: 5, slug: 'streak-7', name: 'Week Streak', description: '7-day activity streak', icon: 'bxs-hot', color: '#f97316', category: 'streak', awarded_at: '2026-03-08T00:00:00Z' },
      { id: 6, slug: 'streak-30', name: 'Month Streak', description: '30-day activity streak', icon: 'bxs-rocket', color: '#f59e0b', category: 'streak', awarded_at: '2026-03-19T00:00:00Z' },
      { id: 7, slug: 'points-100', name: 'Centurion', description: 'Earned 100 points', icon: 'bx-star', color: '#00e5ff', category: 'points', awarded_at: '2026-03-10T12:00:00Z' },
      { id: 8, slug: 'early-adopter', name: 'Early Adopter', description: 'Joined during beta', icon: 'bx-rocket', color: '#8b5cf6', category: 'special', awarded_at: '2026-03-01T00:00:00Z' },
      { id: 9, slug: 'community-star', name: 'Community Star', description: 'Outstanding community contribution', icon: 'bx-heart', color: '#ef4444', category: 'special', awarded_at: '2026-03-12T15:00:00Z' },
    ],
    wallet: { balance: 285, lifetime_earned: 340 },
    teams: [
      { name: 'Orchestra Core', slug: 'orchestra-core', avatar_url: '', role: 'Lead' },
      { name: 'MCP Community', slug: 'mcp-community', avatar_url: '', role: 'Member' },
    ],
    sponsors: [
      { name: 'Anthropic', logo_url: 'https://anthropic.com/favicon.ico', url: 'https://anthropic.com', order: 1 },
      { name: 'Vercel', logo_url: 'https://vercel.com/favicon.ico', url: 'https://vercel.com', order: 2 },
      { name: 'Cloudflare', logo_url: 'https://cloudflare.com/favicon.ico', url: 'https://cloudflare.com', order: 3 },
    ],
  }
}
