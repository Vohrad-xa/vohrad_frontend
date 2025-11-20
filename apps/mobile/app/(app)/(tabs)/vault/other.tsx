import React, {useCallback} from 'react';
import {errorManager} from '@vohrad/api-client';
import {useAttachmentOther} from '@/features/attachments';
import {OtherList} from '@/features/attachments/screens/other';
import {
  downloadDocumentFile,
  shareDownloadedFile,
} from '@/features/attachments/utils/file-download';
import {useNetworkConnectivity} from '@/modules/network';
import {showAlert} from '@/utils';

export default function VaultOtherScreen() {
  const {checkBackendReachability} = useNetworkConnectivity();
  const {otherAttachments, getOtherById, resolveOtherUrlById} =
    useAttachmentOther();

  const handleOtherPress = useCallback(
    async (otherId: string) => {
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

      const attachment = getOtherById(otherId);
      if (!attachment) {
        showAlert({
          title: 'File not found',
          message: 'Unable to locate the file.',
        });
        return;
      }

      try {
        const sourceUrl = await resolveOtherUrlById(otherId);
        const localPath = await downloadDocumentFile({
          sourceUrl,
          id: otherId,
          originalFilename:
            attachment.original_filename ?? attachment.filename ?? '',
          extension: attachment.extension ?? '',
        });

        await shareDownloadedFile(
          localPath,
          attachment.original_filename ?? 'file',
          attachment.file_type,
        );
      } catch (error) {
        console.error('Failed to download file:', error);
        showAlert({
          title: 'Unable to download file',
          message: 'Please try again in a few moments.',
        });
      }
    },
    [checkBackendReachability, getOtherById, resolveOtherUrlById],
  );

  return (
    <OtherList others={otherAttachments} onOtherPress={handleOtherPress} />
  );
}
