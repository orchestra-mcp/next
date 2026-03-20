/**
 * Shared MCP markdown response parsers.
 *
 * MCP tools return markdown text — these functions extract typed data
 * from the various formats (bullet lists, pipe tables, progress blocks,
 * audit trail lines).
 */

// ── Types ──────────────────────────────────────────────────────────

export interface FeatureSummary {
  id: string
  title: string
  status: string
  priority: string
  kind: string
  assignee: string
}

export interface ProjectSummary {
  id: string
  name: string
  description?: string
  created_at: string
}

export interface NoteSummary {
  id: string
  title: string
  updated_at: string
}

export interface PlanSummary {
  id: string
  title: string
  status: string
  featureCount: number
}

export interface ProgressData {
  total: number
  done: number
  completion: number
  statusCounts: Record<string, number>
}

export interface BlockedFeature {
  id: string
  title: string
  blockedBy: string[]
}

export interface WorkloadEntry {
  person: string
  statusCounts: Record<string, number>
  total: number
}

export interface AuditEntry {
  timestamp: string
  fromStatus: string
  toStatus: string
  gate?: string
}

export interface ActivityItem {
  id: string
  timestamp: string
  featureId: string
  featureTitle: string
  projectId: string
  projectName: string
  action: 'created' | 'advanced' | 'completed' | 'blocked' | 'assigned'
  fromStatus?: string
  toStatus?: string
  actor?: string
}

// ── Parsers ────────────────────────────────────────────────────────

/** Parse `list_projects` markdown bullet list. */
export function parseProjectList(text: string): ProjectSummary[] {
  const items: ProjectSummary[] = []
  for (const line of text.split('\n')) {
    const m = line.match(/^-\s+\*\*(.+?)\*\*\s+\(`([^)]+)`\)(?:\s*[—–-]\s*(.+))?$/)
    if (m) {
      items.push({
        id: m[2].trim(),
        name: m[1].trim(),
        description: m[3]?.trim(),
        created_at: new Date().toISOString(),
      })
    }
  }
  return items
}

/** Parse MCP pipe-delimited feature table. */
export function parseFeatureTable(text: string): FeatureSummary[] {
  const features: FeatureSummary[] = []
  const lines = text.split('\n')
  let cols: string[] = []

  for (const line of lines) {
    if (!line.startsWith('|') || line.includes('---')) continue
    const cells = line.split('|').map(c => c.trim()).filter(Boolean)
    if (cells.length < 2) continue

    // header row
    if (cells[0].toLowerCase() === 'id') {
      cols = cells.map(c => c.toLowerCase())
      continue
    }

    const row: Record<string, string> = {}
    cells.forEach((cell, i) => { row[cols[i] || `col${i}`] = cell })

    features.push({
      id: row['id'] || cells[0] || '',
      title: row['title'] || cells[1] || '',
      status: row['status'] || cells[2] || '',
      priority: row['priority'] || cells[3] || '',
      kind: row['kind'] || cells[4] || '',
      assignee: row['assignee'] || cells[5] || '',
    })
  }
  return features
}

/** Parse MCP note table (pipe-delimited). */
export function parseNoteTable(text: string): NoteSummary[] {
  const notes: NoteSummary[] = []
  const lines = text.split('\n')
  let cols: string[] = []

  for (const line of lines) {
    if (!line.startsWith('|') || line.includes('---')) continue
    const cells = line.split('|').map(c => c.trim()).filter(Boolean)
    if (cells.length < 2) continue

    if (cells[0].toLowerCase() === 'id') {
      cols = cells.map(c => c.toLowerCase())
      continue
    }

    const row: Record<string, string> = {}
    cells.forEach((cell, i) => { row[cols[i] || `col${i}`] = cell })

    notes.push({
      id: row['id'] || cells[0],
      title: row['title'] || cells[1],
      updated_at: row['updated_at'] || row['updated'] || new Date().toISOString(),
    })
  }
  return notes
}

/** Parse MCP plan table. */
export function parsePlanTable(text: string): PlanSummary[] {
  const plans: PlanSummary[] = []
  const lines = text.split('\n')
  let cols: string[] = []

  for (const line of lines) {
    if (!line.startsWith('|') || line.includes('---')) continue
    const cells = line.split('|').map(c => c.trim()).filter(Boolean)
    if (cells.length < 2) continue

    if (cells[0].toLowerCase() === 'id') {
      cols = cells.map(c => c.toLowerCase())
      continue
    }

    const row: Record<string, string> = {}
    cells.forEach((cell, i) => { row[cols[i] || `col${i}`] = cell })

    plans.push({
      id: row['id'] || cells[0],
      title: row['title'] || cells[1],
      status: row['status'] || cells[2] || 'draft',
      featureCount: parseInt(row['features'] || row['feature_count'] || '0', 10) || 0,
    })
  }
  return plans
}

/** Parse `get_progress` markdown response. */
export function parseProgress(text: string): ProgressData {
  const data: ProgressData = { total: 0, done: 0, completion: 0, statusCounts: {} }

  // Extract bullet-point stats
  const totalM = text.match(/\*\*Total features?:\*\*\s*(\d+)/i)
  if (totalM) data.total = parseInt(totalM[1], 10)

  const doneM = text.match(/\*\*Done:\*\*\s*(\d+)/i)
  if (doneM) data.done = parseInt(doneM[1], 10)

  const compM = text.match(/\*\*Completion:\*\*\s*([\d.]+)%/i)
  if (compM) data.completion = parseFloat(compM[1])

  // Extract status counts table
  const lines = text.split('\n')
  let inTable = false
  for (const line of lines) {
    if (!line.startsWith('|')) { if (inTable) break; continue }
    if (line.includes('---')) { inTable = true; continue }
    if (!inTable) continue

    const cells = line.split('|').map(c => c.trim()).filter(Boolean)
    if (cells.length >= 2) {
      const status = cells[0].toLowerCase().replace(/\s+/g, '-')
      const count = parseInt(cells[1], 10)
      if (!isNaN(count)) data.statusCounts[status] = count
    }
  }

  return data
}

/** Parse `get_blocked_features` response. */
export function parseBlockedFeatures(text: string): BlockedFeature[] {
  const blocked: BlockedFeature[] = []
  for (const line of text.split('\n')) {
    // Format: - **FEAT-XXX** (title) blocked by: FEAT-YYY, FEAT-ZZZ
    const m = line.match(/^-\s+\*\*([A-Z]+-\d+)\*\*\s+\((.+?)\)\s+blocked by:\s*(.+)$/i)
    if (m) {
      blocked.push({
        id: m[1],
        title: m[2].trim(),
        blockedBy: m[3].split(',').map(s => s.trim()),
      })
    }
  }
  return blocked
}

/** Parse `get_person_workload` response. */
export function parseWorkload(text: string): WorkloadEntry {
  const entry: WorkloadEntry = { person: '', statusCounts: {}, total: 0 }

  const nameM = text.match(/## Workload for (.+)/i)
  if (nameM) entry.person = nameM[1].trim()

  const lines = text.split('\n')
  let inTable = false
  for (const line of lines) {
    if (!line.startsWith('|')) { if (inTable) break; continue }
    if (line.includes('---')) { inTable = true; continue }
    if (!inTable) continue

    const cells = line.split('|').map(c => c.trim()).filter(Boolean)
    if (cells.length >= 2) {
      const status = cells[0].toLowerCase().replace(/\s+/g, '-')
      const count = parseInt(cells[1], 10)
      if (!isNaN(count)) {
        entry.statusCounts[status] = count
        entry.total += count
      }
    }
  }

  return entry
}

/**
 * Parse audit trail from feature body.
 * Audit lines look like:
 *   > [2026-03-15T10:30:00Z] in-progress -> in-testing (Gate: Code Complete)
 *   > [2026-03-15T10:30:00Z] Created
 */
export function parseAuditTrail(body: string): AuditEntry[] {
  const entries: AuditEntry[] = []
  for (const line of body.split('\n')) {
    // Transition line
    const m = line.match(/>\s*\[(\d{4}-\d{2}-\d{2}T[\d:.]+Z?)\]\s+(\S+)\s*->\s*(\S+)(?:\s*\((.+)\))?/)
    if (m) {
      entries.push({
        timestamp: m[1],
        fromStatus: m[2],
        toStatus: m[3],
        gate: m[4],
      })
      continue
    }

    // Created line
    const c = line.match(/>\s*\[(\d{4}-\d{2}-\d{2}T[\d:.]+Z?)\]\s+[Cc]reated/)
    if (c) {
      entries.push({
        timestamp: c[1],
        fromStatus: '',
        toStatus: 'todo',
      })
    }
  }
  return entries
}

/** Helper: relative time string (e.g., "2h ago", "3d ago") */
export function relativeTime(iso: string): string {
  const now = Date.now()
  const then = new Date(iso).getTime()
  const diff = now - then
  if (isNaN(diff) || diff < 0) return 'just now'

  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d ago`
  const weeks = Math.floor(days / 7)
  return `${weeks}w ago`
}
