import {useInfiniteQuery} from '@tanstack/react-query';
import {attachmentApi, type ListAttachmentsParams} from '@vohrad/api-client';

type AttachmentListFilters = Omit<ListAttachmentsParams, 'page' | 'size'>;

const STALE_TIME = 5 * 60 * 1000; // 5 minutes

export function useInfiniteAttachments(
  filters: AttachmentListFilters,
  pageSize = 20,
  enabled = true,
) {
  const queryKey = ['attachments', 'list', filters];

  return useInfiniteQuery({
    queryKey,
    queryFn: async ({pageParam = 1}) => {
      const response = await attachmentApi.listAttachments({
        ...filters,
        page: pageParam,
        size: pageSize,
      });
      return response.data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.has_next) {
        // API returns a standard pagination structure
        // that includes the current page number.
        return lastPage.page + 1;
      }
      return undefined;
    },
    enabled,
    staleTime: STALE_TIME,
  });
}
