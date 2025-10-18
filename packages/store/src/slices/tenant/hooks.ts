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
  const updateTenant = useAuthStore(tenantSelectors.updateTenant);

  const updateTenantProfile = useCallback(
    async (data: TenantProfileUpdate): Promise<void> => {
      setIsLoading(true);

      try {
        const updatedTenant = await tenantApi.updateTenantProfile(data);
        updateTenant(updatedTenant);
      } catch (err) {
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [updateTenant],
  );

  return {
    updateTenantProfile,
    isLoading,
  };
}
