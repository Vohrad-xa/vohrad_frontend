import {useCallback, useMemo, useEffect} from 'react';
import {resolveAttachmentUrl} from '@sykamore/api-client';
import type {Item, ItemFilterState} from '@sykamore/types';
import {useAuthStore} from '../../../store';
import {useInfiniteItems} from '../hooks/use-infinite-items';
import type {ItemListFilters} from '../hooks/use-infinite-items';

type UseItemsListManagerOptions = {
  pageSize?: number;
  searchQuery?: string;
  itemFilters?: ItemFilterState;
  enabled?: boolean;
};

export function useItemsListManager(options?: UseItemsListManagerOptions) {
  const filters = useMemo<ItemListFilters>(() => {
    const result: ItemListFilters = {};
    if (options?.searchQuery) {
      result.searchQuery = options.searchQuery;
    }
    if (options?.itemFilters) {
      result.itemFilters = options.itemFilters;
    }
    return result;
  }, [options?.searchQuery, options?.itemFilters]);

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
  } = useInfiniteItems(
    filters,
    options?.pageSize,
    options?.enabled,
  );

  // Bridge TanStack Query state to global Zustand error store
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

  const items = useMemo(
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

  const getItemImageUrl = useCallback((item: Item) => {
    const url = item.thumbnail?.download_url;
    if (!url) return undefined;

    const resolved = url.startsWith('/') ? resolveAttachmentUrl(url) : url;
    return {uri: resolved};
  }, []);

  return {
    items,
    lastUpdated: dataUpdatedAt ? new Date(dataUpdatedAt) : null,
    isLoading: isFetching,
    isFetchingNextPage,
    error,
    hasNext: hasNextPage,
    loadMore,
    onEndReached: loadMore,
    refresh,
    getItemImageUrl,
  };
}
