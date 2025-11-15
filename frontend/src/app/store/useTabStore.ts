import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type TabId = 'tab1' | 'tab2' | 'tab3' | 'tab4' | 'tab5';

interface TabState {
  scrollPosition: number;
  formData?: Record<string, unknown>;
  lastUrl?: string;
}

interface TabStore {
  activeTab: TabId;
  tabStates: Record<TabId, TabState>;
  setActiveTab: (tab: TabId) => void;
  saveScrollPosition: (tab: TabId, position: number) => void;
  getScrollPosition: (tab: TabId) => number;
  saveFormData: (tab: TabId, data: Record<string, unknown>) => void;
  getFormData: (tab: TabId) => Record<string, unknown> | undefined;
  saveLastUrl: (tab: TabId, url: string) => void;
  getLastUrl: (tab: TabId) => string | undefined;
}

export const useTabStore = create<TabStore>()(
  persist(
    (set, get) => ({
      activeTab: 'tab1',
      tabStates: {
        tab1: { scrollPosition: 0 },
        tab2: { scrollPosition: 0 },
        tab3: { scrollPosition: 0 },
        tab4: { scrollPosition: 0 },
        tab5: { scrollPosition: 0 },
      },
      setActiveTab: (tab) => set({ activeTab: tab }),
      saveScrollPosition: (tab, position) =>
        set((state) => ({
          tabStates: {
            ...state.tabStates,
            [tab]: {
              ...state.tabStates[tab],
              scrollPosition: position,
            },
          },
        })),
      getScrollPosition: (tab) => get().tabStates[tab]?.scrollPosition || 0,
      saveFormData: (tab, data) =>
        set((state) => ({
          tabStates: {
            ...state.tabStates,
            [tab]: {
              ...state.tabStates[tab],
              formData: data,
            },
          },
        })),
      getFormData: (tab) => get().tabStates[tab]?.formData,
      saveLastUrl: (tab, url) =>
        set((state) => ({
          tabStates: {
            ...state.tabStates,
            [tab]: {
              ...state.tabStates[tab],
              lastUrl: url,
            },
          },
        })),
      getLastUrl: (tab) => get().tabStates[tab]?.lastUrl,
    }),
    {
      name: 'tab-store',
    }
  )
);
