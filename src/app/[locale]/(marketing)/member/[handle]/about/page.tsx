'use client'
import { use } from 'react'
import { useCommunityStore } from '@/store/community'
import { useProfileTheme } from '@/components/profile/use-profile-theme'
import ProfileSection from '@/components/profile/profile-section'
import ProfileCard from '@/components/profile/profile-card'
import ReactMarkdownBase from 'react-markdown'

// react-markdown exports React 19 types — cast for React 18 compat
const ReactMarkdown = ReactMarkdownBase as unknown as React.FC<{
  children: string
  components?: Record<string, React.FC<{ children?: React.ReactNode; href?: string }>>
}>

interface PageProps {
  params: Promise<{ handle: string }>
}

export default function AboutPage(props: PageProps) {
  const params = use(props.params)
  const handle = params.handle

  const { colors } = useProfileTheme()
  const { profile } = useCommunityStore()

  type MdProps = { children?: React.ReactNode; href?: string }

  const mdComponents: Record<string, React.FC<MdProps>> = {
    h1: ({ children }: MdProps) => (
      <h1 style={{ fontSize: 22, fontWeight: 800, color: colors.textPrimary, margin: '0 0 14px', letterSpacing: '-0.03em' }}>{children}</h1>
    ),
    h2: ({ children }: MdProps) => (
      <h2 style={{ fontSize: 17, fontWeight: 700, color: colors.textPrimary, margin: '20px 0 8px' }}>{children}</h2>
    ),
    h3: ({ children }: MdProps) => (
      <h3 style={{ fontSize: 14, fontWeight: 700, color: colors.textPrimary, margin: '16px 0 6px' }}>{children}</h3>
    ),
    p: ({ children }: MdProps) => (
      <p style={{ fontSize: 15, lineHeight: 1.8, color: colors.textSecondary, margin: '0 0 14px' }}>{children}</p>
    ),
    a: ({ href, children }: MdProps) => (
      <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: colors.accent, textDecoration: 'none' }}
        onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.textDecoration = 'underline' }}
        onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.textDecoration = 'none' }}
      >{children}</a>
    ),
    strong: ({ children }: MdProps) => (
      <strong style={{ color: colors.textPrimary, fontWeight: 700 }}>{children}</strong>
    ),
    ul: ({ children }: MdProps) => (
      <ul style={{ paddingLeft: 20, margin: '0 0 14px', color: colors.textSecondary, fontSize: 15, lineHeight: 1.8 }}>{children}</ul>
    ),
    ol: ({ children }: MdProps) => (
      <ol style={{ paddingLeft: 20, margin: '0 0 14px', color: colors.textSecondary, fontSize: 15, lineHeight: 1.8 }}>{children}</ol>
    ),
    blockquote: ({ children }: MdProps) => (
      <blockquote style={{
        borderLeft: `3px solid ${colors.accent}`, paddingLeft: 16, margin: '0 0 14px',
        color: colors.textMuted, fontStyle: 'italic',
      }}>{children}</blockquote>
    ),
    code: ({ children }: MdProps) => (
      <code style={{
        fontSize: 13, padding: '1px 6px', borderRadius: 4,
        background: 'rgba(255,255,255,0.07)', color: '#a78bfa', fontFamily: 'monospace',
      }}>{children}</code>
    ),
    hr: () => (
      <hr style={{ border: 'none', borderTop: '1px solid var(--color-border, rgba(255,255,255,0.06))', margin: '20px 0' }} />
    ),
  }

  if (!profile?.about) {
    return (
      <ProfileSection title="About" icon="bx-user">
        <ProfileCard variant="default" className="px-8 py-12 text-center mt-6">
          <i className="bx bx-user block mb-4 text-5xl" style={{ color: colors.textMuted }} />
          <h2 style={{ fontSize: 17, fontWeight: 600, color: colors.textPrimary, marginBottom: 8 }}>No about page yet</h2>
          <p style={{ fontSize: 14, color: colors.textMuted }}>
            {profile?.name || handle} hasn&apos;t written an about page yet.
          </p>
        </ProfileCard>
      </ProfileSection>
    )
  }

  return (
    <ProfileSection title="About" icon="bx-user">
      <ProfileCard variant="default" className="p-8">
        <ReactMarkdown components={mdComponents}>
          {profile.about}
        </ReactMarkdown>
      </ProfileCard>
    </ProfileSection>
  )
}
