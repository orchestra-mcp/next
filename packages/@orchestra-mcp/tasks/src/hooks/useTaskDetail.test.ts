import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useTaskDetail } from './useTaskDetail';
import type { TaskDetailParams, TaskDetail } from './useTaskDetail';

vi.mock('../mcp/client', () => ({
  mcpCall: vi.fn(),
}));

import { mcpCall } from '../mcp/client';
const mockMcpCall = vi.mocked(mcpCall);

const params: TaskDetailParams = {
  project: 'test-proj',
  epicId: 'E-1',
  storyId: 'S-1',
  taskId: 'T-1',
};

const mockTask: TaskDetail = {
  id: 'T-1',
  title: 'Implement login',
  status: 'in-progress',
  type: 'task',
  priority: 'high',
  assigned_to: 'alice',
  labels: ['auth'],
  updated_at: '2026-01-15T10:00:00Z',
};

beforeEach(() => {
  mockMcpCall.mockReset();
});

describe('useTaskDetail', () => {
  it('returns null task when params is null', () => {
    const { result } = renderHook(() => useTaskDetail(null));

    expect(result.current.task).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('fetches task detail on mount with valid params', async () => {
    mockMcpCall.mockResolvedValueOnce(mockTask);
    const { result } = renderHook(() => useTaskDetail(params));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockMcpCall).toHaveBeenCalledWith('get_task', {
      project: 'test-proj',
      epic_id: 'E-1',
      story_id: 'S-1',
      task_id: 'T-1',
    });
    expect(result.current.task).toEqual(mockTask);
    expect(result.current.error).toBeNull();
  });

  it('sets loading during fetch', async () => {
    let resolve: (v: unknown) => void;
    mockMcpCall.mockImplementationOnce(
      () => new Promise((r) => { resolve = r; }),
    );

    const { result } = renderHook(() => useTaskDetail(params));

    await waitFor(() => {
      expect(result.current.loading).toBe(true);
    });

    await act(async () => {
      resolve!(mockTask);
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.task).toEqual(mockTask);
  });

  it('sets error on fetch failure', async () => {
    mockMcpCall.mockRejectedValueOnce(new Error('Network error'));
    const { result } = renderHook(() => useTaskDetail(params));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Network error');
    expect(result.current.task).toBeNull();
  });

  it('refresh re-fetches the task', async () => {
    mockMcpCall.mockResolvedValueOnce(mockTask);
    const { result } = renderHook(() => useTaskDetail(params));

    await waitFor(() => {
      expect(result.current.task).toEqual(mockTask);
    });

    const updated = { ...mockTask, status: 'done' };
    mockMcpCall.mockResolvedValueOnce(updated);

    await act(async () => {
      await result.current.refresh();
    });

    expect(result.current.task).toEqual(updated);
    expect(mockMcpCall).toHaveBeenCalledTimes(2);
  });

  it('resets task to null when params changes to null', async () => {
    mockMcpCall.mockResolvedValueOnce(mockTask);
    const { result, rerender } = renderHook(
      ({ p }: { p: TaskDetailParams | null }) => useTaskDetail(p),
      { initialProps: { p: params } },
    );

    await waitFor(() => {
      expect(result.current.task).toEqual(mockTask);
    });

    rerender({ p: null });

    await waitFor(() => {
      expect(result.current.task).toBeNull();
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });
});

describe('useTaskDetail stale detection', () => {
  it('initializes isStale as false', async () => {
    mockMcpCall.mockResolvedValueOnce(mockTask);
    const { result } = renderHook(() => useTaskDetail(params));

    await waitFor(() => {
      expect(result.current.task).toEqual(mockTask);
    });

    expect(result.current.isStale).toBe(false);
  });

  it('checkForUpdates sets isStale when updated_at differs', async () => {
    mockMcpCall.mockResolvedValueOnce(mockTask);
    const { result } = renderHook(() => useTaskDetail(params));

    await waitFor(() => {
      expect(result.current.task).toEqual(mockTask);
    });

    const freshTask = { ...mockTask, updated_at: '2026-01-16T10:00:00Z' };
    mockMcpCall.mockResolvedValueOnce(freshTask);

    await act(async () => {
      await result.current.checkForUpdates();
    });

    expect(result.current.isStale).toBe(true);
    // Task data should NOT be overwritten
    expect(result.current.task?.updated_at).toBe('2026-01-15T10:00:00Z');
  });

  it('checkForUpdates does NOT set isStale when updated_at matches', async () => {
    mockMcpCall.mockResolvedValueOnce(mockTask);
    const { result } = renderHook(() => useTaskDetail(params));

    await waitFor(() => {
      expect(result.current.task).toEqual(mockTask);
    });

    mockMcpCall.mockResolvedValueOnce({ ...mockTask });

    await act(async () => {
      await result.current.checkForUpdates();
    });

    expect(result.current.isStale).toBe(false);
  });

  it('checkForUpdates silently ignores errors', async () => {
    mockMcpCall.mockResolvedValueOnce(mockTask);
    const { result } = renderHook(() => useTaskDetail(params));

    await waitFor(() => {
      expect(result.current.task).toEqual(mockTask);
    });

    mockMcpCall.mockRejectedValueOnce(new Error('Network down'));

    await act(async () => {
      await result.current.checkForUpdates();
    });

    expect(result.current.isStale).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('checkForUpdates does nothing when task is null', async () => {
    const { result } = renderHook(() => useTaskDetail(null));

    await act(async () => {
      await result.current.checkForUpdates();
    });

    expect(mockMcpCall).not.toHaveBeenCalled();
    expect(result.current.isStale).toBe(false);
  });

  it('acceptStale updates the task with the fresh version', async () => {
    mockMcpCall.mockResolvedValueOnce(mockTask);
    const { result } = renderHook(() => useTaskDetail(params));

    await waitFor(() => {
      expect(result.current.task).toEqual(mockTask);
    });

    const freshTask = {
      ...mockTask,
      title: 'Updated title',
      updated_at: '2026-01-16T10:00:00Z',
    };
    mockMcpCall.mockResolvedValueOnce(freshTask);

    await act(async () => {
      await result.current.checkForUpdates();
    });

    expect(result.current.isStale).toBe(true);

    act(() => {
      result.current.acceptStale();
    });

    expect(result.current.isStale).toBe(false);
    expect(result.current.task?.title).toBe('Updated title');
    expect(result.current.task?.updated_at).toBe('2026-01-16T10:00:00Z');
  });

  it('dismissStale clears isStale without updating task', async () => {
    mockMcpCall.mockResolvedValueOnce(mockTask);
    const { result } = renderHook(() => useTaskDetail(params));

    await waitFor(() => {
      expect(result.current.task).toEqual(mockTask);
    });

    const freshTask = {
      ...mockTask,
      title: 'Updated title',
      updated_at: '2026-01-16T10:00:00Z',
    };
    mockMcpCall.mockResolvedValueOnce(freshTask);

    await act(async () => {
      await result.current.checkForUpdates();
    });

    expect(result.current.isStale).toBe(true);

    act(() => {
      result.current.dismissStale();
    });

    expect(result.current.isStale).toBe(false);
    // Task should still have the old data
    expect(result.current.task?.title).toBe('Implement login');
    expect(result.current.task?.updated_at).toBe('2026-01-15T10:00:00Z');
  });

  it('refresh clears isStale', async () => {
    mockMcpCall.mockResolvedValueOnce(mockTask);
    const { result } = renderHook(() => useTaskDetail(params));

    await waitFor(() => {
      expect(result.current.task).toEqual(mockTask);
    });

    const freshTask = { ...mockTask, updated_at: '2026-01-16T10:00:00Z' };
    mockMcpCall.mockResolvedValueOnce(freshTask);

    await act(async () => {
      await result.current.checkForUpdates();
    });

    expect(result.current.isStale).toBe(true);

    const refreshedTask = { ...mockTask, updated_at: '2026-01-17T10:00:00Z' };
    mockMcpCall.mockResolvedValueOnce(refreshedTask);

    await act(async () => {
      await result.current.refresh();
    });

    expect(result.current.isStale).toBe(false);
    expect(result.current.task?.updated_at).toBe('2026-01-17T10:00:00Z');
  });
});
