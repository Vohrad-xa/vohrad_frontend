import React, {useEffect} from 'react';
import {useAttachmentsListManager} from '@vohrad/store';
import {useLocalSearchParams} from 'expo-router';
import {AttachmentImagePreview} from '@/features/attachments';
import {useImageAttachments} from '@/features/item';
import type {AttachmentTargetType} from '@vohrad/store';

export default function AttachmentImagePreviewModal() {
  const params = useLocalSearchParams<{
    filterTargetType?: AttachmentTargetType;
    filterTargetId?: string;
    attachmentId?: string;
  }>();

  const filterTargetType = params.filterTargetType as AttachmentTargetType | undefined;
  const filterTargetId = params.filterTargetId;
  const initialId =
    typeof params.attachmentId === 'string' ? params.attachmentId : undefined;

  const {attachments, setFilters} = useAttachmentsListManager();

  // Sync filters with URL params (backend OData filtering), always filter for images
  useEffect(() => {
    const newFilters: {
      targetType?: AttachmentTargetType;
      targetId?: string;
      kind: 'image';
    } = {kind: 'image'};
    if (filterTargetType) newFilters.targetType = filterTargetType;
    if (filterTargetId) newFilters.targetId = filterTargetId;
    setFilters(newFilters);
  }, [filterTargetType, filterTargetId, setFilters]);

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
