import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { PanelContainer } from './PanelContainer';
import type { PanelRegistration } from './PanelContainer';

function FakePanel({ message }: { message?: string }) {
  return <div>Fake Panel Content{message ? `: ${message}` : ''}</div>;
}

const panels: PanelRegistration[] = [
  { route: '/panels/fake', component: FakePanel, title: 'Fake Panel' },
];

describe('PanelContainer', () => {
  it('renders the panel component for a known route', () => {
    render(<PanelContainer route="/panels/fake" panels={panels} />);
    expect(screen.getByText('Fake Panel Content')).toBeInTheDocument();
  });

  it('renders PanelNotFound for an unknown route', () => {
    render(<PanelContainer route="/panels/unknown" panels={panels} />);
    expect(screen.getByText('Panel Not Found')).toBeInTheDocument();
  });

  it('shows the missing route in PanelNotFound', () => {
    render(<PanelContainer route="/panels/missing" panels={panels} />);
    expect(screen.getByText('/panels/missing')).toBeInTheDocument();
  });

  it('passes props to the panel component', () => {
    render(
      <PanelContainer
        route="/panels/fake"
        panels={panels}
        props={{ message: 'hello' }}
      />
    );
    expect(screen.getByText('Fake Panel Content: hello')).toBeInTheDocument();
  });

  it('renders empty panels array with PanelNotFound', () => {
    render(<PanelContainer route="/panels/fake" panels={[]} />);
    expect(screen.getByText('Panel Not Found')).toBeInTheDocument();
  });

  it('resolves the correct panel when multiple panels are registered', () => {
    function OtherPanel() {
      return <div>Other Panel</div>;
    }
    const multiplePanels: PanelRegistration[] = [
      { route: '/panels/fake', component: FakePanel, title: 'Fake' },
      { route: '/panels/other', component: OtherPanel, title: 'Other' },
    ];
    render(<PanelContainer route="/panels/other" panels={multiplePanels} />);
    expect(screen.getByText('Other Panel')).toBeInTheDocument();
    expect(screen.queryByText('Fake Panel Content')).not.toBeInTheDocument();
  });

  it('renders the panel component directly without extra wrapper', () => {
    render(<PanelContainer route="/panels/fake" panels={panels} />);
    // Component renders panel directly (no extra flex wrapper)
    expect(screen.getByText('Fake Panel Content')).toBeInTheDocument();
  });
});
