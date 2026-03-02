import Image from 'next/image'
import Link from 'next/link'

async function getComingSoonSettings() {
  try {
    const apiBase = process.env.INTERNAL_API_URL || 'http://localhost:8080'
    const res = await fetch(`${apiBase}/api/settings/coming_soon`, {
      next: { revalidate: 30 },
    })
    if (res.ok) {
      const data = await res.json()
      return data?.value ?? {}
    }
  } catch {}
  return {}
}

export default async function ComingSoonPage() {
  const settings = await getComingSoonSettings()
  const title = settings.title || 'Coming Soon'
  const message = settings.message || "We're putting the finishing touches on something amazing. Stay tuned!"

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#080810',
      fontFamily: 'inherit',
      padding: '40px 20px',
    }}>
      {/* Background glow */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(169,0,255,0.08) 0%, transparent 70%)',
      }} />

      <div style={{ maxWidth: 480, width: '100%', textAlign: 'center', position: 'relative' }}>
        {/* Logo */}
        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 40 }}>
          <Image src="/logo.svg" alt="Orchestra" width={56} height={56} />
        </div>

        {/* Badge */}
        <div style={{ marginBottom: 24 }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '5px 14px', borderRadius: 100,
            border: '1px solid rgba(169,0,255,0.25)',
            background: 'rgba(169,0,255,0.08)',
            fontSize: 11, fontWeight: 600, color: 'rgba(169,0,255,0.9)',
            letterSpacing: '0.07em', textTransform: 'uppercase',
          }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#a900ff', display: 'inline-block' }} />
            In Development
          </span>
        </div>

        {/* Title */}
        <h1 style={{
          fontSize: 52, fontWeight: 800, color: '#f8f8f8',
          margin: '0 0 16px', letterSpacing: '-0.04em', lineHeight: 1.1,
        }}>
          {title}
        </h1>

        {/* Message */}
        <p style={{
          fontSize: 16, color: 'rgba(255,255,255,0.45)',
          lineHeight: 1.7, margin: '0 0 40px',
        }}>
          {message}
        </p>

        {/* Divider */}
        <div style={{
          height: 1, background: 'rgba(255,255,255,0.06)',
          margin: '0 0 32px',
        }} />

        {/* Login link for admins */}
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', margin: 0 }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: '#00e5ff', textDecoration: 'none', fontWeight: 500 }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
