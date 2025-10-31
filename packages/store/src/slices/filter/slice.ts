import type {StateCreator} from 'zustand';
import type {ItemFilterState} from '@vohrad/types';

export interface FilterSlice {
  pendingFilters: ItemFilterState | null;
  setPendingFilters: (filters: ItemFilterState | null) => void;
  clearPendingFilters: () => void;
}

export const createFilterSlice: StateCreator<FilterSlice> = (set) => ({
  pendingFilters: null,
  setPendingFilters: (filters) => set({pendingFilters: filters}),
  clearPendingFilters: () => set({pendingFilters: null}),
});
