"use client";

'use client';

import { useCallback } from 'react';
import { useNotificationStore } from '../stores/useNotificationStore';
import type { NotificationType } from '../stores/useNotificationStore';

/**
 * Convenience hook for the notification system.
 * Wraps useNotificationStore with typed helper methods.
 */
export function useNotifications() {
  const { notifications, add, dismiss, clear } = useNotificationStore();

  const notify = useCallback(
    (title: string, message?: string, type: NotificationType = 'info', duration?: number) => {
      return add({ title, message, type, duration });
    },
    [add]
  );

  const success = useCallback(
    (title: string, message?: string) => add({ title, message, type: 'success' }),
    [add]
  );

  const error = useCallback(
    (title: string, message?: string) => add({ title, message, type: 'error', duration: 0 }),
    [add]
  );

  const warning = useCallback(
    (title: string, message?: string) => add({ title, message, type: 'warning' }),
    [add]
  );

  const info = useCallback(
    (title: string, message?: string) => add({ title, message, type: 'info' }),
    [add]
  );

  return {
    notifications,
    notify,
    success,
    error,
    warning,
    info,
    dismiss,
    clear,
    count: notifications.length,
  };
}
