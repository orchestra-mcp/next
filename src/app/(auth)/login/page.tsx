'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useAuthStore } from '@/store/auth'
import { useRoleStore } from '@/store/roles'
import { useThemeStore } from '@/store/theme'

// Dev seed credentials (shown in UI for easy access)
const DEV_SEEDS = [
  { label: 'Admin', email: 'admin@orchestra.dev', role: 'admin' as const, color: '#ef4444' },
  { label: 'Team Owner', email: 'owner@orchestra.dev', role: 'team_owner' as const, color: '#a900ff' },
  { label: 'Manager', email: 'manager@orchestra.dev', role: 'team_manager' as const, color: '#00e5ff' },
  { label: 'User', email: 'bob@orchestra.dev', role: 'user' as const, color: 'rgba(128,128,128,0.8)' },
]

export default function LoginPage() {
  const router = useRouter()
  const { login, loading, error, token, clearError, user } = useAuthStore()
  const { seedAdmin, setCurrentRole } = useRoleStore()
  const { theme } = useThemeStore()
  const isDark = theme === 'dark'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => { if (token) router.replace('/dashboard') }, [token, router])

  const handleDevSeed = (seed: typeof DEV_SEEDS[0]) => {
    // Inject seed data into role store + set the chosen role
    seedAdmin()
    setCurrentRole(seed.role)
    // Write a sentinel dev token so auth guard passes and apiFetch guards skip
    localStorage.setItem('orchestra_token', 'dev_seed_token')
    const fakeUser = { id: DEV_SEEDS.indexOf(seed) + 1, name: seed.label + ' (Dev)', email: seed.email }
    useAuthStore.setState({ token: 'dev_seed_token', user: fakeUser })
    router.push('/dashboard')
  }

  const textPrimary = isDark ? '#f8f8f8' : '#0f0f12'
  const textMuted = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.45)'
  const cardBg = isDark ? 'rgba(255,255,255,0.03)' : '#ffffff'
  const cardBorder = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)'
  const cardShadow = isDark ? '0 0 60px rgba(169,0,255,0.08)' : '0 8px 32px rgba(0,0,0,0.06)'
  const inputBg = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'
  const inputBorder = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.12)'
  const inputColor = isDark ? '#f8f8f8' : '#0f0f12'
  const labelColor = isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'
  const socialBtnBg = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'
  const socialBtnBorder = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
  const dividerBg = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'
  const dividerText = isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'
  const eyeColor = isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.3)'
  const footerText = isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.4)'
  const loadingBg = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'
  const loadingColor = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)'

  const inputSt: React.CSSProperties = {
    width: '100%', padding: '11px 14px', borderRadius: 10,
    border: `1px solid ${inputBorder}`, background: inputBg,
    color: inputColor, fontSize: 14, outline: 'none', boxSizing: 'border-box',
    fontFamily: 'inherit', transition: 'border-color 0.15s',
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await login(email, password)
      router.push('/dashboard')
    } catch (e: any) {
      if (e?.requires2fa) {
        router.push('/two-factor')
      }
    }
  }

  return (
    <div style={{ maxWidth: 420, margin: '0 auto' }}>
      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
          <Image src="/logo.svg" alt="Orchestra" width={52} height={52} />
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: textPrimary, margin: 0, letterSpacing: '-0.02em' }}>Sign in to Orchestra</h1>
        <p style={{ fontSize: 14, color: textMuted, marginTop: 8 }}>Welcome back. Enter your details to continue.</p>
      </div>

      {/* Card */}
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
            <label style={{ fontSize: 13, fontWeight: 500, color: labelColor }}>Email address</label>
            <input
              type="email" required value={email}
              onChange={e => { setEmail(e.target.value); clearError() }}
              placeholder="you@example.com" style={inputSt}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <label style={{ fontSize: 13, fontWeight: 500, color: labelColor }}>Password</label>
              <Link href="/forgot-password" style={{ fontSize: 12, color: '#00e5ff', textDecoration: 'none' }}>Forgot password?</Link>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'} required value={password}
                onChange={e => { setPassword(e.target.value); clearError() }}
                placeholder="••••••••" style={{ ...inputSt, paddingRight: 44 }}
              />
              <button
                type="button" onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: eyeColor, padding: 0 }}
              >
                <i className={`bx ${showPassword ? 'bx-hide' : 'bx-show'}`} style={{ fontSize: 18 }} />
              </button>
            </div>
          </div>
          <button
            type="submit" disabled={loading}
            style={{ marginTop: 8, padding: '13px', borderRadius: 10, border: 'none', fontSize: 15, fontWeight: 600, color: loading ? loadingColor : '#fff', background: loading ? loadingBg : 'linear-gradient(135deg, #00e5ff, #a900ff)', cursor: loading ? 'not-allowed' : 'pointer', letterSpacing: '-0.01em', fontFamily: 'inherit' }}
          >
            {loading ? 'Signing in...' : 'Continue'}
          </button>
        </form>
      </div>

      <p style={{ textAlign: 'center', fontSize: 13, color: footerText, marginTop: 24 }}>
        Don&apos;t have an account?{' '}
        <Link href="/register" style={{ color: '#00e5ff', fontWeight: 600, textDecoration: 'none' }}>Create account</Link>
      </p>
      <p style={{ textAlign: 'center', fontSize: 13, color: footerText, marginTop: 10 }}>
        <Link href="/magic-login" style={{ color: footerText, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
          <i className="bx bx-paper-plane" style={{ fontSize: 14 }} /> Sign in without a password
        </Link>
      </p>

      {/* Dev seed panel */}
      <div style={{ marginTop: 32, borderRadius: 14, border: `1px solid ${isDark ? 'rgba(255,229,0,0.15)' : 'rgba(200,160,0,0.2)'}`, background: isDark ? 'rgba(255,229,0,0.04)' : 'rgba(255,240,0,0.04)', padding: '16px 18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 12 }}>
          <i className="bx bx-code-alt" style={{ fontSize: 14, color: isDark ? 'rgba(255,229,0,0.6)' : 'rgba(160,130,0,0.8)' }} />
          <span style={{ fontSize: 11, fontWeight: 600, color: isDark ? 'rgba(255,229,0,0.6)' : 'rgba(160,130,0,0.8)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Dev — Quick Access</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
          {DEV_SEEDS.map(seed => (
            <button
              key={seed.email}
              onClick={() => handleDevSeed(seed)}
              style={{
                padding: '9px 12px', borderRadius: 9, border: `1px solid ${seed.color}30`,
                background: `${seed.color}0a`, color: seed.color, fontSize: 12.5, fontWeight: 600,
                cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 7,
                transition: 'background 0.15s',
              }}
            >
              <i className="bx bx-user" style={{ fontSize: 14 }} />
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 700 }}>{seed.label}</div>
                <div style={{ fontSize: 10, opacity: 0.7, fontWeight: 400 }}>{seed.email}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
