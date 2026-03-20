import { describe, it, expect, vi } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { Suspense } from 'react'

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

let mockPathname = '/@alice'
vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname,
}))

vi.mock('@/store/community', () => ({
  useCommunityStore: () => ({
    fetchMemberProfile: vi.fn(),
  }),
}))

vi.mock('@/components/profile/profile-sidebar', () => ({
  default: ({ handle }: { handle: string }) => <div data-testid="sidebar">{handle}</div>,
}))

import MemberProfileLayout from './layout'

function renderLayout(pathname: string, children?: React.ReactNode) {
  mockPathname = pathname
  return render(
    <Suspense fallback={<div>Loading</div>}>
      <MemberProfileLayout params={Promise.resolve({ handle: 'alice' })}>
        {children ?? <div>Content</div>}
      </MemberProfileLayout>
    </Suspense>
  )
}

describe('MemberProfileLayout', () => {
  it('renders content type tabs', async () => {
    await act(async () => {
      renderLayout('/@alice')
    })
    expect(screen.getByText('Overview')).toBeInTheDocument()
    expect(screen.getByText('APIs')).toBeInTheDocument()
    expect(screen.getByText('Docs')).toBeInTheDocument()
    expect(screen.getByText('Slides')).toBeInTheDocument()
  })

  it('links tabs to correct paths', async () => {
    await act(async () => {
      renderLayout('/@alice')
    })
    expect(screen.getByText('APIs').closest('a')).toHaveAttribute('href', '/@alice/apis')
    expect(screen.getByText('Docs').closest('a')).toHaveAttribute('href', '/@alice/docs')
    expect(screen.getByText('Slides').closest('a')).toHaveAttribute('href', '/@alice/slides')
    expect(screen.getByText('Overview').closest('a')).toHaveAttribute('href', '/@alice')
  })

  it('highlights APIs tab when on apis page', async () => {
    await act(async () => {
      renderLayout('/@alice/apis')
    })
    const apiTab = screen.getByText('APIs').closest('a')
    expect(apiTab?.style.fontWeight).toBe('600')
  })

  it('highlights Docs tab when on docs page', async () => {
    await act(async () => {
      renderLayout('/@alice/docs/some-doc')
    })
    const docsTab = screen.getByText('Docs').closest('a')
    expect(docsTab?.style.fontWeight).toBe('600')
  })

  it('highlights Overview tab when on root', async () => {
    await act(async () => {
      renderLayout('/@alice')
    })
    const overviewTab = screen.getByText('Overview').closest('a')
    expect(overviewTab?.style.fontWeight).toBe('600')
  })

  it('renders children', async () => {
    await act(async () => {
      renderLayout('/@alice', <div>Child Content</div>)
    })
    expect(screen.getByText('Child Content')).toBeInTheDocument()
  })

  it('renders sidebar with handle', async () => {
    await act(async () => {
      renderLayout('/@alice')
    })
    expect(screen.getByTestId('sidebar')).toHaveTextContent('alice')
  })
})
