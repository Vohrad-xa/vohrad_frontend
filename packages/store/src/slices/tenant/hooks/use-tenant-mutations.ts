import {useMutation, useQueryClient} from '@tanstack/react-query';
import {tenantApi} from '@sykamore/api-client';
import type {
  Tenant,
  TenantProfileUpdate,
  TenantSettingsUpdate,
} from '@sykamore/types';
import {buildTenantQueryKey} from '../utils/query-keys';

/**
 * Updates tenant profile (address, contact info, etc).
 */
export function useUpdateTenantProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: TenantProfileUpdate) =>
      tenantApi.updateTenantProfile(data),
    onSuccess: (updatedTenant: Tenant) => {
      queryClient.setQueryData<Tenant>(buildTenantQueryKey(), updatedTenant);
    },
  });
}

/**
 * Updates tenant settings (business hours, preferences, etc).
 */
export function useUpdateTenantSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: TenantSettingsUpdate) =>
      tenantApi.updateTenantSettings(data),
    onSuccess: (updatedTenant: Tenant) => {
      queryClient.setQueryData<Tenant>(buildTenantQueryKey(), updatedTenant);
    },
  });
}
