import {useInfiniteQuery} from '@tanstack/react-query';
import {roleApi} from '@sykamore/api-client';

type UseInfiniteRolesOptions = {
  searchTerm?: string;
  pageSize?: number;
  enabled?: boolean;
};

const STALE_TIME = 5 * 60 * 1000;

export function useInfiniteRoles(options?: UseInfiniteRolesOptions) {
  const normalizedSearch = options?.searchTerm?.trim() ?? '';
  const pageSize = options?.pageSize ?? 20;
  const hasValidSearch = normalizedSearch.length >= 2;

  const queryKey = ['roles', 'list', hasValidSearch ? normalizedSearch : null];

  return useInfiniteQuery({
    queryKey,
    queryFn: async ({pageParam}) => {
      if (hasValidSearch) {
        return roleApi.searchRoles(normalizedSearch, {
          limit: pageSize,
          cursor: pageParam ?? undefined,
          direction: 'before',
        });
      }
      return roleApi.getRoles({
        limit: pageSize,
        cursor: pageParam ?? undefined,
        direction: 'before',
      });
    },
    initialPageParam: null,
    getNextPageParam: (lastPage) => {
      if (lastPage.data.has_previous_page) {
        return lastPage.data.start_cursor;
      }
      return undefined;
    },
    enabled: options?.enabled ?? true,
    staleTime: STALE_TIME,
  });
}
