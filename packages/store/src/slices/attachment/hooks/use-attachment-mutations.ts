import {useMutation, useQueryClient} from '@tanstack/react-query';
import {
  attachmentApi,
  type AttachmentWithCounts,
  type AttachmentCounts,
  type DashboardOverview,
} from '@vohrad/api-client';
import type {ItemAttachment} from '@vohrad/types';

interface InfiniteAttachmentsPage {
  items: ItemAttachment[];
  nextCursor?: string | null;
}

interface InfiniteAttachmentsData {
  pages: InfiniteAttachmentsPage[];
  pageParams: unknown[];
}

export function useUploadAttachment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: FormData) =>
      attachmentApi.uploadAttachment(formData),
    onSuccess: (response: AttachmentWithCounts) => {
      const {attachment, counts} = response;

      // 1. Update item-specific cache (e.g., ['attachments', 'item', '123'])
      if (attachment.attachable_type && attachment.attachable_id) {
        queryClient.setQueryData<ItemAttachment[]>(
          [
            'attachments',
            attachment.attachable_type,
            String(attachment.attachable_id),
          ],
          (old) => (old ? [attachment, ...old] : [attachment]),
        );
      }

      // 2. Update global vault infinite query cache (newest first)
      queryClient.setQueriesData<InfiniteAttachmentsData>(
        {queryKey: ['attachments', 'list']},
        (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page, idx) =>
              idx === 0 ? {...page, items: [attachment, ...page.items]} : page,
            ),
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

      // 1. Remove from all item-specific caches (arrays)
      queryClient.setQueriesData<ItemAttachment[]>(
        {queryKey: ['attachments'], exact: false},
        (old) => {
          if (!Array.isArray(old)) return old;
          return old.filter((item) => item.id !== attachmentId);
        },
      );

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
