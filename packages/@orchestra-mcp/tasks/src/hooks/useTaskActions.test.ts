import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useTaskActions } from './useTaskActions';

// Mock the MCP client
vi.mock('../mcp/client', () => ({
  mcpCall: vi.fn(),
}));

import { mcpCall } from '../mcp/client';
const mockMcpCall = vi.mocked(mcpCall);

const loc = {
  project: 'test-proj',
  epic_id: 'E-1',
  story_id: 'S-1',
  task_id: 'T-1',
};

beforeEach(() => {
  mockMcpCall.mockReset();
  mockMcpCall.mockResolvedValue({});
});

describe('useTaskActions', () => {
  it('startTask calls set_current_task', async () => {
    const { result } = renderHook(() => useTaskActions());

    await act(async () => {
      await result.current.startTask(loc);
    });

    expect(mockMcpCall).toHaveBeenCalledWith('set_current_task', loc);
    expect(result.current.starting.loading).toBe(false);
    expect(result.current.starting.error).toBeNull();
  });

  it('advanceTask calls advance_task with evidence', async () => {
    const { result } = renderHook(() => useTaskActions());

    await act(async () => {
      await result.current.advanceTask(loc, 'tests pass');
    });

    expect(mockMcpCall).toHaveBeenCalledWith('advance_task', {
      ...loc,
      evidence: 'tests pass',
    });
    expect(result.current.advancing.error).toBeNull();
  });

  it('blockTask calls update_task with status blocked', async () => {
    const { result } = renderHook(() => useTaskActions());

    await act(async () => {
      await result.current.blockTask(loc);
    });

    expect(mockMcpCall).toHaveBeenCalledWith('update_task', {
      ...loc,
      status: 'blocked',
    });
  });

  it('assignTask calls assign_task with assignee', async () => {
    const { result } = renderHook(() => useTaskActions());

    await act(async () => {
      await result.current.assignTask(loc, 'alice');
    });

    expect(mockMcpCall).toHaveBeenCalledWith('assign_task', {
      ...loc,
      assignee: 'alice',
    });
  });

  it('completeTask calls complete_task', async () => {
    const { result } = renderHook(() => useTaskActions());

    await act(async () => {
      await result.current.completeTask(loc);
    });

    expect(mockMcpCall).toHaveBeenCalledWith('complete_task', loc);
    expect(result.current.completing.error).toBeNull();
  });

  it('sets error state on failure', async () => {
    mockMcpCall.mockRejectedValueOnce(new Error('Network error'));
    const { result } = renderHook(() => useTaskActions());

    await act(async () => {
      await result.current.startTask(loc);
    });

    expect(result.current.starting.loading).toBe(false);
    expect(result.current.starting.error).toBe('Network error');
  });

  it('clears previous error on retry', async () => {
    mockMcpCall.mockRejectedValueOnce(new Error('fail'));
    const { result } = renderHook(() => useTaskActions());

    await act(async () => {
      await result.current.startTask(loc);
    });
    expect(result.current.starting.error).toBe('fail');

    mockMcpCall.mockResolvedValueOnce({});
    await act(async () => {
      await result.current.startTask(loc);
    });
    expect(result.current.starting.error).toBeNull();
  });

  it('tracks independent action states separately', async () => {
    mockMcpCall.mockRejectedValueOnce(new Error('start failed'));
    const { result } = renderHook(() => useTaskActions());

    await act(async () => {
      await result.current.startTask(loc);
    });

    await act(async () => {
      await result.current.advanceTask(loc);
    });

    expect(result.current.starting.error).toBe('start failed');
    expect(result.current.advancing.error).toBeNull();
  });
});
