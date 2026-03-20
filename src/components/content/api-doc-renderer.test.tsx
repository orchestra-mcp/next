import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

import { ApiDocRenderer } from './api-doc-renderer'

const mockEndpoints = [
  {
    id: '1',
    name: 'List Users',
    method: 'GET',
    path: '/users',
    headers: JSON.stringify([{ key: 'Authorization', value: 'Bearer token', description: 'Auth header' }]),
    query_params: JSON.stringify([{ key: 'page', value: '1', description: 'Page number' }]),
    body: '',
    body_type: 'none',
    description: 'Returns a list of all users',
    sort_order: 1,
    folder_path: '',
  },
  {
    id: '2',
    name: 'Create User',
    method: 'POST',
    path: '/users',
    headers: null,
    query_params: null,
    body: JSON.stringify({ name: 'John', email: 'john@test.com' }),
    body_type: 'json',
    description: 'Creates a new user',
    sort_order: 2,
    folder_path: 'Users',
  },
  {
    id: '3',
    name: 'Delete User',
    method: 'DELETE',
    path: '/users/:id',
    headers: null,
    query_params: null,
    body: '',
    body_type: 'none',
    description: '',
    sort_order: 3,
    folder_path: 'Users',
  },
]

describe('ApiDocRenderer', () => {
  it('renders empty state when no endpoints', () => {
    render(<ApiDocRenderer endpoints={[]} />)
    expect(screen.getByText('No endpoints documented')).toBeInTheDocument()
  })

  it('renders endpoint method badges', () => {
    render(<ApiDocRenderer endpoints={mockEndpoints} />)
    expect(screen.getByText('GET')).toBeInTheDocument()
    expect(screen.getByText('POST')).toBeInTheDocument()
    expect(screen.getByText('DELETE')).toBeInTheDocument()
  })

  it('renders endpoint paths', () => {
    render(<ApiDocRenderer endpoints={mockEndpoints} />)
    // /users appears twice (GET and POST)
    expect(screen.getAllByText('/users').length).toBe(2)
    expect(screen.getByText('/users/:id')).toBeInTheDocument()
  })

  it('renders endpoint names', () => {
    render(<ApiDocRenderer endpoints={mockEndpoints} />)
    expect(screen.getByText('List Users')).toBeInTheDocument()
    expect(screen.getByText('Create User')).toBeInTheDocument()
    expect(screen.getByText('Delete User')).toBeInTheDocument()
  })

  it('renders folder headers', () => {
    render(<ApiDocRenderer endpoints={mockEndpoints} />)
    expect(screen.getByText('Users')).toBeInTheDocument()
  })

  it('expands endpoint to show details on click', () => {
    render(<ApiDocRenderer endpoints={mockEndpoints} baseUrl="https://api.example.com" />)

    // Click on the GET /users endpoint row
    const getRow = screen.getByText('List Users').closest('[style]')
    // Click the collapsed row
    fireEvent.click(screen.getByText('List Users'))

    // Should show the URL section
    expect(screen.getByText('https://api.example.com/users')).toBeInTheDocument()
    // Should show description
    expect(screen.getByText('Returns a list of all users')).toBeInTheDocument()
  })

  it('shows parameter table when expanded', () => {
    render(<ApiDocRenderer endpoints={mockEndpoints} />)

    // Expand first endpoint
    fireEvent.click(screen.getByText('List Users'))

    // Should show header param
    expect(screen.getByText('Authorization')).toBeInTheDocument()
    expect(screen.getByText('Auth header')).toBeInTheDocument()
    // Should show query param
    expect(screen.getByText('page')).toBeInTheDocument()
    expect(screen.getByText('Page number')).toBeInTheDocument()
  })

  it('shows request body when expanded', () => {
    render(<ApiDocRenderer endpoints={mockEndpoints} />)

    // Expand POST endpoint
    fireEvent.click(screen.getByText('Create User'))

    // Should show body type badge
    expect(screen.getByText('json')).toBeInTheDocument()
  })

  it('collapses endpoint on second click', () => {
    render(<ApiDocRenderer endpoints={mockEndpoints} baseUrl="https://api.example.com" />)

    // Expand
    fireEvent.click(screen.getByText('List Users'))
    expect(screen.getByText('https://api.example.com/users')).toBeInTheDocument()

    // Collapse
    fireEvent.click(screen.getByText('List Users'))
    expect(screen.queryByText('https://api.example.com/users')).not.toBeInTheDocument()
  })

  it('shows path without base URL when none provided', () => {
    render(<ApiDocRenderer endpoints={mockEndpoints} />)
    fireEvent.click(screen.getByText('List Users'))
    // URL section shows path; /users appears in collapsed row + expanded URL
    const pathElements = screen.getAllByText('/users')
    expect(pathElements.length).toBeGreaterThanOrEqual(2)
  })

  it('handles malformed header/query param data', () => {
    const endpoints = [
      {
        id: '10',
        name: 'Bad Params',
        method: 'GET',
        path: '/test',
        headers: 'not-valid-json',
        query_params: undefined,
        body: '',
        body_type: 'none',
        description: '',
        sort_order: 1,
        folder_path: '',
      },
    ]
    // Should not crash
    render(<ApiDocRenderer endpoints={endpoints as any} />)
    expect(screen.getByText('Bad Params')).toBeInTheDocument()
  })
})
