import {useInfiniteQuery} from '@tanstack/react-query';
import {locationApi} from '@sykamore/api-client';
import {escapeString} from '../../../utils/odata-filter-builder';

export type LocationListFilters = {
  searchQuery?: string;
};

function buildLocationODataFilter(searchTerm?: string): string | undefined {
  if (!searchTerm || searchTerm.trim().length === 0) return undefined;
  const term = escapeString(searchTerm.trim().toLowerCase());
  return `(contains(tolower(name),'${term}') or contains(tolower(code),'${term}'))`;
}

const STALE_TIME = 5 * 60 * 1000;

export function useInfiniteLocations(
  filters: LocationListFilters = {},
  pageSize = 20,
  enabled = true,
) {
  const queryKey = ['locations', 'list', filters, pageSize] as const;

  return useInfiniteQuery({
    queryKey,
    queryFn: async ({pageParam}) => {
      const odataFilter = buildLocationODataFilter(filters.searchQuery);
      return locationApi.getLocations({
        limit: pageSize,
        cursor: pageParam ?? undefined,
        direction: 'after',
        odataFilter,
        count: true,
      });
    },
    initialPageParam: null,
    getNextPageParam: (lastPage) => {
      if (lastPage.data.has_next_page) {
        return lastPage.data.end_cursor;
      }
      return undefined;
    },
    enabled,
    staleTime: STALE_TIME,
  });
}
