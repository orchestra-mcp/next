"use client";

import type { ReactNode } from 'react';
import { useState, useRef, useCallback, useMemo } from 'react';
import type { ChatMessage as ChatMessageType, MessageAction } from '../types/message';
import type { ClaudeCodeEvent } from '../types/events';
import type { ContextMenuAction } from '../ChatMessageContextMenu';
import { ChatMarkdown } from '../ChatMarkdown';
import { ChatStreamMessage } from '../ChatStreamMessage';
import { ChatThinkingMessage } from '../ChatThinkingMessage';
import { ChatMessageActions } from '../ChatMessageActions';
import { ChatMessageContextMenu } from '../ChatMessageContextMenu';
import { ChatMarkdown as EventMarkdown } from '../ChatMarkdown';
import { CodeEditor, CodeDiffEditor, languageFromFilename } from '@orchestra-mcp/editor';
import { BoxIcon } from '@orchestra-mcp/icons';
import { QuestionCard } from '../cards/QuestionCard';
import { PermissionCard } from '../cards/PermissionCard';
import type { QuestionEvent, PermissionEvent } from '../types/events';
import './ChatMessage.css';

/** Orchestra logo SVG for tool avatars */
const OrchestraLogoSvg = () => (
  <svg viewBox="0 0 725 725" width="16" height="16" fill="none">
    <defs><linearGradient id="ta-orch" x1="672" y1="600" x2="188" y2="219" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#a900ff"/><stop offset="1" stopColor="#00e5ff"/></linearGradient></defs>
    <path fill="url(#ta-orch)" d="M670.75,54.19c-8.34-8.34-21.81-8.54-30.39-.45L61.86,599.32c-6.59,6.22-11.12,14.18-13.08,23.03-3.36,15.13,1.17,30.71,12.14,41.68,8.58,8.58,19.99,13.22,31.8,13.22,3.28,0,6.59-.36,9.87-1.09,8.84-1.96,16.81-6.49,23.03-13.08L671.19,84.58c8.09-8.58,7.9-22.05-.45-30.39Z"/>
    <path fill="url(#ta-orch)" d="M661.8,158.12l-54.6,57.88c25.67,42.78,40.44,92.88,40.44,146.41,0,157.51-127.72,285.23-285.23,285.23-47.55,0-92.41-11.64-131.84-32.28l-54.56,57.88c54.46,32.75,118.25,51.58,186.41,51.58,200.16,0,362.41-162.25,362.41-362.41,0-75.77-23.25-146.11-63.02-204.29ZM362.41,77.18c53.59,0,103.72,14.8,146.54,40.54l57.88-54.6C508.65,23.29,438.25,0,362.41,0,162.25,0,0,162.25,0,362.41c0,68.22,18.86,132.04,51.68,186.54l57.85-54.56c-20.67-39.46-32.35-84.36-32.35-131.98,0-157.51,127.72-285.23,285.23-285.23Z"/>
    <path fill="url(#ta-orch)" d="M362.41,130.87c-127.88,0-231.54,103.66-231.54,231.54,0,33.22,6.98,64.8,19.6,93.35l58.82-55.47c-3.02-12.15-4.6-24.83-4.6-37.89,0-87.11,70.6-157.72,157.72-157.72,16.31,0,32.01,2.48,46.81,7.05l58.79-55.44c-31.64-16.27-67.55-25.44-105.6-25.44ZM568.58,256.94l-55.47,58.82c4.56,14.73,7.01,30.4,7.01,46.64,0,87.11-70.6,157.72-157.72,157.72-12.99,0-25.64-1.58-37.72-4.53l-55.5,58.82c28.52,12.55,60.03,19.53,93.22,19.53,127.88,0,231.54-103.66,231.54-231.54,0-37.99-9.16-73.86-25.37-105.47Z"/>
  </svg>
);

/** Dynamic avatar for tool events — renders a 28px circle with tool-specific icon */
function ToolAvatar({ event }: { event: ClaudeCodeEvent }) {
  const isOrch = isOrchestraTool(event);
  if (isOrch) {
    return (
      <div className="chat-msg__avatar chat-msg__avatar--orchestra">
        <OrchestraLogoSvg />
      </div>
    );
  }
  const iconName = getEventIcon(event);
  return (
    <div className="chat-msg__avatar chat-msg__avatar--tool">
      <BoxIcon name={iconName || 'bx-cog'} size={16} />
    </div>
  );
}

/** Shorten a file path to just the filename (or last 2 segments if helpful) */
function shortPath(filePath: string): string {
  if (!filePath) return '';
  const parts = filePath.replace(/\\/g, '/').split('/').filter(Boolean);
  if (parts.length <= 2) return parts.join('/');
  return parts.slice(-2).join('/');
}

/** Detect whether a string likely contains markdown formatting */
function looksLikeMarkdown(text: string): boolean {
  if (!text || text.length < 10) return false;
  // Tables, headers, bold, lists, code blocks, links
  return /^\s*[|#]|\*\*|^\s*[-*+]\s|\n```|^\s*\d+\.\s/m.test(text);
}

/** Render markdown result text with optional collapse for long content */
function MarkdownResult({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  const lines = text.split('\n');
  const isLong = lines.length > 12;
  const display = isLong && !expanded ? lines.slice(0, 10).join('\n') : text;
  return (
    <div className="chat-msg__mcp-md-result">
      <EventMarkdown content={display} />
      {isLong && !expanded && (
        <button className="chat-msg__mcp-expand" onClick={() => setExpanded(true)}>
          Show all ({lines.length} lines)
        </button>
      )}
    </div>
  );
}

/** Try to parse a string as JSON, returning null on failure */
function tryParseJSON(text: string): any | null {
  try { return JSON.parse(text) } catch { return null }
}

/** Format a status badge with color dot */
function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    done: '#22c55e', active: '#3b82f6', todo: '#94a3b8', 'in-progress': '#f59e0b',
    'in-testing': '#a855f7', 'in-review': '#06b6d4', 'in-docs': '#ec4899',
    approved: '#22c55e', draft: '#94a3b8', completed: '#22c55e', running: '#f59e0b',
    paused: '#94a3b8', rejected: '#ef4444', 'needs-edits': '#f59e0b',
  };
  const color = colors[status?.toLowerCase()] || '#6b7280';
  return (
    <span className="chat-msg__status-badge" style={{ '--badge-color': color } as React.CSSProperties}>
      <span className="chat-msg__status-dot" />
      {status}
    </span>
  );
}

/** Small key-value pair display */
function InfoPair({ label, value }: { label: string; value: string | number | undefined }) {
  if (value === undefined || value === null || value === '') return null;
  return <span className="chat-msg__info-pair"><span className="chat-msg__info-label">{label}</span> {String(value)}</span>;
}

/**
 * Human-readable description of what an MCP tool is doing (input phase)
 * and what it returned (result phase).
 */
function McpToolContent({ toolName, args, resultText }: {
  toolName: string;
  args?: Record<string, unknown>;
  resultText?: string;
}) {
  const name = (toolName || '').replace(/^mcp__[^_]+__/, '').toLowerCase();

  // Parse result if available
  const result = resultText ? tryParseJSON(resultText) : null;

  // ── Feature tools ──
  if (name === 'get_feature' || name === 'search_features' || name === 'list_features') {
    // Markdown result (tables of features) — render fully
    if (resultText && !result && looksLikeMarkdown(resultText)) return <MarkdownResult text={resultText} />;
    if (result) {
      // Single feature
      if (result.id && result.title) {
        return (
          <div className="chat-msg__mcp-result">
            <div className="chat-msg__mcp-row">
              <strong>{result.id}</strong> <span>{result.title}</span>
              {result.status && <StatusBadge status={result.status} />}
            </div>
            {result.kind && <InfoPair label="Kind" value={result.kind} />}
            {result.assignee && <InfoPair label="Assignee" value={result.assignee} />}
            {result.priority && <InfoPair label="Priority" value={result.priority} />}
          </div>
        );
      }
      // Feature list (from markdown table or JSON array)
      if (Array.isArray(result)) {
        return (
          <div className="chat-msg__mcp-result">
            <div className="chat-msg__mcp-summary">{result.length} feature{result.length !== 1 ? 's' : ''} found</div>
            {result.slice(0, 8).map((f: any, i: number) => (
              <div key={i} className="chat-msg__mcp-row">
                <code>{f.id}</code> <span>{f.title || f.name}</span>
                {f.status && <StatusBadge status={f.status} />}
              </div>
            ))}
            {result.length > 8 && <div className="chat-msg__mcp-more">+{result.length - 8} more</div>}
          </div>
        );
      }
    }
    // Input phase
    if (args?.query) return <span>Searching features: <em>"{String(args.query)}"</em></span>;
    if (args?.feature_id) return <span>Loading feature <code>{String(args.feature_id)}</code></span>;
    if (args?.status) return <span>Listing <strong>{String(args.status)}</strong> features</span>;
    return <span>Listing features</span>;
  }

  if (name === 'create_feature') {
    if (result?.id) {
      return (
        <div className="chat-msg__mcp-result">
          <div className="chat-msg__mcp-row">
            Created <strong>{result.id}</strong>: {result.title || args?.title || ''}
            {result.kind && <StatusBadge status={result.kind} />}
          </div>
        </div>
      );
    }
    return <span>Creating feature: <strong>{String(args?.title || '')}</strong></span>;
  }

  if (name === 'advance_feature') {
    if (resultText && !result) return looksLikeMarkdown(resultText) ? <MarkdownResult text={resultText} /> : <span className="chat-msg__mcp-text">{truncate(resultText, 200)}</span>;
    return <span>Advancing feature <code>{String(args?.feature_id || '')}</code></span>;
  }

  if (name === 'set_current_feature') {
    return <span>Starting work on <code>{String(args?.feature_id || '')}</code></span>;
  }

  if (name === 'submit_review') {
    const decision = args?.status || args?.decision;
    return <span>Submitting review: <strong>{String(decision || '')}</strong></span>;
  }

  // ── Project tools ──
  if (name === 'get_project_status' || name === 'get_project_mode') {
    // Markdown result (tables, lists) — render fully
    if (resultText && looksLikeMarkdown(resultText)) return <MarkdownResult text={resultText} />;
    if (result) {
      const title = result.name || result.project || result.title || '';
      return (
        <div className="chat-msg__mcp-result">
          {title && <div className="chat-msg__mcp-row"><strong>{title}</strong></div>}
          {result.mode && <InfoPair label="Mode" value={result.mode} />}
          {result.features_count != null && <InfoPair label="Features" value={result.features_count} />}
          {result.total != null && <InfoPair label="Total" value={result.total} />}
          {result.in_progress != null && <InfoPair label="In Progress" value={result.in_progress} />}
          {result.done != null && <InfoPair label="Done" value={result.done} />}
        </div>
      );
    }
    return <span>Getting project status</span>;
  }

  if (name === 'list_projects') {
    if (result && Array.isArray(result)) {
      return (
        <div className="chat-msg__mcp-result">
          <div className="chat-msg__mcp-summary">{result.length} project{result.length !== 1 ? 's' : ''}</div>
          {result.slice(0, 6).map((p: any, i: number) => (
            <div key={i} className="chat-msg__mcp-row"><span>{p.name || p.id || p}</span></div>
          ))}
          {result.length > 6 && <div className="chat-msg__mcp-more">+{result.length - 6} more</div>}
        </div>
      );
    }
    // Result might be markdown text (tables, lists)
    if (resultText && !result) {
      if (looksLikeMarkdown(resultText)) return <MarkdownResult text={resultText} />;
    }
    return <span>Listing projects</span>;
  }

  // ── Plan tools ──
  if (name === 'create_plan') {
    if (result?.id) return <span>Created plan <strong>{result.id}</strong>: {result.title || String(args?.title || '')}</span>;
    return <span>Creating plan: <strong>{String(args?.title || '')}</strong></span>;
  }
  if (name === 'approve_plan') return <span>Approving plan <code>{String(args?.plan_id || '')}</code></span>;
  if (name === 'breakdown_plan') return <span>Breaking down plan into features</span>;
  if (name === 'complete_plan') return <span>Completing plan <code>{String(args?.plan_id || '')}</code></span>;

  // ── Person / User tools ──
  if (name === 'get_current_user' || name === 'get_person') {
    if (result?.name) {
      return (
        <div className="chat-msg__mcp-result">
          <div className="chat-msg__mcp-row"><strong>{result.name}</strong> {result.role ? `(${result.role})` : ''}</div>
          {result.email && <InfoPair label="Email" value={result.email} />}
        </div>
      );
    }
    return <span>{name === 'get_current_user' ? 'Getting current user' : `Loading person ${args?.person_id || ''}`}</span>;
  }

  if (name === 'set_current_user') return <span>Setting current user to <code>{String(args?.person_id || '')}</code></span>;
  if (name === 'create_person') return <span>Creating person: <strong>{String(args?.name || '')}</strong></span>;

  // ── Git tools ──
  if (name === 'git_status_summary') {
    if (resultText) return looksLikeMarkdown(resultText) ? <MarkdownResult text={resultText} /> : <span className="chat-msg__mcp-text">{truncate(resultText, 200)}</span>;
    return <span>Checking git status</span>;
  }
  if (name === 'git_quick_commit') return <span>Committing changes{args?.message ? `: ${truncate(String(args.message), 80)}` : ''}</span>;
  if (name === 'git_push') return <span>Pushing to remote</span>;
  if (name === 'git_pull') return <span>Pulling latest changes</span>;
  if (name === 'git_create_branch') return <span>Creating branch <code>{String(args?.name || args?.branch || '')}</code></span>;
  if (name === 'git_merge_branch') return <span>Merging branch <code>{String(args?.branch || '')}</code></span>;

  // ── Notes tools ──
  if (name === 'create_note' || name === 'save_note') return <span>Saving note: <strong>{String(args?.title || '')}</strong></span>;
  if (name === 'search_notes') return <span>Searching notes: <em>"{String(args?.query || '')}"</em></span>;
  if (name === 'list_notes') return <span>Listing notes</span>;

  // ── Session tools ──
  if (name === 'create_session') return <span>Creating session: <strong>{String(args?.name || 'new session')}</strong></span>;
  if (name === 'get_session') return <span>Loading session <code>{truncate(String(args?.session_id || ''), 12)}</code></span>;
  if (name === 'send_message') return <span>Sending message to session</span>;
  if (name === 'list_sessions') return <span>Listing sessions</span>;

  // ── Workflow tools ──
  if (name === 'get_workflow_status') {
    if (resultText) return looksLikeMarkdown(resultText) ? <MarkdownResult text={resultText} /> : <span className="chat-msg__mcp-text">{truncate(resultText, 200)}</span>;
    return <span>Getting workflow status</span>;
  }
  if (name === 'get_gate_requirements') return <span>Checking gate requirements</span>;
  if (name === 'check_wip_limit') return <span>Checking WIP limits</span>;

  // ── Marketplace / Pack tools ──
  if (name === 'search_packs' || name === 'list_packs') return <span>Browsing marketplace{args?.query ? `: "${args.query}"` : ''}</span>;
  if (name === 'install_pack') return <span>Installing pack <strong>{String(args?.pack_id || '')}</strong></span>;
  if (name === 'recommend_packs') return <span>Getting pack recommendations</span>;

  // ── Discovery / Experiment tools ──
  if (name.startsWith('create_discovery') || name.startsWith('create_experiment'))
    return <span>Creating {name.includes('discovery') ? 'discovery cycle' : 'experiment'}</span>;
  if (name.startsWith('create_hypothesis'))
    return <span>Creating hypothesis: <strong>{String(args?.title || '')}</strong></span>;

  // ── Doc tools ──
  if (name.startsWith('doc_')) {
    const action = name.replace('doc_', '');
    if (action === 'search') return <span>Searching docs: <em>"{String(args?.query || '')}"</em></span>;
    if (action === 'create') return <span>Creating doc: <strong>{String(args?.title || '')}</strong></span>;
    if (action === 'get') return <span>Reading doc <code>{String(args?.path || args?.doc_id || '')}</code></span>;
    return <span>{action.charAt(0).toUpperCase() + action.slice(1)}ing documentation</span>;
  }

  // ── Request tools ──
  if (name === 'create_request') return <span>Creating request: <strong>{String(args?.title || '')}</strong></span>;
  if (name === 'get_next_request') return <span>Getting next queued request</span>;
  if (name === 'convert_request') return <span>Converting request to feature</span>;
  if (name === 'list_requests') return <span>Listing requests</span>;

  // ── ToolSearch (Claude's tool discovery) ──
  if (name === 'toolsearch') {
    if (resultText) return looksLikeMarkdown(resultText) ? <MarkdownResult text={resultText} /> : <span className="chat-msg__mcp-text">{truncate(resultText, 150)}</span>;
    return <span>Searching tools: <em>"{String(args?.query || '')}"</em></span>;
  }

  // ── Dependency / Label / Sync tools ──
  if (name === 'add_dependency') return <span>Adding dependency: <code>{String(args?.feature_id || '')}</code> → <code>{String(args?.depends_on || '')}</code></span>;
  if (name === 'add_labels') return <span>Adding labels to <code>{String(args?.feature_id || '')}</code></span>;
  if (name === 'sync_now') return <span>Syncing to cloud</span>;
  if (name === 'sync_status') return <span>Checking sync status</span>;

  // ── Account / Budget tools ──
  if (name === 'get_account' || name === 'list_accounts') {
    if (result?.name || result?.id) return <span>{result.name || result.id} ({result.provider || 'claude'})</span>;
    return <span>{name === 'list_accounts' ? 'Listing accounts' : 'Getting account info'}</span>;
  }
  if (name === 'check_budget') return <span>Checking budget for <code>{String(args?.account_id || '')}</code></span>;

  // ── Sprint / Assignment tools ──
  if (name.includes('assign')) return <span>Managing assignment for <code>{String(args?.feature_id || '')}</code></span>;
  if (name.includes('sprint') || name === 'get_progress') return <span>Checking sprint progress</span>;

  // ── Generic: show result if available, otherwise show args ──
  if (resultText) {
    // If result is markdown (tables, headers, lists), render as markdown
    if (looksLikeMarkdown(resultText)) return <MarkdownResult text={resultText} />;
    const parsed = result;
    // If result is a JSON object with a clear summary field, show it
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      const summary = parsed.message || parsed.summary || parsed.status || parsed.result;
      if (summary && typeof summary === 'string') {
        return looksLikeMarkdown(String(summary)) ? <MarkdownResult text={String(summary)} /> : <span className="chat-msg__mcp-text">{truncate(summary, 200)}</span>;
      }
    }
    return <span className="chat-msg__mcp-text">{truncate(resultText, 200)}</span>;
  }

  // Fallback: show humanized args
  if (args && Object.keys(args).length > 0) {
    const parts: string[] = [];
    const priority = ['title', 'name', 'query', 'message', 'feature_id', 'project_id', 'session_id'];
    for (const key of priority) {
      if (args[key]) {
        const val = String(args[key]);
        parts.push(val.length > 60 ? val.slice(0, 57) + '...' : val);
        break;
      }
    }
    if (parts.length === 0) {
      const first = Object.entries(args).find(([, v]) => v !== undefined && v !== null && v !== '');
      if (first) parts.push(`${first[0]}: ${truncate(String(first[1]), 50)}`);
    }
    return <span>{parts.join(' ')}</span>;
  }

  return null;
}

function truncate(s: string, max: number): string {
  if (!s) return '';
  return s.length > max ? s.slice(0, max - 3) + '...' : s;
}

// ---- Lightweight ANSI → React spans (reused from BashCard) ----

interface AnsiSpan { text: string; fg?: string; bg?: string; bold?: boolean; dim?: boolean; italic?: boolean; underline?: boolean; }

const ANSI_COLORS: Record<number, string> = {
  30: '#1e1e1e', 31: '#e06c75', 32: '#98c379', 33: '#e5c07b',
  34: '#61afef', 35: '#c678dd', 36: '#56b6c2', 37: '#abb2bf',
  90: '#5c6370', 91: '#e06c75', 92: '#98c379', 93: '#e5c07b',
  94: '#61afef', 95: '#c678dd', 96: '#56b6c2', 97: '#ffffff',
};
const ANSI_BG_COLORS: Record<number, string> = {
  40: '#1e1e1e', 41: '#e06c75', 42: '#98c379', 43: '#e5c07b',
  44: '#61afef', 45: '#c678dd', 46: '#56b6c2', 47: '#abb2bf',
};

function parseAnsi(text: string): AnsiSpan[] {
  const spans: AnsiSpan[] = [];
  // eslint-disable-next-line no-control-regex
  const re = /\x1b\[([0-9;]*)m/g;
  let lastIdx = 0;
  let fg: string | undefined, bg: string | undefined;
  let bold = false, dim = false, italic = false, underline = false;
  let match: RegExpExecArray | null;
  while ((match = re.exec(text)) !== null) {
    if (match.index > lastIdx) spans.push({ text: text.slice(lastIdx, match.index), fg, bg, bold, dim, italic, underline });
    for (const code of match[1].split(';').map(Number)) {
      if (code === 0) { fg = bg = undefined; bold = dim = italic = underline = false; }
      else if (code === 1) bold = true; else if (code === 2) dim = true;
      else if (code === 3) italic = true; else if (code === 4) underline = true;
      else if (code === 22) { bold = dim = false; } else if (code === 23) italic = false; else if (code === 24) underline = false;
      else if ((code >= 30 && code <= 37) || (code >= 90 && code <= 97)) fg = ANSI_COLORS[code];
      else if (code >= 40 && code <= 47) bg = ANSI_BG_COLORS[code];
      else if (code === 39) fg = undefined; else if (code === 49) bg = undefined;
    }
    lastIdx = re.lastIndex;
  }
  if (lastIdx < text.length) spans.push({ text: text.slice(lastIdx), fg, bg, bold, dim, italic, underline });
  return spans;
}

function AnsiOutput({ text }: { text: string }) {
  const safeText = text || '';
  const spans = useMemo(() => parseAnsi(safeText), [safeText]);
  return (
    <>
      {spans.map((span, i) => {
        const style: React.CSSProperties = {};
        if (span.fg) style.color = span.fg;
        if (span.bg) style.backgroundColor = span.bg;
        if (span.bold) style.fontWeight = 700;
        if (span.dim) style.opacity = 0.6;
        if (span.italic) style.fontStyle = 'italic';
        if (span.underline) style.textDecoration = 'underline';
        const hasStyle = span.fg || span.bg || span.bold || span.dim || span.italic || span.underline;
        return hasStyle ? <span key={i} style={style}>{span.text}</span> : span.text;
      })}
    </>
  );
}

/** Render inline content for an event — rich views for code tools, human-readable for the rest */
function EventInlineContent({ event }: { event: ClaudeCodeEvent }) {
  const e = event as any;
  switch (event.type) {
    case 'bash':
    case 'terminal': {
      if (!e.command && !e.output) return null;
      const exitOk = e.exitCode === 0 || e.exitCode === undefined;
      const cwd = e.cwd ? e.cwd.replace(/^\/Users\/[^/]+/, '~') : '~';
      return (
        <div className="chat-msg__terminal">
          <div className="chat-msg__terminal-bar">
            <div className="chat-msg__terminal-dots">
              <span className="chat-msg__terminal-dot chat-msg__terminal-dot--red" />
              <span className="chat-msg__terminal-dot chat-msg__terminal-dot--yellow" />
              <span className="chat-msg__terminal-dot chat-msg__terminal-dot--green" />
            </div>
            <span className="chat-msg__terminal-title">{cwd}</span>
            {e.exitCode !== undefined && e.exitCode !== 0 && (
              <span className="chat-msg__terminal-exit">exit {e.exitCode}</span>
            )}
          </div>
          <div className="chat-msg__terminal-body">
            {e.command && (
              <div className="chat-msg__terminal-line">
                <span className="chat-msg__terminal-prompt">$</span>
                <span className="chat-msg__terminal-cmd">{e.command}</span>
              </div>
            )}
            {e.output && (
              <pre className={`chat-msg__terminal-output${!exitOk ? ' chat-msg__terminal-output--error' : ''}`}>
                <AnsiOutput text={e.output} />
              </pre>
            )}
          </div>
        </div>
      );
    }
    case 'edit': {
      const lang = e.language || languageFromFilename(e.filePath || '');
      const hasContent = e.original && e.modified;
      if (!hasContent) {
        return <span>{e.filePath || ''}{e.description ? ` — ${e.description}` : ''}</span>;
      }
      return (
        <div className="chat-msg__code-content">
          <span className="chat-msg__code-path">{shortPath(e.filePath)}{e.description ? ` — ${e.description}` : ''}</span>
          <div className="chat-msg__code-editor">
            <CodeDiffEditor
              original={e.original}
              modified={e.modified}
              language={lang}
              fileName={e.filePath}
              height={Math.min(Math.max((e.modified || '').split('\n').length * 20, 60), 250)}
              readOnly
              renderSideBySide={false}
            />
          </div>
        </div>
      );
    }
    case 'create': {
      const lang = e.language || languageFromFilename(e.filePath || '');
      const content = e.content || '';
      if (!content) return <span>{e.filePath || ''}</span>;
      const lineCount = content.split('\n').length;
      return (
        <div className="chat-msg__code-content">
          <span className="chat-msg__code-path">{shortPath(e.filePath)}</span>
          <div className="chat-msg__code-editor">
            <CodeEditor
              value={content}
              language={lang}
              readOnly
              height={Math.min(Math.max(lineCount * 20, 60), 250)}
              minimap={false}
              lineNumbers
              fileName={e.filePath}
            />
          </div>
        </div>
      );
    }
    case 'grep':
      return (
        <span>
          Searching for <em>"{e.pattern}"</em>
          {e.filePattern ? <> in <strong>{e.filePattern}</strong></> : ''}
          {e.path ? <> under <code style={{ fontSize: '0.9em' }}>{e.path}</code></> : ''}
        </span>
      );
    case 'glob':
      return (
        <span>
          Looking for <strong>{e.pattern}</strong>
          {e.matches?.length ? ` — found ${e.matches.length} file${e.matches.length !== 1 ? 's' : ''}` : ''}
        </span>
      );
    case 'read':
      return <span>{shortPath(e.filePath)}</span>;
    case 'web_search':
      return <span>Searching for <em>"{e.query}"</em></span>;
    case 'web_fetch':
      return <span>{e.url || ''}</span>;
    case 'mcp':
    case 'mcp_routed': {
      return (
        <McpToolContent
          toolName={e.toolName || ''}
          args={e.arguments}
          resultText={e.resultText || e.result || ''}
        />
      );
    }
    case 'task':
    case 'sub_agent':
      return <span>{e.title || e.description || ''}</span>;
    case 'todo_list':
      if (!e.items?.length) return null;
      return (
        <span>
          {e.items.filter((i: any) => i.status === 'completed').length}/{e.items.length} completed
          {' — '}
          {e.items.map((i: any, idx: number) => (
            <span key={idx}>
              {idx > 0 && ', '}
              {i.status === 'completed' ? <s>{i.content}</s> : i.content}
            </span>
          ))}
        </span>
      );
    case 'question':
      // Rendered as QuestionCard in the event loop — this is a fallback
      if (e.questions?.length) {
        return <span>{e.questions[0]?.question || 'Question'}</span>;
      }
      return <span>Waiting for answer...</span>;
    case 'permission':
      // Rendered as PermissionCard in the event loop — this is a fallback
      return <span>{e.toolName ? `Approve ${e.toolName}?` : 'Waiting for approval...'}</span>;
    case 'skill':
      return <span>/{e.skillName || ''}</span>;
    case 'plan':
      return <EventMarkdown content={e.content || ''} />;
    case 'gate':
      return (
        <span>
          {e.status === 'passed' ? 'Passed' : e.status === 'failed' ? 'Failed' : e.status || ''}
          {e.gate ? ` (${e.gate})` : ''}
          {e.evidence ? ` — ${e.evidence.slice(0, 100)}` : ''}
        </span>
      );
    default:
      return e.content ? <EventMarkdown content={e.content} /> : null;
  }
}

/** Humanize "mcp__orchestra-mcp__get_workflow_status" → "Get Workflow Status" */
function humanizeMcpTool(name: string): string {
  const parts = name.split('__');
  const tool = parts.length >= 3 ? parts.slice(2).join('__') : parts[parts.length - 1];
  // Friendly aliases for common orchestra tools
  const aliases: Record<string, string> = {
    get_feature: 'Feature', list_features: 'Features', search_features: 'Search Features',
    create_feature: 'New Feature', advance_feature: 'Advance', set_current_feature: 'Start Feature',
    submit_review: 'Review', get_gate_requirements: 'Gate Check',
    get_project_status: 'Project Status', list_projects: 'Projects', get_project_mode: 'Project Mode',
    create_plan: 'New Plan', approve_plan: 'Approve Plan', breakdown_plan: 'Plan Breakdown',
    get_current_user: 'User Profile', set_current_user: 'Set User', create_person: 'New Person',
    git_status_summary: 'Git Status', git_quick_commit: 'Git Commit', git_push: 'Git Push',
    git_pull: 'Git Pull', git_create_branch: 'New Branch', git_merge_branch: 'Merge Branch',
    create_note: 'New Note', save_note: 'Save Note', search_notes: 'Search Notes', list_notes: 'Notes',
    create_session: 'New Session', get_session: 'Load Session', list_sessions: 'Sessions',
    send_message: 'Send Message', create_request: 'New Request', list_requests: 'Requests',
    search_packs: 'Marketplace', list_packs: 'Packs', install_pack: 'Install Pack',
    sync_now: 'Sync', sync_status: 'Sync Status', check_budget: 'Budget Check',
    list_accounts: 'Accounts', get_account: 'Account',
    doc_search: 'Search Docs', doc_create: 'New Doc', doc_get: 'Read Doc',
    get_workflow_status: 'Workflow', check_wip_limit: 'WIP Check',
    toolsearch: 'Tool Search',
  };
  const lower = tool.toLowerCase();
  if (aliases[lower]) return aliases[lower];
  return tool.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

/** Check if an MCP event belongs to Orchestra MCP server */
/** Check if an event represents a failed/error tool call */
function isEventFailed(event: ClaudeCodeEvent): boolean {
  const e = event as any;
  if (e.status === 'error') return true;
  if (event.type === 'bash' || event.type === 'terminal') {
    return e.exitCode !== undefined && e.exitCode !== 0;
  }
  return false;
}

function isOrchestraTool(event: ClaudeCodeEvent): boolean {
  const toolName = (event as any).toolName || '';
  const serverName = (event as any).serverName || '';
  return serverName === 'orchestra' || serverName === 'orchestra-mcp'
    || toolName.includes('orchestra');
}

/** Get icon class name for event type */
function getEventIcon(event: ClaudeCodeEvent): string {
  switch (event.type) {
    case 'bash': case 'terminal': return 'bx-terminal';
    case 'grep': return 'bx-search';
    case 'glob': return 'bx-folder-open';
    case 'read': return 'bx-file';
    case 'edit': return 'bx-edit';
    case 'create': return 'bxs-file-plus';
    case 'web_search': return 'bx-globe';
    case 'web_fetch': return 'bx-link-external';
    case 'task': case 'sub_agent': return 'bx-bot';
    case 'todo_list': return 'bx-list-check';
    case 'plan': return 'bx-map';
    case 'skill': return 'bx-magic-wand';
    case 'agent_switch': return 'bx-transfer';
    case 'gate': return 'bx-shield-quarter';
    case 'preview': return 'bx-show';
    case 'permission': return 'bx-lock-open';
    case 'question': return 'bx-help-circle';
    case 'mcp': case 'mcp_routed': case 'orchestra': {
      if (!isOrchestraTool(event)) return 'bx-wrench';
      // Map orchestra tools to contextual icons
      const tn = ((event as any).toolName || '').replace(/^mcp__[^_]+__/, '').toLowerCase();
      if (tn.includes('feature') || tn.includes('advance') || tn.includes('review')) return '';
      if (tn.includes('project') || tn.includes('list_project')) return '';
      if (tn.includes('git')) return '';
      if (tn.includes('note') || tn.includes('doc')) return '';
      if (tn.includes('session') || tn.includes('send_message')) return '';
      if (tn.includes('plan') || tn.includes('breakdown')) return '';
      if (tn.includes('person') || tn.includes('user')) return '';
      if (tn.includes('pack') || tn.includes('marketplace')) return '';
      if (tn.includes('sync') || tn.includes('login') || tn.includes('logout')) return '';
      if (tn.includes('request')) return '';
      if (tn.includes('budget') || tn.includes('account')) return '';
      if (tn.includes('search') || tn === 'toolsearch') return '';
      return '';
    }
    default: return 'bx-cog';
  }
}

/** Extract a readable tool/action name from an event */
function getEventToolName(event: ClaudeCodeEvent): string {
  switch (event.type) {
    case 'bash': return 'Bash';
    case 'terminal': return 'Terminal';
    case 'grep': return 'Grep';
    case 'glob': return 'Glob';
    case 'read': return 'Read';
    case 'edit': return 'Edit';
    case 'create': return 'Write';
    case 'web_search': return 'Web Search';
    case 'web_fetch': return 'Web Fetch';
    case 'mcp': return humanizeMcpTool((event as any).toolName || 'MCP');
    case 'mcp_routed': return humanizeMcpTool((event as any).toolName || 'MCP');
    case 'orchestra': return 'Orchestra';
    case 'task': return 'Task';
    case 'todo_list': return 'Todo';
    case 'sub_agent': return (event as any).agentType || 'Sub Agent';
    case 'plan': return 'Plan';
    case 'skill': return (event as any).skillName || 'Skill';
    case 'agent_switch': return (event as any).agentName || 'Agent';
    case 'gate': return 'Gate';
    case 'preview': return 'Preview';
    case 'permission': return (event as any).toolName || 'Permission';
    case 'question': return 'Question';
    default: return (event as any).type || 'Tool';
  }
}


export interface ChatMessageProps {
  message: ChatMessageType;
  assistantName?: string;
  avatar?: ReactNode;
  renderMarkdown?: boolean;
  actions?: MessageAction[];
  contextActions?: ContextMenuAction[];
  onContextAction?: (actionId: string, messageId: string) => void;
  onFileClick?: (filePath: string, line?: number) => void;
  onOpenInWindow?: (event: ClaudeCodeEvent) => void;
  onQuestionAnswer?: (requestId: string, answers: Record<string, string>) => void;
  onPermissionDecision?: (requestId: string, decision: 'approve' | 'deny') => void;
  className?: string;
}

export const ChatMessage = ({
  message,
  assistantName,
  avatar,
  renderMarkdown,
  actions = [],
  contextActions,
  onContextAction,
  onFileClick,
  onOpenInWindow,
  onQuestionAnswer,
  onPermissionDecision,
  className,
}: ChatMessageProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const { role, content, streaming, thinking, thinkingStreaming, events, timestamp, attachments } = message;

  // Track if this message ever streamed — keep ChatStreamMessage mounted so it
  // can finish its char-by-char animation even after streaming flips to false
  const wasStreamingRef = useRef(false);
  if (streaming) wasStreamingRef.current = true;
  const useStreamRenderer = role === 'assistant' && wasStreamingRef.current;

  // Glow border is only active while streaming is live — stops as soon as session ends
  const handleStreamComplete = useCallback(() => {}, []);
  const showGlow = !!streaming;

  const handleCtxAction = useCallback((actionId: string) => {
    onContextAction?.(actionId, message.id);
  }, [onContextAction, message.id]);

  const shouldRenderMarkdown = renderMarkdown ?? (role === 'assistant');

  // Hide bubble when content + thinking are empty (events-only or waiting for first chunk)
  const hasTextContent = content.length > 0;
  const hasThinking = Boolean(thinking);
  const showBubble = hasTextContent || hasThinking || role !== 'assistant';

  const cls = [
    'chat-msg',
    `chat-msg--${role}`,
    className,
  ].filter(Boolean).join(' ');

  // Events-only message (no bubble, just cards) — e.g. tool calls before text arrives
  const hasEvents = events && events.length > 0;
  if (!showBubble && !hasEvents && streaming) return null;

  // Format timestamp for inside-bubble display
  const timeStr = timestamp
    ? new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
    : null;

  const messageContent = (
    <>
      {/* Tool events — each rendered as its own message row with avatar */}
      {hasEvents && events.map((event, idx) => {
        const evtTimeStr = event.timestamp
          ? new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
          : null;

        // Question events → full QuestionCard with interactive options
        if (event.type === 'question') {
          return (
            <div key={`${event.id}-${idx}`} className={`chat-msg chat-msg--${role}${className ? ` ${className}` : ''}`} data-role={role}>
              {role !== 'system' && <ToolAvatar event={event} />}
              <div className="chat-msg__body-col">
                <QuestionCard
                  event={event as QuestionEvent}
                  onAnswer={onQuestionAnswer}
                />
              </div>
            </div>
          );
        }

        // Permission events → full PermissionCard with Approve/Deny buttons
        if (event.type === 'permission') {
          return (
            <div key={`${event.id}-${idx}`} className={`chat-msg chat-msg--${role}${className ? ` ${className}` : ''}`} data-role={role}>
              {role !== 'system' && <ToolAvatar event={event} />}
              <div className="chat-msg__body-col">
                <PermissionCard
                  event={event as PermissionEvent}
                  onDecision={onPermissionDecision}
                />
              </div>
            </div>
          );
        }

        // All other tool events → inline bubble
        return (
          <div key={`${event.id}-${idx}`} className={`chat-msg chat-msg--${role}${className ? ` ${className}` : ''}`} data-role={role}>
            {role !== 'system' && (
              <ToolAvatar event={event} />
            )}
            <div className="chat-msg__body-col">
              <div className="chat-msg__bubble">
                <span className="chat-msg__sender">
                  {getEventToolName(event)}
                </span>
                <div className="chat-msg__content">
                  <EventInlineContent event={event} />
                </div>
                <div className="chat-msg__meta">
                  {evtTimeStr && (
                    <time className="chat-msg__time" dateTime={event.timestamp}>{evtTimeStr}</time>
                  )}
                  <span className={`chat-msg__check${isEventFailed(event) ? ' chat-msg__check--error' : ''}`}>
                    <BoxIcon name={isEventFailed(event) ? 'bx-x' : event.status === 'running' ? 'bx-check' : 'bx-check-double'} size={16} />
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Main message */}
      {(showBubble || hasThinking) && (
      <div
        className={cls}
        data-testid="chat-message"
        data-role={role}
        data-message-id={message.id}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {role !== 'system' && avatar && (
          <div className="chat-msg__avatar">{avatar}</div>
        )}

        <div className="chat-msg__body-col">
          {message.forwardedFrom && (
            <div className="chat-msg__forwarded">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l7 7h-4v6h-6v-6H5l7-7z" transform="rotate(90 12 12)"/></svg>
              <span>Forwarded</span>
            </div>
          )}

          {hasThinking && (
          <div className="chat-msg__thinking">
            <ChatThinkingMessage
              content={thinking!}
              streaming={thinkingStreaming}
            />
          </div>
        )}

        {showBubble && (
          <div className="chat-msg__bubble" data-streaming={showGlow ? 'true' : undefined}>
            {role === 'assistant' && assistantName && (
              <span className="chat-msg__sender">{assistantName}</span>
            )}
            <div className="chat-msg__content">
              {useStreamRenderer ? (
                <ChatStreamMessage
                  content={content}
                  streaming={!!streaming}
                  renderMarkdown={shouldRenderMarkdown}
                  onStreamComplete={handleStreamComplete}
                />
              ) : shouldRenderMarkdown ? (
                <ChatMarkdown content={content} />
              ) : (
                <span className="chat-msg__text">{content}</span>
              )}
            </div>

            {attachments && attachments.length > 0 && (
              <div className="chat-msg__attachments">
                {attachments.map((att, i) => (
                  <div key={i} className="chat-msg__attachment">
                    {att.type.startsWith('image/') && att.preview ? (
                      <img src={att.preview} alt={att.name} className="chat-msg__attachment-img" draggable={false} />
                    ) : (
                      <div className="chat-msg__attachment-file">
                        <span className="chat-msg__attachment-name">{att.name}</span>
                        <span className="chat-msg__attachment-size">{formatBytes(att.size)}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Timestamp + usage INSIDE bubble — WhatsApp style */}
            {!streaming && (
              <div className="chat-msg__meta">
                {(message.starred || message.pinned) && (
                  <div className="chat-msg__badges">
                    {message.pinned && (
                      <span className="chat-msg__badge chat-msg__badge--pin" title="Pinned">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M16 2H8L6 7l2 4-3 7h4v4l1 2 1-2v-4h4l-3-7 2-4z"/></svg>
                      </span>
                    )}
                    {message.starred && (
                      <span className="chat-msg__badge chat-msg__badge--star" title="Starred">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                      </span>
                    )}
                  </div>
                )}
                {role === 'assistant' && (message.model || message.tokensIn != null || message.cost != null) && (
                  <div className="chat-msg__usage">
                    {message.model && <span className="chat-msg__usage-item">{message.model}</span>}
                    {message.tokensIn != null && message.tokensOut != null && (
                      <span className="chat-msg__usage-item">{message.tokensIn}/{message.tokensOut} tok</span>
                    )}
                    {message.cost != null && <span className="chat-msg__usage-item">${message.cost.toFixed(4)}</span>}
                    {message.durationMs != null && (
                      <span className="chat-msg__usage-item">
                        {message.durationMs >= 1000 ? `${(message.durationMs / 1000).toFixed(1)}s` : `${message.durationMs}ms`}
                      </span>
                    )}
                  </div>
                )}
                {timeStr && (
                  <time className="chat-msg__time" dateTime={timestamp}>
                    {timeStr}
                  </time>
                )}
                {/* Check icon on assistant/loaded messages */}
                {role === 'assistant' && (
                  <span className="chat-msg__check" aria-label="Done">
                    <BoxIcon name="bx-check-double" size={16} />
                  </span>
                )}
              </div>
            )}

            {actions.length > 0 && (
              <ChatMessageActions
                messageId={message.id}
                actions={actions}
                visible={isHovered}
              />
            )}
          </div>
        )}
        </div>
      </div>
      )}
    </>
  );

  if (contextActions?.length && onContextAction) {
    return (
      <ChatMessageContextMenu actions={contextActions} onAction={handleCtxAction}>
        {messageContent}
      </ChatMessageContextMenu>
    );
  }

  return messageContent;
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
