'use client'

import { useState, useEffect, useCallback } from 'react'
import { isDevSeed } from '@/lib/api'
import { createClient } from '@/lib/supabase/client'
import type { ActivityItem, WorkloadEntry } from '@/lib/mcp-parsers'
import type {
  ProjectHealth,
  BurndownPoint,
  VelocityPoint,
  ProjectAnalytics,
} from './useProjectAnalytics'

// ── API Response Shape ───────────────────────────────────────────

interface TeamAnalyticsResponse {
  projects: ProjectHealth[]
  burndownData: Record<string, BurndownPoint[]>
  velocityData: VelocityPoint[]
  averageVelocity: number
  activities: ActivityItem[]
  workload: WorkloadEntry[]
}

// ── Defaults ─────────────────────────────────────────────────────

const EMPTY_ANALYTICS: TeamAnalyticsResponse = {
  projects: [],
  burndownData: {},
  velocityData: [],
  averageVelocity: 0,
  activities: [],
  workload: [],
}

// ── Hook ─────────────────────────────────────────────────────────

/**
 * Fetches pre-computed analytics from the REST API for the team dashboard.
 *
 * Returns the same `ProjectAnalytics` interface as `useProjectAnalytics`
 * so all dashboard widgets work with either hook.
 */
export function useTeamAnalytics(
  teamId: string | undefined,
  workspaceId?: string | null,
): ProjectAnalytics {
  const [data, setData] = useState<TeamAnalyticsResponse>(EMPTY_ANALYTICS)
  const [loading, setLoading] = useState(!!teamId)
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null)

  const fetchAnalytics = useCallback(async () => {
    // Skip fetch when in dev-seed mode or when teamId is missing
    if (isDevSeed() || !teamId) {
      setData(EMPTY_ANALYTICS)
      setLoading(false)
      return
    }

    setLoading(true)

    try {
      const sb = createClient()
      // Fetch team analytics data from PostgREST
      let projQ = sb.from('projects').select('*').eq('team_id', teamId)
      if (workspaceId) projQ = projQ.eq('workspace_id', workspaceId)
      const { data: projects } = await projQ
      const { data: activities } = await sb.from('activity_log').select('*').eq('team_id', teamId).order('created_at', { ascending: false }).limit(50)
      const response: TeamAnalyticsResponse = {
        projects: (projects || []) as any[],
        burndownData: {},
        velocityData: [],
        averageVelocity: 0,
        activities: (activities || []) as any[],
        workload: [],
      }

      setData(response)

      // Set first project as active if none selected yet
      setActiveProjectId(prev => prev ?? (response.projects[0]?.id ?? null))
    } catch (err) {
      console.error('useTeamAnalytics:', err)
      setData(EMPTY_ANALYTICS)
    } finally {
      setLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamId, workspaceId])

  useEffect(() => {
    fetchAnalytics()
  }, [fetchAnalytics])

  return {
    projects: data.projects,
    burndownData: data.burndownData,
    velocityData: data.velocityData,
    averageVelocity: data.averageVelocity,
    activities: data.activities,
    workload: data.workload,
    loading,
    activeProjectId,
    setActiveProjectId,
    refresh: fetchAnalytics,
  }
}
