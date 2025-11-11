import {useCallback, useMemo, useState, useEffect} from 'react';
import {useDebounce} from 'use-debounce';
import {resolveAttachmentUrl} from '@vohrad/api-client';
import type {Item, ItemFilterState} from '@vohrad/types';
import {useAuthStore} from '../../../store';
import {buildODataFilter} from '../../../utils/odata-filter-builder';
import {useInfiniteItems} from '../hooks/use-infinite-items';

const MIN_SEARCH_LENGTH = 3;
const DEBOUNCE_DELAY = 500;

type UseItemsListManagerOptions = {
  initialFilters?: ItemFilterState;
  initialSearchQuery?: string;
  pageSize?: number;
  enabled?: boolean;
};

/**
 * A manager hook that provides a clean interface for fetching and managing
 * a paginated list of items, powered by TanStack Query's useInfiniteQuery.
 */
export function useItemsListManager(options?: UseItemsListManagerOptions) {
  const [searchQuery, setSearchQuery] = useState(
    options?.initialSearchQuery ?? '',
  );
  const [filters, setFilters] = useState<ItemFilterState>(
    options?.initialFilters ?? {},
  );

  const [debouncedSearchQuery] = useDebounce(searchQuery, DEBOUNCE_DELAY);

  const odataFilter = useMemo(() => buildODataFilter(filters), [filters]);

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
    {
      searchQuery:
        debouncedSearchQuery.length >= MIN_SEARCH_LENGTH
          ? debouncedSearchQuery
          : '',
      odataFilter,
    },
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

  // When the initial filters change from props, update our internal state
  useEffect(() => {
    if (options?.initialFilters) {
      setFilters(options.initialFilters);
    }
  }, [options?.initialFilters]);

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
    // Data
    items,
    total: data?.pages[0]?.data.total ?? 0,
    // State
    isLoading: isFetching,
    isFetchingNextPage,
    error,
    // Pagination
    hasNext: hasNextPage,
    loadMore,
    onEndReached: loadMore,
    // Filtering & Searching
    filters,
    setFilters,
    searchQuery,
    setSearchQuery,
    // Actions
    refresh,
    getItemImageUrl,
  };
}
