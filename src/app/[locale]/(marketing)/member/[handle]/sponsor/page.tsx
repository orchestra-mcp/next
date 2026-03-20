'use client'
import { use, useState, useEffect } from 'react'
import { useCommunityStore } from '@/store/community'
import { useProfileTheme } from '@/components/profile/use-profile-theme'
import ProfileSection from '@/components/profile/profile-section'
import ProfileCard from '@/components/profile/profile-card'
import ReactMarkdownBase from 'react-markdown'

// Workaround: react-markdown exports React 19 types in a React 18 project
const ReactMarkdown = ReactMarkdownBase as unknown as React.FC<{
  children: string
  components?: Record<string, React.FC<{ children?: React.ReactNode; href?: string }>>
}>

interface PageProps {
  params: Promise<{ handle: string }>
}

export default function SponsorPage(props: PageProps) {
  const params = use(props.params)
  const handle = params.handle

  const { colors } = useProfileTheme()
  const { profile } = useCommunityStore()

  const [sponsorContent, setSponsorContent] = useState<{
    title: string
    content: string
    description: string
  } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchSponsor() {
      try {
        const base = typeof window !== 'undefined'
          ? (localStorage.getItem('api_base_url') || '')
          : ''
        const res = await fetch(`${base}/api/public/community/shares/${handle}?entity_type=sponsor`)
        if (res.ok) {
          const data = await res.json()
          if (data.shares?.length > 0) {
            setSponsorContent(data.shares[0])
          }
        }
      } catch { /* ignore */ }
      setLoading(false)
    }
    fetchSponsor()
  }, [handle])

  type MdProps = { children?: React.ReactNode; href?: string }

  const mdComponents: Record<string, React.FC<MdProps>> = {
    h1: ({ children }: MdProps) => (
      <h1 className="text-2xl font-bold mt-6 mb-2" style={{ color: colors.textPrimary }}>
        {children}
      </h1>
    ),
    h2: ({ children }: MdProps) => (
      <h2 className="text-xl font-bold mt-6 mb-2" style={{ color: colors.textPrimary }}>
        {children}
      </h2>
    ),
    h3: ({ children }: MdProps) => (
      <h3 className="text-lg font-bold mt-6 mb-2" style={{ color: colors.textPrimary }}>
        {children}
      </h3>
    ),
    p: ({ children }: MdProps) => (
      <p className="mb-3 leading-relaxed" style={{ color: colors.textSecondary }}>
        {children}
      </p>
    ),
    a: ({ href, children }: MdProps) => (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="underline underline-offset-2 transition-opacity hover:opacity-80"
        style={{ color: colors.accent }}
      >
        {children}
      </a>
    ),
    strong: ({ children }: MdProps) => (
      <strong className="font-semibold" style={{ color: colors.textPrimary }}>
        {children}
      </strong>
    ),
    ul: ({ children }: MdProps) => (
      <ul className="list-disc pl-5 mb-3 space-y-1" style={{ color: colors.textSecondary }}>
        {children}
      </ul>
    ),
    ol: ({ children }: MdProps) => (
      <ol className="list-decimal pl-5 mb-3 space-y-1" style={{ color: colors.textSecondary }}>
        {children}
      </ol>
    ),
    blockquote: ({ children }: MdProps) => (
      <blockquote
        className="border-l-2 pl-4 my-3 italic"
        style={{ borderColor: colors.accent, color: colors.textMuted }}
      >
        {children}
      </blockquote>
    ),
  }

  if (loading) {
    return (
      <div className="px-8 py-16 text-center text-sm" style={{ color: colors.textMuted }}>
        Loading...
      </div>
    )
  }

  if (!sponsorContent) {
    return (
      <ProfileSection title="Sponsor" icon="bx-heart">
        <ProfileCard variant="default" className="px-8 py-12 text-center mt-6">
          <i
            className="bx bx-heart block mb-4 text-5xl"
            style={{ color: colors.textMuted }}
          />
          <h2
            className="text-lg font-semibold mb-2"
            style={{ color: colors.textPrimary }}
          >
            No sponsor page yet
          </h2>
          <p
            className="text-sm max-w-[400px] mx-auto"
            style={{ color: colors.textMuted }}
          >
            {profile?.name || handle} hasn&apos;t set up a sponsor page yet.
          </p>
        </ProfileCard>
      </ProfileSection>
    )
  }

  return (
    <ProfileSection
      title={sponsorContent.title || `Sponsor ${profile?.name || handle}`}
      description={sponsorContent.description || undefined}
      icon="bx-heart"
    >
      <ProfileCard variant="default" className="p-8">
        <div className="text-[15px] leading-[1.8] whitespace-pre-wrap">
          <ReactMarkdown components={mdComponents}>
            {sponsorContent.content}
          </ReactMarkdown>
        </div>
      </ProfileCard>
    </ProfileSection>
  )
}
