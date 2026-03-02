import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BootstrapProvider, useBootstrapContext } from './BootstrapProvider';

// Mock useBootstrap to control the ready state
vi.mock('./hooks/useBootstrap', () => ({
  useBootstrap: vi.fn(() => ({ ready: false, manifest: null, error: null })),
}));

import { useBootstrap } from './hooks/useBootstrap';

describe('BootstrapProvider', () => {
  it('always renders children regardless of ready state', () => {
    vi.mocked(useBootstrap).mockReturnValue({ ready: false, manifest: null, error: null });
    render(
      <BootstrapProvider>
        <div>App Content</div>
      </BootstrapProvider>
    );
    // Provider no longer shows loading screen, always renders children
    expect(screen.getByText('App Content')).toBeInTheDocument();
  });

  it('renders children when ready', () => {
    vi.mocked(useBootstrap).mockReturnValue({ ready: true, manifest: null, error: null });
    render(
      <BootstrapProvider>
        <div>App Content</div>
      </BootstrapProvider>
    );
    expect(screen.getByText('App Content')).toBeInTheDocument();
  });

  it('provides context to children', () => {
    vi.mocked(useBootstrap).mockReturnValue({ ready: false, manifest: null, error: null });
    render(
      <BootstrapProvider>
        <div>Content</div>
      </BootstrapProvider>
    );
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('renders multiple children when ready', () => {
    vi.mocked(useBootstrap).mockReturnValue({ ready: true, manifest: null, error: null });
    render(
      <BootstrapProvider>
        <div>Child One</div>
        <div>Child Two</div>
      </BootstrapProvider>
    );
    expect(screen.getByText('Child One')).toBeInTheDocument();
    expect(screen.getByText('Child Two')).toBeInTheDocument();
  });
});

describe('useBootstrapContext', () => {
  it('provides ready=false context outside provider', () => {
    let contextValue: { ready: boolean } | null = null;
    function Consumer() {
      contextValue = useBootstrapContext();
      return null;
    }
    render(<Consumer />);
    expect(contextValue?.ready).toBe(false);
  });

  it('provides ready=true context when bootstrap completes', () => {
    vi.mocked(useBootstrap).mockReturnValue({ ready: true, manifest: null, error: null });
    let contextValue: { ready: boolean } | null = null;
    function Consumer() {
      contextValue = useBootstrapContext();
      return null;
    }
    render(
      <BootstrapProvider>
        <Consumer />
      </BootstrapProvider>
    );
    expect(contextValue?.ready).toBe(true);
  });
});
