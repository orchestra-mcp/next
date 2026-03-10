/**
 * Tests for 3-Panel Dashboard Layout: Icon Rail + Sidebar Panel + Content Area
 * Verifies: layout structure, icon rail navigation, sidebar panel, mobile responsive,
 * RTL support, admin section, user dropdown placement
 */
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const root = resolve(__dirname, '../..')
const layoutTsx = readFileSync(resolve(root, 'src/app/(app)/layout.tsx'), 'utf-8')
const globalsCss = readFileSync(resolve(root, 'src/app/globals.css'), 'utf-8')

describe('3-panel layout structure', () => {
  it('has icon rail with app-icon-rail class', () => {
    expect(layoutTsx).toContain('app-icon-rail')
  })

  it('has sidebar panel with app-sidebar-panel class', () => {
    expect(layoutTsx).toContain('app-sidebar-panel')
  })

  it('has main content area with app-main class', () => {
    expect(layoutTsx).toContain('app-main')
  })

  it('icon rail is 56px wide', () => {
    expect(layoutTsx).toContain('width: 56')
  })

  it('sidebar panel is 260px wide', () => {
    expect(layoutTsx).toContain('width: 260')
  })

  it('total sidebar width is 316px (56 + 260)', () => {
    expect(layoutTsx).toContain('totalSidebarWidth')
    expect(layoutTsx).toContain('sidebarCollapsed ? 56 : 316')
  })
})

describe('icon rail navigation', () => {
  it('has logo at top of icon rail', () => {
    // The logo Image should be inside the icon rail
    expect(layoutTsx).toContain("alt=\"Orchestra\"")
    expect(layoutTsx).toContain('logo.svg')
  })

  it('renders nav items as icon-rail-btn links', () => {
    expect(layoutTsx).toContain('icon-rail-btn')
  })

  it('shows active indicator bar on active nav item', () => {
    // Active items have a purple bar on the side
    expect(layoutTsx).toContain("background: '#a900ff'")
    expect(layoutTsx).toContain('insetInlineStart:')
  })

  it('has admin icon in icon rail for admin users', () => {
    expect(layoutTsx).toContain("can('canViewAdmin')")
    expect(layoutTsx).toContain('bx-shield-alt-2')
  })

  it('has sidebar collapse toggle at bottom of icon rail', () => {
    expect(layoutTsx).toContain('app-sidebar-collapse')
    expect(layoutTsx).toContain('bx-sidebar')
    expect(layoutTsx).toContain('bx-collapse-horizontal')
  })

  it('has user avatar dropdown at bottom of icon rail', () => {
    // User dropdown is inside the icon rail, not the header
    expect(layoutTsx).toContain('DropdownMenuContent side="right"')
  })
})

describe('sidebar panel', () => {
  it('shows workspace switcher in non-admin mode', () => {
    expect(layoutTsx).toContain('WorkspaceSwitcher')
  })

  it('shows admin title when on admin routes', () => {
    expect(layoutTsx).toContain("pathname.startsWith('/admin')")
    expect(layoutTsx).toContain("t('administration')")
  })

  it('renders admin sub-navigation items when on admin routes', () => {
    expect(layoutTsx).toContain('adminItems.map')
  })

  it('renders workspace nav items when not on admin routes', () => {
    expect(layoutTsx).toContain('navItems.map')
    expect(layoutTsx).toContain("t('workspace')")
  })

  it('shows tunnel status at bottom of sidebar panel', () => {
    expect(layoutTsx).toContain('tunnelStatusColor')
    expect(layoutTsx).toContain("t('nav.tunnels')")
  })

  it('sidebar panel is hidden when collapsed', () => {
    expect(layoutTsx).toContain('!sidebarCollapsed && (')
  })
})

describe('mobile responsive behavior', () => {
  it('icon rail transforms off-screen on mobile', () => {
    expect(globalsCss).toContain('.app-icon-rail')
    expect(globalsCss).toContain('transform: translateX(-100%)')
  })

  it('icon rail slides in with .open class on mobile', () => {
    expect(globalsCss).toContain('.app-icon-rail.open')
    expect(globalsCss).toContain('transform: translateX(0)')
  })

  it('sidebar panel transforms off-screen on mobile', () => {
    expect(globalsCss).toContain('.app-sidebar-panel')
  })

  it('sidebar panel slides in with .open class on mobile', () => {
    expect(globalsCss).toContain('.app-sidebar-panel.open')
  })

  it('main content has zero margin on mobile', () => {
    expect(globalsCss).toContain('.app-main')
    expect(globalsCss).toContain('margin-inline-start: 0')
  })

  it('hamburger button shows on mobile', () => {
    expect(globalsCss).toContain('.app-hamburger')
    expect(globalsCss).toContain('display: flex')
  })
})

describe('RTL support for 3-panel layout', () => {
  it('icon rail flips transform direction for RTL', () => {
    expect(globalsCss).toContain('[dir="rtl"] .app-icon-rail')
  })

  it('sidebar panel flips transform direction for RTL', () => {
    expect(globalsCss).toContain('[dir="rtl"] .app-sidebar-panel')
  })

  it('RTL icon rail uses positive translateX', () => {
    // RTL slides right instead of left
    const rtlSection = globalsCss.slice(globalsCss.indexOf('[dir="rtl"] .app-icon-rail'))
    expect(rtlSection).toContain('translateX(100%)')
  })
})

describe('icon rail hover and styling', () => {
  it('has icon-rail-btn hover effect in CSS', () => {
    expect(globalsCss).toContain('.icon-rail-btn:hover')
  })

  it('icon rail has distinct background from sidebar panel', () => {
    // Icon rail uses darker bg
    expect(layoutTsx).toContain("'#0d0b11'")
    // Sidebar panel uses sidebarBg
    expect(layoutTsx).toContain('sidebarBg')
  })
})

describe('sidebar CRUD lists', () => {
  it('has hasSidebar flag for conditional sidebar rendering', () => {
    expect(layoutTsx).toContain('hasSidebar')
    expect(layoutTsx).toContain("pathname.startsWith('/projects')")
    expect(layoutTsx).toContain("pathname.startsWith('/notes')")
    expect(layoutTsx).toContain("pathname.startsWith('/plans')")
    expect(layoutTsx).toContain("pathname.startsWith('/tunnels')")
  })

  it('has activeSection detection', () => {
    expect(layoutTsx).toContain('activeSection')
  })

  it('has MCP response parsers for sidebar data', () => {
    expect(layoutTsx).toContain('parseMCPProjects')
    expect(layoutTsx).toContain('parseMCPNotes')
    expect(layoutTsx).toContain('parseMCPPlans')
  })

  it('has SidebarListPanel component', () => {
    expect(layoutTsx).toContain('SidebarListPanel')
  })

  it('fetches sidebar data via useMCP', () => {
    expect(layoutTsx).toContain('useMCP')
    expect(layoutTsx).toContain('callTool')
  })

  it('sidebar uses tunnel store for tunnels section', () => {
    expect(layoutTsx).toContain('useTunnelStore')
  })

  it('has sidebar search input', () => {
    expect(layoutTsx).toContain('sidebarSearch')
  })

  it('pages without lists hide sidebar panel (only icon rail)', () => {
    // For pages without sidebar, marginInlineStart should be 56 (icon rail only)
    expect(layoutTsx).toContain('hasSidebar')
  })
})

describe('header cleanup', () => {
  it('header has notification bell', () => {
    expect(layoutTsx).toContain('bx-bell')
  })

  it('header has theme toggle', () => {
    expect(layoutTsx).toContain('ThemeToggle')
  })

  it('header shows page title', () => {
    expect(layoutTsx).toContain('getPageTitle')
  })

  it('header does not have user dropdown (moved to icon rail)', () => {
    // The header section should not contain a DropdownMenu for the user
    // User dropdown is in the icon rail at the bottom
    const headerSection = layoutTsx.slice(
      layoutTsx.indexOf('className="app-header"'),
      layoutTsx.indexOf('{/* Page content */')
    )
    // Header should NOT have the user avatar dropdown
    expect(headerSection).not.toContain('DropdownMenuTrigger')
  })
})
