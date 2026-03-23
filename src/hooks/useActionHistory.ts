'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

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
      const sb = createClient()
      let query = sb.from('action_history').select('*', { count: 'exact' })

      if (opts?.tunnelId) query = query.eq('tunnel_id', opts.tunnelId)
      if (opts?.type) query = query.eq('action_type', opts.type)

      query = query.order('created_at', { ascending: false })

      const limit = opts?.limit ?? 50
      const offset = opts?.offset ?? 0
      query = query.range(offset, offset + limit - 1)

      const { data, count, error } = await query
      if (error) throw error

      const fetchedEntries = (data ?? []) as ActionHistoryEntry[]
      setEntries(fetchedEntries)
      setTotal(count ?? 0)
      return { entries: fetchedEntries, total: count ?? 0, limit, offset }
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
