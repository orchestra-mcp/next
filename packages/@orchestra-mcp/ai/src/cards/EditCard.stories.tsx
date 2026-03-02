import type { Meta, StoryObj } from '@storybook/react';
import type { EditEvent } from '../types/events';
import { EditCard } from './EditCard';

const meta = {
  title: 'AI/Cards/EditCard',
  component: EditCard,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ width: 480 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof EditCard>;

export default meta;
type Story = StoryObj<typeof meta>;

const defaultEvent: EditEvent = {
  id: '1',
  type: 'edit',
  filePath: 'src/components/Button.tsx',
  language: 'tsx',
  original:
    'export const Button = ({ label }: { label: string }) => {\n  return <button>{label}</button>;\n};',
  modified:
    'export const Button = ({ label, variant = "primary" }: { label: string; variant?: string }) => {\n  return <button className={variant}>{label}</button>;\n};',
};

export const Default: Story = {
  args: {
    event: defaultEvent,
  },
};

export const Collapsed: Story = {
  args: {
    event: defaultEvent,
    defaultCollapsed: true,
  },
};

export const LargeEdit: Story = {
  args: {
    event: {
      id: '2',
      type: 'edit',
      filePath: 'src/stores/useAuthStore.ts',
      language: 'typescript',
      original: [
        "import { create } from 'zustand';",
        '',
        'interface AuthState {',
        '  user: string | null;',
        '  token: string | null;',
        '}',
        '',
        'interface AuthActions {',
        '  login: (user: string, token: string) => void;',
        '  logout: () => void;',
        '}',
        '',
        'export const useAuthStore = create<AuthState & AuthActions>((set) => ({',
        '  user: null,',
        '  token: null,',
        '  login: (user, token) => set({ user, token }),',
        '  logout: () => set({ user: null, token: null }),',
        '}));',
      ].join('\n'),
      modified: [
        "import { create } from 'zustand';",
        "import { persist } from 'zustand/middleware';",
        '',
        'interface AuthState {',
        '  user: string | null;',
        '  token: string | null;',
        '  refreshToken: string | null;',
        '  expiresAt: number | null;',
        '}',
        '',
        'interface AuthActions {',
        '  login: (user: string, token: string, refreshToken: string, expiresAt: number) => void;',
        '  logout: () => void;',
        '  isExpired: () => boolean;',
        '}',
        '',
        'export const useAuthStore = create<AuthState & AuthActions>()(persist(',
        '  (set, get) => ({',
        '    user: null,',
        '    token: null,',
        '    refreshToken: null,',
        '    expiresAt: null,',
        '    login: (user, token, refreshToken, expiresAt) =>',
        '      set({ user, token, refreshToken, expiresAt }),',
        '    logout: () =>',
        '      set({ user: null, token: null, refreshToken: null, expiresAt: null }),',
        '    isExpired: () => {',
        '      const exp = get().expiresAt;',
        '      return exp ? Date.now() > exp : true;',
        '    },',
        '  }),',
        "  { name: 'auth-storage' },",
        '));',
      ].join('\n'),
    } satisfies EditEvent,
  },
};
