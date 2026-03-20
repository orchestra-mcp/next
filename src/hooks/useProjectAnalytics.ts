'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useMCP } from './useMCP'
import {
  parseProjectList,
  parseFeatureTable,
  parseProgress,
  parseBlockedFeatures,
  parseWorkload,
  parseAuditTrail,
  type FeatureSummary,
  type ProjectSummary,
  type ProgressData,
  type BlockedFeature,
  type WorkloadEntry,
  type AuditEntry,
  type ActivityItem,
} from '@/lib/mcp-parsers'

// ── Types ──────────────────────────────────────────────────────────

export type HealthStatus = 'green' | 'yellow' | 'red'

export interface ProjectHealth {
  id: string
  name: string
  health: HealthStatus
  completionPct: number
  totalFeatures: number
  doneFeatures: number
  inProgressCount: number
  blockedCount: number
  reviewQueueCount: number
}

export interface BurndownPoint {
  date: string
  remaining: number
  ideal: number
}

export interface VelocityPoint {
  week: string
  completed: number
}

export interface ProjectAnalytics {
  projects: ProjectHealth[]
  burndownData: Record<string, BurndownPoint[]>
  velocityData: VelocityPoint[]
  averageVelocity: number
  activities: ActivityItem[]
  workload: WorkloadEntry[]
  loading: boolean
  activeProjectId: string | null
  setActiveProjectId: (id: string) => void
  refresh: () => void
}

// ── Health Computation ─────────────────────────────────────────────

function computeHealth(
  progress: ProgressData,
  blocked: BlockedFeature[],
  reviewCount: number,
): HealthStatus {
  if (progress.total === 0) return 'green'
  const blockedPct = blocked.length / progress.total
  if (blockedPct > 0.2) return 'red'
  if (blockedPct > 0 || reviewCount > 3) return 'yellow'
  return 'green'
}

// ── Burndown Computation ───────────────────────────────────────────

function computeBurndown(
  features: FeatureSummary[],
  allAuditTrails: Map<string, AuditEntry[]>,
): BurndownPoint[] {
  const total = features.length
  if (total === 0) return []

  // Collect all "done" dates from audit trails
  const doneDates: Date[] = []
  for (const [, trail] of allAuditTrails) {
    for (const entry of trail) {
      if (entry.toStatus === 'done') {
        doneDates.push(new Date(entry.timestamp))
      }
    }
  }

  if (doneDates.length === 0) {
    // No features done yet — show flat line
    const today = new Date().toISOString().split('T')[0]
    return [{ date: today, remaining: total, ideal: total }]
  }

  doneDates.sort((a, b) => a.getTime() - b.getTime())

  const startDate = new Date(doneDates[0])
  startDate.setDate(startDate.getDate() - 7) // buffer
  const endDate = new Date()

  const points: BurndownPoint[] = []
  let completed = 0
  const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / 86400000) || 1

  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dayStr = d.toISOString().split('T')[0]
    // Count features done by this day
    for (const dd of doneDates) {
      if (dd.toISOString().split('T')[0] === dayStr) completed++
    }
    const dayIndex = Math.ceil((d.getTime() - startDate.getTime()) / 86400000)
    const ideal = Math.max(0, total - (total * dayIndex) / totalDays)
    points.push({ date: dayStr, remaining: total - completed, ideal: Math.round(ideal * 10) / 10 })
  }

  return points
}

// ── Velocity Computation ───────────────────────────────────────────

function computeVelocity(allAuditTrails: Map<string, AuditEntry[]>): {
  points: VelocityPoint[]
  average: number
} {
  const weekCounts: Record<string, number> = {}

  for (const [, trail] of allAuditTrails) {
    for (const entry of trail) {
      if (entry.toStatus === 'done') {
        const d = new Date(entry.timestamp)
        // ISO week start (Monday)
        const monday = new Date(d)
        monday.setDate(d.getDate() - ((d.getDay() + 6) % 7))
        const weekKey = monday.toISOString().split('T')[0]
        weekCounts[weekKey] = (weekCounts[weekKey] || 0) + 1
      }
    }
  }

  const weeks = Object.keys(weekCounts).sort()
  const points = weeks.map(w => ({ week: w, completed: weekCounts[w] }))
  const total = points.reduce((s, p) => s + p.completed, 0)
  const average = points.length > 0 ? Math.round((total / points.length) * 10) / 10 : 0

  return { points, average }
}

// ── Activity Extraction ────────────────────────────────────────────

function extractActivities(
  features: Map<string, { feature: FeatureSummary; projectId: string; projectName: string }>,
  auditTrails: Map<string, AuditEntry[]>,
): ActivityItem[] {
  const items: ActivityItem[] = []
  let counter = 0

  for (const [featureId, trail] of auditTrails) {
    const info = features.get(featureId)
    if (!info) continue

    for (const entry of trail) {
      let action: ActivityItem['action'] = 'advanced'
      if (entry.toStatus === 'done') action = 'completed'
      else if (entry.fromStatus === '' && entry.toStatus === 'todo') action = 'created'

      items.push({
        id: `act-${counter++}`,
        timestamp: entry.timestamp,
        featureId,
        featureTitle: info.feature.title,
        projectId: info.projectId,
        projectName: info.projectName,
        action,
        fromStatus: entry.fromStatus || undefined,
        toStatus: entry.toStatus,
      })
    }
  }

  // Sort newest first, limit to 50
  items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  return items.slice(0, 50)
}

// ── Hook ───────────────────────────────────────────────────────────

export function useProjectAnalytics(): ProjectAnalytics {
  const { callTool, status } = useMCP()
  const [projects, setProjects] = useState<ProjectHealth[]>([])
  const [burndownData, setBurndownData] = useState<Record<string, BurndownPoint[]>>({})
  const [velocityData, setVelocityData] = useState<VelocityPoint[]>([])
  const [averageVelocity, setAverageVelocity] = useState(0)
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [workload, setWorkload] = useState<WorkloadEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null)
  const fetchedRef = useRef(false)

  const fetchAnalytics = useCallback(async () => {
    if (status !== 'connected') return
    setLoading(true)

    try {
      // 1. List all projects
      const projResult = await callTool('list_projects').catch(() => null)
      const projectList = parseProjectList(projResult?.content?.[0]?.text ?? '')

      if (projectList.length === 0) {
        setLoading(false)
        return
      }

      // Set first project as active if none selected
      if (!activeProjectId && projectList.length > 0) {
        setActiveProjectId(projectList[0].id)
      }

      // 2. Fetch per-project data (parallel, limited to 5 projects for perf)
      const limitedProjects = projectList.slice(0, 5)
      const healthResults: ProjectHealth[] = []
      const allFeatures = new Map<string, { feature: FeatureSummary; projectId: string; projectName: string }>()
      const allAuditTrails = new Map<string, AuditEntry[]>()
      const allBurndown: Record<string, BurndownPoint[]> = {}

      await Promise.all(
        limitedProjects.map(async (proj) => {
          const [featResult, progressResult, blockedResult, reviewResult] = await Promise.all([
            callTool('list_features', { project_id: proj.id }).catch(() => null),
            callTool('get_progress', { project_id: proj.id }).catch(() => null),
            callTool('get_blocked_features', { project_id: proj.id }).catch(() => null),
            callTool('get_review_queue', { project_id: proj.id }).catch(() => null),
          ])

          const features = parseFeatureTable(featResult?.content?.[0]?.text ?? '')
          const progress = parseProgress(progressResult?.content?.[0]?.text ?? '')
          const blocked = parseBlockedFeatures(blockedResult?.content?.[0]?.text ?? '')
          const reviewFeatures = parseFeatureTable(reviewResult?.content?.[0]?.text ?? '')

          // Store features for activity extraction
          for (const f of features) {
            allFeatures.set(f.id, { feature: f, projectId: proj.id, projectName: proj.name })
          }

          // Fetch audit trails for features (batch — get feature body)
          // Only for done + in-progress features to limit calls
          const interestingFeatures = features.filter(f =>
            ['done', 'in-progress', 'in-review', 'in-testing'].includes(f.status)
          ).slice(0, 20)

          await Promise.all(
            interestingFeatures.map(async (f) => {
              try {
                const detail = await callTool('get_feature', { feature_id: f.id })
                const body = detail?.content?.[0]?.text ?? ''
                const trail = parseAuditTrail(body)
                if (trail.length > 0) allAuditTrails.set(f.id, trail)
              } catch {
                // skip
              }
            })
          )

          // Compute burndown for this project
          allBurndown[proj.id] = computeBurndown(features, allAuditTrails)

          const health = computeHealth(progress, blocked, reviewFeatures.length)

          healthResults.push({
            id: proj.id,
            name: proj.name,
            health,
            completionPct: progress.completion,
            totalFeatures: progress.total,
            doneFeatures: progress.done,
            inProgressCount: progress.statusCounts['in-progress'] || 0,
            blockedCount: blocked.length,
            reviewQueueCount: reviewFeatures.length,
          })
        })
      )

      // 3. Compute velocity across all projects
      const vel = computeVelocity(allAuditTrails)

      // 4. Extract activities
      const acts = extractActivities(allFeatures, allAuditTrails)

      // 5. Fetch workload (list persons, then workload per person)
      const workloadEntries: WorkloadEntry[] = []
      try {
        const personsResult = await callTool('list_persons', { project_id: limitedProjects[0]?.id }).catch(() => null)
        const personsText = personsResult?.content?.[0]?.text ?? ''
        // Parse person IDs from table
        const personIds: string[] = []
        for (const line of personsText.split('\n')) {
          if (!line.startsWith('|') || line.includes('---')) continue
          const cells = line.split('|').map(c => c.trim()).filter(Boolean)
          if (cells.length >= 2 && cells[0].toLowerCase() !== 'id') {
            personIds.push(cells[0])
          }
        }

        await Promise.all(
          personIds.slice(0, 8).map(async (pid) => {
            try {
              const wResult = await callTool('get_person_workload', {
                project_id: limitedProjects[0]?.id,
                person_id: pid,
              })
              const entry = parseWorkload(wResult?.content?.[0]?.text ?? '')
              if (entry.person) workloadEntries.push(entry)
            } catch {
              // skip
            }
          })
        )
      } catch {
        // skip workload
      }

      setProjects(healthResults)
      setBurndownData(allBurndown)
      setVelocityData(vel.points)
      setAverageVelocity(vel.average)
      setActivities(acts)
      setWorkload(workloadEntries)
    } catch (err) {
      console.error('useProjectAnalytics:', err)
    } finally {
      setLoading(false)
      fetchedRef.current = true
    }
  }, [status, callTool, activeProjectId])

  useEffect(() => {
    if (status === 'connected' && !fetchedRef.current) {
      fetchAnalytics()
    }
  }, [status, fetchAnalytics])

  return {
    projects,
    burndownData,
    velocityData,
    averageVelocity,
    activities,
    workload,
    loading,
    activeProjectId,
    setActiveProjectId,
    refresh: fetchAnalytics,
  }
}
