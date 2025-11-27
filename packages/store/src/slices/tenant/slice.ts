import type {StateCreator} from 'zustand';
import type {Tenant, TenantLicenseInfo} from '@vohrad/types';

export interface TenantSlice {
  tenant: Tenant | null;
  licenseInfo: TenantLicenseInfo | null;
  setTenant: (tenant: Tenant | null) => void;
  updateTenant: (tenantData: Partial<Tenant>) => void;
  setLicenseInfo: (licenseInfo: TenantLicenseInfo | null) => void;
}

export const createTenantSlice: StateCreator<TenantSlice> = (set) => ({
  tenant: null,
  licenseInfo: null,

  setTenant: (tenant: Tenant | null) => set({tenant}),

  updateTenant: (tenantData: Partial<Tenant>) =>
    set((state) => ({
      tenant: state.tenant ? {...state.tenant, ...tenantData} : null,
    })),

  setLicenseInfo: (licenseInfo: TenantLicenseInfo | null) => set({licenseInfo}),
});
