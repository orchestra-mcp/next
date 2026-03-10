import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock zustand/middleware to bypass localStorage dependency
vi.mock('zustand/middleware', () => ({
  persist: (config: any) => config,
}))

// Mock @orchestra-mcp/theme
const mockSetColorTheme = vi.fn()
const mockSetComponentVariant = vi.fn()
const mockInitTheme = vi.fn()
const mockGetThemeById = vi.fn((id: string) => {
  const themes: Record<string, any> = {
    orchestra: {
      id: 'orchestra', label: 'Orchestra', isLight: false,
      colors: {
        bg: '#0a0a0f', bgAlt: '#131118', bgContrast: '#1a1520',
        bgActive: '#1e1a26', bgSelection: '#2a2435',
        fg: '#e8e8ea', fgDim: '#888890', fgMuted: '#666670', fgBright: '#ffffff',
        border: '#2a2a35', accent: '#a900ff',
      },
    },
    'github-light': {
      id: 'github-light', label: 'GitHub Light', isLight: true,
      colors: {
        bg: '#ffffff', bgAlt: '#f6f8fa', bgContrast: '#ffffff',
        bgActive: '#eaeef2', bgSelection: '#dce5f0',
        fg: '#1f2328', fgDim: '#656d76', fgMuted: '#8b949e', fgBright: '#000000',
        border: '#d0d7de', accent: '#0969da',
      },
    },
    dracula: {
      id: 'dracula', label: 'Dracula', isLight: false,
      colors: {
        bg: '#282a36', bgAlt: '#21222c', bgContrast: '#343746',
        bgActive: '#44475a', bgSelection: '#44475a',
        fg: '#f8f8f2', fgDim: '#b0b0b8', fgMuted: '#6272a4', fgBright: '#ffffff',
        border: '#44475a', accent: '#bd93f9',
      },
    },
  }
  return themes[id] || null
})

vi.mock('@orchestra-mcp/theme', () => ({
  setColorTheme: mockSetColorTheme,
  setComponentVariant: mockSetComponentVariant,
  initTheme: mockInitTheme,
  getThemeById: mockGetThemeById,
}))

// Mock document/body for bridgeLegacyCssVars
const mockSetProperty = vi.fn()
const mockSetAttribute = vi.fn()
Object.defineProperty(globalThis, 'document', {
  value: {
    documentElement: { style: { setProperty: mockSetProperty }, setAttribute: mockSetAttribute },
    body: { style: { backgroundColor: '', color: '' } },
  },
  writable: true,
})

let useThemeStore: any
let initializeTheme: any
let applyTheme: any

beforeEach(async () => {
  vi.resetModules()
  vi.clearAllMocks()

  // Re-mock after resetModules
  vi.doMock('zustand/middleware', () => ({
    persist: (config: any) => config,
  }))
  vi.doMock('@orchestra-mcp/theme', () => ({
    setColorTheme: mockSetColorTheme,
    setComponentVariant: mockSetComponentVariant,
    initTheme: mockInitTheme,
    getThemeById: mockGetThemeById,
  }))

  const mod = await import('../store/theme')
  useThemeStore = mod.useThemeStore
  initializeTheme = mod.initializeTheme
  applyTheme = mod.applyTheme
})

describe('useThemeStore', () => {
  it('has correct initial state', () => {
    const state = useThemeStore.getState()
    expect(state.theme).toBe('dark')
    expect(state.colorTheme).toBe('orchestra')
    expect(state.variant).toBe('default')
  })

  it('toggle switches between orchestra and github-light', () => {
    useThemeStore.getState().toggle()
    expect(useThemeStore.getState().colorTheme).toBe('github-light')
    expect(useThemeStore.getState().theme).toBe('light')

    useThemeStore.getState().toggle()
    expect(useThemeStore.getState().colorTheme).toBe('orchestra')
    expect(useThemeStore.getState().theme).toBe('dark')
  })

  it('set(light) switches to github-light', () => {
    useThemeStore.getState().set('light')
    expect(useThemeStore.getState().colorTheme).toBe('github-light')
    expect(useThemeStore.getState().theme).toBe('light')
  })

  it('set(dark) switches to orchestra', () => {
    useThemeStore.getState().set('light')
    useThemeStore.getState().set('dark')
    expect(useThemeStore.getState().colorTheme).toBe('orchestra')
    expect(useThemeStore.getState().theme).toBe('dark')
  })

  it('setColorTheme updates colorTheme and derives dark/light', () => {
    useThemeStore.getState().setColorTheme('dracula')
    expect(useThemeStore.getState().colorTheme).toBe('dracula')
    expect(useThemeStore.getState().theme).toBe('dark')

    useThemeStore.getState().setColorTheme('github-light')
    expect(useThemeStore.getState().colorTheme).toBe('github-light')
    expect(useThemeStore.getState().theme).toBe('light')
  })

  it('setColorTheme ignores unknown theme IDs', () => {
    useThemeStore.getState().setColorTheme('nonexistent')
    expect(useThemeStore.getState().colorTheme).toBe('orchestra')
  })

  it('setVariant updates variant and calls setComponentVariant', () => {
    useThemeStore.getState().setVariant('compact')
    expect(useThemeStore.getState().variant).toBe('compact')
    expect(mockSetComponentVariant).toHaveBeenCalledWith('compact')
  })

  it('toggle calls setColorTheme from @orchestra-mcp/theme', () => {
    useThemeStore.getState().toggle()
    expect(mockSetColorTheme).toHaveBeenCalledWith('github-light')
  })

  it('setColorTheme bridges legacy CSS vars', () => {
    useThemeStore.getState().setColorTheme('orchestra')
    expect(mockSetProperty).toHaveBeenCalledWith('--bg', '#0a0a0f')
    expect(mockSetProperty).toHaveBeenCalledWith('--text', '#e8e8ea')
    expect(mockSetProperty).toHaveBeenCalledWith('--border', '#2a2a35')
    expect(mockSetAttribute).toHaveBeenCalledWith('data-theme', 'dark')
  })

  it('setColorTheme sets data-theme=light for light themes', () => {
    useThemeStore.getState().setColorTheme('github-light')
    expect(mockSetAttribute).toHaveBeenCalledWith('data-theme', 'light')
  })

  it('applyTheme backward compat calls set()', () => {
    applyTheme('light')
    expect(useThemeStore.getState().theme).toBe('light')
    expect(useThemeStore.getState().colorTheme).toBe('github-light')
  })
})

describe('initializeTheme', () => {
  it('calls initTheme from @orchestra-mcp/theme', () => {
    initializeTheme()
    expect(mockInitTheme).toHaveBeenCalled()
  })

  it('applies the stored color theme and variant', () => {
    initializeTheme()
    expect(mockSetColorTheme).toHaveBeenCalledWith('orchestra')
    expect(mockSetComponentVariant).toHaveBeenCalledWith('default')
  })
})
