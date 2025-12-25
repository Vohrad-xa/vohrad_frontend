import React, {useCallback} from 'react';
import {useAttachmentsByKind, useAttachmentPress} from '@/features/attachments';
import {ArchivesList} from '@/features/attachments/screens/archives';

export default function VaultArchivesScreen() {
  const {attachments: archiveAttachments, getById: getArchiveById} =
    useAttachmentsByKind('archive');
  const handleAttachmentPress = useAttachmentPress();

  const handleArchivePress = useCallback(
    async (archiveId: string) => {
      const attachment = getArchiveById(archiveId);
      if (!attachment) {
        return;
      }
      await handleAttachmentPress(attachment);
    },
    [getArchiveById, handleAttachmentPress],
  );

  return (
    <ArchivesList
      archives={archiveAttachments}
      onArchivePress={handleArchivePress}
    />
  );
}
