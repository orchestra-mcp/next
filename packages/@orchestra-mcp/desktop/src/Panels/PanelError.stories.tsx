import type { Meta, StoryObj } from '@storybook/react';
import { PanelError } from './PanelError';

const meta = {
  title: 'Desktop/Panels/PanelError',
  component: PanelError,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ width: 600, height: 480 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PanelError>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    route: '/panels/settings',
    error: new Error('Cannot read property "theme" of undefined'),
  },
};

export const WithStack: Story = {
  args: {
    route: '/panels/extensions',
    error: Object.assign(
      new Error('Module not found: @orchestra/missing-plugin'),
      {
        stack: [
          'Error: Module not found: @orchestra/missing-plugin',
          '    at resolve (webpack:///./src/loader.ts:42:11)',
          '    at PanelContainer (webpack:///./src/Panels/PanelContainer.tsx:33:5)',
          '    at renderWithHooks (react-dom.development.js:14985:18)',
        ].join('\n'),
      }
    ),
  },
};
