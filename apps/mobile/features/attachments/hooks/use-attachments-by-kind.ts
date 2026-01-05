import {useCallback} from 'react';
import {
  buildAttachmentODataFilter,
  useAttachmentsViewManager,
  useFilteredAttachmentsManager,
} from '@sykamore/store';
import {useOptionalAttachmentContext} from '../providers/attachment-provider';
import {resolveAttachmentItemUrl} from '../utils';

type AttachmentKind = 'document' | 'archive' | 'other';

type UseAttachmentsByKindOptions = {
  extension?: string;
  odataOrderBy?: string;
};

/**
 * Single entry-point to read attachments for one kind.
 *
 * If AttachmentProvider is present, use its attachments (no extra fetch).
 * Otherwise, fetch from the global vault via useFilteredAttachmentsManager.
 *
 * - When a targetId is present, extension and sorting are applied in-memory.
 *
 * getById/resolveUrlById are meant for user actions (tap/open), not hot paths.
 */
export function useAttachmentsByKind(
  kind: AttachmentKind,
  options?: UseAttachmentsByKindOptions,
) {
  const attachmentContext = useOptionalAttachmentContext();
  const targetId = attachmentContext?.targetId ?? undefined;
  const contextLoadMore = attachmentContext?.loadMore;
  const contextHasNext = attachmentContext?.hasNext;
  const contextIsLoading = attachmentContext?.isLoading;
  const contextRefresh = attachmentContext?.refresh;
  const contextLastUpdated = attachmentContext?.lastUpdated;
  const {extension, odataOrderBy} = options ?? {};
  const localOdataFilter = buildAttachmentODataFilter(
    extension ? {extension} : null,
  );

  const {
    attachments: fetchedAttachments,
    loadMore,
    hasNext,
    isLoading,
    refresh,
    lastUpdated,
  } = useFilteredAttachmentsManager({
    kind,
    odataFilter: localOdataFilter,
    odataOrderBy,
    enabled: !targetId,
  });

  const sourceAttachments = targetId
    ? (attachmentContext?.attachments ?? [])
    : fetchedAttachments;

  const {attachments: filteredAttachments} = useAttachmentsViewManager({
    attachments: sourceAttachments,
    kind,
    extension,
    odataOrderBy,
    enabled: Boolean(targetId),
  });

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

  const noop = useCallback(() => {}, []);

  return {
    attachments: filteredAttachments,
    loadMore: targetId ? (contextLoadMore ?? noop) : loadMore,
    hasNext: targetId ? contextHasNext : hasNext,
    isLoading: targetId ? Boolean(contextIsLoading) : isLoading,
    refresh: targetId ? contextRefresh : refreshAttachments,
    lastUpdated: targetId ? (contextLastUpdated ?? null) : lastUpdated,
    getById,
    resolveUrlById,
  };
}
