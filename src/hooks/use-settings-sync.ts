'use client'

import { useEffect } from 'react'
import { usePowerSyncQuery } from './use-powersync'
import { useThemeStore } from '@/store/theme'

/**
 * Watches PowerSync `user_settings` table for cross-device settings changes.
 * Applies synced theme_id and locale when they change on other devices.
 */
export function useSettingsSync() {
  const { data: settings } = usePowerSyncQuery<{ key: string; value: string }>(
    'SELECT key, value FROM user_settings'
  )

  const setColorTheme = useThemeStore((s) => s.setColorTheme)

  useEffect(() => {
    if (!Array.isArray(settings) || settings.length === 0) return

    for (let i = 0; i < settings.length; i++) {
      const row = settings[i]
      if (row?.key === 'theme_id' && row?.value) {
        const currentTheme = useThemeStore.getState().colorTheme
        if (row.value !== currentTheme) {
          setColorTheme(row.value)
        }
      }
    }
  }, [settings, setColorTheme])
}
