import type { Meta, StoryObj } from '@storybook/react';
import { DataTable } from './DataTable';
import type { Column } from './DataTable';

const basicColumns: Column[] = [
  { key: 'name', header: 'Name' },
  { key: 'role', header: 'Role' },
  { key: 'status', header: 'Status', align: 'center' },
];

const basicRows = [
  ['Alice Johnson', 'Frontend Developer', 'Active'],
  ['Bob Smith', 'Backend Engineer', 'Active'],
  ['Charlie Brown', 'Designer', 'Away'],
  ['Diana Prince', 'Product Manager', 'Active'],
  ['Eve Wilson', 'DevOps Engineer', 'Offline'],
];

const numericColumns: Column[] = [
  { key: 'endpoint', header: 'Endpoint' },
  { key: 'requests', header: 'Requests', align: 'right', sortable: true },
  { key: 'latency', header: 'Avg Latency (ms)', align: 'right', sortable: true },
  { key: 'errors', header: 'Error Rate', align: 'right', sortable: true },
];

const numericRows = [
  ['/api/users', '12,450', '45', '0.2%'],
  ['/api/projects', '8,320', '62', '0.5%'],
  ['/api/tasks', '24,100', '38', '0.1%'],
  ['/api/search', '3,200', '120', '1.2%'],
  ['/api/sync', '18,900', '55', '0.3%'],
];

const meta = {
  title: 'Widgets/DataTable',
  component: DataTable,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  argTypes: {
    sortable: { control: 'boolean' },
    exportable: { control: 'boolean' },
    exportImage: { control: 'boolean' },
    maxHeight: { control: 'number' },
  },
} satisfies Meta<typeof DataTable>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    columns: basicColumns,
    rows: basicRows,
  },
};

export const Sortable: Story = {
  args: {
    columns: basicColumns.map((c) => ({ ...c, sortable: true })),
    rows: basicRows,
    sortable: true,
  },
};

export const NumericData: Story = {
  args: {
    columns: numericColumns,
    rows: numericRows,
  },
};

export const Exportable: Story = {
  args: {
    columns: basicColumns,
    rows: basicRows,
    exportable: true,
  },
};

export const ExportImage: Story = {
  args: {
    columns: basicColumns,
    rows: basicRows,
    exportImage: true,
  },
};

export const AllExportOptions: Story = {
  args: {
    columns: numericColumns,
    rows: numericRows,
    exportable: true,
    exportImage: true,
  },
};

export const ScrollableMaxHeight: Story = {
  args: {
    columns: basicColumns,
    rows: [
      ...basicRows,
      ...basicRows.map((r) => r.map((c) => c + ' (copy)')),
      ...basicRows.map((r) => r.map((c) => c + ' (copy 2)')),
    ],
    maxHeight: 250,
  },
};

export const MixedAlignment: Story = {
  args: {
    columns: [
      { key: 'item', header: 'Item', align: 'left' },
      { key: 'qty', header: 'Quantity', align: 'center' },
      { key: 'price', header: 'Price', align: 'right' },
    ],
    rows: [
      ['Widget A', '100', '$12.99'],
      ['Widget B', '250', '$8.49'],
      ['Widget C', '50', '$24.99'],
    ],
  },
};

export const EmptyTable: Story = {
  args: {
    columns: basicColumns,
    rows: [],
  },
};
