import { column, Schema, TableV2 } from '@powersync/web'

/**
 * PowerSync client-side schema for the Next.js web app.
 * Mirrors the PostgreSQL tables defined in sync-rules.yaml.
 */

const water_logs = new TableV2({ user_id: column.integer, amount_ml: column.integer, logged_at: column.text, source: column.text, is_gout_flush: column.integer, created_at: column.text, updated_at: column.text })
const caffeine_logs = new TableV2({ user_id: column.integer, drink_type: column.text, caffeine_mg: column.integer, is_clean: column.integer, sugar_g: column.integer, logged_at: column.text, created_at: column.text, updated_at: column.text })
const meal_logs = new TableV2({ user_id: column.integer, name: column.text, is_safe: column.integer, category: column.text, triggers: column.text, logged_at: column.text, created_at: column.text, updated_at: column.text })
const pomodoro_sessions = new TableV2({ user_id: column.integer, started_at: column.text, ended_at: column.text, duration_min: column.integer, type: column.text, completed: column.integer, created_at: column.text, updated_at: column.text })
const sleep_configs = new TableV2({ user_id: column.integer, target_bedtime: column.text, shutdown_started_at: column.text, shutdown_active: column.integer, wake_time: column.text, sleep_time: column.text, created_at: column.text, updated_at: column.text })
const health_snapshots = new TableV2({ user_id: column.integer, snapshot_date: column.text, weight_kg: column.real, body_fat_pct: column.real, metabolic_age: column.integer, visceral_fat: column.integer, body_water_pct: column.real, created_at: column.text, updated_at: column.text })
const health_profiles = new TableV2({ user_id: column.integer, target_water_ml: column.integer, caffeine_limit_mg: column.integer, pomodoro_duration_min: column.integer, conditions: column.text, wake_time: column.text, sleep_time: column.text, created_at: column.text, updated_at: column.text })
const sleep_logs = new TableV2({ user_id: column.integer, bed_time: column.text, wake_time: column.text, quality_rating: column.integer, duration_hours: column.real, logged_at: column.text, created_at: column.text, updated_at: column.text })

const notes = new TableV2({ user_id: column.integer, title: column.text, content: column.text, pinned: column.integer, tags: column.text, created_at: column.text, updated_at: column.text })
const projects = new TableV2({ user_id: column.integer, name: column.text, slug: column.text, description: column.text, mode: column.text, stacks: column.text, created_at: column.text, updated_at: column.text })
const features = new TableV2({ project_slug: column.text, user_id: column.integer, title: column.text, description: column.text, status: column.text, kind: column.text, priority: column.text, assignee: column.text, labels: column.text, body: column.text, created_at: column.text, updated_at: column.text })
const agents = new TableV2({ user_id: column.integer, name: column.text, slug: column.text, description: column.text, content: column.text, scope: column.text, icon: column.text, color: column.text, version: column.integer, created_at: column.text, updated_at: column.text })
const skills = new TableV2({ user_id: column.integer, name: column.text, slug: column.text, description: column.text, content: column.text, scope: column.text, icon: column.text, color: column.text, stacks: column.text, version: column.integer, created_at: column.text, updated_at: column.text })
const workflows = new TableV2({ user_id: column.integer, project_slug: column.text, name: column.text, description: column.text, steps: column.text, states: column.text, transitions: column.text, gates: column.text, initial_state: column.text, is_default: column.integer, status: column.text, version: column.integer, created_at: column.text, updated_at: column.text })
const docs = new TableV2({ user_id: column.integer, doc_id: column.text, title: column.text, body: column.text, category: column.text, tags: column.text, version: column.integer, created_at: column.text, updated_at: column.text })
const delegations = new TableV2({ user_id: column.integer, delegation_id: column.text, from_person: column.text, to_person: column.text, question: column.text, context: column.text, response: column.text, status: column.text, created_at: column.text, updated_at: column.text })
const sessions = new TableV2({ user_id: column.integer, name: column.text, provider: column.text, model: column.text, status: column.text, created_at: column.text, updated_at: column.text })

const plans = new TableV2({ user_id: column.integer, project_slug: column.text, plan_id: column.text, title: column.text, description: column.text, status: column.text, body: column.text, version: column.integer, created_at: column.text, updated_at: column.text })
const requests = new TableV2({ user_id: column.integer, project_slug: column.text, request_id: column.text, title: column.text, description: column.text, kind: column.text, priority: column.text, status: column.text, body: column.text, version: column.integer, created_at: column.text, updated_at: column.text })
const persons = new TableV2({ user_id: column.integer, project_slug: column.text, person_id: column.text, name: column.text, email: column.text, role: column.text, status: column.text, bio: column.text, body: column.text, version: column.integer, created_at: column.text, updated_at: column.text })

const workspaces = new TableV2({ owner_id: column.integer, name: column.text, folders: column.text, primary_folder: column.text, status: column.text, metadata: column.text, version: column.integer, created_at: column.text, updated_at: column.text })
const teams = new TableV2({ name: column.text, slug: column.text, plan: column.text, avatar_url: column.text, settings: column.text, created_at: column.text, updated_at: column.text })
const memberships = new TableV2({ user_id: column.integer, team_id: column.text, role: column.text, created_at: column.text, updated_at: column.text })

const user_settings = new TableV2({ user_id: column.integer, key: column.text, value: column.text, updated_at: column.text })

export const powersyncSchema = new Schema({
  water_logs,
  caffeine_logs,
  meal_logs,
  pomodoro_sessions,
  sleep_configs,
  health_snapshots,
  health_profiles,
  sleep_logs,
  notes,
  projects,
  features,
  agents,
  skills,
  workflows,
  docs,
  delegations,
  sessions,
  plans,
  requests,
  persons,
  workspaces,
  teams,
  memberships,
  user_settings,
})
