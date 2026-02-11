import {useInfiniteQuery} from '@tanstack/react-query';
import {itemApi} from '@sykamore/api-client';
import type {ItemFilterState} from '@sykamore/types';
import {buildItemODataFilter} from '../filters';

export type ItemListFilters = {
  searchQuery?: string;
  itemFilters?: ItemFilterState;
};

const STALE_TIME = 5 * 60 * 1000;

export function useInfiniteItems(
  filters: ItemListFilters = {},
  pageSize = 20,
  enabled = true,
) {
  const queryKey = ['items', 'list', filters, pageSize] as const;

  return useInfiniteQuery({
    queryKey,
    queryFn: async ({pageParam}) => {
      const odataFilter = buildItemODataFilter(
        filters.itemFilters ?? {},
        filters.searchQuery,
      );
      return itemApi.getItems({
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
