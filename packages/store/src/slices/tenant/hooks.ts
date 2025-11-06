import {useState, useCallback} from 'react';
import {tenantApi} from '@vohrad/api-client';
import {useAuthStore} from '../../store';
import {tenantSelectors} from './selectors';
import type {
  Tenant,
  TenantProfileUpdate,
  TenantSettingsUpdate,
} from '@vohrad/types';

export function useOrganizationDetails(): Tenant | null {
  return useAuthStore(tenantSelectors.tenant);
}

export function useUpdateTenant() {
  const [isLoading, setIsLoading] = useState(false);
  const updateTenant = useAuthStore(tenantSelectors.updateTenant);
  const setError = useAuthStore((state) => state.setError);

  const updateTenantProfile = useCallback(
    async (data: TenantProfileUpdate): Promise<void> => {
      setIsLoading(true);

      try {
        const updatedTenant = await tenantApi.updateTenantProfile(data);
        updateTenant(updatedTenant);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to update organization';
        setError(message, () => updateTenantProfile(data));
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [updateTenant, setError],
  );

  return {
    updateTenantProfile,
    isLoading,
  };
}

export function useUpdateTenantSettings() {
  const [isLoading, setIsLoading] = useState(false);
  const updateTenant = useAuthStore(tenantSelectors.updateTenant);
  const setError = useAuthStore((state) => state.setError);

  const updateTenantSettings = useCallback(
    async (data: TenantSettingsUpdate): Promise<void> => {
      setIsLoading(true);

      try {
        const updatedTenant = await tenantApi.updateTenantSettings(data);
        updateTenant(updatedTenant);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to update preferences';
        setError(message, () => updateTenantSettings(data));
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [updateTenant, setError],
  );

  return {
    updateTenantSettings,
    isLoading,
  };
}
