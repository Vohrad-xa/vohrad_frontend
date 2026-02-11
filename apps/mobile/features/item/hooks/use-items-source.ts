import {useItemsManager} from '@sykamore/store';
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
 * Passes raw filters and search to the manager; OData is built at the API boundary.
 */
export function useItemsSource(
  options: UseItemsSourceOptions,
): UseItemsSourceResult {
  const {searchQuery = '', filters, pageSize, enabled = true} = options;

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
    searchQuery: searchQuery || undefined,
    itemFilters: filters,
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
