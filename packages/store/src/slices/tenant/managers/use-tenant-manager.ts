import {useCallback} from 'react';
import {useFetchTenant} from '../hooks';

type UseTenantManagerOptions = {
  enabled?: boolean;
};

/**
 * Tenant manager - pure TanStack Query wrapper (like attachments).
 *
 * - ONLY reads from TanStack Query (no Zustand reads)
 * - Clean orchestrator, no UI logic
 * - Source of truth is query cache
 */
export function useTenantManager(options: UseTenantManagerOptions = {}) {
  const {enabled = true} = options;
  const {data: tenant, isLoading, refetch} = useFetchTenant(enabled);

  const refresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  return {
    tenant,
    isLoading,
    refresh,
  };
}
