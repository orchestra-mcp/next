import type { Meta, StoryObj } from '@storybook/react';
import { Sidebar } from './Sidebar';
import { useState } from 'react';

const meta = {
  title: 'UI/Sidebar',
  component: Sidebar,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Sidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const LeftSidebar: Story = {
  args: {
    position: 'left',
    isOpen: true,
    width: 280,
    children: (
      <div>
        <h3>Left Sidebar</h3>
        <ul>
          <li>Navigation Item 1</li>
          <li>Navigation Item 2</li>
          <li>Navigation Item 3</li>
        </ul>
      </div>
    ),
  },
};

export const RightSidebar: Story = {
  args: {
    position: 'right',
    isOpen: true,
    width: 280,
    children: (
      <div>
        <h3>Right Sidebar</h3>
        <p>This is a right-aligned sidebar.</p>
      </div>
    ),
  },
};

export const Closed: Story = {
  args: {
    isOpen: false,
    children: <div>Hidden Content</div>,
  },
};

export const CustomWidth: Story = {
  args: {
    width: 400,
    isOpen: true,
    children: (
      <div>
        <h3>Wide Sidebar</h3>
        <p>This sidebar is 400px wide.</p>
      </div>
    ),
  },
};

export const WithoutOverlay: Story = {
  args: {
    isOpen: true,
    showOverlay: false,
    children: (
      <div>
        <h3>No Overlay</h3>
        <p>This sidebar doesn't show an overlay.</p>
      </div>
    ),
  },
};

export const Interactive: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(true);

    return (
      <div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          style={{
            position: 'fixed',
            top: '20px',
            left: isOpen ? '300px' : '20px',
            zIndex: 1001,
            padding: '8px 16px',
            background: '#0ea5e9',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            transition: 'left 0.3s ease',
          }}
        >
          {isOpen ? 'Close' : 'Open'} Sidebar
        </button>
        <Sidebar
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          showOverlay={true}
        >
          <div>
            <h3>Interactive Sidebar</h3>
            <p>Click the button or overlay to toggle.</p>
            <ul>
              <li>Item 1</li>
              <li>Item 2</li>
              <li>Item 3</li>
              <li>Item 4</li>
              <li>Item 5</li>
            </ul>
          </div>
        </Sidebar>
      </div>
    );
  },
};
