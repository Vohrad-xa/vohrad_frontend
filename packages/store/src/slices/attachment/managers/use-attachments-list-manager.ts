import {useCallback, useMemo} from 'react';
import {type ListAttachmentsParams} from '@sykamore/api-client';
import {useInfiniteAttachments} from '../hooks/use-infinite-attachments';

type AttachmentListFilters = Omit<ListAttachmentsParams, 'page' | 'size'>;

type UseAttachmentsListManagerOptions = {
  pageSize?: number;
  filters?: AttachmentListFilters;
  enabled?: boolean;
};

export function useAttachmentsListManager(
  options?: UseAttachmentsListManagerOptions,
) {
  const {
    data,
    dataUpdatedAt,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    refetch,
  } = useInfiniteAttachments(
    options?.filters ?? {},
    options?.pageSize,
    options?.enabled,
  );

  const pages = data?.pages ?? [];
  const lastPage = pages[pages.length - 1];

  const attachments = useMemo(
    () => pages.flatMap((page) => page.items),
    [pages],
  );

  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const refresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  return {
    attachments,
    total: pages[0]?.total ?? 0,
    page: lastPage?.page ?? 1,
    size: pages[0]?.size ?? options?.pageSize ?? 50,
    totalPages: pages[0]?.total_pages ?? 0,
    lastUpdated: dataUpdatedAt ? new Date(dataUpdatedAt) : null,
    hasNext: hasNextPage,
    hasPrevious: (lastPage?.page ?? 1) > 1,
    isLoading: isFetching,
    isFetchingNextPage,
    error,
    filters: options?.filters,
    refresh,
    loadMore,
    onEndReached: loadMore,
  };
}
