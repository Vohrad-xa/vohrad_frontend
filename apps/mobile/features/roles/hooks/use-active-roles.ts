import {useActiveRoles} from '@sykamore/store';

export function useActiveRolesList(enabled = true) {
  const query = useActiveRoles(enabled);

  return {
    roles: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
