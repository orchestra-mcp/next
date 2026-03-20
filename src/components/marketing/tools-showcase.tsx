'use client'
import { useState } from 'react'

interface ToolCard {
  name: string
  desc: string
  icon: string
}

const CATEGORIES: { label: string; count: string; tools: ToolCard[] }[] = [
  {
    label: 'Workflow', count: '34',
    tools: [
      { name: 'create_feature', desc: 'Create a gated feature with lifecycle tracking', icon: 'bx-plus-circle' },
      { name: 'advance_feature', desc: 'Move feature through gates with evidence', icon: 'bx-right-arrow-circle' },
      { name: 'create_plan', desc: 'Plan large tasks with dependency breakdown', icon: 'bx-map' },
      { name: 'create_bug_report', desc: 'File a bug linked to a parent feature', icon: 'bx-bug' },
      { name: 'submit_review', desc: 'Complete review cycle with user approval', icon: 'bx-check-shield' },
      { name: 'git_quick_commit', desc: 'Stage, commit, and push with person profile', icon: 'bxl-git' },
    ],
  },
  {
    label: 'DevTools', count: '110+',
    tools: [
      { name: 'db_query', desc: 'Run SQL against connected databases', icon: 'bx-data' },
      { name: 'log_run', desc: 'Start background scripts with live tailing', icon: 'bx-terminal' },
      { name: 'api_request', desc: 'HTTP/WebSocket testing with saved collections', icon: 'bx-cloud' },
      { name: 'docker_compose_up', desc: 'Manage Docker containers and compose stacks', icon: 'bxl-docker' },
      { name: 'ssh_connect', desc: 'Remote server management over SSH', icon: 'bx-server' },
      { name: 'test_run', desc: 'Execute test suites with assertion evaluation', icon: 'bx-test-tube' },
    ],
  },
  {
    label: 'AI Bridges', count: '25',
    tools: [
      { name: 'ai_prompt', desc: 'Send prompts to Claude, GPT-4o, Gemini, Ollama', icon: 'bx-brain' },
      { name: 'run_agent', desc: 'Execute defined AI agents with tool access', icon: 'bx-bot' },
      { name: 'run_workflow', desc: 'Chain multi-step agent pipelines', icon: 'bx-git-branch' },
      { name: 'compare_providers', desc: 'Benchmark prompt across all AI providers', icon: 'bx-bar-chart-alt-2' },
      { name: 'search_memory', desc: 'RAG search with cosine similarity', icon: 'bx-search-alt' },
      { name: 'index_directory', desc: 'Bulk codebase indexing with .gitignore support', icon: 'bx-folder-open' },
    ],
  },
  {
    label: 'Marketplace', count: '15',
    tools: [
      { name: 'pack_install', desc: 'Install content packs with skills and agents', icon: 'bx-package' },
      { name: 'pack_recommend', desc: 'AI-powered pack suggestions for your stack', icon: 'bx-bulb' },
      { name: 'pack_search', desc: 'Search the marketplace by keyword or stack', icon: 'bx-search' },
      { name: 'detect_stacks', desc: 'Auto-detect project languages and frameworks', icon: 'bx-scan' },
      { name: 'create_prompt', desc: 'Save reusable prompts for quick actions', icon: 'bx-message-square-dots' },
      { name: 'list_prompts', desc: 'Browse and manage saved prompt library', icon: 'bx-list-ul' },
    ],
  },
]

const TERMINAL_SAMPLES: Record<string, { cmd: string; response: string[] }> = {
  Workflow: {
    cmd: 'advance_feature({ id: "FEAT-42", evidence: "## Changes\\n- src/auth.ts" })',
    response: ['Gate: Code Complete ✓', 'Status: in-progress → in-testing', 'Session lock: active'],
  },
  DevTools: {
    cmd: 'db_query({ sql: "SELECT count(*) FROM users WHERE active" })',
    response: ['Connected: postgresql://localhost:5432/app', '┌─────────┐', '│  12,847  │', '└─────────┘', 'Query time: 3ms'],
  },
  'AI Bridges': {
    cmd: 'compare_providers({ prompt: "Explain QUIC transport", providers: ["claude","openai","gemini"] })',
    response: ['claude   → 1.2s  quality: 0.94', 'openai   → 0.8s  quality: 0.91', 'gemini   → 0.6s  quality: 0.88'],
  },
  Marketplace: {
    cmd: 'pack_install({ name: "go" })',
    response: ['Installing orchestra-mcp/pack-go v0.2.0...', '  + 4 skills, 2 agents, 1 hook', '  Stack: go (detected)', 'Pack installed successfully ✓'],
  },
}

export function ToolsShowcase() {
  const [active, setActive] = useState(0)
  const cat = CATEGORIES[active]
  const sample = TERMINAL_SAMPLES[cat.label]

  return (
    <section style={{ padding: '80px 32px', maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '4px 12px', borderRadius: 100,
          border: '1px solid rgba(0,229,255,0.25)',
          background: 'rgba(0,229,255,0.06)',
          marginBottom: 20, fontSize: 12, fontWeight: 600,
          color: '#00e5ff', letterSpacing: '0.04em', textTransform: 'uppercase',
        }}>
          300+ MCP Tools
        </div>
        <h2 style={{
          fontSize: 'clamp(24px, 3.5vw, 38px)', fontWeight: 700,
          letterSpacing: '-0.03em', marginBottom: 14,
          color: 'var(--color-fg, #f8f8f8)',
        }}>
          Every tool your IDE needs
        </h2>
        <p style={{
          fontSize: 16, maxWidth: 500, margin: '0 auto',
          color: 'var(--color-fg-muted, rgba(255,255,255,0.45))',
        }}>
          From feature workflows to database queries — all accessible via MCP protocol.
        </p>
      </div>

      {/* Tabs */}
      <div className="tools-tabs" style={{
        display: 'flex', justifyContent: 'center', gap: 8,
        marginBottom: 40, flexWrap: 'wrap',
      }}>
        {CATEGORIES.map((c, i) => (
          <button
            key={c.label}
            onClick={() => setActive(i)}
            style={{
              padding: '8px 20px', borderRadius: 100, fontSize: 13, fontWeight: 600,
              border: i === active ? '1px solid rgba(0,229,255,0.4)' : '1px solid var(--color-border, rgba(255,255,255,0.07))',
              background: i === active ? 'rgba(0,229,255,0.08)' : 'transparent',
              color: i === active ? '#00e5ff' : 'var(--color-fg-muted, rgba(255,255,255,0.45))',
              cursor: 'pointer', transition: 'all 0.2s',
            }}
          >
            {c.label} ({c.count})
          </button>
        ))}
      </div>

      {/* Content: tools grid + terminal */}
      <div className="tools-layout" style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, alignItems: 'start',
      }}>
        {/* Tool cards */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12,
        }}>
          {cat.tools.map(tool => (
            <div key={tool.name} style={{
              padding: '16px', borderRadius: 12,
              border: '1px solid var(--color-border, rgba(255,255,255,0.07))',
              background: 'var(--color-bg-alt, rgba(255,255,255,0.03))',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <i className={`bx ${tool.icon}`} style={{ fontSize: 16, color: '#00e5ff' }} />
                <span style={{
                  fontSize: 12.5, fontWeight: 600, fontFamily: 'JetBrains Mono, monospace',
                  color: 'var(--color-fg, #f8f8f8)',
                }}>{tool.name}</span>
              </div>
              <p style={{
                fontSize: 12, lineHeight: 1.5, margin: 0,
                color: 'var(--color-fg-muted, rgba(255,255,255,0.45))',
              }}>{tool.desc}</p>
            </div>
          ))}
        </div>

        {/* Terminal preview */}
        <div style={{
          borderRadius: 14, overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.08)',
          background: 'rgba(22,18,28,0.97)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
        }}>
          <div style={{
            padding: '10px 16px',
            background: 'rgba(255,255,255,0.03)',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            display: 'flex', gap: 6,
          }}>
            {['#ff5f57', '#febc2e', '#28c840'].map(c => (
              <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />
            ))}
          </div>
          <div style={{
            padding: '20px 24px',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 12.5, lineHeight: 1.9,
          }}>
            <div style={{ color: '#00e5ff' }}>$ {sample.cmd}</div>
            {sample.response.map((line, i) => (
              <div key={i} style={{ color: '#d0d0d0' }}>{line}</div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .tools-layout { grid-template-columns: 1fr !important; }
          .tools-layout > div:first-child { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 640px) {
          .tools-tabs { gap: 6px !important; }
          .tools-tabs button { padding: 6px 14px !important; font-size: 12px !important; }
        }
      `}</style>
    </section>
  )
}
