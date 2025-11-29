import {useQuery} from '@tanstack/react-query';
import {roleApi} from '@vohrad/api-client';

const STALE_TIME = 5 * 60 * 1000;

export function useFetchRole(roleId: string | null | undefined) {
  const queryKey = ['roles', 'detail', roleId];

  return useQuery({
    queryKey,
    queryFn: async () => {
      if (!roleId) {
        throw new Error('Role ID is required to fetch role details.');
      }
      return roleApi.getRoleById(roleId);
    },
    enabled: !!roleId,
    staleTime: STALE_TIME,
  });
}

export function useActiveRoles(enabled = true) {
  return useQuery({
    queryKey: ['roles', 'active'],
    queryFn: () => roleApi.getActiveRoles(),
    enabled,
    staleTime: STALE_TIME,
  });
}
