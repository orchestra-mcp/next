'use client'
import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useRoleStore } from '@/store/roles'
import { createClient } from '@/lib/supabase/client'

// ── Types ─────────────────────────────────────────────────────

interface WorkflowState {
  label: string
  terminal: boolean
  active_work: boolean
}

interface WorkflowTransition {
  from: string
  to: string
  gate?: string
}

interface WorkflowGate {
  label: string
  required_section: string
  file_patterns?: string[]
  docs_folder?: string
  skippable_for?: string[]
}

interface Workflow {
  id: string
  workflow_id: string
  project_slug: string
  name: string
  description: string
  initial_state: string
  is_default: boolean
  states: Record<string, WorkflowState>
  transitions: WorkflowTransition[]
  gates: Record<string, WorkflowGate>
  team_id?: string
  created_at: string
  updated_at: string
}

// ── Style tokens ──────────────────────────────────────────────

const textPrimary = 'var(--color-fg)'
const textMuted = 'var(--color-fg-muted)'
const textDim = 'var(--color-fg-dim)'
const borderColor = 'var(--color-border)'
const bgAlt = 'var(--color-bg-alt)'
const accent = '#a900ff'

// Dynamic state colors based on properties
function stateColor(state: WorkflowState): { bg: string; border: string; text: string } {
  if (state.terminal) return { bg: 'rgba(99,102,241,0.08)', border: 'rgba(99,102,241,0.2)', text: '#6366f1' }
  if (state.active_work) return { bg: 'rgba(34,197,94,0.08)', border: 'rgba(34,197,94,0.2)', text: '#22c55e' }
  return { bg: 'rgba(120,120,120,0.08)', border: 'rgba(120,120,120,0.2)', text: 'rgba(160,160,160,0.9)' }
}

// ── Tabs ──────────────────────────────────────────────────────

type TabId = 'overview' | 'states' | 'transitions' | 'gates' | 'settings'

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: 'overview', label: 'Overview', icon: 'bx-info-circle' },
  { id: 'states', label: 'States', icon: 'bx-category' },
  { id: 'transitions', label: 'Transitions', icon: 'bx-transfer-alt' },
  { id: 'gates', label: 'Gates', icon: 'bx-shield-quarter' },
  { id: 'settings', label: 'Settings', icon: 'bx-cog' },
]

// ── Page Component ────────────────────────────────────────────

export default function WorkflowsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const team = useRoleStore(s => s.team)
  const [activeTab, setActiveTab] = useState<TabId>('overview')
  const [workflows, setWorkflows] = useState<Workflow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const sb = createClient()
    let q = sb.from('workflows').select('*').order('created_at', { ascending: false })
    if (team?.id) q = q.eq('team_id', team.id)
    q.then(({ data, error }) => {
        if (error) throw error
        setWorkflows((data || []) as Workflow[])
      })
      .catch(() => setWorkflows([]))
      .finally(() => setLoading(false))
  }, [team?.id])

  const selectedId = searchParams.get('id')
  const selectedWorkflow = selectedId
    ? workflows.find(w => w.id === selectedId || w.workflow_id === selectedId) || null
    : null

  // Reset tab when workflow changes
  useEffect(() => {
    setActiveTab('overview')
  }, [selectedId])

  function handleNewWorkflow() {
    router.push('/workflows?new=1')
  }

  // ── Loading state ──────────────────────────────────────────
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        background: 'var(--color-bg)',
        color: textDim,
        fontSize: 13,
        gap: 10,
      }}>
        <i className="bx bx-loader-alt bx-spin" style={{ fontSize: 18 }} />
        Loading workflows...
      </div>
    )
  }

  // ── Empty state (no workflow selected) ────────────────────
  if (!selectedId) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: 'var(--color-bg)',
        color: textPrimary,
      }}>
        {/* Header */}
        <div style={{
          padding: '24px 28px 20px',
          borderBottom: `1px solid ${borderColor}`,
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: 'rgba(169,0,255,0.08)',
                border: '1px solid rgba(169,0,255,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <i className="bx bx-git-branch" style={{ fontSize: 18, color: accent }} />
              </div>
              <div>
                <h1 style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: textPrimary,
                  margin: 0,
                  letterSpacing: '-0.02em',
                }}>
                  Workflows
                </h1>
                <p style={{
                  fontSize: 13,
                  color: textDim,
                  margin: '3px 0 0',
                }}>
                  Manage feature delivery workflows with states, transitions, and gates
                </p>
              </div>
            </div>
            <button
              onClick={handleNewWorkflow}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                padding: '8px 18px',
                borderRadius: 9,
                border: 'none',
                background: 'linear-gradient(135deg, #00e5ff, #a900ff)',
                color: '#fff',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              <i className="bx bx-plus" style={{ fontSize: 16 }} />
              New Workflow
            </button>
          </div>
        </div>

        {/* Empty state content */}
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{ textAlign: 'center' }}>
            <i className="bx bx-git-merge" style={{
              fontSize: 52,
              color: textDim,
              opacity: 0.35,
              display: 'block',
              marginBottom: 16,
            }} />
            <div style={{
              fontSize: 16,
              fontWeight: 600,
              color: textMuted,
              marginBottom: 8,
            }}>
              Select a workflow
            </div>
            <div style={{
              fontSize: 13,
              color: textDim,
              maxWidth: 300,
              lineHeight: 1.5,
            }}>
              Choose a workflow from the sidebar or create a new one
            </div>
            <button
              onClick={handleNewWorkflow}
              style={{
                marginTop: 20,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                padding: '9px 22px',
                borderRadius: 9,
                border: 'none',
                background: `linear-gradient(135deg, #00e5ff, ${accent})`,
                color: '#fff',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <i className="bx bx-plus" style={{ fontSize: 15 }} />
              New Workflow
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Workflow detail view ──────────────────────────────────
  const workflow = selectedWorkflow

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      background: 'var(--color-bg)',
      color: textPrimary,
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '24px 28px 0',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: 'rgba(169,0,255,0.08)',
              border: '1px solid rgba(169,0,255,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <i className="bx bx-git-branch" style={{ fontSize: 18, color: accent }} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <h1 style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: textPrimary,
                  margin: 0,
                  letterSpacing: '-0.02em',
                }}>
                  {workflow?.name || 'Workflow'}
                </h1>
                {workflow?.is_default && (
                  <span style={{
                    fontSize: 10,
                    padding: '2px 9px',
                    borderRadius: 100,
                    background: 'rgba(34,197,94,0.08)',
                    border: '1px solid rgba(34,197,94,0.2)',
                    color: '#22c55e',
                    fontWeight: 600,
                    letterSpacing: '0.03em',
                  }}>
                    Default
                  </span>
                )}
                {workflow && (
                  <span style={{
                    fontSize: 10,
                    padding: '2px 9px',
                    borderRadius: 100,
                    background: 'rgba(169,0,255,0.08)',
                    border: '1px solid rgba(169,0,255,0.2)',
                    color: accent,
                    fontWeight: 600,
                    fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace',
                  }}>
                    {workflow.workflow_id}
                  </span>
                )}
              </div>
              <p style={{
                fontSize: 13,
                color: textDim,
                margin: '3px 0 0',
              }}>
                {workflow?.description || 'No description'}
                {workflow?.project_slug && (
                  <span style={{ marginLeft: 8, opacity: 0.6 }}>
                    &middot; {workflow.project_slug}
                  </span>
                )}
              </p>
            </div>
          </div>
          <button
            onClick={handleNewWorkflow}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 7,
              padding: '8px 18px',
              borderRadius: 9,
              border: 'none',
              background: 'linear-gradient(135deg, #00e5ff, #a900ff)',
              color: '#fff',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            <i className="bx bx-plus" style={{ fontSize: 16 }} />
            New Workflow
          </button>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          gap: 0,
          borderBottom: `1px solid ${borderColor}`,
        }}>
          {TABS.map(tab => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '10px 18px',
                  border: 'none',
                  borderBottom: isActive ? `2px solid ${accent}` : '2px solid transparent',
                  background: 'transparent',
                  color: isActive ? textPrimary : textDim,
                  fontSize: 13,
                  fontWeight: isActive ? 600 : 500,
                  cursor: 'pointer',
                  transition: 'color 0.15s, border-color 0.15s',
                  marginBottom: -1,
                }}
              >
                <i className={`bx ${tab.icon}`} style={{ fontSize: 15 }} />
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab content */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '24px 28px',
      }}>
        {activeTab === 'overview' && workflow && <OverviewTab workflow={workflow} />}
        {activeTab === 'states' && workflow && <StatesTab workflow={workflow} />}
        {activeTab === 'transitions' && workflow && <TransitionsTab workflow={workflow} />}
        {activeTab === 'gates' && workflow && <GatesTab workflow={workflow} />}
        {activeTab === 'settings' && workflow && <SettingsTab workflow={workflow} />}

        {/* Workflow not found */}
        {!workflow && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            paddingTop: 80,
            gap: 12,
          }}>
            <i className="bx bx-error-circle" style={{ fontSize: 40, color: textDim, opacity: 0.4 }} />
            <div style={{ fontSize: 15, fontWeight: 600, color: textMuted }}>Workflow not found</div>
            <div style={{ fontSize: 13, color: textDim }}>
              The workflow with ID &quot;{selectedId}&quot; does not exist.
            </div>
            <button
              onClick={() => router.push('/workflows')}
              style={{
                marginTop: 8,
                padding: '8px 18px',
                borderRadius: 8,
                border: `1px solid ${borderColor}`,
                background: 'transparent',
                color: textMuted,
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              Back to Workflows
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Overview Tab ──────────────────────────────────────────────

function OverviewTab({ workflow }: { workflow: Workflow }) {
  const states = workflow.states || {}
  const transitions = workflow.transitions || []
  const gates = workflow.gates || {}

  const terminalCount = Object.values(states).filter(s => s.terminal).length
  const activeCount = Object.values(states).filter(s => s.active_work).length
  const gatedTransitions = transitions.filter(t => t.gate)

  const cards: { label: string; value: string; icon: string; color: string }[] = [
    { label: 'States', value: String(Object.keys(states).length), icon: 'bx-category', color: '#00e5ff' },
    { label: 'Transitions', value: String(transitions.length), icon: 'bx-transfer-alt', color: '#6366f1' },
    { label: 'Gates', value: String(Object.keys(gates).length), icon: 'bx-shield-quarter', color: '#f59e0b' },
    { label: 'Initial State', value: states[workflow.initial_state]?.label || workflow.initial_state, icon: 'bx-play-circle', color: '#22c55e' },
  ]

  return (
    <div>
      {/* Stats grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: 12,
        marginBottom: 28,
      }}>
        {cards.map(card => (
          <div key={card.label} style={{
            padding: '16px 18px',
            borderRadius: 10,
            border: `1px solid ${borderColor}`,
            background: bgAlt,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <i className={`bx ${card.icon}`} style={{ fontSize: 15, color: card.color }} />
              <span style={{
                fontSize: 11, fontWeight: 600, color: textDim,
                letterSpacing: '0.04em', textTransform: 'uppercase',
              }}>
                {card.label}
              </span>
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, color: textPrimary, letterSpacing: '-0.01em' }}>
              {card.value}
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
        <div style={{
          flex: 1, padding: '14px 18px', borderRadius: 10,
          border: `1px solid ${borderColor}`, background: bgAlt,
        }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: textDim, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 8 }}>
            State Summary
          </div>
          <div style={{ fontSize: 13, color: textMuted, lineHeight: 1.8 }}>
            <span style={{ color: '#22c55e', fontWeight: 600 }}>{activeCount}</span> active work states &middot;{' '}
            <span style={{ color: '#6366f1', fontWeight: 600 }}>{terminalCount}</span> terminal &middot;{' '}
            <span style={{ color: '#f59e0b', fontWeight: 600 }}>{gatedTransitions.length}</span> gated transitions
          </div>
        </div>
      </div>

      {/* Description */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: textDim, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 10 }}>
          Description
        </div>
        <div style={{
          padding: '14px 18px', borderRadius: 10,
          border: `1px solid ${borderColor}`, background: bgAlt,
          fontSize: 13, color: textMuted, lineHeight: 1.6,
        }}>
          {workflow.description || 'No description provided.'}
        </div>
      </div>

      {/* Metadata */}
      <div style={{
        display: 'flex', gap: 20, fontSize: 12, color: textDim,
        paddingTop: 16, borderTop: `1px solid ${borderColor}`,
      }}>
        <span>
          <i className="bx bx-calendar" style={{ fontSize: 13, marginRight: 5, verticalAlign: -1 }} />
          Created {new Date(workflow.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </span>
        <span style={{ opacity: 0.3 }}>|</span>
        <span>
          <i className="bx bx-edit" style={{ fontSize: 13, marginRight: 5, verticalAlign: -1 }} />
          Updated {new Date(workflow.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </span>
      </div>
    </div>
  )
}

// ── States Tab ────────────────────────────────────────────────

function StatesTab({ workflow }: { workflow: Workflow }) {
  const states = workflow.states || {}
  const entries = Object.entries(states)

  if (entries.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 80, gap: 12 }}>
        <i className="bx bx-category" style={{ fontSize: 44, color: textDim, opacity: 0.35 }} />
        <div style={{ fontSize: 15, fontWeight: 600, color: textMuted }}>No states defined</div>
      </div>
    )
  }

  return (
    <div>
      <div style={{
        fontSize: 11, fontWeight: 600, color: textDim,
        letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 18,
      }}>
        Workflow States ({entries.length})
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10 }}>
        {entries.map(([id, state]) => {
          const sc = stateColor(state)
          const isInitial = id === workflow.initial_state
          return (
            <div key={id} style={{
              padding: '14px 18px', borderRadius: 10,
              border: `1px solid ${sc.border}`, background: sc.bg,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: sc.text }}>{state.label}</span>
                {isInitial && (
                  <span style={{
                    fontSize: 9, padding: '1px 6px', borderRadius: 100,
                    background: 'rgba(34,197,94,0.15)', color: '#22c55e',
                    fontWeight: 700, letterSpacing: '0.04em',
                  }}>
                    INITIAL
                  </span>
                )}
              </div>
              <div style={{
                fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace',
                fontSize: 11, color: textDim, marginBottom: 8,
              }}>
                {id}
              </div>
              <div style={{ display: 'flex', gap: 8, fontSize: 11, color: textDim }}>
                {state.terminal && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <i className="bx bx-check-circle" style={{ fontSize: 12, color: '#6366f1' }} />
                    Terminal
                  </span>
                )}
                {state.active_work && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <i className="bx bx-code-alt" style={{ fontSize: 12, color: '#22c55e' }} />
                    Active Work
                  </span>
                )}
                {!state.terminal && !state.active_work && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <i className="bx bx-pause-circle" style={{ fontSize: 12 }} />
                    Waiting
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Transitions Tab ───────────────────────────────────────────

function TransitionsTab({ workflow }: { workflow: Workflow }) {
  const transitions = workflow.transitions || []
  const states = workflow.states || {}
  const gates = workflow.gates || {}

  if (transitions.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 80, gap: 12 }}>
        <i className="bx bx-transfer-alt" style={{ fontSize: 44, color: textDim, opacity: 0.35 }} />
        <div style={{ fontSize: 15, fontWeight: 600, color: textMuted }}>No transitions defined</div>
      </div>
    )
  }

  return (
    <div>
      <div style={{
        fontSize: 11, fontWeight: 600, color: textDim,
        letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 18,
      }}>
        Transitions ({transitions.length})
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {transitions.map((t, idx) => {
          const fromLabel = states[t.from]?.label || t.from
          const toLabel = states[t.to]?.label || t.to
          const gate = t.gate ? gates[t.gate] : null
          const hasGate = !!t.gate

          return (
            <div key={idx} style={{
              padding: '14px 18px', borderRadius: 10,
              border: `1px solid ${borderColor}`, background: bgAlt,
              display: 'flex', alignItems: 'center', gap: 14,
            }}>
              {/* From state */}
              <span style={{
                fontSize: 13, fontWeight: 600, color: textPrimary,
                padding: '4px 10px', borderRadius: 6,
                background: 'rgba(120,120,120,0.08)', border: `1px solid ${borderColor}`,
              }}>
                {fromLabel}
              </span>

              {/* Arrow */}
              <i className="bx bx-right-arrow-alt" style={{ fontSize: 18, color: textDim, flexShrink: 0 }} />

              {/* To state */}
              <span style={{
                fontSize: 13, fontWeight: 600, color: textPrimary,
                padding: '4px 10px', borderRadius: 6,
                background: 'rgba(120,120,120,0.08)', border: `1px solid ${borderColor}`,
              }}>
                {toLabel}
              </span>

              {/* Gate badge */}
              <div style={{ flex: 1 }} />
              {hasGate ? (
                <span style={{
                  fontSize: 11, padding: '3px 10px', borderRadius: 6,
                  background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)',
                  color: '#f59e0b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5,
                }}>
                  <i className="bx bx-shield-quarter" style={{ fontSize: 12 }} />
                  {gate?.label || t.gate}
                </span>
              ) : (
                <span style={{ fontSize: 11, color: textDim, fontStyle: 'italic' }}>Free</span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Gates Tab ─────────────────────────────────────────────────

function GatesTab({ workflow }: { workflow: Workflow }) {
  const gates = workflow.gates || {}
  const entries = Object.entries(gates)

  if (entries.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 80, gap: 12 }}>
        <i className="bx bx-shield-quarter" style={{ fontSize: 44, color: textDim, opacity: 0.35 }} />
        <div style={{ fontSize: 15, fontWeight: 600, color: textMuted }}>No gates defined</div>
        <div style={{ fontSize: 13, color: textDim }}>
          All transitions are free (no evidence required).
        </div>
      </div>
    )
  }

  return (
    <div>
      <div style={{
        fontSize: 11, fontWeight: 600, color: textDim,
        letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 18,
      }}>
        Gates ({entries.length})
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {entries.map(([id, gate]) => (
          <div key={id} style={{
            padding: '18px 20px', borderRadius: 10,
            border: `1px solid ${borderColor}`, background: bgAlt,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <i className="bx bx-shield-quarter" style={{ fontSize: 16, color: '#f59e0b' }} />
              <span style={{ fontSize: 14, fontWeight: 700, color: textPrimary }}>{gate.label}</span>
              <span style={{
                fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace',
                fontSize: 10, padding: '1px 6px', borderRadius: 4,
                background: 'rgba(120,120,120,0.08)', color: textDim,
              }}>
                {id}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12, color: textMuted }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontWeight: 600, color: textDim, minWidth: 110 }}>Required section:</span>
                <code style={{
                  padding: '2px 8px', borderRadius: 4,
                  background: 'rgba(169,0,255,0.06)', border: `1px solid rgba(169,0,255,0.15)`,
                  color: accent, fontSize: 12,
                }}>
                  {gate.required_section}
                </code>
              </div>

              {gate.file_patterns && gate.file_patterns.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontWeight: 600, color: textDim, minWidth: 110 }}>File patterns:</span>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {gate.file_patterns.map((p, i) => (
                      <code key={i} style={{
                        padding: '1px 6px', borderRadius: 4,
                        background: 'rgba(120,120,120,0.08)', fontSize: 11,
                      }}>
                        {p}
                      </code>
                    ))}
                  </div>
                </div>
              )}

              {gate.skippable_for && gate.skippable_for.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontWeight: 600, color: textDim, minWidth: 110 }}>Skippable for:</span>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {gate.skippable_for.map((k, i) => (
                      <span key={i} style={{
                        fontSize: 10, padding: '2px 8px', borderRadius: 100,
                        background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)',
                        color: '#22c55e', fontWeight: 600,
                      }}>
                        {k}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Settings Tab ──────────────────────────────────────────────

function SettingsTab({ workflow }: { workflow: Workflow }) {
  return (
    <div>
      <div style={{
        fontSize: 11, fontWeight: 600, color: textDim,
        letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 18,
      }}>
        Workflow Settings
      </div>

      {/* Name */}
      <div style={{ marginBottom: 18 }}>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: textDim, marginBottom: 6 }}>
          Name
        </label>
        <input
          defaultValue={workflow.name}
          style={{
            width: '100%', padding: '9px 12px', borderRadius: 9,
            border: `1px solid ${borderColor}`, background: bgAlt,
            color: textPrimary, fontSize: 13, outline: 'none', boxSizing: 'border-box' as const,
          }}
        />
      </div>

      {/* Description */}
      <div style={{ marginBottom: 18 }}>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: textDim, marginBottom: 6 }}>
          Description
        </label>
        <textarea
          defaultValue={workflow.description}
          rows={3}
          style={{
            width: '100%', padding: '9px 12px', borderRadius: 9,
            border: `1px solid ${borderColor}`, background: bgAlt,
            color: textPrimary, fontSize: 13, outline: 'none',
            boxSizing: 'border-box' as const, resize: 'vertical' as const, lineHeight: 1.6,
          }}
        />
      </div>

      {/* Initial State */}
      <div style={{ marginBottom: 18 }}>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: textDim, marginBottom: 6 }}>
          Initial State
        </label>
        <div style={{
          padding: '9px 12px', borderRadius: 9,
          border: `1px solid ${borderColor}`, background: bgAlt,
          color: textMuted, fontSize: 13,
        }}>
          {workflow.states?.[workflow.initial_state]?.label || workflow.initial_state}
        </div>
      </div>

      {/* Default toggle */}
      <div style={{ marginBottom: 24 }}>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: textDim, marginBottom: 6 }}>
          Default Workflow
        </label>
        <div style={{
          padding: '9px 12px', borderRadius: 9,
          border: `1px solid ${borderColor}`, background: bgAlt,
          color: textMuted, fontSize: 13,
        }}>
          {workflow.is_default ? 'Yes — this is the default workflow for the project' : 'No'}
        </div>
      </div>

      {/* Danger zone */}
      <div style={{ paddingTop: 20, borderTop: `1px solid ${borderColor}` }}>
        <div style={{
          fontSize: 11, fontWeight: 600, color: '#ef4444',
          letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 12,
        }}>
          Danger Zone
        </div>
        <button style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '8px 16px', borderRadius: 8,
          border: '1px solid rgba(239,68,68,0.2)',
          background: 'rgba(239,68,68,0.06)',
          color: '#ef4444', fontSize: 13, fontWeight: 500, cursor: 'pointer',
        }}>
          <i className="bx bx-trash" style={{ fontSize: 14 }} />
          Delete Workflow
        </button>
      </div>
    </div>
  )
}
