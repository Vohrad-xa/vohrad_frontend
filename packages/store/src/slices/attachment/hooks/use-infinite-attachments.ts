import {useInfiniteQuery} from '@tanstack/react-query';
import {attachmentApi, type ListAttachmentsParams} from '@sykamore/api-client';

type AttachmentListFilters = Omit<
  ListAttachmentsParams,
  'limit' | 'cursor' | 'direction' | 'order'
>;

const STALE_TIME = 5 * 60 * 1000; // 5 minutes

export function useInfiniteAttachments(
  filters: AttachmentListFilters,
  pageSize = 50,
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
        direction: 'before',
      });
      return response.data;
    },
    initialPageParam: null,
    getNextPageParam: (lastPage) => {
      if (lastPage.has_previous_page) {
        return lastPage.start_cursor;
      }
      return undefined;
    },
    enabled,
    staleTime: STALE_TIME,
  });
}
