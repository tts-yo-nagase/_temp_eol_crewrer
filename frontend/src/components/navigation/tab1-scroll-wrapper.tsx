'use client';

import { ScrollRestoration } from './scroll-restoration';

export function Tab1ScrollWrapper({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ScrollRestoration tabId="tab1" />
      {children}
    </>
  );
}
