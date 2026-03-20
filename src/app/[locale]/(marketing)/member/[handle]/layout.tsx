'use client'

import { use, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useCommunityStore } from '@/store/community'
import ProfileSidebar from '@/components/profile/profile-sidebar'

const CONTENT_TABS = [
  { key: '', label: 'Overview', icon: 'bx-user' },
  { key: 'apis', label: 'APIs', icon: 'bx-collection' },
  { key: 'docs', label: 'Docs', icon: 'bx-file' },
  { key: 'slides', label: 'Slides', icon: 'bx-slideshow' },
]

interface LayoutProps {
  children: React.ReactNode
  params: Promise<{ handle: string }>
}

export default function MemberProfileLayout({ children, params }: LayoutProps) {
  const { handle } = use(params)
  const { fetchMemberProfile } = useCommunityStore()
  const pathname = usePathname()

  useEffect(() => {
    fetchMemberProfile(handle)
  }, [handle, fetchMemberProfile])

  // Determine active tab from pathname
  const pathAfterHandle = pathname.split(`/@${handle}/`)[1] || ''
  const activeTab = CONTENT_TABS.find(
    (t) => t.key && pathAfterHandle.startsWith(t.key)
  )?.key ?? ''

  return (
    <div className="mx-auto max-w-[1280px] px-4 sm:px-6 pb-16">
      {/* Two-column layout: sidebar card + content */}
      <div className="profile-columns">
        <aside className="profile-sidebar-col">
          <ProfileSidebar handle={handle} />
        </aside>
        <main className="profile-main-col">
          {/* Content type tabs */}
          <nav style={tabNavStyle} aria-label="Content type">
            {CONTENT_TABS.map((tab) => {
              const isActive = tab.key === activeTab
              const href = tab.key ? `/@${handle}/${tab.key}` : `/@${handle}`
              return (
                <Link
                  key={tab.key}
                  href={href}
                  style={{
                    ...tabStyle,
                    color: isActive ? 'var(--color-fg)' : 'var(--color-fg-dim)',
                    borderBottomColor: isActive ? '#00e5ff' : 'transparent',
                    fontWeight: isActive ? 600 : 400,
                  }}
                >
                  <i className={`bx ${tab.icon}`} style={{ fontSize: 15 }} />
                  {tab.label}
                </Link>
              )
            })}
          </nav>
          {children}
        </main>
      </div>

      <style>{`
        .profile-columns {
          display: flex;
          gap: 24px;
          align-items: flex-start;
          padding-top: 24px;
        }
        .profile-sidebar-col {
          width: 296px;
          flex-shrink: 0;
          position: sticky;
          top: 80px;
        }
        .profile-main-col {
          flex: 1;
          min-width: 0;
          padding-top: 0;
        }
        @media (max-width: 768px) {
          .profile-columns {
            flex-direction: column;
            gap: 16px;
            padding-top: 16px;
          }
          .profile-sidebar-col {
            width: 100%;
            position: static;
          }
        }
      `}</style>
    </div>
  )
}

const tabNavStyle: React.CSSProperties = {
  display: 'flex',
  gap: 0,
  borderBottom: '1px solid var(--color-border)',
  marginBottom: 20,
  overflowX: 'auto',
}

const tabStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '10px 16px',
  fontSize: 13,
  textDecoration: 'none',
  borderBottom: '2px solid',
  transition: 'color 0.15s ease',
  whiteSpace: 'nowrap',
}
