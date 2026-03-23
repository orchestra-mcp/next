'use client'
import { create } from 'zustand'
import * as db from '@/lib/supabase/queries'

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
    set({ loading: true, error: null })
    try {
      const items = await db.fetchAdminPages()
      set({ pages: items as AdminPage[], loading: false })
    } catch (e) {
      set({ error: (e as Error).message, loading: false })
    }
  },

  createPage: async (data) => {
    try {
      const page = await db.createAdminPage(data as Record<string, unknown>)
      set(s => ({ pages: [page as AdminPage, ...s.pages] }))
    } catch (e) {
      set({ error: (e as Error).message })
      throw e
    }
  },

  updatePage: async (id, data) => {
    try {
      const page = await db.updateAdminPage(id, data as Record<string, unknown>)
      set(s => ({ pages: s.pages.map(p => p.id === id ? page as AdminPage : p) }))
    } catch (e) {
      set({ error: (e as Error).message })
      throw e
    }
  },

  deletePage: async (id) => {
    try {
      await db.deleteAdminPage(id)
      set(s => ({ pages: s.pages.filter(p => p.id !== id) }))
    } catch (e) {
      set({ error: (e as Error).message })
      throw e
    }
  },

  fetchPosts: async () => {
    set({ loading: true, error: null })
    try {
      const items = await db.fetchAdminPosts()
      set({ posts: items as AdminPost[], loading: false })
    } catch (e) {
      set({ error: (e as Error).message, loading: false })
    }
  },

  createPost: async (data) => {
    try {
      const post = await db.createAdminPost(data as Record<string, unknown>)
      set(s => ({ posts: [post as AdminPost, ...s.posts] }))
    } catch (e) {
      set({ error: (e as Error).message })
      throw e
    }
  },

  updatePost: async (id, data) => {
    try {
      const post = await db.updateAdminPost(id, data as Record<string, unknown>)
      set(s => ({ posts: s.posts.map(p => p.id === id ? post as AdminPost : p) }))
    } catch (e) {
      set({ error: (e as Error).message })
      throw e
    }
  },

  deletePost: async (id) => {
    try {
      await db.deleteAdminPost(id)
      set(s => ({ posts: s.posts.filter(p => p.id !== id) }))
    } catch (e) {
      set({ error: (e as Error).message })
      throw e
    }
  },

  fetchCategories: async () => {
    set({ loading: true, error: null })
    try {
      const items = await db.fetchAdminCategories()
      set({ categories: items as AdminCategory[], loading: false })
    } catch (e) {
      set({ error: (e as Error).message, loading: false })
    }
  },

  createCategory: async (name, type = 'blog') => {
    try {
      const cat = await db.createAdminCategory(name, type)
      set(s => ({ categories: [...s.categories, cat as AdminCategory] }))
    } catch (e) {
      set({ error: (e as Error).message })
      throw e
    }
  },

  deleteCategory: async (id) => {
    try {
      await db.deleteAdminCategory(id)
      set(s => ({ categories: s.categories.filter(c => c.id !== id) }))
    } catch (e) {
      set({ error: (e as Error).message })
      throw e
    }
  },

  fetchContact: async () => {
    set({ loading: true, error: null })
    try {
      const items = await db.fetchAdminContact()
      set({ contact: items as AdminContact[], loading: false })
    } catch (e) {
      set({ error: (e as Error).message, loading: false })
    }
  },

  deleteContact: async (id) => {
    try {
      await db.deleteAdminContact(id)
      set(s => ({ contact: s.contact.filter(c => c.id !== id) }))
    } catch (e) {
      set({ error: (e as Error).message })
      throw e
    }
  },

  fetchIssues: async () => {
    set({ loading: true, error: null })
    try {
      const items = await db.fetchAdminIssues()
      set({ issues: items as AdminIssue[], loading: false })
    } catch (e) {
      set({ error: (e as Error).message, loading: false })
    }
  },

  updateIssue: async (id, data) => {
    try {
      const issue = await db.updateAdminIssue(id, data as Record<string, unknown>)
      set(s => ({ issues: s.issues.map(i => i.id === id ? issue as AdminIssue : i) }))
    } catch (e) {
      set({ error: (e as Error).message })
      throw e
    }
  },

  fetchNotificationsSent: async (limit = 20, offset = 0) => {
    set({ notificationsLoading: true, error: null })
    try {
      const items = await db.fetchAdminNotificationsSent(limit, offset) as AdminNotificationSent[]
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
      const items = await db.fetchAdminNotificationsSent(limit, offset) as AdminNotificationSent[]
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
      await db.sendAdminNotification(data as Record<string, unknown>)
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
      const items = await db.fetchAdminSponsors()
      set({ sponsors: (items ?? []) as AdminSponsor[], loading: false })
    } catch (e) {
      set({ error: (e as Error).message, loading: false })
    }
  },

  createSponsor: async (data) => {
    try {
      const sponsor = await db.createAdminSponsor(data as Record<string, unknown>)
      set(s => ({ sponsors: [sponsor as AdminSponsor, ...s.sponsors] }))
    } catch (e) {
      set({ error: (e as Error).message })
      throw e
    }
  },

  updateSponsor: async (id, data) => {
    try {
      const sponsor = await db.updateAdminSponsor(id, data as Record<string, unknown>)
      set(s => ({ sponsors: s.sponsors.map(sp => sp.id === id ? sponsor as AdminSponsor : sp) }))
    } catch (e) {
      set({ error: (e as Error).message })
      throw e
    }
  },

  deleteSponsor: async (id) => {
    try {
      await db.deleteAdminSponsor(id)
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
      const items = await db.fetchAdminCommunityPosts()
      set({ communityPosts: (items ?? []) as AdminCommunityPost[], loading: false })
    } catch (e) {
      set({ error: (e as Error).message, loading: false })
    }
  },

  updateCommunityPost: async (id, data) => {
    try {
      const post = await db.updateAdminCommunityPost(id, data as Record<string, unknown>)
      set(s => ({ communityPosts: s.communityPosts.map(p => p.id === id ? post as AdminCommunityPost : p) }))
    } catch (e) {
      set({ error: (e as Error).message })
      throw e
    }
  },

  deleteCommunityPost: async (id) => {
    try {
      await db.deleteAdminCommunityPost(id)
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
      const items = await db.fetchAdminGitHubIssues(repo)
      set({ githubIssues: (items ?? []) as AdminGitHubIssue[], loading: false })
    } catch (e) {
      set({ error: (e as Error).message, loading: false })
    }
  },

  syncGitHubIssues: async (repo) => {
    set({ loading: true, error: null })
    try {
      // GitHub sync reads from github_issues table — trigger a re-fetch
      // Future: edge function to sync from GitHub API
      await get().fetchGitHubIssues(repo)
    } catch (e) {
      set({ error: (e as Error).message, loading: false })
      throw e
    }
  },

  fetchGitHubRepos: async () => {
    try {
      const items = await db.fetchAdminGitHubRepos()
      // Extract unique repos
      const seen = new Set<string>()
      const repos: AdminGitHubRepo[] = []
      for (const item of items as any[]) {
        const repo = item.repo as string
        if (!seen.has(repo)) {
          seen.add(repo)
          const parts = repo.split('/')
          repos.push({ owner: parts[0] || '', name: parts[1] || repo, full_name: repo })
        }
      }
      set({ githubRepos: repos })
    } catch (e) {
      set({ error: (e as Error).message })
    }
  },

  // ── Settings ──

  fetchSetting: async (key) => {
    try {
      const val = await db.fetchAdminSetting(key)
      set(s => ({ settings: { ...s.settings, [key]: val } }))
      return val
    } catch (e) {
      set({ error: (e as Error).message })
      throw e
    }
  },

  updateSetting: async (key, value) => {
    try {
      await db.updateAdminSetting(key, value)
      set(s => ({ settings: { ...s.settings, [key]: value } }))
    } catch (e) {
      set({ error: (e as Error).message })
      throw e
    }
  },

  impersonateUser: async (userId) => {
    // Impersonation not available via PostgREST — requires admin Supabase auth
    // This would need a dedicated edge function in the future
    throw new Error('Impersonation requires an admin edge function')
  },

  clearError: () => set({ error: null }),
}))
