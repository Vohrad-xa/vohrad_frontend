import {useCallback, useEffect, useMemo} from 'react';
import type {Role} from '@vohrad/types';
import {useAuthStore} from '../../../store';
import {useInfiniteRoles} from '../hooks/use-list-roles';

type UseRolesListManagerOptions = {
  searchTerm?: string;
  pageSize?: number;
  enabled?: boolean;
};

export function useRolesListManager(options?: UseRolesListManagerOptions) {
  const {
    data,
    error,
    isError,
    isSuccess,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    refetch,
  } = useInfiniteRoles({
    searchTerm: options?.searchTerm,
    pageSize: options?.pageSize,
    enabled: options?.enabled,
  });

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

  const roles = useMemo(
    () => data?.pages.flatMap((page) => page.data.items as Role[]) ?? [],
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
    roles,
    total: data?.pages[0]?.data.total ?? 0,
    isLoading: isFetching,
    isFetchingNextPage,
    error,
    hasNext: hasNextPage,
    loadMore,
    onEndReached: loadMore,
    refresh,
  };
}
