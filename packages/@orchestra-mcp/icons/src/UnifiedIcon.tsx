import type { IconProps } from './types';
import { useIconResolvers } from './IconProvider';
import { BoxIcon } from './boxicons/BoxIcon';

export interface UnifiedIconProps extends IconProps {
  /**
   * Icon name with optional pack prefix.
   *
   * Formats:
   * - 'bx-home'       → Boxicon regular (default pack)
   * - 'bxs-star'      → Boxicon solid (default pack)
   * - 'bxl-github'    → Boxicon logo (default pack)
   * - 'code:file'     → code pack via IconProvider
   * - 'launcher:star'  → launcher pack via IconProvider
   * - 'my:custom'     → custom pack via IconProvider
   */
  name: string;
}

/**
 * Unified icon component that resolves icons across all registered packs.
 *
 * Resolution order:
 * 1. If name contains ':', split into prefix:name and look up via IconProvider
 * 2. If name starts with 'bx-', 'bxs-', or 'bxl-', resolve from Boxicons
 * 3. Fall back to IconProvider resolvers
 *
 * @example
 * <UnifiedIcon name="bx-home" size={24} />
 * <UnifiedIcon name="code:file" color="blue" />
 */
export function UnifiedIcon({ name, size, color, className }: UnifiedIconProps) {
  const { resolvers } = useIconResolvers();
  const props: IconProps = { size, color, className };

  // Pack-prefixed icons (e.g. 'code:file')
  if (name.includes(':')) {
    const [prefix, iconName] = name.split(':', 2);
    const resolver = resolvers.get(prefix);
    if (resolver) {
      return resolver(iconName, props);
    }
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[UnifiedIcon] Unknown pack prefix: "${prefix}"`);
    }
    return null;
  }

  // Boxicon names (bx-*, bxs-*, bxl-*)
  if (name.startsWith('bx-') || name.startsWith('bxs-') || name.startsWith('bxl-')) {
    return <BoxIcon name={name} {...props} />;
  }

  // Try each registered resolver as fallback
  for (const [, resolver] of resolvers) {
    const result = resolver(name, props);
    if (result) return result;
  }

  if (process.env.NODE_ENV === 'development') {
    console.warn(`[UnifiedIcon] Could not resolve icon: "${name}"`);
  }
  return null;
}
