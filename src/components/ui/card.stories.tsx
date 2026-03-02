import type { Meta, StoryObj } from '@storybook/react'
import { Card, CardTitle, CardDescription } from './card'

const meta: Meta<typeof Card> = {
  title: 'UI/Card',
  component: Card,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
}

export default meta
type Story = StoryObj<typeof Card>

export const Default: Story = {
  render: () => (
    <Card style={{ width: 280 }}>
      <CardTitle>My Project</CardTitle>
      <CardDescription>A short description of this project goes here.</CardDescription>
    </Card>
  ),
}

export const Hoverable: Story = {
  render: () => (
    <Card hover style={{ width: 280 }}>
      <CardTitle>Hoverable Card</CardTitle>
      <CardDescription>Hover over me to see the effect.</CardDescription>
    </Card>
  ),
}

export const WithBadge: Story = {
  render: () => (
    <Card style={{ width: 280 }}>
      <div className="flex items-start justify-between mb-2">
        <CardTitle>orchestra-rag</CardTitle>
        <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--bg)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
          P0
        </span>
      </div>
      <CardDescription>RAG memory engine with Tantivy + SQLite for vector search.</CardDescription>
    </Card>
  ),
}

export const Grid: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-3" style={{ width: 580 }}>
      {['Dashboard', 'Projects', 'Notes', 'Settings'].map((name) => (
        <Card key={name} hover>
          <CardTitle>{name}</CardTitle>
          <CardDescription>Navigate to the {name.toLowerCase()} section.</CardDescription>
        </Card>
      ))}
    </div>
  ),
}
