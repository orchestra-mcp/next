import type { Meta, StoryObj } from '@storybook/react';
import { GlobCard } from './GlobCard';
import type { GlobEvent } from '../types/events';

const meta: Meta<typeof GlobCard> = {
  title: 'AI/Cards/GlobCard',
  component: GlobCard,
  tags: ['autodocs'],
  argTypes: {
    onFileClick: { action: 'file clicked' },
  },
};

export default meta;
type Story = StoryObj<typeof GlobCard>;

const baseEvent: GlobEvent = {
  id: '1',
  type: 'glob',
  pattern: '**/*.tsx',
  status: 'done',
  timestamp: new Date().toISOString(),
};

export const Default: Story = {
  args: {
    event: {
      ...baseEvent,
      matches: [
        'src/components/Button.tsx',
        'src/components/Input.tsx',
        'src/pages/HomePage.tsx',
        'src/pages/AboutPage.tsx',
      ],
      totalMatches: 4,
    },
    defaultCollapsed: false,
  },
};

export const ManyMatches: Story = {
  args: {
    event: {
      ...baseEvent,
      pattern: 'src/**/*.ts',
      matches: [
        'src/utils/format.ts',
        'src/utils/validate.ts',
        'src/types/index.ts',
        'src/types/user.ts',
        'src/hooks/useAuth.ts',
        'src/hooks/useTheme.ts',
        'src/services/api.ts',
        'src/services/auth.ts',
      ],
      totalMatches: 8,
    },
    defaultCollapsed: false,
  },
};

export const NoMatches: Story = {
  args: {
    event: {
      ...baseEvent,
      pattern: '**/*.rb',
      matches: [],
      totalMatches: 0,
    },
    defaultCollapsed: false,
  },
};

export const Running: Story = {
  args: {
    event: {
      ...baseEvent,
      status: 'running',
    },
    defaultCollapsed: false,
  },
};

export const Collapsed: Story = {
  args: {
    event: {
      ...baseEvent,
      matches: [
        'src/components/Button.tsx',
        'src/components/Input.tsx',
      ],
      totalMatches: 2,
    },
    defaultCollapsed: true,
  },
};
