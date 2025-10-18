import {useState, useCallback} from 'react';
import {tenantApi} from '@vohrad/api-client';
import {useAuthStore} from '../../store';
import {tenantSelectors} from './selectors';
import type {Tenant, TenantProfileUpdate} from '@vohrad/types';

export function useOrganizationDetails(): Tenant | null {
  return useAuthStore(tenantSelectors.tenant);
}

export function useUpdateTenant() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const updateTenant = useAuthStore(tenantSelectors.updateTenant);

  const updateTenantProfile = useCallback(
    async (data: TenantProfileUpdate): Promise<boolean> => {
      setIsLoading(true);
      setError(null);

      try {
        const updatedTenant = await tenantApi.updateTenantProfile(data);
        updateTenant(updatedTenant);
        return true;
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'Failed to update organization profile';
        setError(errorMessage);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [updateTenant],
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    updateTenantProfile,
    isLoading,
    error,
    clearError,
  };
}
