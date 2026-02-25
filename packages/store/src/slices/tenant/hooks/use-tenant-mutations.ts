import {useMutation, useQueryClient} from '@tanstack/react-query';
import {tenantApi} from '@sykamore/api-client';
import type {
  Tenant,
  TenantProfileUpdate,
  TenantSettingsUpdate,
} from '@sykamore/types';
import {useAuthStore} from '../../../store';
import {buildTenantQueryKey} from '../utils/query-keys';

/**
 * Updates tenant profile (address, contact info, etc).
 */
export function useUpdateTenantProfile() {
  const queryClient = useQueryClient();
  const selectedTenantId = useAuthStore((state) => state.selectedTenantId);

  return useMutation({
    mutationFn: (data: TenantProfileUpdate) =>
      tenantApi.updateTenantProfile(data),
    onSuccess: (updatedTenant: Tenant) => {
      if (!selectedTenantId) {
        return;
      }

      queryClient.setQueryData<Tenant>(
        buildTenantQueryKey(selectedTenantId),
        updatedTenant,
      );
    },
  });
}

/**
 * Updates tenant settings (business hours, preferences, etc).
 */
export function useUpdateTenantSettings() {
  const queryClient = useQueryClient();
  const selectedTenantId = useAuthStore((state) => state.selectedTenantId);

  return useMutation({
    mutationFn: (data: TenantSettingsUpdate) =>
      tenantApi.updateTenantSettings(data),
    onSuccess: (updatedTenant: Tenant) => {
      if (!selectedTenantId) {
        return;
      }

      queryClient.setQueryData<Tenant>(
        buildTenantQueryKey(selectedTenantId),
        updatedTenant,
      );
    },
  });
}
