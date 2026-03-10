const API_URL = process.env.NEXT_PUBLIC_API_URL || ''

function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('orchestra_token')
}

export function isDevSeed(): boolean {
  return getToken() === 'dev_seed_token'
}

export async function apiFetch<T>(
  path: string,
  init?: RequestInit & { skipAuth?: boolean }
): Promise<T> {
  const { skipAuth, ...fetchInit } = init ?? {}

  // Dev seed mode: skip all authenticated API calls — backend would reject them
  if (!skipAuth && isDevSeed()) {
    throw Object.assign(new Error('DEV_SEED_MODE'), { devSeed: true })
  }

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
      const err = await res.json()
      message = err.error || err.message || message
    } catch {}
    throw new Error(message)
  }

  return res.json() as Promise<T>
}
