'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface ScrollContextType {
  isScrolled: boolean;
  headerHeight: number;
}

const ScrollContext = createContext<ScrollContextType>({
  isScrolled: false,
  headerHeight: 88, // Default: 48px (logo) + 40px (tabs with border-box)
});

export function useScroll() {
  const context = useContext(ScrollContext);
  if (!context) {
    throw new Error('useScroll must be used within ScrollProvider');
  }
  return context;
}

interface ScrollProviderProps {
  children: React.ReactNode;
}

export function ScrollProvider({ children }: ScrollProviderProps) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 48); // 48px = logo bar height
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Calculate current header height based on scroll state
  // Logo: 48px (h-12), Tabs: 40px (h-10, border-b included in box-sizing)
  const headerHeight = isScrolled ? 40 : 88; // 40px (tabs) or 88px (logo + tabs)

  return (
    <ScrollContext.Provider value={{ isScrolled, headerHeight }}>
      {children}
    </ScrollContext.Provider>
  );
}
