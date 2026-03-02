import type { Meta, StoryObj } from '@storybook/react';
import type { CreateEvent } from '../types/events';
import { CreateCard } from './CreateCard';

const meta = {
  title: 'AI/Cards/CreateCard',
  component: CreateCard,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ width: 480 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof CreateCard>;

export default meta;
type Story = StoryObj<typeof meta>;

const defaultEvent: CreateEvent = {
  id: '1',
  type: 'create',
  filePath: 'src/utils/format.ts',
  language: 'typescript',
  content: [
    'export function formatDate(date: Date): string {',
    '  return date.toISOString().split("T")[0];',
    '}',
    '',
    'export function formatCurrency(amount: number): string {',
    '  return new Intl.NumberFormat("en-US", {',
    '    style: "currency",',
    '    currency: "USD",',
    '  }).format(amount);',
    '}',
  ].join('\n'),
};

export const Default: Story = {
  args: {
    event: defaultEvent,
  },
};

export const Collapsed: Story = {
  args: {
    event: defaultEvent,
    defaultCollapsed: true,
  },
};

export const LargeFile: Story = {
  args: {
    event: {
      id: '2',
      type: 'create',
      filePath: 'src/api/client.ts',
      language: 'typescript',
      content: [
        "import axios from 'axios';",
        "import type { AxiosInstance, AxiosRequestConfig } from 'axios';",
        '',
        'export interface ApiResponse<T> {',
        '  data: T;',
        '  status: number;',
        '  message: string;',
        '}',
        '',
        'export interface PaginatedResponse<T> extends ApiResponse<T[]> {',
        '  total: number;',
        '  page: number;',
        '  perPage: number;',
        '  lastPage: number;',
        '}',
        '',
        'class ApiClient {',
        '  private instance: AxiosInstance;',
        '',
        '  constructor(baseURL: string) {',
        '    this.instance = axios.create({',
        '      baseURL,',
        '      timeout: 10000,',
        "      headers: { 'Content-Type': 'application/json' },",
        '    });',
        '',
        '    this.instance.interceptors.request.use((config) => {',
        "      const token = localStorage.getItem('auth_token');",
        '      if (token) {',
        '        config.headers.Authorization = `Bearer ${token}`;',
        '      }',
        '      return config;',
        '    });',
        '  }',
        '',
        '  async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {',
        '    const response = await this.instance.get(url, config);',
        '    return response.data;',
        '  }',
        '',
        '  async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {',
        '    const response = await this.instance.post(url, data, config);',
        '    return response.data;',
        '  }',
        '',
        '  async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {',
        '    const response = await this.instance.put(url, data, config);',
        '    return response.data;',
        '  }',
        '',
        '  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {',
        '    const response = await this.instance.delete(url, config);',
        '    return response.data;',
        '  }',
        '}',
        '',
        "export const api = new ApiClient(import.meta.env.VITE_API_URL || 'http://localhost:3000');",
      ].join('\n'),
    } satisfies CreateEvent,
  },
};
