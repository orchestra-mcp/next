import type { Meta, StoryObj } from '@storybook/react';
import { UnifiedIcon } from './UnifiedIcon';
import { IconProvider } from './IconProvider';
import type { IconPack } from './IconProvider';
import { FileIcon } from './code/File';
import { SearchIcon } from './code/Search';
import { SettingsIcon } from './code/Settings';

const codePackResolver: IconPack = {
  prefix: 'code',
  resolve: (name, props) => {
    const icons: Record<string, React.FC<any>> = {
      file: FileIcon,
      search: SearchIcon,
      settings: SettingsIcon,
    };
    const Component = icons[name];
    return Component ? <Component {...props} /> : null;
  },
};

const meta = {
  title: 'Icons/UnifiedIcon',
  component: UnifiedIcon,
  decorators: [
    (Story) => (
      <IconProvider packs={[codePackResolver]}>
        <Story />
      </IconProvider>
    ),
  ],
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    name: {
      control: 'text',
      description: 'Icon name: "bx-home", "code:file", "custom:name"',
    },
    size: {
      control: { type: 'number', min: 12, max: 64 },
    },
    color: {
      control: 'color',
    },
  },
} satisfies Meta<typeof UnifiedIcon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const BoxiconRegular: Story = {
  args: {
    name: 'bx-home',
    size: 24,
  },
};

export const BoxiconSolid: Story = {
  args: {
    name: 'bxs-heart',
    size: 24,
    color: '#ef4444',
  },
};

export const CodePackIcon: Story = {
  args: {
    name: 'code:file',
    size: 24,
  },
};

export const MixedIcons: Story = {
  args: { name: 'bx-home' },
  render: () => (
    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
      <UnifiedIcon name="bx-home" size={24} />
      <UnifiedIcon name="bxs-star" size={24} color="#f59e0b" />
      <UnifiedIcon name="bxl-github" size={24} />
      <UnifiedIcon name="code:file" size={24} />
      <UnifiedIcon name="code:search" size={24} />
      <UnifiedIcon name="code:settings" size={24} />
    </div>
  ),
};
