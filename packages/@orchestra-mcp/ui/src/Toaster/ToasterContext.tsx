"use client";

import { createContext, useContext, useCallback, useState, useRef } from 'react';
import type { ReactNode } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading';

export type ToastPosition =
  | 'top-right' | 'top-left'
  | 'bottom-right' | 'bottom-left'
  | 'top-center' | 'bottom-center';

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastOptions {
  type?: ToastType;
  title: string;
  message?: string;
  duration?: number;
  action?: ToastAction;
  icon?: ReactNode;
}

export interface ToastItem extends Required<Pick<ToastOptions, 'title' | 'type'>> {
  id: string;
  message?: string;
  duration: number;
  action?: ToastAction;
  icon?: ReactNode;
  createdAt: number;
}

export interface ToasterContextValue {
  toasts: ToastItem[];
  toast: (options: ToastOptions) => string;
  dismiss: (id: string) => void;
  dismissAll: () => void;
}

const ToasterContext = createContext<ToasterContextValue | null>(null);

export const useToaster = (): ToasterContextValue => {
  const ctx = useContext(ToasterContext);
  if (!ctx) {
    throw new Error('useToaster must be used within a ToasterProvider');
  }
  return ctx;
};

let counter = 0;

export const ToasterProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const toastsRef = useRef(toasts);
  toastsRef.current = toasts;

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const dismissAll = useCallback(() => {
    setToasts([]);
  }, []);

  const toast = useCallback((options: ToastOptions): string => {
    const id = `toast-${++counter}`;
    const item: ToastItem = {
      id,
      type: options.type ?? 'info',
      title: options.title,
      message: options.message,
      duration: options.duration ?? 5000,
      action: options.action,
      icon: options.icon,
      createdAt: Date.now(),
    };
    setToasts((prev) => [item, ...prev]);
    return id;
  }, []);

  return (
    <ToasterContext.Provider value={{ toasts, toast, dismiss, dismissAll }}>
      {children}
    </ToasterContext.Provider>
  );
};
