import {useQuery} from '@tanstack/react-query';
import {attachmentApi} from '@vohrad/api-client';
import type {AttachmentTargetType} from '@vohrad/types';

const STALE_TIME = 5 * 60 * 1000; // 5 minutes

export function useFetchTargetAttachments(
  targetType: AttachmentTargetType,
  targetId: string | null,
  enabled = true,
) {
  const queryKey = ['attachments', targetType, targetId];

  return useQuery({
    queryKey,
    queryFn: async () => {
      if (!targetId) {
        return [];
      }
      const response = await attachmentApi.listAttachments({
        targetType,
        targetId,
        size: 50, // Note: Default size. We can makethis configurable if needed.
      });
      return response.data.items ?? [];
    },
    enabled: enabled && !!targetId,
    staleTime: STALE_TIME,
  });
}
