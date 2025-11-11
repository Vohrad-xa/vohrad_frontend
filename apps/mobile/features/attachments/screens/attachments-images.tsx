import {useMemo} from 'react';
import {resolveAttachmentUrl} from '@vohrad/api-client';
import type {ItemAttachment} from '@vohrad/types';

export const IMAGE_GRID_COLUMNS = 4;

export interface ImageAttachmentItem extends ItemAttachment {
  resolvedUrl: string;
}

function resolveImageUrl(attachment: ItemAttachment): string | null {
  const rawUrl =
    attachment.download_url ??
    (attachment.file_path
      ? `/attachments/${attachment.file_path.replace(/^\/+/, '')}`
      : null);

  if (!rawUrl) return null;

  return rawUrl.startsWith('http') ? rawUrl : resolveAttachmentUrl(rawUrl);
}

export function useImageAttachments(
  attachments?: ItemAttachment[] | null,
): ImageAttachmentItem[] {
  return useMemo(() => {
    if (!attachments || attachments.length === 0) return [];

    const images: ImageAttachmentItem[] = [];
    for (const attachment of attachments) {
      if (attachment.kind === 'image') {
        const resolvedUrl = resolveImageUrl(attachment);
        if (resolvedUrl) {
          images.push({...attachment, resolvedUrl});
        }
      }
    }
    return images;
  }, [attachments]);
}
