import {useInfiniteQuery} from '@tanstack/react-query';
import {uomApi} from '@sykamore/api-client';

type UseInfiniteUnitsOptions = {
  pageSize?: number;
  enabled?: boolean;
  onlyActive?: boolean;
};

const STALE_TIME = 5 * 60 * 1000;
const MAX_UNIT_LIMIT = 100;

export function useInfiniteUnits(options: UseInfiniteUnitsOptions = {}) {
  const pageSize = Math.min(options.pageSize ?? MAX_UNIT_LIMIT, MAX_UNIT_LIMIT);
  const enabled = options.enabled ?? true;
  const onlyActive = options.onlyActive ?? true;
  const odataFilter = onlyActive ? 'is_active eq true' : undefined;

  const queryKey = ['uom', 'list', pageSize, odataFilter ?? null];

  return useInfiniteQuery({
    queryKey,
    queryFn: ({pageParam}) =>
      uomApi.getUnits({
        limit: pageSize,
        cursor: pageParam ?? undefined,
        direction: 'after',
        odataFilter,
      }),
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
