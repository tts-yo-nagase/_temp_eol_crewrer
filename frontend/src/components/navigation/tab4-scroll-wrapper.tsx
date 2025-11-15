'use client';

import { ScrollRestoration } from './scroll-restoration';

export function Tab4ScrollWrapper({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ScrollRestoration tabId="tab4" />
      {children}
    </>
  );
}
