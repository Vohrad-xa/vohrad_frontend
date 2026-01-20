import {useMemo} from 'react';
import {type AttachmentDisplayItem} from '@sykamore/store';

export const IMAGE_GRID_COLUMNS = 5;

export interface ImageAttachmentItem extends AttachmentDisplayItem {
  resolvedUrl: string;
}

export function useImageAttachments(
  attachments?: AttachmentDisplayItem[] | null,
): ImageAttachmentItem[] {
  return useMemo(() => {
    if (!attachments || attachments.length === 0) return [];

    const images: ImageAttachmentItem[] = [];
    for (const attachment of attachments) {
      if (attachment.kind === 'image') {
        const resolvedUrl = attachment.previewUrl;
        if (resolvedUrl) {
          images.push({...attachment, resolvedUrl});
        }
      }
    }
    return images;
  }, [attachments]);
}
