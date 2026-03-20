'use client'
import { usePathname } from 'next/navigation'

// ── Section detection from pathname ──────────────────────────

export type SidebarSection = 'settings' | 'dashboard' | null

function detectSection(pathname: string): SidebarSection {
  if (pathname.startsWith('/settings')) return 'settings'
  if (pathname.startsWith('/dashboard')) return 'dashboard'
  return null
}

// ── Hook ─────────────────────────────────────────────────────

export interface UseSidebarDataReturn {
  activeSection: SidebarSection
  hasSidebar: boolean
}

export function useSidebarData(): UseSidebarDataReturn {
  const pathname = usePathname()
  const activeSection = detectSection(pathname)
  const hasSidebar = activeSection === 'settings'

  return {
    activeSection,
    hasSidebar,
  }
}
