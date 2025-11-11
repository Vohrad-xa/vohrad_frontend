import {useCallback, useMemo} from 'react';
import {type ListAttachmentsParams} from '@vohrad/api-client';
import {useInfiniteAttachments} from '../hooks/use-infinite-attachments';

type AttachmentListFilters = Omit<ListAttachmentsParams, 'page' | 'size'>;

type UseAttachmentsListManagerOptions = {
  pageSize?: number;
  initialFilters?: AttachmentListFilters;
  enabled?: boolean;
};

export function useAttachmentsListManager(
  options?: UseAttachmentsListManagerOptions,
) {
  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    refetch,
  } = useInfiniteAttachments(
    options?.initialFilters ?? {},
    options?.pageSize,
    options?.enabled,
  );

  const attachments = useMemo(
    () => data?.pages.flatMap((page) => page.items) ?? [],
    [data],
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
    total: data?.pages[0]?.total ?? 0,
    page: data?.pages[data.pages.length - 1]?.page ?? 1,
    size: data?.pages[0]?.size ?? options?.pageSize ?? 20,
    totalPages: data?.pages[0]?.total_pages ?? 0,
    hasNext: hasNextPage,
    hasPrevious: (data?.pages[data.pages.length - 1]?.page ?? 1) > 1,
    isLoading: isFetching,
    isFetchingNextPage,
    error,
    filters: options?.initialFilters,
    setFilters: () => {
      // In TanStack filters are part of the queryKey.
      // To change filters, the component using this manager
      // would need to re-render it with new `initialFilters`.
      console.warn(
        'setFilters is not implemented; change filters by re-rendering the manager with new options.',
      );
    },
    refresh,
    loadMore,
    onEndReached: loadMore,
    fetchPage: () => {
      console.warn('fetchPage is deprecated; use refresh or loadMore.');
      return Promise.resolve();
    },
    reset: () => {
      console.warn('reset is deprecated; unmount the component to clear data.');
    },
  };
}
