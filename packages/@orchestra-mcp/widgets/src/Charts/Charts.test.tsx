import { render, screen } from '@testing-library/react';
import { LineChart } from './LineChart';
import { BarChart } from './BarChart';
import { PieChart } from './PieChart';
import { AreaChart } from './AreaChart';
import { DonutChart } from './DonutChart';
import type { ChartDataPoint } from './types';

const sampleData: ChartDataPoint[] = [
  { label: 'Jan', value: 10 },
  { label: 'Feb', value: 25 },
  { label: 'Mar', value: 15 },
  { label: 'Apr', value: 30 },
];

describe('LineChart', () => {
  it('renders SVG with data', () => {
    const { container } = render(<LineChart data={sampleData} />);
    expect(container.querySelector('.chart__svg')).toBeInTheDocument();
    expect(container.querySelectorAll('.chart__dot')).toHaveLength(4);
  });

  it('shows empty state for empty data', () => {
    render(<LineChart data={[]} />);
    expect(screen.getByText('No data')).toBeInTheDocument();
  });

  it('renders title', () => {
    render(<LineChart data={sampleData} title="Revenue" />);
    expect(screen.getByText('Revenue')).toBeInTheDocument();
  });

  it('renders legend when enabled', () => {
    const { container } = render(<LineChart data={sampleData} showLegend />);
    expect(container.querySelector('.chart__legend')).toBeInTheDocument();
  });
});

describe('BarChart', () => {
  it('renders bars for each data point', () => {
    const { container } = render(<BarChart data={sampleData} />);
    expect(container.querySelectorAll('.chart__bar')).toHaveLength(4);
  });

  it('shows empty state for empty data', () => {
    render(<BarChart data={[]} />);
    expect(screen.getByText('No data')).toBeInTheDocument();
  });

  it('renders title', () => {
    render(<BarChart data={sampleData} title="Sales" />);
    expect(screen.getByText('Sales')).toBeInTheDocument();
  });
});

describe('PieChart', () => {
  it('renders slices for each data point', () => {
    const { container } = render(<PieChart data={sampleData} />);
    expect(container.querySelectorAll('.chart__slice')).toHaveLength(4);
  });

  it('shows empty state for empty data', () => {
    render(<PieChart data={[]} />);
    expect(screen.getByText('No data')).toBeInTheDocument();
  });

  it('renders legend by default', () => {
    const { container } = render(<PieChart data={sampleData} />);
    expect(container.querySelector('.chart__legend')).toBeInTheDocument();
  });
});

describe('AreaChart', () => {
  it('renders area path and line', () => {
    const { container } = render(<AreaChart data={sampleData} />);
    expect(container.querySelector('.chart__area')).toBeInTheDocument();
    expect(container.querySelector('.chart__line')).toBeInTheDocument();
  });

  it('shows empty state for empty data', () => {
    render(<AreaChart data={[]} />);
    expect(screen.getByText('No data')).toBeInTheDocument();
  });
});

describe('DonutChart', () => {
  it('renders slices with hole', () => {
    const { container } = render(<DonutChart data={sampleData} />);
    expect(container.querySelectorAll('.chart__slice')).toHaveLength(4);
  });

  it('renders center label', () => {
    render(<DonutChart data={sampleData} centerLabel="80%" />);
    expect(screen.getByText('80%')).toBeInTheDocument();
  });

  it('shows empty state for empty data', () => {
    render(<DonutChart data={[]} />);
    expect(screen.getByText('No data')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<DonutChart data={sampleData} className="my-donut" />);
    expect(container.querySelector('.my-donut')).toBeInTheDocument();
  });
});
