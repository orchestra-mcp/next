import React from 'react'
import { render, screen } from '@testing-library/react'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace: jest.fn(), push: jest.fn() }),
}))

// Mock next/image to render a plain <img>
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} />,
}))

// Mock next/link to render a plain <a>
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, ...props }: any) => <a {...props}>{children}</a>,
}))

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

// Mock auth store (zustand)
jest.mock('@/store/auth', () => ({
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
    },
  ),
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

// Mock api fetch
jest.mock('@/lib/api', () => ({
  apiFetch: jest.fn().mockResolvedValue({ value: {} }),
}))

import LoginPage from '../page'

describe('LoginPage logo branding', () => {
  it('renders inline logo in the heading', () => {
    const { container } = render(<LoginPage />)
    const h1 = container.querySelector('h1')
    expect(h1).toBeTruthy()
    const inlineLogo = h1?.querySelector('img[width="28"]')
    expect(inlineLogo).toBeTruthy()
  })

  it('renders main logo above heading', () => {
    const { container } = render(<LoginPage />)
    const logos = container.querySelectorAll('img[src="/logo.svg"]')
    // Should have at least 2: main logo (52x52) + inline logo (28x28)
    expect(logos.length).toBeGreaterThanOrEqual(2)
  })

  it('renders the h1 with the sign-in translation key', () => {
    const { container } = render(<LoginPage />)
    const h1 = container.querySelector('h1')
    expect(h1).toBeTruthy()
    // next-intl mock returns the key itself
    expect(h1?.textContent).toContain('auth.signInToOrchestra')
  })

  it('renders the main logo at 52x52', () => {
    const { container } = render(<LoginPage />)
    const mainLogo = container.querySelector('img[width="52"][height="52"]')
    expect(mainLogo).toBeTruthy()
  })
})
