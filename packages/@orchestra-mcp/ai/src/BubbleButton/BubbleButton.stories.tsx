import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { BubbleButton } from './BubbleButton';

/**
 * BubbleButton is a floating action button for AI-powered actions.
 * Supports pulse animation, radial actions, and all four corner positions.
 */
const meta = {
  title: 'AI/BubbleButton',
  component: BubbleButton,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
  argTypes: {
    position: {
      control: 'select',
      options: ['bottom-right', 'bottom-left', 'top-right', 'top-left'],
    },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    pulse: { control: 'boolean' },
    disabled: { control: 'boolean' },
    draggable: { control: 'boolean' },
  },
  decorators: [
    (Story) => (
      <div style={{ height: '400px', position: 'relative' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof BubbleButton>;

export default meta;
type Story = StoryObj<typeof meta>;

const PlusIcon = () => <span style={{ fontSize: 'inherit' }}>+</span>;
const sampleActions = [
  { icon: <span>S</span>, label: 'Search', onClick: () => {} },
  { icon: <span>C</span>, label: 'Chat', onClick: () => {} },
  { icon: <span>N</span>, label: 'New Note', onClick: () => {} },
];

export const Default: Story = {
  args: {
    icon: <PlusIcon />,
    expanded: false,
    onToggle: () => {},
    size: 'md',
    position: 'bottom-right',
  },
};

export const Expanded: Story = {
  args: {
    icon: <PlusIcon />,
    expanded: true,
    onToggle: () => {},
    actions: sampleActions,
    size: 'md',
  },
};

export const WithPulse: Story = {
  args: {
    icon: <PlusIcon />,
    expanded: false,
    onToggle: () => {},
    pulse: true,
    size: 'md',
  },
};

export const Positions: Story = {
  args: { icon: <PlusIcon />, expanded: false, onToggle: () => {} },
  render: () => (
    <>
      <BubbleButton icon={<PlusIcon />} expanded={false} onToggle={() => {}} position="bottom-right" />
      <BubbleButton icon={<PlusIcon />} expanded={false} onToggle={() => {}} position="bottom-left" />
      <BubbleButton icon={<PlusIcon />} expanded={false} onToggle={() => {}} position="top-right" />
      <BubbleButton icon={<PlusIcon />} expanded={false} onToggle={() => {}} position="top-left" />
    </>
  ),
};

export const Disabled: Story = {
  args: {
    icon: <PlusIcon />,
    expanded: false,
    onToggle: () => {},
    disabled: true,
    size: 'md',
  },
};

export const WithActions: Story = {
  args: { icon: <PlusIcon />, expanded: false, onToggle: () => {}, actions: sampleActions },
  render: (args) => {
    const [open, setOpen] = useState(false);
    return (
      <BubbleButton {...args} expanded={open} onToggle={() => setOpen(!open)} />
    );
  },
};

export const Draggable: Story = {
  args: {
    icon: <PlusIcon />,
    expanded: false,
    onToggle: () => {},
    draggable: true,
    size: 'md',
  },
  render: (args) => {
    const [open, setOpen] = useState(false);
    return (
      <BubbleButton
        {...args}
        expanded={open}
        onToggle={() => setOpen(!open)}
      />
    );
  },
};

export const DraggableWithActions: Story = {
  args: {
    icon: <PlusIcon />,
    expanded: false,
    onToggle: () => {},
    draggable: true,
    actions: sampleActions,
    size: 'md',
    tooltip: 'Drag me around',
  },
  render: (args) => {
    const [open, setOpen] = useState(false);
    return (
      <BubbleButton
        {...args}
        expanded={open}
        onToggle={() => setOpen(!open)}
      />
    );
  },
};
