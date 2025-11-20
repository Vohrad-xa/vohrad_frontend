import React, {useCallback} from 'react';
import {
  useAttachmentArchives,
  useAttachmentPress,
} from '@/features/attachments';
import {ArchivesList} from '@/features/attachments/screens/archives';

export default function VaultArchivesScreen() {
  const {archiveAttachments, getArchiveById} = useAttachmentArchives();
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
