import type { SessionProviderDef, SessionType } from '../types';

const providers = new Map<SessionType, SessionProviderDef>();

export function registerSessionType(def: SessionProviderDef): void {
  providers.set(def.type, def);
}

export function getSessionProvider(type: SessionType): SessionProviderDef | undefined {
  return providers.get(type);
}

export function getAllProviders(): SessionProviderDef[] {
  return Array.from(providers.values()).sort((a, b) => a.order - b.order);
}
