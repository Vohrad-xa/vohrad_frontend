import React from 'react';
import {useLocalSearchParams} from 'expo-router';
import {AttachmentImagePreview} from '@/features/attachments/components';
import {useImageAttachments} from '@/features/item/detail/attachments/attachments-images';
import {useItemAttachments} from '@/features/item/detail/attachments/use-item-attachments';

export default function ItemAttachmentImagePreviewModal() {
  const params = useLocalSearchParams<{attachmentId?: string}>();
  const {attachments} = useItemAttachments();
  const imageAttachments = useImageAttachments(attachments);
  const initialId =
    typeof params.attachmentId === 'string' ? params.attachmentId : undefined;

  if (!imageAttachments || imageAttachments.length === 0) {
    return null;
  }

  return (
    <AttachmentImagePreview
      attachments={imageAttachments}
      initialAttachmentId={initialId}
    />
  );
}
