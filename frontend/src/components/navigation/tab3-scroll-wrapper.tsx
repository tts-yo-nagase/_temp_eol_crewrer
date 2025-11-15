'use client';

import { ScrollRestoration } from './scroll-restoration';

export function Tab3ScrollWrapper({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ScrollRestoration tabId="tab3" />
      {children}
    </>
  );
}
