import { useProfileTheme } from './use-profile-theme'

interface ProfileSectionProps {
  title: string
  description?: string
  icon?: string
  children: React.ReactNode
}

export default function ProfileSection({
  title,
  description,
  icon,
  children,
}: ProfileSectionProps) {
  const { colors } = useProfileTheme()

  return (
    <div className="px-4 py-10 sm:px-8 fade-up">
      <div className="mb-8">
        <h1
          className="text-2xl font-bold tracking-tight mb-2"
          style={{ color: colors.textPrimary, letterSpacing: '-0.02em' }}
        >
          {icon && (
            <i
              className={`bx ${icon} mr-2 align-middle`}
              style={{ fontSize: 22, color: colors.accent, verticalAlign: '-2px' }}
            />
          )}
          {title}
        </h1>
        {description && (
          <p className="text-sm" style={{ color: colors.textMuted }}>
            {description}
          </p>
        )}
      </div>
      {children}
    </div>
  )
}
