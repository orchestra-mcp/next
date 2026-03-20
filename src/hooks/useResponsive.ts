'use client'

import { useState, useEffect } from 'react'

interface ResponsiveState {
  isMobile: boolean   // < 768px
  isTablet: boolean   // 768–1024px
  isDesktop: boolean  // > 1024px
  width: number
}

export function useResponsive(): ResponsiveState {
  const [state, setState] = useState<ResponsiveState>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    width: 1200,
  })

  useEffect(() => {
    function update() {
      const w = window.innerWidth
      setState({
        isMobile: w < 768,
        isTablet: w >= 768 && w <= 1024,
        isDesktop: w > 1024,
        width: w,
      })
    }

    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  return state
}
