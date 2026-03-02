import type { Meta, StoryObj } from '@storybook/react'
import { Button } from './button'

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'secondary', 'ghost', 'destructive', 'outline', 'link'],
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg', 'icon'],
    },
    loading: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
}

export default meta
type Story = StoryObj<typeof Button>

export const Primary: Story = {
  args: { children: 'Get started', variant: 'default', size: 'default' },
}

export const Secondary: Story = {
  args: { children: 'Cancel', variant: 'secondary', size: 'default' },
}

export const Ghost: Story = {
  args: { children: 'Learn more', variant: 'ghost', size: 'default' },
}

export const Destructive: Story = {
  args: { children: 'Delete', variant: 'destructive', size: 'default' },
}

export const Loading: Story = {
  args: { children: 'Saving…', variant: 'default', loading: true },
}

export const Disabled: Story = {
  args: { children: 'Unavailable', variant: 'default', disabled: true },
}

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Button size="sm">Small</Button>
      <Button size="default">Medium</Button>
      <Button size="lg">Large</Button>
    </div>
  ),
}

export const AllVariants: Story = {
  render: () => (
    <div className="flex items-center gap-3 flex-wrap">
      <Button variant="default">Default</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="outline">Outline</Button>
    </div>
  ),
}
