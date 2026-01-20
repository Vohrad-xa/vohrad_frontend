import {useInfiniteQuery, type InfiniteData} from '@tanstack/react-query';
import {attachmentApi} from '@sykamore/api-client';
import type {PaginatedResponse} from '@sykamore/types';
import {
  buildAttachmentDisplayItems,
  type AttachmentDisplayItem,
} from '../utils';
import {
  buildAttachmentListQueryKey,
  type AttachmentListFilters,
} from '../utils/query-keys';

const STALE_TIME = 5 * 60 * 1000; // 5 minutes

export function useInfiniteAttachments(
  filters: AttachmentListFilters,
  pageSize = 30,
  enabled = true,
) {
  const queryKey = buildAttachmentListQueryKey(filters, pageSize);

  return useInfiniteQuery<
    PaginatedResponse<AttachmentDisplayItem>,
    Error,
    InfiniteData<PaginatedResponse<AttachmentDisplayItem>, string | null>,
    typeof queryKey,
    string | null
  >({
    queryKey,
    queryFn: async ({pageParam}) => {
      const response = await attachmentApi.listAttachments({
        ...filters,
        limit: pageSize,
        cursor: pageParam ?? undefined,
        direction: 'after',
      });
      const data = response.data;
      return {
        ...data,
        items: buildAttachmentDisplayItems(data.items),
      };
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
