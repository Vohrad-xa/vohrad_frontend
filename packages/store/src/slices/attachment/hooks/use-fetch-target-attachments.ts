import {useQuery} from '@tanstack/react-query';
import {attachmentApi} from '@sykamore/api-client';
import type {AttachmentTargetType} from '@sykamore/types';
import {
  buildAttachmentDisplayItems,
  type AttachmentDisplayItem,
} from '../utils/attachment-display';
import {buildAttachmentTargetQueryKey} from '../utils/query-keys';

const STALE_TIME = 5 * 60 * 1000; // 5 minutes

export function useFetchTargetAttachments(
  targetType: AttachmentTargetType,
  targetId: string | null,
  enabled = true,
) {
  const queryKey = buildAttachmentTargetQueryKey(targetType, targetId);

  return useQuery<AttachmentDisplayItem[]>({
    queryKey,
    queryFn: async () => {
      if (!targetId) {
        return [];
      }
      const response = await attachmentApi.listAttachments({
        targetType,
        targetId,
        limit: 30,
      });
      return buildAttachmentDisplayItems(response.data.items ?? []);
    },
    enabled: enabled && !!targetId,
    staleTime: STALE_TIME,
  });
}
