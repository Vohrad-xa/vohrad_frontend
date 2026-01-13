import {useCallback, useMemo, useEffect} from 'react';
import {useAuthStore} from '../../../store';
import {useInfiniteUsers} from '../hooks/use-infinite-users';

type UseUsersListManagerOptions = {
  odataFilter?: string;
  odataOrderBy?: string;
  pageSize?: number;
  enabled?: boolean;
};

export function useUsersListManager(options?: UseUsersListManagerOptions) {
  const {
    data,
    dataUpdatedAt,
    error,
    isError,
    isSuccess,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    refetch,
  } = useInfiniteUsers(
    options?.odataFilter,
    options?.odataOrderBy,
    options?.pageSize,
    options?.enabled,
  );

  useEffect(() => {
    if (isError && error) {
      useAuthStore.setState({
        error: error.message,
        retryCallback: () => refetch(),
      });
    } else if (isSuccess) {
      const currentError = useAuthStore.getState().error;
      if (currentError) {
        useAuthStore.setState({error: null, retryCallback: null});
      }
    }
  }, [isError, isSuccess, error, refetch]);

  const users = useMemo(
    () => data?.pages.flatMap((page) => page.data.items) ?? [],
    [data],
  );

  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const refresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  return {
    users,
    lastUpdated: dataUpdatedAt ? new Date(dataUpdatedAt) : null,
    isLoading: isFetching,
    isFetchingNextPage,
    error,
    hasNext: hasNextPage,
    loadMore,
    onEndReached: loadMore,
    refresh,
  };
}
