import {useInfiniteQuery} from '@tanstack/react-query';
import {itemApi} from '@sykamore/api-client';

const STALE_TIME = 5 * 60 * 1000;

export function useInfiniteItems(
  odataFilter?: string,
  pageSize = 20,
  enabled = true,
) {
  const queryKey = ['items', 'list', odataFilter];

  return useInfiniteQuery({
    queryKey,
    queryFn: async ({pageParam}) => {
      return itemApi.getItems({
        limit: pageSize,
        cursor: pageParam ?? undefined,
        direction: 'before',
        odataFilter,
      });
    },
    initialPageParam: null,
    getNextPageParam: (lastPage) => {
      if (lastPage.data.has_previous_page) {
        return lastPage.data.start_cursor;
      }
      return undefined;
    },
    enabled,
    staleTime: STALE_TIME,
  });
}
