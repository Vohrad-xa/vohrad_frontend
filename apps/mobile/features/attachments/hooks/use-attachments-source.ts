import {useCallback} from 'react';
import {
  buildAttachmentODataFilter,
  useAttachmentsViewManager,
  useFilteredAttachmentsManager,
} from '@sykamore/store';
import {useOptionalAttachmentContext} from '../providers/attachment-provider';
import {useAttachmentSearch} from './use-attachment-search';
import type {AttachmentKind, ItemAttachment} from '@sykamore/types';

type UseAttachmentsSourceOptions = {
  kind?: AttachmentKind;
  searchQuery?: string;
  extension?: string;
  odataOrderBy?: string;
  pageSize?: number;
  enabled?: boolean;
};

type UseAttachmentsSourceResult = {
  attachments: ItemAttachment[];
  loadMore: () => void;
  hasNext?: boolean;
  isLoading: boolean;
  refresh: () => void | Promise<void>;
  lastUpdated?: Date | null;
};

/**
 * Unified attachment source for context, search, and global vault queries.
 *
 * - Search results always take precedence over context/global lists.
 */
export function useAttachmentsSource(
  options: UseAttachmentsSourceOptions,
): UseAttachmentsSourceResult {
  const {
    kind,
    searchQuery = '',
    extension,
    odataOrderBy,
    pageSize, // defaults to 50, can be overridden
    enabled = true,
  } = options;
  const attachmentContext = useOptionalAttachmentContext();
  const targetId = attachmentContext?.targetId ?? undefined;
  const isUsingContext = Boolean(targetId);

  const {
    attachments: searchAttachments,
    loadMore: searchLoadMore,
    hasNext: searchHasNext,
    isLoading: searchIsLoading,
    refresh: searchRefresh,
    lastUpdated: searchLastUpdated,
    isSearchActive,
  } = useAttachmentSearch({
    searchQuery,
    kind,
    extension,
    odataOrderBy,
    pageSize,
    enabled,
  });

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
    pageSize,
    enabled: enabled && !isSearchActive && !isUsingContext,
  });

  const {attachments: contextAttachments} = useAttachmentsViewManager({
    attachments: attachmentContext?.attachments ?? [],
    kind,
    extension,
    odataOrderBy,
    enabled: isUsingContext && !isSearchActive,
  });

  const noop = useCallback(() => {}, []);

  if (isSearchActive) {
    return {
      attachments: searchAttachments,
      loadMore: searchLoadMore ?? noop,
      hasNext: searchHasNext,
      isLoading: searchIsLoading,
      refresh: searchRefresh ?? noop,
      lastUpdated: searchLastUpdated,
    };
  }

  if (isUsingContext) {
    return {
      attachments: contextAttachments,
      loadMore: attachmentContext?.loadMore ?? noop,
      hasNext: attachmentContext?.hasNext,
      isLoading: Boolean(attachmentContext?.isLoading),
      refresh: attachmentContext?.refresh ?? noop,
      lastUpdated: attachmentContext?.lastUpdated ?? null,
    };
  }

  return {
    attachments: fetchedAttachments,
    loadMore,
    hasNext,
    isLoading,
    refresh,
    lastUpdated,
  };
}
