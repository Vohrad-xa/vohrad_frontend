import type {StateCreator} from 'zustand';
import type {AttachmentFilter} from '@sykamore/types';

export interface FilterSlice {
  attachmentFilter: AttachmentFilter | null;
  setAttachmentFilter: (filter: AttachmentFilter | null) => void;
  clearAttachmentFilter: () => void;
}

export const createFilterSlice: StateCreator<FilterSlice> = (set) => ({
  attachmentFilter: null,
  setAttachmentFilter: (filter) => set({attachmentFilter: filter}),
  clearAttachmentFilter: () => set({attachmentFilter: null}),
});
