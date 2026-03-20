import React from 'react'
import { render, screen } from '@testing-library/react'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  usePathname: () => '/en/@testuser',
}))

// Mock next/link to render a plain <a>
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>{children}</a>
  ),
}))

// Mock theme store
jest.mock('@/store/theme', () => ({
  useThemeStore: () => ({ theme: 'dark' }),
}))

import ProfileSidebar from '../profile-sidebar'

const EXPECTED_NAV_ITEMS = [
  { label: 'Profile',      href: '/@testuser' },
  { label: 'Edit Profile', href: '/@testuser/edit' },
  { label: 'Settings',     href: '/@testuser/settings' },
  { label: 'Appearance',   href: '/@testuser/appearance' },
  { label: 'Privacy',      href: '/@testuser/privacy' },
  { label: 'Social Links', href: '/@testuser/social' },
]

describe('ProfileSidebar', () => {
  it('renders without crashing', () => {
    const { container } = render(<ProfileSidebar handle="testuser" />)
    expect(container).toBeTruthy()
  })

  it('renders all 6 navigation items', () => {
    render(<ProfileSidebar handle="testuser" />)

    for (const item of EXPECTED_NAV_ITEMS) {
      // Each label appears twice (mobile nav + desktop sidebar)
      const links = screen.getAllByText(item.label)
      expect(links.length).toBeGreaterThanOrEqual(1)
    }
  })

  it('renders correct href for each navigation link', () => {
    const { container } = render(<ProfileSidebar handle="testuser" />)

    for (const item of EXPECTED_NAV_ITEMS) {
      const links = container.querySelectorAll(`a[href="${item.href}"]`)
      // Desktop + mobile = 2 links per nav item
      expect(links.length).toBe(2)
    }
  })

  it('renders the "Account" section heading in the desktop sidebar', () => {
    render(<ProfileSidebar handle="testuser" />)
    expect(screen.getByText('Account')).toBeTruthy()
  })

  it('builds paths from the handle prop correctly', () => {
    const { container } = render(<ProfileSidebar handle="another-user" />)

    const editLink = container.querySelector('a[href="/@another-user/edit"]')
    expect(editLink).toBeTruthy()

    const settingsLink = container.querySelector('a[href="/@another-user/settings"]')
    expect(settingsLink).toBeTruthy()

    const profileLink = container.querySelector('a[href="/@another-user"]')
    expect(profileLink).toBeTruthy()
  })
})
