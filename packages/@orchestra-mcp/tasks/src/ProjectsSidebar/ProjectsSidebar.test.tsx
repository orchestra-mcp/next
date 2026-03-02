import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ProjectsSidebar } from './ProjectsSidebar';
import type { ProjectSummary } from './ProjectsSidebar';


const makeProjects = (): ProjectSummary[] => [
  {
    slug: 'my-app',
    name: 'My App',
    status: 'active',
    epicCount: 3,
    taskCount: 42,
    completionPercent: 65,
    integrations: ['github'],
  },
  {
    slug: 'docs-site',
    name: 'Docs Site',
    status: 'planning',
    epicCount: 1,
    taskCount: 8,
    completionPercent: 10,
    integrations: ['github', 'jira'],
  },
];

describe('ProjectsSidebar', () => {
  it('renders project list with names', () => {
    render(
      <ProjectsSidebar
        projects={makeProjects()}
        activeProject={null}
        onProjectClick={vi.fn()}
      />,
    );

    const titles = screen.getAllByText('My App');
    expect(titles.length).toBeGreaterThanOrEqual(1);
    const docsTitles = screen.getAllByText('Docs Site');
    expect(docsTitles.length).toBeGreaterThanOrEqual(1);
  });

  it('calls onProjectClick when project is clicked', () => {
    const handleClick = vi.fn();
    render(
      <ProjectsSidebar
        projects={makeProjects()}
        activeProject={null}
        onProjectClick={handleClick}
      />,
    );

    // Click the "Docs Site" title span (first match is the visible title)
    const docsTitles = screen.getAllByText('Docs Site');
    fireEvent.click(docsTitles[0]);
    expect(handleClick).toHaveBeenCalledTimes(1);
    expect(handleClick).toHaveBeenCalledWith('docs-site');
  });

  it('calls onCreateProject when button clicked', () => {
    const handleCreate = vi.fn();
    render(
      <ProjectsSidebar
        projects={makeProjects()}
        activeProject={null}
        onProjectClick={vi.fn()}
        onCreateProject={handleCreate}
      />,
    );

    fireEvent.click(screen.getByTestId('create-project-btn'));
    expect(handleCreate).toHaveBeenCalledTimes(1);
  });

  it('does not render create button when onCreateProject is not provided', () => {
    render(
      <ProjectsSidebar
        projects={makeProjects()}
        activeProject={null}
        onProjectClick={vi.fn()}
      />,
    );

    expect(screen.queryByTestId('create-project-btn')).not.toBeInTheDocument();
  });

  it('displays task counts in preview text', () => {
    render(
      <ProjectsSidebar
        projects={makeProjects()}
        activeProject={null}
        onProjectClick={vi.fn()}
      />,
    );

    // ProjectItem renders "{taskCount} tasks · {completionPercent}%"
    expect(screen.getByText(/42 tasks/)).toBeInTheDocument();
    expect(screen.getByText(/8 tasks/)).toBeInTheDocument();
  });

  it('displays status text for each project', () => {
    render(
      <ProjectsSidebar
        projects={makeProjects()}
        activeProject={null}
        onProjectClick={vi.fn()}
      />,
    );

    expect(screen.getByText('active')).toBeInTheDocument();
    expect(screen.getByText('planning')).toBeInTheDocument();
  });

  it('shows empty state when no projects', () => {
    render(
      <ProjectsSidebar
        projects={[]}
        activeProject={null}
        onProjectClick={vi.fn()}
      />,
    );

    expect(screen.getByText('No projects yet')).toBeInTheDocument();
  });
});
