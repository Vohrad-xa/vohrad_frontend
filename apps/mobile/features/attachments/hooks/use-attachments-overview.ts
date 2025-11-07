import {useEffect, useMemo} from 'react';
import {useAttachmentManager, useAttachmentsByTarget} from '@vohrad/store';
import {
  computeAttachmentCounts,
  type AttachmentKindCount,
} from '@/features/attachments/utils/attachment-counts';
import type {AttachmentTargetType} from '@vohrad/store';

export function useAttachmentsOverview(
  targetType: AttachmentTargetType,
  targetId?: string | null,
) {
  const attachments = useAttachmentsByTarget(targetType, targetId);
  const {fetchAttachments, isLoading, error} = useAttachmentManager(
    targetType,
    targetId,
  );

  useEffect(() => {
    if (!targetId) {
      return;
    }

    if (attachments.length > 0) {
      return;
    }

    fetchAttachments().catch(() => {});
  }, [attachments.length, fetchAttachments, targetId]);

  const counts: AttachmentKindCount = useMemo(
    () => computeAttachmentCounts(attachments),
    [attachments],
  );

  return {
    attachments,
    counts,
    isLoading,
    error,
  };
}
