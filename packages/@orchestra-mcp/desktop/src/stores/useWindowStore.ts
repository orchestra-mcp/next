import { create } from 'zustand';

interface WindowState {
  name: string;
  title: string;
  isMaximized: boolean;
  isFocused: boolean;
}

interface WindowStore {
  windows: Record<string, WindowState>;
  activeWindow: string | null;
  registerWindow: (name: string, title: string) => void;
  setWindowMaximized: (name: string, isMaximized: boolean) => void;
  setWindowFocused: (name: string, isFocused: boolean) => void;
  setActiveWindow: (name: string) => void;
  closeWindow: (name: string) => void;
}

export const useWindowStore = create<WindowStore>((set) => ({
  windows: {},
  activeWindow: null,
  registerWindow: (name, title) =>
    set((state) => ({
      windows: {
        ...state.windows,
        [name]: { name, title, isMaximized: false, isFocused: true },
      },
      activeWindow: name,
    })),
  setWindowMaximized: (name, isMaximized) =>
    set((state) => ({
      windows: {
        ...state.windows,
        [name]: { ...state.windows[name], isMaximized },
      },
    })),
  setWindowFocused: (name, isFocused) =>
    set((state) => ({
      windows: {
        ...state.windows,
        [name]: { ...state.windows[name], isFocused },
      },
    })),
  setActiveWindow: (name) => set({ activeWindow: name }),
  closeWindow: (name) =>
    set((state) => {
      const { [name]: _, ...rest } = state.windows;
      return { windows: rest };
    }),
}));
