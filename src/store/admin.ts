'use client'
import { create } from 'zustand'
import { apiFetch } from '@/lib/api'

export interface AdminPage {
  id: number
  title: string
  slug: string
  content: string
  status: 'draft' | 'published'
  user_id: number
  created_at: string
  updated_at: string
  translations?: Record<string, { title?: string; content?: string }>
}

export interface AdminPost {
  id: number
  title: string
  slug: string
  content: string
  excerpt: string
  status: 'draft' | 'published'
  published_at: string | null
  user_id: number
  created_at: string
  updated_at: string
  translations?: Record<string, { title?: string; content?: string; excerpt?: string }>
}

export interface AdminCategory {
  id: number
  name: string
  slug: string
  type: string
  post_count?: number
}

export interface AdminContact {
  id: number
  name: string
  email: string
  subject: string
  message: string
  status: 'new' | 'read' | 'replied'
  created_at: string
}

export interface AdminIssue {
  id: number
  user_id: number
  title: string
  description: string
  status: 'open' | 'in-review' | 'closed'
  priority: 'low' | 'medium' | 'high'
  created_at: string
  updated_at: string
}

export interface AdminNotificationSent {
  id: number
  title: string
  message: string
  type: string
  target: 'all' | 'user'
  target_user_id?: number
  created_at: string
}

export interface SystemSetting {
  key: string
  value: Record<string, unknown>
  updated_at: string
}

export interface AdminUserDetail {
  id: number
  name: string
  email: string
  role: string
  status: string
  created_at: string
  project_count: number
  note_count: number
  session_count: number
  team_count: number
  issue_count: number
}

export interface AdminSponsor {
  id: number
  name: string
  slug: string
  logo_url: string
  website_url: string
  tier: 'platinum' | 'gold' | 'silver' | 'bronze'
  description: string
  order: number
  status: 'active' | 'inactive'
  created_at: string
  updated_at: string
}

export interface AdminCommunityPost {
  id: number
  user_id: number
  author_name: string
  author_handle: string
  author_avatar: string
  title: string
  content: string
  status: 'published' | 'draft'
  likes_count: number
  comments_count: number
  created_at: string
  updated_at: string
}

export interface AdminGitHubIssue {
  id: number
  github_id: number
  repo: string
  title: string
  body: string
  state: 'open' | 'closed' | 'merged' | 'draft'
  type: 'issue' | 'pr'
  author: string
  author_avatar: string
  labels: string[]
  created_at: string
  updated_at: string
}

export interface AdminGitHubRepo {
  owner: string
  name: string
  full_name: string
}

interface AdminState {
  pages: AdminPage[]
  posts: AdminPost[]
  categories: AdminCategory[]
  contact: AdminContact[]
  issues: AdminIssue[]
  notifications: AdminNotificationSent[]
  notificationsHasMore: boolean
  notificationsLoading: boolean
  sponsors: AdminSponsor[]
  communityPosts: AdminCommunityPost[]
  githubIssues: AdminGitHubIssue[]
  githubRepos: AdminGitHubRepo[]
  settings: Record<string, Record<string, unknown>>
  contentLocale: string
  loading: boolean
  error: string | null
}

interface AdminActions {
  // Pages
  fetchPages: () => Promise<void>
  createPage: (data: Partial<AdminPage>) => Promise<void>
  updatePage: (id: number, data: Partial<AdminPage>) => Promise<void>
  deletePage: (id: number) => Promise<void>
  // Posts
  fetchPosts: () => Promise<void>
  createPost: (data: Partial<AdminPost>) => Promise<void>
  updatePost: (id: number, data: Partial<AdminPost>) => Promise<void>
  deletePost: (id: number) => Promise<void>
  // Categories
  fetchCategories: () => Promise<void>
  createCategory: (name: string, type?: string) => Promise<void>
  deleteCategory: (id: number) => Promise<void>
  // Contact
  fetchContact: () => Promise<void>
  deleteContact: (id: number) => Promise<void>
  // Issues
  fetchIssues: () => Promise<void>
  updateIssue: (id: number, data: Partial<AdminIssue>) => Promise<void>
  // Notifications
  fetchNotificationsSent: (limit?: number, offset?: number) => Promise<void>
  fetchMoreNotifications: () => Promise<void>
  sendNotification: (data: { title: string; message: string; type: string; user_id?: number }) => Promise<void>
  // Sponsors
  fetchSponsors: () => Promise<void>
  createSponsor: (data: Partial<AdminSponsor>) => Promise<void>
  updateSponsor: (id: number, data: Partial<AdminSponsor>) => Promise<void>
  deleteSponsor: (id: number) => Promise<void>
  // Community Posts (admin moderation)
  fetchCommunityPosts: () => Promise<void>
  updateCommunityPost: (id: number, data: Partial<AdminCommunityPost>) => Promise<void>
  deleteCommunityPost: (id: number) => Promise<void>
  // GitHub Issues
  fetchGitHubIssues: (repo?: string) => Promise<void>
  syncGitHubIssues: (repo?: string) => Promise<void>
  fetchGitHubRepos: () => Promise<void>
  // Settings
  fetchSetting: (key: string) => Promise<Record<string, unknown>>
  updateSetting: (key: string, value: Record<string, unknown>) => Promise<void>
  // Impersonation
  impersonateUser: (userId: number) => Promise<string>
  // Content locale
  setContentLocale: (locale: string) => void
  clearError: () => void
}

export const useAdminStore = create<AdminState & AdminActions>()((set, get) => ({
  pages: [],
  posts: [],
  categories: [],
  contact: [],
  issues: [],
  notifications: [],
  notificationsHasMore: true,
  notificationsLoading: false,
  sponsors: [],
  communityPosts: [],
  githubIssues: [],
  githubRepos: [],
  settings: {},
  contentLocale: 'en',
  loading: false,
  error: null,

  setContentLocale: (locale: string) => set({ contentLocale: locale }),

  fetchPages: async () => {
    const { contentLocale } = get()
    set({ loading: true, error: null })
    try {
      const res = await apiFetch<{ pages: AdminPage[] }>(`/api/admin/pages?locale=${contentLocale}`)
      set({ pages: res.pages, loading: false })
    } catch (e) {
      set({ error: (e as Error).message, loading: false })
    }
  },

  createPage: async (data) => {
    try {
      const res = await apiFetch<{ page: AdminPage }>('/api/admin/pages', {
        method: 'POST',
        body: JSON.stringify(data),
      })
      set(s => ({ pages: [res.page, ...s.pages] }))
    } catch (e) {
      set({ error: (e as Error).message })
      throw e
    }
  },

  updatePage: async (id, data) => {
    const locale = (data as any).locale || get().contentLocale
    try {
      const res = await apiFetch<{ page: AdminPage }>(`/api/admin/pages/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ ...data, locale }),
      })
      set(s => ({ pages: s.pages.map(p => p.id === id ? res.page : p) }))
    } catch (e) {
      set({ error: (e as Error).message })
      throw e
    }
  },

  deletePage: async (id) => {
    try {
      await apiFetch(`/api/admin/pages/${id}`, { method: 'DELETE' })
      set(s => ({ pages: s.pages.filter(p => p.id !== id) }))
    } catch (e) {
      set({ error: (e as Error).message })
      throw e
    }
  },

  fetchPosts: async () => {
    const { contentLocale } = get()
    set({ loading: true, error: null })
    try {
      const res = await apiFetch<{ posts: AdminPost[] }>(`/api/admin/posts?locale=${contentLocale}`)
      set({ posts: res.posts, loading: false })
    } catch (e) {
      set({ error: (e as Error).message, loading: false })
    }
  },

  createPost: async (data) => {
    try {
      const res = await apiFetch<{ post: AdminPost }>('/api/admin/posts', {
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
    const locale = (data as any).locale || get().contentLocale
    try {
      const res = await apiFetch<{ post: AdminPost }>(`/api/admin/posts/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ ...data, locale }),
      })
      set(s => ({ posts: s.posts.map(p => p.id === id ? res.post : p) }))
    } catch (e) {
      set({ error: (e as Error).message })
      throw e
    }
  },

  deletePost: async (id) => {
    try {
      await apiFetch(`/api/admin/posts/${id}`, { method: 'DELETE' })
      set(s => ({ posts: s.posts.filter(p => p.id !== id) }))
    } catch (e) {
      set({ error: (e as Error).message })
      throw e
    }
  },

  fetchCategories: async () => {
    set({ loading: true, error: null })
    try {
      const res = await apiFetch<{ categories: AdminCategory[] }>('/api/admin/categories')
      set({ categories: res.categories, loading: false })
    } catch (e) {
      set({ error: (e as Error).message, loading: false })
    }
  },

  createCategory: async (name, type = 'blog') => {
    try {
      const res = await apiFetch<{ category: AdminCategory }>('/api/admin/categories', {
        method: 'POST',
        body: JSON.stringify({ name, type }),
      })
      set(s => ({ categories: [...s.categories, res.category] }))
    } catch (e) {
      set({ error: (e as Error).message })
      throw e
    }
  },

  deleteCategory: async (id) => {
    try {
      await apiFetch(`/api/admin/categories/${id}`, { method: 'DELETE' })
      set(s => ({ categories: s.categories.filter(c => c.id !== id) }))
    } catch (e) {
      set({ error: (e as Error).message })
      throw e
    }
  },

  fetchContact: async () => {
    set({ loading: true, error: null })
    try {
      const res = await apiFetch<{ messages: AdminContact[] }>('/api/admin/contact')
      set({ contact: res.messages, loading: false })
    } catch (e) {
      set({ error: (e as Error).message, loading: false })
    }
  },

  deleteContact: async (id) => {
    try {
      await apiFetch(`/api/admin/contact/${id}`, { method: 'DELETE' })
      set(s => ({ contact: s.contact.filter(c => c.id !== id) }))
    } catch (e) {
      set({ error: (e as Error).message })
      throw e
    }
  },

  fetchIssues: async () => {
    set({ loading: true, error: null })
    try {
      const res = await apiFetch<{ issues: AdminIssue[] }>('/api/admin/issues')
      set({ issues: res.issues, loading: false })
    } catch (e) {
      set({ error: (e as Error).message, loading: false })
    }
  },

  updateIssue: async (id, data) => {
    try {
      const res = await apiFetch<{ issue: AdminIssue }>(`/api/admin/issues/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify(data),
      })
      set(s => ({ issues: s.issues.map(i => i.id === id ? res.issue : i) }))
    } catch (e) {
      set({ error: (e as Error).message })
      throw e
    }
  },

  fetchNotificationsSent: async (limit = 20, offset = 0) => {
    set({ notificationsLoading: true, error: null })
    try {
      const res = await apiFetch<{ notifications: AdminNotificationSent[] }>(`/api/admin/notifications?limit=${limit}&offset=${offset}`)
      const items = res.notifications ?? []
      set({ notifications: items, notificationsHasMore: items.length >= limit, notificationsLoading: false })
    } catch (e) {
      set({ error: (e as Error).message, notificationsLoading: false })
    }
  },

  fetchMoreNotifications: async () => {
    const { notifications, notificationsHasMore, notificationsLoading } = get()
    if (!notificationsHasMore || notificationsLoading) return
    const limit = 20
    const offset = notifications.length
    set({ notificationsLoading: true })
    try {
      const res = await apiFetch<{ notifications: AdminNotificationSent[] }>(`/api/admin/notifications?limit=${limit}&offset=${offset}`)
      const items = res.notifications ?? []
      set(s => {
        const existingIds = new Set(s.notifications.map(n => n.id))
        const newItems = items.filter(n => !existingIds.has(n.id))
        return { notifications: [...s.notifications, ...newItems], notificationsHasMore: items.length >= limit, notificationsLoading: false }
      })
    } catch (e) {
      set({ error: (e as Error).message, notificationsLoading: false })
    }
  },

  sendNotification: async (data) => {
    try {
      await apiFetch('/api/admin/notifications', {
        method: 'POST',
        body: JSON.stringify(data),
      })
      await get().fetchNotificationsSent()
    } catch (e) {
      set({ error: (e as Error).message })
      throw e
    }
  },

  // ── Sponsors ──

  fetchSponsors: async () => {
    set({ loading: true, error: null })
    try {
      const res = await apiFetch<{ sponsors: AdminSponsor[] }>('/api/admin/sponsors')
      set({ sponsors: res.sponsors ?? [], loading: false })
    } catch (e) {
      set({ error: (e as Error).message, loading: false })
    }
  },

  createSponsor: async (data) => {
    try {
      const res = await apiFetch<{ sponsor: AdminSponsor }>('/api/admin/sponsors', {
        method: 'POST',
        body: JSON.stringify(data),
      })
      set(s => ({ sponsors: [res.sponsor, ...s.sponsors] }))
    } catch (e) {
      set({ error: (e as Error).message })
      throw e
    }
  },

  updateSponsor: async (id, data) => {
    try {
      const res = await apiFetch<{ sponsor: AdminSponsor }>(`/api/admin/sponsors/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      })
      set(s => ({ sponsors: s.sponsors.map(sp => sp.id === id ? res.sponsor : sp) }))
    } catch (e) {
      set({ error: (e as Error).message })
      throw e
    }
  },

  deleteSponsor: async (id) => {
    try {
      await apiFetch(`/api/admin/sponsors/${id}`, { method: 'DELETE' })
      set(s => ({ sponsors: s.sponsors.filter(sp => sp.id !== id) }))
    } catch (e) {
      set({ error: (e as Error).message })
      throw e
    }
  },

  // ── Community Posts (admin moderation) ──

  fetchCommunityPosts: async () => {
    set({ loading: true, error: null })
    try {
      const res = await apiFetch<{ posts: AdminCommunityPost[] }>('/api/admin/community/posts')
      set({ communityPosts: res.posts ?? [], loading: false })
    } catch (e) {
      set({ error: (e as Error).message, loading: false })
    }
  },

  updateCommunityPost: async (id, data) => {
    try {
      const res = await apiFetch<{ post: AdminCommunityPost }>(`/api/admin/community/posts/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      })
      set(s => ({ communityPosts: s.communityPosts.map(p => p.id === id ? res.post : p) }))
    } catch (e) {
      set({ error: (e as Error).message })
      throw e
    }
  },

  deleteCommunityPost: async (id) => {
    try {
      await apiFetch(`/api/admin/community/posts/${id}`, { method: 'DELETE' })
      set(s => ({ communityPosts: s.communityPosts.filter(p => p.id !== id) }))
    } catch (e) {
      set({ error: (e as Error).message })
      throw e
    }
  },

  // ── GitHub Issues ──

  fetchGitHubIssues: async (repo) => {
    set({ loading: true, error: null })
    try {
      const q = repo ? `?repo=${encodeURIComponent(repo)}` : ''
      const res = await apiFetch<{ issues: AdminGitHubIssue[] }>(`/api/admin/github/issues${q}`)
      set({ githubIssues: res.issues ?? [], loading: false })
    } catch (e) {
      set({ error: (e as Error).message, loading: false })
    }
  },

  syncGitHubIssues: async (repo) => {
    set({ loading: true, error: null })
    try {
      const body = repo ? JSON.stringify({ repo }) : undefined
      await apiFetch('/api/admin/github/sync', { method: 'POST', body })
      await get().fetchGitHubIssues(repo)
    } catch (e) {
      set({ error: (e as Error).message, loading: false })
      throw e
    }
  },

  fetchGitHubRepos: async () => {
    try {
      const res = await apiFetch<{ repos: AdminGitHubRepo[] }>('/api/admin/github/repos')
      set({ githubRepos: res.repos ?? [] })
    } catch (e) {
      set({ error: (e as Error).message })
    }
  },

  // ── Settings ──

  fetchSetting: async (key) => {
    const { contentLocale } = get()
    try {
      const res = await apiFetch<{ setting: { key: string; value: Record<string, unknown>; locale: string; updated_at: string } }>(`/api/admin/settings/${key}?locale=${contentLocale}`)
      set(s => ({ settings: { ...s.settings, [key]: res.setting.value } }))
      return res.setting.value
    } catch (e) {
      set({ error: (e as Error).message })
      throw e
    }
  },

  updateSetting: async (key, value) => {
    const { contentLocale } = get()
    try {
      await apiFetch(`/api/admin/settings/${key}?locale=${contentLocale}`, {
        method: 'PATCH',
        body: JSON.stringify({ value }),
      })
      set(s => ({ settings: { ...s.settings, [key]: value } }))
    } catch (e) {
      set({ error: (e as Error).message })
      throw e
    }
  },

  impersonateUser: async (userId) => {
    try {
      const res = await apiFetch<{ token: string }>(`/api/admin/users/${userId}/impersonate`, {
        method: 'POST',
      })
      return res.token
    } catch (e) {
      set({ error: (e as Error).message })
      throw e
    }
  },

  clearError: () => set({ error: null }),
}))
