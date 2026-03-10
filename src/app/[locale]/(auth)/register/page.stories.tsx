import type { Meta, StoryObj } from '@storybook/react'
import RegisterPage from './page'

const meta: Meta<typeof RegisterPage> = {
  title: 'Pages/Auth/Register',
  component: RegisterPage,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: '/register',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof RegisterPage>

export const Default: Story = {}
