import { create } from 'zustand';
import type { IssueCategory, IssueSeverity, IssueStatus } from '../types';

interface FilterState {
  status: IssueStatus | '';
  category: IssueCategory | '';
  severity: IssueSeverity | '';
  search: string;
  page: number;
  setFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  reset: () => void;
}

const defaults = { status: '' as const, category: '' as const, severity: '' as const, search: '', page: 1 };

export const useFilterStore = create<FilterState>((set) => ({
  ...defaults,
  setFilter: (key, value) => set({ [key]: value, page: 1 }),
  reset: () => set(defaults),
}));
