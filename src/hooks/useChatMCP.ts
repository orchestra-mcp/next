'use client'
import { useCallback, useEffect, useRef } from 'react'
import { useMCP } from './useMCP'
import { onServerNotification } from './useTunnelConnection'
import { useChatStore } from '@/store/chat'
import type { Account, ChatSessionData } from '@/store/chat'
import type { ChatMessage, ClaudeCodeEvent, PermissionEvent, QuestionEvent, QuestionItem } from '@orchestra-mcp/ai/types'

// ── MCP Response Parsers ─────────────────────────────────────

interface TurnMeta {
  claudeSessionId?: string
  model?: string
  tokensIn?: number
  tokensOut?: number
  cost?: number
  durationMs?: number
}

/**
 * Strip MCP usage metadata from a message.
 *
 * The send_message tool appends metadata in various formats:
 *
 * Format A (markdown list after ---):
 *   <response>\n\n---\n- **Session:** ...\n- **Model:** ...\n
 *
 * Format B (pipe-delimited, sometimes in italics):
 *   <response> _Model: ... | Tokens: ... | Cost: ... | Duration: ..._
 *
 * Format C (turn headers):
 *   #### Turn N — <timestamp>\n<response>
 */
function stripMetadata(text: string): string {
  let cleaned = text

  // Strip orphan "** " prefix at start of text (bold marker without closing pair)
  cleaned = cleaned.replace(/^\*\*\s+/, '')

  // Strip "#### Turn N — <timestamp>" headers
  cleaned = cleaned.replace(/^#{1,4}\s*Turn\s+\d+\s*[—–-]\s*\d{4}-\d{2}-\d{2}T[\d:.]+Z?\s*\n?/gm, '')

  // NOTE: Tool call trace lines (⚙/✓/✗) are preserved here and extracted
  // into ClaudeCodeEvent objects by extractToolEvents() instead.

  // Strip "**Response:**", "**Answer:**", "**Technical Issue:**" and similar bold-prefixed narration headers
  cleaned = cleaned.replace(/^\*\*(?:Response|Answer|Result|Technical Issue|Note|Error|Warning|Summary)\*\*:?\s*/gm, '')

  // Strip format A: everything after \n---\n followed by actual metadata lines
  // Only match known metadata keys to avoid stripping normal bold list items
  const sepIdx = cleaned.lastIndexOf('\n---\n')
  if (sepIdx !== -1) {
    const after = cleaned.slice(sepIdx + 5).trim()
    if (/^-\s+\*\*(?:Session|Model|Tokens|Cost|Duration|Account)\*\*\s*[:：]/i.test(after)) {
      cleaned = cleaned.slice(0, sepIdx)
    }
  }

  // Strip format B: trailing _Model: ... | Tokens: ... | Cost: ... | Duration: ..._
  // Match both with and without underscores/bold, at end of text or end of line
  cleaned = cleaned.replace(/\s*_?\*{0,2}Model\s*[:：]\s*\S+\s*\|\s*Tokens\s*[:：]\s*\d+\s*in\s*\/\s*\d+\s*out\s*\|\s*Cost\s*[:：]\s*\$?[\d.]+\s*\|\s*Duration\s*[:：]\s*\d+m?s\*{0,2}_?\s*$/gm, '')

  // Strip standalone metadata lines: "- **Key:** val", "• **Key:** val", "* **Key:** val"
  // Also match non-bold: "• Session: val", "• Model: val"
  cleaned = cleaned.replace(/^[•*-]\s+\*{0,2}(?:Session|Model|Tokens|Cost|Duration)\*{0,2}\s*[:：]\s*.+$/gm, '')

  // Strip trailing metadata block at end of text (same patterns)
  cleaned = cleaned.replace(/(\n[•*-]\s+\*{0,2}(?:Session|Model|Tokens|Cost|Duration)\*{0,2}\s*[:：]\s*.+)+\s*$/gm, '')

  // Collapse multiple blank lines into at most two
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n')

  // Strip leading/trailing whitespace and leftover --- separators
  cleaned = cleaned.replace(/\n---\s*$/, '').trim()

  return cleaned
}

function parseTurnResponse(raw: string): { content: string; meta: TurnMeta } {
  // Try JSON first (new format from updated Go plugin)
  try {
    const json = JSON.parse(raw)
    if (json.response !== undefined) {
      return {
        content: json.response,
        meta: {
          claudeSessionId: json.session_id,
          model: json.model,
          tokensIn: json.tokens_in,
          tokensOut: json.tokens_out,
          cost: json.cost,
          durationMs: json.duration_ms,
        },
      }
    }
  } catch { /* not JSON, fall through to markdown parsing */ }

  // Fallback: parse legacy markdown format
  const meta: TurnMeta = {}

  const sepIdx = raw.lastIndexOf('\n---\n')
  if (sepIdx !== -1) {
    const metaBlock = raw.slice(sepIdx + 5)
    for (const line of metaBlock.split('\n')) {
      const m = line.match(/^-\s+\*\*(\w[\w\s]*?)\*\*:\s*(.+)$/)
      if (!m) continue
      const key = m[1].toLowerCase().trim()
      const val = m[2].trim()
      if (key === 'session') meta.claudeSessionId = val
      if (key === 'model') meta.model = val
      if (key === 'tokens') {
        const tm = val.match(/(\d+)\s*in\s*\/\s*(\d+)\s*out/)
        if (tm) { meta.tokensIn = parseInt(tm[1], 10); meta.tokensOut = parseInt(tm[2], 10) }
      }
      if (key === 'cost') meta.cost = parseFloat(val.replace('$', '')) || 0
      if (key === 'duration') meta.durationMs = parseInt(val, 10) || 0
    }
  }

  const pipeMatch = raw.match(/_?Model:\s*(\S+)\s*\|\s*Tokens:\s*(\d+)\s*in\s*\/\s*(\d+)\s*out\s*\|\s*Cost:\s*\$?([\d.]+)\s*\|\s*Duration:\s*(\d+)ms_?/)
  if (pipeMatch) {
    meta.model = meta.model || pipeMatch[1]
    meta.tokensIn = meta.tokensIn ?? parseInt(pipeMatch[2], 10)
    meta.tokensOut = meta.tokensOut ?? parseInt(pipeMatch[3], 10)
    meta.cost = meta.cost ?? parseFloat(pipeMatch[4])
    meta.durationMs = meta.durationMs ?? parseInt(pipeMatch[5], 10)
  }

  // Parse plain bullet metadata: "• Session: val", "• Model: val", "- Session: val"
  for (const line of raw.split('\n')) {
    const bm = line.match(/^[•*-]\s+\*{0,2}(\w[\w\s]*?)\*{0,2}\s*[:：]\s*(.+)$/)
    if (!bm) continue
    const key = bm[1].toLowerCase().trim()
    const val = bm[2].trim()
    if (key === 'session' && !meta.claudeSessionId) meta.claudeSessionId = val
    if (key === 'model' && !meta.model) meta.model = val
    if (key === 'tokens' && meta.tokensIn == null) {
      const tm = val.match(/(\d+)\s*in\s*\/\s*(\d+)\s*out/)
      if (tm) { meta.tokensIn = parseInt(tm[1], 10); meta.tokensOut = parseInt(tm[2], 10) }
    }
    if (key === 'cost' && meta.cost == null) meta.cost = parseFloat(val.replace('$', '')) || 0
    if (key === 'duration' && meta.durationMs == null) meta.durationMs = parseInt(val, 10) || 0
  }

  return { content: stripMetadata(raw), meta }
}

function parseMCPTable(text: string): Array<Record<string, string>> {
  const rows: Array<Record<string, string>> = []
  const lines = text.split('\n')
  let headerCols: string[] = []

  for (const line of lines) {
    if (!line.startsWith('|') || line.includes('---')) continue
    const cells = line.split('|').map(c => c.trim()).filter(Boolean)
    if (cells.length < 2) continue

    if (cells[0].toLowerCase() === 'id') {
      headerCols = cells.map(c => c.toLowerCase())
      continue
    }

    const row: Record<string, string> = {}
    cells.forEach((cell, i) => {
      // MCP tables use "-" as placeholder for empty values
      row[headerCols[i] || `col${i}`] = cell === '-' ? '' : cell
    })
    if (row['id'] || cells[0]) rows.push(row)
  }
  return rows
}

function parseSessions(text: string): ChatSessionData[] {
  return parseMCPTable(text).map(row => ({
    id: row['id'] || '',
    title: row['name'] || '',
    messages: [],
    accountId: row['account'] || undefined,
    provider: row['provider'] || row['account'] || undefined,
    model: row['model'] || undefined,
    status: (row['status'] || 'active').toLowerCase(),
    createdAt: row['created'] || new Date().toISOString(),
    updatedAt: row['updated'] || new Date().toISOString(),
  })).filter(s => s.id)
}

function parseAccounts(text: string): Account[] {
  return parseMCPTable(text).map(row => ({
    id: row['id'] || '',
    name: row['name'] || '',
    provider: row['provider'] || '',
    model: row['model'] || '',
    budget: row['budget'] || '',
  })).filter(a => a.id)
}

function parseSessionDetail(text: string): { meta: { name: string; account: string; model?: string; provider?: string }; messages: ChatMessage[] } {
  // Try JSON first (new format from updated Go plugin)
  try {
    const json = JSON.parse(text)
    if (json.id && json.turns !== undefined) {
      const messages: ChatMessage[] = []
      for (const t of json.turns) {
        if (t.user) {
          messages.push({
            id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}-u`,
            role: 'user',
            content: t.user.replace(/^\*\*\s+/, ''),
            timestamp: t.timestamp || new Date().toISOString(),
          })
        }
        if (t.assistant) {
          // Parse persisted tool events from the turn data.
          let events: ClaudeCodeEvent[] | undefined
          if (Array.isArray(t.events) && t.events.length > 0) {
            const evMap = new Map<string, ClaudeCodeEvent>()
            for (const ev of t.events) {
              if (ev.type === 'tool_start') {
                const card = bridgeEventToCard(ev)
                card.status = 'done' // persisted events are always completed
                evMap.set(ev.tool_id || card.id, card)
              } else if (ev.type === 'tool_end' && ev.tool_id) {
                const existing = evMap.get(ev.tool_id)
                if (existing) {
                  existing.status = ev.tool_error ? 'error' : 'done'
                  // Merge result data
                  if (ev.tool_result) {
                    const tn = (ev.tool_name || '').toLowerCase()
                    if (tn === 'bash') (existing as any).output = ev.tool_result
                    else if (tn === 'grep') (existing as any).resultText = ev.tool_result
                    else if (tn === 'read') (existing as any).content = ev.tool_result
                    else (existing as any).resultText = ev.tool_result
                  }
                }
              }
            }
            events = Array.from(evMap.values())
          }
          messages.push({
            id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}-a`,
            role: 'assistant',
            content: stripMetadata(t.assistant),
            timestamp: t.timestamp || new Date().toISOString(),
            markdown: true,
            ...(events && events.length > 0 ? { events } : {}),
          })
        }
      }
      return {
        meta: {
          name: json.name || '',
          account: json.account || '',
          model: json.model,
          provider: json.provider,
        },
        messages,
      }
    }
  } catch { /* not JSON, fall through to markdown parsing */ }

  // Fallback: parse legacy markdown format
  const messages: ChatMessage[] = []
  const meta = { name: '', account: '', model: undefined as string | undefined, provider: undefined as string | undefined }
  const lines = text.split('\n')

  for (const line of lines) {
    const kv = line.match(/^-\s+\*\*(\w[\w\s]*?)\*\*:\s*(.+)$/)
    if (kv) {
      const key = kv[1].toLowerCase().trim()
      const val = kv[2].trim().replace(/^`|`$/g, '')
      if (key === 'id') continue
      if (key === 'account') meta.account = val
      if (key === 'model') meta.model = val
      if (key === 'provider') meta.provider = val
    }
    const titleMatch = line.match(/^##\s+Session:\s*(.+)$/i)
    if (titleMatch) meta.name = titleMatch[1].trim()
  }

  let currentRole: 'user' | 'assistant' | null = null
  let currentContent: string[] = []
  let turnTimestamp: string | null = null

  function flushMessage() {
    if (currentRole && currentContent.length > 0) {
      const raw = currentContent.join('\n').trim()
      const content = currentRole === 'assistant' ? stripMetadata(raw) : raw.replace(/^\*\*\s+/, '')
      if (content) {
        messages.push({
          id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          role: currentRole,
          content,
          timestamp: turnTimestamp || new Date().toISOString(),
          markdown: currentRole === 'assistant',
        })
      }
    }
    currentContent = []
    currentRole = null
  }

  let inTurns = false
  for (const line of lines) {
    if (/^###?\s*Recent Messages/i.test(line)) { inTurns = true; continue }
    const turnHeader = line.match(/^#{1,4}\s*Turn\s+\d+\s*[—–-]\s*(.+)$/i)
    if (turnHeader) { flushMessage(); inTurns = true; turnTimestamp = turnHeader[1].trim(); continue }
    if (!inTurns) continue

    const userMatch = line.match(/^\*\*User\*?\*?:?\s*(.*)$/i)
    if (userMatch) { flushMessage(); currentRole = 'user'; const r = userMatch[1].trim(); if (r) currentContent.push(r); continue }
    const responseMatch = line.match(/^\*\*Response\*?\*?:?\s*(.*)$/i)
    if (responseMatch) { flushMessage(); currentRole = 'assistant'; const r = responseMatch[1].trim(); if (r) currentContent.push(r); continue }
    const headerUser = line.match(/^##?\s*User\b/i)
    const headerResponse = line.match(/^##?\s*(?:Response|Assistant)\b/i)
    if (headerUser) { flushMessage(); currentRole = 'user'; continue }
    if (headerResponse) { flushMessage(); currentRole = 'assistant'; continue }
    if (/^---+$/.test(line)) continue
    if (currentRole) currentContent.push(line)
  }
  flushMessage()

  if (!meta.provider && meta.account) meta.provider = meta.account
  return { meta, messages }
}

// ── Tool Event Extraction (fallback for non-streaming responses) ──

/**
 * Tool call line patterns in bridge-claude response text:
 *   ⚙ ToolName: arg_summary   → tool_use (start, captures "arg_summary")
 *   ⚙ ToolName                → tool_use (start, no args)
 *   ⚙ ToolName Long text...   → tool_use (start, trailing text discarded)
 *   ✓ ToolName                → tool_result (success)
 *   ✗ ToolName                → tool_result (error)
 *
 * Patterns allow optional leading whitespace and emoji variant (⚙️ vs ⚙).
 */
const TOOL_START_RE = /^\s*⚙️?\s+(\S+?)(?::\s*(.+))?$/
const TOOL_START_LOOSE_RE = /^\s*⚙️?\s+(\S+)/
const TOOL_END_OK_RE = /^\s*✓\s+(\S+)/
const TOOL_END_ERR_RE = /^\s*✗\s+(\S+)/

function mapToolNameToEvent(toolName: string, argSummary: string, id: string, toolData?: Record<string, any>): ClaudeCodeEvent {
  const base = { id, toolUseId: id, status: 'done' as const, timestamp: new Date().toISOString() }
  const name = toolName.toLowerCase()

  switch (name) {
    case 'bash':
      return {
        ...base, type: 'bash',
        command: toolData?.command || argSummary || '',
        description: toolData?.description || '',
      }
    case 'grep':
      return {
        ...base, type: 'grep',
        pattern: toolData?.pattern || argSummary || '',
        filePattern: toolData?.glob || toolData?.type || '',
        path: toolData?.path || '',
        matches: [],
      }
    case 'read':
      return { ...base, type: 'read', filePath: toolData?.file_path || argSummary || '' }
    case 'glob':
      return {
        ...base, type: 'glob',
        pattern: toolData?.pattern || argSummary || '',
        path: toolData?.path || '',
      }
    case 'edit':
      return {
        ...base, type: 'edit',
        filePath: toolData?.file_path || argSummary || '',
        original: toolData?.old_string || '',
        modified: toolData?.new_string || '',
        description: toolData?.description || '',
      }
    case 'write':
      return {
        ...base, type: 'create',
        filePath: toolData?.file_path || argSummary || '',
        content: toolData?.content || '',
      }
    case 'task':
      return {
        ...base, type: 'sub_agent',
        agentType: toolData?.subagent_type || 'general',
        description: toolData?.description || toolData?.prompt || argSummary || '',
      }
    case 'todowrite':
      return {
        ...base, type: 'todo_list',
        items: toolData?.todos || [],
      }
    case 'websearch':
      return { ...base, type: 'web_search', query: toolData?.query || argSummary || '', results: [] }
    case 'webfetch':
      return { ...base, type: 'web_fetch', url: toolData?.url || argSummary || '' }
    case 'askuserquestion':
      return {
        ...base, type: 'question',
        requestId: id,
        questions: toolData?.questions || [],
      }
    default: {
      // Use full toolData as arguments if available, otherwise fall back to summary
      const args = toolData || (argSummary ? { summary: argSummary } : {})
      return { ...base, type: 'mcp', toolName, arguments: args }
    }
  }
}

/**
 * Extract tool events from response text and return cleaned text + events.
 * Used as fallback when streaming events were not received.
 */
function extractToolEvents(text: string): { cleanedText: string; events: ClaudeCodeEvent[] } {
  const events: ClaudeCodeEvent[] = []
  const cleanedLines: string[] = []
  const pendingTools = new Map<string, ClaudeCodeEvent>()
  let eventCounter = 0

  for (const line of text.split('\n')) {
    const trimmed = line.trim()

    if (!trimmed) { cleanedLines.push(line); continue }

    // Try strict match first (⚙ Tool: args), then loose match (⚙ Tool anything)
    const startMatch = trimmed.match(TOOL_START_RE) || trimmed.match(TOOL_START_LOOSE_RE)
    if (startMatch) {
      const toolName = startMatch[1]
      const argSummary = startMatch[2] || ''
      const id = `ev-${Date.now()}-${eventCounter++}`
      const event = mapToolNameToEvent(toolName, argSummary, id)
      event.status = 'running'
      events.push(event)
      pendingTools.set(toolName, event)
      continue
    }

    const okMatch = trimmed.match(TOOL_END_OK_RE)
    if (okMatch) {
      const pending = pendingTools.get(okMatch[1])
      if (pending) { pending.status = 'done'; pendingTools.delete(okMatch[1]); continue }
      // No matching pending tool — keep line as content
    }

    const errMatch = trimmed.match(TOOL_END_ERR_RE)
    if (errMatch) {
      const pending = pendingTools.get(errMatch[1])
      if (pending) { pending.status = 'error'; pendingTools.delete(errMatch[1]); continue }
      // No matching pending tool — keep line as content
    }

    // Keep all non-tool-marker lines as response text
    cleanedLines.push(line)
  }

  for (const event of pendingTools.values()) event.status = 'done'

  const cleaned = cleanedLines.join('\n').replace(/\n{3,}/g, '\n\n').trim()
  return { cleanedText: cleaned, events }
}

// ── Real-time Event Mapping ─────────────────────────────────────

/** Bridge-claude ChatEvent from drain_session_events */
interface BridgeChatEvent {
  type: 'text_chunk' | 'tool_start' | 'tool_end' | 'thinking' | 'status' | 'result' | 'error' | 'permission' | 'question'
  session_id: string
  text?: string
  tool_name?: string
  tool_id?: string
  tool_input?: string
  tool_data?: string   // Full JSON input for rich rendering (Write content, Edit old/new, Bash command, MCP args)
  tool_result?: string // Tool output/result content (Bash stdout, Grep matches, etc.)
  tool_error?: boolean
  tokens_in?: number
  tokens_out?: number
  cost_usd?: number
  model_used?: string
  duration_ms?: number
  request_id?: string
  reason?: string
}

/**
 * Convert a bridge-claude tool_start ChatEvent to a ClaudeCodeEvent card.
 */
function bridgeEventToCard(ev: BridgeChatEvent): ClaudeCodeEvent {
  const id = ev.tool_id || `ev-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
  // Parse full tool data JSON if available for rich rendering
  let toolData: Record<string, any> | undefined
  if (ev.tool_data) {
    try { toolData = JSON.parse(ev.tool_data) } catch { /* ignore */ }
  }
  return mapToolNameToEvent(ev.tool_name || 'unknown', ev.tool_input || '', id, toolData)
}

// ── Active Streaming Message Registry ────────────────────────────
// Maps session_id → assistantMsgId for in-flight messages. This allows the
// notification handler to know which message to append events to.
const _activeStreamingMessages = new Map<string, string>()

// Track permission request IDs we've already created cards for to avoid
// duplicates — the permission poller re-broadcasts pending requests every second.
const _emittedPermissionIds = new Set<string>()
// Track IDs we've already sent a dismiss call for (orphaned, no active session).
// Prevents sending dismiss calls every poll cycle.
const _dismissedPermissionIds = new Set<string>()
// Track tool+input fingerprints so duplicate permission requests for the same
// tool call (different request IDs) only create one card.
const _emittedPermissionFingerprints = new Set<string>()
// Track the currently active question request ID — when a new question arrives,
// auto-answer the old one so it doesn't block. Claude CLI retries with new IDs.
let _activeQuestionRequestId: string | null = null

/** Clear the active question tracker after the user answers a question. */
export function clearActiveQuestionId() {
  _activeQuestionRequestId = null
}

// ── Hook ─────────────────────────────────────────────────────

function getMCPText(result: { content?: Array<{ text?: string }> }): string {
  if (!result.content?.length) return ''
  return result.content.map(c => c.text ?? '').join('\n')
}

export function useChatMCP() {
  const { callTool, status } = useMCP()
  const connected = status === 'connected'
  const store = useChatStore
  const fetchedRef = useRef(false)
  // Track how many streaming events were received per session to know if
  // we got real-time events or need the fallback extraction.
  const streamedEventCountRef = useRef(new Map<string, number>())

  // Auto-fetch sessions and accounts on connect
  useEffect(() => {
    if (connected && !fetchedRef.current) {
      fetchedRef.current = true
      fetchSessions()
      fetchAccounts()
    }
    if (!connected) fetchedRef.current = false
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connected])

  // Subscribe to server-pushed permission events from web-gate.
  // In auto mode: auto-approve immediately.
  // In manual/plan mode: emit a PermissionEvent card and wait for user decision.
  useEffect(() => {
    const unsub = onServerNotification(async (notification) => {
      if (notification.method !== 'notifications/permission') return

      try {
        const pending = JSON.parse(
          typeof notification.params === 'string'
            ? notification.params
            : JSON.stringify(notification.params)
        ) as Array<{ id: string; type: string; tool_name?: string; tool_input?: unknown; reason?: string; questions?: Array<{ question: string; header?: string; options: Array<{ label: string; description?: string }>; multiSelect?: boolean }> }>

        const mode = store.getState().chatMode

        for (const req of pending) {
          const sendingIds = store.getState().sendingSessionIds
          const sid = sendingIds.length > 0 ? sendingIds[0] : null

          if (mode === 'auto') {
            // Auto mode: approve immediately, show brief status
            if (sid) {
              store.getState().setTypingStatus(sid,
                req.type === 'permission'
                  ? `Approving: ${req.tool_name || 'tool'}`
                  : 'Answering question...')
            }
            callTool('respond_permission', {
              id: req.id,
              decision: 'approve',
            }).catch(() => {})
          } else {
            // Manual/plan mode: emit a card in the active message.
            const alreadyEmitted = _emittedPermissionIds.has(req.id)
            _emittedPermissionIds.add(req.id)

            const hasActiveSession = sid && _activeStreamingMessages.get(sid)

            if (!hasActiveSession) {
              // No active session — these are orphaned items from a finished
              // or dead session. Auto-dismiss them to clean the backend store.
              // Retry every poll cycle until the backend removes them.
              if (!_dismissedPermissionIds.has(req.id)) {
                _dismissedPermissionIds.add(req.id)
                callTool('respond_permission', {
                  id: req.id,
                  decision: 'approve',
                  ...(req.type === 'question' ? { answer: '(dismissed — no active session)' } : {}),
                }).catch(() => {})
              }
              continue
            }

            // Skip if we already emitted a card for this request ID.
            if (alreadyEmitted) continue
            const msgId = _activeStreamingMessages.get(sid)!

            if (req.type === 'question' && req.questions?.length) {
              // Question request — show QuestionCard with options.
              // Claude CLI retries questions with new IDs when the previous
              // one isn't answered quickly. Auto-dismiss old questions and
              // only show the latest.
              if (_activeQuestionRequestId && _activeQuestionRequestId !== req.id) {
                // Fire-and-forget the old question dismissal (don't await)
                callTool('respond_permission', {
                  id: _activeQuestionRequestId,
                  decision: 'approve',
                  answer: '(superseded by newer question)',
                }).catch(() => {})
              }
              _activeQuestionRequestId = req.id

              const questions: QuestionItem[] = req.questions.map(q => ({
                question: q.question,
                header: q.header,
                options: q.options.map(o => ({ label: o.label, description: o.description })),
                multiSelect: q.multiSelect,
              }))
              const questionEvent: QuestionEvent = {
                id: `question-${req.id}`,
                type: 'question',
                requestId: req.id,
                questions,
                status: 'running',
              }
              store.getState().appendEvent(sid, msgId, questionEvent)
              store.getState().setTypingStatus(sid,
                `Waiting for answer: ${questions[0]?.header || 'question'}`)
            } else {
              // Permission request — show PermissionCard with Approve/Deny
              // Dedup by tool+input fingerprint — Claude CLI sometimes sends
              // multiple permission requests for the same tool call with different IDs.
              const inputStr = typeof req.tool_input === 'string'
                ? req.tool_input
                : req.tool_input ? JSON.stringify(req.tool_input) : undefined
              const fingerprint = `${req.tool_name}::${inputStr ?? ''}`

              if (_emittedPermissionFingerprints.has(fingerprint)) {
                // Duplicate tool call — auto-approve silently so it doesn't block.
                callTool('respond_permission', {
                  id: req.id,
                  decision: 'approve',
                }).catch(() => {})
                continue
              }
              _emittedPermissionFingerprints.add(fingerprint)

              const permEvent: PermissionEvent = {
                id: `perm-${req.id}`,
                type: 'permission',
                requestId: req.id,
                toolName: req.tool_name || 'unknown',
                toolInput: inputStr,
                reason: req.reason,
                status: 'running',
              }
              store.getState().appendEvent(sid, msgId, permEvent)
              store.getState().setTypingStatus(sid,
                `Waiting for approval: ${req.tool_name || 'tool'}`)
            }
          }
        }
      } catch (err) {
        console.error('[copilot] permission notification error:', err)
      }
    })
    return unsub
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [callTool])

  // Subscribe to real-time session events from web-gate.
  // This is the core streaming handler — events arrive every ~200ms.
  useEffect(() => {
    const unsub = onServerNotification((notification) => {
      if (notification.method !== 'notifications/events') return

      try {
        // params is already parsed from JSON by the WebSocket handler
        const events: BridgeChatEvent[] = Array.isArray(notification.params)
          ? notification.params
          : JSON.parse(typeof notification.params === 'string'
              ? notification.params
              : JSON.stringify(notification.params))

        for (const ev of events) {
          // Find the active streaming message for this session.
          // The session_id from bridge-claude may be the internal claude session
          // ID, so we check all active streaming sessions.
          let targetSession: string | null = null
          let targetMsgId: string | null = null

          // Direct match by session_id
          if (ev.session_id && _activeStreamingMessages.has(ev.session_id)) {
            targetSession = ev.session_id
            targetMsgId = _activeStreamingMessages.get(ev.session_id)!
          } else {
            // Fallback: if there's only one active streaming message, use it
            if (_activeStreamingMessages.size === 1) {
              const [[sid, mid]] = _activeStreamingMessages
              targetSession = sid
              targetMsgId = mid
            }
          }

          if (!targetSession || !targetMsgId) {
            continue
          }

          switch (ev.type) {
            case 'tool_start': {
              const card = bridgeEventToCard(ev)
              card.status = 'running'
              store.getState().appendEvent(targetSession, targetMsgId, card)
              store.getState().setTypingStatus(targetSession,
                `Running: ${ev.tool_name || 'tool'}`)
              // Track that we received at least one streaming event
              const count = streamedEventCountRef.current.get(targetSession) || 0
              streamedEventCountRef.current.set(targetSession, count + 1)
              break
            }

            case 'tool_end': {
              // Find and update the matching event's status + merge result content
              const toolId = ev.tool_id || ev.tool_name || ''
              const newStatus = ev.tool_error ? 'error' : 'done'
              const updates: Partial<ClaudeCodeEvent> = { status: newStatus }
              // Merge tool result into the event for rich rendering (bash output, etc.)
              if (ev.tool_result) {
                const tn = (ev.tool_name || '').toLowerCase()
                if (tn === 'bash') {
                  (updates as any).output = ev.tool_result
                } else if (tn === 'grep') {
                  (updates as any).resultText = ev.tool_result
                } else if (tn === 'read') {
                  (updates as any).content = ev.tool_result
                } else {
                  (updates as any).resultText = ev.tool_result
                }
              }
              store.getState().updateEvent(targetSession, targetMsgId, toolId, updates)
              break
            }

            case 'text_chunk': {
              // Don't append text chunks — the final response from
              // send_message is authoritative. Text chunks would accumulate
              // duplicated content since the response includes everything.
              // Instead, we just update the typing status.
              break
            }

            case 'thinking': {
              if (ev.text) {
                store.getState().setMessageThinking(targetSession, targetMsgId, ev.text)
              }
              break
            }

            case 'status': {
              if (ev.text) {
                store.getState().setTypingStatus(targetSession, ev.text)
              }
              break
            }

            case 'result': {
              // Result event indicates the process is finishing.
              // The actual finalization happens when send_message returns.
              break
            }

            case 'permission': {
              // Permission cards are created by the permission poller
              // (notifications/permission), not here. The event stream fires
              // faster (200ms vs 1s) but the poller is authoritative.
              const mode = store.getState().chatMode
              if (mode === 'auto') {
                store.getState().setTypingStatus(targetSession,
                  `Approving: ${ev.tool_name || 'tool'}`)
              } else {
                store.getState().setTypingStatus(targetSession,
                  `Waiting for approval: ${ev.tool_name || 'tool'}`)
              }
              break
            }

            case 'question': {
              // Question status — handled by permission poller for card creation.
              const qMode = store.getState().chatMode
              store.getState().setTypingStatus(targetSession,
                qMode === 'auto' ? 'Answering question...' : 'Waiting for answer...')
              break
            }

            case 'error': {
              if (ev.text) {
                store.getState().setTypingStatus(targetSession, `Error: ${ev.text}`)
              }
              break
            }
          }
        }
      } catch {
        // Invalid notification format, ignore
      }
    })
    return unsub
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchSessions = useCallback(async () => {
    if (status !== 'connected') return
    try {
      const result = await callTool('list_sessions')
      const parsed = parseSessions(getMCPText(result))
      // Bidirectional merge:
      // 1. Update existing sessions with backend metadata, preserve messages
      // 2. Add new backend sessions not in local store
      // 3. Keep local-only sessions (not on backend) — they may still have messages
      const existing = store.getState().sessions
      const backendIds = new Set(parsed.map(s => s.id))
      const merged = [
        // Backend sessions: use backend metadata, keep local messages
        ...parsed.map(s => {
          const old = existing.find(e => e.id === s.id)
          return old ? { ...s, messages: old.messages } : s
        }),
        // Local-only sessions: keep them (backend might not have them yet)
        ...existing.filter(s => !backendIds.has(s.id)),
      ]
      store.getState().setSessions(merged)
    } catch {
      // Silently fail — bridge plugin may not be running
    }
  }, [status, callTool])

  const loadSession = useCallback(async (sessionId: string) => {
    if (status !== 'connected') return
    try {
      const result = await callTool('get_session', { session_id: sessionId, message_count: 50 })
      const parsed = parseSessionDetail(getMCPText(result))

      // Ensure session exists in store
      const existing = store.getState().getSession(sessionId)
      if (!existing) {
        store.getState().addSession({
          id: sessionId,
          title: parsed.meta.name || sessionId,
          messages: [],
          accountId: parsed.meta.account,
          model: parsed.meta.model,
          provider: parsed.meta.provider,
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
      }

      // Extract tool events from assistant messages so they render as cards.
      // If a message already has events (from persisted turn data), skip the
      // regex fallback — persisted events have full tool_data for rich rendering.
      const messagesWithEvents = parsed.messages.map(msg => {
        if (msg.role !== 'assistant' || !msg.content) return msg
        if (msg.events && msg.events.length > 0) return msg // already has persisted events
        const { cleanedText, events } = extractToolEvents(msg.content)
        if (events.length === 0) return msg
        return { ...msg, content: cleanedText, events }
      })

      // Only replace messages if the backend returned actual content.
      // If the backend returns empty (server restart, missing turns),
      // keep what's already in the store (from localStorage persistence).
      const existingMessages = store.getState().getSession(sessionId)?.messages ?? []
      if (messagesWithEvents.length > 0) {
        store.getState().setSessionMessages(sessionId, messagesWithEvents)
      } else if (existingMessages.length === 0) {
        // Both empty — nothing to do
      }
      // else: backend empty but store has messages — keep store messages
    } catch {
      // Failed to load — keep existing messages in store
    }
  }, [status, callTool])

  // Respond to a permission or question request
  const respondPermission = useCallback((requestId: string, decision: 'approve' | 'deny', answer?: string) => {
    if (status !== 'connected') {
      console.warn('[copilot] respondPermission: not connected, skipping', requestId.slice(0, 8))
      return
    }
    const args: Record<string, unknown> = { id: requestId, decision }
    if (answer !== undefined) args.answer = answer
    // Fire-and-forget: don't await. The backend handler removes the item
    // from the store and writes the answer to Claude CLI stdin. We don't
    // need confirmation — the permission poller will stop returning this ID.
    callTool('respond_permission', args).catch(
      (err) => console.warn('[copilot] respondPermission failed:', requestId.slice(0, 8), err),
    )
  }, [status, callTool])

  const sendMessage = useCallback(async (sessionId: string, text: string) => {
    if (status !== 'connected' || !text.trim()) return

    // ── 1. Read session metadata ─────────────────────────────
    const session = store.getState().getSession(sessionId)
    if (!session) return

    // ── 2. Optimistic UI — user msg + placeholder ─────────────
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toISOString(),
    }

    const assistantMsgId = `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    const placeholderMsg: ChatMessage = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
      markdown: true,
      streaming: true,
    }

    store.getState().pushMessage(sessionId, userMsg)
    store.getState().pushMessage(sessionId, placeholderMsg)
    store.getState().addSendingSession(sessionId)
    store.getState().setTypingStatus(sessionId, 'Thinking...')

    // Auto-name session from first user message
    const currentTitle = session.title
    if (!currentTitle || currentTitle === session.id || currentTitle === 'New Chat') {
      const autoTitle = text.trim().slice(0, 60) + (text.trim().length > 60 ? '...' : '')
      store.getState().renameSession(sessionId, autoTitle)
    }

    // Register this as the active streaming message so the event
    // notification handler knows where to append real-time events.
    _activeStreamingMessages.set(sessionId, assistantMsgId)
    streamedEventCountRef.current.set(sessionId, 0)

    try {
      // ── 3. Call send_message (tools-sessions) ─────────────────
      // This blocks until the response is complete. While blocked, the
      // web-gate event poller pushes real-time events (tool_start,
      // tool_end, text_chunk, thinking, etc.) via notifications/events
      // which the effect handler above processes incrementally.
      // Pass current chatMode as permission_mode so the backend spawns
      // the Claude process with the right mode, even if the session was
      // originally created with a different one.
      const currentMode = store.getState().chatMode
      const permMode = currentMode === 'manual' ? 'default'
        : currentMode === 'plan' ? 'plan'
        : 'bypassPermissions'

      const selectedModel = store.getState().selectedModelId
      const result = await callTool('send_message', {
        session_id: sessionId,
        message: text.trim(),
        permission_mode: permMode,
        ...(selectedModel ? { model: selectedModel } : {}),
      }, 5 * 60 * 1000)

      const raw = getMCPText(result)
      // DEBUG: trace truncation — REMOVE after diagnosing
      console.warn('[copilot:trunc] blocks:', result.content?.length, 'raw:', raw.length, 'raw tail:', raw.slice(-100))
      const { content, meta } = parseTurnResponse(raw)
      console.warn('[copilot:trunc] parsed:', content.length, 'tail:', content.slice(-100))

      // Update session metadata (claude session ID for resume, model, tokens)
      if (meta.claudeSessionId || meta.model) {
        store.getState().setSessionMeta(sessionId, {
          claudeSessionId: meta.claudeSessionId,
          model: meta.model,
          tokensIn: meta.tokensIn,
          tokensOut: meta.tokensOut,
          cost: meta.cost,
          durationMs: meta.durationMs,
        })
      }

      // Check if we received streaming events during the request.
      // If yes, the message already has tool cards from real-time streaming.
      // If no, fall back to extracting events from the response text.
      const streamedCount = streamedEventCountRef.current.get(sessionId) || 0

      // Usage metadata to attach to the message for status bar display
      const usageMeta = {
        model: meta.model,
        tokensIn: meta.tokensIn,
        tokensOut: meta.tokensOut,
        cost: meta.cost,
        durationMs: meta.durationMs,
      }

      if (streamedCount > 0) {
        // Real-time events were received — finalize with authoritative text.
        // Strip tool markers since events were already streamed as cards.
        const { cleanedText } = extractToolEvents(content)
        console.warn('[copilot:trunc] streamed final:', cleanedText.length, 'tail:', cleanedText.slice(-100))
        store.getState().patchMessage(sessionId, assistantMsgId, {
          content: cleanedText || '(No response)',
          streaming: false,
          ...usageMeta,
        })
      } else {
        // No streaming events received — extract from response text.
        const { cleanedText, events } = extractToolEvents(content)
        console.warn('[copilot:trunc] fallback final:', cleanedText.length, 'events:', events.length, 'tail:', cleanedText.slice(-100))
        store.getState().patchMessage(sessionId, assistantMsgId, {
          content: cleanedText || '(No response)',
          streaming: false,
          ...usageMeta,
          events: events.length > 0 ? events : undefined,
        })
      }
    } catch (e) {
      console.error('[copilot] sendMessage error:', e)
      store.getState().patchMessage(sessionId, assistantMsgId, {
        content: `Error: ${(e as Error).message}`,
        streaming: false,
      })
    } finally {
      // Clean up streaming state
      _activeStreamingMessages.delete(sessionId)
      streamedEventCountRef.current.delete(sessionId)
      _emittedPermissionIds.clear()
      _dismissedPermissionIds.clear()
      _emittedPermissionFingerprints.clear()
      _activeQuestionRequestId = null
      store.getState().removeSendingSession(sessionId)
      store.getState().setTypingStatus(sessionId, null)
    }
  }, [status, callTool])

  const fetchAccounts = useCallback(async () => {
    if (status !== 'connected') return
    try {
      const result = await callTool('list_accounts')
      const parsed = parseAccounts(getMCPText(result))
      store.getState().setAccounts(parsed)
    } catch {
      store.getState().setAccounts([])
    }
  }, [status, callTool])

  const createSession = useCallback(async (accountId?: string, name?: string, systemPrompt?: string): Promise<string | null> => {
    if (status !== 'connected') return null
    try {
      // Auto-resolve account: use provided, or first available, or auto-create one
      let resolvedAccountId = accountId
      if (!resolvedAccountId) {
        if (!store.getState().accountsLoaded) await fetchAccounts()
        const accs = store.getState().accounts
        if (accs.length > 0) {
          resolvedAccountId = accs[0].id
        } else {
          // No accounts — create one using the tunnel's claude_code auth
          const createResult = await callTool('create_account', {
            name: 'Claude Code',
            auth_method: 'claude_code',
          })
          const accText = getMCPText(createResult)
          const accIdMatch = accText.match(/ACC-[A-Z0-9]+/i)
          if (accIdMatch) {
            resolvedAccountId = accIdMatch[0]
            await fetchAccounts()
          }
        }
      }
      if (!resolvedAccountId) return null

      const args: Record<string, unknown> = { account_id: resolvedAccountId }
      if (name?.trim()) args.name = name.trim()
      if (systemPrompt?.trim()) args.system_prompt = systemPrompt.trim()

      // Pass the selected model so the session uses the right one
      const selectedModel = store.getState().selectedModelId
      if (selectedModel) args.model = selectedModel

      // Map chatMode to permission_mode for the session
      const mode = store.getState().chatMode
      if (mode === 'manual') {
        args.permission_mode = 'default'
      } else if (mode === 'plan') {
        args.permission_mode = 'plan'
      }
      // 'auto' → omit permission_mode, backend defaults to bypassPermissions

      const result = await callTool('create_session', args)
      const text = getMCPText(result)
      const idMatch = text.match(/SES-[A-Z0-9]+/i) || text.match(/([a-f0-9-]{36})/i)
      const newId = idMatch?.[0] ?? null

      if (newId) {
        store.getState().addSession({
          id: newId,
          title: name?.trim() || 'New Chat',
          messages: [],
          accountId: resolvedAccountId,
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
        store.getState().setCopilotSessionId(newId)
      }

      // Refresh session list
      await fetchSessions()
      return newId
    } catch {
      return null
    }
  }, [status, callTool, fetchSessions, fetchAccounts])

  const stopSession = useCallback(async (sessionId: string) => {
    if (status !== 'connected') return
    try {
      const session = store.getState().getSession(sessionId)
      const claudeSessionId = session?.lastTurnMeta?.claudeSessionId
      if (claudeSessionId) {
        await callTool('kill_session', { session_id: claudeSessionId })
      }
    } catch { /* best effort */ }

    // Clean up UI state
    const msgId = _activeStreamingMessages.get(sessionId)
    if (msgId) {
      const currentContent = store.getState().getSession(sessionId)?.messages.find(m => m.id === msgId)?.content
      store.getState().patchMessage(sessionId, msgId, {
        streaming: false,
        content: currentContent || '(Stopped)',
      })
    }
    _activeStreamingMessages.delete(sessionId)
    streamedEventCountRef.current.delete(sessionId)
    _emittedPermissionIds.clear()
    _dismissedPermissionIds.clear()
    _emittedPermissionFingerprints.clear()
    _activeQuestionRequestId = null
    store.getState().removeSendingSession(sessionId)
    store.getState().setTypingStatus(sessionId, null)
  }, [status, callTool])

  const deleteSession = useCallback(async (id: string) => {
    if (status !== 'connected') return
    try {
      await callTool('delete_session', { session_id: id })
      store.getState().removeSession(id)
    } catch {
      // Silently fail
    }
  }, [status, callTool])

  return {
    connected,
    fetchSessions,
    loadSession,
    sendMessage,
    createSession,
    deleteSession,
    stopSession,
    fetchAccounts,
    respondPermission,
  }
}
