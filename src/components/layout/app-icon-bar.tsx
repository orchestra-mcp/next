'use client';

import { useCallback, useMemo } from 'react';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { IconBar } from '@orchestra-mcp/app-shell';
import type { IconBarItem } from '@orchestra-mcp/app-shell';

const MAIN_ITEMS: IconBarItem[] = [
  { id: 'dashboard', icon: 'bx-home', label: 'Dashboard', view: '/dashboard' },
];

const FOOTER_ITEMS: IconBarItem[] = [
  { id: 'subscription', icon: 'bx-credit-card', label: 'Subscription', view: '/subscription' },
  { id: 'settings', icon: 'bx-cog', label: 'Settings', view: '/settings' },
];

function resolveActiveView(pathname: string, items: IconBarItem[], footerItems: IconBarItem[]): string {
  const all = [...items, ...footerItems];
  const item = all.find(
    (i) => pathname === i.view || pathname.startsWith(i.view + '/'),
  );
  return item?.view ?? '/dashboard';
}

export function AppIconBar() {
  const pathname = usePathname();
  const router = useRouter();

  const activeView = useMemo(() => resolveActiveView(pathname, MAIN_ITEMS, FOOTER_ITEMS), [pathname]);

  const handleViewChange = useCallback(
    (view: string) => {
      router.push(view);
    },
    [router],
  );

  return (
    <IconBar
      items={MAIN_ITEMS}
      activeView={activeView}
      onViewChange={handleViewChange}
      logo={<Image src="/logo.svg" alt="Orchestra" width={24} height={24} />}
      footerItems={FOOTER_ITEMS}
    />
  );
}
