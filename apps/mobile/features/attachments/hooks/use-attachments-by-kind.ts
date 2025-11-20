import {useCallback} from 'react';
import {
  useDocumentAttachments,
  useArchiveAttachments,
  useOtherAttachments,
} from '@/features/attachments/hooks/attachment-images';
import {useOptionalAttachmentContext} from '@/features/attachments/providers/attachment-provider';
import {resolveAttachmentItemUrl} from '../utils/url-resolver';
import {useFilteredAttachments} from './use-filtered-attachments';

type AttachmentKind = 'document' | 'archive' | 'other';

const kindFilterHooks = {
  document: useDocumentAttachments,
  archive: useArchiveAttachments,
  other: useOtherAttachments,
} as const;

export function useAttachmentsByKind(kind: AttachmentKind) {
  const attachmentContext = useOptionalAttachmentContext();
  const targetId = attachmentContext?.targetId ?? undefined;

  const {
    attachments: fetchedAttachments,
    loadMore,
    hasNext,
    isLoading,
  } = useFilteredAttachments({
    kind,
    enabled: !targetId,
  });

  const sourceAttachments = targetId
    ? attachmentContext?.attachments
    : fetchedAttachments;

  const filterHook = kindFilterHooks[kind];
  const filteredAttachments = filterHook(sourceAttachments);

  const getById = useCallback(
    (id: string) => filteredAttachments.find((item) => item.id === id),
    [filteredAttachments],
  );

  const resolveUrlById = useCallback(
    async (id: string) => {
      const attachment = getById(id);
      if (!attachment) {
        throw new Error(
          `${kind.charAt(0).toUpperCase() + kind.slice(1)} not found`,
        );
      }
      return resolveAttachmentItemUrl(attachment);
    },
    [getById, kind],
  );

  return {
    attachments: filteredAttachments,
    loadMore,
    hasNext,
    isLoading,
    getById,
    resolveUrlById,
  };
}

// Specialized exports for backward compatibility
export function useAttachmentDocuments() {
  const result = useAttachmentsByKind('document');
  return {
    documentAttachments: result.attachments,
    loadMore: result.loadMore,
    hasNext: result.hasNext,
    isLoading: result.isLoading,
    getDocumentById: result.getById,
    resolveDocumentUrlById: result.resolveUrlById,
  };
}

export function useAttachmentArchives() {
  const result = useAttachmentsByKind('archive');
  return {
    archiveAttachments: result.attachments,
    loadMore: result.loadMore,
    hasNext: result.hasNext,
    isLoading: result.isLoading,
    getArchiveById: result.getById,
    resolveArchiveUrlById: result.resolveUrlById,
  };
}

export function useAttachmentOther() {
  const result = useAttachmentsByKind('other');
  return {
    otherAttachments: result.attachments,
    loadMore: result.loadMore,
    hasNext: result.hasNext,
    isLoading: result.isLoading,
    getOtherById: result.getById,
    resolveOtherUrlById: result.resolveUrlById,
  };
}
