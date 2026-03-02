'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { useThemeStore } from '@/store/theme'
import { apiFetch } from '@/lib/api'

type ApprovalState = 'idle' | 'approving' | 'approved' | 'error'

function CliAuthContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const code = searchParams.get('code')
  const { theme } = useThemeStore()
  const isDark = theme === 'dark'

  const [state, setState] = useState<ApprovalState>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  // Auth check: redirect to login with return URL if no token
  useEffect(() => {
    if (typeof window === 'undefined') return
    const token = localStorage.getItem('orchestra_token')
    if (!token) {
      const redirect = code
        ? `/login?redirect=${encodeURIComponent(`/cli-auth?code=${code}`)}`
        : '/login'
      router.replace(redirect)
    }
  }, [code, router])

  // If no code in URL, show an error state
  if (!code) {
    return (
      <PageShell isDark={isDark}>
        <div style={{ textAlign: 'center' }}>
          <div style={iconCircleStyle(isDark, '#ef4444')}>
            <i className="bx bx-x" style={{ fontSize: 28, color: '#ef4444' }} />
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: textPrimary(isDark), margin: '16px 0 8px' }}>
            Invalid Request
          </h2>
          <p style={{ fontSize: 14, color: textMuted(isDark), margin: 0 }}>
            No authorization code was provided. Please start the login process from your CLI.
          </p>
        </div>
      </PageShell>
    )
  }

  const handleApprove = async () => {
    setState('approving')
    setErrorMsg('')
    try {
      await apiFetch('/api/auth/device/approve', {
        method: 'POST',
        body: JSON.stringify({ user_code: code }),
      })
      setState('approved')
    } catch (err: any) {
      setState('error')
      setErrorMsg(err?.message || 'Failed to approve device. Please try again.')
    }
  }

  const handleDeny = () => {
    if (typeof window !== 'undefined') {
      window.close()
    }
  }

  // Approved state
  if (state === 'approved') {
    return (
      <PageShell isDark={isDark}>
        <div style={{ textAlign: 'center' }}>
          <div style={iconCircleStyle(isDark, '#22c55e')}>
            <i className="bx bx-check" style={{ fontSize: 28, color: '#22c55e' }} />
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: textPrimary(isDark), margin: '16px 0 8px' }}>
            CLI Authorized
          </h2>
          <p style={{ fontSize: 14, color: textMuted(isDark), margin: 0, lineHeight: 1.5 }}>
            Your CLI has been connected to your Orchestra account.<br />
            You can close this tab and return to your terminal.
          </p>
        </div>
      </PageShell>
    )
  }

  // Idle / approving / error states
  return (
    <PageShell isDark={isDark}>
      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
          <Image src="/orchestra-logo.svg" width={40} height={40} alt="Orchestra" />
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: textPrimary(isDark), margin: 0, letterSpacing: '-0.02em' }}>
          Authorize CLI Access
        </h1>
        <p style={{ fontSize: 14, color: textMuted(isDark), marginTop: 8, lineHeight: 1.5 }}>
          A CLI tool is requesting access to your Orchestra account
        </p>
      </div>

      {/* Card */}
      <div style={{
        background: cardBg(isDark),
        border: `1px solid ${cardBorder(isDark)}`,
        borderRadius: 20,
        padding: '32px 28px',
        backdropFilter: 'blur(16px)',
        boxShadow: cardShadow(isDark),
      }}>
        {/* Code label */}
        <div style={{ textAlign: 'center', marginBottom: 8 }}>
          <span style={{
            fontSize: 11,
            fontWeight: 600,
            color: textMuted(isDark),
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}>
            Confirmation Code
          </span>
        </div>

        {/* Code display */}
        <div style={{
          textAlign: 'center',
          padding: '20px 16px',
          marginBottom: 24,
          borderRadius: 12,
          background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
          border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
        }}>
          <span style={{
            fontFamily: '"SF Mono", "Fira Code", "Cascadia Code", "JetBrains Mono", monospace',
            fontSize: 32,
            fontWeight: 700,
            letterSpacing: '0.12em',
            color: textPrimary(isDark),
          }}>
            {code}
          </span>
        </div>

        {/* Security notice */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 10,
          padding: '12px 14px',
          marginBottom: 24,
          borderRadius: 10,
          background: isDark ? 'rgba(0,229,255,0.04)' : 'rgba(0,180,220,0.04)',
          border: `1px solid ${isDark ? 'rgba(0,229,255,0.12)' : 'rgba(0,180,220,0.12)'}`,
        }}>
          <i className="bx bx-info-circle" style={{ fontSize: 16, color: '#00e5ff', flexShrink: 0, marginTop: 1 }} />
          <span style={{ fontSize: 12.5, color: textMuted(isDark), lineHeight: 1.5 }}>
            Make sure this code matches the one shown in your terminal. If you did not initiate this request, click Deny.
          </span>
        </div>

        {/* Error message */}
        {state === 'error' && errorMsg && (
          <div style={{
            marginBottom: 20,
            padding: '10px 14px',
            borderRadius: 8,
            fontSize: 13,
            background: 'rgba(239,68,68,0.1)',
            color: '#ef4444',
            border: '1px solid rgba(239,68,68,0.2)',
          }}>
            {errorMsg}
          </div>
        )}

        {/* Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button
            onClick={handleApprove}
            disabled={state === 'approving'}
            style={{
              padding: '13px',
              borderRadius: 10,
              border: 'none',
              fontSize: 15,
              fontWeight: 600,
              color: state === 'approving' ? loadingColor(isDark) : '#fff',
              background: state === 'approving' ? loadingBg(isDark) : 'linear-gradient(135deg, #00e5ff, #a900ff)',
              cursor: state === 'approving' ? 'not-allowed' : 'pointer',
              letterSpacing: '-0.01em',
              fontFamily: 'inherit',
              transition: 'opacity 0.15s',
            }}
          >
            {state === 'approving' ? 'Authorizing...' : 'Approve'}
          </button>
          <button
            onClick={handleDeny}
            disabled={state === 'approving'}
            style={{
              padding: '11px',
              borderRadius: 10,
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)'}`,
              fontSize: 14,
              fontWeight: 500,
              color: textMuted(isDark),
              background: 'transparent',
              cursor: state === 'approving' ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit',
              transition: 'background 0.15s',
            }}
          >
            Deny
          </button>
        </div>
      </div>

      {/* Footer */}
      <p style={{
        textAlign: 'center',
        fontSize: 12,
        color: isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.3)',
        marginTop: 20,
        lineHeight: 1.5,
      }}>
        This authorization is for the Orchestra CLI on your local machine.
      </p>
    </PageShell>
  )
}

// Wraps content in a centered full-page container (bypasses sidebar layout visually)
function PageShell({ isDark, children }: { isDark: boolean; children: React.ReactNode }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 'calc(100vh - 52px)',
      padding: '40px 20px',
    }}>
      <div style={{ maxWidth: 420, width: '100%' }}>
        {children}
      </div>
    </div>
  )
}

// Style helpers matching the login page pattern
function textPrimary(isDark: boolean) { return isDark ? '#f8f8f8' : '#0f0f12' }
function textMuted(isDark: boolean) { return isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.45)' }
function cardBg(isDark: boolean) { return isDark ? 'rgba(255,255,255,0.03)' : '#ffffff' }
function cardBorder(isDark: boolean) { return isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)' }
function cardShadow(isDark: boolean) { return isDark ? '0 0 60px rgba(169,0,255,0.08)' : '0 8px 32px rgba(0,0,0,0.06)' }
function loadingBg(isDark: boolean) { return isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }
function loadingColor(isDark: boolean) { return isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' }

function iconCircleStyle(isDark: boolean, color: string): React.CSSProperties {
  return {
    width: 56,
    height: 56,
    borderRadius: '50%',
    background: `${color}12`,
    border: `1px solid ${color}25`,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  }
}

// Default export wraps in Suspense for useSearchParams
export default function CliAuthPage() {
  return (
    <Suspense fallback={null}>
      <CliAuthContent />
    </Suspense>
  )
}
