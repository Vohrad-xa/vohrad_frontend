import {useInfiniteQuery} from '@tanstack/react-query';
import {attachmentApi, type ListAttachmentsParams} from '@sykamore/api-client';

type AttachmentListFilters = Omit<
  ListAttachmentsParams,
  'limit' | 'cursor' | 'direction' | 'order'
>;

const STALE_TIME = 5 * 60 * 1000; // 5 minutes

export function useInfiniteAttachments(
  filters: AttachmentListFilters,
  pageSize = 30,
  enabled = true,
) {
  const queryKey = ['attachments', 'list', filters, pageSize];

  return useInfiniteQuery({
    queryKey,
    queryFn: async ({pageParam}) => {
      const response = await attachmentApi.listAttachments({
        ...filters,
        limit: pageSize,
        cursor: pageParam ?? undefined,
        direction: 'after',
      });
      return response.data;
    },
    initialPageParam: null,
    getNextPageParam: (lastPage) => {
      if (lastPage.has_next_page) {
        return lastPage.end_cursor;
      }
      return undefined;
    },
    enabled,
    staleTime: STALE_TIME,
  });
}
