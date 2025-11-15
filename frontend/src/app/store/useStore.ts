'use client'

import { create } from 'zustand'

interface SampleTextState {
  text: string
  setText: (text: string) => void
}

export const useSampleTextStore = create<SampleTextState>((set) => ({
  text: 'Hello World',
  setText: (text) => set({ text }),
})) 