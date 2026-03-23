'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useThemeStore } from '@/store/theme'

/**
 * Watches the `user_settings` table via Supabase Realtime for cross-device
 * settings changes. Applies synced theme_id when it changes on other devices.
 */
export function useSettingsSync() {
  const setColorTheme = useThemeStore((s) => s.setColorTheme)

  useEffect(() => {
    const sb = createClient()

    const channel = sb
      .channel('user_settings_sync')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'user_settings' },
        (payload) => {
          const row = payload.new as { key: string; value: string } | undefined
          if (row?.key === 'theme_id' && row?.value) {
            const currentTheme = useThemeStore.getState().colorTheme
            if (row.value !== currentTheme) {
              setColorTheme(row.value)
            }
          }
        }
      )
      .subscribe()

    return () => {
      sb.removeChannel(channel)
    }
  }, [setColorTheme])
}
