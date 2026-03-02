import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useNotifications } from './useNotifications';
import { useNotificationStore } from '../stores/useNotificationStore';

describe('useNotifications', () => {
  beforeEach(() => {
    useNotificationStore.setState({ notifications: [] });
  });

  it('returns an empty notifications array initially', () => {
    const { result } = renderHook(() => useNotifications());
    expect(result.current.notifications).toEqual([]);
  });

  it('count is 0 initially', () => {
    const { result } = renderHook(() => useNotifications());
    expect(result.current.count).toBe(0);
  });

  it('notify adds a notification with the correct type', () => {
    const { result } = renderHook(() => useNotifications());

    act(() => {
      result.current.notify('Test Title', 'Test message', 'info', 0);
    });

    expect(result.current.notifications).toHaveLength(1);
    expect(result.current.notifications[0].title).toBe('Test Title');
    expect(result.current.notifications[0].type).toBe('info');
    expect(result.current.count).toBe(1);
  });

  it('success adds a success notification', () => {
    const { result } = renderHook(() => useNotifications());

    act(() => {
      result.current.success('Success!', 'Operation completed');
    });

    expect(result.current.notifications[0].type).toBe('success');
    expect(result.current.notifications[0].title).toBe('Success!');
  });

  it('error adds an error notification with duration=0', () => {
    const { result } = renderHook(() => useNotifications());

    act(() => {
      result.current.error('Error!', 'Something failed');
    });

    expect(result.current.notifications[0].type).toBe('error');
    expect(result.current.notifications[0].duration).toBe(0);
  });

  it('warning adds a warning notification', () => {
    const { result } = renderHook(() => useNotifications());

    act(() => {
      result.current.warning('Warning!');
    });

    expect(result.current.notifications[0].type).toBe('warning');
  });

  it('info adds an info notification', () => {
    const { result } = renderHook(() => useNotifications());

    act(() => {
      result.current.info('Info!');
    });

    expect(result.current.notifications[0].type).toBe('info');
  });

  it('dismiss removes the notification by id', () => {
    const { result } = renderHook(() => useNotifications());
    let id: string;

    act(() => {
      id = result.current.notify('To dismiss', undefined, 'info', 0);
    });

    expect(result.current.notifications).toHaveLength(1);

    act(() => {
      result.current.dismiss(id);
    });

    expect(result.current.notifications).toHaveLength(0);
  });

  it('clear removes all notifications', () => {
    const { result } = renderHook(() => useNotifications());

    act(() => {
      result.current.notify('First', undefined, 'info', 0);
      result.current.notify('Second', undefined, 'success', 0);
    });

    expect(result.current.notifications).toHaveLength(2);

    act(() => {
      result.current.clear();
    });

    expect(result.current.notifications).toHaveLength(0);
    expect(result.current.count).toBe(0);
  });

  it('notify returns the notification id', () => {
    const { result } = renderHook(() => useNotifications());
    let id: string;

    act(() => {
      id = result.current.notify('Title', undefined, 'info', 0);
    });

    expect(typeof id!).toBe('string');
    expect(id!).toBeTruthy();
  });
});
