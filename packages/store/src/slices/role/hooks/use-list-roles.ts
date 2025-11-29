import {useInfiniteQuery} from '@tanstack/react-query';
import {roleApi} from '@vohrad/api-client';

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
    queryFn: async ({pageParam = 1}) => {
      if (hasValidSearch) {
        return roleApi.searchRoles(normalizedSearch, pageParam, pageSize);
      }
      return roleApi.getRoles(pageParam, pageSize);
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.data.has_next) {
        return lastPage.data.page + 1;
      }
      return undefined;
    },
    enabled: options?.enabled ?? true,
    staleTime: STALE_TIME,
  });
}
