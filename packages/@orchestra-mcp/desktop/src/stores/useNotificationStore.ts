import { create } from 'zustand';

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface Notification {
  id: string;
  title: string;
  message?: string;
  type: NotificationType;
  duration?: number;
  createdAt: number;
}

interface NotificationState {
  notifications: Notification[];
}

interface NotificationActions {
  add: (notification: Omit<Notification, 'id' | 'createdAt'>) => string;
  dismiss: (id: string) => void;
  clear: () => void;
}

type NotificationStore = NotificationState & NotificationActions;

let counter = 0;

export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [],

  add: (notification) => {
    const id = `notif-${++counter}-${Date.now()}`;
    const entry: Notification = {
      ...notification,
      id,
      createdAt: Date.now(),
    };

    set((state) => ({
      notifications: [...state.notifications, entry],
    }));

    // Auto-dismiss after duration (default 5000ms)
    if (notification.duration !== 0) {
      const delay = notification.duration ?? 5000;
      setTimeout(() => {
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        }));
      }, delay);
    }

    return id;
  },

  dismiss: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),

  clear: () => set({ notifications: [] }),
}));
