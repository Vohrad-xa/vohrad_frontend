import {useQuery} from '@tanstack/react-query';
import {tenantApi} from '@sykamore/api-client';
import type {Tenant} from '@sykamore/types';
import {buildTenantQueryKey} from '../utils/query-keys';
import {useAuthStore} from '../../../store';

const STALE_TIME = 10 * 60 * 1000; // 10 minutes

/**
 * Fetches tenant info from the API.
 *
 * - TanStack Query is source of truth
 * - initialData from Zustand for instant availability
 * - Zustand persistence handled externally (login/logout only)
 */
export function useFetchTenant(enabled = true) {
  const persistedTenant = useAuthStore((s) => s.tenant);

  return useQuery<Tenant, Error>({
    queryKey: buildTenantQueryKey(),
    queryFn: () => tenantApi.getTenantInfo(),
    enabled,
    staleTime: STALE_TIME,
    initialData: persistedTenant ?? undefined,
  });
}
