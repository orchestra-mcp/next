import type { Meta, StoryObj } from '@storybook/react';
import { MarketplaceCard } from './MarketplaceCard';

/**
 * MarketplaceCard displays an extension, AI tool, or OS service
 * with install/uninstall/update actions, star rating, and type badge.
 */
const meta = {
  title: 'Marketplace/MarketplaceCard',
  component: MarketplaceCard,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    type: { control: 'select', options: ['extension', 'ai-tool', 'os-service'] },
    rating: { control: { type: 'range', min: 0, max: 5, step: 0.5 } },
    installCount: { control: 'number' },
    installed: { control: 'boolean' },
    verified: { control: 'boolean' },
    hasUpdate: { control: 'boolean' },
  },
} satisfies Meta<typeof MarketplaceCard>;

export default meta;
type Story = StoryObj<typeof meta>;

const defaultIcon = (emoji: string) => (
  <span style={{ fontSize: 24 }}>{emoji}</span>
);

export const Extension: Story = {
  args: {
    name: 'Code Formatter',
    author: 'Orchestra Team',
    description: 'Auto-format code on save with Prettier, ESLint, and more.',
    icon: defaultIcon('\uD83D\uDCDD'),
    type: 'extension',
    rating: 4.5,
    installCount: 12400,
    verified: true,
  },
};

export const AITool: Story = {
  args: {
    name: 'Smart Autocomplete',
    author: 'AI Labs',
    description: 'Context-aware code completions powered by LLM models.',
    icon: defaultIcon('\uD83E\uDDE0'),
    type: 'ai-tool',
    rating: 4,
    installCount: 87200,
    verified: true,
  },
};

export const OSService: Story = {
  args: {
    name: 'Spotlight Search',
    author: 'macOS Bridge',
    description: 'Integrate project search results into macOS Spotlight.',
    icon: defaultIcon('\uD83D\uDD0D'),
    type: 'os-service',
    rating: 3.5,
    installCount: 3100,
  },
};

export const Installed: Story = {
  args: {
    ...Extension.args,
    name: 'Installed Extension',
    installed: true,
  },
};

export const WithUpdate: Story = {
  args: {
    ...Extension.args,
    name: 'Outdated Extension',
    installed: true,
    hasUpdate: true,
  },
};

export const Verified: Story = {
  args: {
    ...Extension.args,
    name: 'Verified Publisher',
    verified: true,
  },
};

/** Three cards in a responsive grid layout */
export const GridLayout: Story = {
  args: { ...Extension.args },
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 280px)', gap: 16 }}>
      <MarketplaceCard
        name="Code Formatter"
        author="Orchestra Team"
        description="Auto-format your code on save."
        icon={defaultIcon('\uD83D\uDCDD')}
        type="extension"
        rating={4.5}
        installCount={12400}
        verified
      />
      <MarketplaceCard
        name="Smart Autocomplete"
        author="AI Labs"
        description="Context-aware completions."
        icon={defaultIcon('\uD83E\uDDE0')}
        type="ai-tool"
        rating={4}
        installCount={87200}
        installed
      />
      <MarketplaceCard
        name="Spotlight Search"
        author="macOS Bridge"
        description="Integrate project search into Spotlight."
        icon={defaultIcon('\uD83D\uDD0D')}
        type="os-service"
        rating={3.5}
        installCount={3100}
        hasUpdate
        installed
      />
    </div>
  ),
};
