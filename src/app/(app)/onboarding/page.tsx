'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth'
import { useThemeStore } from '@/store/theme'
import { apiFetch, isDevSeed } from '@/lib/api'
import Image from 'next/image'

type Step = 0 | 1 | 2 | 3 | 4 | 5

const STEPS = [
  { label: 'Welcome' },
  { label: 'Profile' },
  { label: 'Team' },
  { label: 'Project' },
  { label: 'Install CLI' },
  { label: 'Done' },
]

export default function OnboardingPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const { theme } = useThemeStore()
  const isDark = theme === 'dark'

  const [step, setStep] = useState<Step>(0)

  // Profile
  const [name, setName] = useState(user?.name ?? '')
  const [position, setPosition] = useState('')
  const [profileSaving, setProfileSaving] = useState(false)
  const [selectedGoals, setSelectedGoals] = useState<string[]>([])

  // Team
  const [teamName, setTeamName] = useState('')
  const [teamDesc, setTeamDesc] = useState('')
  const [teamSaving, setTeamSaving] = useState(false)
  const [teamError, setTeamError] = useState<string | null>(null)
  const [teamSkipped, setTeamSkipped] = useState(false)

  // Project
  const [projectName, setProjectName] = useState('')
  const [projectDesc, setProjectDesc] = useState('')
  const [projectSaving, setProjectSaving] = useState(false)
  const [projectError, setProjectError] = useState<string | null>(null)
  const [projectSkipped, setProjectSkipped] = useState(false)

  // CLI
  const [copied, setCopied] = useState<string | null>(null)

  const textPrimary = isDark ? '#f8f8f8' : '#0f0f12'
  const textMuted = isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)'
  const textDim = isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.3)'
  const bg = isDark ? '#0f0f12' : '#f5f5f7'
  const cardBg = isDark ? '#161320' : '#ffffff'
  const cardBorder = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.09)'
  const inputBg = isDark ? 'rgba(255,255,255,0.04)' : '#f7f7f9'
  const inputBorder = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.12)'
  const codeBg = isDark ? 'rgba(0,0,0,0.4)' : '#f0f0f4'

  const inputSt: React.CSSProperties = {
    width: '100%', padding: '10px 13px', borderRadius: 9,
    border: `1px solid ${inputBorder}`, background: inputBg,
    color: textPrimary, fontSize: 13, outline: 'none', boxSizing: 'border-box',
  }
  const labelSt: React.CSSProperties = { fontSize: 12, fontWeight: 500, color: textMuted, marginBottom: 6, display: 'block' }

  function next() { setStep(s => Math.min(s + 1, 5) as Step) }
  function prev() { setStep(s => Math.max(s - 1, 0) as Step) }

  function finish() {
    localStorage.setItem('orchestra_onboarding_done', '1')
    localStorage.removeItem('orchestra_is_new_user')
    router.push('/dashboard')
  }

  function copyCmd(text: string, key: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key)
      setTimeout(() => setCopied(null), 2000)
    })
  }

  function toggleGoal(goal: string) {
    setSelectedGoals(prev => prev.includes(goal) ? prev.filter(g => g !== goal) : [...prev, goal])
  }

  async function saveProfile() {
    setProfileSaving(true)
    try {
      if (!isDevSeed()) {
        await apiFetch('/api/settings/profile', {
          method: 'PATCH',
          body: JSON.stringify({ name: name.trim(), position: position.trim() }),
        })
      }
    } catch { /* non-blocking */ } finally {
      setProfileSaving(false)
      next()
    }
  }

  async function createTeam() {
    if (!teamName.trim()) return
    setTeamSaving(true); setTeamError(null)
    try {
      if (!isDevSeed()) {
        await apiFetch('/api/teams/', { method: 'POST', body: JSON.stringify({ name: teamName.trim(), description: teamDesc.trim() }) })
      }
      next()
    } catch (e) {
      setTeamError((e as Error).message)
    } finally {
      setTeamSaving(false)
    }
  }

  async function createProject() {
    if (!projectName.trim()) return
    setProjectSaving(true); setProjectError(null)
    try {
      if (!isDevSeed()) {
        await apiFetch('/api/projects', { method: 'POST', body: JSON.stringify({ name: projectName.trim(), description: projectDesc.trim() }) })
      }
      next()
    } catch (e) {
      setProjectError((e as Error).message)
    } finally {
      setProjectSaving(false)
    }
  }

  const goals = [
    { id: 'features', icon: 'bx-git-branch', label: 'Track features & tasks' },
    { id: 'agents', icon: 'bx-bot', label: 'Orchestrate AI agents' },
    { id: 'notes', icon: 'bx-note', label: 'Write notes & docs' },
    { id: 'projects', icon: 'bx-folder', label: 'Manage projects' },
    { id: 'packs', icon: 'bx-package', label: 'Install skill packs' },
    { id: 'team', icon: 'bx-group', label: 'Collaborate with a team' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 16px' }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 36 }}>
        <Image src="/logo.svg" alt="Orchestra" width={28} height={28} />
        <span style={{ fontSize: 17, fontWeight: 700, color: textPrimary, letterSpacing: '-0.02em' }}>Orchestra</span>
      </div>

      {/* Step indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 28 }}>
        {STEPS.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{
              width: i === step ? 22 : 7, height: 7, borderRadius: 4,
              background: i < step
                ? 'linear-gradient(90deg, #00e5ff, #a900ff)'
                : i === step
                  ? 'linear-gradient(90deg, #00e5ff, #a900ff)'
                  : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'),
              transition: 'width 0.25s ease',
            }} />
            {i < STEPS.length - 1 && (
              <div style={{ width: 12, height: 1, background: i < step ? 'rgba(0,229,255,0.3)' : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)') }} />
            )}
          </div>
        ))}
      </div>

      {/* Card */}
      <div style={{ width: '100%', maxWidth: 500, background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 20, padding: '32px 36px', boxShadow: isDark ? '0 24px 60px rgba(0,0,0,0.5)' : '0 8px 40px rgba(0,0,0,0.1)' }}>

        {/* ── Step 0: Welcome ── */}
        {step === 0 && (
          <div>
            <div style={{ width: 60, height: 60, borderRadius: 16, background: 'linear-gradient(135deg, rgba(0,229,255,0.15), rgba(169,0,255,0.15))', border: '1px solid rgba(169,0,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 22 }}>
              <i className="bx bx-rocket" style={{ fontSize: 28, color: '#a900ff' }} />
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: textPrimary, margin: '0 0 10px', letterSpacing: '-0.03em' }}>
              Welcome to Orchestra{user?.name ? `, ${user.name.split(' ')[0]}` : ''}!
            </h1>
            <p style={{ fontSize: 13.5, color: textMuted, lineHeight: 1.7, margin: '0 0 24px' }}>
              Your AI-native workspace — manage features, orchestrate agents, collaborate with your team, and extend everything with skill packs.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
              {[
                { icon: 'bx-git-branch', color: '#00e5ff', title: '131 MCP tools', desc: 'Features, agents, notes, packs and more' },
                { icon: 'bx-bot', color: '#a900ff', title: 'Multi-agent orchestration', desc: 'Claude, GPT-4, Gemini, and Ollama' },
                { icon: 'bx-package', color: '#22c55e', title: '17 skill packs', desc: 'Go, React, Rust, Python and more' },
              ].map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 10, background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', border: `1px solid ${cardBorder}` }}>
                  <div style={{ width: 32, height: 32, borderRadius: 9, background: `${f.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <i className={`bx ${f.icon}`} style={{ fontSize: 16, color: f.color }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: textPrimary }}>{f.title}</div>
                    <div style={{ fontSize: 12, color: textMuted }}>{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={next} style={{ width: '100%', padding: '12px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #00e5ff, #a900ff)', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
              Get started →
            </button>
          </div>
        )}

        {/* ── Step 1: Profile ── */}
        {step === 1 && (
          <div>
            <div style={{ width: 60, height: 60, borderRadius: 16, background: 'linear-gradient(135deg, rgba(0,229,255,0.15), rgba(169,0,255,0.15))', border: '1px solid rgba(0,229,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 22 }}>
              <i className="bx bx-user-circle" style={{ fontSize: 28, color: '#00e5ff' }} />
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: textPrimary, margin: '0 0 6px', letterSpacing: '-0.02em' }}>Set up your profile</h2>
            <p style={{ fontSize: 13, color: textMuted, marginBottom: 22, lineHeight: 1.6 }}>Tell us a bit about yourself.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={labelSt}>Full name</label>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" style={inputSt} />
              </div>
              <div>
                <label style={labelSt}>Role / Position <span style={{ color: textDim, fontWeight: 400 }}>(optional)</span></label>
                <input value={position} onChange={e => setPosition(e.target.value)} placeholder="e.g. Senior Engineer, Product Manager…" style={inputSt} />
              </div>
              <div>
                <label style={labelSt}>What will you use Orchestra for?</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {goals.map(goal => {
                    const active = selectedGoals.includes(goal.id)
                    return (
                      <button key={goal.id} onClick={() => toggleGoal(goal.id)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 11px', borderRadius: 8, border: `1px solid ${active ? 'rgba(0,229,255,0.35)' : inputBorder}`, background: active ? 'rgba(0,229,255,0.07)' : inputBg, cursor: 'pointer', textAlign: 'left' }}>
                        <i className={`bx ${goal.icon}`} style={{ fontSize: 14, color: active ? '#00e5ff' : textMuted, flexShrink: 0 }} />
                        <span style={{ fontSize: 12, color: active ? textPrimary : textMuted, fontWeight: active ? 500 : 400 }}>{goal.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
              <button onClick={prev} style={{ padding: '10px 18px', borderRadius: 9, border: `1px solid ${cardBorder}`, background: 'transparent', color: textMuted, fontSize: 13, cursor: 'pointer' }}>Back</button>
              <button onClick={saveProfile} disabled={profileSaving || !name.trim()} style={{ flex: 1, padding: '10px', borderRadius: 9, border: 'none', background: name.trim() ? 'linear-gradient(135deg, #00e5ff, #a900ff)' : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)'), color: name.trim() ? '#fff' : textMuted, fontSize: 13, fontWeight: 700, cursor: name.trim() ? 'pointer' : 'not-allowed', opacity: profileSaving ? 0.7 : 1 }}>
                {profileSaving ? 'Saving…' : 'Continue →'}
              </button>
            </div>
          </div>
        )}

        {/* ── Step 2: Create Team ── */}
        {step === 2 && (
          <div>
            <div style={{ width: 60, height: 60, borderRadius: 16, background: 'linear-gradient(135deg, rgba(169,0,255,0.15), rgba(0,229,255,0.15))', border: '1px solid rgba(169,0,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 22 }}>
              <i className="bx bx-group" style={{ fontSize: 28, color: '#a900ff' }} />
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: textPrimary, margin: '0 0 6px', letterSpacing: '-0.02em' }}>Create your team</h2>
            <p style={{ fontSize: 13, color: textMuted, marginBottom: 22, lineHeight: 1.6 }}>Teams let you collaborate on projects with others. You can always do this later.</p>

            {teamSkipped ? (
              <div style={{ padding: '16px', borderRadius: 10, background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', border: `1px solid ${cardBorder}`, textAlign: 'center', color: textMuted, fontSize: 13, marginBottom: 24 }}>
                Skipped — you can create a team from the Team menu anytime.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 6 }}>
                {/* Live avatar preview */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 13, background: 'rgba(169,0,255,0.12)', border: '1px solid rgba(169,0,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 800, color: '#a900ff', flexShrink: 0 }}>
                    {teamName.trim() ? teamName.trim()[0].toUpperCase() : <i className="bx bx-group" style={{ fontSize: 20 }} />}
                  </div>
                  <div style={{ fontSize: 12, color: textDim }}>Avatar generated from team name</div>
                </div>
                <div>
                  <label style={labelSt}>Team name <span style={{ color: '#ef4444' }}>*</span></label>
                  <input value={teamName} onChange={e => setTeamName(e.target.value)} onKeyDown={e => e.key === 'Enter' && createTeam()} placeholder="e.g. Acme Corp, Engineering…" autoFocus style={inputSt} />
                </div>
                <div>
                  <label style={labelSt}>Description <span style={{ color: textDim, fontWeight: 400 }}>(optional)</span></label>
                  <textarea value={teamDesc} onChange={e => setTeamDesc(e.target.value)} placeholder="What does this team work on?" rows={2} style={{ ...inputSt, resize: 'vertical' }} />
                </div>
                {teamError && (
                  <div style={{ padding: '9px 12px', borderRadius: 8, background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', fontSize: 13 }}>{teamError}</div>
                )}
              </div>
            )}

            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button onClick={prev} style={{ padding: '10px 18px', borderRadius: 9, border: `1px solid ${cardBorder}`, background: 'transparent', color: textMuted, fontSize: 13, cursor: 'pointer' }}>Back</button>
              {!teamSkipped && (
                <button
                  onClick={createTeam}
                  disabled={teamSaving || !teamName.trim()}
                  style={{ flex: 1, padding: '10px', borderRadius: 9, border: 'none', background: teamName.trim() ? 'linear-gradient(135deg, #00e5ff, #a900ff)' : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)'), color: teamName.trim() ? '#fff' : textMuted, fontSize: 13, fontWeight: 700, cursor: teamName.trim() ? 'pointer' : 'not-allowed', opacity: teamSaving ? 0.7 : 1 }}
                >
                  {teamSaving ? 'Creating…' : 'Create Team →'}
                </button>
              )}
              {teamSkipped ? (
                <button onClick={next} style={{ flex: 1, padding: '10px', borderRadius: 9, border: 'none', background: 'linear-gradient(135deg, #00e5ff, #a900ff)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Continue →</button>
              ) : (
                <button onClick={() => { setTeamSkipped(true); next() }} style={{ padding: '10px 14px', borderRadius: 9, border: `1px solid ${cardBorder}`, background: 'transparent', color: textMuted, fontSize: 13, cursor: 'pointer' }}>Skip</button>
              )}
            </div>
          </div>
        )}

        {/* ── Step 3: Create Project ── */}
        {step === 3 && (
          <div>
            <div style={{ width: 60, height: 60, borderRadius: 16, background: 'linear-gradient(135deg, rgba(0,229,255,0.15), rgba(169,0,255,0.15))', border: '1px solid rgba(0,229,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 22 }}>
              <i className="bx bx-folder-plus" style={{ fontSize: 28, color: '#00e5ff' }} />
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: textPrimary, margin: '0 0 6px', letterSpacing: '-0.02em' }}>Create your first project</h2>
            <p style={{ fontSize: 13, color: textMuted, marginBottom: 22, lineHeight: 1.6 }}>Projects organize your features, notes, and tasks in one place.</p>

            {projectSkipped ? (
              <div style={{ padding: '16px', borderRadius: 10, background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', border: `1px solid ${cardBorder}`, textAlign: 'center', color: textMuted, fontSize: 13, marginBottom: 24 }}>
                Skipped — create projects anytime from the Projects page.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 6 }}>
                <div>
                  <label style={labelSt}>Project name <span style={{ color: '#ef4444' }}>*</span></label>
                  <input value={projectName} onChange={e => setProjectName(e.target.value)} onKeyDown={e => e.key === 'Enter' && createProject()} placeholder="e.g. My App, Backend API…" autoFocus style={inputSt} />
                </div>
                <div>
                  <label style={labelSt}>Description <span style={{ color: textDim, fontWeight: 400 }}>(optional)</span></label>
                  <textarea value={projectDesc} onChange={e => setProjectDesc(e.target.value)} placeholder="What is this project about?" rows={2} style={{ ...inputSt, resize: 'vertical' }} />
                </div>
                {projectError && (
                  <div style={{ padding: '9px 12px', borderRadius: 8, background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', fontSize: 13 }}>{projectError}</div>
                )}
              </div>
            )}

            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button onClick={prev} style={{ padding: '10px 18px', borderRadius: 9, border: `1px solid ${cardBorder}`, background: 'transparent', color: textMuted, fontSize: 13, cursor: 'pointer' }}>Back</button>
              {!projectSkipped && (
                <button
                  onClick={createProject}
                  disabled={projectSaving || !projectName.trim()}
                  style={{ flex: 1, padding: '10px', borderRadius: 9, border: 'none', background: projectName.trim() ? 'linear-gradient(135deg, #00e5ff, #a900ff)' : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)'), color: projectName.trim() ? '#fff' : textMuted, fontSize: 13, fontWeight: 700, cursor: projectName.trim() ? 'pointer' : 'not-allowed', opacity: projectSaving ? 0.7 : 1 }}
                >
                  {projectSaving ? 'Creating…' : 'Create Project →'}
                </button>
              )}
              {projectSkipped ? (
                <button onClick={next} style={{ flex: 1, padding: '10px', borderRadius: 9, border: 'none', background: 'linear-gradient(135deg, #00e5ff, #a900ff)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Continue →</button>
              ) : (
                <button onClick={() => { setProjectSkipped(true); next() }} style={{ padding: '10px 14px', borderRadius: 9, border: `1px solid ${cardBorder}`, background: 'transparent', color: textMuted, fontSize: 13, cursor: 'pointer' }}>Skip</button>
              )}
            </div>
          </div>
        )}

        {/* ── Step 4: Install CLI ── */}
        {step === 4 && (
          <div>
            <div style={{ width: 60, height: 60, borderRadius: 16, background: 'linear-gradient(135deg, rgba(0,229,255,0.15), rgba(169,0,255,0.15))', border: '1px solid rgba(0,229,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 22 }}>
              <i className="bx bx-terminal" style={{ fontSize: 28, color: '#00e5ff' }} />
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: textPrimary, margin: '0 0 6px', letterSpacing: '-0.02em' }}>Install the Orchestra CLI</h2>
            <p style={{ fontSize: 13, color: textMuted, marginBottom: 20, lineHeight: 1.6 }}>Powers all 131 MCP tools in your AI editor. Run in your terminal:</p>
            {[
              { os: 'macOS / Linux', cmd: 'curl -fsSL https://orchestra.run/install.sh | bash', key: 'unix' },
              { os: 'Windows (PowerShell)', cmd: 'irm https://orchestra.run/install.ps1 | iex', key: 'win' },
            ].map(item => (
              <div key={item.key} style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 500, color: textDim, marginBottom: 5 }}>{item.os}</div>
                <div style={{ position: 'relative', background: codeBg, borderRadius: 9, padding: '10px 40px 10px 13px', fontFamily: 'monospace', fontSize: 12, color: isDark ? '#e2e8f0' : '#1e293b', wordBreak: 'break-all' }}>
                  {item.cmd}
                  <button onClick={() => copyCmd(item.cmd, item.key)} style={{ position: 'absolute', right: 9, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: copied === item.key ? '#22c55e' : textMuted, fontSize: 14 }}>
                    <i className={`bx ${copied === item.key ? 'bx-check' : 'bx-copy'}`} />
                  </button>
                </div>
              </div>
            ))}
            <div style={{ marginTop: 16, padding: '14px', borderRadius: 10, background: isDark ? 'rgba(0,229,255,0.04)' : 'rgba(0,229,255,0.04)', border: '1px solid rgba(0,229,255,0.12)' }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#00e5ff', marginBottom: 6 }}>Then in your project directory:</div>
              <div style={{ position: 'relative', background: codeBg, borderRadius: 7, padding: '8px 36px 8px 11px', fontFamily: 'monospace', fontSize: 12, color: isDark ? '#e2e8f0' : '#1e293b' }}>
                orchestra init
                <button onClick={() => copyCmd('orchestra init', 'init')} style={{ position: 'absolute', right: 7, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: copied === 'init' ? '#22c55e' : textMuted, fontSize: 13 }}>
                  <i className={`bx ${copied === 'init' ? 'bx-check' : 'bx-copy'}`} />
                </button>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
              <button onClick={prev} style={{ padding: '10px 18px', borderRadius: 9, border: `1px solid ${cardBorder}`, background: 'transparent', color: textMuted, fontSize: 13, cursor: 'pointer' }}>Back</button>
              <button onClick={next} style={{ flex: 1, padding: '10px', borderRadius: 9, border: 'none', background: 'linear-gradient(135deg, #00e5ff, #a900ff)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                I'll do this later →
              </button>
            </div>
          </div>
        )}

        {/* ── Step 5: Done ── */}
        {step === 5 && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 68, height: 68, borderRadius: 20, background: 'linear-gradient(135deg, rgba(0,229,255,0.2), rgba(169,0,255,0.2))', border: '1px solid rgba(169,0,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 22px' }}>
              <i className="bx bx-check-circle" style={{ fontSize: 34, color: '#00e5ff' }} />
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: textPrimary, margin: '0 0 10px', letterSpacing: '-0.03em' }}>You're all set!</h2>
            <p style={{ fontSize: 13.5, color: textMuted, lineHeight: 1.7, margin: '0 0 28px' }}>
              Your Orchestra workspace is ready.{!teamSkipped && ` Team created.`}{!projectSkipped && ` Project created.`}
            </p>
            <div style={{ padding: '14px 18px', borderRadius: 12, background: isDark ? 'rgba(0,229,255,0.05)' : 'rgba(0,229,255,0.04)', border: '1px solid rgba(0,229,255,0.15)', marginBottom: 24, textAlign: 'left' }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#00e5ff', marginBottom: 10 }}>Quick reference</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {[
                  { cmd: 'orchestra serve', desc: 'Start the MCP server' },
                  { cmd: 'orchestra pack install <name>', desc: 'Install a skill pack' },
                  { cmd: 'orchestra version', desc: 'Check installed version' },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <code style={{ fontSize: 11, fontFamily: 'monospace', color: isDark ? '#e2e8f0' : '#1e293b', background: codeBg, padding: '2px 7px', borderRadius: 5, flexShrink: 0 }}>{item.cmd}</code>
                    <span style={{ fontSize: 12, color: textMuted }}>{item.desc}</span>
                  </div>
                ))}
              </div>
            </div>
            <button onClick={finish} style={{ width: '100%', padding: '12px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #00e5ff, #a900ff)', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
              Go to Dashboard →
            </button>
          </div>
        )}
      </div>

      {/* Skip link */}
      {step < 5 && (
        <button onClick={finish} style={{ marginTop: 18, background: 'none', border: 'none', color: textDim, fontSize: 12, cursor: 'pointer' }}>
          Skip onboarding
        </button>
      )}
    </div>
  )
}
