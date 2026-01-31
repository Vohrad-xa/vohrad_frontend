import {useQuery} from '@tanstack/react-query';
import {tenantApi} from '@sykamore/api-client';
import type {TenantLicenseInfo} from '@sykamore/types';
import {buildTenantLicenseQueryKey} from '../utils/query-keys';

const STALE_TIME = 5 * 60 * 1000; // 5 minutes

/**
 * Fetches tenant license info from the API.
 */
export function useFetchLicenseInfo(enabled = false) {
  return useQuery<TenantLicenseInfo, Error>({
    queryKey: buildTenantLicenseQueryKey(),
    queryFn: () => tenantApi.getTenantLicenseInfo(),
    enabled,
    staleTime: STALE_TIME,
  });
}
