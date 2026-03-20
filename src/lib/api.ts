const API_URL = process.env.NEXT_PUBLIC_API_URL || ''

function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('orchestra_token')
}

export function isDevSeed(): boolean {
  return getToken() === 'dev_seed_token'
}

/** Resolve an upload path (e.g. /uploads/avatars/1.jpg) to a full URL on the API domain. */
export function uploadUrl(path: string | null | undefined): string {
  if (!path) return ''
  if (path.startsWith('http')) return path
  return `${API_URL}${path}`
}

export async function apiFetch<T>(
  path: string,
  init?: RequestInit & { skipAuth?: boolean }
): Promise<T> {
  const { skipAuth, ...fetchInit } = init ?? {}

  const headers: Record<string, string> = {
    ...(fetchInit.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
    ...(fetchInit.headers as Record<string, string>),
  }

  if (!skipAuth) {
    const token = getToken()
    if (token) headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...fetchInit,
    headers,
  })

  if (!res.ok) {
    let message = `HTTP ${res.status}`
    try {
      const text = await res.text()
      try {
        const err = JSON.parse(text)
        message = err.message || err.error || message
        // Handle double-encoded JSON (error field is a JSON string)
        if (message.startsWith('{')) {
          try {
            const inner = JSON.parse(message)
            message = inner.message || inner.error || message
          } catch {}
        }
      } catch {
        // Response body is plain text
        if (text) message = text
      }
    } catch {}
    throw new Error(message)
  }

  return res.json() as Promise<T>
}

export function teamApiFetch<T>(
  teamId: string,
  path: string,
  init?: RequestInit & { skipAuth?: boolean }
): Promise<T> {
  return apiFetch<T>(`/api/teams/${teamId}${path}`, init)
}

// ── Standardized resource helpers ──────────────────────
// Backward-compatible: handles both new { data, meta } envelope
// and old { projects: [...] } / { project: {...} } formats.

import type { ApiMeta } from '@/types/api'

/** Fetch a single resource. Returns the unwrapped item. */
export async function apiResource<T>(
  path: string,
  init?: RequestInit & { skipAuth?: boolean }
): Promise<T> {
  const res = await apiFetch<any>(path, init)
  // New envelope: { data: {...} }
  if (res.data && typeof res.data === 'object' && !Array.isArray(res.data)) return res.data
  // Old format: { project: {...} } — find first non-meta object value
  if (typeof res === 'object' && res !== null) {
    for (const [key, val] of Object.entries(res)) {
      if (key !== 'meta' && typeof val === 'object' && val !== null && !Array.isArray(val)) return val as T
    }
  }
  return res as T
}

/** Fetch a collection. Returns { items, meta }. */
export async function apiList<T>(
  path: string,
  init?: RequestInit & { skipAuth?: boolean }
): Promise<{ items: T[]; meta: ApiMeta }> {
  const res = await apiFetch<any>(path, init)
  const fallbackMeta = (arr: T[]): ApiMeta => ({ total: arr.length, limit: arr.length, offset: 0 })
  // New envelope: { data: [...], meta: {...} }
  if (res.data && Array.isArray(res.data)) {
    return { items: res.data, meta: res.meta ?? fallbackMeta(res.data) }
  }
  // Old format: { projects: [...] } or { notes: [...] }
  if (typeof res === 'object' && res !== null && !Array.isArray(res)) {
    for (const val of Object.values(res)) {
      if (Array.isArray(val)) {
        return { items: val as T[], meta: fallbackMeta(val as T[]) }
      }
    }
  }
  // Raw array
  if (Array.isArray(res)) {
    return { items: res as T[], meta: fallbackMeta(res as T[]) }
  }
  return { items: [], meta: { total: 0, limit: 0, offset: 0 } }
}
