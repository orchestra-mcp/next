import { describe, it, expect, beforeEach } from 'vitest';
import { useNotificationStore } from './useNotificationStore';

describe('useNotificationStore', () => {
  beforeEach(() => {
    useNotificationStore.setState({ notifications: [] });
  });

  it('initializes with empty notifications', () => {
    const state = useNotificationStore.getState();
    expect(state.notifications).toEqual([]);
  });

  it('add inserts a notification into the list', () => {
    useNotificationStore.getState().add({ title: 'Hello', type: 'info', duration: 0 });
    const { notifications } = useNotificationStore.getState();
    expect(notifications).toHaveLength(1);
    expect(notifications[0].title).toBe('Hello');
    expect(notifications[0].type).toBe('info');
  });

  it('add returns the generated id', () => {
    const id = useNotificationStore.getState().add({ title: 'Test', type: 'success', duration: 0 });
    expect(typeof id).toBe('string');
    expect(id).toBeTruthy();
  });

  it('add sets createdAt timestamp', () => {
    const before = Date.now();
    useNotificationStore.getState().add({ title: 'Time', type: 'info', duration: 0 });
    const after = Date.now();
    const { notifications } = useNotificationStore.getState();
    expect(notifications[0].createdAt).toBeGreaterThanOrEqual(before);
    expect(notifications[0].createdAt).toBeLessThanOrEqual(after);
  });

  it('dismiss removes the notification by id', () => {
    const id = useNotificationStore.getState().add({ title: 'To remove', type: 'warning', duration: 0 });
    useNotificationStore.getState().dismiss(id);
    expect(useNotificationStore.getState().notifications).toHaveLength(0);
  });

  it('dismiss only removes the targeted notification', () => {
    const id1 = useNotificationStore.getState().add({ title: 'Keep me', type: 'info', duration: 0 });
    useNotificationStore.getState().add({ title: 'Remove me', type: 'error', duration: 0 });
    const id2 = useNotificationStore.getState().notifications[1].id;

    useNotificationStore.getState().dismiss(id2);

    const { notifications } = useNotificationStore.getState();
    expect(notifications).toHaveLength(1);
    expect(notifications[0].id).toBe(id1);
  });

  it('clear removes all notifications', () => {
    useNotificationStore.getState().add({ title: 'First', type: 'info', duration: 0 });
    useNotificationStore.getState().add({ title: 'Second', type: 'success', duration: 0 });
    useNotificationStore.getState().clear();
    expect(useNotificationStore.getState().notifications).toHaveLength(0);
  });

  it('can add multiple notifications', () => {
    useNotificationStore.getState().add({ title: 'A', type: 'info', duration: 0 });
    useNotificationStore.getState().add({ title: 'B', type: 'success', duration: 0 });
    useNotificationStore.getState().add({ title: 'C', type: 'error', duration: 0 });
    expect(useNotificationStore.getState().notifications).toHaveLength(3);
  });

  it('stores optional message field', () => {
    useNotificationStore.getState().add({
      title: 'With Message',
      message: 'Detail text',
      type: 'info',
      duration: 0,
    });
    const { notifications } = useNotificationStore.getState();
    expect(notifications[0].message).toBe('Detail text');
  });

  it('notification id is unique for each call', () => {
    const id1 = useNotificationStore.getState().add({ title: 'A', type: 'info', duration: 0 });
    const id2 = useNotificationStore.getState().add({ title: 'B', type: 'info', duration: 0 });
    expect(id1).not.toBe(id2);
  });
});
