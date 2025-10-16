import type {StateCreator} from 'zustand';
import type {Tenant} from '@vohrad/types';

export interface TenantSlice {
  tenant: Tenant | null;
  setTenant: (tenant: Tenant | null) => void;
  updateTenant: (tenantData: Partial<Tenant>) => void;
}

export const createTenantSlice: StateCreator<TenantSlice> = (set) => ({
  tenant: null,

  setTenant: (tenant: Tenant | null) => set({tenant}),

  updateTenant: (tenantData: Partial<Tenant>) =>
    set((state) => ({
      tenant: state.tenant ? {...state.tenant, ...tenantData} : null,
    })),
});
