export type TenantQueryKey = readonly ['tenant', 'info', string | null];
export type TenantLicenseQueryKey = readonly ['tenant', 'license', string | null];

/**
 * Builds the query key for tenant info cache.
 */
export function buildTenantQueryKey(tenantId: string | null): TenantQueryKey {
  return ['tenant', 'info', tenantId] as const;
}

/**
 * Builds the query key for tenant license info cache.
 */
export function buildTenantLicenseQueryKey(
  tenantId: string | null,
): TenantLicenseQueryKey {
  return ['tenant', 'license', tenantId] as const;
}
