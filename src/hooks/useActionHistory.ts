'use client'

import { useState, useCallback } from 'react'
import { apiFetch } from '@/lib/api'

export interface ActionHistoryEntry {
  id: string
  user_id: number
  tunnel_id: string
  action_type: string
  tool_name: string
  params: Record<string, unknown>
  success: boolean
  duration_ms: number
  error?: string
  created_at: string
}

interface ActionHistoryResponse {
  entries: ActionHistoryEntry[]
  total: number
  limit: number
  offset: number
}

/**
 * Fetches action history for a specific tunnel or across all tunnels.
 */
export function useActionHistory() {
  const [entries, setEntries] = useState<ActionHistoryEntry[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)

  const fetchHistory = useCallback(async (opts?: {
    tunnelId?: string
    type?: string
    limit?: number
    offset?: number
  }) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (opts?.type) params.set('type', opts.type)
      if (opts?.limit) params.set('limit', String(opts.limit))
      if (opts?.offset) params.set('offset', String(opts.offset))

      const qs = params.toString() ? `?${params.toString()}` : ''
      const path = opts?.tunnelId
        ? `/api/tunnels/${opts.tunnelId}/actions/history${qs}`
        : `/api/actions/history${qs}`

      const data = await apiFetch<ActionHistoryResponse>(path)
      setEntries(data.entries ?? [])
      setTotal(data.total)
      return data
    } catch {
      setEntries([])
      setTotal(0)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  return { entries, total, loading, fetchHistory }
}
