import {useState, useCallback} from 'react';
import {tenantApi} from '@vohrad/api-client';
import {useAuthStore} from '../../store';
import {tenantSelectors} from './selectors';
import type {
  Tenant,
  TenantProfileUpdate,
  TenantSettingsUpdate,
  TenantLicenseInfo,
} from '@vohrad/types';

export function useOrganizationDetails(): Tenant | null {
  return useAuthStore(tenantSelectors.tenant);
}

export function useTenantLicenseInfo(): TenantLicenseInfo | null {
  return useAuthStore(tenantSelectors.licenseInfo);
}

export function useFetchTenantLicenseInfo() {
  const [isLoading, setIsLoading] = useState(false);
  const setLicenseInfo = useAuthStore(tenantSelectors.setLicenseInfo);

  const fetchLicenseInfo = useCallback(async (): Promise<TenantLicenseInfo> => {
    setIsLoading(true);

    try {
      const licenseInfo = await tenantApi.getTenantLicenseInfo();
      setLicenseInfo(licenseInfo);
      return licenseInfo;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to fetch license info';
      const retry = () => fetchLicenseInfo();

      // Set error on global auth slice for ErrorHandlerProvider
      useAuthStore.setState({error: message, retryCallback: retry});

      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [setLicenseInfo]);

  return {
    fetchLicenseInfo,
    isLoading,
  };
}

export function useUpdateTenant() {
  const [isLoading, setIsLoading] = useState(false);
  const updateTenant = useAuthStore(tenantSelectors.updateTenant);

  const updateTenantProfile = useCallback(
    async (data: TenantProfileUpdate): Promise<Tenant> => {
      setIsLoading(true);

      try {
        const updatedTenant = await tenantApi.updateTenantProfile(data);
        updateTenant(updatedTenant);
        return updatedTenant;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to update organization';
        const retry = () => updateTenantProfile(data);

        // Set error on global auth slice for ErrorHandlerProvider
        useAuthStore.setState({error: message, retryCallback: retry});

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

export function useUpdateTenantSettings() {
  const [isLoading, setIsLoading] = useState(false);
  const updateTenant = useAuthStore(tenantSelectors.updateTenant);

  const updateTenantSettings = useCallback(
    async (data: TenantSettingsUpdate): Promise<Tenant> => {
      setIsLoading(true);

      try {
        const updatedTenant = await tenantApi.updateTenantSettings(data);
        updateTenant(updatedTenant);
        return updatedTenant;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to update preferences';
        const retry = () => updateTenantSettings(data);

        // Set error on global auth slice for ErrorHandlerProvider
        useAuthStore.setState({error: message, retryCallback: retry});

        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [updateTenant],
  );

  return {
    updateTenantSettings,
    isLoading,
  };
}
