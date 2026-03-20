import { useProfileTheme } from './use-profile-theme'

type CardVariant = 'default' | 'glass' | 'elevated' | 'inset'

interface ProfileCardProps {
  variant?: CardVariant
  className?: string
  children: React.ReactNode
  glow?: boolean
  style?: React.CSSProperties
}

export default function ProfileCard({
  variant = 'default',
  className = '',
  children,
  glow = false,
  style,
}: ProfileCardProps) {
  const { colors } = useProfileTheme()

  const base = 'rounded-[14px] border transition-colors'
  const glowClass = glow ? 'profile-card-glow' : ''

  const variants: Record<CardVariant, string> = {
    default: '',
    glass: 'backdrop-blur-xl',
    elevated: '',
    inset: '',
  }

  const variantStyles: Record<CardVariant, React.CSSProperties> = {
    default: {
      background: colors.cardBg,
      borderColor: colors.cardBorder,
    },
    glass: {
      background: 'var(--color-bg-alt, rgba(255,255,255,0.03))',
      borderColor: 'var(--color-border, rgba(255,255,255,0.06))',
      WebkitBackdropFilter: 'blur(24px)',
      backdropFilter: 'blur(24px)',
    },
    elevated: {
      background: 'var(--color-bg-alt, rgba(255,255,255,0.05))',
      borderColor: colors.cardBorder,
      boxShadow: 'var(--color-shadow-md, 0 8px 32px rgba(0,0,0,0.4))',
    },
    inset: {
      background: 'var(--color-bg-contrast, rgba(0,0,0,0.2))',
      borderColor: 'var(--color-border, rgba(255,255,255,0.04))',
    },
  }

  return (
    <div
      className={`${base} ${variants[variant]} ${glowClass} ${className}`.trim()}
      style={{ ...variantStyles[variant], ...style }}
    >
      {children}
    </div>
  )
}
