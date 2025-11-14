import {useCallback} from 'react';
import {attachmentApi, resolveAttachmentUrl} from '@vohrad/api-client';
import {useDocumentAttachments} from '@/features/attachments/hooks/attachment-images';
import {useOptionalAttachmentContext} from '@/features/attachments/providers/attachment-provider';
import {useFilteredAttachments} from './use-filtered-attachments';
import type {ItemAttachment} from '@vohrad/types';

export function useAttachmentDocuments() {
  const attachmentContext = useOptionalAttachmentContext();
  const targetId = attachmentContext?.targetId ?? undefined;

  const {
    attachments: fetchedAttachments,
    loadMore,
    hasNext,
    isLoading,
  } = useFilteredAttachments({
    kind: 'document',
    enabled: !targetId,
  });

  const sourceAttachments = targetId
    ? attachmentContext?.attachments
    : fetchedAttachments;
  const documentAttachments = useDocumentAttachments(sourceAttachments);

  const getDocumentById = useCallback(
    (documentId: string) =>
      documentAttachments.find((doc) => doc.id === documentId),
    [documentAttachments],
  );

  const resolveDocumentUrlById = useCallback(
    async (documentId: string) => {
      const attachment = getDocumentById(documentId);
      if (!attachment) {
        throw new Error('Document not found');
      }
      return resolveDocumentUrl(attachment);
    },
    [getDocumentById],
  );

  return {
    documentAttachments,
    loadMore,
    hasNext,
    isLoading,
    getDocumentById,
    resolveDocumentUrlById,
  };
}

export async function resolveDocumentUrl(
  attachment: ItemAttachment,
): Promise<string> {
  const {download_url: downloadUrl, file_path: filePath} = attachment;

  if (downloadUrl?.startsWith('http')) {
    return downloadUrl;
  }

  const relativeFromDownload = normalizeRelativeDocumentPath(downloadUrl);
  if (relativeFromDownload) {
    return resolveAttachmentUrl(relativeFromDownload);
  }

  const relativeFromFilePath = normalizeDocumentFilePath(filePath);
  if (relativeFromFilePath) {
    return resolveAttachmentUrl(relativeFromFilePath);
  }

  return attachmentApi.getAttachmentUrl(attachment.id);
}

function normalizeRelativeDocumentPath(path?: string | null): string | null {
  if (!path) return null;
  let sanitized = path.trim();
  if (!sanitized) return null;

  if (sanitized.startsWith('file://')) {
    sanitized = sanitized.replace('file://', '');
  }

  if (!sanitized.startsWith('/')) {
    sanitized = `/${sanitized}`;
  }

  return sanitized.replace(/\/{2,}/g, '/');
}

function normalizeDocumentFilePath(path?: string | null): string | null {
  if (!path) return null;
  const sanitized = path.replace(/^\/+/, '');
  if (!sanitized) return null;

  if (sanitized.startsWith('attachments/')) {
    return `/${sanitized}`;
  }

  return `/attachments/${sanitized}`;
}
