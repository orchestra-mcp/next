"use client";

import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { useBootstrap } from './hooks/useBootstrap';

interface BootstrapContextValue {
  ready: boolean;
}

const BootstrapContext = createContext<BootstrapContextValue>({ ready: false });

/** Access bootstrap state from any child component */
export const useBootstrapContext = () => useContext(BootstrapContext);

/**
 * Wraps the app and loads UI manifest from Go backend at boot.
 * Panels can check useBootstrapContext().ready before rendering manifest-dependent content.
 */
export function BootstrapProvider({ children }: { children: ReactNode }) {
  const { ready } = useBootstrap();

  return (
    <BootstrapContext.Provider value={{ ready }}>
      {children}
    </BootstrapContext.Provider>
  );
}
