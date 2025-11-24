import {useCallback, useMemo, useEffect} from 'react';
import {resolveAttachmentUrl} from '@vohrad/api-client';
import type {Item} from '@vohrad/types';
import {useAuthStore} from '../../../store';
import {useInfiniteItems} from '../hooks/use-infinite-items';

type UseItemsListManagerOptions = {
  pageSize?: number;
  odataFilter?: string;
  enabled?: boolean;
};

export function useItemsListManager(options?: UseItemsListManagerOptions) {
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
  } = useInfiniteItems(
    options?.odataFilter,
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
    total: data?.pages[0]?.data.total ?? 0,
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
