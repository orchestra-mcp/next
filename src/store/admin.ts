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
  fetchNotificationsSent: () => Promise<void>
  sendNotification: (data: { title: string; message: string; type: string; user_id?: number }) => Promise<void>
  seedNotifications: () => Promise<void>
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
    projects: true,
    notes: true,
    plans: true,
    wiki: true,
    devtools: true,
    sponsors: true,
    community: true,
    issues: true,
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
    google_enabled: false,
    google_client_id: '',
    google_client_secret: '',
    github_enabled: false,
    github_client_id: '',
    github_client_secret: '',
    discord_enabled: false,
    discord_client_id: '',
    discord_client_secret: '',
    slack_enabled: false,
    slack_client_id: '',
    slack_client_secret: '',
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
  github: {
    token: '',
    default_repos: 'orchestra-mcp/framework',
    sync_interval: 60,
  },
  community: {
    headline: 'Our Community',
    subtext: 'Meet the people building with Orchestra',
  },
  sponsors: {
    headline: 'Our Sponsors',
    subtext: 'Thanks to our amazing sponsors',
  },
  social_platforms: {
    platforms: [
      { value: 'github', label: 'GitHub', icon: 'bxl-github', placeholder: 'https://github.com/...' },
      { value: 'twitter', label: 'Twitter / X', icon: 'bxl-twitter', placeholder: 'https://twitter.com/...' },
      { value: 'linkedin', label: 'LinkedIn', icon: 'bxl-linkedin', placeholder: 'https://linkedin.com/in/...' },
      { value: 'website', label: 'Website', icon: 'bx-globe', placeholder: 'https://...' },
      { value: 'youtube', label: 'YouTube', icon: 'bxl-youtube', placeholder: 'https://youtube.com/@...' },
      { value: 'instagram', label: 'Instagram', icon: 'bxl-instagram', placeholder: 'https://instagram.com/...' },
      { value: 'discord', label: 'Discord', icon: 'bxl-discord', placeholder: 'https://discord.gg/...' },
      { value: 'mastodon', label: 'Mastodon', icon: 'bxl-mastodon', placeholder: 'https://mastodon.social/@...' },
      { value: 'dribbble', label: 'Dribbble', icon: 'bxl-dribbble', placeholder: 'https://dribbble.com/...' },
      { value: 'tiktok', label: 'TikTok', icon: 'bxl-tiktok', placeholder: 'https://tiktok.com/@...' },
      { value: 'facebook', label: 'Facebook', icon: 'bxl-facebook', placeholder: 'https://facebook.com/...' },
      { value: 'telegram', label: 'Telegram', icon: 'bxl-telegram', placeholder: 'https://t.me/...' },
      { value: 'reddit', label: 'Reddit', icon: 'bxl-reddit', placeholder: 'https://reddit.com/u/...' },
      { value: 'stackoverflow', label: 'Stack Overflow', icon: 'bxl-stack-overflow', placeholder: 'https://stackoverflow.com/users/...' },
      { value: 'medium', label: 'Medium', icon: 'bxl-medium', placeholder: 'https://medium.com/@...' },
      { value: 'dev_to', label: 'Dev.to', icon: 'bxl-dev-to', placeholder: 'https://dev.to/...' },
      { value: 'twitch', label: 'Twitch', icon: 'bxl-twitch', placeholder: 'https://twitch.tv/...' },
      { value: 'spotify', label: 'Spotify', icon: 'bxl-spotify', placeholder: 'https://open.spotify.com/...' },
      { value: 'pinterest', label: 'Pinterest', icon: 'bxl-pinterest', placeholder: 'https://pinterest.com/...' },
      { value: 'behance', label: 'Behance', icon: 'bxl-behance', placeholder: 'https://behance.net/...' },
      { value: 'other', label: 'Other', icon: 'bx-link', placeholder: 'https://...' },
    ],
  },
}

const devSeedSponsors: AdminSponsor[] = [
  { id: 1, name: 'Vercel', slug: 'vercel', logo_url: 'https://assets.vercel.com/image/upload/v1588805858/repositories/vercel/logo.png', website_url: 'https://vercel.com', tier: 'platinum', description: 'The platform for frontend developers.', order: 1, status: 'active', created_at: '2025-06-01T00:00:00Z', updated_at: '2025-06-01T00:00:00Z' },
  { id: 2, name: 'Supabase', slug: 'supabase', logo_url: 'https://supabase.com/brand-assets/supabase-logo-icon.png', website_url: 'https://supabase.com', tier: 'gold', description: 'The open source Firebase alternative.', order: 1, status: 'active', created_at: '2025-06-01T00:00:00Z', updated_at: '2025-06-01T00:00:00Z' },
  { id: 3, name: 'Turso', slug: 'turso', logo_url: 'https://turso.tech/favicon.ico', website_url: 'https://turso.tech', tier: 'silver', description: 'SQLite for production.', order: 1, status: 'active', created_at: '2025-06-01T00:00:00Z', updated_at: '2025-06-01T00:00:00Z' },
  { id: 4, name: 'Bun', slug: 'bun', logo_url: 'https://bun.sh/logo.svg', website_url: 'https://bun.sh', tier: 'bronze', description: 'Incredibly fast JavaScript runtime.', order: 1, status: 'active', created_at: '2025-06-01T00:00:00Z', updated_at: '2025-06-01T00:00:00Z' },
]

const devSeedCommunityPosts: AdminCommunityPost[] = [
  { id: 1, user_id: 1, author_name: 'Fady Mondy', author_handle: 'fadymondy', author_avatar: '', title: 'Getting started with Orchestra MCP', content: 'A walkthrough of the plugin architecture and how to build your first extension.', status: 'published', likes_count: 12, comments_count: 3, created_at: '2025-10-15T10:00:00Z', updated_at: '2025-10-15T10:00:00Z' },
  { id: 2, user_id: 2, author_name: 'Alice Chen', author_handle: 'alice', author_avatar: '', title: 'Building AI agents with Orchestra', content: 'How I connected multiple LLM providers using the agent orchestrator plugin.', status: 'published', likes_count: 8, comments_count: 2, created_at: '2025-11-02T14:00:00Z', updated_at: '2025-11-02T14:00:00Z' },
  { id: 3, user_id: 3, author_name: 'Bob Martinez', author_handle: 'bobm', author_avatar: '', title: 'My experience with the Rust engine', content: 'Tree-sitter parsing and Tantivy search indexing have been game changers for code navigation.', status: 'published', likes_count: 15, comments_count: 5, created_at: '2025-11-20T09:00:00Z', updated_at: '2025-11-20T09:00:00Z' },
  { id: 4, user_id: 4, author_name: 'Sara Kim', author_handle: 'sarak', author_avatar: '', title: 'Orchestra on mobile — first impressions', content: 'Testing the React Native app with WatermelonDB offline sync.', status: 'published', likes_count: 6, comments_count: 1, created_at: '2025-12-05T16:00:00Z', updated_at: '2025-12-05T16:00:00Z' },
  { id: 5, user_id: 1, author_name: 'Fady Mondy', author_handle: 'fadymondy', author_avatar: '', title: 'Draft: Plugin marketplace launch', content: 'Work in progress notes about the upcoming marketplace.', status: 'draft', likes_count: 0, comments_count: 0, created_at: '2026-01-10T11:00:00Z', updated_at: '2026-01-10T11:00:00Z' },
]

const devSeedGitHubIssues: AdminGitHubIssue[] = [
  { id: 1, github_id: 42, repo: 'orchestra-mcp/framework', title: 'Add hot-reload for plugin development', body: 'Currently plugins require a full restart.', state: 'open', type: 'issue', author: 'fadymondy', author_avatar: '', labels: ['enhancement'], created_at: '2026-01-15T10:00:00Z', updated_at: '2026-01-15T10:00:00Z' },
  { id: 2, github_id: 43, repo: 'orchestra-mcp/framework', title: 'Fix QUIC reconnection on network change', body: 'Connection drops when switching WiFi networks.', state: 'closed', type: 'issue', author: 'alice', author_avatar: '', labels: ['bug'], created_at: '2026-01-10T08:00:00Z', updated_at: '2026-01-12T14:00:00Z' },
  { id: 3, github_id: 44, repo: 'orchestra-mcp/framework', title: 'feat: Add vector search to memory engine', body: 'LanceDB integration for improved RAG.', state: 'merged', type: 'pr', author: 'bobm', author_avatar: '', labels: ['feature'], created_at: '2026-01-08T12:00:00Z', updated_at: '2026-01-09T16:00:00Z' },
  { id: 4, github_id: 45, repo: 'orchestra-mcp/framework', title: 'Update proto definitions for v2 API', body: 'Breaking changes to the gRPC contract.', state: 'open', type: 'pr', author: 'fadymondy', author_avatar: '', labels: ['breaking-change'], created_at: '2026-02-01T09:00:00Z', updated_at: '2026-02-01T09:00:00Z' },
  { id: 5, github_id: 46, repo: 'orchestra-mcp/framework', title: 'Improve Tree-sitter grammar for Go', body: 'Better support for generics syntax.', state: 'closed', type: 'issue', author: 'sarak', author_avatar: '', labels: ['enhancement'], created_at: '2025-12-20T11:00:00Z', updated_at: '2026-01-05T10:00:00Z' },
  { id: 6, github_id: 47, repo: 'orchestra-mcp/framework', title: 'docs: Plugin development guide', body: 'Comprehensive guide for building Orchestra plugins.', state: 'merged', type: 'pr', author: 'fadymondy', author_avatar: '', labels: ['documentation'], created_at: '2025-12-15T14:00:00Z', updated_at: '2025-12-18T09:00:00Z' },
  { id: 7, github_id: 48, repo: 'orchestra-mcp/framework', title: 'Add rate limiting to bridge plugins', body: 'Prevent API quota exhaustion.', state: 'open', type: 'issue', author: 'alice', author_avatar: '', labels: ['enhancement'], created_at: '2026-02-10T10:00:00Z', updated_at: '2026-02-10T10:00:00Z' },
  { id: 8, github_id: 49, repo: 'orchestra-mcp/framework', title: 'WIP: Widget system refactor', body: 'Unifying widget data contract across platforms.', state: 'draft', type: 'pr', author: 'bobm', author_avatar: '', labels: ['refactor'], created_at: '2026-02-20T15:00:00Z', updated_at: '2026-02-20T15:00:00Z' },
]

export const useAdminStore = create<AdminState & AdminActions>()((set, get) => ({
  pages: [],
  posts: [],
  categories: [],
  contact: [],
  issues: [],
  notifications: [],
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
    const locale = (data as any).locale || get().contentLocale
    try {
      const res = await apiFetch<{ page: AdminPage }>(`/api/admin/pages/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ ...data, locale }),
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
    const { contentLocale } = get()
    set({ loading: true, error: null })
    try {
      const res = await apiFetch<{ posts: AdminPost[] }>(`/api/admin/posts?locale=${contentLocale}`)
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
    const locale = (data as any).locale || get().contentLocale
    try {
      const res = await apiFetch<{ post: AdminPost }>(`/api/admin/posts/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ ...data, locale }),
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

  seedNotifications: async () => {
    try {
      await apiFetch('/api/admin/notifications/seed', { method: 'POST' })
      await get().fetchNotificationsSent()
    } catch (e) {
      if ((e as any).devSeed) return
      set({ error: (e as Error).message })
    }
  },

  // ── Sponsors ──

  fetchSponsors: async () => {
    set({ loading: true, error: null })
    try {
      const res = await apiFetch<{ sponsors: AdminSponsor[] }>('/api/admin/sponsors')
      set({ sponsors: res.sponsors ?? [], loading: false })
    } catch (e) {
      if ((e as any).devSeed) {
        set({ sponsors: devSeedSponsors, loading: false })
        return
      }
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
      if ((e as any).devSeed) throw e
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
      if ((e as any).devSeed) throw e
      set({ error: (e as Error).message })
      throw e
    }
  },

  deleteSponsor: async (id) => {
    try {
      await apiFetch(`/api/admin/sponsors/${id}`, { method: 'DELETE' })
      set(s => ({ sponsors: s.sponsors.filter(sp => sp.id !== id) }))
    } catch (e) {
      if ((e as any).devSeed) return
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
      if ((e as any).devSeed) {
        set({ communityPosts: devSeedCommunityPosts, loading: false })
        return
      }
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
      if ((e as any).devSeed) throw e
      set({ error: (e as Error).message })
      throw e
    }
  },

  deleteCommunityPost: async (id) => {
    try {
      await apiFetch(`/api/admin/community/posts/${id}`, { method: 'DELETE' })
      set(s => ({ communityPosts: s.communityPosts.filter(p => p.id !== id) }))
    } catch (e) {
      if ((e as any).devSeed) return
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
      if ((e as any).devSeed) {
        set({ githubIssues: devSeedGitHubIssues, loading: false })
        return
      }
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
      if ((e as any).devSeed) { set({ loading: false }); return }
      set({ error: (e as Error).message, loading: false })
      throw e
    }
  },

  fetchGitHubRepos: async () => {
    try {
      const res = await apiFetch<{ repos: AdminGitHubRepo[] }>('/api/admin/github/repos')
      set({ githubRepos: res.repos ?? [] })
    } catch (e) {
      if ((e as any).devSeed) {
        set({ githubRepos: [{ owner: 'orchestra-mcp', name: 'framework', full_name: 'orchestra-mcp/framework' }] })
        return
      }
      set({ error: (e as Error).message })
    }
  },

  // ── Settings ──

  fetchSetting: async (key) => {
    const { contentLocale } = get()
    try {
      const res = await apiFetch<{ key: string; value: Record<string, unknown> }>(`/api/admin/settings/${key}?locale=${contentLocale}`)
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
    const { contentLocale } = get()
    try {
      await apiFetch(`/api/admin/settings/${key}?locale=${contentLocale}`, {
        method: 'PATCH',
        body: JSON.stringify(value),
      })
      set(s => ({ settings: { ...s.settings, [key]: value } }))
    } catch (e) {
      if ((e as any).devSeed) {
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
