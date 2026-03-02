import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { DatePicker } from './DatePicker';
import { DateRangePicker } from './DateRangePicker';
import type { DateRange } from './DatePickerTypes';

/**
 * DatePicker and DateRangePicker components with calendar dropdown.
 * - 26 color themes via toolbar dropdown
 * - 3 component variants (default/compact/modern) via toolbar dropdown
 * - Supports minDate/maxDate range constraints
 * - Optional time picker (12h/24h), timezone selector, custom format
 * - DateRangePicker for selecting start + end dates
 */
const meta = {
  title: 'UI/DatePicker',
  component: DatePicker,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    placeholder: { control: 'text' },
    disabled: { control: 'boolean' },
    showTime: { control: 'boolean' },
    showSeconds: { control: 'boolean' },
    use12Hour: { control: 'boolean' },
    showTimezone: { control: 'boolean' },
    format: { control: 'text' },
  },
} satisfies Meta<typeof DatePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── DatePicker stories ──────────────────────

export const Default: Story = {
  args: {
    placeholder: 'Select date',
  },
  render: (args) => {
    const [date, setDate] = useState<Date | undefined>();
    return <DatePicker {...args} value={date} onChange={setDate} />;
  },
};

export const WithValue: Story = {
  args: {
    value: new Date(2025, 5, 15),
  },
};

export const WithMinMax: Story = {
  args: {
    placeholder: 'Select date',
  },
  render: (args) => {
    const [date, setDate] = useState<Date | undefined>(new Date(2025, 5, 15));
    return (
      <DatePicker
        {...args}
        value={date}
        onChange={setDate}
        minDate={new Date(2025, 5, 5)}
        maxDate={new Date(2025, 5, 25)}
      />
    );
  },
};

export const Disabled: Story = {
  args: {
    value: new Date(2025, 5, 15),
    disabled: true,
  },
};

export const CustomPlaceholder: Story = {
  args: {
    placeholder: 'When is your birthday?',
  },
  render: (args) => {
    const [date, setDate] = useState<Date | undefined>();
    return <DatePicker {...args} value={date} onChange={setDate} />;
  },
};

export const WithTime24h: Story = {
  args: {
    placeholder: 'Select date & time (24h)',
    showTime: true,
  },
  render: (args) => {
    const [date, setDate] = useState<Date | undefined>();
    return <DatePicker {...args} value={date} onChange={setDate} />;
  },
};

export const WithTime12h: Story = {
  args: {
    placeholder: 'Select date & time (12h)',
    showTime: true,
    use12Hour: true,
  },
  render: (args) => {
    const [date, setDate] = useState<Date | undefined>();
    return <DatePicker {...args} value={date} onChange={setDate} />;
  },
};

export const WithTimeAndSeconds: Story = {
  args: {
    placeholder: 'Select date & time',
    showTime: true,
    showSeconds: true,
  },
  render: (args) => {
    const [date, setDate] = useState<Date | undefined>();
    return <DatePicker {...args} value={date} onChange={setDate} />;
  },
};

export const WithTimezone: Story = {
  args: {
    placeholder: 'Select date with timezone',
    showTime: true,
    showTimezone: true,
  },
  render: (args) => {
    const [date, setDate] = useState<Date | undefined>();
    return (
      <DatePicker
        {...args}
        value={date}
        onChange={setDate}
        onChangeFull={(v) => console.log('Full value:', v)}
      />
    );
  },
};

export const CustomFormat: Story = {
  args: {
    placeholder: 'DD/MM/YYYY',
    format: 'DD/MM/YYYY',
  },
  render: (args) => {
    const [date, setDate] = useState<Date | undefined>(new Date(2025, 5, 15));
    return <DatePicker {...args} value={date} onChange={setDate} />;
  },
};

export const FullFeatured: Story = {
  args: {
    placeholder: 'Full featured picker',
    showTime: true,
    showSeconds: true,
    use12Hour: true,
    showTimezone: true,
    format: 'YYYY-MM-DD hh:mm:ss A',
  },
  render: (args) => {
    const [date, setDate] = useState<Date | undefined>();
    return (
      <DatePicker
        {...args}
        value={date}
        onChange={setDate}
        onChangeFull={(v) => console.log('Full:', v)}
      />
    );
  },
};

// ── DateRangePicker stories ─────────────────

export const DateRange_Default: Story = {
  args: { placeholder: 'Select date range' },
  render: () => {
    const [range, setRange] = useState<DateRange | undefined>();
    return <DateRangePicker placeholder="Select date range" value={range} onChange={setRange} />;
  },
};

export const DateRange_WithValue: Story = {
  args: {},
  render: () => (
    <DateRangePicker
      value={{ startDate: new Date(2025, 5, 10), endDate: new Date(2025, 5, 20) }}
    />
  ),
};

export const DateRange_WithMinMax: Story = {
  args: { placeholder: 'Select date range' },
  render: () => {
    const [range, setRange] = useState<DateRange | undefined>();
    return (
      <DateRangePicker
        placeholder="Select date range"
        value={range}
        onChange={setRange}
        minDate={new Date(2025, 5, 1)}
        maxDate={new Date(2025, 6, 31)}
      />
    );
  },
};

export const DateRange_Disabled: Story = {
  args: {},
  render: () => (
    <DateRangePicker
      value={{ startDate: new Date(2025, 5, 10), endDate: new Date(2025, 5, 20) }}
      disabled
    />
  ),
};

export const DateRange_CustomFormat: Story = {
  args: {},
  render: () => {
    const [range, setRange] = useState<DateRange | undefined>({
      startDate: new Date(2025, 5, 10),
      endDate: new Date(2025, 5, 20),
    });
    return (
      <DateRangePicker
        placeholder="DD/MM/YYYY"
        format="DD/MM/YYYY"
        value={range}
        onChange={setRange}
      />
    );
  },
};
