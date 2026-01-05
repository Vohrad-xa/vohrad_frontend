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
    queryFn: async ({pageParam = 1}) => {
      return userApi.getUsers(pageParam, pageSize, odataFilter, odataOrderBy);
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
