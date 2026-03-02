import type { Preview } from '@storybook/react'
import '../src/app/globals.css'

const preview: Preview = {
  parameters: {
    backgrounds: {
      default: 'orchestra-dark',
      values: [
        { name: 'orchestra-dark', value: '#0f0f12' },
        { name: 'orchestra-sidebar', value: '#1a1520' },
        { name: 'white', value: '#ffffff' },
      ],
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
}

export default preview
