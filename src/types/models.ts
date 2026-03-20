// Re-export team types from roles store
export type { Team, TeamMember, Role } from '@/store/roles'

// ── Base model matching Go SyncModel ──

export interface SyncModel {
  id: string
  version: number
  created_at: string
  updated_at: string
}

// ── Workspace ──

export interface Workspace extends SyncModel {
  name: string
  slug: string
  team_id: string
  description?: string
  project_count: number
  member_count: number
}

// ── Project ──

export interface Project extends SyncModel {
  name: string
  slug: string
  description?: string
  workspace_id: string
  team_id: string
}

// ── Feature ──

export type FeatureStatus =
  | 'backlog'
  | 'todo'
  | 'in-progress'
  | 'in-testing'
  | 'in-docs'
  | 'in-review'
  | 'needs-edits'
  | 'done'

export type FeaturePriority = 'P0' | 'P1' | 'P2' | 'P3'

export type FeatureKind = 'feature' | 'bug' | 'hotfix' | 'chore' | 'testcase'

export interface Feature extends SyncModel {
  project_id: string
  title: string
  body?: string
  status: FeatureStatus
  priority: FeaturePriority
  kind: FeatureKind
  assignee_id?: number   // User ID (TeamMember.id), NOT MCP person
  labels: string[]
  estimate?: string
}

// ── Delegation ──

export type DelegationStatus = 'pending' | 'answered' | 'dismissed'

export interface Delegation {
  id: string
  user_id: number
  team_id: number
  project_slug: string
  delegation_id: string
  feature_id: string
  from_person: string
  to_person: string
  question: string
  context: string
  response: string
  status: DelegationStatus
  responded_at: string | null
  body: string
  version: number
  created_at: string
  updated_at: string
}

// ── Sync Events ──

export interface SyncEvent {
  type: string
  entity_type: string
  entity_id: string
  action: 'created' | 'updated' | 'deleted' | 'status_changed'
  user_id: number
  team_id: string
  workspace_id?: string
  timestamp: number
  payload?: Record<string, unknown>
}

// ── Connected Tunnel ──

export interface ConnectedTunnel {
  id: string
  name: string
  workspace?: string
  status: string
  user_id: number
  last_seen_at?: string
}
