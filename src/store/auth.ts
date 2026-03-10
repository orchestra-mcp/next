'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { apiFetch } from '@/lib/api'

export interface User {
  id: number
  name: string
  email: string
  avatar_url?: string | null
  two_factor_enabled?: boolean
}

export interface ImpersonatingUser {
  id: number
  name: string
  email: string
  originalToken: string
}

interface AuthState {
  token: string | null
  user: User | null
  loading: boolean
  error: string | null
  impersonating: ImpersonatingUser | null
}

interface AuthActions {
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  fetchMe: () => Promise<void>
  clearError: () => void
  // Forgot password / OTP / reset
  forgotPassword: (email: string) => Promise<void>
  verifyOtp: (email: string, otp: string, purpose: 'reset' | 'magic') => Promise<{ token?: string }>
  resetPassword: (token: string, password: string) => Promise<void>
  // Magic link login
  requestMagicLink: (email: string) => Promise<void>
  // 2FA
  setup2FA: () => Promise<{ qr_url: string; secret: string }>
  confirm2FA: (code: string) => Promise<void>
  disable2FA: (code: string) => Promise<void>
  verify2FA: (code: string, tempToken: string) => Promise<void>
  // Avatar
  updateAvatarUrl: (avatarUrl: string) => void
  // Impersonation
  startImpersonation: (targetUser: User, impersonationToken: string) => void
  exitImpersonation: () => void
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      loading: false,
      error: null,
      impersonating: null,

      login: async (email, password) => {
        set({ loading: true, error: null })
        try {
          const res = await apiFetch<{ token: string; user: User; requires_2fa?: boolean; temp_token?: string }>('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
            skipAuth: true,
          })
          if (res.requires_2fa && res.temp_token) {
            // Signal the caller that 2FA is needed — store temp token in session
            sessionStorage.setItem('orchestra_2fa_token', res.temp_token)
            sessionStorage.setItem('orchestra_2fa_email', email)
            set({ loading: false })
            throw Object.assign(new Error('2FA_REQUIRED'), { requires2fa: true, tempToken: res.temp_token })
          }
          localStorage.setItem('orchestra_token', res.token)
          document.cookie = `orchestra_token=${res.token};path=/;max-age=86400;SameSite=Lax`
          set({ token: res.token, user: res.user, loading: false })
        } catch (e) {
          if ((e as any).requires2fa) throw e
          set({ error: (e as Error).message, loading: false })
          throw e
        }
      },

      register: async (name, email, password) => {
        set({ loading: true, error: null })
        try {
          const res = await apiFetch<{ token: string; user: User }>('/api/auth/register', {
            method: 'POST',
            body: JSON.stringify({ name, email, password }),
            skipAuth: true,
          })
          localStorage.setItem('orchestra_token', res.token)
          localStorage.setItem('orchestra_is_new_user', '1')
          document.cookie = `orchestra_token=${res.token};path=/;max-age=86400;SameSite=Lax`
          set({ token: res.token, user: res.user, loading: false })
        } catch (e) {
          set({ error: (e as Error).message, loading: false })
          throw e
        }
      },

      logout: () => {
        localStorage.removeItem('orchestra_token')
        document.cookie = 'orchestra_token=;path=/;max-age=0'
        sessionStorage.removeItem('orchestra_2fa_token')
        sessionStorage.removeItem('orchestra_2fa_email')
        set({ token: null, user: null, impersonating: null })
      },

      updateAvatarUrl: (avatarUrl) => {
        const user = get().user
        if (user) set({ user: { ...user, avatar_url: avatarUrl } })
      },

      startImpersonation: (targetUser, impersonationToken) => {
        const currentToken = localStorage.getItem('orchestra_token') ?? ''
        const impersonatingData: ImpersonatingUser = {
          id: targetUser.id,
          name: targetUser.name,
          email: targetUser.email,
          originalToken: currentToken,
        }
        localStorage.setItem('orchestra_token', impersonationToken)
        document.cookie = `orchestra_token=${impersonationToken};path=/;max-age=86400;SameSite=Lax`
        set({ token: impersonationToken, user: targetUser, impersonating: impersonatingData })
      },

      exitImpersonation: () => {
        const { impersonating } = get()
        if (!impersonating) return
        localStorage.setItem('orchestra_token', impersonating.originalToken)
        set({ token: impersonating.originalToken, impersonating: null })
        // Re-fetch the real user
        get().fetchMe()
      },

      fetchMe: async () => {
        // Skip API call for dev seed sessions — user is already set in store
        const token = typeof window !== 'undefined' ? localStorage.getItem('orchestra_token') : null
        if (token === 'dev_seed_token') return
        try {
          const user = await apiFetch<User>('/api/auth/me')
          set({ user })
        } catch {
          get().logout()
        }
      },

      clearError: () => set({ error: null }),

      forgotPassword: async (email) => {
        set({ loading: true, error: null })
        try {
          await apiFetch('/api/auth/forgot-password', {
            method: 'POST',
            body: JSON.stringify({ email }),
            skipAuth: true,
          })
          set({ loading: false })
        } catch (e) {
          set({ error: (e as Error).message, loading: false })
          throw e
        }
      },

      verifyOtp: async (email, otp, purpose) => {
        set({ loading: true, error: null })
        try {
          const res = await apiFetch<{ token?: string; reset_token?: string }>('/api/auth/verify-otp', {
            method: 'POST',
            body: JSON.stringify({ email, otp, purpose }),
            skipAuth: true,
          })
          set({ loading: false })
          if (purpose === 'magic' && res.token) {
            localStorage.setItem('orchestra_token', res.token)
            const user = await apiFetch<User>('/api/auth/me', {
              headers: { Authorization: `Bearer ${res.token}` },
              skipAuth: true,
            })
            set({ token: res.token, user })
          }
          return { token: res.reset_token ?? res.token }
        } catch (e) {
          set({ error: (e as Error).message, loading: false })
          throw e
        }
      },

      resetPassword: async (token, password) => {
        set({ loading: true, error: null })
        try {
          await apiFetch('/api/auth/reset-password', {
            method: 'POST',
            body: JSON.stringify({ token, password }),
            skipAuth: true,
          })
          set({ loading: false })
        } catch (e) {
          set({ error: (e as Error).message, loading: false })
          throw e
        }
      },

      requestMagicLink: async (email) => {
        set({ loading: true, error: null })
        try {
          await apiFetch('/api/auth/magic-link', {
            method: 'POST',
            body: JSON.stringify({ email }),
            skipAuth: true,
          })
          set({ loading: false })
        } catch (e) {
          set({ error: (e as Error).message, loading: false })
          throw e
        }
      },

      setup2FA: async () => {
        set({ loading: true, error: null })
        try {
          const res = await apiFetch<{ qr_url: string; secret: string }>('/api/auth/2fa/setup')
          set({ loading: false })
          return res
        } catch (e) {
          set({ error: (e as Error).message, loading: false })
          throw e
        }
      },

      confirm2FA: async (code) => {
        set({ loading: true, error: null })
        try {
          await apiFetch('/api/auth/2fa/confirm', {
            method: 'POST',
            body: JSON.stringify({ code }),
          })
          set({ loading: false, user: get().user ? { ...get().user!, two_factor_enabled: true } : null })
        } catch (e) {
          set({ error: (e as Error).message, loading: false })
          throw e
        }
      },

      disable2FA: async (code) => {
        set({ loading: true, error: null })
        try {
          await apiFetch('/api/auth/2fa/disable', {
            method: 'POST',
            body: JSON.stringify({ code }),
          })
          set({ loading: false, user: get().user ? { ...get().user!, two_factor_enabled: false } : null })
        } catch (e) {
          set({ error: (e as Error).message, loading: false })
          throw e
        }
      },

      verify2FA: async (code, tempToken) => {
        set({ loading: true, error: null })
        try {
          const res = await apiFetch<{ token: string; user: User }>('/api/auth/2fa/verify', {
            method: 'POST',
            body: JSON.stringify({ code, temp_token: tempToken }),
            skipAuth: true,
          })
          localStorage.setItem('orchestra_token', res.token)
          sessionStorage.removeItem('orchestra_2fa_token')
          sessionStorage.removeItem('orchestra_2fa_email')
          set({ token: res.token, user: res.user, loading: false })
        } catch (e) {
          set({ error: (e as Error).message, loading: false })
          throw e
        }
      },
    }),
    {
      name: 'orchestra-auth',
      partialize: (state) => ({ token: state.token, user: state.user }),
    }
  )
)
