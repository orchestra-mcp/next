import type { Meta, StoryObj } from '@storybook/react';
import { LineChart } from './LineChart';
import { BarChart } from './BarChart';
import { PieChart } from './PieChart';
import { AreaChart } from './AreaChart';
import { DonutChart } from './DonutChart';

const sampleData = [
  { label: 'Jan', value: 10 },
  { label: 'Feb', value: 25 },
  { label: 'Mar', value: 15 },
  { label: 'Apr', value: 30 },
  { label: 'May', value: 22 },
  { label: 'Jun', value: 28 },
];

const colorData = [
  { label: 'React', value: 40, color: '#61dafb' },
  { label: 'Vue', value: 25, color: '#42b883' },
  { label: 'Svelte', value: 15, color: '#ff3e00' },
  { label: 'Angular', value: 20, color: '#dd1b16' },
];

const lineMeta = {
  title: 'Widgets/LineChart',
  component: LineChart,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta<typeof LineChart>;

export default lineMeta;
type LineStory = StoryObj<typeof lineMeta>;

export const Default: LineStory = {
  args: { data: sampleData, title: 'Monthly Revenue' },
};

export const WithLegend: LineStory = {
  args: { data: sampleData, showLegend: true, title: 'With Legend' },
};

// --- BarChart stories ---
export const Bar: StoryObj<typeof BarChart> = {
  render: (args) => <BarChart {...args} />,
  args: { data: colorData, title: 'Framework Popularity' },
};

export const BarWithLegend: StoryObj<typeof BarChart> = {
  render: (args) => <BarChart {...args} />,
  args: { data: colorData, showLegend: true, title: 'With Legend' },
};

// --- PieChart stories ---
export const Pie: StoryObj<typeof PieChart> = {
  render: (args) => <PieChart {...args} />,
  args: { data: colorData, title: 'Market Share' },
};

// --- AreaChart stories ---
export const Area: StoryObj<typeof AreaChart> = {
  render: (args) => <AreaChart {...args} />,
  args: { data: sampleData, title: 'Traffic Over Time' },
};

// --- DonutChart stories ---
export const Donut: StoryObj<typeof DonutChart> = {
  render: (args) => <DonutChart {...args} />,
  args: { data: colorData, title: 'Usage', centerLabel: '100%' },
};

export const DonutThin: StoryObj<typeof DonutChart> = {
  render: (args) => <DonutChart {...args} />,
  args: { data: colorData, innerRatio: 0.8, centerLabel: '80%' },
};
