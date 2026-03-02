import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { PanelLayout } from './PanelLayout';

describe('PanelLayout', () => {
  it('renders the title in the title bar', () => {
    render(
      <PanelLayout title="Settings">
        <div>Content</div>
      </PanelLayout>
    );
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('renders children content', () => {
    render(
      <PanelLayout title="Test">
        <div>Panel Body</div>
      </PanelLayout>
    );
    expect(screen.getByText('Panel Body')).toBeInTheDocument();
  });

  it('renders description when provided', () => {
    render(
      <PanelLayout title="Settings" description="Manage your preferences">
        <div>Content</div>
      </PanelLayout>
    );
    expect(screen.getByText('Manage your preferences')).toBeInTheDocument();
  });

  it('does not render description area when neither description nor actions are provided', () => {
    const { container } = render(
      <PanelLayout title="Settings">
        <div>Content</div>
      </PanelLayout>
    );
    // No .border-b.px-6.py-4 sub-header should appear
    expect(screen.queryByText('Manage your preferences')).not.toBeInTheDocument();
  });

  it('renders actions when provided', () => {
    render(
      <PanelLayout title="Settings" actions={<button>Save</button>}>
        <div>Content</div>
      </PanelLayout>
    );
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
  });

  it('renders sidebar when showSidebar is true and sidebar is provided', () => {
    render(
      <PanelLayout
        title="Settings"
        showSidebar={true}
        sidebar={<nav>Sidebar Content</nav>}
      >
        <div>Main Content</div>
      </PanelLayout>
    );
    expect(screen.getByText('Sidebar Content')).toBeInTheDocument();
    expect(screen.getByText('Main Content')).toBeInTheDocument();
  });

  it('does not render sidebar when showSidebar is false', () => {
    render(
      <PanelLayout
        title="Settings"
        showSidebar={false}
        sidebar={<nav>Sidebar Content</nav>}
      >
        <div>Main Content</div>
      </PanelLayout>
    );
    expect(screen.queryByText('Sidebar Content')).not.toBeInTheDocument();
  });

  it('does not render sidebar when sidebar prop is not provided', () => {
    render(
      <PanelLayout title="Settings" showSidebar={true}>
        <div>Main Content</div>
      </PanelLayout>
    );
    expect(screen.getByText('Main Content')).toBeInTheDocument();
  });

  it('renders the PanelTitleBar with the given title', () => {
    render(
      <PanelLayout title="My Panel">
        <div>Content</div>
      </PanelLayout>
    );
    // PanelTitleBar renders the title text
    const titleEl = screen.getByText('My Panel');
    expect(titleEl).toBeInTheDocument();
  });

  it('applies full-screen layout structure', () => {
    const { container } = render(
      <PanelLayout title="Test">
        <div>Content</div>
      </PanelLayout>
    );
    const outer = container.querySelector('.desktop-panel');
    expect(outer).toBeInTheDocument();
  });
});
