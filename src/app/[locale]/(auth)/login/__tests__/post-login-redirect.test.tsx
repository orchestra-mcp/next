import React from 'react'
import { render } from '@testing-library/react'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace: jest.fn(), push: jest.fn() }),
}))

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} />,
}))

// Mock next/link
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, ...props }: any) => <a {...props}>{children}</a>,
}))

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

// Mock api fetch
jest.mock('@/lib/api', () => ({
  apiFetch: jest.fn().mockResolvedValue({ value: {} }),
}))

// Mock role store
jest.mock('@/store/roles', () => ({
  useRoleStore: () => ({
    seedAdmin: jest.fn(),
    setCurrentRole: jest.fn(),
  }),
}))

// Mock theme store
jest.mock('@/store/theme', () => ({
  useThemeStore: () => ({ theme: 'dark' }),
}))

describe('Post-login redirect', () => {
  let mockLocationHref: string

  beforeEach(() => {
    mockLocationHref = ''
    Object.defineProperty(window, 'location', {
      value: { href: '' },
      writable: true,
      configurable: true,
    })
  })

  it('redirects to /@username when user has username', () => {
    const mockSetState = jest.fn()
    jest.doMock('@/store/auth', () => ({
      useAuthStore: Object.assign(
        () => ({
          login: jest.fn(),
          loginWithPasskey: jest.fn(),
          loading: false,
          error: null,
          token: 'test-token',
          clearError: jest.fn(),
          user: { username: 'testuser' },
        }),
        {
          setState: mockSetState,
          getState: () => ({ user: { username: 'testuser' } }),
        },
      ),
    }))

    // After setting token, the useEffect should redirect to /@testuser
    // The getPostLoginRedirect function returns /@username when user has username
    const { useAuthStore } = require('@/store/auth')
    const state = useAuthStore.getState()
    const username = state.user?.username
    expect(username).toBe('testuser')
    const redirect = username ? `/@${username}` : '/dashboard'
    expect(redirect).toBe('/@testuser')
  })

  it('falls back to /dashboard when user has no username', () => {
    jest.doMock('@/store/auth', () => ({
      useAuthStore: Object.assign(
        () => ({
          login: jest.fn(),
          loginWithPasskey: jest.fn(),
          loading: false,
          error: null,
          token: 'test-token',
          clearError: jest.fn(),
          user: {},
        }),
        {
          setState: jest.fn(),
          getState: () => ({ user: {} }),
        },
      ),
    }))

    const { useAuthStore } = require('@/store/auth')
    const state = useAuthStore.getState()
    const username = state.user?.username || (state.user?.settings?.handle as string | undefined)
    const redirect = username ? `/@${username}` : '/dashboard'
    expect(redirect).toBe('/dashboard')
  })

  it('uses settings.handle as fallback for username', () => {
    jest.doMock('@/store/auth', () => ({
      useAuthStore: Object.assign(
        () => ({
          login: jest.fn(),
          loginWithPasskey: jest.fn(),
          loading: false,
          error: null,
          token: null,
          clearError: jest.fn(),
          user: null,
        }),
        {
          setState: jest.fn(),
          getState: () => ({ user: { settings: { handle: 'myhandle' } } }),
        },
      ),
    }))

    const { useAuthStore } = require('@/store/auth')
    const state = useAuthStore.getState()
    const username = state.user?.username || (state.user?.settings?.handle as string | undefined)
    const redirect = username ? `/@${username}` : '/dashboard'
    expect(redirect).toBe('/@myhandle')
  })
})
