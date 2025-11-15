'use client';

import { ScrollRestoration } from './scroll-restoration';

export function Tab5ScrollWrapper({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ScrollRestoration tabId="tab5" />
      {children}
    </>
  );
}
