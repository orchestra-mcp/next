import type { Meta, StoryObj } from '@storybook/react'
import LoginPage from './page'

const meta: Meta<typeof LoginPage> = {
  title: 'Pages/Auth/Login',
  component: LoginPage,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: '/login',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof LoginPage>

export const Default: Story = {}
