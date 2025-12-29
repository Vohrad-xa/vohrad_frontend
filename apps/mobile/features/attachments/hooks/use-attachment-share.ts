import {useCallback, useState} from 'react';
import {showAlert} from '@/utils';
import {
  downloadDocumentFile,
  shareDownloadedFile,
  shareDownloadedFiles,
  resolveAttachmentItemUrl,
} from '../utils';
import type {ItemAttachment} from '@sykamore/types';

/**
 * Reusable hook for downloading and sharing attachments.
 * Extracts the pattern used in preview modals (document.tsx, image.tsx).
 */
export function useAttachmentShare() {
  const [isProcessing, setIsProcessing] = useState(false);

  const shareAttachments = useCallback(
    async (attachments: ItemAttachment[]): Promise<boolean> => {
      if (attachments.length === 0) {
        return false;
      }

      setIsProcessing(true);
      try {
        const downloads: Array<{
          localPath: string;
          displayName: string;
          mimeType?: string;
        }> = [];

        for (const attachment of attachments) {
          const sourceUrl = await resolveAttachmentItemUrl(attachment);

          const localPath = await downloadDocumentFile({
            sourceUrl,
            id: attachment.id,
            originalFilename:
              attachment.original_filename ?? attachment.filename ?? '',
            extension: attachment.extension ?? '',
          });

          downloads.push({
            localPath,
            displayName:
              attachment.original_filename ?? attachment.filename ?? 'document',
            mimeType: attachment.file_type ?? undefined,
          });
        }

        const result =
          downloads.length === 1
            ? await shareDownloadedFile(
                downloads[0].localPath,
                downloads[0].displayName,
                downloads[0].mimeType,
              )
            : await shareDownloadedFiles(
                downloads.map((item) => item.localPath),
              );

        return result.success && !result.dismissedAction;
      } catch (error) {
        console.error('Failed to share attachment:', error);
        showAlert({
          title: 'Share failed',
          message: 'Unable to share this file. Please try again.',
        });
        throw error;
      } finally {
        setIsProcessing(false);
      }
    },
    [],
  );

  const shareAttachment = useCallback(
    async (attachment: ItemAttachment): Promise<boolean> =>
      shareAttachments([attachment]),
    [shareAttachments],
  );

  return {shareAttachment, shareAttachments, isProcessing};
}
