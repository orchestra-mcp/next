import type { Meta, StoryObj } from '@storybook/react'
import LandingPage from './[locale]/page'

const meta: Meta<typeof LandingPage> = {
  title: 'Pages/Landing',
  component: LandingPage,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    nextjs: { appDirectory: true },
  },
}

export default meta
type Story = StoryObj<typeof LandingPage>

export const Default: Story = {}
