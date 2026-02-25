import {useQuery} from '@tanstack/react-query';
import {tenantApi} from '@sykamore/api-client';
import type {Tenant} from '@sykamore/types';
import {shallow} from 'zustand/shallow';
import {useAuthStore} from '../../../store';
import {buildTenantQueryKey} from '../utils/query-keys';

const STALE_TIME = 10 * 60 * 1000; // 10 minutes

/**
 * Fetches full tenant info from the API (requires X-Tenant-Id context).
 *
 * - TanStack Query is source of truth
 * - Enabled only when a tenant workspace is active
 */
export function useFetchTenant(enabled = true) {
  const {isAuthenticated, hasHydrated, selectedTenantId} = useAuthStore(
    (state) => ({
      isAuthenticated: state.isAuthenticated,
      hasHydrated: state._hasHydrated,
      selectedTenantId: state.selectedTenantId,
    }),
    shallow,
  );

  return useQuery<Tenant, Error>({
    queryKey: buildTenantQueryKey(selectedTenantId),
    queryFn: () => tenantApi.getTenantInfo(),
    enabled: enabled && isAuthenticated && hasHydrated && !!selectedTenantId,
    staleTime: STALE_TIME,
  });
}
