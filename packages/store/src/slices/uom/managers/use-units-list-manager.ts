import {useCallback, useMemo} from 'react';
import type {UnitOfMeasure} from '@sykamore/types';
import {useInfiniteUnits} from '../hooks/use-infinite-units';

type UseUnitsListManagerOptions = {
  pageSize?: number;
  enabled?: boolean;
  onlyActive?: boolean;
};

export function useUnitsListManager(options: UseUnitsListManagerOptions = {}) {
  const {
    data,
    dataUpdatedAt,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    refetch,
  } = useInfiniteUnits({
    pageSize: options.pageSize,
    enabled: options.enabled,
    onlyActive: options.onlyActive,
  });

  const pages = data?.pages ?? [];
  const units = useMemo<UnitOfMeasure[]>(
    () => pages.flatMap((page) => page.data.items),
    [pages],
  );

  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const refresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  return {
    units,
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
