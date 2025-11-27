import {useUsersListManager} from '@vohrad/store';

export function useUsersList() {
  const manager = useUsersListManager();

  return {
    users: manager.users,
    total: manager.total,
    isLoading: manager.isLoading,
    isFetchingNextPage: manager.isFetchingNextPage,
    hasNext: manager.hasNext,
    loadMore: manager.loadMore,
    onEndReached: manager.onEndReached,
    refresh: manager.refresh,
    error: manager.error,
  };
}
