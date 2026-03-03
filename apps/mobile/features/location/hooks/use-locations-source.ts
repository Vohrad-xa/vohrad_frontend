import {useLocationsManager} from '@sykamore/store';

type UseLocationsSourceOptions = {
  searchQuery?: string;
  pageSize?: number;
  enabled?: boolean;
};

/**
 * Unified location source for search and list queries.
 */
export function useLocationsSource(options: UseLocationsSourceOptions) {
  const {searchQuery = '', pageSize, enabled = true} = options;

  const {
    locations,
    loadMore,
    hasNext,
    isLoading,
    isFetchingNextPage,
    refresh,
    lastUpdated,
  } = useLocationsManager({
    searchQuery: searchQuery || undefined,
    pageSize,
    enabled,
  });

  return {
    locations,
    loadMore,
    hasNext,
    isLoading,
    isFetchingNextPage,
    refresh,
    lastUpdated,
  };
}
