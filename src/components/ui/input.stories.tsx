import type { Meta, StoryObj } from '@storybook/react'
import { Input } from './input'

const meta: Meta<typeof Input> = {
  title: 'UI/Input',
  component: Input,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
}

export default meta
type Story = StoryObj<typeof Input>

export const Default: Story = {
  args: { placeholder: 'Enter text…' },
  decorators: [(Story) => <div style={{ width: 320 }}><Story /></div>],
}

export const WithLabel: Story = {
  args: { label: 'Email address', placeholder: 'you@example.com', type: 'email' },
  decorators: [(Story) => <div style={{ width: 320 }}><Story /></div>],
}

export const WithError: Story = {
  args: {
    label: 'Password',
    type: 'password',
    value: '123',
    error: 'Password must be at least 8 characters',
    onChange: () => {},
  },
  decorators: [(Story) => <div style={{ width: 320 }}><Story /></div>],
}

export const Password: Story = {
  args: { label: 'Password', type: 'password', placeholder: '••••••••' },
  decorators: [(Story) => <div style={{ width: 320 }}><Story /></div>],
}

export const Disabled: Story = {
  args: { label: 'Read only', value: 'Cannot edit this', disabled: true, onChange: () => {} },
  decorators: [(Story) => <div style={{ width: 320 }}><Story /></div>],
}
