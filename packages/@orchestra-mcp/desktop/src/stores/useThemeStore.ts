import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeStore {
  colorTheme: string;
  componentVariant: 'compact' | 'modern' | 'default';
  setColorTheme: (theme: string) => void;
  setComponentVariant: (variant: 'compact' | 'modern' | 'default') => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      colorTheme: 'orchestra',
      componentVariant: 'default',
      setColorTheme: (theme) => set({ colorTheme: theme }),
      setComponentVariant: (variant) => set({ componentVariant: variant }),
    }),
    {
      name: 'orchestra-theme-store',
    }
  )
);
