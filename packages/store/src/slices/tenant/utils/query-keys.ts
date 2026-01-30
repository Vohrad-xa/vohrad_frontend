export type TenantQueryKey = readonly ['tenant', 'info'];
export type TenantLicenseQueryKey = readonly ['tenant', 'license'];

/**
 * Builds the query key for tenant info cache.
 */
export function buildTenantQueryKey(): TenantQueryKey {
  return ['tenant', 'info'] as const;
}

/**
 * Builds the query key for tenant license info cache.
 */
export function buildTenantLicenseQueryKey(): TenantLicenseQueryKey {
  return ['tenant', 'license'] as const;
}
