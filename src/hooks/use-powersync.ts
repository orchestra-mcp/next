'use client'

import { useEffect, useState, useCallback } from 'react'
import { getPowerSyncDatabase } from '@/lib/powersync'

/**
 * React hook for watching a PowerSync SQL query reactively.
 *
 * Returns `{ data, loading, error, refresh }`.
 * Automatically re-renders when data changes locally or via sync.
 *
 * Usage:
 * ```tsx
 * const { data: notes, loading } = usePowerSyncQuery(
 *   'SELECT * FROM notes WHERE pinned = 1 ORDER BY updated_at DESC'
 * )
 * ```
 */
export function usePowerSyncQuery<T = Record<string, unknown>>(
  sql: string,
  params: unknown[] = []
) {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const refresh = useCallback(async () => {
    try {
      const db = getPowerSyncDatabase()
      const results = await db.getAll(sql, params)
      setData(results as T[])
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)))
    } finally {
      setLoading(false)
    }
  }, [sql, JSON.stringify(params)])

  useEffect(() => {
    const db = getPowerSyncDatabase()
    let cancelled = false

    // Initial load
    refresh()

    // Watch for changes
    const abortController = new AbortController()

    const watchData = async () => {
      try {
        // Guard: db.watch may not be available in all environments
        if (!db || typeof db.watch !== 'function') {
          const results = await db.getAll(sql, params)
          setData(results as T[])
          setLoading(false)
          return
        }
        for await (const results of db.watch(sql, params, {
          signal: abortController.signal,
        })) {
          if (cancelled) break
          setData(results as T[])
          setLoading(false)
        }
      } catch (e) {
        if (!cancelled) {
          // Fallback: try single query if watch fails
          try {
            const results = await db.getAll(sql, params)
            setData(results as T[])
          } catch {}
          setLoading(false)
        }
      }
    }

    watchData()

    return () => {
      cancelled = true
      abortController.abort()
    }
  }, [sql, JSON.stringify(params)])

  return { data, loading, error, refresh }
}

/**
 * Execute a PowerSync SQL mutation (INSERT, UPDATE, DELETE).
 * Changes are written to local SQLite and auto-synced to the server.
 */
export async function executePowerSync(sql: string, params: unknown[] = []) {
  const db = getPowerSyncDatabase()
  return db.execute(sql, params)
}
