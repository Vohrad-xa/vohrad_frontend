import {useInfiniteQuery} from '@tanstack/react-query';
import {itemApi} from '@vohrad/api-client';

// Note: OData filter logic will be handled by the manager
// This hook just needs the final string.
type ItemListFilters = {
  searchQuery?: string;
  odataFilter?: string;
};

const STALE_TIME = 5 * 60 * 1000; // 5 minutes

export function useInfiniteItems(
  filters: ItemListFilters,
  pageSize = 20,
  enabled = true,
) {
  const queryKey = ['items', 'list', filters];

  return useInfiniteQuery({
    queryKey,
    queryFn: async ({pageParam = 1}) => {
      const {searchQuery, odataFilter} = filters;

      // If there's a search query, use the search API
      if (searchQuery && searchQuery.trim().length > 0) {
        return itemApi.searchItems(searchQuery, pageParam, pageSize);
      }

      // Otherwise, use the regular getItems API with optional filters
      return itemApi.getItems(pageParam, pageSize, odataFilter);
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      // The API response includes a `has_next` boolean and the current page number
      if (lastPage.data.has_next) {
        return lastPage.data.page + 1;
      }
      return undefined;
    },
    enabled,
    staleTime: STALE_TIME,
  });
}
