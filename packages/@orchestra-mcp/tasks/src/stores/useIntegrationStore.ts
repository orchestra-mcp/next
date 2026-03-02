import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type IntegrationProvider = 'jira' | 'linear' | 'github';

export interface IntegrationConnection {
  connected: boolean;
  user: string | null;
  lastSync: string | null;
}

interface IntegrationState {
  jira: IntegrationConnection;
  linear: IntegrationConnection;
  github: IntegrationConnection;
  syncInProgress: boolean;
}

interface IntegrationActions {
  setConnected: (provider: IntegrationProvider, user: string) => void;
  disconnect: (provider: IntegrationProvider) => void;
  setSyncInProgress: (value: boolean) => void;
  updateLastSync: (provider: IntegrationProvider, time: string) => void;
}

const emptyConnection: IntegrationConnection = {
  connected: false,
  user: null,
  lastSync: null,
};

export const useIntegrationStore = create<IntegrationState & IntegrationActions>()(
  persist(
    (set) => ({
      jira: { ...emptyConnection },
      linear: { ...emptyConnection },
      github: { ...emptyConnection },
      syncInProgress: false,

      setConnected: (provider, user) =>
        set((s) => ({
          [provider]: { ...s[provider], connected: true, user },
        })),

      disconnect: (provider) =>
        set(() => ({
          [provider]: { ...emptyConnection },
        })),

      setSyncInProgress: (value) =>
        set({ syncInProgress: value }),

      updateLastSync: (provider, time) =>
        set((s) => ({
          [provider]: { ...s[provider], lastSync: time },
        })),
    }),
    { name: 'orchestra-integrations' }
  )
);
