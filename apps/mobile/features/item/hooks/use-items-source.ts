import {useMemo} from 'react';
import {useItemsManager, buildItemODataFilter} from '@sykamore/store';
import type {Item, ItemFilterState} from '@sykamore/types';

type UseItemsSourceOptions = {
  searchQuery?: string;
  filters?: ItemFilterState;
  pageSize?: number;
  enabled?: boolean;
};

type UseItemsSourceResult = {
  items: Item[];
  loadMore: () => void;
  hasNext?: boolean;
  isLoading: boolean;
  isFetchingNextPage: boolean;
  refresh: () => Promise<void>;
  getItemImageUrl: (item: Item) => {uri: string} | undefined;
  lastUpdated: Date | null;
};

/**
 * Unified item source for filtered list and search queries.
 *
 * Combines filters and search into a single OData filter and fetches from server.
 * Server handles both filtering and searching.
 */
export function useItemsSource(
  options: UseItemsSourceOptions,
): UseItemsSourceResult {
  const {searchQuery = '', filters, pageSize, enabled = true} = options;

  const odataFilter = useMemo(() => {
    if (!filters && !searchQuery) {
      return undefined;
    }
    return buildItemODataFilter(
      filters ?? {
        statuses: [],
        trackingModes: [],
        priceMin: null,
        priceMax: null,
      },
      searchQuery,
    );
  }, [filters, searchQuery]);

  const {
    items,
    loadMore,
    hasNext,
    isLoading,
    isFetchingNextPage,
    refresh,
    getItemImageUrl,
    lastUpdated,
  } = useItemsManager({
    odataFilter,
    pageSize,
    enabled,
  });

  return {
    items,
    loadMore,
    hasNext,
    isLoading,
    isFetchingNextPage,
    refresh,
    getItemImageUrl,
    lastUpdated,
  };
}
