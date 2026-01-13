import {useRolesListManager} from '@sykamore/store';

export function useRolesList() {
  const manager = useRolesListManager();

  return {
    roles: manager.roles,
    isLoading: manager.isLoading,
    isFetchingNextPage: manager.isFetchingNextPage,
    hasNext: manager.hasNext,
    loadMore: manager.loadMore,
    onEndReached: manager.onEndReached,
    refresh: manager.refresh,
    error: manager.error,
  };
}
