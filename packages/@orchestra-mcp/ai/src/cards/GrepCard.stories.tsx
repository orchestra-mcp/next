import type { Meta, StoryObj } from '@storybook/react';
import type { GrepEvent } from '../types/events';
import { GrepCard } from './GrepCard';

const meta = {
  title: 'AI/Cards/GrepCard',
  component: GrepCard,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ width: 480 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof GrepCard>;

export default meta;
type Story = StoryObj<typeof meta>;

const defaultEvent: GrepEvent = {
  id: '1',
  type: 'grep',
  pattern: 'useState',
  matches: [
    {
      file: 'src/App.tsx',
      line: 5,
      content: 'import { useState } from "react";',
    },
    {
      file: 'src/hooks/useAuth.ts',
      line: 12,
      content: 'const [user, setUser] = useState(null);',
    },
  ],
  totalMatches: 2,
};

export const Default: Story = {
  args: {
    event: defaultEvent,
  },
};

export const ManyMatches: Story = {
  args: {
    event: {
      id: '2',
      type: 'grep',
      pattern: 'className',
      matches: [
        { file: 'src/components/Button.tsx', line: 8, content: '  className={`btn ${variant}`}' },
        { file: 'src/components/Input.tsx', line: 12, content: '  className="input-field"' },
        { file: 'src/components/Modal.tsx', line: 15, content: '  className={styles.overlay}' },
        { file: 'src/components/Card.tsx', line: 6, content: '  className="card-container"' },
        { file: 'src/components/Sidebar.tsx', line: 22, content: '  className={`sidebar ${open ? "open" : ""}`}' },
        { file: 'src/components/Header.tsx', line: 9, content: '  className="header-main"' },
        { file: 'src/components/Footer.tsx', line: 5, content: '  className="footer-wrap"' },
        { file: 'src/components/Tabs.tsx', line: 18, content: '  className={active ? "tab--active" : "tab"}' },
        { file: 'src/components/Panel.tsx', line: 11, content: '  className="panel-body"' },
        { file: 'src/components/Badge.tsx', line: 7, content: '  className={`badge badge--${color}`}' },
        { file: 'src/layouts/MainLayout.tsx', line: 14, content: '  className="main-layout"' },
        { file: 'src/layouts/PanelLayout.tsx', line: 8, content: '  className="panel-layout"' },
      ],
      totalMatches: 12,
    },
  },
};

export const WithFileClick: Story = {
  args: {
    event: defaultEvent,
    onFileClick: (filePath: string, line: number) => {
      alert(`Open ${filePath} at line ${line}`);
    },
  },
};
