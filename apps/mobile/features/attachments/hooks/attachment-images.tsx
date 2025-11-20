import {useMemo} from 'react';
import {resolveAttachmentUrl} from '@vohrad/api-client';
import type {ItemAttachment} from '@vohrad/types';

export const IMAGE_GRID_COLUMNS = 4;

export interface ImageAttachmentItem extends ItemAttachment {
  resolvedUrl: string;
  thumbnailUrl?: string;
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

function resolveThumbnailUrl(attachment: ItemAttachment): string | null {
  const rawUrl = attachment.thumbnail_url;
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
        const thumbnailUrl = resolveThumbnailUrl(attachment) ?? undefined;
        if (resolvedUrl) {
          images.push({...attachment, resolvedUrl, thumbnailUrl});
        }
      }
    }
    return images;
  }, [attachments]);
}

export function useDocumentAttachments(
  attachments?: ItemAttachment[] | null,
): ItemAttachment[] {
  return useMemo(() => {
    if (!attachments || attachments.length === 0) return [];

    const documents: ItemAttachment[] = [];
    for (const attachment of attachments) {
      if (attachment.kind === 'document') {
        documents.push(attachment);
      }
    }
    return documents;
  }, [attachments]);
}

export function useArchiveAttachments(
  attachments?: ItemAttachment[] | null,
): ItemAttachment[] {
  return useMemo(() => {
    if (!attachments || attachments.length === 0) return [];

    const archives: ItemAttachment[] = [];
    for (const attachment of attachments) {
      if (attachment.kind === 'archive') {
        archives.push(attachment);
      }
    }
    return archives;
  }, [attachments]);
}

export function useOtherAttachments(
  attachments?: ItemAttachment[] | null,
): ItemAttachment[] {
  return useMemo(() => {
    if (!attachments || attachments.length === 0) return [];

    const others: ItemAttachment[] = [];
    for (const attachment of attachments) {
      if (attachment.kind === 'other') {
        others.push(attachment);
      }
    }
    return others;
  }, [attachments]);
}
