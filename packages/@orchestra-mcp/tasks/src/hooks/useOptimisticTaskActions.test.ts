import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useOptimisticTaskActions, predictStatus } from './useOptimisticTaskActions';

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
  vi.clearAllMocks();
});

describe('predictStatus', () => {
  it('predicts in-progress for start', () => {
    expect(predictStatus('start', 'backlog')).toBe('in-progress');
    expect(predictStatus('start', 'todo')).toBe('in-progress');
    expect(predictStatus('start', 'blocked')).toBe('in-progress');
  });

  it('predicts next status for advance', () => {
    expect(predictStatus('advance', 'in-progress')).toBe('ready-for-testing');
    expect(predictStatus('advance', 'ready-for-testing')).toBe('in-testing');
    expect(predictStatus('advance', 'in-testing')).toBe('ready-for-docs');
    expect(predictStatus('advance', 'ready-for-docs')).toBe('in-docs');
    expect(predictStatus('advance', 'in-docs')).toBe('documented');
    expect(predictStatus('advance', 'documented')).toBe('in-review');
    expect(predictStatus('advance', 'in-review')).toBe('done');
  });

  it('returns null for unknown advance status', () => {
    expect(predictStatus('advance', 'done')).toBeNull();
    expect(predictStatus('advance', 'backlog')).toBeNull();
  });

  it('predicts blocked for block', () => {
    expect(predictStatus('block', 'in-progress')).toBe('blocked');
  });

  it('predicts done for complete', () => {
    expect(predictStatus('complete', 'in-progress')).toBe('done');
  });
});

describe('useOptimisticTaskActions', () => {
  it('calls onOptimisticUpdate before MCP resolves', async () => {
    let resolveCall: () => void;
    const mcpPromise = new Promise<void>((resolve) => { resolveCall = resolve; });
    mockMcpCall.mockReturnValue(mcpPromise);

    const onOptimisticUpdate = vi.fn();
    const onSettled = vi.fn();

    const { result } = renderHook(() =>
      useOptimisticTaskActions({ onOptimisticUpdate, onSettled }),
    );

    let actionPromise: Promise<void>;
    act(() => {
      actionPromise = result.current.startTask(loc, 'todo');
    });

    expect(onOptimisticUpdate).toHaveBeenCalledWith('T-1', 'in-progress');
    expect(onSettled).not.toHaveBeenCalled();

    await act(async () => {
      resolveCall!();
      await actionPromise!;
    });

    expect(onSettled).toHaveBeenCalledWith('T-1');
  });

  it('calls onRevert when MCP fails', async () => {
    mockMcpCall.mockRejectedValue(new Error('MCP error'));

    const onOptimisticUpdate = vi.fn();
    const onRevert = vi.fn();
    const onSettled = vi.fn();

    const { result } = renderHook(() =>
      useOptimisticTaskActions({ onOptimisticUpdate, onRevert, onSettled }),
    );

    await act(async () => {
      await result.current.startTask(loc, 'todo');
    });

    expect(onOptimisticUpdate).toHaveBeenCalledWith('T-1', 'in-progress');
    expect(onRevert).toHaveBeenCalledWith('T-1', 'todo');
    expect(onSettled).toHaveBeenCalledWith('T-1');
  });

  it('calls onSettled on success', async () => {
    mockMcpCall.mockResolvedValue({});

    const onSettled = vi.fn();
    const { result } = renderHook(() =>
      useOptimisticTaskActions({ onSettled }),
    );

    await act(async () => {
      await result.current.advanceTask(loc, 'in-progress');
    });

    expect(onSettled).toHaveBeenCalledWith('T-1');
  });

  it('calls onSettled on error', async () => {
    mockMcpCall.mockRejectedValue(new Error('fail'));

    const onSettled = vi.fn();
    const { result } = renderHook(() =>
      useOptimisticTaskActions({ onSettled }),
    );

    await act(async () => {
      await result.current.blockTask(loc, 'in-progress');
    });

    expect(onSettled).toHaveBeenCalledWith('T-1');
  });

  it('tracks pending tasks during action', async () => {
    let resolveCall: () => void;
    const mcpPromise = new Promise<void>((resolve) => { resolveCall = resolve; });
    mockMcpCall.mockReturnValue(mcpPromise);

    const { result } = renderHook(() => useOptimisticTaskActions());

    let actionPromise: Promise<void>;
    act(() => {
      actionPromise = result.current.completeTask(loc, 'in-progress');
    });

    expect(result.current.pendingTasks.has('T-1')).toBe(true);

    await act(async () => {
      resolveCall!();
      await actionPromise!;
    });

    expect(result.current.pendingTasks.has('T-1')).toBe(false);
  });

  it('predicts advance status correctly', async () => {
    mockMcpCall.mockResolvedValue({});

    const onOptimisticUpdate = vi.fn();
    const { result } = renderHook(() =>
      useOptimisticTaskActions({ onOptimisticUpdate }),
    );

    await act(async () => {
      await result.current.advanceTask(loc, 'in-progress');
    });

    expect(onOptimisticUpdate).toHaveBeenCalledWith('T-1', 'ready-for-testing');
  });

  it('predicts block status correctly', async () => {
    mockMcpCall.mockResolvedValue({});

    const onOptimisticUpdate = vi.fn();
    const { result } = renderHook(() =>
      useOptimisticTaskActions({ onOptimisticUpdate }),
    );

    await act(async () => {
      await result.current.blockTask(loc, 'in-progress');
    });

    expect(onOptimisticUpdate).toHaveBeenCalledWith('T-1', 'blocked');
  });

  it('predicts complete status correctly', async () => {
    mockMcpCall.mockResolvedValue({});

    const onOptimisticUpdate = vi.fn();
    const { result } = renderHook(() =>
      useOptimisticTaskActions({ onOptimisticUpdate }),
    );

    await act(async () => {
      await result.current.completeTask(loc, 'in-progress');
    });

    expect(onOptimisticUpdate).toHaveBeenCalledWith('T-1', 'done');
  });

  it('removes task from pendingTasks after error', async () => {
    mockMcpCall.mockRejectedValue(new Error('fail'));

    const { result } = renderHook(() => useOptimisticTaskActions());

    await act(async () => {
      await result.current.startTask(loc, 'backlog');
    });

    expect(result.current.pendingTasks.has('T-1')).toBe(false);
  });
});
