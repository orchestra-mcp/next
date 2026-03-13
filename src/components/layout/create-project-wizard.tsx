'use client'
import { useState, useRef, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useMCP } from '@/hooks/useMCP'
import { useRoleStore, type Team } from '@/store/roles'

type WizardStep = 0 | 1 | 2 | 3 | 4

const STEPS = [
  { label: 'Project Info', icon: 'bx-folder-plus' },
  { label: 'Team', icon: 'bx-group' },
  { label: 'Tech Stacks', icon: 'bx-code-alt' },
  { label: 'Install CLI', icon: 'bx-terminal' },
  { label: 'Done', icon: 'bx-check-circle' },
]

const PROJECT_ICONS = [
  'bx-folder', 'bx-code-alt', 'bx-server', 'bx-globe',
  'bx-mobile', 'bx-data', 'bx-bot', 'bx-palette',
  'bx-game', 'bx-shopping-bag', 'bx-book', 'bx-cog',
]

const ACCENT_COLORS = [
  '#00e5ff', '#a900ff', '#22c55e', '#f59e0b',
  '#ef4444', '#3b82f6', '#ec4899', '#8b5cf6',
]

const STACKS = [
  { id: 'go', label: 'Go', icon: 'bxl-go-lang' },
  { id: 'rust', label: 'Rust', icon: 'bx-cog' },
  { id: 'react', label: 'React', icon: 'bxl-react' },
  { id: 'typescript', label: 'TypeScript', icon: 'bxl-typescript' },
  { id: 'python', label: 'Python', icon: 'bxl-python' },
  { id: 'ruby', label: 'Ruby', icon: 'bx-diamond' },
  { id: 'java', label: 'Java', icon: 'bxl-java' },
  { id: 'kotlin', label: 'Kotlin', icon: 'bxl-kotlin' },
  { id: 'swift', label: 'Swift', icon: 'bxl-swift' },
  { id: 'csharp', label: 'C#', icon: 'bx-hash' },
  { id: 'php', label: 'PHP', icon: 'bxl-php' },
  { id: 'docker', label: 'Docker', icon: 'bxl-docker' },
]

interface CreateProjectWizardProps {
  onClose: () => void
  onSuccess?: () => void
}

export function CreateProjectWizard({ onClose, onSuccess }: CreateProjectWizardProps) {
  const { callTool, status: connStatus } = useMCP()
  const { teams } = useRoleStore()
  const router = useRouter()
  const t = useTranslations('app')
  const tSidebar = useTranslations('sidebar')

  const [step, setStep] = useState<WizardStep>(0)

  // Step 0 — Project Info
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [selectedIcon, setSelectedIcon] = useState('bx-folder')
  const [selectedColor, setSelectedColor] = useState('#00e5ff')
  const [aiSuggestion, setAiSuggestion] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const aiTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Step 1 — Team
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null)

  // Step 2 — Stacks
  const [selectedStacks, setSelectedStacks] = useState<string[]>([])
  const [detectingStacks, setDetectingStacks] = useState(false)

  // Step 3 — CLI
  const [copied, setCopied] = useState<string | null>(null)

  // Step 4 — Done
  const [creating, setCreating] = useState(false)
  const [created, setCreated] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [createdSlug, setCreatedSlug] = useState<string | null>(null)

  const modalBg = 'var(--color-bg-contrast)'
  const modalBorder = 'var(--color-border)'
  const textPrimary = 'var(--color-fg)'
  const textMuted = 'var(--color-fg-dim)'
  const textDim = 'var(--color-fg-dim)'
  const inputBg = 'var(--color-bg-alt)'
  const inputBorder = 'var(--color-border)'
  const codeBg = 'var(--color-bg-alt)'

  const inputSt: React.CSSProperties = {
    width: '100%', padding: '10px 13px', borderRadius: 9,
    border: `1px solid ${inputBorder}`, background: inputBg,
    color: textPrimary, fontSize: 13, outline: 'none', boxSizing: 'border-box',
  }
  const labelSt: React.CSSProperties = { fontSize: 12, fontWeight: 500, color: textMuted, marginBottom: 6, display: 'block' }

  function next() { setStep(s => Math.min(s + 1, 4) as WizardStep) }
  function prev() { setStep(s => Math.max(s - 1, 0) as WizardStep) }

  // AI suggestion for description
  const fetchAiSuggestion = useCallback(async (itemName: string) => {
    if (!itemName.trim() || connStatus !== 'connected') return
    setAiLoading(true)
    try {
      const result = await callTool('ai_prompt', {
        prompt: `Generate a brief 1-2 sentence description for a project named "${itemName.trim()}". Be concise and professional. Return ONLY the description text, nothing else.`,
        wait: true,
      })
      const text = result.content?.[0]?.text ?? ''
      if (text.trim()) setAiSuggestion(text.trim())
    } catch {
      // optional
    } finally {
      setAiLoading(false)
    }
  }, [connStatus, callTool])

  useEffect(() => {
    if (aiTimerRef.current) clearTimeout(aiTimerRef.current)
    if (!name.trim()) { setAiSuggestion(''); return }
    aiTimerRef.current = setTimeout(() => fetchAiSuggestion(name), 800)
    return () => { if (aiTimerRef.current) clearTimeout(aiTimerRef.current) }
  }, [name, fetchAiSuggestion])

  // Auto-detect stacks via MCP
  async function handleDetectStacks() {
    if (connStatus !== 'connected') return
    setDetectingStacks(true)
    try {
      const result = await callTool('detect_stacks')
      const text = result.content?.[0]?.text ?? ''
      // Parse detected stacks from response text
      const detected: string[] = []
      for (const stack of STACKS) {
        if (text.toLowerCase().includes(stack.id)) detected.push(stack.id)
      }
      if (detected.length > 0) setSelectedStacks(detected)
    } catch {
      // fail silently
    } finally {
      setDetectingStacks(false)
    }
  }

  function copyCmd(text: string, key: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key)
      setTimeout(() => setCopied(null), 2000)
    })
  }

  function toggleStack(id: string) {
    setSelectedStacks(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id])
  }

  // Create project at step transition to Done
  async function handleCreate() {
    if (!name.trim() || connStatus !== 'connected') return
    setCreating(true)
    setError(null)

    const finalDesc = description.trim() || aiSuggestion
    const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'project'

    try {
      // Create project via MCP
      await callTool('create_project', {
        name: name.trim(),
        ...(finalDesc ? { description: finalDesc } : {}),
      })

      // Set stacks if selected and MCP is connected
      if (selectedStacks.length > 0) {
        try {
          await callTool('set_project_stacks', {
            project_id: slug,
            stacks: selectedStacks,
          })
        } catch {
          // non-fatal
        }
      }

      setCreatedSlug(slug)
      setCreated(true)
      onSuccess?.()
      next()
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setCreating(false)
    }
  }

  function goToProject() {
    onClose()
    if (createdSlug) router.push(`/projects/${createdSlug}`)
  }

  function createAnother() {
    setStep(0)
    setName('')
    setDescription('')
    setSelectedIcon('bx-folder')
    setSelectedColor('#00e5ff')
    setAiSuggestion('')
    setSelectedTeam(null)
    setSelectedStacks([])
    setCreated(false)
    setCreatedSlug(null)
    setError(null)
  }

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 10002, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
    >
      <div style={{ width: '100%', maxWidth: 520, background: modalBg, border: `1px solid ${modalBorder}`, borderRadius: 20, padding: '32px 32px 28px', boxShadow: '0 24px 60px rgba(0,0,0,0.4)' }}>
        {/* Step indicator */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, marginBottom: 28 }}>
          {STEPS.map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{
                width: i === step ? 22 : 7, height: 7, borderRadius: 4,
                background: i <= step
                  ? 'linear-gradient(90deg, #00e5ff, #a900ff)'
                  : 'var(--color-border)',
                transition: 'width 0.25s ease',
              }} />
              {i < STEPS.length - 1 && (
                <div style={{ width: 12, height: 1, background: i < step ? 'rgba(0,229,255,0.3)' : 'var(--color-border)' }} />
              )}
            </div>
          ))}
        </div>

        {/* ── Step 0: Project Info ── */}
        {step === 0 && (
          <div>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: `${selectedColor}15`, border: `1px solid ${selectedColor}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
              <i className={`bx ${selectedIcon}`} style={{ fontSize: 24, color: selectedColor }} />
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: textPrimary, margin: '0 0 6px', letterSpacing: '-0.02em' }}>Create a new project</h2>
            <p style={{ fontSize: 13, color: textMuted, marginBottom: 20, lineHeight: 1.6 }}>Projects organize your features, notes, and tasks.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Name */}
              <div>
                <label style={labelSt}>{t('projectName')} <span style={{ color: '#ef4444' }}>*</span></label>
                <input
                  autoFocus
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder={t('projectNamePlaceholder')}
                  style={inputSt}
                />
              </div>

              {/* Description */}
              <div>
                <label style={{ ...labelSt, display: 'flex', alignItems: 'center', gap: 6 }}>
                  {t('description')} <span style={{ color: textMuted, fontWeight: 400 }}>({t('descriptionOptional')})</span>
                  {aiLoading && (
                    <span style={{ fontSize: 10, color: '#a900ff', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                      <i className="bx bx-loader-alt bx-spin" style={{ fontSize: 11 }} /> AI
                    </span>
                  )}
                </label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder={aiSuggestion || t('descriptionPlaceholder')}
                  rows={2}
                  style={{ ...inputSt, resize: 'vertical' }}
                />
                {aiSuggestion && !description && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                    <i className="bx bx-bulb" style={{ fontSize: 12, color: '#a900ff' }} />
                    <span style={{ fontSize: 10, color: textDim }}>{tSidebar('aiSuggested')}</span>
                    <button onClick={() => setDescription(aiSuggestion)} style={{ fontSize: 10, color: '#a900ff', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}>
                      {tSidebar('useIt')}
                    </button>
                  </div>
                )}
              </div>

              {/* Icon picker */}
              <div>
                <label style={labelSt}>Icon</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 6 }}>
                  {PROJECT_ICONS.map(icon => (
                    <button
                      key={icon}
                      onClick={() => setSelectedIcon(icon)}
                      style={{
                        width: '100%', aspectRatio: '1', borderRadius: 9, border: `1px solid ${selectedIcon === icon ? selectedColor : inputBorder}`,
                        background: selectedIcon === icon ? `${selectedColor}12` : inputBg,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                      }}
                    >
                      <i className={`bx ${icon}`} style={{ fontSize: 17, color: selectedIcon === icon ? selectedColor : textMuted }} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Color picker */}
              <div>
                <label style={labelSt}>Accent color</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {ACCENT_COLORS.map(color => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      style={{
                        width: 26, height: 26, borderRadius: 8, border: `2px solid ${selectedColor === color ? color : 'transparent'}`,
                        background: color, cursor: 'pointer', padding: 0,
                        boxShadow: selectedColor === color ? `0 0 0 2px var(--color-bg-contrast), 0 0 0 4px ${color}` : 'none',
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
              <button onClick={onClose} style={{ padding: '10px 18px', borderRadius: 9, border: `1px solid ${modalBorder}`, background: 'transparent', color: textMuted, fontSize: 13, cursor: 'pointer' }}>
                {tSidebar('cancel')}
              </button>
              <button
                onClick={next}
                disabled={!name.trim()}
                style={{
                  flex: 1, padding: '10px', borderRadius: 9, border: 'none',
                  background: name.trim() ? 'linear-gradient(135deg, #00e5ff, #a900ff)' : 'var(--color-border)',
                  color: name.trim() ? '#fff' : textMuted, fontSize: 13, fontWeight: 700,
                  cursor: name.trim() ? 'pointer' : 'not-allowed',
                }}
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* ── Step 1: Team ── */}
        {step === 1 && (
          <div>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(169,0,255,0.1)', border: '1px solid rgba(169,0,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
              <i className="bx bx-group" style={{ fontSize: 24, color: '#a900ff' }} />
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: textPrimary, margin: '0 0 6px', letterSpacing: '-0.02em' }}>Choose a team</h2>
            <p style={{ fontSize: 13, color: textMuted, marginBottom: 20, lineHeight: 1.6 }}>Assign this project to a team, or keep it personal.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 6 }}>
              {/* Personal option */}
              <button
                onClick={() => setSelectedTeam(null)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 10,
                  border: `1px solid ${!selectedTeam ? 'rgba(0,229,255,0.35)' : inputBorder}`,
                  background: !selectedTeam ? 'rgba(0,229,255,0.05)' : inputBg,
                  cursor: 'pointer', textAlign: 'start', width: '100%',
                }}
              >
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(0,229,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <i className="bx bx-user" style={{ fontSize: 17, color: '#00e5ff' }} />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: textPrimary }}>Personal</div>
                  <div style={{ fontSize: 11, color: textMuted }}>Only you can access this project</div>
                </div>
                {!selectedTeam && <i className="bx bx-check" style={{ fontSize: 18, color: '#00e5ff', marginInlineStart: 'auto' }} />}
              </button>

              {/* Team options */}
              {teams.map((team: Team) => (
                <button
                  key={team.id}
                  onClick={() => setSelectedTeam(team.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 10,
                    border: `1px solid ${selectedTeam === team.id ? 'rgba(169,0,255,0.35)' : inputBorder}`,
                    background: selectedTeam === team.id ? 'rgba(169,0,255,0.05)' : inputBg,
                    cursor: 'pointer', textAlign: 'start', width: '100%',
                  }}
                >
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(169,0,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 15, fontWeight: 800, color: '#a900ff' }}>
                    {team.name[0].toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: textPrimary }}>{team.name}</div>
                    <div style={{ fontSize: 11, color: textMuted }}>{team.member_count} member{team.member_count !== 1 ? 's' : ''}</div>
                  </div>
                  {selectedTeam === team.id && <i className="bx bx-check" style={{ fontSize: 18, color: '#a900ff', marginInlineStart: 'auto' }} />}
                </button>
              ))}

              {teams.length === 0 && (
                <div style={{ padding: '14px', borderRadius: 10, background: inputBg, border: `1px solid ${inputBorder}`, textAlign: 'center', color: textMuted, fontSize: 12 }}>
                  No teams yet. You can create one from the Team page.
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
              <button onClick={prev} style={{ padding: '10px 18px', borderRadius: 9, border: `1px solid ${modalBorder}`, background: 'transparent', color: textMuted, fontSize: 13, cursor: 'pointer' }}>Back</button>
              <button onClick={next} style={{ flex: 1, padding: '10px', borderRadius: 9, border: 'none', background: 'linear-gradient(135deg, #00e5ff, #a900ff)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                Continue
              </button>
            </div>
          </div>
        )}

        {/* ── Step 2: Tech Stacks ── */}
        {step === 2 && (
          <div>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(0,229,255,0.1)', border: '1px solid rgba(0,229,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
              <i className="bx bx-code-alt" style={{ fontSize: 24, color: '#00e5ff' }} />
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: textPrimary, margin: '0 0 6px', letterSpacing: '-0.02em' }}>Tech stacks</h2>
            <p style={{ fontSize: 13, color: textMuted, marginBottom: 16, lineHeight: 1.6 }}>Select the technologies used in this project. This helps Orchestra recommend the right skill packs.</p>

            {/* Auto-detect button */}
            {connStatus === 'connected' && (
              <button
                onClick={handleDetectStacks}
                disabled={detectingStacks}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8,
                  border: '1px solid rgba(0,229,255,0.2)', background: 'rgba(0,229,255,0.05)',
                  color: '#00e5ff', fontSize: 12, fontWeight: 600, cursor: 'pointer', marginBottom: 14,
                  opacity: detectingStacks ? 0.7 : 1,
                }}
              >
                <i className={`bx ${detectingStacks ? 'bx-loader-alt bx-spin' : 'bx-analyse'}`} style={{ fontSize: 14 }} />
                {detectingStacks ? 'Detecting...' : 'Auto-detect from workspace'}
              </button>
            )}

            {/* Stack grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 6 }}>
              {STACKS.map(stack => {
                const active = selectedStacks.includes(stack.id)
                return (
                  <button
                    key={stack.id}
                    onClick={() => toggleStack(stack.id)}
                    style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
                      padding: '12px 6px', borderRadius: 10,
                      border: `1px solid ${active ? 'rgba(0,229,255,0.35)' : inputBorder}`,
                      background: active ? 'rgba(0,229,255,0.07)' : inputBg,
                      cursor: 'pointer',
                    }}
                  >
                    <i className={`bx ${stack.icon}`} style={{ fontSize: 20, color: active ? '#00e5ff' : textMuted }} />
                    <span style={{ fontSize: 11, color: active ? textPrimary : textMuted, fontWeight: active ? 600 : 400 }}>{stack.label}</span>
                  </button>
                )
              })}
            </div>

            {selectedStacks.length > 0 && (
              <div style={{ fontSize: 11, color: textDim, marginTop: 8 }}>
                {selectedStacks.length} stack{selectedStacks.length !== 1 ? 's' : ''} selected
              </div>
            )}

            {error && (
              <div style={{ padding: '9px 12px', borderRadius: 8, background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', fontSize: 13, marginTop: 10 }}>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
              <button onClick={prev} style={{ padding: '10px 18px', borderRadius: 9, border: `1px solid ${modalBorder}`, background: 'transparent', color: textMuted, fontSize: 13, cursor: 'pointer' }}>Back</button>
              <button
                onClick={handleCreate}
                disabled={creating}
                style={{
                  flex: 1, padding: '10px', borderRadius: 9, border: 'none',
                  background: 'linear-gradient(135deg, #00e5ff, #a900ff)',
                  color: '#fff', fontSize: 13, fontWeight: 700,
                  cursor: creating ? 'wait' : 'pointer',
                  opacity: creating ? 0.7 : 1,
                }}
              >
                {creating ? 'Creating...' : 'Create Project'}
              </button>
              {!creating && (
                <button onClick={() => { setSelectedStacks([]); handleCreate() }} style={{ padding: '10px 14px', borderRadius: 9, border: `1px solid ${modalBorder}`, background: 'transparent', color: textMuted, fontSize: 13, cursor: 'pointer' }}>
                  Skip
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── Step 3: Install CLI ── */}
        {step === 3 && (
          <div>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(0,229,255,0.1)', border: '1px solid rgba(0,229,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
              <i className="bx bx-terminal" style={{ fontSize: 24, color: '#00e5ff' }} />
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: textPrimary, margin: '0 0 6px', letterSpacing: '-0.02em' }}>Install the Orchestra CLI</h2>
            <p style={{ fontSize: 13, color: textMuted, marginBottom: 18, lineHeight: 1.6 }}>Powers all MCP tools in your AI editor. Run in your terminal:</p>

            {[
              { os: 'macOS / Linux', cmd: 'curl -fsSL https://orchestra.run/install.sh | bash', key: 'unix' },
              { os: 'Windows (PowerShell)', cmd: 'irm https://orchestra.run/install.ps1 | iex', key: 'win' },
            ].map(item => (
              <div key={item.key} style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 11, fontWeight: 500, color: textDim, marginBottom: 4 }}>{item.os}</div>
                <div style={{ position: 'relative', background: codeBg, borderRadius: 9, padding: '10px 40px 10px 13px', fontFamily: 'monospace', fontSize: 12, color: textPrimary, wordBreak: 'break-all' }}>
                  {item.cmd}
                  <button onClick={() => copyCmd(item.cmd, item.key)} style={{ position: 'absolute', insetInlineEnd: 9, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: copied === item.key ? '#22c55e' : textMuted, fontSize: 14 }}>
                    <i className={`bx ${copied === item.key ? 'bx-check' : 'bx-copy'}`} />
                  </button>
                </div>
              </div>
            ))}

            <div style={{ marginTop: 14, padding: '12px 14px', borderRadius: 10, background: 'rgba(0,229,255,0.04)', border: '1px solid rgba(0,229,255,0.12)' }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#00e5ff', marginBottom: 5 }}>Then in your project directory:</div>
              <div style={{ position: 'relative', background: codeBg, borderRadius: 7, padding: '8px 36px 8px 11px', fontFamily: 'monospace', fontSize: 12, color: textPrimary }}>
                orchestra init
                <button onClick={() => copyCmd('orchestra init', 'init')} style={{ position: 'absolute', insetInlineEnd: 7, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: copied === 'init' ? '#22c55e' : textMuted, fontSize: 13 }}>
                  <i className={`bx ${copied === 'init' ? 'bx-check' : 'bx-copy'}`} />
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
              <button onClick={next} style={{ flex: 1, padding: '10px', borderRadius: 9, border: 'none', background: 'linear-gradient(135deg, #00e5ff, #a900ff)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                Continue
              </button>
            </div>
          </div>
        )}

        {/* ── Step 4: Done ── */}
        {step === 4 && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: 18, background: 'linear-gradient(135deg, rgba(0,229,255,0.2), rgba(169,0,255,0.2))', border: '1px solid rgba(169,0,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <i className="bx bx-check-circle" style={{ fontSize: 32, color: '#22c55e' }} />
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: textPrimary, margin: '0 0 8px', letterSpacing: '-0.03em' }}>Project created!</h2>
            <p style={{ fontSize: 13, color: textMuted, lineHeight: 1.6, margin: '0 0 20px' }}>
              <strong>{name}</strong> is ready to go.
            </p>

            {/* Summary */}
            <div style={{ padding: '14px 18px', borderRadius: 12, background: inputBg, border: `1px solid ${inputBorder}`, marginBottom: 22, textAlign: 'start' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <i className={`bx ${selectedIcon}`} style={{ fontSize: 16, color: selectedColor }} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: textPrimary }}>{name}</span>
                </div>
                {selectedTeam && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <i className="bx bx-group" style={{ fontSize: 14, color: textMuted }} />
                    <span style={{ fontSize: 12, color: textMuted }}>{teams.find(t => t.id === selectedTeam)?.name ?? 'Team'}</span>
                  </div>
                )}
                {selectedStacks.length > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <i className="bx bx-code-alt" style={{ fontSize: 14, color: textMuted }} />
                    {selectedStacks.map(s => (
                      <span key={s} style={{ fontSize: 10, padding: '2px 8px', borderRadius: 100, background: 'rgba(0,229,255,0.08)', border: '1px solid rgba(0,229,255,0.15)', color: '#00e5ff' }}>
                        {STACKS.find(st => st.id === s)?.label ?? s}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={goToProject} style={{ flex: 1, padding: '11px', borderRadius: 9, border: 'none', background: 'linear-gradient(135deg, #00e5ff, #a900ff)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                Go to Project
              </button>
              <button onClick={createAnother} style={{ padding: '11px 18px', borderRadius: 9, border: `1px solid ${modalBorder}`, background: 'transparent', color: textMuted, fontSize: 13, cursor: 'pointer' }}>
                Create Another
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
