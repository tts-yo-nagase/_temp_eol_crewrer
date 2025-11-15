'use client';

import { useEffect, useRef } from 'react';
import { useTabStore } from '@/app/store/useTabStore';

type TabId = 'tab1' | 'tab2' | 'tab3' | 'tab4' | 'tab5';

interface ScrollRestorationProps {
  tabId: TabId;
}

export function ScrollRestoration({ tabId }: ScrollRestorationProps) {
  const { getScrollPosition, saveScrollPosition } = useTabStore();
  const throttleTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Restore scroll position on mount
    const savedPosition = getScrollPosition(tabId);
    if (savedPosition > 0) {
      window.scrollTo(0, savedPosition);
    }

    // Save scroll position on scroll with throttle (100ms)
    const handleScroll = () => {
      if (throttleTimerRef.current) return;

      throttleTimerRef.current = setTimeout(() => {
        const position = window.scrollY;
        saveScrollPosition(tabId, position);
        throttleTimerRef.current = null;
      }, 100);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (throttleTimerRef.current) {
        clearTimeout(throttleTimerRef.current);
      }
    };
  }, [tabId, getScrollPosition, saveScrollPosition]);

  return null;
}
