'use client'
import { useLocale } from 'next-intl'
import { isRTL, getDirection, type Locale } from '@/i18n/config'

export function useDirection() {
  const locale = useLocale() as Locale
  return {
    locale,
    dir: getDirection(locale),
    isRTL: isRTL(locale),
  }
}
