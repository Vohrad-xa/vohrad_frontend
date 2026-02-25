import {useQuery} from '@tanstack/react-query';
import {tenantApi} from '@sykamore/api-client';
import type {TenantLicenseInfo} from '@sykamore/types';
import {shallow} from 'zustand/shallow';
import {useAuthStore} from '../../../store';
import {buildTenantLicenseQueryKey} from '../utils/query-keys';

const STALE_TIME = 5 * 60 * 1000; // 5 minutes

/**
 * Fetches tenant license info from the API.
 */
export function useFetchLicenseInfo(enabled = false) {
  const {isAuthenticated, hasHydrated, selectedTenantId} = useAuthStore(
    (state) => ({
      isAuthenticated: state.isAuthenticated,
      hasHydrated: state._hasHydrated,
      selectedTenantId: state.selectedTenantId,
    }),
    shallow,
  );

  return useQuery<TenantLicenseInfo, Error>({
    queryKey: buildTenantLicenseQueryKey(selectedTenantId),
    queryFn: () => tenantApi.getTenantLicenseInfo(),
    enabled: enabled && isAuthenticated && hasHydrated && !!selectedTenantId,
    staleTime: STALE_TIME,
  });
}
