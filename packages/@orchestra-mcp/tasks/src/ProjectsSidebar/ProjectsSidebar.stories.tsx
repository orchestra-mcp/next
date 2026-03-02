import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from 'storybook/test';
import { ProjectsSidebar } from './ProjectsSidebar';
import type { ProjectSummary } from './ProjectsSidebar';

const sampleProjects: ProjectSummary[] = [
  {
    slug: 'orchestra-mcp',
    name: 'Orchestra MCP',
    status: 'active',
    epicCount: 5,
    taskCount: 87,
    completionPercent: 42,
    integrations: ['github'],
  },
  {
    slug: 'docs-site',
    name: 'Documentation Site',
    status: 'active',
    epicCount: 2,
    taskCount: 24,
    completionPercent: 75,
    integrations: ['github', 'jira'],
  },
  {
    slug: 'mobile-app',
    name: 'Mobile App',
    status: 'planning',
    epicCount: 1,
    taskCount: 6,
    completionPercent: 0,
    integrations: [],
  },
];

const meta = {
  title: 'Tasks/ProjectsSidebar',
  component: ProjectsSidebar,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ width: 260, height: 500 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ProjectsSidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    projects: sampleProjects,
    activeProject: null,
    onProjectClick: () => {},
    onCreateProject: () => {},
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Project names appear in both title and delete dialog, use getAllByText
    const orchestraNames = canvas.getAllByText('Orchestra MCP');
    await expect(orchestraNames.length).toBeGreaterThanOrEqual(1);
    const docsNames = canvas.getAllByText('Documentation Site');
    await expect(docsNames.length).toBeGreaterThanOrEqual(1);
    const mobileNames = canvas.getAllByText('Mobile App');
    await expect(mobileNames.length).toBeGreaterThanOrEqual(1);
  },
};

export const WithActiveProject: Story = {
  args: {
    projects: sampleProjects,
    activeProject: 'docs-site',
    onProjectClick: () => {},
    onCreateProject: () => {},
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // ProjectItem wrapper gets --active class when active
    const activeWrapper = canvas.getByTestId('projects-list')
      ?.querySelector('.project-item__wrapper--active');
    await expect(activeWrapper).toBeTruthy();
  },
};

export const Empty: Story = {
  args: {
    projects: [],
    activeProject: null,
    onProjectClick: () => {},
    onCreateProject: () => {},
  },
};
