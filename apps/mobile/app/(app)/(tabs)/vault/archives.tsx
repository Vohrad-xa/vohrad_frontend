import React, {useCallback} from 'react';
import {errorManager} from '@vohrad/api-client';
import {useAttachmentArchives} from '@/features/attachments';
import {ArchivesList} from '@/features/attachments/screens/archives';
import {
  downloadDocumentFile,
  shareDownloadedFile,
} from '@/features/attachments/utils/file-download';
import {useNetworkConnectivity} from '@/modules/network';
import {showAlert} from '@/utils';

export default function VaultArchivesScreen() {
  const {checkBackendReachability} = useNetworkConnectivity();
  const {archiveAttachments, getArchiveById, resolveArchiveUrlById} =
    useAttachmentArchives();

  const handleArchivePress = useCallback(
    async (archiveId: string) => {
      const hasConnectivity = await checkBackendReachability({
        remindOffline: true,
      });
      if (!hasConnectivity) {
        errorManager.reportError(
          'Connection failed. Please reconnect and try again.',
          undefined,
          undefined,
          {
            category: 'network',
            isRetryable: false,
            scope: 'local',
          },
        );
        return;
      }

      const attachment = getArchiveById(archiveId);
      if (!attachment) {
        showAlert({
          title: 'Archive not found',
          message: 'Unable to locate the archive file.',
        });
        return;
      }

      try {
        const sourceUrl = await resolveArchiveUrlById(archiveId);
        const localPath = await downloadDocumentFile({
          sourceUrl,
          id: archiveId,
          originalFilename:
            attachment.original_filename ?? attachment.filename ?? '',
          extension: attachment.extension ?? '',
        });

        await shareDownloadedFile(
          localPath,
          attachment.original_filename ?? 'archive',
          attachment.file_type,
        );
      } catch (error) {
        console.error('Failed to download archive:', error);
        showAlert({
          title: 'Unable to download archive',
          message: 'Please try again in a few moments.',
        });
      }
    },
    [checkBackendReachability, getArchiveById, resolveArchiveUrlById],
  );

  return (
    <ArchivesList
      archives={archiveAttachments}
      onArchivePress={handleArchivePress}
    />
  );
}
