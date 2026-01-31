import type {StateCreator} from 'zustand';
import type {Tenant} from '@sykamore/types';

/**
 * Minimal tenant slice for session persistence.
 *
 * - Tenant data persisted to storage for multi-tenant context
 * - All operations use TanStack Query hooks
 * - This slice is ONLY for persistence, not active operations
 */
export interface TenantSlice {
  tenant: Tenant | null;
  setTenant: (tenant: Tenant | null) => void;
}

export const createTenantSlice: StateCreator<TenantSlice> = (set) => ({
  tenant: null,
  setTenant: (tenant: Tenant | null) => set({tenant}),
});
