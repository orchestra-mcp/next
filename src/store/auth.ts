'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { createClient } from '@/lib/supabase/client'
import { connectRealtime, disconnectRealtime } from '@/lib/supabase/realtime'

const EDGE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''

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
  originalMcpToken: string
}

interface AuthState {
  mcpToken: string | null
  user: User | null
  loading: boolean
  error: string | null
  impersonating: ImpersonatingUser | null
}

interface AuthActions {
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  loginWithOAuth: (provider: 'github' | 'google') => Promise<void>
  logout: () => Promise<void>
  fetchMe: () => Promise<void>
  clearError: () => void
  // Forgot password (link-based)
  forgotPassword: (email: string) => Promise<void>
  resetPassword: (password: string) => Promise<void>
  // Magic link login (link-based)
  requestMagicLink: (email: string) => Promise<void>
  // 2FA (Supabase MFA)
  setup2FA: () => Promise<{ qr_url: string; secret: string; factorId: string }>
  confirm2FA: (factorId: string, code: string) => Promise<void>
  disable2FA: (factorId: string) => Promise<void>
  verify2FA: (factorId: string, code: string) => Promise<void>
  // Passkeys (via edge function)
  beginPasskeyRegistration: () => Promise<PublicKeyCredentialCreationOptions>
  finishPasskeyRegistration: (credential: Credential, name?: string) => Promise<void>
  loginWithPasskey: () => Promise<void>
  // Avatar
  updateAvatarUrl: (avatarUrl: string) => void
  // Impersonation
  startImpersonation: (targetUser: User, impersonationToken: string) => void
  exitImpersonation: () => void
  // MCP token exchange
  exchangeMcpToken: () => Promise<string | null>
  // Auth state listener
  initAuthListener: () => () => void
}

/** Extract a human-readable message from any error shape */
function extractErrorMessage(e: unknown): string {
  if (!e) return 'Unknown error'
  let msg = (e as any).message ?? String(e)
  if (typeof msg === 'string' && msg.startsWith('{')) {
    try {
      const parsed = JSON.parse(msg)
      msg = parsed.message || parsed.error || msg
    } catch {}
  }
  return msg
}

/** Fetch the public.users profile for a Supabase auth user. */
async function fetchUserProfile(): Promise<User | null> {
  const sb = createClient()
  const { data } = await sb.from('users').select('*').single()
  return data as User | null
}

/** Call the mcp-token edge function to exchange Supabase JWT for MCP token. */
async function exchangeForMcpToken(): Promise<string | null> {
  const sb = createClient()
  const { data: { session } } = await sb.auth.getSession()
  if (!session?.access_token) return null

  try {
    const res = await fetch(`${EDGE_URL}/functions/v1/mcp-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ supabase_token: session.access_token }),
    })
    if (!res.ok) return null
    const { mcp_token } = await res.json()
    return mcp_token ?? null
  } catch {
    return null
  }
}

/** Call the passkey edge function. */
async function passkeyEdgeFetch<T>(action: string, body: Record<string, unknown>, authToken?: string): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (authToken) headers['Authorization'] = `Bearer ${authToken}`

  const res = await fetch(`${EDGE_URL}/functions/v1/passkey`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ action, ...body }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
    throw new Error(err.error || err.message || `Passkey request failed`)
  }

  return res.json()
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      mcpToken: null,
      user: null,
      loading: false,
      error: null,
      impersonating: null,

      login: async (email, password) => {
        set({ loading: true, error: null })
        try {
          const sb = createClient()
          const { data, error } = await sb.auth.signInWithPassword({ email, password })
          if (error) throw error

          // Check if MFA is required
          if (data.session === null && data.user) {
            set({ loading: false })
            throw Object.assign(new Error('2FA_REQUIRED'), { requires2fa: true })
          }

          const user = await fetchUserProfile()
          const mcpToken = await exchangeForMcpToken()
          set({ mcpToken, user, loading: false })
          connectRealtime()
        } catch (e) {
          if ((e as any).requires2fa) throw e
          set({ error: extractErrorMessage(e), loading: false })
          throw e
        }
      },

      register: async (name, email, password) => {
        set({ loading: true, error: null })
        try {
          const sb = createClient()
          const { error } = await sb.auth.signUp({
            email,
            password,
            options: { data: { name } },
          })
          if (error) throw error

          const user = await fetchUserProfile()
          const mcpToken = await exchangeForMcpToken()
          localStorage.setItem('orchestra_is_new_user', '1')
          set({ mcpToken, user, loading: false })
          connectRealtime()
        } catch (e) {
          set({ error: extractErrorMessage(e), loading: false })
          throw e
        }
      },

      loginWithOAuth: async (provider) => {
        const sb = createClient()
        const { error } = await sb.auth.signInWithOAuth({
          provider,
          options: {
            redirectTo: `${window.location.origin}/auth/callback`,
          },
        })
        if (error) throw error
        // Browser redirects — no further action needed
      },

      logout: async () => {
        disconnectRealtime()
        const sb = createClient()
        await sb.auth.signOut()
        set({ mcpToken: null, user: null, impersonating: null })
      },

      updateAvatarUrl: (avatarUrl) => {
        const user = get().user
        if (user) set({ user: { ...user, avatar_url: avatarUrl } })
      },

      startImpersonation: (targetUser, impersonationToken) => {
        const currentMcpToken = get().mcpToken ?? ''
        const impersonatingData: ImpersonatingUser = {
          id: targetUser.id,
          name: targetUser.name,
          email: targetUser.email,
          originalMcpToken: currentMcpToken,
        }
        set({ mcpToken: impersonationToken, user: targetUser, impersonating: impersonatingData })
      },

      exitImpersonation: () => {
        const { impersonating } = get()
        if (!impersonating) return
        set({ mcpToken: impersonating.originalMcpToken, impersonating: null })
        get().fetchMe()
      },

      fetchMe: async () => {
        try {
          const sb = createClient()
          const { data: { user: authUser } } = await sb.auth.getUser()
          if (!authUser) { get().logout(); return }

          const user = await fetchUserProfile()
          if (!user) { get().logout(); return }

          const mcpToken = get().mcpToken || await exchangeForMcpToken()
          set({ user, mcpToken })
          connectRealtime()
        } catch {
          get().logout()
        }
      },

      clearError: () => set({ error: null }),

      forgotPassword: async (email) => {
        set({ loading: true, error: null })
        try {
          const sb = createClient()
          const { error } = await sb.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
          })
          if (error) throw error
          set({ loading: false })
        } catch (e) {
          set({ error: extractErrorMessage(e), loading: false })
          throw e
        }
      },

      resetPassword: async (password) => {
        set({ loading: true, error: null })
        try {
          const sb = createClient()
          const { error } = await sb.auth.updateUser({ password })
          if (error) throw error
          set({ loading: false })
        } catch (e) {
          set({ error: extractErrorMessage(e), loading: false })
          throw e
        }
      },

      requestMagicLink: async (email) => {
        set({ loading: true, error: null })
        try {
          const sb = createClient()
          const { error } = await sb.auth.signInWithOtp({
            email,
            options: { shouldCreateUser: false },
          })
          if (error) throw error
          set({ loading: false })
        } catch (e) {
          set({ error: extractErrorMessage(e), loading: false })
          throw e
        }
      },

      setup2FA: async () => {
        set({ loading: true, error: null })
        try {
          const sb = createClient()
          const { data, error } = await sb.auth.mfa.enroll({ factorType: 'totp' })
          if (error) throw error
          set({ loading: false })
          return {
            qr_url: data.totp.qr_code,
            secret: data.totp.secret,
            factorId: data.id,
          }
        } catch (e) {
          set({ error: extractErrorMessage(e), loading: false })
          throw e
        }
      },

      confirm2FA: async (factorId, code) => {
        set({ loading: true, error: null })
        try {
          const sb = createClient()
          const { data: challenge, error: challengeError } = await sb.auth.mfa.challenge({ factorId })
          if (challengeError) throw challengeError
          const { error: verifyError } = await sb.auth.mfa.verify({
            factorId,
            challengeId: challenge.id,
            code,
          })
          if (verifyError) throw verifyError
          set({ loading: false, user: get().user ? { ...get().user!, two_factor_enabled: true } : null })
        } catch (e) {
          set({ error: extractErrorMessage(e), loading: false })
          throw e
        }
      },

      disable2FA: async (factorId) => {
        set({ loading: true, error: null })
        try {
          const sb = createClient()
          const { error } = await sb.auth.mfa.unenroll({ factorId })
          if (error) throw error
          set({ loading: false, user: get().user ? { ...get().user!, two_factor_enabled: false } : null })
        } catch (e) {
          set({ error: extractErrorMessage(e), loading: false })
          throw e
        }
      },

      verify2FA: async (factorId, code) => {
        set({ loading: true, error: null })
        try {
          const sb = createClient()
          const { data: challenge, error: challengeError } = await sb.auth.mfa.challenge({ factorId })
          if (challengeError) throw challengeError
          const { error: verifyError } = await sb.auth.mfa.verify({
            factorId,
            challengeId: challenge.id,
            code,
          })
          if (verifyError) throw verifyError

          const user = await fetchUserProfile()
          const mcpToken = await exchangeForMcpToken()
          set({ mcpToken, user, loading: false })
          connectRealtime()
        } catch (e) {
          set({ error: extractErrorMessage(e), loading: false })
          throw e
        }
      },

      beginPasskeyRegistration: async () => {
        const sb = createClient()
        const { data: { session } } = await sb.auth.getSession()
        if (!session) throw new Error('Not authenticated')

        const res = await passkeyEdgeFetch<{ publicKey: any }>('register_begin', {}, session.access_token)
        const opts = res.publicKey
        opts.challenge = base64urlToBuffer(opts.challenge)
        opts.user.id = base64urlToBuffer(opts.user.id)
        if (opts.excludeCredentials) {
          opts.excludeCredentials = opts.excludeCredentials.map((c: any) => ({
            ...c,
            id: base64urlToBuffer(c.id),
          }))
        }
        return opts as PublicKeyCredentialCreationOptions
      },

      finishPasskeyRegistration: async (credential, name) => {
        const sb = createClient()
        const { data: { session } } = await sb.auth.getSession()
        if (!session) throw new Error('Not authenticated')

        const cred = credential as PublicKeyCredential
        const attestation = cred.response as AuthenticatorAttestationResponse
        await passkeyEdgeFetch('register_finish', {
          id: cred.id,
          rawId: bufferToBase64url(cred.rawId),
          type: cred.type,
          name: name || undefined,
          response: {
            attestationObject: bufferToBase64url(attestation.attestationObject),
            clientDataJSON: bufferToBase64url(attestation.clientDataJSON),
            transports: attestation.getTransports?.() ?? [],
          },
        }, session.access_token)
      },

      loginWithPasskey: async () => {
        set({ loading: true, error: null })
        try {
          // Step 1: Get challenge from edge function
          const beginRes = await passkeyEdgeFetch<{
            publicKey?: { challenge: string; rpId: string; timeout: number; userVerification: string; allowCredentials?: Array<{ id: string; type: string; transports?: string[] }> }
            session_id?: string
          }>('authenticate_begin', {})

          if (!beginRes.publicKey) {
            throw new Error('Server returned invalid passkey challenge.')
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

          // Step 3: Send to edge function for verification — returns a Supabase session
          const finishRes = await passkeyEdgeFetch<{ access_token: string; refresh_token: string }>('authenticate_finish', {
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
          })

          // Set the Supabase session from the passkey edge function response
          const sb = createClient()
          await sb.auth.setSession({
            access_token: finishRes.access_token,
            refresh_token: finishRes.refresh_token,
          })

          const user = await fetchUserProfile()
          const mcpToken = await exchangeForMcpToken()
          set({ mcpToken, user, loading: false })
          connectRealtime()
        } catch (e) {
          set({ error: extractErrorMessage(e), loading: false })
          throw e
        }
      },

      exchangeMcpToken: async () => {
        const token = await exchangeForMcpToken()
        if (token) set({ mcpToken: token })
        return token
      },

      initAuthListener: () => {
        const sb = createClient()
        const { data: { subscription } } = sb.auth.onAuthStateChange(async (event) => {
          if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
            const user = await fetchUserProfile()
            const mcpToken = await exchangeForMcpToken()
            set({ user, mcpToken })
            connectRealtime()
          } else if (event === 'SIGNED_OUT') {
            disconnectRealtime()
            set({ mcpToken: null, user: null, impersonating: null })
          }
        })
        return () => subscription.unsubscribe()
      },
    }),
    {
      name: 'orchestra-auth',
      partialize: (state) => ({ mcpToken: state.mcpToken, user: state.user }),
    }
  )
)
