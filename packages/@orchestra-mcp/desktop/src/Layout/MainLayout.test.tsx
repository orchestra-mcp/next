import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MainLayout } from './MainLayout';

describe('MainLayout', () => {
  it('renders layout structure', () => {
    render(
      <MainLayout>
        <div>Test Content</div>
      </MainLayout>
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('renders sidebar, topbar, and statusbar', () => {
    const { container } = render(
      <MainLayout>
        <div>Content</div>
      </MainLayout>
    );

    const aside = container.querySelector('aside');
    const header = container.querySelector('header');
    const footer = container.querySelector('footer');
    const main = container.querySelector('main');

    expect(aside).toBeInTheDocument();
    expect(header).toBeInTheDocument();
    expect(footer).toBeInTheDocument();
    expect(main).toBeInTheDocument();
  });

  it('renders children inside the main area', () => {
    const { container } = render(
      <MainLayout>
        <p>Inner content</p>
      </MainLayout>
    );

    const main = container.querySelector('main');
    expect(main).toBeInTheDocument();
    expect(screen.getByText('Inner content')).toBeInTheDocument();
  });

  it('passes pluginCount and notificationCount to StatusBar', () => {
    render(
      <MainLayout pluginCount={5} notificationCount={2}>
        <div>Content</div>
      </MainLayout>
    );

    expect(screen.getByText(/5/)).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('passes breadcrumb to Topbar', () => {
    render(
      <MainLayout breadcrumb="My Page">
        <div>Content</div>
      </MainLayout>
    );

    expect(screen.getByText('My Page')).toBeInTheDocument();
  });

  it('passes sidebarViews to Sidebar', () => {
    const views = [
      { id: 'files', title: 'Files', icon: 'files', route: '/panels/files' },
    ];

    render(
      <MainLayout sidebarViews={views}>
        <div>Content</div>
      </MainLayout>
    );

    expect(screen.getByLabelText('Files')).toBeInTheDocument();
  });
});
