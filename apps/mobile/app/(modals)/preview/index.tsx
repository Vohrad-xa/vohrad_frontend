import React, {useEffect} from 'react';
import {useAttachmentsListManager, useVaultFilter} from '@vohrad/store';
import {useLocalSearchParams} from 'expo-router';
import {AttachmentImagePreview} from '@/features/attachments';
import {useImageAttachments} from '@/features/item';

export default function AttachmentImagePreviewModal() {
  const params = useLocalSearchParams<{
    attachmentId?: string;
  }>();

  const initialId =
    typeof params.attachmentId === 'string' ? params.attachmentId : undefined;

  const vaultFilter = useVaultFilter();
  const {attachments, setFilters} = useAttachmentsListManager();

  // Sync filters with vault filter state (backend filtering), always filter for images
  useEffect(() => {
    if (vaultFilter) {
      setFilters({
        targetType: vaultFilter.targetType,
        targetId: vaultFilter.targetId,
        kind: 'image',
      });
    } else {
      setFilters({kind: 'image'});
    }
  }, [vaultFilter, setFilters]);

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
