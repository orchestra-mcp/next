import { describe, it, expect, beforeEach } from 'vitest';
import { useTaskDetailStore } from './useTaskDetailStore';

beforeEach(() => {
  useTaskDetailStore.setState({ selectedTask: null });
});

describe('useTaskDetailStore', () => {
  it('starts with no selection', () => {
    expect(useTaskDetailStore.getState().selectedTask).toBeNull();
  });

  it('selects a task', () => {
    useTaskDetailStore.getState().selectTask({ taskId: 'T-1', epicId: 'E-1', storyId: 'S-1' });
    expect(useTaskDetailStore.getState().selectedTask).toEqual({ taskId: 'T-1', epicId: 'E-1', storyId: 'S-1' });
  });

  it('clears selection', () => {
    useTaskDetailStore.getState().selectTask({ taskId: 'T-1', epicId: 'E-1', storyId: 'S-1' });
    useTaskDetailStore.getState().clearSelection();
    expect(useTaskDetailStore.getState().selectedTask).toBeNull();
  });

  it('replaces selection', () => {
    useTaskDetailStore.getState().selectTask({ taskId: 'T-1', epicId: 'E-1', storyId: 'S-1' });
    useTaskDetailStore.getState().selectTask({ taskId: 'T-2', epicId: 'E-2', storyId: 'S-2' });
    expect(useTaskDetailStore.getState().selectedTask?.taskId).toBe('T-2');
  });
});
