import {useMemo} from 'react';
import {
  resolveAttachmentPreviewUrl,
  resolveAttachmentThumbnailUrl,
} from '@/features/attachments/utils/url-resolver';
import type {ItemAttachment} from '@sykamore/types';

export interface ImageAttachmentItem extends ItemAttachment {
  resolvedUrl: string;
  thumbnailUrl?: string;
}

export function useImageAttachments(
  attachments?: ItemAttachment[] | null,
): ImageAttachmentItem[] {
  return useMemo(() => {
    if (!attachments || attachments.length === 0) return [];

    const images: ImageAttachmentItem[] = [];
    for (const attachment of attachments) {
      if (attachment.kind === 'image') {
        const resolvedUrl = resolveAttachmentPreviewUrl(attachment);
        const thumbnailUrl =
          resolveAttachmentThumbnailUrl(attachment) ?? undefined;
        if (resolvedUrl) {
          images.push({...attachment, resolvedUrl, thumbnailUrl});
        }
      }
    }
    return images;
  }, [attachments]);
}
