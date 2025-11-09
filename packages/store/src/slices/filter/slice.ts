import type {StateCreator} from 'zustand';
import type {ItemFilterState, AttachmentTargetType} from '@vohrad/types';

export interface VaultFilter {
  targetType: AttachmentTargetType;
  targetId: string;
  itemName?: string;
}

export interface FilterSlice {
  pendingFilters: ItemFilterState | null;
  setPendingFilters: (filters: ItemFilterState | null) => void;
  clearPendingFilters: () => void;
  vaultFilter: VaultFilter | null;
  setVaultFilter: (filter: VaultFilter | null) => void;
  clearVaultFilter: () => void;
}

export const createFilterSlice: StateCreator<FilterSlice> = (set) => ({
  pendingFilters: null,
  setPendingFilters: (filters) => set({pendingFilters: filters}),
  clearPendingFilters: () => set({pendingFilters: null}),
  vaultFilter: null,
  setVaultFilter: (filter) => set({vaultFilter: filter}),
  clearVaultFilter: () => set({vaultFilter: null}),
});
