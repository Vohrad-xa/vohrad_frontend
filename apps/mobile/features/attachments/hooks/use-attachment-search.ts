import {useMemo} from 'react';
import {
  useInfiniteAttachments,
  buildAttachmentSearchFilter,
} from '@vohrad/store';

export interface UseAttachmentSearchOptions {
  searchQuery: string;
  pageSize?: number;
  enabled?: boolean;
}

export function useAttachmentSearch(options: UseAttachmentSearchOptions) {
  const {searchQuery, pageSize = 50, enabled = true} = options;

  const odataFilter = useMemo(
    () => buildAttachmentSearchFilter(searchQuery),
    [searchQuery],
  );

  const shouldFetch = enabled && Boolean(odataFilter);

  const {data, error, fetchNextPage, hasNextPage, isFetching, refetch} =
    useInfiniteAttachments({odataFilter}, pageSize, shouldFetch);

  const attachments = useMemo(
    () => data?.pages.flatMap((page) => page.items) ?? [],
    [data],
  );

  return {
    attachments,
    total: data?.pages[0]?.total ?? 0,
    isLoading: isFetching,
    error,
    hasNext: hasNextPage,
    loadMore: fetchNextPage,
    refresh: refetch,
    isSearchActive: Boolean(odataFilter),
  };
}
