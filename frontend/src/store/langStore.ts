import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface LangState {
  lang: 'en' | 'bn';
  toggle: () => void;
}

export const useLangStore = create<LangState>()(
  persist(
    (set, get) => ({
      lang: 'en',
      toggle: () => set({ lang: get().lang === 'en' ? 'bn' : 'en' }),
    }),
    { name: 'civicpulse-lang' },
  ),
);
