import type {StateCreator} from 'zustand';
import type {TenantMembership} from '@sykamore/types';

/**
 * Tenant slice for workspace context persistence.
 *
 * - selectedTenantId: the active workspace UUID (sent as X-Tenant-Id header)
 * - memberships: full list of the user's tenant memberships for the picker
 * - All data operations use TanStack Query hooks
 */
export interface TenantSlice {
  selectedTenantId: string | null;
  memberships: TenantMembership[];
  setSelectedTenantId: (id: string | null) => void;
  setMemberships: (memberships: TenantMembership[]) => void;
}

export const createTenantSlice: StateCreator<TenantSlice> = (set) => ({
  selectedTenantId: null,
  memberships: [],
  setSelectedTenantId: (id: string | null) => set({selectedTenantId: id}),
  setMemberships: (memberships: TenantMembership[]) => set({memberships}),
});
