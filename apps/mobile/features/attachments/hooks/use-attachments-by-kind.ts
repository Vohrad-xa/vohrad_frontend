import {useCallback} from 'react';
import {
  useDocumentAttachments,
  useArchiveAttachments,
  useOtherAttachments,
} from '../hooks/attachment-images';
import {useOptionalAttachmentContext} from '../providers/attachment-provider';
import {resolveAttachmentItemUrl} from '../utils';
import {useFilteredAttachments} from './use-filtered-attachments';

type AttachmentKind = 'document' | 'archive' | 'other';

const kindFilterHooks = {
  document: useDocumentAttachments,
  archive: useArchiveAttachments,
  other: useOtherAttachments,
} as const;

/**
 * Single entry-point to read attachments for one kind.
 *
 * If AttachmentProvider is present, use its attachments (no extra fetch).
 * Otherwise, fetch from the global vault via useFilteredAttachments.
 *
 * getById/resolveUrlById are meant for user actions (tap/open), not hot paths.
 */
export function useAttachmentsByKind(kind: AttachmentKind) {
  const attachmentContext = useOptionalAttachmentContext();
  const targetId = attachmentContext?.targetId ?? undefined;

  const {
    attachments: fetchedAttachments,
    loadMore,
    hasNext,
    isLoading,
    refresh,
    lastUpdated,
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

  const refreshAttachments = useCallback(async () => {
    if (!refresh) return;
    await refresh();
  }, [refresh]);

  return {
    attachments: filteredAttachments,
    loadMore,
    hasNext,
    isLoading,
    refresh: targetId ? undefined : refreshAttachments,
    lastUpdated,
    getById,
    resolveUrlById,
  };
}
