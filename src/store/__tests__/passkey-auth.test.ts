import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock zustand/middleware to bypass localStorage/persist
vi.mock('zustand/middleware', () => ({
  persist: (config: any) => config,
}))

const mockedApiFetch = vi.fn()
vi.mock('@/lib/api', () => ({
  apiFetch: (...args: any[]) => mockedApiFetch(...args),
}))

vi.mock('@/lib/supabase/realtime', () => ({
  connectRealtime: vi.fn(),
  disconnectRealtime: vi.fn(),
}))

let useAuthStore: any

beforeEach(async () => {
  vi.resetModules()
  vi.clearAllMocks()

  vi.doMock('zustand/middleware', () => ({
    persist: (config: any) => config,
  }))
  vi.doMock('@/lib/api', () => ({
    apiFetch: (...args: any[]) => mockedApiFetch(...args),
  }))
  vi.doMock('@/lib/supabase/realtime', () => ({
    connectRealtime: vi.fn(),
    disconnectRealtime: vi.fn(),
  }))

  const mod = await import('../auth')
  useAuthStore = mod.useAuthStore
})

describe('beginPasskeyRegistration', () => {
  it('unwraps publicKey from API response and converts base64url fields', async () => {
    const mockChallenge = 'dGVzdC1jaGFsbGVuZ2U' // base64url
    const mockUserId = 'dGVzdC11c2Vy' // base64url

    mockedApiFetch.mockResolvedValueOnce({
      publicKey: {
        rp: { id: 'localhost', name: 'Orchestra' },
        user: { id: mockUserId, name: 'test@test.com', displayName: 'Test' },
        challenge: mockChallenge,
        pubKeyCredParams: [{ type: 'public-key', alg: -7 }],
        timeout: 60000,
        excludeCredentials: [
          { type: 'public-key', id: 'Y3JlZC0x' },
        ],
      },
    })

    const opts = await useAuthStore.getState().beginPasskeyRegistration()

    // challenge should be converted to ArrayBuffer
    expect(opts.challenge).toBeInstanceOf(ArrayBuffer)
    // user.id should be converted to ArrayBuffer
    expect(opts.user.id).toBeInstanceOf(ArrayBuffer)
    // excludeCredentials[0].id should be converted to ArrayBuffer
    expect(opts.excludeCredentials[0].id).toBeInstanceOf(ArrayBuffer)
  })
})

describe('finishPasskeyRegistration', () => {
  it('sends camelCase field names in JSON body', async () => {
    mockedApiFetch.mockResolvedValueOnce({ ok: true })

    const mockCred = {
      id: 'credential-id',
      rawId: new ArrayBuffer(8),
      type: 'public-key',
      response: {
        attestationObject: new ArrayBuffer(16),
        clientDataJSON: new ArrayBuffer(32),
        getTransports: () => ['internal'],
      },
    }

    await useAuthStore.getState().finishPasskeyRegistration(mockCred, 'My Key')

    expect(mockedApiFetch).toHaveBeenCalledTimes(1)
    const callBody = JSON.parse(mockedApiFetch.mock.calls[0][1].body)

    // Must be camelCase (not snake_case)
    expect(callBody).toHaveProperty('rawId')
    expect(callBody).not.toHaveProperty('raw_id')
    expect(callBody.response).toHaveProperty('attestationObject')
    expect(callBody.response).not.toHaveProperty('attestation_object')
    expect(callBody.response).toHaveProperty('clientDataJSON')
    expect(callBody.response).not.toHaveProperty('client_data_json')
  })
})

describe('loginWithPasskey', () => {
  it('sends camelCase field names in authenticate/finish body', async () => {
    // Mock begin response with publicKey wrapper
    mockedApiFetch.mockResolvedValueOnce({
      publicKey: {
        challenge: 'dGVzdA',
        rpId: 'localhost',
        timeout: 60000,
        userVerification: 'preferred',
        allowCredentials: [],
      },
      session_id: 'test-session-123',
    })

    // Mock navigator.credentials.get
    const mockAssertion = {
      id: 'cred-id',
      rawId: new ArrayBuffer(8),
      type: 'public-key',
      response: {
        authenticatorData: new ArrayBuffer(37),
        clientDataJSON: new ArrayBuffer(32),
        signature: new ArrayBuffer(64),
        userHandle: new ArrayBuffer(16),
      },
    }
    vi.stubGlobal('navigator', {
      credentials: { get: vi.fn().mockResolvedValue(mockAssertion) },
    })

    // Mock finish response
    mockedApiFetch.mockResolvedValueOnce({
      token: 'jwt-token',
      user: { id: 1, name: 'Test', email: 'test@test.com' },
    })

    // Mock localStorage & document.cookie
    const store: Record<string, string> = {}
    vi.stubGlobal('localStorage', {
      getItem: (k: string) => store[k] ?? null,
      setItem: (k: string, v: string) => { store[k] = v },
      removeItem: (k: string) => { delete store[k] },
    })
    const mockDoc = { cookie: '' }
    vi.stubGlobal('document', mockDoc)

    await useAuthStore.getState().loginWithPasskey()

    // Verify finish call (2nd apiFetch call)
    expect(mockedApiFetch).toHaveBeenCalledTimes(2)
    const finishBody = JSON.parse(mockedApiFetch.mock.calls[1][1].body)

    // Must be camelCase
    expect(finishBody).toHaveProperty('rawId')
    expect(finishBody).not.toHaveProperty('raw_id')
    expect(finishBody).toHaveProperty('session_id', 'test-session-123')
    expect(finishBody.response).toHaveProperty('authenticatorData')
    expect(finishBody.response).not.toHaveProperty('authenticator_data')
    expect(finishBody.response).toHaveProperty('clientDataJSON')
    expect(finishBody.response).not.toHaveProperty('client_data_json')
    expect(finishBody.response).toHaveProperty('userHandle')
    expect(finishBody.response).not.toHaveProperty('user_handle')

    // MCP token stored
    expect(store['mcpToken']).toBe('jwt-token')
  })
})
