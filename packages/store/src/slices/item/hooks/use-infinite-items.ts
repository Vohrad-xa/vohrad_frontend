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
    queryFn: async ({pageParam = 1}) => {
      return itemApi.getItems(pageParam, pageSize, odataFilter);
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.data.has_next) {
        return lastPage.data.page + 1;
      }
      return undefined;
    },
    enabled,
    staleTime: STALE_TIME,
  });
}
