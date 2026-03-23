'use client'
import { useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'

/**
 * React hook that returns a memoized Supabase browser client.
 *
 * Usage:
 * ```tsx
 * const supabase = useSupabase()
 * const { data } = await supabase.from('notes').select('*')
 * ```
 */
export function useSupabase() {
  return useMemo(() => createClient(), [])
}
