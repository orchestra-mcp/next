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

interface AdminState {
  pages: AdminPage[]
  posts: AdminPost[]
  categories: AdminCategory[]
  contact: AdminContact[]
  issues: AdminIssue[]
  notifications: AdminNotificationSent[]
  settings: Record<string, Record<string, unknown>>
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
  fetchNotificationsSent: () => Promise<void>
  sendNotification: (data: { title: string; message: string; type: string; user_id?: number }) => Promise<void>
  // Settings
  fetchSetting: (key: string) => Promise<Record<string, unknown>>
  updateSetting: (key: string, value: Record<string, unknown>) => Promise<void>
  // Impersonation
  impersonateUser: (userId: number) => Promise<string>
  clearError: () => void
}

// Dev seed defaults — mirrors apps/web/internal/database/seeder.go
const devSeedSettings: Record<string, Record<string, unknown>> = {
  general: {
    site_name: 'Orchestra',
    tagline: 'The AI-Agentic IDE',
    url: 'https://orchestra.dev',
    support_email: 'support@orchestra.dev',
    maintenance_mode: false,
  },
  features: {
    rag: true,
    multi_agent: true,
    marketplace: true,
    quic_bridge: true,
    web_gateway: true,
    packs: true,
  },
  homepage: {
    hero_headline: 'The AI-native workspace for developers',
    hero_subtext: 'Orchestra connects your IDE to 131 AI tools across 5 platforms.',
    cta_primary: 'Get started free',
    cta_secondary: 'View docs',
    stats_tools: '290+',
    stats_plugins: '36',
    stats_platforms: '5',
    stats_packs: '17',
  },
  agents: {
    headline: 'Multi-agent orchestration built in',
    subtext: 'Define agents, connect models, and run workflows.',
    featured_ids: '',
  },
  contact: {
    headline: 'Get in touch',
    support_email: 'hello@orchestra.dev',
    hours: 'Mon–Fri, 9am–5pm PST',
    twitter: '',
    github: 'https://github.com/orchestra-mcp',
    discord: '',
  },
  pricing: {
    free_name: 'Free',
    free_price: '0',
    free_period: 'forever',
    free_cta: 'Get started',
    free_features: 'Unlimited local projects\n5 AI prompts/day\nCommunity support',
    pro_name: 'Pro',
    pro_price: '19',
    pro_period: '/month',
    pro_cta: 'Start free trial',
    pro_features: 'Everything in Free\nUnlimited AI prompts\nCloud sync\nTeam collaboration\nPriority support',
    enterprise_name: 'Enterprise',
    enterprise_price: 'Custom',
    enterprise_period: '',
    enterprise_cta: 'Contact sales',
    enterprise_features: 'Everything in Pro\nSSO & SAML\nDedicated infrastructure\nCustom integrations\n24/7 support',
  },
  download: {
    macos_url: '',
    macos_version: '0.0.2',
    macos_release_date: '2026-02-27',
    windows_url: '',
    windows_version: '0.0.2',
    windows_release_date: '2026-02-27',
    linux_url: '',
    linux_version: '0.0.2',
    linux_release_date: '2026-02-27',
    ios_url: '',
    ios_version: '',
    ios_release_date: '',
    android_url: '',
    android_version: '',
    android_release_date: '',
  },
  integrations: {
    google_client_id: '',
    google_client_secret: '',
    github_client_id: '',
    github_client_secret: '',
  },
  smtp: {
    host: 'smtp.gmail.com',
    port: 587,
    username: '',
    password: '',
    from_name: 'Orchestra',
    from_email: 'noreply@orchestra.dev',
  },
  aimodels: {
    claude_api_key: '',
    claude_default_model: 'claude-opus-4-6',
    openai_api_key: '',
    openai_default_model: 'gpt-4o',
    gemini_api_key: '',
    gemini_default_model: 'gemini-2.0-flash',
    ollama_api_key: '',
    ollama_default_model: 'llama3.2',
  },
  seo: {
    title_template: '%s | Orchestra',
    meta_description: 'Orchestra MCP — the AI-native developer workspace with 131 tools across 5 platforms.',
    og_image_url: '/og-image.png',
    robots_txt: 'User-agent: *\nAllow: /',
    sitemap_url: '/sitemap.xml',
  },
}

export const useAdminStore = create<AdminState & AdminActions>()((set, get) => ({
  pages: [],
  posts: [],
  categories: [],
  contact: [],
  issues: [],
  notifications: [],
  settings: {},
  loading: false,
  error: null,

  fetchPages: async () => {
    set({ loading: true, error: null })
    try {
      const res = await apiFetch<{ pages: AdminPage[] }>('/api/admin/pages')
      set({ pages: res.pages, loading: false })
    } catch (e) {
      if ((e as any).devSeed) { set({ loading: false }); return }
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
      if ((e as any).devSeed) throw e
      set({ error: (e as Error).message })
      throw e
    }
  },

  updatePage: async (id, data) => {
    try {
      const res = await apiFetch<{ page: AdminPage }>(`/api/admin/pages/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      })
      set(s => ({ pages: s.pages.map(p => p.id === id ? res.page : p) }))
    } catch (e) {
      if ((e as any).devSeed) throw e
      set({ error: (e as Error).message })
      throw e
    }
  },

  deletePage: async (id) => {
    try {
      await apiFetch(`/api/admin/pages/${id}`, { method: 'DELETE' })
      set(s => ({ pages: s.pages.filter(p => p.id !== id) }))
    } catch (e) {
      if ((e as any).devSeed) return
      set({ error: (e as Error).message })
      throw e
    }
  },

  fetchPosts: async () => {
    set({ loading: true, error: null })
    try {
      const res = await apiFetch<{ posts: AdminPost[] }>('/api/admin/posts')
      set({ posts: res.posts, loading: false })
    } catch (e) {
      if ((e as any).devSeed) { set({ loading: false }); return }
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
      if ((e as any).devSeed) throw e
      set({ error: (e as Error).message })
      throw e
    }
  },

  updatePost: async (id, data) => {
    try {
      const res = await apiFetch<{ post: AdminPost }>(`/api/admin/posts/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      })
      set(s => ({ posts: s.posts.map(p => p.id === id ? res.post : p) }))
    } catch (e) {
      if ((e as any).devSeed) throw e
      set({ error: (e as Error).message })
      throw e
    }
  },

  deletePost: async (id) => {
    try {
      await apiFetch(`/api/admin/posts/${id}`, { method: 'DELETE' })
      set(s => ({ posts: s.posts.filter(p => p.id !== id) }))
    } catch (e) {
      if ((e as any).devSeed) return
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
      if ((e as any).devSeed) { set({ loading: false }); return }
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
      if ((e as any).devSeed) throw e
      set({ error: (e as Error).message })
      throw e
    }
  },

  deleteCategory: async (id) => {
    try {
      await apiFetch(`/api/admin/categories/${id}`, { method: 'DELETE' })
      set(s => ({ categories: s.categories.filter(c => c.id !== id) }))
    } catch (e) {
      if ((e as any).devSeed) return
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
      if ((e as any).devSeed) { set({ loading: false }); return }
      set({ error: (e as Error).message, loading: false })
    }
  },

  deleteContact: async (id) => {
    try {
      await apiFetch(`/api/admin/contact/${id}`, { method: 'DELETE' })
      set(s => ({ contact: s.contact.filter(c => c.id !== id) }))
    } catch (e) {
      if ((e as any).devSeed) return
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
      if ((e as any).devSeed) { set({ loading: false }); return }
      set({ error: (e as Error).message, loading: false })
    }
  },

  updateIssue: async (id, data) => {
    try {
      const res = await apiFetch<{ issue: AdminIssue }>(`/api/admin/issues/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      })
      set(s => ({ issues: s.issues.map(i => i.id === id ? res.issue : i) }))
    } catch (e) {
      if ((e as any).devSeed) throw e
      set({ error: (e as Error).message })
      throw e
    }
  },

  fetchNotificationsSent: async () => {
    set({ loading: true, error: null })
    try {
      const res = await apiFetch<{ notifications: AdminNotificationSent[] }>('/api/admin/notifications')
      set({ notifications: res.notifications, loading: false })
    } catch (e) {
      if ((e as any).devSeed) { set({ loading: false }); return }
      set({ error: (e as Error).message, loading: false })
    }
  },

  sendNotification: async (data) => {
    try {
      await apiFetch('/api/admin/notifications/send', {
        method: 'POST',
        body: JSON.stringify(data),
      })
      await get().fetchNotificationsSent()
    } catch (e) {
      if ((e as any).devSeed) throw e
      set({ error: (e as Error).message })
      throw e
    }
  },

  fetchSetting: async (key) => {
    try {
      const res = await apiFetch<{ key: string; value: Record<string, unknown> }>(`/api/admin/settings/${key}`)
      set(s => ({ settings: { ...s.settings, [key]: res.value } }))
      return res.value
    } catch (e) {
      if ((e as any).devSeed) {
        const seed = devSeedSettings[key]
        if (seed) {
          set(s => ({ settings: { ...s.settings, [key]: seed } }))
          return seed
        }
        return {}
      }
      set({ error: (e as Error).message })
      throw e
    }
  },

  updateSetting: async (key, value) => {
    try {
      await apiFetch(`/api/admin/settings/${key}`, {
        method: 'PATCH',
        body: JSON.stringify({ value }),
      })
      set(s => ({ settings: { ...s.settings, [key]: value } }))
    } catch (e) {
      if ((e as any).devSeed) {
        // In dev mode, just update local state
        set(s => ({ settings: { ...s.settings, [key]: value } }))
        return
      }
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
      if ((e as any).devSeed) throw e
      set({ error: (e as Error).message })
      throw e
    }
  },

  clearError: () => set({ error: null }),
}))
