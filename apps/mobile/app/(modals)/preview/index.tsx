import React from 'react';
import {useLocalSearchParams} from 'expo-router';
import {
  AttachmentImagePreview,
  useVaultFilteredAttachments,
} from '@/features/attachments';
import {useImageAttachments} from '@/features/item';

export default function AttachmentImagePreviewModal() {
  const params = useLocalSearchParams<{
    attachmentId?: string;
  }>();

  const initialId =
    typeof params.attachmentId === 'string' ? params.attachmentId : undefined;

  const {attachments} = useVaultFilteredAttachments({kind: 'image'});

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
