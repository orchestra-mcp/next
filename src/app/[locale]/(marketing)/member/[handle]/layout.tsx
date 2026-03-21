'use client'

import { use, useEffect } from 'react'
import { useCommunityStore } from '@/store/community'
import ProfileSidebar from '@/components/profile/profile-sidebar'

interface LayoutProps {
  children: React.ReactNode
  params: Promise<{ handle: string }>
}

export default function MemberProfileLayout({ children, params }: LayoutProps) {
  const { handle } = use(params)
  const { fetchMemberProfile } = useCommunityStore()

  useEffect(() => {
    fetchMemberProfile(handle)
  }, [handle, fetchMemberProfile])

  return (
    <div className="mx-auto max-w-[1280px] px-4 sm:px-6 pb-16">
      <div className="profile-columns">
        <aside className="profile-sidebar-col">
          <ProfileSidebar handle={handle} />
        </aside>
        <main className="profile-main-col">
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
