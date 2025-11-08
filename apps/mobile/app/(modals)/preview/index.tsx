import React from 'react';
import {useAttachmentsByTarget} from '@vohrad/store';
import {useLocalSearchParams} from 'expo-router';
import {AttachmentImagePreview} from '@/features/attachments';
import {useImageAttachments} from '@/features/item';
import type {AttachmentTargetType} from '@vohrad/store';

export default function AttachmentImagePreviewModal() {
  const params = useLocalSearchParams<{
    targetType?: AttachmentTargetType;
    targetId?: string;
    attachmentId?: string;
  }>();

  const targetType = (params.targetType as AttachmentTargetType) ?? 'item';
  const targetId = typeof params.targetId === 'string' ? params.targetId : null;
  const initialId =
    typeof params.attachmentId === 'string' ? params.attachmentId : undefined;

  const attachments = useAttachmentsByTarget(targetType, targetId);
  const imageAttachments = useImageAttachments(attachments);

  if (!imageAttachments.length) {
    return null;
  }

  return (
    <AttachmentImagePreview
      attachments={imageAttachments}
      initialAttachmentId={initialId}
    />
  );
}
