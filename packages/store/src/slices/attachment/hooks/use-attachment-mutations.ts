import {useMutation, useQueryClient} from '@tanstack/react-query';
import {
  attachmentApi,
  type AttachmentWithCounts,
  type AttachmentCounts,
  type DashboardOverview,
} from '@sykamore/api-client';
import {buildAttachmentDisplayData, type AttachmentDisplayItem} from '../utils';
import {
  type InfiniteAttachmentsData,
  updateInfiniteAttachmentsCacheForUpload,
} from '../utils/cache-updates';
import {normalizeAttachmentTargetType} from '../utils/normalizers';
import {
  parseAttachmentListQueryKey,
  type AttachmentListQueryKey,
  buildAttachmentTargetQueryKey,
  parseAttachmentTargetQueryKey,
} from '../utils/query-keys';

export function useUploadAttachment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: FormData) =>
      attachmentApi.uploadAttachment(formData),
    onSuccess: (response: AttachmentWithCounts) => {
      const {attachment, counts} = response;
      const displayAttachment: AttachmentDisplayItem = {
        ...attachment,
        ...buildAttachmentDisplayData(attachment),
      };

      // 1. Update item-specific cache (e.g., ['attachments', 'item', '123'])
      const normalizedTargetType = normalizeAttachmentTargetType(
        attachment.attachable_type,
      );
      if (normalizedTargetType && attachment.attachable_id) {
        queryClient.setQueryData<AttachmentDisplayItem[]>(
          buildAttachmentTargetQueryKey(
            normalizedTargetType,
            String(attachment.attachable_id),
          ),
          (old) => (old ? [displayAttachment, ...old] : [displayAttachment]),
        );
      }

      // 2. Update global vault infinite query caches when filters/sort allow.
      const listQueries = queryClient.getQueriesData<InfiniteAttachmentsData>({
        queryKey: ['attachments', 'list'],
      });
      listQueries.forEach(([queryKey, data]) => {
        if (!data) return;
        const parsed = parseAttachmentListQueryKey(queryKey);
        if (!parsed) return;

        const next = updateInfiniteAttachmentsCacheForUpload(
          data,
          displayAttachment,
          parsed.filters,
          parsed.pageSize,
        );

        if (next) {
          queryClient.setQueryData(queryKey as AttachmentListQueryKey, next);
        }
      });

      // 3. Update dashboard counts (from backend, no refetch)
      queryClient.setQueryData<DashboardOverview>(
        ['dashboard', 'overview'],
        (old) =>
          old
            ? {
                ...old,
                attachments_total: counts.attachments_total,
                attachment_counts: counts.attachment_counts,
              }
            : old,
      );
    },
  });
}

export function useDeleteAttachment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      attachmentId,
      hardDelete,
    }: {
      attachmentId: string;
      hardDelete?: boolean;
    }) => attachmentApi.deleteAttachment(attachmentId, {hardDelete}),
    onSuccess: (counts: AttachmentCounts, variables) => {
      const {attachmentId} = variables;

      // 1. Remove from target-specific caches (arrays)
      const targetQueries = queryClient.getQueriesData<AttachmentDisplayItem[]>(
        {queryKey: ['attachments']},
      );
      targetQueries.forEach(([queryKey, data]) => {
        if (!Array.isArray(data)) return;
        const parsed = parseAttachmentTargetQueryKey(queryKey);
        if (!parsed) return;

        const next = data.filter((item) => item.id !== attachmentId);
        if (next.length === data.length) return;

        queryClient.setQueryData(
          buildAttachmentTargetQueryKey(parsed.targetType, parsed.targetId),
          next,
        );
      });

      // 2. Remove from global vault infinite query cache
      queryClient.setQueriesData<InfiniteAttachmentsData>(
        {queryKey: ['attachments', 'list']},
        (old) => {
          if (!old || !('pages' in old)) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              items: page.items.filter((item) => item.id !== attachmentId),
            })),
          };
        },
      );

      // 3. Update dashboard counts (from backend, no refetch)
      queryClient.setQueryData<DashboardOverview>(
        ['dashboard', 'overview'],
        (old) =>
          old
            ? {
                ...old,
                attachments_total: counts.attachments_total,
                attachment_counts: counts.attachment_counts,
              }
            : old,
      );
    },
  });
}
