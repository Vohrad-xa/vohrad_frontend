import {useInfiniteQuery} from '@tanstack/react-query';
import {userApi} from '@sykamore/api-client';

const STALE_TIME = 30 * 60 * 1000;

export function useInfiniteUsers(
  odataFilter?: string,
  odataOrderBy?: string,
  pageSize = 20,
  enabled = true,
) {
  const queryKey = ['users', 'list', odataFilter, odataOrderBy];

  return useInfiniteQuery({
    queryKey,
    queryFn: async ({pageParam}) => {
      return userApi.getUsers({
        limit: pageSize,
        cursor: pageParam ?? undefined,
        direction: 'before',
        odataFilter,
        odataOrderBy,
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
