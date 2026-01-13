import {useCallback, useMemo} from 'react';
import {type ListAttachmentsParams} from '@sykamore/api-client';
import {useInfiniteAttachments} from '../hooks/use-infinite-attachments';

type AttachmentListFilters = Omit<
  ListAttachmentsParams,
  'limit' | 'cursor' | 'direction' | 'order'
>;

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
    lastUpdated: dataUpdatedAt ? new Date(dataUpdatedAt) : null,
    hasNext: hasNextPage,
    isLoading: isFetching,
    isFetchingNextPage,
    error,
    filters: options?.filters,
    refresh,
    loadMore,
    onEndReached: loadMore,
  };
}
