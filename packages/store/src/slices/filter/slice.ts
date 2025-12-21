import type {StateCreator} from 'zustand';
import type {ItemFilterState, AttachmentFilter} from '@sykamore/types';

export interface FilterSlice {
  pendingFilters: ItemFilterState | null;
  setPendingFilters: (filters: ItemFilterState | null) => void;
  clearPendingFilters: () => void;
  attachmentFilter: AttachmentFilter | null;
  setAttachmentFilter: (filter: AttachmentFilter | null) => void;
  clearAttachmentFilter: () => void;
}

export const createFilterSlice: StateCreator<FilterSlice> = (set) => ({
  pendingFilters: null,
  setPendingFilters: (filters) => set({pendingFilters: filters}),
  clearPendingFilters: () => set({pendingFilters: null}),
  attachmentFilter: null,
  setAttachmentFilter: (filter) => set({attachmentFilter: filter}),
  clearAttachmentFilter: () => set({attachmentFilter: null}),
});
