'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { apiFetch } from '@/lib/api'
import { connectPowerSync, disconnectPowerSync } from '@/lib/powersync'

function base64urlToBuffer(b64: string): ArrayBuffer {
  const s = b64.replace(/-/g, '+').replace(/_/g, '/')
  const pad = s.length % 4 === 0 ? '' : '='.repeat(4 - (s.length % 4))
  const bin = atob(s + pad)
  const buf = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i)
  return buf.buffer
}

function bufferToBase64url(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf)
  let s = ''
  for (const b of bytes) s += String.fromCharCode(b)
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export interface User {
  id: number
  name: string
  username?: string
  email: string
  bio?: string
  avatar_url?: string | null
  cover_url?: string | null
  is_public?: boolean
  two_factor_enabled?: boolean
  settings?: Record<string, unknown> | null
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
  // Passkeys
  beginPasskeyRegistration: () => Promise<PublicKeyCredentialCreationOptions>
  finishPasskeyRegistration: (credential: Credential, name?: string) => Promise<void>
  loginWithPasskey: () => Promise<void>
  // Avatar
  updateAvatarUrl: (avatarUrl: string) => void
  // Impersonation
  startImpersonation: (targetUser: User, impersonationToken: string) => void
  exitImpersonation: () => void
}

/** Extract a human-readable message from any error shape */
function extractErrorMessage(e: unknown): string {
  if (!e) return 'Unknown error'
  // Standard Error
  let msg = (e as any).message ?? String(e)
  // If the message looks like raw JSON, parse it
  if (typeof msg === 'string' && msg.startsWith('{')) {
    try {
      const parsed = JSON.parse(msg)
      msg = parsed.message || parsed.error || msg
    } catch {}
  }
  return msg
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
          connectPowerSync().catch(() => {})
        } catch (e) {
          if ((e as any).requires2fa) throw e
          set({ error: extractErrorMessage(e), loading: false })
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
          connectPowerSync().catch(() => {})
        } catch (e) {
          set({ error: extractErrorMessage(e), loading: false })
          throw e
        }
      },

      logout: () => {
        disconnectPowerSync().catch(() => {})
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
          // Connect PowerSync for cross-device sync.
          connectPowerSync().catch(() => {})
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
          set({ error: extractErrorMessage(e), loading: false })
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
          set({ error: extractErrorMessage(e), loading: false })
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
          set({ error: extractErrorMessage(e), loading: false })
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
          set({ error: extractErrorMessage(e), loading: false })
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
          set({ error: extractErrorMessage(e), loading: false })
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
          set({ error: extractErrorMessage(e), loading: false })
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
          set({ error: extractErrorMessage(e), loading: false })
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
          set({ error: extractErrorMessage(e), loading: false })
          throw e
        }
      },

      beginPasskeyRegistration: async () => {
        const res = await apiFetch<{ publicKey: PublicKeyCredentialCreationOptions }>('/api/auth/passkey/register/begin', { method: 'POST', body: JSON.stringify({}) })
        // Decode base64url fields for the Web Credentials API
        const opts = res.publicKey
        opts.challenge = base64urlToBuffer(opts.challenge as unknown as string)
        opts.user.id = base64urlToBuffer(opts.user.id as unknown as string)
        if (opts.excludeCredentials) {
          opts.excludeCredentials = opts.excludeCredentials.map(c => ({
            ...c,
            id: base64urlToBuffer(c.id as unknown as string),
          }))
        }
        return opts
      },

      finishPasskeyRegistration: async (credential, name) => {
        const cred = credential as PublicKeyCredential
        const attestation = cred.response as AuthenticatorAttestationResponse
        await apiFetch('/api/auth/passkey/register/finish', {
          method: 'POST',
          body: JSON.stringify({
            id: cred.id,
            rawId: bufferToBase64url(cred.rawId),
            type: cred.type,
            name: name || undefined,
            response: {
              attestationObject: bufferToBase64url(attestation.attestationObject),
              clientDataJSON: bufferToBase64url(attestation.clientDataJSON),
              transports: attestation.getTransports?.() ?? [],
            },
          }),
        })
      },

      loginWithPasskey: async () => {
        set({ loading: true, error: null })
        try {
          // Step 1: Get challenge from server
          const beginRes = await apiFetch<{
            publicKey?: { challenge: string; rpId: string; timeout: number; userVerification: string; allowCredentials?: Array<{ id: string; type: string; transports?: string[] }> }
            session_id?: string
            error?: string
          }>('/api/auth/passkey/authenticate/begin', { method: 'POST', body: JSON.stringify({}), skipAuth: true })

          if (!beginRes.publicKey) {
            throw new Error(beginRes.error || 'Server returned invalid passkey challenge. Check that passkeys are configured.')
          }

          const opts: PublicKeyCredentialRequestOptions = {
            challenge: base64urlToBuffer(beginRes.publicKey.challenge),
            rpId: beginRes.publicKey.rpId,
            timeout: beginRes.publicKey.timeout,
            userVerification: beginRes.publicKey.userVerification as UserVerificationRequirement,
          }
          if (beginRes.publicKey.allowCredentials?.length) {
            opts.allowCredentials = beginRes.publicKey.allowCredentials.map(c => ({
              id: base64urlToBuffer(c.id),
              type: c.type as PublicKeyCredentialType,
              transports: c.transports as AuthenticatorTransport[],
            }))
          }

          // Step 2: Prompt user's authenticator
          const credential = await navigator.credentials.get({ publicKey: opts }) as PublicKeyCredential | null
          if (!credential) { set({ loading: false }); throw new Error('Passkey authentication cancelled') }

          const assertion = credential.response as AuthenticatorAssertionResponse

          // Step 3: Send to server for verification
          const res = await apiFetch<{ token: string; user: User }>('/api/auth/passkey/authenticate/finish', {
            method: 'POST',
            body: JSON.stringify({
              id: credential.id,
              rawId: bufferToBase64url(credential.rawId),
              type: credential.type,
              session_id: beginRes.session_id,
              response: {
                authenticatorData: bufferToBase64url(assertion.authenticatorData),
                clientDataJSON: bufferToBase64url(assertion.clientDataJSON),
                signature: bufferToBase64url(assertion.signature),
                userHandle: assertion.userHandle ? bufferToBase64url(assertion.userHandle) : undefined,
              },
            }),
            skipAuth: true,
          })

          localStorage.setItem('orchestra_token', res.token)
          document.cookie = `orchestra_token=${res.token};path=/;max-age=86400;SameSite=Lax`
          set({ token: res.token, user: res.user, loading: false })
        } catch (e) {
          set({ error: extractErrorMessage(e), loading: false })
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
