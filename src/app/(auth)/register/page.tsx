'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useAuthStore } from '@/store/auth'
import { useThemeStore } from '@/store/theme'

export default function RegisterPage() {
  const router = useRouter()
  const { register, loading, error, token, clearError } = useAuthStore()
  const { theme } = useThemeStore()
  const isDark = theme === 'dark'
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // If already logged in (returning user), go to dashboard
  useEffect(() => {
    if (token && typeof window !== 'undefined') {
      const isNew = localStorage.getItem('orchestra_is_new_user')
      const done = localStorage.getItem('orchestra_onboarding_done')
      if (isNew === '1' && !done) {
        router.replace('/onboarding')
      } else {
        router.replace('/dashboard')
      }
    }
  }, [token, router])

  const textPrimary = isDark ? '#f8f8f8' : '#0f0f12'
  const textMuted = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.45)'
  const cardBg = isDark ? 'rgba(255,255,255,0.03)' : '#ffffff'
  const cardBorder = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)'
  const cardShadow = isDark ? '0 0 60px rgba(0,229,255,0.06)' : '0 8px 32px rgba(0,0,0,0.06)'
  const inputBg = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'
  const inputBorder = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.12)'
  const inputColor = isDark ? '#f8f8f8' : '#0f0f12'
  const labelColor = isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'
  const socialBtnBg = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'
  const socialBtnBorder = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
  const dividerBg = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'
  const dividerText = isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'
  const termsColor = isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.3)'
  const footerText = isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.4)'
  const loadingBg = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'
  const loadingColor = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)'

  const inputSt: React.CSSProperties = {
    width: '100%', padding: '11px 14px', borderRadius: 10,
    border: `1px solid ${inputBorder}`, background: inputBg,
    color: inputColor, fontSize: 14, outline: 'none', boxSizing: 'border-box',
    fontFamily: 'inherit',
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await register(name, email, password)
      router.push('/onboarding')
    } catch {}
  }

  return (
    <div style={{ maxWidth: 420, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
          <Image src="/logo.svg" alt="Orchestra" width={52} height={52} />
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: textPrimary, margin: 0, letterSpacing: '-0.02em' }}>Create your account</h1>
        <p style={{ fontSize: 14, color: textMuted, marginTop: 8 }}>Start building AI-native applications for free.</p>
      </div>

      <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 20, padding: '32px 28px', backdropFilter: 'blur(16px)', boxShadow: cardShadow }}>
        {/* Social buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 24 }}>
          {[{ icon: 'bxl-google', label: 'Google' }, { icon: 'bxl-github', label: 'GitHub' }].map(s => (
            <button key={s.label} type="button" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '10px', borderRadius: 10, border: `1px solid ${socialBtnBorder}`, background: socialBtnBg, color: textPrimary, fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>
              <i className={`bx ${s.icon}`} style={{ fontSize: 16 }} /> {s.label}
            </button>
          ))}
        </div>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <div style={{ flex: 1, height: 1, background: dividerBg }} />
          <span style={{ fontSize: 12, color: dividerText }}>or continue with email</span>
          <div style={{ flex: 1, height: 1, background: dividerBg }} />
        </div>

        {error && (
          <div style={{ marginBottom: 20, padding: '10px 14px', borderRadius: 8, fontSize: 13, background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 13, fontWeight: 500, color: labelColor }}>Full name</label>
            <input type="text" required value={name} onChange={e => { setName(e.target.value); clearError() }} placeholder="Your name" style={inputSt} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 13, fontWeight: 500, color: labelColor }}>Email address</label>
            <input type="email" required value={email} onChange={e => { setEmail(e.target.value); clearError() }} placeholder="you@example.com" style={inputSt} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 13, fontWeight: 500, color: labelColor }}>Password</label>
            <input type="password" required value={password} onChange={e => { setPassword(e.target.value); clearError() }} placeholder="Min 8 characters" style={inputSt} />
          </div>
          <p style={{ fontSize: 12, color: termsColor, margin: 0 }}>
            By creating an account you agree to our{' '}
            <Link href="/terms" style={{ color: '#00e5ff', textDecoration: 'none' }}>Terms</Link> and{' '}
            <Link href="/privacy" style={{ color: '#00e5ff', textDecoration: 'none' }}>Privacy Policy</Link>.
          </p>
          <button
            type="submit" disabled={loading}
            style={{ padding: '13px', borderRadius: 10, border: 'none', fontSize: 15, fontWeight: 600, color: loading ? loadingColor : '#fff', background: loading ? loadingBg : 'linear-gradient(135deg, #00e5ff, #a900ff)', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>
      </div>

      <p style={{ textAlign: 'center', fontSize: 13, color: footerText, marginTop: 24 }}>
        Already have an account?{' '}
        <Link href="/login" style={{ color: '#00e5ff', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
      </p>
    </div>
  )
}
