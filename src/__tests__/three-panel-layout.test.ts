/**
 * Tests for 3-Panel Dashboard Layout using @orchestra-mcp/app-shell
 * Verifies: layout composition, AppShell usage, sidebar data hook, mobile responsive CSS
 */
import { describe, it, expect } from 'vitest'
import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'

const root = resolve(__dirname, '../..')
const layoutTsx = readFileSync(resolve(root, 'src/app/(app)/layout.tsx'), 'utf-8')
const globalsCss = readFileSync(resolve(root, 'src/app/globals.css'), 'utf-8')

describe('AppShell composition', () => {
  it('imports AppShell from @orchestra-mcp/app-shell', () => {
    expect(layoutTsx).toContain("from '@orchestra-mcp/app-shell'")
    expect(layoutTsx).toContain('AppShell')
  })

  it('imports AppIconBar adapter', () => {
    expect(layoutTsx).toContain('AppIconBar')
    expect(layoutTsx).toContain("from '@/components/layout/app-icon-bar'")
  })

  it('imports AppHeader adapter', () => {
    expect(layoutTsx).toContain('AppHeader')
    expect(layoutTsx).toContain("from '@/components/layout/app-header'")
  })

  it('imports AppSidebar adapter', () => {
    expect(layoutTsx).toContain('AppSidebar')
    expect(layoutTsx).toContain("from '@/components/layout/app-sidebar'")
  })

  it('uses useSidebarData hook for data fetching', () => {
    expect(layoutTsx).toContain('useSidebarData')
    expect(layoutTsx).toContain("from '@/hooks/useSidebarData'")
  })

  it('renders AppShell with iconBar, header, sidebar props', () => {
    expect(layoutTsx).toContain('<AppShell')
    expect(layoutTsx).toContain('iconBar={')
    expect(layoutTsx).toContain('header={')
    expect(layoutTsx).toContain('sidebar={')
    expect(layoutTsx).toContain('sidebarOpen={')
  })
})

describe('sidebar data hook', () => {
  it('useSidebarData.ts exists', () => {
    expect(existsSync(resolve(root, 'src/hooks/useSidebarData.ts'))).toBe(true)
  })

  it('imports sidebar types from @/types/sidebar', () => {
    const hookSrc = readFileSync(resolve(root, 'src/hooks/useSidebarData.ts'), 'utf-8')
    expect(hookSrc).toContain("from '@/types/sidebar'")
  })

  it('has MCP response parsers', () => {
    const hookSrc = readFileSync(resolve(root, 'src/hooks/useSidebarData.ts'), 'utf-8')
    expect(hookSrc).toContain('parseMCPProjects')
    expect(hookSrc).toContain('parseMCPNotes')
    expect(hookSrc).toContain('parseMCPPlans')
  })

  it('has CRUD action handlers', () => {
    const hookSrc = readFileSync(resolve(root, 'src/hooks/useSidebarData.ts'), 'utf-8')
    expect(hookSrc).toContain('handleDelete')
    expect(hookSrc).toContain('handlePin')
    expect(hookSrc).toContain('handleRename')
    expect(hookSrc).toContain('handleIcon')
    expect(hookSrc).toContain('handleColor')
  })
})

describe('layout features', () => {
  it('has keyboard shortcuts (CMD+K search, CMD+J smart action)', () => {
    expect(layoutTsx).toContain("e.key === 'k'")
    expect(layoutTsx).toContain("e.key === 'j'")
    expect(layoutTsx).toContain('setSearchOpen')
    expect(layoutTsx).toContain('setSmartActionOpen')
  })

  it('has search spotlight', () => {
    expect(layoutTsx).toContain('SearchSpotlight')
  })

  it('has feature-gated main area', () => {
    expect(layoutTsx).toContain('FeatureGatedMain')
  })

  it('has impersonation banner', () => {
    expect(layoutTsx).toContain('impersonating')
    expect(layoutTsx).toContain('exitImpersonation')
  })

  it('has tunnel toast overlay', () => {
    expect(layoutTsx).toContain('TunnelToastOverlay')
  })

  it('has notification toast overlay', () => {
    expect(layoutTsx).toContain('NotificationToastOverlay')
  })

  it('has noSidebarPages set for pages without sidebar', () => {
    expect(layoutTsx).toContain('noSidebarPages')
    expect(layoutTsx).toContain('/workspaces')
    expect(layoutTsx).toContain('/dashboard')
    expect(layoutTsx).toContain('/terminal')
  })

  it('has create item modals', () => {
    expect(layoutTsx).toContain('CreateItemModal')
    expect(layoutTsx).toContain('CreateProjectWizard')
  })
})

describe('app-shell package', () => {
  it('AppShell component exists', () => {
    const shellRoot = resolve(root, '../../components/app-shell')
    expect(existsSync(resolve(shellRoot, 'src/AppShell/AppShell.tsx'))).toBe(true)
  })

  it('IconBar component exists', () => {
    const shellRoot = resolve(root, '../../components/app-shell')
    expect(existsSync(resolve(shellRoot, 'src/IconBar/IconBar.tsx'))).toBe(true)
  })

  it('ContextualSidebar component exists', () => {
    const shellRoot = resolve(root, '../../components/app-shell')
    expect(existsSync(resolve(shellRoot, 'src/ContextualSidebar/ContextualSidebar.tsx'))).toBe(true)
  })

  it('SidebarItem component exists', () => {
    const shellRoot = resolve(root, '../../components/app-shell')
    expect(existsSync(resolve(shellRoot, 'src/SidebarItem/SidebarItem.tsx'))).toBe(true)
  })

  it('BulkActionBar component exists', () => {
    const shellRoot = resolve(root, '../../components/app-shell')
    expect(existsSync(resolve(shellRoot, 'src/BulkActionBar/BulkActionBar.tsx'))).toBe(true)
  })
})

describe('mobile responsive behavior', () => {
  it('has mobile breakpoint styles in CSS', () => {
    expect(globalsCss).toContain('@media')
  })
})
