import type {TenantSlice} from './slice';

// Selectors provide typed, optimized state access
export const tenantSelectors = {
  tenant: (state: TenantSlice) => state.tenant,
  tenantId: (state: TenantSlice) => state.tenant?.tenant_id ?? null,
  subDomain: (state: TenantSlice) => state.tenant?.sub_domain ?? null,
  industry: (state: TenantSlice) => state.tenant?.industry ?? null,
  timezone: (state: TenantSlice) => state.tenant?.timezone ?? null,
  updateTenant: (state: TenantSlice) => state.updateTenant,
  setTenant: (state: TenantSlice) => state.setTenant,
  licenseInfo: (state: TenantSlice) => state.licenseInfo,
  setLicenseInfo: (state: TenantSlice) => state.setLicenseInfo,
};
