import {useCallback, useMemo, useEffect} from 'react';
import type {Location} from '@sykamore/types';
import {useAuthStore} from '../../../store';
import {useInfiniteLocations} from '../hooks/use-infinite-locations';
import type {LocationListFilters} from '../hooks/use-infinite-locations';

type UseLocationsListManagerOptions = {
  pageSize?: number;
  searchQuery?: string;
  enabled?: boolean;
};

export function useLocationsListManager(
  options?: UseLocationsListManagerOptions,
) {
  const filters = useMemo<LocationListFilters>(() => {
    const result: LocationListFilters = {};
    if (options?.searchQuery) {
      result.searchQuery = options.searchQuery;
    }
    return result;
  }, [options?.searchQuery]);

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
  } = useInfiniteLocations(filters, options?.pageSize, options?.enabled);

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

  const locations = useMemo(
    () => (data?.pages.flatMap((page) => page.data.items) ?? []) as Location[],
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
    locations,
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
