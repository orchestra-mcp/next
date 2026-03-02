"use client";

import { createContext, useContext, useMemo } from 'react';
import type { IconProps } from './types';

/** A resolver function that turns an icon name into a React element */
type IconResolver = (name: string, props: IconProps) => React.ReactElement | null;

interface IconProviderContextValue {
  resolvers: Map<string, IconResolver>;
}

const IconProviderContext = createContext<IconProviderContextValue>({
  resolvers: new Map(),
});

export interface IconPack {
  /** Unique pack prefix, e.g. 'bx', 'code', 'launcher' */
  prefix: string;
  /** Function that resolves an icon name (without prefix) to a component */
  resolve: IconResolver;
}

export interface IconProviderProps {
  /** Icon packs to register */
  packs: IconPack[];
  children: React.ReactNode;
}

/**
 * Provides icon packs to the component tree.
 * Plugins can register their own icon packs via this provider.
 *
 * @example
 * const myPack: IconPack = {
 *   prefix: 'my',
 *   resolve: (name, props) => <MyCustomIcon name={name} {...props} />,
 * };
 *
 * <IconProvider packs={[boxiconPack, myPack]}>
 *   <App />
 * </IconProvider>
 */
export function IconProvider({ packs, children }: IconProviderProps) {
  const value = useMemo(() => {
    const resolvers = new Map<string, IconResolver>();
    for (const pack of packs) {
      resolvers.set(pack.prefix, pack.resolve);
    }
    return { resolvers };
  }, [packs]);

  return (
    <IconProviderContext.Provider value={value}>
      {children}
    </IconProviderContext.Provider>
  );
}

/** Hook to access registered icon resolvers */
export function useIconResolvers() {
  return useContext(IconProviderContext);
}
