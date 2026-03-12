import {useCallback, useState} from 'react';
import {errorCenter} from '@sykamore/client-runtime';
import {resolveAttachmentItemUrl} from '@sykamore/store';
import {
  downloadDocumentFile,
  shareDownloadedFile,
  shareDownloadedFiles,
} from '../utils';
import type {ItemAttachment} from '@sykamore/types';

type DownloadedAttachment = {
  localPath: string;
  displayName: string;
  mimeType?: string;
};

async function downloadAttachment(
  attachment: ItemAttachment,
): Promise<DownloadedAttachment> {
  const sourceUrl = await resolveAttachmentItemUrl(attachment);
  const localPath = await downloadDocumentFile({
    sourceUrl,
    id: attachment.id,
    originalFilename: attachment.original_filename ?? attachment.filename ?? '',
    extension: attachment.extension ?? '',
  });

  return {
    localPath,
    displayName:
      attachment.original_filename ?? attachment.filename ?? 'document',
    mimeType: attachment.file_type ?? undefined,
  };
}

export function useAttachmentShare() {
  const [isProcessing, setIsProcessing] = useState(false);

  const shareAttachments = useCallback(
    async (attachments: ItemAttachment[]): Promise<boolean> => {
      if (attachments.length === 0 || isProcessing) {
        return false;
      }

      setIsProcessing(true);
      try {
        const downloads: DownloadedAttachment[] = [];
        for (const attachment of attachments) {
          downloads.push(await downloadAttachment(attachment));
        }

        const result =
          downloads.length === 1
            ? await shareDownloadedFile(
                downloads[0]!.localPath,
                downloads[0]!.displayName,
                downloads[0]!.mimeType,
              )
            : await shareDownloadedFiles(
                downloads.map((download) => download.localPath),
              );

        return result.success && !result.dismissedAction;
      } catch (error) {
        errorCenter.report(error, {
          title: 'Share failed',
          scope: 'local',
        });
        return false;
      } finally {
        setIsProcessing(false);
      }
    },
    [isProcessing],
  );

  const shareAttachment = useCallback(
    async (attachment: ItemAttachment): Promise<boolean> =>
      shareAttachments([attachment]),
    [shareAttachments],
  );

  return {shareAttachment, shareAttachments, isProcessing};
}
